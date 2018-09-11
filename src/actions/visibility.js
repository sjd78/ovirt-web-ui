// @flow
import type { ActionType } from './index'

import {
  SELECT_POOL_DETAIL,
  SELECT_VM_DETAIL,
} from '../constants'

export function selectVmDetail ({ vmId }: { vmId: string }): ActionType {
  return {
    type: SELECT_VM_DETAIL,
    payload: {
      vmId,
    },
  }
}

export function selectPoolDetail ({ poolId }: { poolId: string }): ActionType {
  return {
    type: SELECT_POOL_DETAIL,
    payload: {
      poolId,
    },
  }
}
