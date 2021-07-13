// @flow
/* eslint-disable flowtype/require-return-type */

import * as C from '_/constants'
import { PendingTaskTypes } from '_/reducers/pendingTasks'

export function addDiskRemovalPendingTask (diskId: string) {
  return {
    type: C.ADD_DISK_REMOVAL_PENDING_TASK,
    payload: {
      diskId,
    },
  }
}

export function removeDiskRemovalPendingTask (diskId: string) {
  return {
    type: C.REMOVE_DISK_REMOVAL_PENDING_TASK,
    payload: {
      diskId,
    },
  }
}

export function addSnapshotRemovalPendingTask (snapshotId: string) {
  return {
    type: C.ADD_SNAPSHOT_REMOVAL_PENDING_TASK,
    payload: {
      type: PendingTaskTypes.SNAPSHOT_REMOVAL,
      started: new Date(),
      snapshotId,
    },
  }
}

export function removeSnapshotRemovalPendingTask (snapshotId: string) {
  return {
    type: C.REMOVE_SNAPSHOT_REMOVAL_PENDING_TASK,
    payload: { snapshotId },
  }
}

export function addSnapshotRestorePendingTask () {
  return {
    type: C.ADD_SNAPSHOT_RESTORE_PENDING_TASK,
    payload: {
      type: PendingTaskTypes.SNAPSHOT_RESTORE,
      started: new Date(),
    },
  }
}

export function removeSnapshotRestorePendingTask () {
  return { type: C.REMOVE_SNAPSHOT_RESTORE_PENDING_TASK }
}

export function addSnapshotAddPendingTask () {
  return {
    type: C.ADD_SNAPSHOT_ADD_PENDING_TASK,
    payload: {
      type: PendingTaskTypes.SNAPSHOT_ADD,
      started: new Date(),
    },
  }
}

export function removeSnapshotAddPendingTask () {
  return { type: C.REMOVE_SNAPSHOT_ADD_PENDING_TASK }
}
