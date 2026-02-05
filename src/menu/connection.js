import Alpine from 'alpinejs'
import Constants from '../constants.js'
import ReceiverManager, { ReceiverState } from '../receiver'
import * as Widgets from '../widgets'
import * as Menu from './index.js'
import * as Utils from '../utils.js'
import * as PipelineUtils from './pipeline/pipeline-utils.js'

import * as APPLE_MAC from './pipeline/APPLE_MAC'
import * as LINUX_X86 from './pipeline/LINUX_X86'
import * as RASPBERRY_PI_4 from './pipeline/RASPBERRY_PI_4'
import * as RASPBERRY_PI_5 from './pipeline/RASPBERRY_PI_5'
import * as JETSON_NANO_2GB from './pipeline/JETSON_NANO_2GB'
import * as JETSON_ORIN_NANO_SUPER from './pipeline/JETSON_ORIN_NANO_SUPER'
import * as RADXA_ROCK_5 from './pipeline/RADXA_ROCK_5'

const SENDER = Constants.SENDER
const Command = Constants.Command

/**
 * ブラウザ送信用のペイロードを構築する
 * getUserMedia の constraints と選択コーデックをまとめて返す
 * @returns {{ constraints: MediaStreamConstraints, video_codec: string, audio_codec: string }}
 */
function buildBrowserPayload() {
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

/**
 * GStreamer 送信用のペイロードを構築する
 * platform に応じたパイプラインビルダーを選択し、映像・音声パイプライン文字列を生成する
 * @returns {Promise<object>}
 */
async function buildGstreamerPayload() {
  const store = Alpine.store('menu')
  const { platform } = store.message

  const builders = {
    APPLE_MAC,
    LINUX_X86,
    RASPBERRY_PI_4B: RASPBERRY_PI_4,
    RASPBERRY_PI_4CM: RASPBERRY_PI_4,
    RASPBERRY_PI_5,
    JETSON_NANO_2GB,
    JETSON_ORIN_NANO_SUPER,
    RADXA_ROCK_5B: RADXA_ROCK_5,
    RADXA_ROCK_5T: RADXA_ROCK_5,
  }
  const builder = builders[platform]

  const video_width = parseInt(store.video_width) || store.video_width
  const video_height = parseInt(store.video_height) || store.video_height
  const video_framerate = parseInt(store.video_framerate) || store.video_framerate

  const P = { ...store, video_width, video_height, video_framerate }

  const video_pipeline = (await builder.buildVidePipeline(P)).replaceAll('\n', '')
  const audio_pipeline = builder.buildAudioPipeline(P).replaceAll('\n', '')
  const video_profile = await Utils.checkDecodingInfo(video_width, video_height, video_framerate)

  const { video_priority, audio_priority, video_payload_type, audio_payload_type } = PipelineUtils

  return {
    network_interface: store.network_interface,
    flight_controller: store.flight_controller,
    video_pipeline,
    audio_pipeline,
    video_priority,
    audio_priority,
    video_payload_type,
    audio_payload_type: JSON.parse(store.audio_codec).name === 'mulawenc' ? 0 : audio_payload_type,
    video_profile,
    platform,
  }
}

window.addEventListener('menu:connection-click', async () => {
  const store = Alpine.store('menu')

  if (store.connectionText === '🎦 Start') {
    let payload
    switch (store.message.source) {
      case 'browser':   payload = buildBrowserPayload(); break
      case 'gstreamer': payload = await buildGstreamerPayload(); break
    }
    console.log('payload:', payload)
    ReceiverManager.initReceiverPeerConnection()
    Utils.sendSignalingMessage(ReceiverState.ws, SENDER.MEDIA_STREAM_START, payload)
  } else {
    const { cmd } = ReceiverState
    if (cmd && cmd.readyState === 'open') {
      cmd.send(JSON.stringify({ cmd: Command.HANG_UP }))
    }
    Widgets.destroyReceiver()
    Menu.initialize()
    store.sender = 'none'
  }
})
