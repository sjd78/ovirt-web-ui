// @flow
import type { ActionType } from './index'

import {
  CLEAR_USER_MSGS,
  SET_USERMSG_NOTIFIED,
  DISMISS_USER_MSG,
} from '../constants'

export function clearUserMessages (): ActionType {
  return {
    type: CLEAR_USER_MSGS,
    payload: {},
  }
}

export function setNotificationNotified ({ time }: { time: number }): ActionType {
  return {
    type: SET_USERMSG_NOTIFIED,
    payload: {
      time,
    },
  }
}

export function dismissUserMessage ({ time }: { time: number }): ActionType {
  return {
    type: DISMISS_USER_MSG,
    payload: {
      time,
    },
  }
}
