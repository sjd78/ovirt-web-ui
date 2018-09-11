// @flow
import type { ActionType } from './index'
import type { IconType, DiskType, VmConsolesType, VmSessionsType, SnapshotType, CdRomType, NicType, VmType } from '../ovirtapi/types'

import {
  ADD_VM_NIC,
  CHANGE_VM_CDROM,
  CREATE_VM,
  DELETE_VM_NIC,
  DOWNLOAD_CONSOLE_VM,
  EDIT_VM,
  GET_RDP_VM,
  GET_VM_CDROM,
  GET_VMS_BY_COUNT,
  GET_VMS_BY_PAGE,
  LOGIN_SUCCESSFUL,
  LOGIN,
  LOGOUT,
  REFRESH_DATA,
  REMOVE_MISSING_VMS,
  REMOVE_VM,
  REMOVE_VMS,
  RESTART_VM,
  SET_CHANGED,
  SET_DOMAIN,
  SET_OVIRT_API_VERSION,
  SET_VM_ACTION_RESULT,
  SET_VM_CDROM,
  SET_VM_CONSOLES,
  SET_VM_DISKS,
  SET_VM_NICS,
  SET_VM_SESSIONS,
  SET_VM_SNAPSHOTS,
  SHUTDOWN_VM,
  START_VM,
  SUSPEND_VM,
  UPDATE_ICONS,
  UPDATE_VMS,
  VM_ACTION_IN_PROGRESS,
} from '../constants'

export function login ({ username, password, token, userId }: { username: string, password?: string, token: string, userId: string }): ActionType {
  return {
    type: LOGIN,
    payload: {
      credentials: {
        username,
        password,
      },
      token,
      userId,
    },
  }
}

export function setDomain ({ domain }: { domain: string }): ActionType {
  return {
    type: SET_DOMAIN,
    payload: {
      domain,
    },
  }
}

/**
 * I.e. the Refresh button is clicked or scheduler event occurred (polling)
 */
export function refresh ({ page, quiet = false, shallowFetch = false }: { page: number, quiet: boolean, shallowFetch: boolean}): ActionType {
  return {
    type: REFRESH_DATA,
    payload: {
      quiet,
      shallowFetch,
      page,
    },
  }
}

export function getVmsByPage ({ page, shallowFetch = true }: { page: number, shallowFetch: boolean }): ActionType {
  return {
    type: GET_VMS_BY_PAGE,
    payload: {
      shallowFetch,
      page,
    },
  }
}

export function getVmsByCount ({ count, shallowFetch = true }: { count: number, shallowFetch: boolean }): ActionType {
  return {
    type: GET_VMS_BY_COUNT,
    payload: {
      shallowFetch,
      count,
    },
  }
}

export function shutdownVm ({ vmId, force = false }: { vmId: string, force: boolean }): ActionType {
  return {
    type: SHUTDOWN_VM,
    payload: {
      vmId,
      force,
    },
  }
}

export function restartVm ({ vmId, force = false }: { vmId: string, force: boolean }): ActionType {
  return {
    type: RESTART_VM,
    payload: {
      vmId,
      force,
    },
  }
}

export function startVm ({ vmId }: { vmId: string }): ActionType {
  return {
    type: START_VM,
    payload: {
      vmId,
    },
  }
}

export function downloadConsole ({ vmId, consoleId, usbFilter }: { vmId: string, consoleId: string, usbFilter: string }): ActionType {
  return {
    type: DOWNLOAD_CONSOLE_VM,
    payload: {
      vmId,
      consoleId,
      usbFilter,
    },
  }
}

export function suspendVm ({ vmId }: { vmId: string }): ActionType {
  return {
    type: SUSPEND_VM,
    payload: {
      vmId,
    },
  }
}

export function createVm (
  { vm, transformInput = false, pushToDetailsOnSuccess = false }: { vm: VmType, transformInput?: boolean, pushToDetailsOnSuccess?: boolean },
  { correlationId, ...additionalMeta }: { correlationId: string }
): ActionType {
  return {
    type: CREATE_VM,
    payload: {
      vm,
      transformInput,
      pushToDetailsOnSuccess,
    },
    meta: {
      correlationId,
      ...additionalMeta,
    },
  }
}

export function editVm (
  { vm, transformInput = false }: { vm: VmType, transformInput?: boolean },
  { correlationId, ...additionalMeta }: { correlationId: string }
): ActionType {
  return {
    type: EDIT_VM,
    payload: {
      vm,
      transformInput,
    },
    meta: {
      correlationId,
      ...additionalMeta,
    },
  }
}

export function removeVm ({ vmId, force = false, preserveDisks = false }: { vmId: string, force?: boolean, preserveDisks?: boolean }): ActionType {
  return {
    type: REMOVE_VM,
    payload: {
      vmId,
      force,
      preserveDisks,
    },
  }
}

export function setVmActionResult ({ vmId, correlationId, result }: { vmId: string, correlationId: string, result: boolean }): ActionType {
  return {
    type: SET_VM_ACTION_RESULT,
    payload: {
      vmId,
      correlationId,
      result,
    },
  }
}

