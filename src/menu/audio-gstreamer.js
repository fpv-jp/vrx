import * as C from './component'
import * as U from './menu-utils'
import * as P from './parameter-utils.js'

// getCodecList -----------------------------------------------
export function getCodecList(codecs) {
  let options = []

  for (let codec of codecs) {
    let text = codec.name
    let value = JSON.stringify(codec)
    options.push({ text, value })
  }

  let order = ['opus', 'mulaw']

  return options.sort((a, b) => {
    let aIndex = order.findIndex((key) => a.text.includes(key))
    let bIndex = order.findIndex((key) => b.text.includes(key))
    return aIndex - bIndex
  })
}

// getSamplingList -----------------------------------------------
export function getSamplingList() {
  const { audio_device } = C.MenuParams
  if (audio_device === 'none') return []

  let options = []
  let device = JSON.parse(audio_device)
  device.caps.forEach((cap) => {
    options.push({ text: cap, value: cap })
  })

  return options
}

// showSubMenu -----------------------------------------------
export function showSubMenu() {
  U.hideComponent(
    //
    C.AudioMimeType,
    C.AudioFormat,
    C.AudioFormatList,
    C.AudioRate,
    C.AudioRateList,
    C.AudioRateSlider,
    C.AudioChannels,
    C.AudioChannelsList,
    C.AudioChannelsSlider,
  )

  const audio_mimetype = C.MenuParams.audio_sampling.match(/audio\/([^\s,]+)/)?.[1]
  P.setMenuOptionText(C.AudioMimeType, audio_mimetype)

  const format = P.getAudioSamplingParameter('format')
  if (format != null) {
    if (format.startsWith('{')) {
      P.setListParameterOption(C.AudioFormatList, format)
    } else {
      P.setTextOrNumberField(C.AudioFormat, format)
    }
  }

  const rate = P.getAudioSamplingParameter('rate')
  if (rate != null) {
    if (rate.startsWith('{')) {
      P.setListParameterOption(C.AudioRateList, rate)
    } else if (rate.startsWith('[')) {
      C.MenuParams.audio_rate = 48000
      C.AudioRateList.refresh()
      P.setSliderParameterOption(C.AudioRateSlider, rate)
    } else {
      P.setTextOrNumberField(C.AudioRate, rate)
    }
  }

  const channels = P.getAudioSamplingParameter('channels')
  if (channels != null) {
    if (channels.startsWith('{')) {
      P.setListParameterOption(C.AudioChannels, channels)
    } else if (channels.startsWith('[')) {
      C.MenuParams.audio_channels = 1
      C.AudioChannels.refresh()
      P.setSliderParameterOption(C.AudioChannelsSlider, channels)
    } else {
      P.setTextOrNumberField(C.AudioChannels, channels)
    }
  }
}
