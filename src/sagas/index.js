import {
  all,
  call,
  put,
  takeEvery,
  takeLatest,
  throttle,
  select,
} from 'redux-saga/effects'
import { push } from 'connected-react-router'

import Api, { Transforms } from '_/ovirtapi'
import { saveToLocalStorage } from '_/storage'

import sagasOptions from './options'
import sagasRefresh from './background-refresh'
import sagasDisks from './disks'
import sagasLogin from './login'
import sagasVmChanges from './vmChanges'
import sagasVmSnapshots from '_/components/VmDetails/cards/SnapshotsCard/sagas'

import {
  updatePagingData,
  updateVms,
  removeVms,

  setVmSnapshots,

  setUserMessages,
  dismissUserMessage,

  removePools,
  updatePools,
  updateVmsPoolsCount,

  setVmNics,
  removeActiveRequest,
  getVmCdRom,
  setVmsFilters,
} from '_/actions'

import {
  callExternalAction,
  delay,
  doCheckTokenExpired,
  entityPermissionsToUserPermits,
  mapCpuOptions,
} from './utils'

import { fetchUnknownIcons } from './osIcons'

import {
  downloadVmConsole,
  getConsoleOptions,
  saveConsoleOptions,
  getRDPVm,
  openConsoleModal,
} from './console'

import {
  ADD_VM_NIC,
  CHECK_TOKEN_EXPIRED,
  CLEAR_USER_MSGS,
  DELAYED_REMOVE_ACTIVE_REQUEST,
  DELETE_VM_NIC,
  DISMISS_EVENT,
  DOWNLOAD_CONSOLE_VM,
  EDIT_VM_NIC,
  GET_ALL_EVENTS,
  GET_BY_PAGE,
  GET_CONSOLE_OPTIONS,
  GET_POOL,
  GET_POOLS,
  GET_RDP_VM,
  GET_VM,
  GET_VMS,
  NAVIGATE_TO_VM_DETAILS,
  OPEN_CONSOLE_MODAL,
  SAVE_CONSOLE_OPTIONS,
  SAVE_FILTERS,
} from '_/constants'

import {
  canUserChangeCd,
  canUserEditDisk,
  canUserEditVm,
  canUserEditVmStorage,
  canUserManipulateSnapshots,
} from '_/utils'
import AppConfiguration from '_/config'

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

export const EVERYONE_GROUP_ID = 'eee00000-0000-0000-0000-123456789eee'

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
    vmsCount, vmsPage, vmsExpectMorePages,
    poolsCount, poolsPage, poolsExpectMorePages,
  ] = yield select(({ vms }) => [
    vms.get('vms').size, vms.get('vmsPage'), !!vms.get('vmsExpectMorePages'),
    vms.get('pools').size, vms.get('poolsPage'), !!vms.get('poolsExpectMorePages'),
  ])

  //
  // If more pages are expected, fetch the next page
  // If no more pages are expected, skip the fetch
  //
  const count = AppConfiguration.pageLimit
  const {
    vms: { internalVms: vms },
    pools: { internalPools: pools },
  } = yield all({
    vms: vmsExpectMorePages
      ? call(fetchVms, { payload: { count, page: vmsPage + 1 } })
      : { internalVms: null },

    pools: poolsExpectMorePages
      ? call(fetchPools, { payload: { count, page: poolsPage + 1 } })
      : { internalPools: null },
  })

  // TODO: move to reducer, keep state changes in 1 action...
  // Put the new page of data to the store
  if (vms) {
    yield put(updateVms({ vms, copySubResources: true }))
  }
  if (pools) {
    yield put(updatePools({ pools }))
  }
  yield put(updateVmsPoolsCount())

  //
  // Since the REST API doesn't give a record count in paginated responses, we have
  // to guess if there is more to fetch.  Assume there is more to fetch if the page
  // of ids fetched/accessed is full.
  //
  yield put(updatePagingData({
    ...vmsExpectMorePages
      ? {
        vmsPage: vmsPage + 1,
        vmsExpectMorePages: vms ? vms.length >= count : false,
      }
      : {
        vmsExpectMorePages: vmsCount >= (vmsPage * count),
      },

    ...poolsExpectMorePages
      ? {
        poolsPage: poolsPage + 1,
        poolsExpectMorePages: pools ? pools.length >= count : false,
      }
      : {
        poolsExpectMorePages: poolsCount >= (poolsPage * count),
      },
  }))
  // TODO: ...move to reducer, keep state changes in 1 action

  if (vms) {
    yield fetchUnknownIcons({ vms })
  }
}

