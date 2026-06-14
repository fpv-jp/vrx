'use strict'

import './style.css'
import Alpine from 'alpinejs'
import Constants from './constants.js'

Alpine.store('menu', {
  sender: 'none',
  senders: [],
  formDisabled: false,
  message: null,

  menuOpen: true,
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

  pinRequired: false,
  pinInput: '',
  pinError: '',

  connectionText: '🎦 Start',
  connectionDisabled: true,
  grayscale: false,
  mute: true,
  recording: false,

  selectedColor: 'green',
  colorOptions: [
    { value: 'green', text: 'Green'  },
    { value: 'amber', text: 'Amber'  },
    { value: 'cyan',  text: 'Cyan'   },
    { value: 'white', text: 'White'  },
    { value: 'red',   text: 'Red'    },
  ],

  selectedFont: "'Share Tech Mono', monospace",
  fontOptions: [
    { value: "'Share Tech Mono', monospace", text: 'Share Tech Mono' },
    { value: "'Fira Code', monospace", text: 'Fira Code' },
    { value: "'JetBrains Mono', monospace", text: 'JetBrains Mono' },
    { value: "'VT323', monospace", text: 'VT323' },
  ],

  selectedAircraft: '/image/Helion10.png',
  aircraftOptions: [
    { value: '/image/Helion10.png',      text: 'Helion10'      },
    { value: '/image/Protek60.png',      text: 'Protek60'      },
    { value: '/image/Rekon5-Rocket.png',  text: 'Rekon5 Rocket' },
    { value: '/image/ADF-01-Falken.png',  text: 'ADF-01 Falken' },
    { value: '/image/ADF-11F-Raven.png',  text: 'ADF-11F Raven' },
  ],
})

Alpine.data('xSelect', ({ model, storeOptions, options: staticOpts, onChange, placeholder, formDisabled: useFormDisabled = false, valueKey = 'value', textKey = 'text' }) => ({
  open: false,
  triggerRect: null,

  /** Alpine.js ライフサイクル: スクロール時にドロップダウンを閉じるリスナーを登録する */
  init() {
    this._closeOnScroll = (e) => {
      if (this.$el.contains(e.target)) return
      this.open = false
    }
    window.addEventListener('scroll', this._closeOnScroll, true)
  },

  /** Alpine.js ライフサイクル: スクロールリスナーを解除する */
  destroy() {
    window.removeEventListener('scroll', this._closeOnScroll, true)
  },

  /** storeOptions または staticOpts から生のオプション配列を返す */
  get _rawOptions() {
    return storeOptions ? (Alpine.store('menu')[storeOptions] || []) : (staticOpts || [])
  },

  /** placeholder を先頭に付けた { value, text } 形式のオプション配列を返す */
  get options() {
    const mapped = this._rawOptions.map(o => ({ value: o[valueKey], text: o[textKey] }))
    return placeholder ? [{ value: 'none', text: placeholder }, ...mapped] : mapped
  },

  /** 現在選択中のオプションの表示テキストを返す */
  get currentText() {
    const val = Alpine.store('menu')[model]
    const found = this.options.find(o => String(o.value) === String(val))
    return found ? found.text : (placeholder || '—')
  },

  /** formDisabled が有効かつストアが無効状態のとき true を返す */
  get disabled() {
    return useFormDisabled && (Alpine.store('menu').formDisabled ?? false)
  },

  /** トリガー要素の位置に基づいたドロップダウンの fixed スタイル文字列を返す */
  get listStyle() {
    if (!this.triggerRect) return ''
    const { bottom, left, width } = this.triggerRect
    return `position:fixed; top:${bottom + 1}px; left:${left}px; min-width:${width}px;`
  },

  /**
   * ドロップダウンの開閉を切り替える
   * @param {HTMLElement} triggerEl - クリックされたトリガー要素
   */
  toggle(triggerEl) {
    if (this.disabled) return
    if (!this.open) {
      this.triggerRect = triggerEl.getBoundingClientRect()
    }
    this.open = !this.open
  },

  /**
   * 値を選択してストアに反映し onChange イベントを発火する
   * @param {string} val
   */
  select(val) {
    Alpine.store('menu')[model] = val
    this.open = false
    if (onChange) window.dispatchEvent(new CustomEvent(onChange))
  },

  /**
   * 指定値が現在選択中かどうかを返す
   * @param {string} val
   * @returns {boolean}
   */
  isSelected(val) {
    return String(Alpine.store('menu')[model]) === String(val)
  },
}))

Alpine.start()

const _msgTypeNames = {}
for (const [k, v] of Object.entries(Constants.SENDER))   _msgTypeNames[v] = `SENDER_${k}`
for (const [k, v] of Object.entries(Constants.RECEIVER)) _msgTypeNames[v] = `RECEIVER_${k}`
const _msgName = (type) => _msgTypeNames[type] ?? String(type)

WebSocket.prototype.originalSend = WebSocket.prototype.send
WebSocket.prototype.send = function (type, ws1Id, ws2Id, data) {
  if (Number.isFinite(type)) console.info('<<<', type, _msgName(type))
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

/** パスベースのルーティングで Receiver または Sender として WebSocket 接続を初期化する */
export const SignalingManager = {
  /**
   * URL パスを読み取り、Sender/Receiver どちらとして起動するかを決定する
   * /sender → Sender、/ または /receiver → Receiver（デフォルト）
   */
  init() {
    const pathname = window.location.pathname
    const isSender = pathname === '/sender' || pathname.startsWith('/sender/')

    if (isSender) {
      Widgets.initializeSender()
      this.initSenderSignaling(SIGNALING_ENDPOINT)
    } else {
      Widgets.initializeReceiver()
      this.initReceiverSignaling(SIGNALING_ENDPOINT)
    }
  },

  /**
   * Sender として WebSocket 接続を確立し、シグナリングメッセージを処理する
   * @param {string} SIGNALING_ENDPOINT - シグナリングサーバーの WebSocket URL
   */
  initSenderSignaling(SIGNALING_ENDPOINT) {
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
        const message = JSON.parse(data)
        if (Number.isFinite(message.type)) console.info('>>>', message.type, _msgName(message.type))
        SenderManager.handleSignalingMessage(ws, message)
      })
    })
  },

  /**
   * Receiver として WebSocket 接続を確立し、シグナリングメッセージを処理する
   * @param {string} SIGNALING_ENDPOINT - シグナリングサーバーの WebSocket URL
   */
  initReceiverSignaling(SIGNALING_ENDPOINT) {
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
        const message = JSON.parse(data)
        if (Number.isFinite(message.type)) console.info('>>>', message.type, _msgName(message.type))
        ReceiverManager.handleSignalingMessage(ws, message)
      })
    })
  },
}
