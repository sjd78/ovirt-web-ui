import * as C from '_/constants'

export function setRoles (roles) {
  return {
    type: C.SET_ROLES,
    payload: {
      roles,
    },
  }
}
