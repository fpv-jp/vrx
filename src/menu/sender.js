import Alpine from 'alpinejs'
import Constants from '../constants.js'
import { ReceiverState } from '../receiver'
import * as Menu from './index.js'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER

/**
 * Sender エントリを表示テキストに変換する
 * platform / gpu 情報があれば "(platform:gpu)" 形式で付記する
 * @param {string|{ id: string, platform?: string, gpu?: string }} sender
 * @returns {string}
 */
function formatSenderText(sender) {
  if (typeof sender === 'string') return sender
  const { id, platform, gpu } = sender
  if (platform === 'LINUX_X86' && gpu) return `${id} (${platform}:${gpu})`
  if (platform === 'BROWSER' && gpu) return `${id} (${gpu})`
  if (platform) return `${id} (${platform})`
  return id
}

/**
 * Sender エントリから WebSocket セッション ID を取得する
 * @param {string|{ id: string }} sender
 * @returns {string}
 */
function getSenderId(sender) {
  return typeof sender === 'string' ? sender : sender.id
}

/**
 * シグナリングサーバーから受け取った Sender リストを Alpine ストアに反映する
 * 現在選択中の Sender がリストから消えた場合はメニューを初期化する
 * @param {(string|object)[]} senders
 */
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

const PIN_AUTH = import.meta.env.VITE_PIN_AUTH === 'true'

window.addEventListener('menu:sender-change', () => {
  const store = Alpine.store('menu')
  const sender = store.sender
  const senderIds = store.senders.map((s) => s.id)

  if (senderIds.includes(sender)) {
    ReceiverState.ws.pair = sender
    if (PIN_AUTH) {
      store.pinInput = ''
      store.pinError = ''
      store.pinRequired = true
    } else {
      Utils.sendSignalingMessage(ReceiverState.ws, SENDER.MEDIA_DEVICE_LIST_REQUEST)
    }
  } else {
    Menu.initialize()
    store.sender = 'none'
    store.pinRequired = false
  }
})

window.addEventListener('menu:pin-confirm', () => {
  const store = Alpine.store('menu')
  const pin = store.pinInput.trim()
  store.pinError = ''
  Utils.sendSignalingMessage(ReceiverState.ws, SENDER.MEDIA_DEVICE_LIST_REQUEST, { pin })
})

export { setSenderEntryList }
