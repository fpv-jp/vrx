'use strict'

import './style.css'
import Alpine from 'alpinejs'

Alpine.store('menu', {
  sender: 'none',
  senders: [],
  formDisabled: false,
  message: null,

  showNetwork: false,
  showBord: false,
  showVideo: false,
  showAudio: false,
  showConnection: false,
  showSubControl: false,

  network_interface: 'none',
  network_options: [],

  flight_controller: 'none',
  bord_options: [],

  video_device: 'none',
  video_camera_options: [],
  video_codec: 'none',
  video_codec_options: [],
  video_codec_hidden: true,
  video_capture: 'none',
  video_capture_options: [],

  video_mimetype: '',
  video_mimetype_show: false,
  video_format: '',
  video_format_mode: 'hidden',
  video_format_options: [],
  video_drm_format: '',
  video_drm_format_mode: 'hidden',
  video_drm_format_options: [],
  video_width: 0,
  video_width_mode: 'hidden',
  video_width_options: [],
  video_width_min: 1, video_width_max: 3840, video_width_step: 1,
  video_height: 0,
  video_height_mode: 'hidden',
  video_height_options: [],
  video_height_min: 1, video_height_max: 2160, video_height_step: 1,
  video_framerate: 0,
  video_framerate_mode: 'hidden',
  video_framerate_options: [],
  video_framerate_min: 1, video_framerate_max: 120, video_framerate_step: 1,

  audio_device: 'none',
  audio_microphone_options: [],
  audio_codec: 'none',
  audio_codec_options: [],
  audio_sampling: 'none',
  audio_sampling_options: [],

  audio_mimetype: '',
  audio_mimetype_show: false,
  audio_format: '',
  audio_format_mode: 'hidden',
  audio_format_options: [],
  audio_rate: 0,
  audio_rate_mode: 'hidden',
  audio_rate_options: [],
  audio_rate_min: 8000, audio_rate_max: 192000, audio_rate_step: 1,
  audio_channels: 0,
  audio_channels_mode: 'hidden',
  audio_channels_options: [],
  audio_channels_min: 1, audio_channels_max: 8, audio_channels_step: 1,

  connectionText: '🎦 Start',
  connectionDisabled: true,
  grayscale: false,
  mute: false,
  recording: false,
})

Alpine.start()

WebSocket.prototype.originalSend = WebSocket.prototype.send
WebSocket.prototype.send = function (type, ws1Id, ws2Id, data) {
  this.originalSend(JSON.stringify({ type, ws1Id, ws2Id, ...data }))
}

if (!window.RTCRtpScriptTransform) {
  const stream = new ReadableStream()
  window.postMessage(stream, '*', [stream])
}

import SenderManager from './sender'
import ReceiverManager from './receiver'
import * as Widgets from './widgets'
import './menu/sub-control.js'

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
    let ws = new WebSocket(SIGNALING_ENDPOINT, 'sender')
    ws.addEventListener('close', () => {
      console.warn('WebSocket disconnected')
    })
    ws.addEventListener('error', () => {
      console.error('WebSocket error', e)
    })
    ws.addEventListener('open', () => {
      console.info('WebSocket connected')
      ws.addEventListener('message', ({ data }) => {
        SenderManager.handleSignalingMessage(ws, JSON.parse(data))
      })
    })
  },

  // -----------------------------------
  initReceiverSignaling: function (SIGNALING_ENDPOINT) {
    let ws = new WebSocket(SIGNALING_ENDPOINT, 'receiver')
    ws.addEventListener('close', () => {
      console.warn('WebSocket disconnected')
    })
    ws.addEventListener('error', (e) => {
      console.error('WebSocket error', e)
    })
    ws.addEventListener('open', () => {
      console.info('WebSocket connected')
      ws.addEventListener('message', ({ data }) => {
        ReceiverManager.handleSignalingMessage(ws, JSON.parse(data))
      })
    })
  },
}
