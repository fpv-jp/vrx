import * as U from './menu-utils'
import * as C from './component'
import * as P from './parameter-utils.js'
import * as Sub from './sub-control.js'

import { setSenderEntryList } from './sender.js'
import { initNetworkList } from './network.js'
import { initBordList } from './bord.js'
import { initDeviceList } from './device.js'
import { initVideoList } from './video.js'
import { initAudioList } from './audio.js'
import './connection.js'

// SenderDifferentComponent -----------------------------------------------
const SenderDifferentComponent = [
  //
  C.VideoSeparator,
  C.VideoMimeType,
  C.AudioSeparator,
  C.AudioMimeType,
]

// MainComponent -----------------------------------------------
const MainComponent = [
  C.Network,
  C.Bord,
  C.Video,
  C.Audio,
]

// setMediaDeviceList -----------------------------------------------
function setMediaDeviceList(message) {
  // console.log('message:', message)

  if (message.source === 'gstreamer') {
    for (let codec of message.codecs.video) {
      if (!Array.isArray(codec.format)) codec.format = [codec.format]
    }
    for (let codec of message.codecs.audio) {
      if (!Array.isArray(codec.format)) codec.format = [codec.format]
    }

    switch (message.platform) {
      case 'APPLE_MAC':
        //
        break
      case 'LINUX_X86':
        //
        break
      case 'RASPBERRY_PI_4B':
      case 'RASPBERRY_PI_4CM':
        //
        message.devices = message.devices.filter((d) => d.name != 'bcm2835-isp')
        message.codecs.video = message.codecs.video.filter((d) => d['interlace-mode'] !== 'alternate')
        break
      case 'RASPBERRY_PI_5':
        //
        message.devices = message.devices.map((d) => {
          if (d.klass === 'Source/Video') {
            d.caps = d.caps.filter((f) => f.startsWith('video/x-raw') && (f.includes('[') || f.includes('{')))
          }
          return d
        })
        break
      case 'JETSON_NANO_2GB':
        //
        message.devices = message.devices.filter((d) => d.name != 'tegra-snd-t210ref-mobile-rt565x')
        break
      case 'JETSON_ORIN_NANO_SUPER':
        //
        break
      case 'RADXA_ROCK_5B':
      case 'RADXA_ROCK_5T':
        //
        break
      case 'UNKNOWN':
      default:
    }
  }

  C.MenuParams.message = message
  console.log('message:', C.MenuParams.message)

  if (message.source === 'gstreamer') {
    // Network Device
    initNetworkList()
    U.showComponent(C.Network)

    // Bord Device
    initBordList()
    U.showComponent(C.Bord)
  }

  // Camera / Microphone
  initDeviceList()

  // Capture / Video codec
  initVideoList()

  // Sampling / Audio codec
  initAudioList()

  U.showComponent(C.Video, C.Audio, C.ConnectionButton)
  U.expandComponent(...MainComponent)

  switch (message.source) {
    case 'browser':
      U.hideComponent(...SenderDifferentComponent)
      break
    case 'gstreamer':
      U.showComponent(...SenderDifferentComponent)
      break
  }

  Sub.enable()

  C.ConnectionButton.disabled = P.checkRequiredKeys()
}

// ParameterEditorComponent -----------------------------------------------
const ParameterEditorComponent = [
  //
  C.SenderEntryList,
  //
  C.NetworkDeviceList,
  //
  C.BordDeviceList,
  //
  C.VideoCodecList,
  C.VideoCameraList,
  C.VideoCaptureList,
  C.VideoFormatList,
  C.VideoDRMFormatList,
  C.VideoWidthList,
  C.VideoWidthSlider,
  C.VideoHeightList,
  C.VideoHeightSlider,
  C.VideoFramerateList,
  C.VideoFramerateSlider,
  //
  C.AudioMicrophoneList,
  C.AudioCodecList,
  C.AudioSamplingList,
  C.AudioFormatList,
  C.AudioRateList,
  C.AudioRateSlider,
  C.AudioChannelsList,
  C.AudioChannelsSlider,
]

// connectionEstablishment -----------------------------------------------
function connectionEstablishment() {
  U.disabledComponent(...ParameterEditorComponent)
  U.showComponent(C.SubControl)
  C.ConnectionButton.title = C.ConnectionText.Hangup
  U.contractionComponent(C.ConnectionMenu, ...MainComponent)
}

// initialize -----------------------------------------------
function initialize() {
  U.enableComponent(...ParameterEditorComponent)
  C.ConnectionButton.title = C.ConnectionText.Start
  
  C.initializeMenuParams()

  U.expandComponent(C.ConnectionMenu)

  U.resetLists(
    //
    C.NetworkDeviceList,
    C.BordDeviceList,
    C.VideoCameraList,
    C.VideoCodecList,
    C.VideoCaptureList,
    C.AudioMicrophoneList,
    C.AudioCodecList,
    C.AudioSamplingList,
  )
  U.hideComponent(
    //
    ...MainComponent,
    C.ConnectionButton,
    C.SubControl,
  )
  Sub.disabled()
}

export {
  //
  C,
  setSenderEntryList,
  setMediaDeviceList,
  connectionEstablishment,
  initialize,
}
