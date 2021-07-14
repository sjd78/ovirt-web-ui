import { put, takeEvery } from 'redux-saga/effects'

import Api, { Transforms } from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'
import {
  callExternalAction,
} from './utils'

//
//
export default [
  takeEvery(C.ADD_VM_NIC, addVmNic),
  takeEvery(C.DELETE_VM_NIC, deleteVmNic),
  takeEvery(C.EDIT_VM_NIC, editVmNic),
]
//
//

function* fetchVmNics ({ vmId }) {
  const nics = yield callExternalAction('getVmNic', Api.getVmNic, { type: 'GET_VM_NICS', payload: { vmId } })
  if (nics && nics.nic) {
    const nicsInternal = nics.nic.map(nic => Transforms.Nic.toInternal({ nic }))
    return nicsInternal
  }
  return []
}

export function* addVmNic (action) {
  const nic = yield callExternalAction('addNicToVm', Api.addNicToVm, action)

  if (nic && nic.id) {
    const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
    yield put(A.setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
  }
}

function* deleteVmNic (action) {
  yield callExternalAction('deleteNicFromVm', Api.deleteNicFromVm, action)

  const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
  yield put(A.setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
}

function* editVmNic (action) {
  yield callExternalAction('editNicInVm', Api.editNicInVm, action)

  const nicsInternal = yield fetchVmNics({ vmId: action.payload.vmId })
  yield put(A.setVmNics({ vmId: action.payload.vmId, nics: nicsInternal }))
}
