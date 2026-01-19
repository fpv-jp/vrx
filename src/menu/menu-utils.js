import * as C from './component'

export function resetLists(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.options = [C.Placeholder]
      C.MenuParams[list.key] = 'none'
      if (typeof list.refresh === 'function') {
        list.refresh()
      }
    }
  })
}

export function hideComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.hidden = true
    }
  })
}

export function showComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.hidden = false
    }
  })
}

export function disabledComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.disabled = true
    }
  })
}

export function enableComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.disabled = false
    }
  })
}

export function contractionComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.expanded = false
    }
  })
}

export function expandComponent(...lists) {
  lists.forEach((list) => {
    if (list) {
      list.expanded = true
    }
  })
}
