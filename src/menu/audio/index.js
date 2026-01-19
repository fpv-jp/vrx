import * as C from '../component'
import * as P from '../parameter-utils.js'
import * as B from './browser.js'
import * as G from './gstreamer.js'

C.AudioDeviceList.on('change', () => {
  if (C.MenuParams.sender !== 'none') {
    initAudioSamplingList()
  }
})

C.AudioSamplingList.on('change', () => {
  C.ConnectionButton.disabled = P.checkRequiredKeys()
})

function onChange() {
  if (C.MenuParams.audio_codec !== 'none') {
    switch (C.MenuParams.message.source) {
      case 'browser':
        B.showSubMenu()
        break
      case 'gstreamer':
        G.showSubMenu()
        break
    }
  }
}

C.AudioCodecList.on('change', () => {
  onChange()
})

C.AudioSamplingList.on('change', () => {
  onChange()
})

// Audio Codec List --------------------------------
function initAudioCodecList() {
  let options = []

  const { source, codecs } = C.MenuParams.message
  switch (source) {
    case 'browser':
      options = B.getCodecList(codecs.audio)
      break
    case 'gstreamer':
      options = G.getCodecList(codecs.audio)
      break
  }

  if (options.length > 0) {
    options.unshift(C.Placeholder)
  }

  C.AudioCodecList.options = options
  C.MenuParams.audio_codec = options[options.length === 1 ? 0 : 1].value
  C.AudioCodecList.refresh()
}

// Audio Sampling List --------------------------------
function initAudioSamplingList() {
  let options = []

  switch (C.MenuParams.message.source) {
    case 'browser':
      options = B.getSamplingList()
      break
    case 'gstreamer':
      options = G.getSamplingList()
      break
  }
  options.unshift(C.Placeholder)

  C.AudioSamplingList.options = options
  C.MenuParams.audio_sampling = options[options.length === 1 ? 0 : 1].value
  C.AudioSamplingList.refresh()

  onChange()
}

export function initAudioList() {
  ;(initAudioCodecList(), initAudioSamplingList())
}
