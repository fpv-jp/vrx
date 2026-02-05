import Alpine from 'alpinejs'
import { bindMediaLists } from './media-utils.js'
import { checkRequiredKeys } from './parameter-utils.js'
import * as B from './video-browser.js'
import * as G from './video-gstreamer.js'

const { initCodecList, initOptionList } = bindMediaLists({
  type: 'video',
  getCodecListBySource(source, codecs) {
    if (source === 'browser') return B.getCodecList(codecs.video)
    if (source === 'gstreamer') return G.getCodecList(codecs.video)
    return []
  },
  getOptionListBySource(source) {
    if (source === 'browser') return B.getCaptureList()
    if (source === 'gstreamer') return G.getCaptureList()
    return []
  },
  showSubMenuBySource(source) {
    if (source === 'browser') B.showSubMenu()
    else if (source === 'gstreamer') G.showSubMenu()
  },
  shouldShowSubMenuByState() {
    const store = Alpine.store('menu')
    return store.message?.source === 'gstreamer' || store.video_codec !== 'none'
  },
})

window.addEventListener('menu:video-capture-change', () => {
  const store = Alpine.store('menu')
  const capture = store.video_capture
  const isRaw = typeof capture === 'string' && capture.includes('video/x-raw')

  if (isRaw) {
    store.video_codec_hidden = false
    if (store.video_codec_options.length > 0) {
      store.video_codec = store.video_codec_options[store.video_codec_options.length > 1 ? 1 : 0].value
    }
  } else {
    store.video_codec = 'none'
    store.video_codec_hidden = true
  }

  store.connectionDisabled = checkRequiredKeys()
})

export function initVideoList() {
  initCodecList()
  initOptionList()
}
