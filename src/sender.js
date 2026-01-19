import Constants from './constants.js'
import ComingSignalingMessage from './sender-websocket.js'
import CreateVtxDataChannel from './sender-datachannel.js'
import { senderEncodeTransform } from './stream-handler.js'

import * as Utils from './utils.js'

const RECEIVER = Constants.RECEIVER

//-------------------------------------
//
//-------------------------------------
export const SenderState = {
  ws1: null,
  pc1: null,

  stream: null,
  sensor: null,

  dc1CMD: null,

  dummyIntervalId: null,
  gpsWatchId: null,
}

//-------------------------------------
//
//-------------------------------------
const SenderManager = {
  //-------------------------------------
  // WS1 WebSocket Message
  //-------------------------------------
  handleSignalingMessage: async function (ws1, message) {
    SenderState.ws1 = ws1
    ComingSignalingMessage(message, this.initSenderPeerConnection)
  },

  //-------------------------------------
  // PC1 Peer Connection
  //-------------------------------------
  initSenderPeerConnection: function () {
    let pc1 = new RTCPeerConnection({ iceServers: Constants.ICE_SERVERS })
    SenderState.pc1 = pc1

    pc1.addEventListener('connectionstatechange', (e) => {
      const s = Utils.stats(e)
      switch (s.connectionState) {
        case 'connecting':
          break
        case 'connected':
          console.log('OK! Connection established')
          break
        case 'disconnected':
          console.warn('Warning! Connection disconnected')
          break
        case 'failed':
          console.error('Error! Connection failed')
          SenderState?.stream.getTracks().forEach((track) => track.stop())
          SenderState.stream = null

          SenderState?.pc1.close()
          SenderState.pc1 = null
          break
      }
    })

    pc1.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate && Utils.isIPv4(candidate.address)) {
        Utils.sendSignalingMessage(SenderState.ws1, RECEIVER.ICE, { candidate })
      }
    })

    CreateVtxDataChannel(pc1)

    SenderState.stream.getTracks().forEach((track) => {
      const sender = pc1.addTrack(track, SenderState.stream)
      if (track.kind === 'video') {
        senderEncodeTransform(sender)
      }
    })
  },

  //-------------------------------------
  //
  //-------------------------------------
  onunload: function (e) {
    console.log('unload', e)
  },
}

export default SenderManager
