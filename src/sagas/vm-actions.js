import { put, select, takeEvery, all, call } from 'redux-saga/effects'
import { push } from 'connected-react-router'

import Api from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'

import { fetchSingleVm, fetchSinglePool } from './index'
import { callExternalAction, delay } from './utils'

//
//
export default [
  // VM Actions
  takeEvery(C.SHUTDOWN_VM, shutdownVm),
  takeEvery(C.RESTART_VM, restartVm),
  takeEvery(C.START_VM, startVm),
  takeEvery(C.SUSPEND_VM, suspendVm),
  takeEvery(C.REMOVE_VM, removeVm),

  // Pool Actions
  takeEvery(C.START_POOL, startPool),
]
//
//

function* getSingleInstance ({ vmId, poolId }) {
  const fetches = []
  if (vmId) {
    fetches.push(call(fetchSingleVm, A.getSingleVm({ vmId })))
  }
  if (poolId) {
    fetches.push(call(fetchSinglePool, A.getSinglePool({ poolId })))
  }
  yield all(fetches)
}

export function* startProgress ({ vmId, poolId, name }) {
  if (vmId) {
    yield put(A.vmActionInProgress({ vmId, name, started: true }))
  } else {
    yield put(A.poolActionInProgress({ poolId, name, started: true }))
  }
}

export function* stopProgress ({ vmId, poolId, name, result }) {
  if (result && result.status === 'complete') {
    vmId = vmId || result.vm.id

    // do not call 'end of in progress' if successful,
    // since UI will be updated by refresh
    yield delay(5 * 1000)
    yield getSingleInstance({ vmId, poolId })

    yield delay(30 * 1000)
    yield getSingleInstance({ vmId, poolId })
  }

  if (vmId) {
    yield put(A.vmActionInProgress({ vmId, name, started: false }))
  } else {
    yield put(A.poolActionInProgress({ poolId, name, started: false }))
  }
}

function* shutdownVm (action) {
  yield startProgress({ vmId: action.payload.vmId, name: 'shutdown' })
  const result = yield callExternalAction('shutdown', Api.shutdown, action)
  const vmName = yield select(state => state.vms.getIn(['vms', action.payload.vmId, 'name']))
  if (result.status === 'complete') {
    yield put(A.addUserMessage({ messageDescriptor: { id: 'actionFeedbackShutdownVm', params: { VmName: vmName } }, type: 'success' }))
  }
  yield stopProgress({ vmId: action.payload.vmId, name: 'shutdown', result })
}

function* restartVm (action) {
  yield startProgress({ vmId: action.payload.vmId, name: 'restart' })
  const result = yield callExternalAction('restart', Api.restart, action)
  const vmName = yield select(state => state.vms.getIn(['vms', action.payload.vmId, 'name']))
  if (result.status === 'complete') {
    yield put(A.addUserMessage({ messageDescriptor: { id: 'actionFeedbackRestartVm', params: { VmName: vmName } }, type: 'success' }))
  }
  yield stopProgress({ vmId: action.payload.vmId, name: 'restart', result })
}

function* suspendVm (action) {
  yield startProgress({ vmId: action.payload.vmId, name: 'suspend' })
  const result = yield callExternalAction('suspend', Api.suspend, action)
  const vmName = yield select(state => state.vms.getIn(['vms', action.payload.vmId, 'name']))
  if (result.status === 'pending') {
    yield put(A.addUserMessage({ messageDescriptor: { id: 'actionFeedbackSuspendVm', params: { VmName: vmName } }, type: 'success' }))
  }
  yield stopProgress({ vmId: action.payload.vmId, name: 'suspend', result })
}

function* startVm (action) {
  yield startProgress({ vmId: action.payload.vmId, name: 'start' })
  const result = yield callExternalAction('start', Api.start, action)
  const vmName = yield select(state => state.vms.getIn(['vms', action.payload.vmId, 'name']))
  // TODO: check status at refresh --> conditional refresh wait_for_launch
  if (result.status === 'complete') {
    yield put(A.addUserMessage({ messageDescriptor: { id: 'actionFeedbackStartVm', params: { VmName: vmName } }, type: 'success' }))
  }
  yield stopProgress({ vmId: action.payload.vmId, name: 'start', result })
}

function* removeVm (action) {
  yield startProgress({ vmId: action.payload.vmId, name: 'remove' })
  const result = yield callExternalAction('remove', Api.remove, action)

  if (result.status === 'complete') {
    // TODO: Remove the VM from the store so we don't see it on the list page!
    yield put(push('/'))
  }

  yield stopProgress({ vmId: action.payload.vmId, name: 'remove', result })
}

function* startPool (action) {
  yield startProgress({ poolId: action.payload.poolId, name: 'start' })
  const result = yield callExternalAction('startPool', Api.startPool, action)
  const poolName = yield select(state => state.vms.getIn(['pools', action.payload.poolId, 'name']))
  if (result.status === 'complete') {
    yield put(A.addUserMessage({ messageDescriptor: { id: 'actionFeedbackAllocateVm', params: { poolname: poolName } }, type: 'success' }))
  }
  yield stopProgress({ poolId: action.payload.poolId, name: 'start', result })
}
