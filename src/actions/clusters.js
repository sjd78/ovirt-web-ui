import * as C from '_/constants'

export function setClusters (clusters) {
  return {
    type: C.SET_CLUSTERS,
    payload: clusters,
  }
}
