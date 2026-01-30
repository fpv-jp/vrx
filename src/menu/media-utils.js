import * as C from './component'
import * as P from './parameter-utils.js'
import { setListOptions } from './list-utils.js'

export function bindMediaLists({
  type,
  deviceList,
  codecList,
  optionList,
  getCodecListBySource,
  getOptionListBySource,
  showSubMenuBySource,
  shouldShowSubMenuByState,
}) {
  const codecKey = `${type}_codec`
  const shouldShowSubMenu =
    typeof shouldShowSubMenuByState === 'function'
      ? shouldShowSubMenuByState
      : () => C.MenuParams[codecKey] !== 'none'

  function onChange() {
    if (shouldShowSubMenu()) {
      showSubMenuBySource(C.MenuParams.message.source)
    }
  }

  deviceList.on('change', () => {
    if (C.MenuParams.sender !== 'none') {
      initOptionList()
    }
  })

  optionList.on('change', () => {
    C.ConnectionButton.disabled = P.checkRequiredKeys()
  })

  codecList.on('change', () => {
    onChange()
  })

  optionList.on('change', () => {
    onChange()
  })

  function initCodecList() {
    const { source, codecs } = C.MenuParams.message
    const options = getCodecListBySource(source, codecs)
    setListOptions(codecList, options)
  }

  function initOptionList() {
    const options = getOptionListBySource(C.MenuParams.message.source)
    setListOptions(optionList, options)
    onChange()
  }

  return { initCodecList, initOptionList }
}
