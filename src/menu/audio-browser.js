import Alpine from 'alpinejs'
import { browserCodecList } from './codec-utils.js'

export const getCodecList = browserCodecList

export function getSamplingList() {
  const store = Alpine.store('menu')
  if (store.audio_codec === 'none') return []
  const codec = JSON.parse(store.audio_codec)
  return [{ text: `clockRate ${codec.clockRate} channels ${codec.channels}`, value: JSON.stringify(codec) }]
}

export function showSubMenu() {
  const store = Alpine.store('menu')
  store.audio_mimetype_show = false
  store.audio_format_mode = 'hidden'
  store.audio_rate_mode = 'hidden'
  store.audio_channels_mode = 'hidden'
}
