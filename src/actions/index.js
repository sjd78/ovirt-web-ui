// @flow
import AppConfiguration from '../config'
import {
  CHECK_TOKEN_EXPIRED,
  GET_BY_PAGE,
  GET_OPTION,
  GET_USB_FILTER,
  GET_VM,
  PERSIST_STATE,
  SET_ADMINISTRATOR,
  SET_USB_FILTER,
  SET_USER_FILTER_PERMISSION,
  SHOW_TOKEN_EXPIRED_MSG,
  START_SCHEDULER_FIXED_DELAY,
  STOP_SCHEDULER_FIXED_DELAY,
} from '../constants'

export * from './error'
export * from './vm'
export * from './visibility'
export * from './clusters'
export * from './hosts'
export * from './operatingSystems'
export * from './templates'
export * from './options'
export * from './pool'
export * from './storageDomains'
export * from './dataCenters'
export * from './pendingTasks'
export * from './vnicProfiles'
export * from './activeRequests'
export * from './console'
export * from './userMessages'

export type ActionType = {
  type: string,
  payload?: Object | Array<Object>,
  meta?: Object
}

export function startSchedulerFixedDelay (delayInSeconds?: number = AppConfiguration.schedulerFixedDelayInSeconds): ActionType {
  return {
    type: START_SCHEDULER_FIXED_DELAY,
    payload: { delayInSeconds },
  }
}

export function stopSchedulerFixedDelay (): ActionType {
  return {
    type: STOP_SCHEDULER_FIXED_DELAY,
    payload: {},
  }
}

export function persistState (): ActionType {
  return {
    type: PERSIST_STATE,
    payload: {},
  }
}

/**
 * Not creator of an action. Returned object can't be dispatched to the store.
 */
export function getSingleVm ({ vmId, shallowFetch = false }: { vmId: string, shallowFetch?: boolean }): ActionType {
  return {
    type: GET_VM,
    payload: {
      vmId,
      shallowFetch,
    },
  }
}

export function setUserFilterPermission (filter: string): ActionType {
  return {
    type: SET_USER_FILTER_PERMISSION,
    payload: {
      filter,
    },
  }
}

export function setAdministrator (administrator: boolean): ActionType {
  return {
    type: SET_ADMINISTRATOR,
    payload: {
      administrator,
    },
  }
}

export function checkTokenExpired (): ActionType {
  return {
    type: CHECK_TOKEN_EXPIRED,
    payload: {},
  }
}

export function showTokenExpiredMessage (): ActionType {
  return {
    type: SHOW_TOKEN_EXPIRED_MSG,
    payload: {},
  }
}

export function getByPage ({ page, shallowFetch = true }: { page: number, shallowFetch?: boolean }): ActionType {
  return {
    type: GET_BY_PAGE,
    payload: {
      shallowFetch,
      page,
    },
  }
}

export function setUSBFilter ({ usbFilter }: { usbFilter: string }): ActionType {
  return {
    type: SET_USB_FILTER,
    payload: {
      usbFilter,
    },
  }
}

export function getUSBFilter (): ActionType {
  return {
    type: GET_USB_FILTER,
    payload: {},
  }
}

/**
 * @param {string} optionName
 * @param {OptionVersionType} version option version
 * @param {string=} defaultValue
 */
export function getOption (optionName: string, version: string, defaultValue: string): ActionType {
  return {
    type: GET_OPTION,
    payload: {
      optionName,
      version,
      defaultValue,
    },
  }
}
