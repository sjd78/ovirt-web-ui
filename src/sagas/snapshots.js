import { takeEvery, put, call, all } from 'redux-saga/effects'

import Api, { Transforms } from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'

import { callExternalAction, delay, delayInMsSteps } from './utils'
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

function* fetchVmSnapshots ({ vmId }) {
  const snapshots = yield callExternalAction('snapshots', Api.snapshots, { type: 'GET_VM_SNAPSHOT', payload: { vmId } })
  let snapshotsInternal = []

  if (snapshots && snapshots.snapshot) {
    snapshotsInternal = snapshots.snapshot.map(snapshot => Transforms.Snapshot.toInternal({ snapshot }))
    yield parallelFetchAndPopulateSnapshotDisksAndNics(vmId, snapshotsInternal)
  }

  yield put(A.setVmSnapshots({ vmId, snapshots: snapshotsInternal }))
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
export function* parallelFetchAndPopulateSnapshotDisksAndNics (vmId, snapshots) {
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
