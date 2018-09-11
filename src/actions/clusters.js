// @flow
import type { ActionType } from './index'
import type { ClusterType } from '../ovirtapi/types'

import {
  GET_ALL_CLUSTERS,
  SET_CLUSTERS,
} from '../constants'

export function setClusters (clusters: Array<ClusterType>): ActionType {
  return {
    type: SET_CLUSTERS,
    payload: clusters,
  }
}

export function getAllClusters (): ActionType {
  return {
    type: GET_ALL_CLUSTERS,
    payload: {},
  }
}
