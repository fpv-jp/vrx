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

  selectedFont: "'Share Tech Mono', monospace",
  fontOptions: [
    { value: "'Share Tech Mono', monospace", text: 'Share Tech Mono' },
    { value: "'Fira Code', monospace", text: 'Fira Code' },
    { value: "'JetBrains Mono', monospace", text: 'JetBrains Mono' },
    { value: "'VT323', monospace", text: 'VT323' },
  ],
})

Alpine.data('xSelect', ({ model, storeOptions, options: staticOpts, onChange, placeholder, formDisabled: useFormDisabled = false, valueKey = 'value', textKey = 'text' }) => ({
  open: false,
  triggerRect: null,

  init() {
    this._closeOnScroll = () => { this.open = false }
    window.addEventListener('scroll', this._closeOnScroll, true)
  },

  destroy() {
    window.removeEventListener('scroll', this._closeOnScroll, true)
  },

  get _rawOptions() {
    return storeOptions ? (Alpine.store('menu')[storeOptions] || []) : (staticOpts || [])
  },

  get options() {
    const mapped = this._rawOptions.map(o => ({ value: o[valueKey], text: o[textKey] }))
    return placeholder ? [{ value: 'none', text: placeholder }, ...mapped] : mapped
  },

  get currentText() {
    const val = Alpine.store('menu')[model]
    const found = this.options.find(o => String(o.value) === String(val))
    return found ? found.text : (placeholder || '—')
  },

  get disabled() {
    return useFormDisabled && (Alpine.store('menu').formDisabled ?? false)
  },

  get listStyle() {
    if (!this.triggerRect) return ''
    const { bottom, left, width } = this.triggerRect
    return `position:fixed; top:${bottom + 1}px; left:${left}px; min-width:${width}px;`
  },

  toggle(triggerEl) {
    if (this.disabled) return
    if (!this.open) {
      this.triggerRect = triggerEl.getBoundingClientRect()
    }
    this.open = !this.open
  },

  select(val) {
    Alpine.store('menu')[model] = val
    this.open = false
    if (onChange) window.dispatchEvent(new CustomEvent(onChange))
  },

  isSelected(val) {
    return String(Alpine.store('menu')[model]) === String(val)
  },
}))

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
