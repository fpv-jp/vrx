import * as C from './component'

// checkRequiredKeys -----------------------------------------------
export function checkRequiredKeys() {
  let requiredKeys = ['video_capture', 'audio_sampling']
  if (C.MenuParams?.message?.source === 'gstreamer') {
    requiredKeys.push('video_device', 'video_codec', 'audio_device', 'audio_codec')
  }
  const isReady = requiredKeys.every((key) => C.MenuParams[key] !== 'none')
  return !isReady
}

// getVideoCaptureParameter -----------------------------------------------
export function getVideoCaptureParameter(key) {
  const regex = new RegExp(`${key}=({[^}]+}|\\[[^\\]]+\\]|[^,\\s]+)`)
  const match = C.MenuParams.video_capture.match(regex)
  if (!match) return null
  return match[1].trim()
}

// getAudioSamplingParameter -----------------------------------------------
export function getAudioSamplingParameter(key) {
  const regex = new RegExp(`${key}=({[^}]+}|\\[[^\\]]+\\]|[^,\\s]+)`)
  const match = C.MenuParams.audio_sampling.match(regex)
  if (!match) return null
  return match[1].trim()
}

const parsePart = (s) => parseInt(s.split('/')[0])

// setListParameterOption -----------------------------------------------
export function setListParameterOption(list, value) {
  const options = value
    .slice(1, -1)
    .split(',')
    .map((s) => s.trim())

  list.hidden = false
  list.options = options
    .map((option) => {
      const num = parsePart(option)
      return { text: option, value: option, num }
    })
    .sort((a, b) => {
      const aNaN = isNaN(a.num)
      const bNaN = isNaN(b.num)
      if (aNaN && bNaN) return 0
      if (aNaN) return 1
      if (bNaN) return -1
      return b.num - a.num
    })

  list.refresh()
}

// setSliderParameterOption -----------------------------------------------
export function setSliderParameterOption(slider, value) {
  const parts = value
    .slice(1, -1)
    .split(',')
    .map((s) => s.trim())

  const min = parsePart(parts[0])
  const max = parsePart(parts[1])
  const step = parts.length >= 3 ? parseInt(parts[2]) : undefined
  const sliderOption = { min, max, ...(step !== undefined ? { step } : {}) }

  slider.hidden = false
  Object.assign(slider, sliderOption)
  slider.refresh()
}

// setTextOrNumberField -----------------------------------------------
export function setTextOrNumberField(field, value) {
  const num = parseInt(value)
  setMenuOptionText(field, isNaN(num) ? value : num)
}

// setMenuOptionText -----------------------------------------------
export function setMenuOptionText(text, value) {
  C.MenuParams[text.key] = value
  text.hidden = false
  text.refresh()
}
