import { put, takeLatest } from 'redux-saga/effects'

import Api from '_/ovirtapi'
import * as A from '_/actions'
import * as C from '_/constants'
import { arrayMatch } from '_/utils'

import { callExternalAction } from './utils'

//
//
export default [
  takeLatest(C.CHANGE_VM_CDROM, changeVmCdRom),
  takeLatest(C.EDIT_VM, editVm),
]
//
//

/*
 * Edit a VM by pushing (with a full or partial VM definition) VM updates, and if
 * new cdrom info is provided, change the cdrom as appropriate for the VM's status. A
 * running VM will have its current=true cdrom updated (to make the change immediate).
 * A non-running VM will have its current=false cdrom updated (to make the change apply
 * at next_run).
 */
function* editVm (action) {
  const { payload: { vm } } = action
  const vmId = vm.id
  const onlyNeedChangeCd = vm && arrayMatch(Object.keys(vm), ['id', 'cdrom'])

  const editVmResult = onlyNeedChangeCd
    ? {}
    : yield callExternalAction('editVm', Api.editVm, action)

  let commitError = editVmResult.error
  if (!commitError && vm.cdrom) {
    const changeCdResult = yield changeVmCdRom(A.changeVmCdRom({
      vmId,
      cdrom: vm.cdrom,
      current: action.payload.changeCurrentCd,
      updateVm: false, // A.selectVmDetail will update the VMs info with all of the edits
    }))

    commitError = changeCdResult.error
  }

  if (!commitError) {
    // deep fetch refresh the VM with any/all updates applied
    yield put(A.selectVmDetail({ vmId }))
  }

  if (action.meta && action.meta.correlationId) {
    yield put(A.setVmActionResult({
      vmId,
      correlationId: action.meta.correlationId,
      result: !commitError,
    }))
  }

  if (!commitError && action.payload.restartAfterEdit) {
    yield put(A.restartVm({ vmId })) // non-blocking restart
  }
}

export function* changeVmCdRom (action) {
  const result = yield callExternalAction('changeCdRom', Api.changeCdRom, action)

  if (action.meta && action.meta.correlationId) {
    yield put(A.setVmActionResult({
      vmId: action.payload.vmId,
      correlationId: action.meta.correlationId,
      result: !result.error,
    }))
  }

  return result
}
