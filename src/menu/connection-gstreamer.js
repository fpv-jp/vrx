import Alpine from 'alpinejs'
import * as U from './pipeline/pipeline-utils.js'
import * as Utils from '../utils.js'

import * as APPLE_MAC from './pipeline/APPLE_MAC'
import * as LINUX_X86 from './pipeline/LINUX_X86'
import * as RASPBERRY_PI_4 from './pipeline/RASPBERRY_PI_4'
import * as RASPBERRY_PI_5 from './pipeline/RASPBERRY_PI_5'
import * as JETSON_NANO_2GB from './pipeline/JETSON_NANO_2GB'
import * as JETSON_ORIN_NANO_SUPER from './pipeline/JETSON_ORIN_NANO_SUPER'
import * as RADXA_ROCK_5 from './pipeline/RADXA_ROCK_5'

export async function buildPayload() {
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

  const network_interface = store.network_interface
  const flight_controller = store.flight_controller
  const video_width = parseInt(store.video_width) || store.video_width
  const video_height = parseInt(store.video_height) || store.video_height
  const video_framerate = parseInt(store.video_framerate) || store.video_framerate

  const P = { ...store, video_width, video_height, video_framerate }

  let video_pipeline = (await builder.buildVidePipeline(P)).replaceAll('\n', '')
  let audio_pipeline = builder.buildAudioPipeline(P).replaceAll('\n', '')
  let video_profile = await Utils.checkDecodingInfo(video_width, video_height, video_framerate)

  const { video_priority, audio_priority, video_payload_type, audio_payload_type } = U

  return {
    network_interface,
    flight_controller,
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
