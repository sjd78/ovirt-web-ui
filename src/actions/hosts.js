import * as C from '_/constants'

export function setHosts (hosts) {
  return {
    type: C.SET_HOSTS,
    payload: hosts,
  }
}
