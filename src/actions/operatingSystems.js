import * as C from '_/constants'

export function setOperatingSystems (operatingSystems) {
  return {
    type: C.SET_OPERATING_SYSTEMS,
    payload: operatingSystems,
  }
}
