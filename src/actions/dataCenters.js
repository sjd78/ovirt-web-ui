// @flow
import type { ActionType } from './index'
import type { DataCenterType } from '../ovirtapi/types'

import {
  SET_DATA_CENTERS,
} from '../constants'

export function setDataCenters (dataCenters: Array<DataCenterType>): ActionType {
  return {
    type: SET_DATA_CENTERS,
    payload: dataCenters,
  }
}
