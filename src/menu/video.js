import * as C from './component'
import { bindMediaLists } from './media-utils.js'
import * as P from './parameter-utils.js'
import * as B from './video-browser.js'
import * as G from './video-gstreamer.js'

const { initCodecList, initOptionList } = bindMediaLists({
  type: 'video',
  deviceList: C.VideoCameraList,
  codecList: C.VideoCodecList,
  optionList: C.VideoCaptureList,
  getCodecListBySource(source, codecs) {
    switch (source) {
      case 'browser':
        return B.getCodecList(codecs.video)
      case 'gstreamer':
        return G.getCodecList(codecs.video)
    }
    return []
  },
  getOptionListBySource(source) {
    switch (source) {
      case 'browser':
        return B.getCaptureList()
      case 'gstreamer':
        return G.getCaptureList()
    }
    return []
  },
  showSubMenuBySource(source) {
    switch (source) {
      case 'browser':
        B.showSubMenu()
        break
      case 'gstreamer':
        G.showSubMenu()
        break
    }
  },
  shouldShowSubMenuByState() {
    return C.MenuParams.message?.source === 'gstreamer' || C.MenuParams.video_codec !== 'none'
  },
})

function updateVideoCodecVisibility() {
  const capture = C.MenuParams.video_capture
  const isRaw = typeof capture === 'string' && capture.includes('video/x-raw')
  if (isRaw) {
    C.VideoCodecList.hidden = false
    const options = Array.isArray(C.VideoCodecList.options) ? C.VideoCodecList.options : []
    if (options.length > 0) {
      const index = options.length > 1 ? 1 : 0
      C.MenuParams.video_codec = options[index].value
      C.VideoCodecList.refresh()
    }
  } else {
    C.MenuParams.video_codec = 'none'
    C.VideoCodecList.hidden = true
    C.VideoCodecList.refresh()
  }

  C.ConnectionButton.disabled = P.checkRequiredKeys()
}

C.VideoCaptureList.on('change', () => {
  updateVideoCodecVisibility()
})

export function initVideoList() {
  initCodecList()
  initOptionList()
  updateVideoCodecVisibility()
}
