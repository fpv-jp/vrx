import Alpine from 'alpinejs'
import Constants from '../constants.js'
import { ReceiverState } from '../receiver'
import * as Menu from './index.js'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER

function formatSenderText(sender) {
  if (typeof sender === 'string') return sender
  const { id, platform, gpu } = sender
  if (platform === 'LINUX_X86' && gpu) return `${id} (${platform}:${gpu})`
  if (platform === 'BROWSER' && gpu) return `${id} (${gpu})`
  if (platform) return `${id} (${platform})`
  return id
}

function getSenderId(sender) {
  return typeof sender === 'string' ? sender : sender.id
}

function setSenderEntryList(senders) {
  console.log('senders:', senders)

  const store = Alpine.store('menu')
  store.senders = senders.map((sender) => ({
    id: getSenderId(sender),
    label: formatSenderText(sender),
  }))

  const senderIds = store.senders.map((s) => s.id)
  if (!senderIds.includes(store.sender)) {
    Menu.initialize()
    store.sender = 'none'
  }
}

window.addEventListener('menu:sender-change', () => {
  const store = Alpine.store('menu')
  const sender = store.sender
  const senderIds = store.senders.map((s) => s.id)

  if (senderIds.includes(sender)) {
    ReceiverState.ws.pair = sender
    Utils.sendSignalingMessage(ReceiverState.ws, SENDER.MEDIA_DEVICE_LIST_REQUEST)
  } else {
    Menu.initialize()
    store.sender = 'none'
  }
})

export { setSenderEntryList }
