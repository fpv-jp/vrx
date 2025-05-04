import { Pane } from 'tweakpane'
import Swal from 'sweetalert2'
import 'animate.css'
import CanvasCapture from './canvas-capture.js'

// Connection Menu
// -----------------------------------------------
export const ConnectionMenu = new Pane({
  title: 'Connection',
  container: TweakpaneMenu,
})

export const connectionParams = {
  sender: 'none',
  videodevice: 'none',
  videocodec: 'none',
  audiodevice: 'none',
  audiocodec: 'none',
  grayscale: false,
}

// Recorder Menu
// -----------------------------------------------
export const RecorderMenu = new Pane({
  title: 'Recorder',
  container: TweakpaneMenu,
  expanded: false,
})
RecorderMenu.hidden = true

export const captureParams = {
  streamCodec: 'none',
  overlayCodec: 'none',
}

function changeConnection() {
  const isReady =
    connectionParams.sender !== 'none' && //
    connectionParams.videodevice !== 'none' &&
    connectionParams.videocodec !== 'none' &&
    connectionParams.videodevice !== 'none' &&
    connectionParams.audiocodec !== 'none'
  StartHangupButton.disabled = !isReady
  // FullScreenButton.disabled = !isReady
}

export const defaultOption = { '-- please select --': 'none' }
export const Placeholder = { text: '-- please select --', value: 'none' }

export const SenderEntryList = ConnectionMenu.addBinding(connectionParams, 'sender', {
  label: 'Sender',
  options: defaultOption,
}).on('change', () => changeConnection())

export const SenderVideoDeviceList = ConnectionMenu.addBinding(connectionParams, 'videodevice', {
  label: 'Video Device',
  options: defaultOption,
}).on('change', () => changeConnection())

export const SenderVideoCodecList = ConnectionMenu.addBinding(connectionParams, 'videocodec', {
  label: 'Video Codec',
  options: defaultOption,
}).on('change', () => changeConnection())

export const SenderAudioDeviceList = ConnectionMenu.addBinding(connectionParams, 'audiodevice', {
  label: 'Audio Device',
  options: defaultOption,
}).on('change', () => changeConnection())

export const SenderAudioCodecList = ConnectionMenu.addBinding(connectionParams, 'audiocodec', {
  label: 'Audio Codec',
  options: defaultOption,
}).on('change', () => changeConnection())

const GrayscaleCheck = ConnectionMenu.addBinding(connectionParams, 'grayscale', {
  label: 'Grayscale',
})

GrayscaleCheck.on('change', (ev) => {
  if (ev.value) {
    RemoteVideoContainer.style.filter = 'grayscale(1)'
    RemoteVideoContainer.style.webkitFilter = 'grayscale(1)'
  } else {
    RemoteVideoContainer.style.filter = ''
    RemoteVideoContainer.style.webkitFilter = ''
  }
})

export const ConnectionText = {
  Start: '🎦 Start',
  Hangup: '⛔ Stop',
}

export const StartHangupButton = ConnectionMenu.addButton({ title: ConnectionText.Start })

export const WebrtcReportButton = ConnectionMenu.addButton({ title: 'Webrtc Report' })
WebrtcReportButton.disabled = true

export const SearchRadarButton = ConnectionMenu.addButton({ title: 'Search Radar' })
SearchRadarButton.disabled = true

export const FullScreenButton = ConnectionMenu.addButton({ title: 'Fullscreen' })
FullScreenButton.disabled = true

changeConnection()

export function SetSenderEntryList(senders) {
  SenderEntryList.options = [
    Placeholder, //
    ...senders.map((id) => ({ text: id, value: id })),
  ]
}

export function SetSenderDeviceList(devices) {
  const videoOptions = [Placeholder]
  const audioOptions = [Placeholder]
  let videoIndex = 1
  let audioIndex = 1
  devices.forEach(({ deviceId, kind, label }) => {
    if (kind === 'videoinput') {
      videoOptions.push({ text: label || `Camera ${videoIndex++}`, value: deviceId })
    } else if (kind === 'audioinput') {
      audioOptions.push({ text: label || `Microphone ${audioIndex++}`, value: deviceId })
    }
  })
  SenderVideoDeviceList.options = videoOptions
  SenderAudioDeviceList.options = audioOptions
  if (videoOptions.length > 1) {
    connectionParams.videodevice = videoOptions[1].value
    SenderVideoDeviceList.refresh()
  }
  if (audioOptions.length > 1) {
    connectionParams.audiodevice = audioOptions[1].value
    SenderAudioDeviceList.refresh()
  }
}

