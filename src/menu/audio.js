import * as C from './component'
import { bindMediaLists } from './media-utils.js'
import * as B from './audio-browser.js'
import * as G from './audio-gstreamer.js'

const { initCodecList, initOptionList } = bindMediaLists({
  type: 'audio',
  deviceList: C.AudioMicrophoneList,
  codecList: C.AudioCodecList,
  optionList: C.AudioSamplingList,
  getCodecListBySource(source, codecs) {
    switch (source) {
      case 'browser':
        return B.getCodecList(codecs.audio)
      case 'gstreamer':
        return G.getCodecList(codecs.audio)
    }
    return []
  },
  getOptionListBySource(source) {
    switch (source) {
      case 'browser':
        return B.getSamplingList()
      case 'gstreamer':
        return G.getSamplingList()
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
})

export function initAudioList() {
  initCodecList()
  initOptionList()
}
