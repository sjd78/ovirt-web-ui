// @flow
import type { ActionType } from './index'
import type { ActiveRequestRequestType } from '../ovirtapi/transport'

import {
  ADD_ACTIVE_REQUEST,
  REMOVE_ACTIVE_REQUEST,
  DELAYED_REMOVE_ACTIVE_REQUEST,
} from '../constants'

export function addActiveRequest (requestId: ActiveRequestRequestType): ActionType {
  return {
    type: ADD_ACTIVE_REQUEST,
    payload: requestId,
  }
}

export function removeActiveRequest (requestId: ActiveRequestRequestType): ActionType {
  return {
    type: REMOVE_ACTIVE_REQUEST,
    payload: requestId,
  }
}

export function delayedRemoveActiveRequest (requestId: ActiveRequestRequestType): ActionType {
  return {
    type: DELAYED_REMOVE_ACTIVE_REQUEST,
    payload: requestId,
  }
}
