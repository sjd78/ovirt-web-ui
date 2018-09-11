// @flow
import type { ActionType } from './index'
import type { TemplateType } from '../ovirtapi/types'

import {
  GET_ALL_TEMPLATES,
  SET_TEMPLATES,
} from '../constants'

export function setTemplates (templates: Array<TemplateType>): ActionType {
  return {
    type: SET_TEMPLATES,
    payload: templates,
  }
}

export function getAllTemplates ({ shallowFetch = false }: { shallowFetch: boolean }): ActionType {
  return {
    type: GET_ALL_TEMPLATES,
    payload: {
      shallowFetch,
    },
  }
}
