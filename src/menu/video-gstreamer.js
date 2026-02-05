import Alpine from 'alpinejs'
import * as P from './parameter-utils.js'
import { sortByOrder } from './codec-utils.js'

export function getCodecList(codecs) {
  return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['264', '265', 'vp8', 'vp9', 'av1'],
  )
}

export function getCaptureList() {
  const store = Alpine.store('menu')
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

export function showSubMenu() {
  const store = Alpine.store('menu')
  store.video_mimetype_show = false
  store.video_format_mode = 'hidden'
  store.video_drm_format_mode = 'hidden'
  store.video_width_mode = 'hidden'
  store.video_height_mode = 'hidden'
  store.video_framerate_mode = 'hidden'

  const video_mimetype = store.video_capture.match(/video\/([^\s,]+)/)?.[1]
  P.setMenuOptionText('video_mimetype', video_mimetype)
  store.video_mimetype_show = true

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
    else if (width.startsWith('[')) {
      P.setSliderParameterOption('video_width', width)
      store.video_width = 1280
    } else P.setTextOrNumberField('video_width', width)
  }

  const height = P.getVideoCaptureParameter('height')
  if (height != null) {
    if (height.startsWith('{')) P.setListParameterOption('video_height', height)
    else if (height.startsWith('[')) {
      P.setSliderParameterOption('video_height', height)
      store.video_height = 720
    } else P.setTextOrNumberField('video_height', height)
  }

  const framerate = P.getVideoCaptureParameter('framerate')
  if (framerate != null) {
    if (framerate.startsWith('{')) P.setListParameterOption('video_framerate', framerate)
    else if (framerate.startsWith('[')) {
      P.setSliderParameterOption('video_framerate', framerate)
      store.video_framerate = 30
    } else P.setTextOrNumberField('video_framerate', framerate)
  }
}