export function SetSenderCodecList(codecs) {
  const videoOptions = [Placeholder]
  const audioOptions = [Placeholder]
  for (let value of codecs.video) {
    let text = value.sdpFmtpLine ? `${value.mimeType} ${value.sdpFmtpLine}` : value.mimeType
    videoOptions.push({ text, value: JSON.stringify(value) })
  }
  for (let value of codecs.audio) {
    let text = value.sdpFmtpLine ? `${value.mimeType} ${value.sdpFmtpLine}` : value.mimeType
    audioOptions.push({ text, value: JSON.stringify(value) })
  }
  SenderVideoCodecList.options = videoOptions
  SenderAudioCodecList.options = audioOptions
  if (videoOptions.length > 1) {
    connectionParams.videocodec = videoOptions[1].value
    SenderVideoCodecList.refresh()
  }
  if (audioOptions.length > 1) {
    connectionParams.audiocodec = audioOptions[1].value
    SenderAudioCodecList.refresh()
  }
}

// captureParams -----------------------------------------------

export const RecorderText = {
  Record: '⏺️ Start Recording',
  Stop: '⏹️ Stop Recording',
  Play: '▶️ Play',
  Pause: '⏸️ Pause',
  Close: '❌ Close',
  Download: '⏬️ Download',
}

export const RecorderStreamMediaCodec = RecorderMenu.addBinding(captureParams, 'streamCodec', {
  label: 'Stream codec',
  options: defaultOption,
})

export const RecorderOverlayMediaCodec = RecorderMenu.addBinding(captureParams, 'overlayCodec', {
  label: 'Overlay codec',
  options: defaultOption,
})

export const RecorderStart = RecorderMenu.addButton({ title: RecorderText.Record })

export const RecorderReplay = RecorderMenu.addButton({ title: RecorderText.Play })
RecorderReplay.disabled = true

export const RecorderClose = RecorderMenu.addButton({ title: RecorderText.Close })
RecorderClose.disabled = true

export const RecorderDownload = RecorderMenu.addButton({ title: RecorderText.Download })
RecorderDownload.disabled = true

