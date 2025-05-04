'use strict'

WebSocket.prototype.originalSend = WebSocket.prototype.send
WebSocket.prototype.send = function (type, ws1Id, ws2Id, data) {
  this.originalSend(JSON.stringify({ type, ws1Id, ws2Id, ...data }))
}

if (!window.RTCRtpScriptTransform) {
  const stream = new ReadableStream()
  window.postMessage(stream, '*', [stream])
}

import * as Menu from './menu.js'
import * as Common from './common.js'
import * as Permission from './permission.js'

import StreamHandler, { setupSenderTransform, setupReceiverTransform } from './stream-handler.js'

import CanvasCapture, { SupportedVideoAudioMediaType, SupportedVideoMediaType } from './canvas-capture.js'
import { AbsoluteOrientationSensor } from './thirdparty/motion-sensors.js'

import createConnectionMonitoring from './monitoring.js'

import TelemetryOverlay from './telemetry-overlay.js'
import AudioStreamVisualizer from './audio-visualizer.js'

import SearchRadar from './search-radar.js'

const Constants = {
  ChannelType: Object.freeze({
    IMU: 'IMU',
    GNSS: 'GNSS',
    AHRS: 'AHRS',
    CMD: 'CMD',
  }),
  Command: Object.freeze({
    HANG_UP: 0,
    PING: 1,
    PONG: 2,
    SEND_KEYFRAME_REQUEST: 3,
    SPS_PPS: 4,
    ERROR: 9,
  }),
  ICE_SERVERS: [{ urls: 'stun:stun.l.google.com:19302' }],
  SENDER: Object.freeze({
    SESSION_ID_ISSUANCE: 0,
    MEDIA_DEVICE_LIST_REQUEST: 1,
    MEDIA_STREAM_START: 2,
    SDP_ANSWER: 3,
    ICE: 4,
    SYSTEM_ERROR: 9,
  }),
  RECEIVER: Object.freeze({
    SESSION_ID_ISSUANCE: 0,
    CHANGE_SENDER_ENTRIES: 1,
    MEDIA_DEVICE_LIST_RESPONSE: 2,
    SDP_OFFER: 3,
    ICE: 4,
    SYSTEM_ERROR: 9,
  }),
}

const State = {
  Menu,
  SupportedVideoAudioMediaType,
  SupportedVideoMediaType,
  StreamHandler,

  // Sender state
  ws1: null,
  pc1: null,
  dc1IMU: null,
  dc1GNSS: null,
  dc1CMD: null,
  sensor: null,
  dummyIntervalId: null,
  gpsWatchId: null,

  // Receiver state
  ws2: null,
  pc2: null,
  dc2CMD: null,

  // Common state
  isRecording: false,
  stream: null,
  StreamRecorder: null, // CanvasCapture
  recordingSourceData: null,
  // recordingOverlayData: [],
  overlayCanvasCapture: null,

  // Video processing
  videoCodec: null,
  videoText: '',
  audioCodec: null,
  audioText: '',

  // Network monitoring
  candidatePairReport: null,
  inboundRtpVideoReport: null,
  inboundRtpAudioReport: null,
  networkInfo: { DataChannel: {} },
  localCandidateAddress: {},
  remoteCandidateAddress: {},

  // UI state
  audioVisualizer: null,
  inboundAreaChart: null,
  outboundAreaChart: null,
  reportAggregateId: null,

  //
  searchRadar: new SearchRadar(SearchRadarCanvas),

  //
  telemetryData: {},
  headUpDisplay: TelemetryOverlay(HeadUpDisplay),
  headUpDisplayNoneRetina: TelemetryOverlay(HeadUpDisplayNoneRetina),
}

