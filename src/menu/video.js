import Alpine from 'alpinejs'
import * as P from './utils/parameter-utils.js'
import { browserCodecList, sortByOrder } from './utils/codec-utils.js'
import { checkRequiredKeys } from './utils/parameter-utils.js'
import { setListOptions } from './utils/list-utils.js'

function getCodecList(source, codecs) {
  if (source === 'browser') return browserCodecList(codecs)
  if (source === 'gstreamer') return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['264', '265', 'vp8', 'vp9', 'av1'],
  )
  return []
}

function getCaptureList(source) {
  const store = Alpine.store('menu')
  if (source === 'browser') {
    return [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 960, height: 540 },
      { width: 640, height: 480 },
    ].map(({ width, height }) => ({
      text: `ideal ${width}x${height} fps 30`,
      value: JSON.stringify({ frameRate: { ideal: 30, max: 60 }, width: { ideal: width }, height: { ideal: height } }),
    }))
  }
  if (source === 'gstreamer') {
    if (store.video_device === 'none') return []
    const device = JSON.parse(store.video_device)
    const order = ['video/x-h264', 'video/x-h265', 'video/x-raw,', 'video/x-raw(']
    return device.caps
      .map((cap) => ({ text: cap, value: cap }))
      .sort((a, b) => {
        const ai = order.findIndex((k) => a.text.includes(k))
        const bi = order.findIndex((k) => b.text.includes(k))
        return ai - bi
      })
  }
  return []
}

function showSubMenu(source) {
  const store = Alpine.store('menu')
  store.video_mimetype_show = false
  store.video_format_mode = 'hidden'
  store.video_drm_format_mode = 'hidden'
  store.video_width_mode = 'hidden'
  store.video_height_mode = 'hidden'
  store.video_framerate_mode = 'hidden'

  if (source !== 'gstreamer') return

  store.video_mimetype_show = true
  P.setMenuOptionText('video_mimetype', store.video_capture.match(/video\/([^\s,]+)/)?.[1])

  const format = P.getVideoCaptureParameter('format')
  if (format != null) {
    if (format.startsWith('{')) P.setListParameterOption('video_format', format)
    else P.setTextOrNumberField('video_format', format)
  }

  const drm_format = P.getVideoCaptureParameter('drm-format')
  if (drm_format != null) {
    if (drm_format.startsWith('{')) P.setListParameterOption('video_drm_format', drm_format)
    else P.setTextOrNumberField('video_drm_format', drm_format)
  }

  const width = P.getVideoCaptureParameter('width')
  if (width != null) {
    if (width.startsWith('{')) P.setListParameterOption('video_width', width)
    else if (width.startsWith('[')) { P.setSliderParameterOption('video_width', width); store.video_width = 1280 }
    else P.setTextOrNumberField('video_width', width)
  }

  const height = P.getVideoCaptureParameter('height')
  if (height != null) {
    if (height.startsWith('{')) P.setListParameterOption('video_height', height)
    else if (height.startsWith('[')) { P.setSliderParameterOption('video_height', height); store.video_height = 720 }
    else P.setTextOrNumberField('video_height', height)
  }

  const framerate = P.getVideoCaptureParameter('framerate')
  if (framerate != null) {
    if (framerate.startsWith('{')) P.setListParameterOption('video_framerate', framerate)
    else if (framerate.startsWith('[')) { P.setSliderParameterOption('video_framerate', framerate); store.video_framerate = 30 }
    else P.setTextOrNumberField('video_framerate', framerate)
  }
}

function onCaptureOrCodecChange() {
  const store = Alpine.store('menu')
  const source = store.message?.source
  if (source === 'gstreamer' || store.video_codec !== 'none') showSubMenu(source)
  store.connectionDisabled = checkRequiredKeys()
}

window.addEventListener('menu:video-device-change', () => {
  if (Alpine.store('menu').sender !== 'none') initCaptureList()
})

window.addEventListener('menu:video-capture-change', () => {
  const store = Alpine.store('menu')
  const isRaw = typeof store.video_capture === 'string' && store.video_capture.includes('video/x-raw')

  if (isRaw) {
    store.video_codec_hidden = false
    if (store.video_codec_options.length > 0) {
      store.video_codec = store.video_codec_options[store.video_codec_options.length > 1 ? 1 : 0].value
    }
  } else {
    store.video_codec = 'none'
    store.video_codec_hidden = true
  }

  onCaptureOrCodecChange()
})

window.addEventListener('menu:video-codec-change', onCaptureOrCodecChange)

function initCaptureList() {
  const store = Alpine.store('menu')
  setListOptions('video_capture', 'video_capture_options', getCaptureList(store.message.source))
  onCaptureOrCodecChange()
}

export function initVideoList() {
  const store = Alpine.store('menu')
  const { source, codecs } = store.message
  setListOptions('video_codec', 'video_codec_options', getCodecList(source, codecs.video))
  if (source === 'browser') {
    store.video_codec_hidden = false
  }
  initCaptureList()
}
