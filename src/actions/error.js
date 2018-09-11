// @flow
import type { ActionType } from './index'
import { FAILED_EXTERNAL_ACTION, LOGIN_FAILED } from '../constants'

export type ExceptionType = {
  status: number,
  statusText: string,
  responseJSON: Object
}

export type FailedExternalActionInputType = {
  message: string,
  shortMessage: string,
  exception?: ExceptionType,
  failedAction?: Object
}

export type FailedExternalActionType = {
  type: 'FAILED_EXTERNAL_ACTION',
  payload: {
    message: string,
    shortMessage?: string,
    type?: number | 'ERROR',
    failedAction?: Object
  }
}

function customizeErrorMessage (message: string): string {
  const result = message.replace('Vm ', 'VM ')
  return result
}

export function extractErrorText (exception: ExceptionType): string {
  return (
    exception.responseJSON &&
    (exception.responseJSON.detail || (exception.responseJSON.fault && exception.responseJSON.fault.detail)))
    ? (exception.responseJSON.detail || exception.responseJSON.fault.detail)
    : (exception.statusText || 'UNKNOWN')
}

export function failedExternalAction ({ message, shortMessage, exception, failedAction }: FailedExternalActionInputType): FailedExternalActionType {
  if (exception) {
    message = message || extractErrorText(exception)
    message = shortMessage + '\n' + customizeErrorMessage(message)

    const type = exception['status'] ? exception['status'] : 'ERROR'

    return {
      type: FAILED_EXTERNAL_ACTION,
      payload: {
        message,
        shortMessage,
        type,
        failedAction,
      },
    }
  }

  return {
    type: FAILED_EXTERNAL_ACTION,
    payload: {
      message,
      failedAction,
    },
  }
}

export function loginFailed ({ errorCode, message }: { errorCode: number, message: string }): ActionType {
  return {
    type: LOGIN_FAILED,
    payload: {
      errorCode,
      message,
    },
  }
}
