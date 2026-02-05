import Alpine from 'alpinejs'

/**
 * Alpine.js ストアのリスト値とオプションを一括セットする
 * @param {string} valueKey - 現在選択値のストアキー
 * @param {string} optionsKey - オプション配列のストアキー
 * @param {{ value: string, text: string }[]} options
 * @param {{ defaultIndex?: number }} [opts]
 */
export function setListOptions(valueKey, optionsKey, options, { defaultIndex = 0 } = {}) {
  const store = Alpine.store('menu')
  const items = Array.isArray(options) && options.length > 0 ? options : []
  store[optionsKey] = items
  if (items.length > 0) {
    store[valueKey] = items[Math.min(defaultIndex, items.length - 1)].value
  }
}
