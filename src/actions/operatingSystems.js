// @flow
import type { ActionType } from './index'
import type { OsType } from '../ovirtapi/types'

import {
  GET_ALL_OS,
  SET_OPERATING_SYSTEMS,
} from '../constants'

/**
 * @param {Array<OperatingSystem>} operatingSystems
 */
export function setOperatingSystems (operatingSystems: Array<OsType>): ActionType {
  return {
    type: SET_OPERATING_SYSTEMS,
    payload: operatingSystems,
  }
}

export function getAllOperatingSystems (): ActionType {
  return {
    type: GET_ALL_OS,
    payload: {},
  }
}