// -----------------------------------
// SenderManager
// -----------------------------------
const SenderManager = {
  handleWebSocketMessage: async function (message) {
    //-------------------------------------
    // PC1 WebSocket Message
    //-------------------------------------
    const { type, ws1Id, ws2Id } = message

    try {
      switch (type) {
        case Constants.SENDER.SESSION_ID_ISSUANCE:
          State.ws1.id = message.sessionId
          SenderId.textContent = `Your Sender Id: ${message.sessionId}`
          break

        case Constants.SENDER.MEDIA_DEVICE_LIST_REQUEST:
          const devices = await Common.getMediaDevicesList()
          const codecs = Common.getCapabilityCodecs()
          State.ws1.send(
            Constants.RECEIVER.MEDIA_DEVICE_LIST_RESPONSE, //
            ws1Id,
            ws2Id,
            { devices, codecs },
          )
          break

        case Constants.SENDER.MEDIA_STREAM_START:
          State.stream = await navigator.mediaDevices.getUserMedia(message.constraints)
          this.initSenderPeerConnection()
          State.stream.getTracks().forEach((track) => {
            const sender = State.pc1.addTrack(track, State.stream)
            // if (track.kind === 'video') {
            //   setupSenderTransform(sender)
            // }
          })
          Common.setSenderPriority(State.pc1)

          const offer = await State.pc1.createOffer()
          await State.pc1.setLocalDescription(offer)
          State.ws1.pair = ws2Id
          State.ws1.send(
            Constants.RECEIVER.SDP_OFFER, //
            ws1Id,
            ws2Id,
            { offer },
          )
          StreamHandler.postMessage({ type: 'offer', offer })
          StreamHandler.onmessage = ({ data }) => {
            if (data.type === 'sps/pps') {
              const { description, colorSpace } = data
              let cmd = Constants.Command.SPS_PPS
              if (State.dc1CMD) State.dc1CMD.send(JSON.stringify({ cmd, description, colorSpace }))
            }
          }

          window.addEventListener('unload', () => {
            this.hangUp()
          })
          break

        case Constants.SENDER.SDP_ANSWER:
          await State.pc1.setRemoteDescription(new RTCSessionDescription(message.answer))
          break

        case Constants.SENDER.ICE:
          await State.pc1.addIceCandidate(message.candidate)
          break

        case Constants.SENDER.SYSTEM_ERROR:
        default:
          console.error('Unknown sender message type:', type)
      }
    } catch (error) {
      console.error('Error handling sender message:', error)
    }
  },

  initSenderPeerConnection: function () {
    State.pc1 = new RTCPeerConnection({ iceServers: Constants.ICE_SERVERS })

    State.pc1.oniceconnectionstatechange = () => {
      if (State.pc1.iceConnectionState === 'connected') {
        // Connection established
      } else if (State.pc1.iceConnectionState === 'disconnected' || State.pc1.iceConnectionState === 'failed') {
        console.warn('pc1 disconnected')
        this.hangUp()
      }
    }

    State.pc1.onicecandidate = ({ candidate }) => {
      if (candidate && Common.isIPv4(candidate.address)) {
        State.ws1.send(
          Constants.RECEIVER.ICE, //
          State.ws1.id,
          State.ws1.pair,
          { candidate },
        )
      }
    }

    // IMU DataChannel
    State.dc1IMU = State.pc1.createDataChannel(Constants.ChannelType.IMU, {
      ordered: false,
      reliable: false,
      maxPacketLifeTime: 50,
    })

    State.dc1IMU.onopen = () => {
      State.sensor = new AbsoluteOrientationSensor({ frequency: 60, coordinateSystem: 'world' })

      const onreading = () => {
        const quaternion = new Float32Array([
          State.sensor.quaternion[0], //
          State.sensor.quaternion[1],
          State.sensor.quaternion[2],
          State.sensor.quaternion[3],
        ])
        State.dc1IMU.send(quaternion.buffer)
      }

      State.sensor.onreading = () => {
        Permission.removePermissionButton()
        State.sensor.onreading = onreading
        onreading()
      }

      State.sensor.onerror = ({ error }) => {
        if (error.name === 'NotReadableError') {
          console.error('Sensor is not available.')
          State.dummyIntervalId = setInterval(() => {
            const ε = 0.1
            const q = new Float32Array([
              //
              ε * (Math.random() - 0.5),
              ε * (Math.random() - 0.5),
              ε * (Math.random() - 0.5),
              1 + ε * (Math.random() - 0.5),
            ])
            if (State.dc1IMU && State.dc1IMU.readyState == 'open') {
              State.dc1IMU.send(q.buffer)
            }
          }, 1000 / 15) // 15 Hz
        }
      }

      State.sensor.start()
    }

    // GNSS DataChannel
    State.dc1GNSS = State.pc1.createDataChannel(Constants.ChannelType.GNSS, {
      ordered: true,
      reliable: true,
      maxRetransmits: 3,
    })

    State.dc1GNSS.onopen = () => {
      const successCallback = (position) => {
        const { accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed } = position.coords
        State.dc1GNSS.send(JSON.stringify({ accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed }))
      }

      const errorCallback = (err) => console.error('GNSS Error:', err.code, err.message)
      const options = {
        enableHighAccuracy: true, //
        maximumAge: 1000,
        timeout: 5000,
      }
      State.gpsWatchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options)
    }

    // CMD DataChannel
    State.dc1CMD = State.pc1.createDataChannel(Constants.ChannelType.CMD, {
      ordered: true,
      reliable: true,
    })

    State.dc1CMD.onopen = () => {
      State.dc1CMD.onmessage = ({ data }) => {
        //-------------------------------------
        // PC1 Command Channel Message
        //-------------------------------------
        const message = JSON.parse(data)
        switch (message.cmd) {
          case Constants.Command.HANG_UP:
            this.hangUp()
            break

          case Constants.Command.PING:
            let cmd = Constants.Command.PONG
            if (State.dc1CMD) State.dc1CMD.send(JSON.stringify({ cmd }))
            break

          case Constants.Command.SEND_KEYFRAME_REQUEST:
            Common.sendKeyFrameRequest(State.pc1)
            break

          default:
            console.error('Unknown command:', message.cmd)
        }
      }
    }
  },

  hangUp: function () {
    if (State.dummyIntervalId) clearInterval(State.dummyIntervalId)
    if (State.sensor) State.sensor.stop()
    if (State.gpsWatchId !== null) navigator.geolocation.clearWatch(State.gpsWatchId)
    if (State.stream) State.stream.getTracks().forEach((track) => track.stop())
    let cmd = Constants.Command.HANG_UP
    if (State.dc1CMD) State.dc1CMD.send(JSON.stringify({ cmd }))
    State.pc1.close()
  },
}

