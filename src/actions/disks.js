// @flow
/* eslint-disable flowtype/require-return-type */
import type { DiskType } from '../ovirtapi/types'

import * as C from '_/constants'

export function createDiskForVm ({ vmId, disk }: { vmId: string, disk: DiskType }) {
  return {
    type: C.CREATE_DISK_FOR_VM,
    payload: {
      vmId,
      disk,
    },
  }
}

export function removeDisk ({ diskId, vmToRefreshId }: { diskId: string, vmToRefreshId?: string }) {
  return {
    type: C.REMOVE_DISK,
    payload: {
      diskId,
      vmToRefreshId,
    },
  }
}

export function editDiskOnVm ({ vmId, disk }: { vmId: string, disk: DiskType }) {
  return {
    type: C.EDIT_VM_DISK,
    payload: {
      vmId,
      disk,
    },
  }
}
