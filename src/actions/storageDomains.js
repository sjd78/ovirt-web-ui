// @flow
import type { ActionType } from './index'
import type { StorageDomainType, StorageDomainFileType } from '../ovirtapi/types'

import {
  ADD_STORAGE_DOMAINS,
  GET_ALL_STORAGE_DOMAINS,
  GET_ISO_STORAGE_DOMAINS,
  SET_STORAGE_DOMAIN_FILES,
  SET_STORAGE_DOMAINS,
} from '../constants'

export function getAllStorageDomains (): ActionType {
  return {
    type: GET_ALL_STORAGE_DOMAINS,
  }
}

export function getIsoStorageDomains (): ActionType {
  return {
    type: GET_ISO_STORAGE_DOMAINS,
  }
}

export function setStorageDomains (storageDomains: Array<StorageDomainType>): ActionType {
  return {
    type: SET_STORAGE_DOMAINS,
    payload: { storageDomains },
  }
}

export function addStorageDomains (storageDomains: Array<StorageDomainType>): ActionType {
  return {
    type: ADD_STORAGE_DOMAINS,
    payload: storageDomains,
  }
}

export function setStorageDomainsFiles (storageDomainId: string, files: Array<StorageDomainFileType>): ActionType {
  return {
    type: SET_STORAGE_DOMAIN_FILES,
    payload: {
      storageDomainId,
      files,
    },
  }
}
