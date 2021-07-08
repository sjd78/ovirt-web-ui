import * as C from '_/constants'

export function addUserMessage ({ message, messageDescriptor, type = '' }) {
  return {
    type: C.ADD_USER_MESSAGE,
    payload: {
      message,
      messageDescriptor,
      type,
    },
  }
}

export function clearUserMessages () {
  return { type: C.CLEAR_USER_MSGS }
}

export function setAutoAcknowledge (autoAcknowledge) {
  return {
    type: C.AUTO_ACKNOWLEDGE,
    payload: {
      autoAcknowledge,
    },
  }
}

export function setNotificationNotified ({ eventId }) {
  return {
    type: C.SET_USERMSG_NOTIFIED,
    payload: {
      eventId,
    },
  }
}

export function dismissUserMessage ({ eventId }) {
  return {
    type: C.DISMISS_USER_MSG,
    payload: {
      eventId,
    },
  }
}

export function dismissEvent ({ event }) {
  return {
    type: C.DISMISS_EVENT,
    payload: {
      event,
    },
  }
}

export function setUserMessages ({ messages }) {
  return {
    type: C.SET_USER_MESSAGES,
    payload: {
      messages,
    },
  }
}

export function getAllEvents () {
  return { type: C.GET_ALL_EVENTS }
}
