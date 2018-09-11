// @flow
import type { ActionType } from './index'

import { SET_CONSOLE_IN_USE, CHECK_CONSOLE_IN_USE, SET_CONSOLE_VALID } from '../constants'

export function setConsoleInUse ({ vmId, consoleInUse }: { vmId: string, consoleInUse: boolean }): ActionType {
  return {
    type: SET_CONSOLE_IN_USE,
    payload: {
      vmId,
      consoleInUse,
    },
  }
}

export function setConsoleIsValid ({ vmId, isValid }: { vmId: string, isValid: boolean }): ActionType {
  return {
    type: SET_CONSOLE_VALID,
    payload: {
      vmId,
      isValid,
    },
  }
}

export function checkConsoleInUse ({ vmId, usbFilter, userId }: { vmId: string, usbFilter: string, userId: string }): ActionType {
  return {
    type: CHECK_CONSOLE_IN_USE,
    payload: {
      vmId,
      usbFilter,
      userId,
    },
  }
}
