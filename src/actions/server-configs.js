import * as C from '_/constants'

export function setCpuTopologyOptions ({
  maxNumOfSockets,
  maxNumOfCores,
  maxNumOfThreads,
  maxNumOfVmCpusPerArch,
}) {
  return {
    type: C.SET_CPU_TOPOLOGY_OPTIONS,
    payload: {
      maxNumOfSockets,
      maxNumOfCores,
      maxNumOfThreads,
      maxNumOfVmCpusPerArch,
    },
  }
}

export function setDefaultTimezone ({
  defaultGeneralTimezone,
  defaultWindowsTimezone,
}) {
  return {
    type: C.SET_DEFAULT_TIMEZONE,
    payload: {
      defaultGeneralTimezone,
      defaultWindowsTimezone,
    },
  }
}

export function setSpiceUsbAutoShare (usbAutoshare) {
  return {
    type: C.SET_USB_AUTOSHARE,
    payload: {
      usbAutoshare,
    },
  }
}

export function setUSBFilter ({ usbFilter }) {
  return {
    type: C.SET_USB_FILTER,
    payload: {
      usbFilter,
    },
  }
}

export function setUserSessionTimeoutInternal (userSessionTimeoutInterval) {
  return {
    type: C.SET_USER_SESSION_TIMEOUT_INTERVAL,
    payload: {
      userSessionTimeoutInterval,
    },
  }
}

export function setWebsocket (websocket) {
  return {
    type: C.SET_WEBSOCKET,
    payload: {
      websocket,
    },
  }
}

export function setDefaultConsole (defaultConsole) {
  return {
    type: C.SET_GLOBAL_DEFAULT_CONSOLE,
    payload: {
      defaultConsole,
    },
  }
}

export function setDefaultVncMode (defaultVncMode) {
  return {
    type: C.SET_GLOBAL_DEFAULT_VNC_MODE,
    payload: {
      defaultVncMode,
    },
  }
}
