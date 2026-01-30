import * as C from './component'
import { setListOptions } from './list-utils.js'

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

      // Test sources
      const videoTestSrc = {
        name: 'videotestsrc (pattern=ball)',
        klass: 'Source/Video',
        caps: ['video/x-raw,format={I420,NV12,YUY2},width={320,640,1280,1920},height={240,480,720,1080},framerate={15/1,30/1,60/1}'],
        launch: 'videotestsrc pattern=ball is-live=true ! ...',
      }
      const audioTestSrc = {
        name: 'audiotestsrc (wave=ticks)',
        klass: 'Source/Audio',
        caps: ['audio/x-raw,format={S16LE},rate={8000,16000,44100,48000},channels={1,2}'],
        launch: 'audiotestsrc wave=ticks is-live=true ! ...',
      }
      videoOptions.push({ text: videoTestSrc.name, value: JSON.stringify(videoTestSrc) })
      audioOptions.push({ text: audioTestSrc.name, value: JSON.stringify(audioTestSrc) })

      break
  }

  // Video
  setListOptions(C.VideoCameraList, videoOptions)

  // Audio
  setListOptions(C.AudioMicrophoneList, audioOptions)
}
