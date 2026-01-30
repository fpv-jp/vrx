import * as C from './component'

export function setListOptions(list, options, { placeholder = C.Placeholder, defaultIndex = 1 } = {}) {
  if (!list) return

  const items = []
  if (placeholder) items.push(placeholder)
  if (Array.isArray(options) && options.length > 0) items.push(...options)

  list.options = items

  if (items.length > 0 && list.key) {
    const safeIndex = Math.min(defaultIndex, items.length - 1)
    C.MenuParams[list.key] = items[safeIndex].value
  }

  if (typeof list.refresh === 'function') {
    list.refresh()
  }
}
