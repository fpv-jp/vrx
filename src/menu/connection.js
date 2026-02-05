import Alpine from 'alpinejs'
import * as B from './connection-browser.js'
import * as G from './connection-gstreamer.js'
import Constants from '../constants.js'
import ReceiverManager, { ReceiverState } from '../receiver'
import * as Widgets from '../widgets'
import * as Menu from './index.js'
import * as Utils from '../utils.js'

const SENDER = Constants.SENDER
const Command = Constants.Command

window.addEventListener('menu:connection-click', async () => {
  const store = Alpine.store('menu')

  if (store.connectionText === '🎦 Start') {
    let payload
    switch (store.message.source) {
      case 'browser':
        payload = B.buildPayload()
        break
      case 'gstreamer':
        payload = await G.buildPayload()
        break
    }
    console.log('payload:', payload)
    ReceiverManager.initReceiverPeerConnection()
    Utils.sendSignalingMessage(ReceiverState.ws, SENDER.MEDIA_STREAM_START, payload)
  } else {
    let { cmd } = ReceiverState
    if (cmd && cmd.readyState === 'open') {
      cmd.send(JSON.stringify({ cmd: Command.HANG_UP }))
    }
    Widgets.destroyReceiver()
    Menu.initialize()
    store.sender = 'none'
  }
})
