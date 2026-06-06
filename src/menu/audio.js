import Alpine from 'alpinejs'
import * as P from './utils/parameter-utils.js'
import { browserCodecList, sortByOrder } from './utils/codec-utils.js'
import { checkRequiredKeys } from './utils/parameter-utils.js'
import { setListOptions } from './utils/list-utils.js'

function getCodecList(source, codecs) {
  if (source === 'browser') return browserCodecList(codecs)
  if (source === 'gstreamer') return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['opus', 'mulaw'],
  )
  return []
}

function getSamplingList(source) {
  const store = Alpine.store('menu')
  if (source === 'browser') {
    if (store.audio_codec === 'none') return []
    const codec = JSON.parse(store.audio_codec)
    return [{ text: `clockRate ${codec.clockRate} channels ${codec.channels}`, value: JSON.stringify(codec) }]
  }
  if (source === 'gstreamer') {
    if (store.audio_device === 'none') return []
    const device = JSON.parse(store.audio_device)
    return device.caps.map((cap) => ({ text: cap, value: cap }))
  }
  return []
}

function showSubMenu(source) {
  const store = Alpine.store('menu')
  store.audio_mimetype_show = false
  store.audio_format_mode = 'hidden'
  store.audio_rate_mode = 'hidden'
  store.audio_channels_mode = 'hidden'

  if (source !== 'gstreamer') return

  store.audio_mimetype_show = true
  P.setMenuOptionText('audio_mimetype', store.audio_sampling.match(/audio\/([^\s,]+)/)?.[1])

  const format = P.getAudioSamplingParameter('format')
  if (format != null) {
    if (format.startsWith('{')) P.setListParameterOption('audio_format', format)
    else P.setTextOrNumberField('audio_format', format)
  }

  const rate = P.getAudioSamplingParameter('rate')
  if (rate != null) {
    if (rate.startsWith('{')) P.setListParameterOption('audio_rate', rate)
    else if (rate.startsWith('[')) { P.setSliderParameterOption('audio_rate', rate); store.audio_rate = 48000 }
    else P.setTextOrNumberField('audio_rate', rate)
  }

  const channels = P.getAudioSamplingParameter('channels')
  if (channels != null) {
    if (channels.startsWith('{')) P.setListParameterOption('audio_channels', channels)
    else if (channels.startsWith('[')) { P.setSliderParameterOption('audio_channels', channels); store.audio_channels = 1 }
    else P.setTextOrNumberField('audio_channels', channels)
  }
}

function onSamplingOrCodecChange() {
  const store = Alpine.store('menu')
  if (store.audio_codec !== 'none') showSubMenu(store.message?.source)
  store.connectionDisabled = checkRequiredKeys()
}

window.addEventListener('menu:audio-device-change', () => {
  if (Alpine.store('menu').sender !== 'none') initSamplingList()
})

window.addEventListener('menu:audio-sampling-change', onSamplingOrCodecChange)
window.addEventListener('menu:audio-codec-change', onSamplingOrCodecChange)

function initSamplingList() {
  const store = Alpine.store('menu')
  setListOptions('audio_sampling', 'audio_sampling_options', getSamplingList(store.message.source))
  onSamplingOrCodecChange()
}

export function initAudioList() {
  const { source, codecs } = Alpine.store('menu').message
  setListOptions('audio_codec', 'audio_codec_options', getCodecList(source, codecs.audio))
  initSamplingList()
}