// --- Internal State -------------------------
export function loginSuccessful ({ token, username, userId }: { token: string, username: string, userId: string }): ActionType {
  return {
    type: LOGIN_SUCCESSFUL,
    payload: {
      token,
      username,
      userId,
    },
  }
}

export function setOvirtApiVersion (oVirtApiVersion: Object): ActionType { // TODO: oVirtApiVersion
  return {
    type: SET_OVIRT_API_VERSION,
    payload: {
      oVirtApiVersion,
    },
  }
}

export function logout (): ActionType {
  return {
    type: LOGOUT,
    payload: {
    },
  }
}

/**
 * Update or Add
 */
export function updateVms ({ vms, copySubResources = false, page }: { vms: Object, copySubResources: boolean, page?: number }): ActionType {
  return {
    type: UPDATE_VMS,
    payload: {
      vms,
      copySubResources,
      page,
    },
  }
}

/**
 * Remove VMs from store.
 */
export function removeVms ({ vmIds }: { vmIds: Array<string> }): ActionType {
  return {
    type: REMOVE_VMS,
    payload: {
      vmIds,
    },
  }
}

/**
 * Remove all VMs from store which ID is not listed among vmIdsToPreserve
 */
export function removeMissingVms ({ vmIdsToPreserve }: { vmIdsToPreserve: Array<string> }): ActionType {
  return {
    type: REMOVE_MISSING_VMS,
    payload: {
      vmIdsToPreserve,
    },
  }
}

export function updateIcons ({ icons }: { icons: Array<IconType> }): ActionType {
  return {
    type: UPDATE_ICONS,
    payload: {
      icons,
    },
  }
}

export function setVmDisks ({ vmId, disks }: { vmId: string, disks: Array<DiskType> }): ActionType {
  return {
    type: SET_VM_DISKS,
    payload: {
      vmId,
      disks,
    },
  }
}

export function vmActionInProgress ({ vmId, name, started }: { vmId: string, name: string, started: boolean }): ActionType {
  return {
    type: VM_ACTION_IN_PROGRESS,
    payload: {
      vmId,
      name,
      started,
    },
  }
}

export function setVmConsoles ({ vmId, consoles }: { vmId: string, consoles: Array<VmConsolesType> }): ActionType {
  return {
    type: SET_VM_CONSOLES,
    payload: {
      vmId,
      consoles,
    },
  }
}

export function setVmSessions ({ vmId, sessions }: { vmId: string, sessions: VmSessionsType }): ActionType {
  return {
    type: SET_VM_SESSIONS,
    payload: {
      vmId,
      sessions,
    },
  }
}

export function setVmSnapshots ({ vmId, snapshots }: { vmId: string, snapshots: Array<SnapshotType> }): ActionType {
  return {
    type: SET_VM_SNAPSHOTS,
    payload: {
      vmId,
      snapshots,
    },
  }
}

export function getRDP ({ vmName, username, domain, fqdn }: { vmName: string, username: string, domain: string, fqdn: string }): ActionType {
  return {
    type: GET_RDP_VM,
    payload: {
      vmName,
      username,
      domain,
      fqdn,
    },
  }
}

export function setChanged ({ value }: { value: boolean }): ActionType {
  return {
    type: SET_CHANGED,
    payload: {
      value,
    },
  }
}

export function setVmCDRom ({ vmId, cdrom }: { vmId: string, cdrom: CdRomType }): ActionType {
  return {
    type: SET_VM_CDROM,
    payload: {
      cdrom,
      vmId,
    },
  }
}

export function getVmCdRom ({ vmId, current = true }: { vmId: string, current: boolean }): ActionType {
  return {
    type: GET_VM_CDROM,
    payload: {
      vmId,
      current,
    },
  }
}

export function changeVmCdRom (
  { vmId, cdrom, updateRedux = true, current = true }: { vmId: string, cdrom: CdRomType, updateRedux: boolean, current: boolean },
  { correlationId, ...additionalMeta }: { correlationId: string } = {}
): ActionType {
  const action: ActionType = {
    type: CHANGE_VM_CDROM,
    payload: {
      cdrom,
      vmId,
      updateRedux,
      current,
    },
  }

  if (correlationId) {
    action.meta = {
      correlationId,
      ...additionalMeta,
    }
  }

  return action
}

export function setVmNics ({ vmId, nics }: { vmId: string, nics: Array<NicType> }): ActionType {
  return {
    type: SET_VM_NICS,
    payload: {
      vmId,
      nics,
    },
  }
}

export function addVmNic ({ vmId, nic }: { vmId: string, nic: NicType }): ActionType {
  return {
    type: ADD_VM_NIC,
    payload: {
      vmId,
      nic,
    },
  }
}

export function deleteVmNic ({ vmId, nicId }: { vmId: string, nicId: string }): ActionType {
  return {
    type: DELETE_VM_NIC,
    payload: {
      vmId,
      nicId,
    },
  }
}
