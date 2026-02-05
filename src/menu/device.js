import Alpine from 'alpinejs'
import { setListOptions } from './utils/list-utils.js'

/**
 * メッセージのデバイスリストから映像・音声デバイスのオプションを構築して Alpine ストアにセットする
 * browser ソースでは deviceId / label を使い、gstreamer ソースでは klass でフィルタする
 */
export function initDeviceList() {
  const { source, devices } = Alpine.store('menu').message
  const videoOptions = []
  const audioOptions = []

  if (source === 'browser') {
    let videoIndex = 1
    let audioIndex = 1
    devices.forEach(({ deviceId, kind, label }) => {
      switch (kind) {
        case 'videoinput':
          videoOptions.push({ text: label || `Camera ${videoIndex++}`, value: deviceId })
          break
        case 'audioinput':
          audioOptions.push({ text: label || `Microphone ${audioIndex++}`, value: deviceId })
          break
      }
    })
  } else if (source === 'gstreamer') {
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

    devices.forEach((device) => {
      const opt = { text: device.name, value: JSON.stringify(device) }
      switch (device.klass) {
        case 'Video/Source':
        case 'Source/Video':
          videoOptions.push(opt)
          break
        case 'Audio/Source':
        case 'Source/Audio':
          audioOptions.push(opt)
          break
      }
    })
    videoOptions.push({ text: videoTestSrc.name, value: JSON.stringify(videoTestSrc) })
    audioOptions.push({ text: audioTestSrc.name, value: JSON.stringify(audioTestSrc) })
  }

  setListOptions('video_device', 'video_camera_options', videoOptions)
  setListOptions('audio_device', 'audio_microphone_options', audioOptions)
}
