import { takeEvery, put } from 'redux-saga/effects'

import Api, { Transforms } from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'

import { callExternalAction, delay, delayInMsSteps } from './utils'
import { fetchVmSnapshots } from './index'
import { startProgress, stopProgress } from './vm-actions'

//
//
export default [
  takeEvery(C.ADD_VM_SNAPSHOT, addVmSnapshot),
  takeEvery(C.DELETE_VM_SNAPSHOT, deleteVmSnapshot),
  takeEvery(C.RESTORE_VM_SNAPSHOT, restoreVmSnapshot),
]
//
//

function* addVmSnapshot (action) {
  yield put(A.addSnapshotAddPendingTask())
  const snapshot = yield callExternalAction('addNewSnapshot', Api.addNewSnapshot, action)

  if (snapshot && snapshot.id) {
    yield fetchVmSnapshots({ vmId: action.payload.vmId })
    for (const delayMilliSec of delayInMsSteps()) {
      const apiSnapshot = yield callExternalAction('snapshot', Api.snapshot, { payload: { snapshotId: snapshot.id, vmId: action.payload.vmId } }, true)
      if (apiSnapshot.snapshot_status !== 'locked') {
        break
      }
      yield delay(delayMilliSec)
    }
    yield fetchVmSnapshots({ vmId: action.payload.vmId })
  }
  yield put(A.removeSnapshotAddPendingTask())
}

function* deleteVmSnapshot (action) {
  const snapshotId = action.payload.snapshotId
  const vmId = action.payload.vmId
  const result = yield callExternalAction('deleteVmSnapshot', Api.deleteSnapshot, { payload: { snapshotId, vmId } })
  if (result.error) {
    return
  }
  yield put(A.addSnapshotRemovalPendingTask(snapshotId))
  let snapshotRemoved = false
  yield fetchVmSnapshots({ vmId })
  for (const delaySec of delayInMsSteps()) {
    const snapshot = yield callExternalAction('snapshot', Api.snapshot, { payload: { snapshotId, vmId } }, true)
    if (snapshot.error && snapshot.error.status === 404) {
      snapshotRemoved = true
      break
    } else {
      const snapshotInternal = Transforms.Snapshot.toInternal({ snapshot })
      yield put(A.updateVmSnapshot({ vmId, snapshot: snapshotInternal }))
    }
    yield delay(delaySec * 1000)
  }
  if (snapshotRemoved) {
    yield fetchVmSnapshots({ vmId })
  }
  yield put(A.removeSnapshotRemovalPendingTask(snapshotId))
}

function* restoreVmSnapshot (action) {
  yield put(A.addSnapshotRestorePendingTask())
  yield startProgress({ vmId: action.payload.vmId, name: 'restoreSnapshot' })
  const result = yield callExternalAction('restoreSnapshot', Api.restoreSnapshot, action)
  yield stopProgress({ vmId: action.payload.vmId, name: 'restoreSnapshot', result })
  yield put(A.removeSnapshotRestorePendingTask())
}
