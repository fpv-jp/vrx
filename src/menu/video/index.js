import * as C from '../component'
import * as P from '../parameter-utils.js'
import * as B from './browser.js'
import * as G from './gstreamer.js'

C.VideoDeviceList.on('change', () => {
  if (C.MenuParams.sender !== 'none') {
    initVideoCaptureList()
  }
})

C.VideoCaptureList.on('change', () => {
  C.ConnectionButton.disabled = P.checkRequiredKeys()
})

function onChange() {
  if (C.MenuParams.video_codec !== 'none') {
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

C.VideoCodecList.on('change', () => {
  onChange()
})

C.VideoCaptureList.on('change', () => {
  onChange()
})

// Video Codec List --------------------------------
function initVideoCodecList() {
  const { source, codecs } = C.MenuParams.message

  let options = []

  switch (source) {
    case 'browser':
      options = B.getCodecList(codecs.video)
      break
    case 'gstreamer':
      options = G.getCodecList(codecs.video)
      break
  }

  if (options.length > 0) {
    options.unshift(C.Placeholder)
  }

  C.VideoCodecList.options = options
  C.MenuParams.video_codec = options[options.length === 1 ? 0 : 1].value
  C.VideoCodecList.refresh()
}

// Video Capture List --------------------------------
function initVideoCaptureList() {
  let options = []
  switch (C.MenuParams.message.source) {
    case 'browser':
      options = B.getCaptureList()
      break
    case 'gstreamer':
      options = G.getCaptureList()
      break
  }
  options.unshift(C.Placeholder)

  C.VideoCaptureList.options = options
  C.MenuParams.video_capture = options[options.length === 1 ? 0 : 1].value
  C.VideoCaptureList.refresh()

  onChange()
}

export function initVideoList() {
  ;(initVideoCodecList(), initVideoCaptureList())
}
