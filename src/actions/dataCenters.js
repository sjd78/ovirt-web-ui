// @flow
import * as C from '_/constants'

export function setDataCenters (dataCenters: Array<Object>): Object {
  return {
    type: C.SET_DATA_CENTERS,
    payload: dataCenters,
  }
}
