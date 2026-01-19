import * as C from '../component'
import * as B from './browser.js'
import * as G from './gstreamer.js'
import Constants from '../../constants.js'
import ReceiverManager, { ReceiverState } from '../../receiver.js'

import * as Widgets from '../../widgets'
import * as Menu from '../../menu'
import * as Utils from '../../utils.js'

const SENDER = Constants.SENDER
const Command = Constants.Command

// ConnectionButton -----------------------------------------------
C.ConnectionButton.on('click', async () => {
  // Start -------------
  if (C.ConnectionButton.title == C.ConnectionText.Start) {
    let payload
    switch (C.MenuParams.message.source) {
      case 'browser':
        payload = B.buildPayload()
        break
      case 'gstreamer':
        payload = await G.buildPayload()
        break
    }
    console.log('payload:', payload)

    ReceiverManager.initReceiverPeerConnection()

    Utils.sendSignalingMessage(ReceiverState.ws2, SENDER.MEDIA_STREAM_START, payload)
  }

  // Hangup -------------
  if (C.ConnectionButton.title == C.ConnectionText.Hangup) {
    let { dc2CMD } = ReceiverState
    if (dc2CMD && dc2CMD.readyState == 'open') {
      let cmd = Command.HANG_UP
      dc2CMD.send(JSON.stringify({ cmd }))
    }
    Widgets.destroyReceiver()
    Menu.initialize()
    C.MenuParams.sender = 'none'
    C.SenderEntryList.refresh()
  }
})
