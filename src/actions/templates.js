import * as C from '_/constants'

export function setTemplates (templates) {
  return {
    type: C.SET_TEMPLATES,
    payload: {
      templates,
    },
  }
}
