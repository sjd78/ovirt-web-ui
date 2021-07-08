import * as C from '_/constants'

export function login ({ username, domain, token, userId }) {
  return {
    type: C.LOGIN,
    payload: {
      username,
      domain,
      token,
      userId,
    },
  }
}

export function loginSuccessful ({ username, domain, token, userId }) {
  return {
    type: C.LOGIN_SUCCESSFUL,
    payload: {
      username,
      domain,
      token,
      userId,
    },
  }
}

export function loginFailed ({ errorCode, message }) {
  return {
    type: C.LOGIN_FAILED,
    payload: {
      errorCode,
      message,
    },
  }
}

export function logout (isManual = false) {
  return {
    type: C.LOGOUT,
    payload: {
      isManual,
    },
  }
}

export function setOvirtApiVersion (oVirtApiVersion) {
  return {
    type: C.SET_OVIRT_API_VERSION,
    payload: {
      oVirtApiVersion,
    },
  }
}

export function setUser ({ user }) {
  return {
    type: C.SET_USER,
    payload: {
      user,
    },
  }
}

export function setUserGroups ({ groups }) {
  return {
    type: C.SET_USER_GROUPS,
    payload: {
      groups,
    },
  }
}

export function setAdministrator (administrator) {
  return {
    type: C.SET_ADMINISTRATOR,
    payload: {
      administrator,
    },
  }
}

export function setUserFilterPermission (filter) {
  return {
    type: C.SET_USER_FILTER_PERMISSION,
    payload: {
      filter,
    },
  }
}

export function appConfigured () {
  return { type: C.APP_CONFIGURED }
}
