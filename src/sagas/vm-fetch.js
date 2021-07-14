import {
  all,
  call,
  put,
  takeEvery,
  throttle,
  select,
} from 'redux-saga/effects'

import Api, { Transforms } from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'
import AppConfiguration from '_/config'

import {
  canUserChangeCd,
  canUserEditDisk,
  canUserEditVm,
  canUserEditVmStorage,
  canUserManipulateSnapshots,
} from '_/utils'

import { fetchUnknownIcons } from './osIcons'
import { parallelFetchAndPopulateSnapshotDisksAndNics } from './snapshots'
import {
  callExternalAction,
  entityPermissionsToUserPermits,
  mapCpuOptions,
} from './utils'

const VM_FETCH_ADDITIONAL_DEEP = [
  'cdroms',
  'disk_attachments.disk.permissions',
  'graphics_consoles',
  'nics.reporteddevices',
  'permissions',
  'sessions',
  'snapshots',
  'statistics',
]

const VM_FETCH_ADDITIONAL_SHALLOW = [
  'graphics_consoles', // for backward compatibility only (before 4.4.7)
]

//
//
export default [
  throttle(100, C.GET_BY_PAGE, fetchByPage),
  throttle(100, C.GET_VMS, fetchVms),
  throttle(100, C.GET_POOLS, fetchPools),
  takeEvery(C.SELECT_VM_DETAIL, selectVmDetail),
  takeEvery(C.SELECT_POOL_DETAIL, selectPoolDetail),
]
//
//

export function* transformAndPermitVm (vm) {
  const internalVm = Transforms.VM.toInternal({ vm })
  internalVm.userPermits = yield entityPermissionsToUserPermits(internalVm)

  internalVm.canUserChangeCd = canUserChangeCd(internalVm.userPermits)
  internalVm.canUserEditVm = canUserEditVm(internalVm.userPermits)
  internalVm.canUserManipulateSnapshots = canUserManipulateSnapshots(internalVm.userPermits)
  internalVm.canUserEditVmStorage = canUserEditVmStorage(internalVm.userPermits)

  // Map VM attribute derived config values to the VM. The mappings are based on the
  // VM's custom compatibility version and CPU architecture.
  const customCompatVer = internalVm.customCompatibilityVersion
  if (customCompatVer) {
    internalVm.cpuOptions = yield mapCpuOptions(customCompatVer, internalVm.cpu.arch)
  } else {
    internalVm.cpuOptions = null
  }

  // Permit disks fetched and transformed along with the VM
  for (const disk of internalVm.disks) {
    disk.userPermits = yield entityPermissionsToUserPermits(disk)
    disk.canUserEditDisk = canUserEditDisk(disk.userPermits)
  }

  return internalVm
}

/**
 * Fetch VMs and Pools in a paged manner, and track if any more pages are (expected to
 * be) available,
 */
export function* fetchByPage () {
  const [
    vmsPage,
    vmsExpectMorePages,
    poolsPage,
    poolsExpectMorePages,
  ] = yield select(({ vms }) => [
    vms.get('vmsPage'), !!vms.get('vmsExpectMorePages'),
    vms.get('poolsPage'), !!vms.get('poolsExpectMorePages'),
  ])

  function* currentVmsIds ({ payload: { count, page } }) {
    const start = count * page
    const end = start + count
    return Array.from(yield select(state => state.vms.get('vms').keys())).slice(start, end)
  }

  function* currentPoolsIds ({ payload: { count, page } }) {
    const start = count * page
    const end = start + count
    return Array.from(yield select(state => state.vms.get('pools').keys())).slice(start, end)
  }

  //
  // If more pages are expected, fetch the next page and grab the ids fetched
  // If no more pages are expected, grab the current page of ids from the redux store
  //
  const count = AppConfiguration.pageLimit
  const [vms, pools] = yield all([
    call(vmsExpectMorePages ? fetchVms : currentVmsIds, { payload: { count, page: vmsPage + 1 } }),
    call(poolsExpectMorePages ? fetchPools : currentPoolsIds, { payload: { count, page: poolsPage + 1 } }),
  ])

  //
  // Since the REST API doesn't give a record count in paginated responses, we have
  // to guess if there is more to fetch.  Assume there is more to fetch if the page
  // of ids fetched/accessed is full.
  //
  yield put(A.updatePagingData({
    vmsPage: vmsExpectMorePages ? vmsPage + 1 : undefined,
    vmsExpectMorePages: vms.length >= count,
    poolsPage: poolsExpectMorePages ? poolsPage + 1 : undefined,
    poolsExpectMorePages: pools.length >= count,
  }))
}

