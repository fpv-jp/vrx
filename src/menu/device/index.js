import * as C from '../component'

// Device List --------------------------------
export function initDeviceList() {
  let videoOptions = []
  let audioOptions = []

  const { source, devices } = C.MenuParams.message

  switch (source) {
    case 'browser':
      let videoIndex = 1
      let audioIndex = 1
      devices.forEach(({ deviceId, kind, label }) => {
        let text = label
        let value = deviceId
        switch (kind) {
          case 'videoinput':
            text = text || `Camera ${videoIndex++}`
            videoOptions.push({ text, value })
            break
          case 'audioinput':
            text = text || `Microphone ${audioIndex++}`
            audioOptions.push({ text, value })
            break
        }
      })
      break

    case 'gstreamer':
      devices.forEach((device) => {
        let text = device.name
        let value = JSON.stringify(device)
        switch (device.klass) {
          case 'Video/Source':
          case 'Source/Video':
            videoOptions.push({ text, value })
            break
          case 'Audio/Source':
          case 'Source/Audio':
            audioOptions.push({ text, value })
            break
        }
      })
      break
  }

  // Video
  videoOptions.unshift(C.Placeholder)
  C.VideoDeviceList.options = videoOptions
  C.MenuParams.video_device = videoOptions[videoOptions.length === 1 ? 0 : 1].value
  C.VideoDeviceList.refresh()

  // Audio
  audioOptions.unshift(C.Placeholder)
  C.AudioDeviceList.options = audioOptions
  C.MenuParams.audio_device = audioOptions[audioOptions.length === 1 ? 0 : 1].value
  C.AudioDeviceList.refresh()
}
