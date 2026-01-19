import Constants from './constants.js'
import ComingSignalingMessage from './receiver-websocket.js'
import OpenVtxDataChannel from './receiver-datachannel.js'

import { receiverDecodeTransform } from './stream-handler.js'
import ConnectionMonitoring from './widgets/monitoring.js'
import TelemetryOverlay from './widgets/telemetry-overlay.js'
import SearchRadar from './widgets/search-radar.js'
import * as Menu from './menu'
import * as Widgets from './widgets'
import * as Utils from './utils.js'

//-------------------------------------
//
//-------------------------------------
export const ReceiverState = {
  ws2: null,
  pc2: null,

  stream: null,
  audio: null,
  audioVisualizer: null,

  videoText: '',
  audioText: '',
  headUpDisplay: TelemetryOverlay(HeadUpDisplay),

  searchRadar: SearchRadar(RadarMap),

  dc2CMD: null,
}

const SENDER = Constants.SENDER

//-------------------------------------
//
//-------------------------------------
const ReceiverManager = {
  //-------------------------------------
  // PC2 WebSocket Message
  //-------------------------------------
  handleSignalingMessage: async function (ws2, message) {
    ReceiverState.ws2 = ws2
    ComingSignalingMessage(message)
  },

  //-------------------------------------
  // PC2 Peer Connection
  //-------------------------------------
  initReceiverPeerConnection: function () {
    // let pc2 = new RTCPeerConnection({ iceServers: Constants.ICE_SERVERS })
    let pc2 = new RTCPeerConnection()
    ReceiverState.pc2 = pc2

    pc2.addEventListener('connectionstatechange', (e) => {
      const s = Utils.stats(e)
      switch (s.connectionState) {
        case 'connecting':
          break

        case 'connected':
          console.log('OK! Connection established')
          ConnectionMonitoring.start()
          Menu.connectionEstablishment()
          Widgets.connectionEstablishment()
          break

        case 'disconnected':
          console.warn('Warning! Connection disconnected')
          break

        case 'failed':
          console.error('Error! Connection failed')
          break
      }
    })

    pc2.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate) {
        const ice = Utils.parseICE(candidate.candidate)
        if (ice) {
          console.log(`<<< ${SENDER.ICE} SENDER.ICE: ${ice}`)
        } else {
          console.log(`<<< ${SENDER.ICE} SENDER.ICE: ${candidate.candidate}`)
        }
        Utils.sendSignalingMessage(ReceiverState.ws2, SENDER.ICE, { candidate })
      }
    })

    pc2.addEventListener('track', ({ receiver, streams, track }) => {
      if (track.kind === 'video') {
        receiverDecodeTransform(receiver)
      } else if (track.kind === 'audio') {
        receiverDecodeTransform(receiver)
        Widgets.attachAudioStream(streams[0])
      }

      if (ReceiverState.stream != streams[0]) {
        ReceiverState.stream = streams[0]
      }
    })

    //-------------------------------------
    //
    //-------------------------------------
    pc2.addEventListener('datachannel', ({ channel }) => {
      OpenVtxDataChannel(channel)
    })
  },

  //-------------------------------------
  //
  //-------------------------------------
  onunload: function (e) {
    console.log('unload', e)
  },

  //-------------------------------------
  //
  //-------------------------------------
  onfullscreenchange: function (e) {
    console.log('fullscreenchange', e)
  },

  //-------------------------------------
  //
  //-------------------------------------
  onReceiverContainerResize: function (e) {
    // console.log('ReceiverContainerResize', e)
  },
  //-------------------------------------
  //
  //-------------------------------------
  onRemoteVideorResize: function (entries) {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        ReceiverState.headUpDisplay.resizeCanvas(width, height)
      }
    }
  },
}

export default ReceiverManager
