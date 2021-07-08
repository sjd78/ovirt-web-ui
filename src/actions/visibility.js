import * as C from '_/constants'

export function selectVmDetail ({ vmId }) {
  return {
    type: C.SELECT_VM_DETAIL,
    payload: {
      vmId,
    },
  }
}

export function selectPoolDetail ({ poolId }) {
  return {
    type: C.SELECT_POOL_DETAIL,
    payload: {
      poolId,
    },
  }
}
