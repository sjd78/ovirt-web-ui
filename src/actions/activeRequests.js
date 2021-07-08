import * as C from '_/constants'

export function addActiveRequest (requestId) {
  return {
    type: C.ADD_ACTIVE_REQUEST,
    payload: requestId,
  }
}

export function removeActiveRequest (requestId) {
  return {
    type: C.REMOVE_ACTIVE_REQUEST,
    payload: requestId,
  }
}

export function delayedRemoveActiveRequest (requestId) {
  return {
    type: C.DELAYED_REMOVE_ACTIVE_REQUEST,
    payload: requestId,
  }
}