export function* fetchVms ({ payload: { count, page, shallowFetch = true } }) {
  const additional = shallowFetch ? VM_FETCH_ADDITIONAL_SHALLOW : VM_FETCH_ADDITIONAL_DEEP
  const apiVms = yield callExternalAction('getVms', Api.getVms, { payload: { count, page, additional } })

  let internalVms = null
  if (apiVms?.vm) {
    internalVms = []
    for (const apiVm of apiVms.vm) {
      const internalVm = yield transformAndPermitVm(apiVm)
      internalVms.push(internalVm)
    }

    // NOTE: No need to fetch the current=true cdrom info at this point. The cdrom info
    //       is needed on the VM details page and `fetchSingleVm` is called upon entry
    //       to the details page. The `fetchSingleVm` fetch includes loading the
    //       appropriate cdrom info based on the VM's state. See `fetchSingleVm` for more
    //       details.
  }

  return { internalVms }
}

function* fetchAndPutVms (action) {
  const { internalVms } = yield fetchVms(action)

  if (internalVms) {
    yield put(updateVms({ vms: internalVms, copySubResources: action.payload.shallowFetch }))
    yield put(updateVmsPoolsCount()) // TODO: move to reducer, keep state changes in 1 action
    yield fetchUnknownIcons({ vms: internalVms })
  }
}

export function* fetchSingleVm (action) {
  const { vmId, shallowFetch } = action.payload

  action.payload.additional = shallowFetch ? VM_FETCH_ADDITIONAL_SHALLOW : VM_FETCH_ADDITIONAL_DEEP
  const vm = yield callExternalAction('getVm', Api.getVm, action, true)
  const error = vm.error ? vm.error.status ?? 'fetch-error' : null

  let internalVm = null
  if (vm?.id) {
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
  }

  return { vmId, internalVm, error }
}

export function* fetchAndPutSingleVm (action) {
  const { internalVm, error } = yield fetchSingleVm(action)

  if (error) {
    if (error === 404) {
      yield put(removeVms({ vmIds: [action.payload.vmId] }))
    }
  } else {
    yield put(updateVms({ vms: [internalVm], copySubResources: action.payload.shallowFetch }))
    yield fetchUnknownIcons({ vms: [internalVm] })
  }

  yield put(updateVmsPoolsCount()) // TODO: move to reducer, keep state changes in 1 action
}

export function* fetchPools (action) {
  const apiPools = yield callExternalAction('getPools', Api.getPools, action)

  const internalPools = apiPools?.vm_pool
    ? apiPools.vm_pool.map(pool => Transforms.Pool.toInternal({ pool }))
    : null

  return { internalPools }
}

function* fetchAndPutPools (action) {
  const { internalPools } = yield fetchPools(action)

  if (internalPools) {
    yield put(updatePools({ pools: internalPools }))
    yield put(updateVmsPoolsCount()) // TODO: move to reducer, keep state changes in 1 action
  }
}

export function* fetchSinglePool (action) {
  const pool = yield callExternalAction('getPool', Api.getPool, action, true)

  const internalPool = pool.id ? Transforms.Pool.toInternal({ pool }) : null
  const error = pool.error ? pool.error.status ?? 'fetch-error' : null

  return { poolId: action.payload.poolId, internalPool, error }
}

function* fetchAndPutSinglePool (action) {
  const { internalPool, error } = yield fetchSinglePool(action)

  if (error) {
    if (error === 404) {
      yield put(removePools({ poolIds: [action.payload.poolId] }))
    }
  } else {
    yield put(updatePools({ pools: [internalPool] }))
  }

  yield put(updateVmsPoolsCount()) // TODO: move to reducer, keep state changes in 1 action
}

/*
 * Fetch a VM's cdrom configuration based on the status of the VM. A running VM's cdrom
 * info comes from "current=true" while a non-running VM's cdrom info comes from the
 * next_run/"current=false" API parameter.
 */
