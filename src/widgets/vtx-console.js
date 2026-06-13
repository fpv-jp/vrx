const MAX_LINES = 200

let el = null

function getEl() {
  if (!el) el = document.getElementById('VtxConsole')
  return el
}

/**
 * VtxConsole にタイムスタンプ付きメッセージを追加する
 * @param {string} message
 */
export function log(message) {
  const console = getEl()
  if (!console) return

  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const line = document.createElement('div')
  line.className = 'vtx-log-line'
  line.innerHTML = `<span class="vtx-log-time">${time}</span> ${message}`
  console.appendChild(line)

  // 最大行数を超えたら古い行を削除
  while (console.children.length > MAX_LINES) {
    console.removeChild(console.firstChild)
  }

  console.scrollTop = console.scrollHeight
}

/** VtxConsole を表示する */
export function show() {
  getEl().style.visibility = 'visible'
}

/** VtxConsole を非表示にする */
export function hide() {
  getEl().style.visibility = 'hidden'
}

/** VtxConsole をクリアする */
export function clear() {
  const console = getEl()
  if (console) console.innerHTML = ''
}
