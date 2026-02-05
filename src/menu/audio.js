import { bindMediaLists } from './media-utils.js'
import * as B from './audio-browser.js'
import * as G from './audio-gstreamer.js'

const { initCodecList, initOptionList } = bindMediaLists({
  type: 'audio',
  getCodecListBySource(source, codecs) {
    if (source === 'browser') return B.getCodecList(codecs.audio)
    if (source === 'gstreamer') return G.getCodecList(codecs.audio)
    return []
  },
  getOptionListBySource(source) {
    if (source === 'browser') return B.getSamplingList()
    if (source === 'gstreamer') return G.getSamplingList()
    return []
  },
  showSubMenuBySource(source) {
    if (source === 'browser') B.showSubMenu()
    else if (source === 'gstreamer') G.showSubMenu()
  },
})

export function initAudioList() {
  initCodecList()
  initOptionList()
}