function* fetchVmCdRom ({ vmId, current = true }) {
  const cdrom = yield callExternalAction('getCdRom', Api.getCdRom, getVmCdRom({ vmId, current }))

  let cdromInternal = null
  if (cdrom) {
    cdromInternal = Transforms.CdRom.toInternal({ cdrom })
  }
  return cdromInternal
}

function* fetchVmNics ({ vmId }) {
  const nics = yield callExternalAction('getVmNic', Api.getVmNic, { type: 'GET_VM_NICS', payload: { vmId } })
  if (nics && nics.nic) {
    const nicsInternal = nics.nic.map(nic => Transforms.Nic.toInternal({ nic }))
    return nicsInternal
  }
  return []
}

export function* addVmNic (action) {
  const nic = yield callExternalAction('addNicToVm', Api.addNicToVm, action)

  if (nic && nic.id) {
    const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
    yield put(setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
  }
}

function* deleteVmNic (action) {
  yield callExternalAction('deleteNicFromVm', Api.deleteNicFromVm, action)

  const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
  yield put(setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
}

function* editVmNic (action) {
  yield callExternalAction('editNicInVm', Api.editNicInVm, action)

  const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
  yield put(setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
}

function* fetchAllEvents (action) {
  const user = yield select(state => ({
    id: state.config.getIn(['user', 'id']),
    name: `${state.config.getIn(['user', 'name'])}@${state.config.get('domain')}`,
  }))

  const events = yield callExternalAction('events', Api.events, { payload: {} })

  if (events.error) {
    return
  }

  const internalEvents = events.event
    ? events.event
      .filter((event) =>
        event.severity === 'error' &&
        event.user &&
        (event.user.id === user.id || event.user.name === user.name)
      )
      .map((event) => Transforms.Event.toInternal({ event }))
    : []
  yield put(setUserMessages({ messages: internalEvents }))
}

function* dismissEvent (action) {
  const { event } = action.payload
  if (event.source === 'server') {
    const result = yield callExternalAction('dismissEvent', Api.dismissEvent, { payload: { eventId: event.id } })

    if (result.status === 'complete') {
      yield fetchAllEvents(action)
    }
  } else {
    yield put(dismissUserMessage({ eventId: event.id }))
  }
}

function* clearEvents (action) {
  const user = yield select(state => ({
    id: state.config.getIn(['user', 'id']),
    name: `${state.config.getIn(['user', 'name'])}@${state.config.get('domain')}`,
  }))
  const events = yield callExternalAction('events', Api.events, { payload: {} })

  if (events.error) {
    return
  }

  const sagaEvents = events.event
    ? events.event
      .filter((event) =>
        event.severity === 'error' &&
        event.user &&
        (event.user.id === user.id || event.user.name === user.name)
      ).map((event) => callExternalAction('dismissEvent', Api.dismissEvent, { payload: { eventId: event.id } }))
    : []

  yield all(sagaEvents)

  yield fetchAllEvents(action)
}

export function* fetchVmSessions ({ vmId }) {
  const sessions = yield callExternalAction('sessions', Api.sessions, { payload: { vmId } })

  if (sessions && sessions.session) {
    return Transforms.VmSessions.toInternal({ sessions })
  }
  return []
}

function* saveFilters (actions) {
  const { filters } = actions.payload
  const userId = yield select(state => state.config.getIn(['user', 'id']))
  saveToLocalStorage(`vmFilters-${userId}`, JSON.stringify(filters))
  yield put(setVmsFilters({ filters }))
}

export function* fetchVmSnapshots ({ vmId }) {
  const snapshots = yield callExternalAction('snapshots', Api.snapshots, { type: 'GET_VM_SNAPSHOT', payload: { vmId } })
  let snapshotsInternal = []

  if (snapshots && snapshots.snapshot) {
    snapshotsInternal = snapshots.snapshot.map(snapshot => Transforms.Snapshot.toInternal({ snapshot }))
    yield parallelFetchAndPopulateSnapshotDisksAndNics(vmId, snapshotsInternal)
  }

  yield put(setVmSnapshots({ vmId, snapshots: snapshotsInternal }))
}

/**
 * Setup all of the calls needed to fetch, transform and populate the disks and nics
 * for a set of VM snapshots.  To minimize wall clock time, all of the required fetches
 * are done in parallel.
 *
 * This technique is required since snapshot disks and nics are not currently (July-2021)
 * available via additional/follow param on the VM/snapshot fetch.  They need to be
 * fetched directly.
 *
 * NOTE: Looks like the `?follows=snapshots` returns the active and regular snapshots.
 *       The active snapshot does not contain links to disks and nics, but the regular
 *       ones do.  That is probably the reason why the VM REST API call with
 *       `?follows=snapshots.disks` fails.
 *
 * @param {string} vmId VM to work on
 * @param {*} snapshots Array of internal `SnapshotType` objects
 * @returns
 */
function* parallelFetchAndPopulateSnapshotDisksAndNics (vmId, snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    return
  }

  const fetches = []
  for (const snapshot of snapshots.filter(snapshot => snapshot.type !== 'active')) {
    fetches.push(
      call(fetchVmSnapshotDisks, { vmId, snapshotId: snapshot.id }),
      call(fetchVmSnapshotNics, { vmId, snapshotId: snapshot.id })
    )
  }

  const results = yield all(fetches)

  for (const snapshot of snapshots.filter(snapshot => snapshot.type !== 'active')) {
    snapshot.disks = results.shift()
    snapshot.nics = results.shift()
  }
}

function* fetchVmSnapshotDisks ({ vmId, snapshotId }) {
  const disks = yield callExternalAction('snapshotDisks', Api.snapshotDisks, { payload: { vmId, snapshotId } }, true)
  let disksInternal = []
  if (disks?.disk) {
    disksInternal = disks.disk.map(disk => Transforms.DiskAttachment.toInternal({ disk }))
  }
  return disksInternal
}

function* fetchVmSnapshotNics ({ vmId, snapshotId }) {
  const nics = yield callExternalAction('snapshotNics', Api.snapshotNics, { payload: { vmId, snapshotId } }, true)
  let nicsInternal = []
  if (nics?.nic) {
    nicsInternal = nics.nic.map((nic) => Transforms.Nic.toInternal({ nic }))
  }
  return nicsInternal
}

function* delayedRemoveActiveRequest ({ payload: requestId }) {
  yield delay(500)
  yield put(removeActiveRequest(requestId))
}

function* navigateToVmDetails ({ payload: { vmId } }) {
  yield put(push(`/vm/${vmId}`))
}

export function* rootSaga () {
  yield all([
    ...sagasLogin,
    ...yield sagasRefresh(),

    takeEvery(CHECK_TOKEN_EXPIRED, doCheckTokenExpired),
    takeEvery(DELAYED_REMOVE_ACTIVE_REQUEST, delayedRemoveActiveRequest),

    throttle(100, GET_VMS, fetchAndPutVms),
    throttle(100, GET_POOLS, fetchAndPutPools),

    takeLatest(GET_ALL_EVENTS, fetchAllEvents),
    takeEvery(DISMISS_EVENT, dismissEvent),
    takeEvery(CLEAR_USER_MSGS, clearEvents),

    takeLatest(NAVIGATE_TO_VM_DETAILS, navigateToVmDetails),
    takeEvery(GET_VM, fetchAndPutSingleVm),
    takeEvery(GET_POOL, fetchAndPutSinglePool),

    throttle(100, GET_BY_PAGE, fetchByPage),

    takeEvery(ADD_VM_NIC, addVmNic),
    takeEvery(DELETE_VM_NIC, deleteVmNic),
    takeEvery(EDIT_VM_NIC, editVmNic),

    takeEvery(GET_CONSOLE_OPTIONS, getConsoleOptions),
    takeEvery(SAVE_CONSOLE_OPTIONS, saveConsoleOptions),
    takeEvery(OPEN_CONSOLE_MODAL, openConsoleModal),
    takeEvery(DOWNLOAD_CONSOLE_VM, downloadVmConsole),
    takeEvery(GET_RDP_VM, getRDPVm),

    takeEvery(SAVE_FILTERS, saveFilters),

    // Sagas from Components
    ...sagasDisks,
    ...sagasOptions,
    ...sagasVmChanges,
    ...sagasVmSnapshots,
  ])
}
