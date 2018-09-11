// @flow
import type { ActionType } from './index'
import type { NetworkType, VnicProfileType } from '../ovirtapi/types'

import {
  ADD_NETWORKS_TO_VNIC_PROFILES,
  SET_VNIC_PROFILES,
  GET_ALL_VNIC_PROFILES,
} from '../constants'

export function setVnicProfiles ({ vnicProfiles }: { vnicProfiles: Array<VnicProfileType> }): ActionType {
  return {
    type: SET_VNIC_PROFILES,
    payload: {
      vnicProfiles,
    },
  }
}

export function getAllVnicProfiles (): ActionType {
  return {
    type: GET_ALL_VNIC_PROFILES,
  }
}

export function addNetworksToVnicProfiles ({ networks }: { networks: Array<NetworkType> }): ActionType {
  return {
    type: ADD_NETWORKS_TO_VNIC_PROFILES,
    payload: {
      networks,
    },
  }
}