export function* fetchVms ({ payload: { count, page, shallowFetch = true } }) {
  const fetchedVmIds = []

  const additional = shallowFetch ? VM_FETCH_ADDITIONAL_SHALLOW : VM_FETCH_ADDITIONAL_DEEP
  const apiVms = yield callExternalAction('getVms', Api.getVms, { payload: { count, page, additional } })
  if (apiVms && apiVms.vm) {
    const internalVms = []
    for (const apiVm of apiVms.vm) {
      const internalVm = yield transformAndPermitVm(apiVm)
      fetchedVmIds.push(internalVm.id)
      internalVms.push(internalVm)
    }

    yield put(A.updateVms({ vms: internalVms, copySubResources: shallowFetch }))
    yield fetchUnknownIcons({ vms: internalVms })

    // NOTE: No need to fetch the current=true cdrom info at this point. The cdrom info
    //       is needed on the VM details page and `fetchSingleVm` is called upon entry
    //       to the details page. The `fetchSingleVm` fetch includes loading the
    //       appropriate cdrom info based on the VM's state. See `fetchSingleVm` for more
    //       details.
  }

  yield put(A.updateVmsPoolsCount())
  return fetchedVmIds
}

export function* fetchSingleVm (action) {
  const { vmId, shallowFetch } = action.payload

  action.payload.additional = shallowFetch ? VM_FETCH_ADDITIONAL_SHALLOW : VM_FETCH_ADDITIONAL_DEEP

  const vm = yield callExternalAction('getVm', Api.getVm, action, true)
  let internalVm = null
  if (vm && vm.id) {
    internalVm = yield transformAndPermitVm(vm)

    // If the VM is running, we want to display the current=true cdrom info. Due
    // to an API restriction, current=true cdrom info cannot currently (Aug-2018)
    // be accessed via the additional fetch list on the VM. Fetch it directly.
    if (!shallowFetch && internalVm.status === 'up') {
      internalVm.cdrom = yield fetchVmCdRom({ vmId: internalVm.id, current: true })
    }

    if (!shallowFetch) {
      yield parallelFetchAndPopulateSnapshotDisksAndNics(internalVm.id, internalVm.snapshots)
    }

    yield put(A.updateVms({ vms: [internalVm], copySubResources: shallowFetch }))
    yield fetchUnknownIcons({ vms: [internalVm] })
  } else {
    if (vm && vm.error && vm.error.status === 404) {
      yield put(A.removeVms({ vmIds: [vmId] }))
    }
  }

  yield put(A.updateVmsPoolsCount())
  return internalVm
}

export function* fetchPools (action) {
  const fetchedPoolIds = []

  const apiPools = yield callExternalAction('getPools', Api.getPools, action)
  if (apiPools && apiPools.vm_pool) {
    const internalPools = apiPools.vm_pool.map(pool => Transforms.Pool.toInternal({ pool }))
    internalPools.forEach(pool => fetchedPoolIds.push(pool.id))

    yield put(A.updatePools({ pools: internalPools }))
    yield put(A.updateVmsPoolsCount())
  }

  return fetchedPoolIds
}

export function* fetchSinglePool (action) {
  const { poolId } = action.payload

  const pool = yield callExternalAction('getPool', Api.getPool, action, true)
  let internalPool = false
  if (pool && pool.id) {
    internalPool = Transforms.Pool.toInternal({ pool })
    yield put(A.updatePools({ pools: [internalPool] }))
  } else {
    if (pool && pool.error && pool.error.status === 404) {
      yield put(A.removePools({ poolIds: [poolId] }))
    }
  }

  yield put(A.updateVmsPoolsCount())
  return internalPool
}

/**
 * VmDetail is to be rendered.
 */
export function* selectVmDetail (action) {
  yield fetchSingleVm(A.getSingleVm({ vmId: action.payload.vmId })) // async data refresh
}

function* selectPoolDetail (action) {
  yield fetchSinglePool(A.getSinglePool({ poolId: action.payload.poolId }))
}

/*
 * Fetch a VM's cdrom configuration based on the status of the VM. A running VM's cdrom
 * info comes from "current=true" while a non-running VM's cdrom info comes from the
 * next_run/"current=false" API parameter.
 */
function* fetchVmCdRom ({ vmId, current = true }) {
  const cdrom = yield callExternalAction('getCdRom', Api.getCdRom, { payload: { vmId, current } })

  let cdromInternal = null
  if (cdrom) {
    cdromInternal = Transforms.CdRom.toInternal({ cdrom })
  }
  return cdromInternal
}
