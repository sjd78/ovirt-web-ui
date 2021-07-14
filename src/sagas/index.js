import {
  all,
  call,
  put,
  takeEvery,
  takeLatest,
  select,
} from 'redux-saga/effects'
import { push } from 'connected-react-router'

import Api, { Transforms } from '_/ovirtapi'
import { saveToLocalStorage } from '_/storage'

import sagasDisks from './disks'
import sagasNics from './nics'
import sagasLogin from './login'
import sagasOptions from './options'
import sagasRefresh from './background-refresh'
import sagasSnapshots from './snapshots'
import sagasVmActions from './vm-actions'
import sagasVmChanges from './vm-create'
import sagasVmEdits from './vm-edit'
import sagasVmFetches from './vm-fetch'

import {
  setUserMessages,
  dismissUserMessage,

  removeActiveRequest,
  setVmsFilters,
} from '_/actions'

import {
  callExternalAction,
  delay,
  doCheckTokenExpired,
} from './utils'

import {
  downloadVmConsole,
  getConsoleOptions,
  saveConsoleOptions,
  getRDPVm,
  openConsoleModal,
} from './console'

import {
  CHECK_TOKEN_EXPIRED,
  CLEAR_USER_MSGS,
  DELAYED_REMOVE_ACTIVE_REQUEST,
  DISMISS_EVENT,
  DOWNLOAD_CONSOLE_VM,
  GET_ALL_EVENTS,
  GET_CONSOLE_OPTIONS,
  GET_RDP_VM,
  NAVIGATE_TO_VM_DETAILS,
  OPEN_CONSOLE_MODAL,
  SAVE_CONSOLE_OPTIONS,
  SAVE_FILTERS,
} from '_/constants'

function* fetchAllEvents (action) {
  const user = yield select(state => ({
    id: state.config.getIn(['user', 'id']),
    name: `${state.config.getIn(['user', 'name'])}@${state.config.get('domain')}`,
  }))

  const events = yield callExternalAction('events', Api.events, { payload: {} })

  if (events.error) {
    return
  }

  const internalEvents = events.event
    ? events.event
      .filter((event) =>
        event.severity === 'error' &&
        event.user &&
        (event.user.id === user.id || event.user.name === user.name)
      )
      .map((event) => Transforms.Event.toInternal({ event }))
    : []
  yield put(setUserMessages({ messages: internalEvents }))
}

function* dismissEvent (action) {
  const { event } = action.payload
  if (event.source === 'server') {
    const result = yield callExternalAction('dismissEvent', Api.dismissEvent, { payload: { eventId: event.id } })

    if (result.status === 'complete') {
      yield fetchAllEvents(action)
    }
  } else {
    yield put(dismissUserMessage({ eventId: event.id }))
  }
}

function* clearEvents (action) {
  const user = yield select(state => ({
    id: state.config.getIn(['user', 'id']),
    name: `${state.config.getIn(['user', 'name'])}@${state.config.get('domain')}`,
  }))
  const events = yield callExternalAction('events', Api.events, { payload: {} })

  if (events.error) {
    return
  }

  const sagaEvents = events.event
    ? events.event
      .filter((event) =>
        event.severity === 'error' &&
        event.user &&
        (event.user.id === user.id || event.user.name === user.name)
      ).map((event) => callExternalAction('dismissEvent', Api.dismissEvent, { payload: { eventId: event.id } }))
    : []

  yield all(sagaEvents)

  yield fetchAllEvents(action)
}

export function* fetchVmSessions ({ vmId }) {
  const sessions = yield callExternalAction('sessions', Api.sessions, { payload: { vmId } })

  if (sessions && sessions.session) {
    return Transforms.VmSessions.toInternal({ sessions })
  }
  return []
}

function* saveFilters (actions) {
  const { filters } = actions.payload
  const userId = yield select(state => state.config.getIn(['user', 'id']))
  saveToLocalStorage(`vmFilters-${userId}`, JSON.stringify(filters))
  yield put(setVmsFilters({ filters }))
}

function* delayedRemoveActiveRequest ({ payload: requestId }) {
  yield delay(500)
  yield put(removeActiveRequest(requestId))
}

function* navigateToVmDetails ({ payload: { vmId } }) {
  yield put(push(`/vm/${vmId}`))
}

export function* rootSaga () {
  yield all([
    ...sagasLogin,
    ...sagasRefresh,

    takeLatest(CHECK_TOKEN_EXPIRED, doCheckTokenExpired),
    takeEvery(DELAYED_REMOVE_ACTIVE_REQUEST, delayedRemoveActiveRequest),

    takeEvery(NAVIGATE_TO_VM_DETAILS, navigateToVmDetails),

    takeEvery(GET_CONSOLE_OPTIONS, getConsoleOptions),
    takeEvery(SAVE_CONSOLE_OPTIONS, saveConsoleOptions),
    takeEvery(OPEN_CONSOLE_MODAL, openConsoleModal),
    takeEvery(DOWNLOAD_CONSOLE_VM, downloadVmConsole),
    takeEvery(GET_RDP_VM, getRDPVm),

    takeLatest(GET_ALL_EVENTS, fetchAllEvents),
    takeEvery(DISMISS_EVENT, dismissEvent),
    takeEvery(CLEAR_USER_MSGS, clearEvents),

    takeEvery(SAVE_FILTERS, saveFilters),

    // Sagas from Components
    ...sagasDisks,
    ...sagasNics,
    ...sagasOptions,
    ...sagasVmActions,
    ...sagasVmChanges,
    ...sagasVmEdits,
    ...sagasVmFetches,
    ...sagasSnapshots,
  ])
}
