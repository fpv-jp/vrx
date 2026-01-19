'use strict'

import './style.css'

WebSocket.prototype.originalSend = WebSocket.prototype.send
WebSocket.prototype.send = function (type, ws1Id, ws2Id, data) {
  this.originalSend(JSON.stringify({ type, ws1Id, ws2Id, ...data }))
}

if (!window.RTCRtpScriptTransform) {
  const stream = new ReadableStream()
  window.postMessage(stream, '*', [stream])
}

import SenderManager from './sender.js'
import ReceiverManager from './receiver.js'
import * as Widgets from './widgets'

const SIGNALING_ENDPOINT = import.meta.env.VITE_SIGNALING_ENDPOINT
console.log('Signaling endpoint:', SIGNALING_ENDPOINT)

// -----------------------------------
// SignalingManager
// -----------------------------------
export const SignalingManager = {
  // -----------------------------------
  init: function () {
    const searchParams = new URLSearchParams(window.location.search)
    let p = searchParams.get('p')
    p = p ?? 'r'

    switch (p) {
      case 's':
        Widgets.initializeSender()
        this.initSenderSignaling(SIGNALING_ENDPOINT)
        break
      case 'r':
        Widgets.initializeReceiver()
        this.initReceiverSignaling(SIGNALING_ENDPOINT)
        break
      default:
        Widgets.initializeUnknown()
    }
  },

  // -----------------------------------
  initSenderSignaling: function (SIGNALING_ENDPOINT) {
    let ws1 = new WebSocket(SIGNALING_ENDPOINT, 'sender')
    ws1.addEventListener('close', () => {
      console.warn('WebSocket disconnected')
    })
    ws1.addEventListener('error', () => {
      console.error('WebSocket error', e)
    })
    ws1.addEventListener('open', () => {
      console.info('WebSocket connected')
      ws1.addEventListener('message', ({ data }) => {
        SenderManager.handleSignalingMessage(ws1, JSON.parse(data))
      })
    })
  },

  // -----------------------------------
  initReceiverSignaling: function (SIGNALING_ENDPOINT) {
    let ws2 = new WebSocket(SIGNALING_ENDPOINT, 'receiver')
    ws2.addEventListener('close', () => {
      console.warn('WebSocket disconnected')
    })
    ws2.addEventListener('error', (e) => {
      console.error('WebSocket error', e)
    })
    ws2.addEventListener('open', () => {
      console.info('WebSocket connected')
      ws2.addEventListener('message', ({ data }) => {
        ReceiverManager.handleSignalingMessage(ws2, JSON.parse(data))
      })
    })
  },
}
