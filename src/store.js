// @flow
import { createStore, applyMiddleware, compose, type History, type StoreCreator } from 'redux'
import createSagaMiddleware, { type SagaMiddleware, type Task } from 'redux-saga'
import { createLogger } from 'redux-logger'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { Iterable } from 'immutable'

import AppConfiguration from '_/config'
import OvirtApi from '_/ovirtapi'
import reducers from '_/reducers'
import { rootSaga } from '_/sagas'

import { addActiveRequest, delayedRemoveActiveRequest } from '_/actions'

const ACTION_IGNORE_LIST = ['ADD_ACTIVE_REQUEST', 'REMOVE_ACTIVE_REQUEST', 'DELAYED_REMOVE_ACTIVE_REQUEST']

const composeEnhancers: any =
  (process.env.NODE_ENV !== 'production' &&
   window &&
   typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function' &&
   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
     actionsBlacklist: ACTION_IGNORE_LIST,
     maxAge: 100,
   })) ||
  compose

function initializeApiListener (store: StoreCreator) {
  OvirtApi.addHttpListener((requestId, eventType) => {
    if (eventType === 'START') {
      store.dispatch(addActiveRequest(requestId))
      return
    }
    if (eventType === 'STOP') {
      store.dispatch(delayedRemoveActiveRequest(requestId))
    }
  })
}

/**
 * Configure the app's redux store with saga middleware, connected react-router,
 * and connected to the OvirtApi listeners.
 */
export default function configureStore (): StoreCreator & { rootTask: Task, history: History } {
  const sagaMiddleware: SagaMiddleware = createSagaMiddleware({
    onError (error: Error) {
      console.error('Uncaught saga error (store.js): ', error)
    },
  })

  // history to use for the connected react-router
  const history: History = createBrowserHistory({
    basename: AppConfiguration.applicationURL,
  })

  const loggerMiddleware = []
  if (process.env.NODE_ENV !== 'production') {
    loggerMiddleware.push(createLogger({
      collapsed: true,
      duration: true,
      predicate: (getState, action) => !ACTION_IGNORE_LIST.includes(action.type),
      stateTransformer: (state) => {
        const newState = {}
        for (var i of Object.keys(state)) {
          newState[i] = Iterable.isIterable(state[i]) ? state[i].toJS() : state[i]
        }
        return newState
      },
    }))
  }

  const store: StoreCreator = createStore(
    connectRouter(history)(reducers),
    composeEnhancers(
      applyMiddleware(
        ...loggerMiddleware,
        routerMiddleware(history),
        sagaMiddleware
      )
    )
  )

  initializeApiListener(store)
  const rootTask: Task = sagaMiddleware.run(rootSaga)

  return {
    ...store,
    rootTask,
    history,
  }
}
