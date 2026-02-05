import Alpine from 'alpinejs'

export function setListOptions(valueKey, optionsKey, options, { defaultIndex = 0 } = {}) {
  const store = Alpine.store('menu')
  const items = Array.isArray(options) && options.length > 0 ? options : []
  store[optionsKey] = items
  if (items.length > 0) {
    store[valueKey] = items[Math.min(defaultIndex, items.length - 1)].value
  }
}
