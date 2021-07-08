// @flow
import type { FailedExternalActionInputType, FailedExternalActionType } from './types'

import * as C from '_/constants'

function customizeErrorMessage (message: string): string {
  const result = message.replace('Vm ', 'VM ')
  return result
}

export function extractErrorText (exception: Object): string {
  return (exception.responseJSON && (exception.responseJSON.detail || (exception.responseJSON.fault && exception.responseJSON.fault.detail)))
    ? (exception.responseJSON.detail || exception.responseJSON.fault.detail)
    : (exception.statusText || 'UNKNOWN')
}

export function failedExternalAction ({ message, messageDescriptor, exception, failedAction }: FailedExternalActionInputType): FailedExternalActionType {
  if (exception) {
    message = message || extractErrorText(exception)
    message = customizeErrorMessage(message)

    const type = exception.status ? exception.status : 'ERROR'

    return {
      type: C.FAILED_EXTERNAL_ACTION,
      payload: {
        message,
        messageDescriptor,
        type,
        failedAction,
      },
    }
  }

  return {
    type: C.FAILED_EXTERNAL_ACTION,
    payload: {
      messageDescriptor,
      message,
      failedAction,
    },
  }
}

export function checkTokenExpired (): Object {
  return { type: C.CHECK_TOKEN_EXPIRED }
}

export function showTokenExpiredMessage (): Object {
  return { type: C.SHOW_TOKEN_EXPIRED_MSG }
}
