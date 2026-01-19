import * as C from '../component'
import * as U from '../menu-utils'
import * as P from '../parameter-utils.js'

// getCodecList -----------------------------------------------
export function getCodecList(codecs) {
  let options = []

  for (let codec of codecs) {
    let text = codec.name
    let value = JSON.stringify(codec)
    options.push({ text, value })
  }

  let order = ['264', '265', 'vp8', 'vp9', 'av1']

  return options.sort((a, b) => {
    let aIndex = order.findIndex((key) => a.text.includes(key))
    let bIndex = order.findIndex((key) => b.text.includes(key))
    return aIndex - bIndex
  })
}

// getCaptureList -----------------------------------------------
export function getCaptureList() {
  const { video_device } = C.MenuParams
  if (video_device === 'none') return []

  let options = []
  let device = JSON.parse(video_device)
  device.caps.forEach((cap) => {
    options.push({ text: cap, value: cap })
  })

  let order = ['video/x-h264', 'video/x-h265', 'video/x-raw,', 'video/x-raw(']

  options = options.sort((a, b) => {
    let aIndex = order.findIndex((key) => a.text.includes(key))
    let bIndex = order.findIndex((key) => b.text.includes(key))
    return aIndex - bIndex
  })

  return options
}

// showSubMenu -----------------------------------------------
export function showSubMenu() {
  U.hideComponent(
    C.VideoMimeType,
    C.VideoFormat,
    C.VideoFormatList,
    C.VideoDRMFormat,
    C.VideoDRMFormatList,
    C.VideoWidth,
    C.VideoWidthList,
    C.VideoWidthSlider,
    C.VideoHeight,
    C.VideoHeightList,
    C.VideoHeightSlider,
    C.VideoFramerate,
    C.VideoFramerateList,
    C.VideoFramerateSlider,
  )


  const video_mimetype = C.MenuParams.video_capture.match(/video\/([^\s,]+)/)?.[1]
  P.setMenuOptionText(C.VideoMimeType, video_mimetype)

  const format = P.getVideoCaptureParameter('format')
  if (format != null) {
    if (format.startsWith('{')) {
      P.setListParameterOption(C.VideoFormatList, format)
    } else {
      P.setTextOrNumberField(C.VideoFormat, format)
    }
  }

  const drm_format = P.getVideoCaptureParameter('drm-format')
  if (drm_format != null) {
    if (drm_format.startsWith('{')) {
      P.setListParameterOption(C.VideoDRMFormatList, drm_format)
    } else {
      P.setTextOrNumberField(C.VideoDRMFormat, drm_format)
    }
  }

  const width = P.getVideoCaptureParameter('width')
  if (width != null) {
    if (width.startsWith('{')) {
      P.setListParameterOption(C.VideoWidthList, width)
    } else if (width.startsWith('[')) {
      P.setSliderParameterOption(C.VideoWidthSlider, width)
      C.MenuParams.video_width = 1280 // 1280×720
      C.VideoWidthSlider.refresh()
    } else {
      P.setTextOrNumberField(C.VideoWidth, width)
    }
  }

  const height = P.getVideoCaptureParameter('height')
  if (height != null) {
    if (height.startsWith('{')) {
      P.setListParameterOption(C.VideoHeightList, height)
    } else if (height.startsWith('[')) {
      P.setSliderParameterOption(C.VideoHeightSlider, height)
      C.MenuParams.video_height = 720 // 1280×720
      C.VideoHeightSlider.refresh()
    } else {
      P.setTextOrNumberField(C.VideoHeight, height)
    }
  }

  const framerate = P.getVideoCaptureParameter('framerate')
  if (framerate != null) {
    if (framerate.startsWith('{')) {
      P.setListParameterOption(C.VideoFramerateList, framerate)
    } else if (framerate.startsWith('[')) {
      P.setSliderParameterOption(C.VideoFramerateSlider, framerate)
      C.MenuParams.video_framerate = 30
      C.VideoFramerateSlider.refresh()
    } else {
      P.setTextOrNumberField(C.VideoFramerate, framerate)
    }
  }
}
