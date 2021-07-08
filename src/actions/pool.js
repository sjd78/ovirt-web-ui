import AppConfiguration from '_/config'
import * as C from '_/constants'

//
// Fetch a Pool or Sets-Of-Pools
//
export function getSinglePool ({ poolId }) {
  return {
    type: C.GET_POOL,
    payload: {
      poolId,
    },
  }
}

export function getAllPools () {
  return { type: C.GET_POOLS }
}

export function getPoolsByPage ({ page }) {
  return {
    type: C.GET_POOLS,
    payload: {
      page,
      count: AppConfiguration.pageLimit,
    },
  }
}

export function getPoolsByCount ({ count }) {
  return {
    type: C.GET_POOLS,
    payload: {
      count,
    },
  }
}

//
// vms.Pool store update actions
//
/**
 * Update the set of Pools in the store
 */
export function updatePools ({ pools, copySubResources = false }) {
  return {
    type: C.UPDATE_POOLS,
    payload: {
      pools,
    },
  }
}

/**
 * Remove a set of Pools from the store
 */
export function removePools ({ poolIds }) {
  return {
    type: C.REMOVE_POOL,
    payload: {
      poolIds,
    },
  }
}

/**
 * Remove all Pools from the store whose ID is not listed among poolIdsToPreserve
 */
export function removeMissingPools ({ poolIdsToPreserve }) {
  return {
    type: C.REMOVE_MISSING_POOLS,
    payload: {
      poolIdsToPreserve,
    },
  }
}

export function updateVmsPoolsCount () {
  return { type: C.UPDATE_VMPOOLS_COUNT }
}

//
// Pool Actions
//
export function startPool ({ poolId }) {
  return {
    type: C.START_POOL,
    payload: {
      poolId,
    },
  }
}

export function poolActionInProgress ({ poolId, name, started }) {
  return {
    type: C.POOL_ACTION_IN_PROGRESS,
    payload: {
      poolId,
      name,
      started,
    },
  }
}
