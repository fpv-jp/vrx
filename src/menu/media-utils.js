import Alpine from 'alpinejs'
import { checkRequiredKeys } from './parameter-utils.js'
import { setListOptions } from './list-utils.js'

export function bindMediaLists({ type, getCodecListBySource, getOptionListBySource, showSubMenuBySource, shouldShowSubMenuByState }) {
  const isVideo = type === 'video'
  const deviceKey = isVideo ? 'video_device' : 'audio_device'
  const codecKey = isVideo ? 'video_codec' : 'audio_codec'
  const codecOptionsKey = isVideo ? 'video_codec_options' : 'audio_codec_options'
  const optionKey = isVideo ? 'video_capture' : 'audio_sampling'
  const optionOptionsKey = isVideo ? 'video_capture_options' : 'audio_sampling_options'

  const deviceEvent = isVideo ? 'menu:video-device-change' : 'menu:audio-device-change'
  const codecEvent = isVideo ? 'menu:video-codec-change' : 'menu:audio-codec-change'
  const optionEvent = isVideo ? 'menu:video-capture-change' : 'menu:audio-sampling-change'

  const shouldShow = typeof shouldShowSubMenuByState === 'function'
    ? shouldShowSubMenuByState
    : () => Alpine.store('menu')[codecKey] !== 'none'

  function onChange() {
    const store = Alpine.store('menu')
    if (shouldShow()) showSubMenuBySource(store.message.source)
    store.connectionDisabled = checkRequiredKeys()
  }

  window.addEventListener(deviceEvent, () => {
    if (Alpine.store('menu').sender !== 'none') initOptionList()
  })

  window.addEventListener(optionEvent, onChange)
  window.addEventListener(codecEvent, onChange)

  function initCodecList() {
    const { source, codecs } = Alpine.store('menu').message
    setListOptions(codecKey, codecOptionsKey, getCodecListBySource(source, codecs))
  }

  function initOptionList() {
    const store = Alpine.store('menu')
    setListOptions(optionKey, optionOptionsKey, getOptionListBySource(store.message.source))
    onChange()
  }

  return { initCodecList, initOptionList }
}
