import * as C from './component'
import * as U from './menu-utils'
import * as P from './parameter-utils.js'

// getCodecList -----------------------------------------------
export function getCodecList(codecs) {
  let options = []

  for (let codec of codecs) {
    let text = codec.sdpFmtpLine ? `${codec.mimeType} (${codec.sdpFmtpLine})` : codec.mimeType
    let value = JSON.stringify(codec)
    options.push({ text, value })
  }

  return options
}

// getSamplingList -----------------------------------------------
export function getSamplingList() {
  let options = []

  const { audio_codec } = C.MenuParams
  if (audio_codec === 'none') return []

  const codec = JSON.parse(audio_codec)
  options.push({
    text: `clockRate ${codec.clockRate} channels ${codec.channels}`,
    value: JSON.stringify(codec),
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
}