// -----------------------------------
// resizer
// -----------------------------------
const resizer = function (width, height) {
  // console.log('before:', { width, height })

  // let windowWidth = window.innerWidth
  // let windowHeight = window.innerHeight
  // console.log('window:', { windowWidth, windowHeight })

  // const aspectRatio = width / height
  // console.log('aspectRatio:', aspectRatio)

  // if (width > windowWidth) {
  //   width = windowWidth
  //   height = width / aspectRatio
  //   if (height > windowHeight) {
  //     height = windowHeight
  //     width = height * aspectRatio
  //   }
  // }

  // console.log('after:', { width, height })

  let devicePixelRatio = window.devicePixelRatio || 1

  RemoteVideoContainer.style.width = `${width}px`
  RemoteVideoContainer.style.height = `${height}px`

  RemoteVideo.style.width = `${width}px`
  RemoteVideo.style.height = `${height}px`

  // console.log('resizer:', { width, height })
  State.headUpDisplay.resizeCanvas(width, height, devicePixelRatio)
  // State.headUpDisplayNoneRetina.resizeCanvas(width, height, 1)

  State.audioVisualizer.resizeCanvas(width / 5, height / 10, State.audioText, devicePixelRatio)

  State.inboundAreaChart.resize(width / 3.5, height / 10)
  State.outboundAreaChart.resize(width / 3.5, height / 10)

  State.searchRadar.resizeCanvas(Math.min(width, height) * (4 / 10), devicePixelRatio)
}

document.addEventListener('fullscreenchange', () => {
  resizer(window.innerWidth, window.innerHeight)
})

document.addEventListener('webkitfullscreenchange', () => {
  resizer(window.innerWidth, window.innerHeight)
})

const ConnectionMonitoring = createConnectionMonitoring(State, Constants)

