import * as C from '_/constants'

export function deleteVmSnapshot ({ vmId, snapshotId }) {
  return {
    type: C.DELETE_VM_SNAPSHOT,
    payload: {
      vmId,
      snapshotId,
    },
  }
}

export function addVmSnapshot ({ vmId, snapshot }) {
  return {
    type: C.ADD_VM_SNAPSHOT,
    payload: {
      vmId,
      snapshot,
    },
  }
}

export function restoreVmSnapshot ({ vmId, snapshotId }) {
  return {
    type: C.RESTORE_VM_SNAPSHOT,
    payload: {
      vmId,
      snapshotId,
    },
  }
}
