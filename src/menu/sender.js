import * as C from './component'
import Constants from '../constants.js'
import { ReceiverState } from '../receiver.js'

import * as Menu from './index.js'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER

// SenderEntryList -----------------------------------------------
function setSenderEntryList(senders) {
  C.MenuParams.senders = senders

  C.SenderEntryList.options = [
    //
    C.Placeholder,
    ...senders.map((id) => ({ text: id, value: id })),
  ]

  if (senders && senders.includes(C.MenuParams.sender)) {
  } else {
    Menu.initialize()
    C.MenuParams.sender = 'none'
    C.SenderEntryList.refresh()
  }
}

// SenderEntryList on change -----------------------------------------------
C.SenderEntryList.on('change', () => {
  const sender = C.MenuParams.sender
  const senders = C.MenuParams.senders

  if (senders && senders.includes(sender)) {
    ReceiverState.ws2.pair = sender
    Utils.sendSignalingMessage(ReceiverState.ws2, SENDER.MEDIA_DEVICE_LIST_REQUEST)
  } else {
    Menu.initialize()
    C.MenuParams.sender = 'none'
    C.SenderEntryList.refresh()
  }
})

export { setSenderEntryList }
