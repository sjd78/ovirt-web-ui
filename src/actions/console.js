import * as C from '_/constants'

export function openConsoleModal ({ vmId, usbAutoshare, usbFilter, userId, consoleId, hasGuestAgent, openInPage, isNoVNC, modalId }) {
  return {
    type: C.OPEN_CONSOLE_MODAL,
    payload: {
      vmId,
      usbAutoshare,
      usbFilter,
      userId,
      consoleId,
      hasGuestAgent,
      openInPage,
      isNoVNC,
      modalId,
    },
  }
}

export function setActiveConsole ({ vmId, consoleId }) {
  return {
    type: C.SET_ACTIVE_CONSOLE,
    payload: {
      vmId,
      consoleId,
    },
  }
}

export function downloadConsole ({ vmId, consoleId, usbAutoshare, usbFilter, hasGuestAgent, skipSSO, openInPage, isNoVNC, modalId }) {
  return {
    type: C.DOWNLOAD_CONSOLE_VM,
    payload: {
      vmId,
      consoleId,
      usbAutoshare,
      usbFilter,
      hasGuestAgent,
      skipSSO,
      openInPage,
      isNoVNC,
      modalId,
    },
  }
}

export function setConsoleTickets ({ vmId, proxyTicket, ticket }) {
  return {
    type: C.SET_CONSOLE_TICKETS,
    payload: {
      vmId,
      proxyTicket,
      ticket,
    },
  }
}

export function setConsoleStatus ({ vmId, status, reason }) {
  return {
    type: C.SET_CONSOLE_NOVNC_STATUS,
    payload: {
      vmId,
      status,
      reason,
    },
  }
}

export function setNewConsoleModal ({ modalId, vmId, consoleId }) {
  return {
    type: C.SET_NEW_CONSOLE_MODAL,
    payload: {
      modalId,
      vmId,
      consoleId,
    },
  }
}

export function closeConsoleModal ({ modalId }) {
  return {
    type: C.CLOSE_CONSOLE_MODAL,
    payload: {
      modalId,
    },
  }
}

export function setInUseConsoleModalState ({ modalId }) {
  return {
    type: C.SET_IN_USE_CONSOLE_MODAL_STATE,
    payload: {
      modalId,
    },
  }
}

export function setLogonConsoleModalState ({ modalId }) {
  return {
    type: C.SET_LOGON_CONSOLE_MODAL_STATE,
    payload: {
      modalId,
    },
  }
}