// -----------------------------------
// ReceiverManager
// -----------------------------------
const ReceiverManager = {
  handleWebSocketMessage: async function (message) {
    //-------------------------------------
    // PC2 WebSocket Message
    //-------------------------------------
    const { type, ws1Id, ws2Id } = message

    try {
      switch (type) {
        case Constants.RECEIVER.SESSION_ID_ISSUANCE:
          State.ws2.id = message.sessionId
        case Constants.RECEIVER.CHANGE_SENDER_ENTRIES:
          Menu.SetSenderEntryList(message.senders)
          break

        case Constants.RECEIVER.MEDIA_DEVICE_LIST_RESPONSE:
          Menu.SetSenderDeviceList(message.devices)
          let receiverCodecs = Common.getCapabilityCodecs('Receiver')
          const negotiationCodecs = Common.getAllowNegotiationCodecs(message.codecs, receiverCodecs)
          Menu.SetSenderCodecList(negotiationCodecs)
          break

        case Constants.RECEIVER.SDP_OFFER:
          await State.pc2.setRemoteDescription(new RTCSessionDescription(message.offer))

          Common.preferredCodecs(State.pc2.getTransceivers(), Menu.connectionParams)

          const answer = await State.pc2.createAnswer()
          await State.pc2.setLocalDescription(answer)
          State.ws2.send(
            Constants.SENDER.SDP_ANSWER, //
            ws1Id,
            ws2Id,
            { answer },
          )
          State.ws2.pair = ws1Id

          if (!RemoteVideo.__offscreenTransferred) {
            let offscreen = RemoteVideo.transferControlToOffscreen()
            RemoteVideo.__offscreenTransferred = true
            let devicePixelRatio = window.devicePixelRatio || 1
            StreamHandler.postMessage({ type: 'RemoteVideo', offscreen, answer, devicePixelRatio }, [offscreen])
          }

          StreamHandler.onmessage = ({ data }) => {
            if (data.type == 'keyFrame') {
              //
              let { width, height } = data.metadata
              State.headUpDisplayNoneRetina.resizeCanvas(width, height, 1)
              resizer(width, height)
              State.isRecording = data.isRecording
              //
            } else if (data.type == 'recordingData') {
              //
              console.log('recordingSourceData:', data.blob)
              State.recordingSourceData = data.blob
              //
            }
          }

          window.addEventListener('unload', () => {
            State.Menu.hangUp(State, Constants)
          })

          break

        case Constants.RECEIVER.ICE:
          const ice = Common.toICE(message.candidate.candidate)
          if (ice) State.remoteCandidateAddress[ice.port] = ice.ip
          await State.pc2.addIceCandidate(message.candidate)
          break

        case Constants.RECEIVER.SYSTEM_ERROR:
        default:
          console.error('Unknown receiver message type:', type)
      }
    } catch (error) {
      console.error('Error handling receiver message:', error)
    }
  },

  initReceiverPeerConnection: function () {
    State.pc2 = new RTCPeerConnection({ iceServers: Constants.ICE_SERVERS })

    State.pc2.oniceconnectionstatechange = () => {
      if (State.pc2.iceConnectionState === 'connected') {
        ConnectionMonitoring.startConnectionMonitoring()
      } else if (State.pc2.iceConnectionState === 'disconnected' || State.pc2.iceConnectionState === 'failed') {
        console.warn('pc2 disconnected')
        State.Menu.hangUp(State, Constants)
      }
    }

    State.pc2.onicecandidate = ({ candidate }) => {
      if (candidate) {
        const ice = Common.toICE(candidate.candidate)
        if (ice) State.localCandidateAddress[ice.port] = ice.ip
        if (Common.isIPv4(candidate.address)) {
          State.ws2.send(
            Constants.SENDER.ICE, //
            State.ws2.pair,
            State.ws2.id,
            { candidate },
          )
        }
      }
    }

    State.pc2.ontrack = ({ receiver, streams, track }) => {
      if (track.kind === 'video') {
        setupReceiverTransform(receiver)
      } else if (track.kind === 'audio') {
        setupReceiverTransform(receiver)
        State.audioVisualizer = AudioStreamVisualizer(AudioVisualizer, streams[0])
        State.audioVisualizer.start()
      }
      if (State.stream != streams[0]) {
        State.stream = streams[0]
      }
    }

    function calculateEulerAngles(sensorQuaternion) {
      // Get quaternion from sensor
      let [x, y, z, w] = sensorQuaternion

      // Convert sensor quaternion to match the original three.js conversion
      x = -x
      ;[y, z] = [z, y]

      // Normalize the quaternion
      const norm = Math.sqrt(x * x + y * y + z * z + w * w)
      x /= norm
      y /= norm
      z /= norm
      w /= norm

      // Calculate Euler angles (YXZ order)
      // Y: yaw, X: pitch, Z: roll
      // Formula from: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Quaternion_to_Euler_angles_conversion
      // Euler angles are in radians
      let pitch, yaw, roll

      // Yaw (Y axis)
      let t0 = 2 * (w * y + x * z)
      let t1 = 1 - 2 * (y * y + x * x)
      yaw = Math.atan2(t0, t1)

      // Pitch (X axis)
      let t2 = 2 * (w * x - y * z)
      t2 = t2 > 1 ? 1 : t2
      t2 = t2 < -1 ? -1 : t2
      pitch = Math.asin(t2)

      // Roll (Z axis)
      let t3 = 2 * (w * z + y * x)
      let t4 = 1 - 2 * (x * x + z * z)
      roll = Math.atan2(t3, t4)

      // Convert radians to degrees
      pitch = (pitch * 180) / Math.PI
      yaw = (yaw * 180) / Math.PI
      roll = (roll * 180) / Math.PI

      // Normalize heading to [0, 360)
      let heading = (yaw + 360) % 360

      return { roll, pitch, yaw, heading }
    }

    async function updateHeadUpDisplay() {
      State.headUpDisplay.update(State.telemetryData, State.videoText)
    }

    async function updateHeadUpDisplayNoneRetina() {
      State.headUpDisplayNoneRetina.update(State.telemetryData, State.videoText)
    }

    function emptyTrim(coords) {
      return Object.fromEntries(Object.entries(coords).filter(([_, v]) => v !== null))
    }

    State.pc2.ondatachannel = ({ channel }) => {
      switch (channel.label) {
        case Constants.ChannelType.IMU:
          channel.onmessage = ({ data }) => {
            let result = calculateEulerAngles(new Float32Array(data))
            State.telemetryData = { ...State.telemetryData, ...result }
            updateHeadUpDisplay()
            if (State.isRecording) {
              updateHeadUpDisplayNoneRetina()
            }
            const maxKeyLength = Math.max(...Object.keys(State.telemetryData).map((key) => key.length))
            TelemetryDataDisplay.innerHTML = Object.entries(State.telemetryData)
              .map(([key, value]) => {
                const paddedKey = key.padStart(maxKeyLength, ' ')
                return `${paddedKey}: ${value}`
              })
              .join('\n')
          }
          break

        case Constants.ChannelType.GNSS:
          channel.onmessage = ({ data }) => {
            State.telemetryData = {
              ...State.telemetryData,
              ...emptyTrim(JSON.parse(data)),
            }
          }
          break

        case Constants.ChannelType.CMD:
          channel.onmessage = ({ data }) => {
            //-------------------------------------
            // PC2 Command Channel Message
            //-------------------------------------
            const message = JSON.parse(data)
            switch (message.cmd) {
              case Constants.Command.HANG_UP:
                State.Menu.hangUp(State, Constants)
                break

              case Constants.Command.PONG:
                State.ping = (window.performance.now() - State.pingStartTime).toFixed(2)
                break

              case Constants.Command.SPS_PPS:
                let { description, colorSpace } = message
                StreamHandler.postMessage({ type: 'sps/pps', description, colorSpace })
                break

              default:
                console.error('Unknown command:', message.cmd)
            }
          }
          State.dc2CMD = channel
          break
      }
    }
  },
}

