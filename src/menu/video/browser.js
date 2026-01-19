import * as C from '../component'
import * as U from '../menu-utils'
import * as P from '../parameter-utils.js'

// Browser Video Codec --------------------------------
export function getCodecList(codecs) {
  // let receiverCodecs = Common.getCapabilityCodecs('Receiver')
  // console.log(receiverCodecs)
  // const negotiationCodecs = Common.getAllowNegotiationCodecs(message, receiverCodecs)

  let options = []
  for (let codec of codecs) {
    let text = codec.sdpFmtpLine ? `${codec.mimeType} (${codec.sdpFmtpLine})` : codec.mimeType
    let value = JSON.stringify(codec)
    options.push({ text, value })
  }

  return options
}

// Browser Video Capture --------------------------------
export function getCaptureList() {
  let constraintList = [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 960, height: 540 },
    { width: 640, height: 480 },
  ]
  return constraintList.map(({ width, height }) => ({
    text: `ideal ${width}x${height} fps 30`,
    value: JSON.stringify({
      frameRate: { ideal: 30, max: 60 },
      width: { ideal: width },
      height: { ideal: height },
    }),
  }))
}

//  --------------------------------
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
}
