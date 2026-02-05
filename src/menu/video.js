import Alpine from 'alpinejs'
import Constants from '../constants.js'
import * as ParameterUtils from './utils/parameter-utils.js'
import { browserCodecList, sortByOrder } from './utils/codec-utils.js'
import { checkRequiredKeys } from './utils/parameter-utils.js'
import { setListOptions } from './utils/list-utils.js'

const { BROWSER, GSTREAMER } = Constants.Source

/**
 * source に応じた映像コーデックのリストを返す
 * @param {'browser'|'gstreamer'} source
 * @param {object[]} codecs
 * @returns {{ text: string, value: string }[]}
 */
function getCodecList(source, codecs) {
  if (source === BROWSER) return browserCodecList(codecs)
  if (source === GSTREAMER) return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['264', '265', 'vp8', 'vp9', 'av1'],
  )
  return []
}

/**
 * source と選択デバイスに応じた映像キャプチャ解像度オプションを返す
 * @param {'browser'|'gstreamer'} source
 * @returns {{ text: string, value: string }[]}
 */
function getCaptureList(source) {
  const store = Alpine.store('menu')
  if (source === BROWSER) {
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
  if (source === GSTREAMER) {
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

/**
 * GStreamer ソースの場合に映像 caps からサブメニュー（format / width / height / framerate）を展開する
 * @param {'browser'|'gstreamer'} source
 */
function showSubMenu(source) {
  const store = Alpine.store('menu')
  store.video_mimetype_show = false
  store.video_format_mode = 'hidden'
  store.video_drm_format_mode = 'hidden'
  store.video_width_mode = 'hidden'
  store.video_height_mode = 'hidden'
  store.video_framerate_mode = 'hidden'

  if (source !== GSTREAMER) return

  store.video_mimetype_show = true
  ParameterUtils.setMenuOptionText('video_mimetype', store.video_capture.match(/video\/([^\s,]+)/)?.[1])

  const format = ParameterUtils.getVideoCaptureParameter('format')
  if (format != null) {
    if (format.startsWith('{')) ParameterUtils.setListParameterOption('video_format', format)
    else ParameterUtils.setTextOrNumberField('video_format', format)
  }

  const drm_format = ParameterUtils.getVideoCaptureParameter('drm-format')
  if (drm_format != null) {
    if (drm_format.startsWith('{')) ParameterUtils.setListParameterOption('video_drm_format', drm_format)
    else ParameterUtils.setTextOrNumberField('video_drm_format', drm_format)
  }

  const width = ParameterUtils.getVideoCaptureParameter('width')
  if (width != null) {
    if (width.startsWith('{')) ParameterUtils.setListParameterOption('video_width', width)
    else if (width.startsWith('[')) { ParameterUtils.setSliderParameterOption('video_width', width); store.video_width = 1280 }
    else ParameterUtils.setTextOrNumberField('video_width', width)
  }

  const height = ParameterUtils.getVideoCaptureParameter('height')
  if (height != null) {
    if (height.startsWith('{')) ParameterUtils.setListParameterOption('video_height', height)
    else if (height.startsWith('[')) { ParameterUtils.setSliderParameterOption('video_height', height); store.video_height = 720 }
    else ParameterUtils.setTextOrNumberField('video_height', height)
  }

  const framerate = ParameterUtils.getVideoCaptureParameter('framerate')
  if (framerate != null) {
    if (framerate.startsWith('{')) ParameterUtils.setListParameterOption('video_framerate', framerate)
    else if (framerate.startsWith('[')) { ParameterUtils.setSliderParameterOption('video_framerate', framerate); store.video_framerate = 30 }
    else ParameterUtils.setTextOrNumberField('video_framerate', framerate)
  }
}

/**
 * キャプチャまたはコーデック変更時に video_codec_hidden と connectionDisabled を更新する
 * GStreamer の raw ストリームのときだけエンコーダー選択を表示する
 */
function onCaptureOrCodecChange() {
  const store = Alpine.store('menu')
  const source = store.message?.source

  if (source === GSTREAMER) {
    const isRaw = typeof store.video_capture === 'string' && store.video_capture.includes('video/x-raw')
    store.video_codec_hidden = !isRaw
    if (!isRaw) store.video_codec = 'none'
  }

  if (source === GSTREAMER || store.video_codec !== 'none') showSubMenu(source)
  store.connectionDisabled = checkRequiredKeys()
}

window.addEventListener('menu:video-device-change', () => {
  if (Alpine.store('menu').sender !== 'none') initCaptureList()
})

window.addEventListener('menu:video-capture-change', () => {
  const store = Alpine.store('menu')
  const source = store.message?.source
  if (source === GSTREAMER) {
    const isRaw = typeof store.video_capture === 'string' && store.video_capture.includes('video/x-raw')
    if (isRaw && store.video_codec_options.length > 0 && store.video_codec === 'none') {
      store.video_codec = store.video_codec_options[0].value
    }
  }
  onCaptureOrCodecChange()
})

window.addEventListener('menu:video-codec-change', onCaptureOrCodecChange)

/** 選択中のデバイスに対応したキャプチャオプションをストアにセットする */
function initCaptureList() {
  const store = Alpine.store('menu')
  setListOptions('video_capture', 'video_capture_options', getCaptureList(store.message.source))
  onCaptureOrCodecChange()
}

/**
 * MEDIA_DEVICE_LIST_RESPONSE 受信後に映像コーデックとキャプチャリストを初期化する
 * @exports
 */
export function initVideoList() {
  const store = Alpine.store('menu')
  const { source, codecs } = store.message
  setListOptions('video_codec', 'video_codec_options', getCodecList(source, codecs.video))
  if (source === BROWSER) {
    store.video_codec_hidden = false
  }
  initCaptureList()
}
