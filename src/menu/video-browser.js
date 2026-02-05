import Alpine from 'alpinejs'
import { browserCodecList } from './codec-utils.js'

export const getCodecList = browserCodecList

export function getCaptureList() {
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

export function showSubMenu() {
  const store = Alpine.store('menu')
  store.video_mimetype_show = false
  store.video_format_mode = 'hidden'
  store.video_drm_format_mode = 'hidden'
  store.video_width_mode = 'hidden'
  store.video_height_mode = 'hidden'
  store.video_framerate_mode = 'hidden'
}
