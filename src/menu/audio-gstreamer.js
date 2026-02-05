import Alpine from 'alpinejs'
import * as P from './parameter-utils.js'
import { sortByOrder } from './codec-utils.js'

export function getCodecList(codecs) {
  return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['opus', 'mulaw'],
  )
}

export function getSamplingList() {
  const store = Alpine.store('menu')
  if (store.audio_device === 'none') return []
  const device = JSON.parse(store.audio_device)
  return device.caps.map((cap) => ({ text: cap, value: cap }))
}

export function showSubMenu() {
  const store = Alpine.store('menu')
  store.audio_mimetype_show = false
  store.audio_format_mode = 'hidden'
  store.audio_rate_mode = 'hidden'
  store.audio_channels_mode = 'hidden'

  const audio_mimetype = store.audio_sampling.match(/audio\/([^\s,]+)/)?.[1]
  P.setMenuOptionText('audio_mimetype', audio_mimetype)
  store.audio_mimetype_show = true

  const format = P.getAudioSamplingParameter('format')
  if (format != null) {
    if (format.startsWith('{')) P.setListParameterOption('audio_format', format)
    else P.setTextOrNumberField('audio_format', format)
  }

  const rate = P.getAudioSamplingParameter('rate')
  if (rate != null) {
    if (rate.startsWith('{')) P.setListParameterOption('audio_rate', rate)
    else if (rate.startsWith('[')) {
      P.setSliderParameterOption('audio_rate', rate)
      store.audio_rate = 48000
    } else P.setTextOrNumberField('audio_rate', rate)
  }

  const channels = P.getAudioSamplingParameter('channels')
  if (channels != null) {
    if (channels.startsWith('{')) P.setListParameterOption('audio_channels', channels)
    else if (channels.startsWith('[')) {
      P.setSliderParameterOption('audio_channels', channels)
      store.audio_channels = 1
    } else P.setTextOrNumberField('audio_channels', channels)
  }
}
