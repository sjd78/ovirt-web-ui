// @flow
import type { ActionType } from './index'
import type { HostType } from '../ovirtapi/types'

import {
  GET_ALL_HOSTS,
  SET_HOSTS,
} from '../constants'

export function setHosts (hosts: Array<HostType>): ActionType {
  return {
    type: SET_HOSTS,
    payload: hosts,
  }
}

export function getAllHosts (): ActionType {
  return {
    type: GET_ALL_HOSTS,
    payload: {},
  }
}
