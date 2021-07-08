// @flow

import * as C from '_/constants'

export function setStorageDomains (storageDomains: Array<Object>): Object {
  return {
    type: C.SET_STORAGE_DOMAINS,
    payload: { storageDomains },
  }
}

export function setStorageDomainsFiles (storageDomainId: string, files: Array<Object>): Object {
  return {
    type: C.SET_STORAGE_DOMAIN_FILES,
    payload: {
      storageDomainId,
      files,
    },
  }
}
