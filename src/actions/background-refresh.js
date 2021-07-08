import AppConfiguration from '_/config'
import * as C from '_/constants'

export function manualRefresh () {
  return { type: C.MANUAL_REFRESH }
}

export function setCurrentPage ({ type, id }) {
  return {
    type: C.SET_CURRENT_PAGE,
    payload: {
      type,
      id,
    },
  }
}

export function changePage ({ type, id }) {
  return {
    type: C.CHANGE_PAGE,
    payload: {
      type,
      id,
    },
  }
}

export function startSchedulerFixedDelay ({
  delayInSeconds = AppConfiguration.schedulerFixedDelayInSeconds,
  startDelayInSeconds,
  targetPage,
  pageRouterRefresh = false,
  manualRefresh = false,
}) {
  return {
    type: C.START_SCHEDULER_FIXED_DELAY,
    payload: { delayInSeconds, startDelayInSeconds, targetPage, pageRouterRefresh, manualRefresh },
  }
}

export function stopSchedulerFixedDelay () {
  return { type: C.STOP_SCHEDULER_FIXED_DELAY }
}

export function startSchedulerForResumingNotifications (delayInSeconds) {
  return {
    type: C.START_SCHEDULER_FOR_RESUMING_NOTIFICATIONS,
    payload: {
      delayInSeconds,
    },
  }
}

export function stopSchedulerForResumingNotifications () {
  return { type: C.STOP_SCHEDULER_FOR_RESUMING_NOTIFICATIONS }
}

export function updateLastRefresh () {
  return { type: C.UPDATE_LAST_REFRESH }
}
