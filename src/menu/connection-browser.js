import Alpine from 'alpinejs'

export function buildPayload() {
  const store = Alpine.store('menu')
  const { video_device, video_codec, video_capture, audio_device, audio_codec } = store

  const video = JSON.parse(video_capture)
  video.deviceId = { ideal: video_device }

  return {
    constraints: {
      video,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        deviceId: { ideal: audio_device },
      },
    },
    video_codec,
    audio_codec,
  }
}
