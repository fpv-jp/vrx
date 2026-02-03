import * as C from './component'
import Constants from '../constants.js'
import { ReceiverState } from '../receiver.js'

import * as Menu from './index.js'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER

// Format sender display text based on platform info
function formatSenderText(sender) {
  // Support old format (string) and new format (object with id, platform, gpu)
  if (typeof sender === 'string') {
    return sender
  }
  const { id, platform, gpu } = sender
  if (platform === 'LINUX_X86' && gpu) {
    return `${id} (${platform}:${gpu})`
  }
  if (platform === 'BROWSER' && gpu) {
    return `${id} (${gpu})`
  }
  if (platform) {
    return `${id} (${platform})`
  }
  return id
}

// Get sender ID from sender (handles both old and new format)
function getSenderId(sender) {
  return typeof sender === 'string' ? sender : sender.id
}

// SenderEntryList -----------------------------------------------
function setSenderEntryList(senders) {
  console.log('senders:', senders)

  // Normalize to always store IDs for compatibility
  const senderIds = senders.map(getSenderId)
  C.MenuParams.senders = senderIds

  C.SenderEntryList.options = [
    //
    C.Placeholder,
    ...senders.map((sender) => {
      const id = getSenderId(sender)
      const text = formatSenderText(sender)
      return { text, value: id }
    }),
  ]

  if (senderIds && senderIds.includes(C.MenuParams.sender)) {
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
