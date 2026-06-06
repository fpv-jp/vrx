import Alpine from 'alpinejs'

const parsePart = (s) => parseInt(s.split('/')[0])

function parseOptions(rawValue) {
  return rawValue
    .slice(1, -1)
    .split(',')
    .map((s) => s.trim())
    .map((opt) => ({ text: opt, value: opt, num: parsePart(opt) }))
    .sort((a, b) => {
      if (isNaN(a.num) && isNaN(b.num)) return 0
      if (isNaN(a.num)) return 1
      if (isNaN(b.num)) return -1
      return b.num - a.num
    })
}

function parseSlider(rawValue) {
  const parts = rawValue.slice(1, -1).split(',').map((s) => s.trim())
  return {
    min: parsePart(parts[0]),
    max: parsePart(parts[1]),
    step: parts.length >= 3 ? parseInt(parts[2]) : 1,
  }
}

export function setListParameterOption(key, rawValue) {
  const store = Alpine.store('menu')
  const options = parseOptions(rawValue)
  store[key + '_options'] = options
  store[key + '_mode'] = 'list'
  if (options.length > 0) store[key] = options[0].value
}

export function setSliderParameterOption(key, rawValue) {
  const store = Alpine.store('menu')
  const { min, max, step } = parseSlider(rawValue)
  store[key + '_min'] = min
  store[key + '_max'] = max
  store[key + '_step'] = step
  store[key + '_mode'] = 'slider'
}

export function setTextOrNumberField(key, value) {
  const num = parseInt(value)
  setMenuOptionText(key, isNaN(num) ? value : num)
}

export function setMenuOptionText(key, value) {
  const store = Alpine.store('menu')
  store[key] = value
  store[key + '_mode'] = 'text'
}

function getStoreParam(storeKey, paramKey) {
  const match = Alpine.store('menu')[storeKey].match(new RegExp(`${paramKey}=({[^}]+}|\\[[^\\]]+\\]|[^,\\s]+)`))
  return match ? match[1].trim() : null
}

export const getVideoCaptureParameter = (k) => getStoreParam('video_capture', k)
export const getAudioSamplingParameter = (k) => getStoreParam('audio_sampling', k)

export function checkRequiredKeys() {
  const store = Alpine.store('menu')
  const msg = store.message
  let keys = ['video_capture', 'audio_sampling']
  if (msg?.source === 'gstreamer') {
    keys.push('video_device', 'audio_device', 'audio_codec')
    if (typeof store.video_capture === 'string' && store.video_capture.includes('video/x-raw')) {
      keys.push('video_codec')
    }
  }
  return !keys.every((k) => store[k] !== 'none' && store[k] !== '' && store[k] !== 0)
}