// InitializeUI
// -----------------------------------------------
export function InitializeUI(Constants, State, ReceiverManager) {
  // SenderEntryList -----------------------------------------------

  SenderEntryList.on('change', () => {
    if (connectionParams.sender !== 'none') {
      State.ws2.send(
        Constants.SENDER.MEDIA_DEVICE_LIST_REQUEST, //
        connectionParams.sender,
        State.ws2.id,
      )
    }
  })

  // StartHangupButton -----------------------------------------------
  StartHangupButton.on('click', () => {
    //
    if (StartHangupButton.title == ConnectionText.Start) {
      const constraints = {
        video: {
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          deviceId: { ideal: connectionParams.videodevice },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          deviceId: { ideal: connectionParams.audiodevice },
        },
      }

      ReceiverManager.initReceiverPeerConnection()

      State.ws2.send(
        Constants.SENDER.MEDIA_STREAM_START, //
        connectionParams.sender,
        State.ws2.id,
        { constraints },
      )

      let mimeType = JSON.parse(connectionParams.videocodec).mimeType
      if (mimeType === 'video/VP8') {
        RecorderStreamMediaCodec.options = State.SupportedVideoAudioMediaType(['video/webm'], ['vp8'], ['opus'])
      }
      if (mimeType === 'video/VP9') {
        RecorderStreamMediaCodec.options = State.SupportedVideoAudioMediaType(['video/webm'], ['vp9'], ['opus'])
      }
      if (mimeType === 'video/AV1') {
        RecorderStreamMediaCodec.options = State.SupportedVideoAudioMediaType(['video/webm'], ['av1'], ['opus'])
      }
      if (mimeType === 'video/H264' || mimeType === 'video/H265') {
        RecorderStreamMediaCodec.options = State.SupportedVideoAudioMediaType()
      }
      captureParams.streamCodec = RecorderStreamMediaCodec.options[0].value
      RecorderStreamMediaCodec.refresh()

      RecorderOverlayMediaCodec.options = State.SupportedVideoMediaType(['video/webm'], ['vp9', 'vp8', 'av1'])
      captureParams.overlayCodec = RecorderOverlayMediaCodec.options[0].value
      RecorderOverlayMediaCodec.refresh()

      ConnectionMenu.expanded = false
      RecorderMenu.hidden = false

      SenderEntryList.disabled = true
      SenderVideoDeviceList.disabled = true
      SenderVideoCodecList.disabled = true
      SenderAudioDeviceList.disabled = true
      SenderAudioCodecList.disabled = true

      StartHangupButton.title = ConnectionText.Hangup
    } else if (StartHangupButton.title == ConnectionText.Hangup) {
      hangUp(State, Constants)
    }
  })

  // WebrtcReportButton -----------------------------------------------

  WebrtcReportButton.on('click', () => {
    SearchRadarCanvas.style.visibility = 'hidden'
    WebrtcReport.style.visibility = WebrtcReport.style.visibility === 'visible' ? 'hidden' : 'visible'
  })

  // SearchRadarButton -----------------------------------------------

  SearchRadarButton.on('click', () => {
    WebrtcReport.style.visibility = 'hidden'
    SearchRadarCanvas.style.visibility = SearchRadarCanvas.style.visibility === 'visible' ? 'hidden' : 'visible'
    if (SearchRadarCanvas.style.visibility === 'visible') {
      State.searchRadar.start()
    } else if (SearchRadarCanvas.style.visibility === 'hidden') {
      State.searchRadar.stop()
    }
  })

  // FullScreenButton -----------------------------------------------

  FullScreenButton.on('click', () => {
    const isFullscreen =
      document.fullscreenElement || //
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    isFullscreen ? document.exitFullscreen() : ReceiverContainer.requestFullscreen()
    FullScreenButton.title = isFullscreen ? 'Fullscreen' : 'Exit Fullscreen'
  })

  // RecorderStart -----------------------------------------------

  RecorderStart.on('click', async () => {
    if (RecorderStart.title === RecorderText.Record) {
      //
      if (State.overlayCanvasCapture) {
        let result = await confirm()
        if (result.isConfirmed) {
          //
        } else if (result.isDismissed) {
          return
        }
      }

      State.StreamHandler.postMessage({ type: 'StartRecording' })
      if (
        State.videoCodec.mimeType === 'video/H264' || //
        State.videoCodec.mimeType === 'video/H265'
      ) {
        State.StreamRecorder = CanvasCapture()
        State.StreamRecorder.start(
          State.stream, //
          captureParams.streamCodec,
          8_000_000,
          null,
        )
      } else {
        let cmd = Constants.Command.SEND_KEYFRAME_REQUEST
        State.dc2CMD.send(JSON.stringify({ cmd }))
      }

      State.overlayCanvasCapture = CanvasCapture()
      State.overlayCanvasCapture.start(
        HeadUpDisplayNoneRetina.captureStream(60), //
        captureParams.overlayCodec,
        15_000_000,
        'keep',
      )

      SourceRecorderVideo.src = null
      OverlayRecorderVideo.src = null
      VideoReplayContainer.style.display = 'none'

      RecorderReplay.disabled = true
      RecorderDownload.disabled = true
      RecorderClose.disabled = true
      RecorderReplay.title = RecorderText.Play
      RecorderStart.title = RecorderText.Stop
      //
    } else if ((RecorderStart.title = RecorderText.Stop)) {
      //
      State.StreamHandler.postMessage({ type: 'StopRecording' })
      if (State.StreamRecorder) State.StreamRecorder.stop()
      State.overlayCanvasCapture.stop()
      State.isRecording = false

      RecorderReplay.disabled = false
      RecorderDownload.disabled = false
      // RecorderClose.disabled = false

      RecorderStart.title = RecorderText.Record
      //
    }
  })

  // RecorderReplay -----------------------------------------------

  RecorderReplay.on('click', async () => {
    if (RecorderReplay.title === RecorderText.Play) {
      //
      VideoReplayContainer.style.display = 'flex'

      if (State.StreamRecorder) {
        SourceRecorderVideo.src = window.URL.createObjectURL(State.StreamRecorder.blob())
        SourceRecorderVideo.play()
      } else {
        SourceRecorderVideo.src = window.URL.createObjectURL(State.recordingSourceData)
        SourceRecorderVideo.play()
      }

      OverlayRecorderVideo.src = window.URL.createObjectURL(State.overlayCanvasCapture.blob())
      OverlayRecorderVideo.play()

      RecorderClose.disabled = false

      RecorderReplay.title = RecorderText.Pause
      //
    } else if (RecorderReplay.title === RecorderText.Pause) {
      //
      SourceRecorderVideo.pause()
      OverlayRecorderVideo.pause()
      RecorderReplay.title = RecorderText.Play
      //
    }
  })

  // RecorderDownload -----------------------------------------------

  RecorderDownload.on('click', async () => {
    if (State.StreamRecorder) {
      _download(State.StreamRecorder.blob(), 'source')
    } else {
      _download(State.recordingSourceData, 'source')
    }
    _download(State.overlayCanvasCapture.blob(), 'overlay')
  })

  // RecorderClose -----------------------------------------------

  RecorderClose.on('click', () => {
    SourceRecorderVideo.pause()
    OverlayRecorderVideo.pause()
    VideoReplayContainer.style.display = 'none'
    RecorderClose.disabled = true
    RecorderReplay.title = RecorderText.Play
  })
}