// -----------------------------------
// SignalingManager
// -----------------------------------
const PORT = 8443 // on local
// const PORT = 8080 // in the　local docker
export const SignalingManager = {
  init: function (protocol) {
    const isLocalhost = Common.isLocalHost()
    const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = isLocalhost ? `${location.hostname}:${PORT}` : location.host
    const SIGNALING_ENDPOINT = `${wsProto}//${wsHost}/signaling`
    protocol = protocol ?? 'r'
    protocol == 'r' && Menu.InitializeUI(Constants, State, ReceiverManager)
    if (protocol === 's') {
      document.title = 'Sender'
      ReceiverContainer.style.display = 'none'
      this.initSenderWebSocket(SIGNALING_ENDPOINT)
    } else if (protocol === 'r') {
      document.title = 'Receiver'
      SenderContainer.style.display = 'none'
      this.initReceiverWebSocket(SIGNALING_ENDPOINT)
    } else {
      ReceiverContainer.style.display = 'none'
      SenderContainer.style.display = 'none'
    }
  },

  initSenderWebSocket: function (SIGNALING_ENDPOINT) {
    if (Permission.isIOS()) {
      Permission.showPermissionButton()
    }

    State.ws1 = new WebSocket(SIGNALING_ENDPOINT, 'sender')
    State.ws1.onopen = () => {
      State.ws1.onmessage = ({ data }) => {
        SenderManager.handleWebSocketMessage(JSON.parse(data))
      }
      State.ws1.onclose = () => {
        console.warn('ws1 disconnected')
      }
    }
  },

  initReceiverWebSocket: function (SIGNALING_ENDPOINT) {
    State.ws2 = new WebSocket(SIGNALING_ENDPOINT, 'receiver')
    State.ws2.onopen = () => {
      State.ws2.onmessage = ({ data }) => {
        ReceiverManager.handleWebSocketMessage(JSON.parse(data))
      }
      State.ws2.onclose = () => {
        console.warn('ws2 disconnected')
      }
    }
  },
}

if (navigator.getBattery) {
  navigator.getBattery().then((battery) => {
    const batteryChange = () => {
      let { charging, chargingTime, dischargingTime, level } = battery
      State.telemetryData = {
        ...State.telemetryData,
        ...{ charging, chargingTime, dischargingTime, level },
      }
    }
    battery.addEventListener('chargingchange', () => batteryChange())
    battery.addEventListener('levelchange', () => batteryChange())
    battery.addEventListener('chargingtimechange', () => batteryChange())
    battery.addEventListener('dischargingtimechange', () => batteryChange())
    batteryChange()
  })
}
