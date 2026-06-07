import Alpine from 'alpinejs'
import { setSenderEntryList } from './sender.js'
import { initNetworkList } from './network.js'
import { initBordList } from './bord.js'
import { initDeviceList } from './device.js'
import { initVideoList } from './video.js'
import { initAudioList } from './audio.js'
import './connection.js'


function resetSubFields() {
  const store = Alpine.store('menu')
  store.video_mimetype_show = false
  store.video_format_mode = 'hidden'
  store.video_drm_format_mode = 'hidden'
  store.video_width_mode = 'hidden'
  store.video_height_mode = 'hidden'
  store.video_framerate_mode = 'hidden'
  store.audio_mimetype_show = false
  store.audio_format_mode = 'hidden'
  store.audio_rate_mode = 'hidden'
  store.audio_channels_mode = 'hidden'
}

export function setMediaDeviceList(message) {
  if (message.source === 'gstreamer') {
    for (let codec of message.codecs.video) {
      if (!Array.isArray(codec.format)) codec.format = [codec.format]
    }
    for (let codec of message.codecs.audio) {
      if (!Array.isArray(codec.format)) codec.format = [codec.format]
    }

    switch (message.platform) {
      case 'RASPBERRY_PI_4B':
      case 'RASPBERRY_PI_4CM':
        message.devices = message.devices.filter((d) => d.name !== 'bcm2835-isp')
        message.codecs.video = message.codecs.video.filter((d) => d['interlace-mode'] !== 'alternate')
        break
      case 'RASPBERRY_PI_5':
        message.devices = message.devices.map((d) => {
          if (d.klass === 'Source/Video') {
            d.caps = d.caps.filter((f) => f.startsWith('video/x-raw') && (f.includes('[') || f.includes('{')))
          }
          return d
        })
        break
      case 'JETSON_NANO_2GB':
        message.devices = message.devices.filter((d) => d.name !== 'tegra-snd-t210ref-mobile-rt565x')
        break
    }
  }

  const store = Alpine.store('menu')
  store.message = message
  console.log('message:', message)

  if (message.source === 'gstreamer') {
    initNetworkList()
    initBordList()
    store.showNetwork = true
    store.showBord = true
  } else {
    store.showNetwork = false
    store.showBord = false
  }

  initDeviceList()
  initVideoList()
  initAudioList()

  store.showVideo = true
  store.showAudio = true
  store.showConnection = true

  if (message.source === 'browser') {
    store.video_mimetype_show = false
    store.audio_mimetype_show = false
  }
}

export function connectionEstablishment() {
  const store = Alpine.store('menu')
  store.formDisabled = true
  store.connectionText = '⛔ Stop'
  store.showSubControl = true
  store.showNetwork = false
  store.showBord = false
  store.showVideo = false
  store.showAudio = false
  const senderQR = document.getElementById('SenderQR')
  if (senderQR) senderQR.style.display = 'none'
}

export function initialize() {
  const store = Alpine.store('menu')
  store.formDisabled = false
  store.connectionText = '🎦 Start'
  store.connectionDisabled = true
  store.showNetwork = false
  store.showBord = false
  store.showVideo = false
  store.showAudio = false
  store.showConnection = false
  store.showSubControl = false
  store.showDebug = true
  store.selectedFont = "'Share Tech Mono', monospace"

  store.network_interface = 'none'
  store.network_options = []
  store.flight_controller = 'none'
  store.bord_options = []
  store.video_device = 'none'
  store.video_camera_options = []
  store.video_codec = 'none'
  store.video_codec_options = []
  store.video_codec_hidden = true
  store.video_capture = 'none'
  store.video_capture_options = []
  store.audio_device = 'none'
  store.audio_microphone_options = []
  store.audio_codec = 'none'
  store.audio_codec_options = []
  store.audio_sampling = 'none'
  store.audio_sampling_options = []

  resetSubFields()

  const senderQR = document.getElementById('SenderQR')
  if (senderQR && import.meta.env.MODE === 'production') senderQR.style.display = 'block'
}

export { setSenderEntryList }