export function hangUp(State, Constants) {
  if (State.dc2CMD) {
    let cmd = Constants.Command.HANG_UP
    State.dc2CMD.send(JSON.stringify({ cmd }))
  }
  if (State.pc2) State.pc2.close()
  if (State.reportAggregateId) clearInterval(State.reportAggregateId)

  for (const child of RemoteVideoContainer.children) {
    const { id, tagName } = child
    // <canvas id="RemoteVideo"></canvas>
    if (id === 'RemoteVideo') {
      State.StreamHandler.postMessage({ type: 'clear' })
    }
    // <canvas id="HeadUpDisplay"></canvas>
    if (id === 'HeadUpDisplay') {
      State.headUpDisplay.clear()
    }
    // <canvas id="HeadUpDisplayNoneRetina"></canvas>
    if (id === 'HeadUpDisplayNoneRetina') {
      State.headUpDisplayNoneRetina.clear()
    }
    // <img id="Helion10" src="src/Helion10-O4P-6.jpg" />
    if (id === 'Helion10') {
      child.style.visibility = 'hidden'
    }
    // <canvas id="AudioVisualizer"></canvas>
    if (id === 'AudioVisualizer') {
      State.audioVisualizer.clear()
    }
    // <div id="NetworkMonitoring"></div>
    if (id === 'NetworkMonitoring') {
      State.inboundAreaChart.stop()
      State.outboundAreaChart.stop()
      while (child.firstChild) {
        child.removeChild(child.firstChild)
      }
    }
    // <pre id="WebrtcReport"></pre>
    if (id === 'WebrtcReport') {
      WebrtcReport.style.visibility = 'hidden'
      WebrtcReport.innerHTML = ''
    }
    // <canvas id="SearchRadarCanvas"></canvas>
    if (id === 'SearchRadarCanvas') {
      SearchRadarCanvas.style.visibility = 'hidden'
      State.searchRadar.stop()
    }
    // <pre id="TelemetryDataDisplay" class="telemetry-data-gisplay"></pre>
    if (id === 'TelemetryDataDisplay') {
      TelemetryDataDisplay.innerHTML = ''
    }
    // <pre id="NetworkStatus"></pre>
    if (id === 'NetworkStatus') {
      NetworkStatus.textContent = ''
    }
    // <div id="VideoReplayContainer">
    //   <video id="SourceRecorderVideo" controls playsinline loop></video>
    //   <video id="OverlayRecorderVideo" controls playsinline loop></video>
    // </div>
    if (id === 'VideoReplayContainer') {
      SourceRecorderVideo.src = null
      OverlayRecorderVideo.src = null
      VideoReplayContainer.style.display = 'none'
    }
  }

  SenderEntryList.disabled = false
  SenderVideoDeviceList.disabled = false
  SenderVideoCodecList.disabled = false
  SenderAudioDeviceList.disabled = false
  SenderAudioCodecList.disabled = false

  WebrtcReportButton.disabled = true
  SearchRadarButton.disabled = true
  FullScreenButton.disabled = true

  ConnectionMenu.expanded = true
  RecorderMenu.hidden = true

  connectionParams.sender = SenderEntryList.options[0].value
  SenderEntryList.refresh()

  connectionParams.videodevice = 'none'
  connectionParams.videocodec = 'none'
  connectionParams.audiodevice = 'none'
  connectionParams.audiocodec = 'none'

  initList(SenderVideoDeviceList)
  initList(SenderVideoCodecList)
  initList(SenderAudioDeviceList)
  initList(SenderAudioCodecList)

  StartHangupButton.title = ConnectionText.Start
}

function initList(List) {
  List.options = [Placeholder]
  List.refresh()
}

function _download(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url

  let ext = blob.type.startsWith('video/mp4') //
    ? 'mp4'
    : blob.type.startsWith('video/webm')
      ? 'webm'
      : blob.type.startsWith('video/x-matroska')
        ? 'mkv'
        : '.bin'

  a.download = `${fileName}.${ext}`
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

async function confirm() {
  return await Swal.fire({
    title: 'Previous Recording Data',
    text: 'This will overwrite the previous recording. Do you want to proceed?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    showClass: {
      popup: `
    animate__animated
    animate__fadeInUp
    animate__faster
  `,
    },
    hideClass: {
      popup: `
    animate__animated
    animate__fadeOutDown
    animate__faster
  `,
    },
  })
}
