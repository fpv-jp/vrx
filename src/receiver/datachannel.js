import Alpine from 'alpinejs'
import Constants from '../constants.js'
import { ReceiverState } from './index.js'
import { MonitorState } from '../stats/index.js'
import * as Utils from '../utils.js'

let telemetryData = {}

const ChannelLabel = Constants.ChannelLabel
const Command = Constants.Command
const { BROWSER, GSTREAMER } = Constants.Source

/**
 * DataChannel イベントを source に応じて振り分ける
 * @param {RTCDataChannel} channel
 */
export default async function OpenVtxDataChannel(channel) {
  const source = Alpine.store('menu').message?.source
  switch (source) {
    case BROWSER:   openBrowserDataChannel(channel);   break
    case GSTREAMER: openGstreamerDataChannel(channel); break
  }
}

// ---- 共通 ----

/**
 * CMD チャンネル（PING/PONG, HANG_UP）— browser・gstreamer 共通
 * @param {RTCDataChannel} channel
 */
function openCmdChannel(channel) {
  channel.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    switch (message.cmd) {
      case Command.HANG_UP:
        break

      case Command.PONG:
        MonitorState.ping = (window.performance.now() - MonitorState.pingStartTime).toFixed(2)
        break

      default:
        console.error('Unknown command:', message.cmd)
    }
  }
  ReceiverState.cmd = channel
}

// ---- VTX (browser) ----

/**
 * スマートフォン・タブレットの VTX（browser）から開かれる DataChannel を処理する
 * CMD / IMU / GNSS / BAT を担当する
 * @param {RTCDataChannel} channel
 */
function openBrowserDataChannel(channel) {
  switch (channel.label) {
    case ChannelLabel.CMD:
      openCmdChannel(channel)
      break

    case ChannelLabel.IMU:
      channel.onmessage = ({ data }) => {
        const quaternion = new Float32Array(data)

        // センサーから取得したクォータニオン
        let [x, y, z, w] = quaternion

        // 座標系補正
        x = -x
        ;[y, z] = [z, y]

        const result = calculateEulerAngles(x, y, z, w)

        telemetryData.videoText = ReceiverState.videoText
        telemetryData.telemetryInfo = MonitorState.telemetryInfo
        telemetryData.dataChannel = MonitorState.dataChannelInfo
        telemetryData = { ...telemetryData, ...result }
        ReceiverState.headUpDisplay.update(telemetryData)
      }
      break

    case ChannelLabel.GNSS:
      channel.onmessage = ({ data }) => {
        telemetryData.gps = Object.fromEntries(Object.entries(JSON.parse(data)).filter(([_, v]) => v !== null))
      }
      break

    case ChannelLabel.BAT:
      channel.onmessage = ({ data }) => {
        telemetryData.battery = Object.fromEntries(Object.entries(JSON.parse(data)).filter(([_, v]) => v !== null))
      }
      break
  }
}

// ---- VTX (gstreamer) ----

/**
 * SBC の VTX（gstreamer）から開かれる DataChannel を処理する
 * CMD / MSP_* / WPA_SUPPLICANT を担当する
 * @param {RTCDataChannel} channel
 */
function openGstreamerDataChannel(channel) {
  switch (channel.label) {
    case ChannelLabel.CMD:
      openCmdChannel(channel)
      break

    case ChannelLabel.MSP_RAW_IMU:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        // Accelerometer (3 x int16) - scaled by 2048
        const acc = [
          view.getInt16(offset, true) / 2048,
          view.getInt16(offset + 2, true) / 2048,
          view.getInt16(offset + 4, true) / 2048,
        ]
        offset += 6

        // Gyroscope (3 x int16) - scaled by (4 / 16.4)
        const gyro = [
          view.getInt16(offset, true) * (4 / 16.4),
          view.getInt16(offset + 2, true) * (4 / 16.4),
          view.getInt16(offset + 4, true) * (4 / 16.4),
        ]
        offset += 6

        // Magnetometer (3 x int16) - no scaling
        const mag = [
          view.getInt16(offset, true),
          view.getInt16(offset + 2, true),
          view.getInt16(offset + 4, true),
        ]
        // telemetryData = { ...telemetryData, acc, gyro, mag }
      }
      break

    case ChannelLabel.MSP_ATTITUDE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        const roll  = view.getInt16(offset, true) / 10.0
        const pitch = view.getInt16(offset + 2, true) / 10.0
        const yaw   = view.getInt16(offset + 4, true) // heading

        telemetryData.videoText = ReceiverState.videoText
        telemetryData.telemetryInfo = MonitorState.telemetryInfo
        telemetryData.dataChannel = MonitorState.dataChannelInfo
        telemetryData = { ...telemetryData, roll, pitch, yaw }
        ReceiverState.headUpDisplay.MSP(telemetryData)
      }
      break

    case ChannelLabel.MSP_RAW_GPS:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        const gps = {
          fix:           view.getUint8(offset++),
          numSat:        view.getUint8(offset++),
          latitude:      view.getInt32(offset, true),
          longitude:     view.getInt32(offset + 4, true),
          alt:           view.getUint16(offset + 8, true),
          speed:         view.getUint16(offset + 10, true),
          ground_course: view.getUint16(offset + 12, true),
        }
        offset += 14

        // Optional: positionalDop (API v1.46+)
        if (data.byteLength > offset) {
          gps.positionalDop = view.getUint16(offset, true)
        }

        telemetryData.gps = gps
      }
      break

    case ChannelLabel.MSP_COMP_GPS:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0
        telemetryData.compGps = {
          distanceToHome:  view.getUint16(offset, true),
          directionToHome: view.getUint16(offset + 2, true),
          update:          view.getUint8(offset + 4),
        }
      }
      break

    case ChannelLabel.MSP_ALTITUDE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.altitude = parseFloat((view.getInt32(0, true) / 100.0).toFixed(2))
      }
      break

    case ChannelLabel.MSP_SONAR:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.sonar = view.getInt32(0, true)
      }
      break

    case ChannelLabel.MSP_ANALOG:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        telemetryData.analog = {
          voltage:    view.getUint8(offset++) / 10.0,
          mAhdrawn:   view.getUint16(offset, true),
          rssi:       view.getUint16(offset + 2, true),
          amperage:   view.getInt16(offset + 4, true) / 100,
          voltageNew: view.getUint16(offset + 6, true) / 100,
          timestamp:  performance.now(),
        }
        console.log('MSP_ANALOG:', telemetryData.analog)
      }
      break

    case ChannelLabel.MSP_BATTERY_STATE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0
        telemetryData.battery = {
          cellCount:    view.getUint8(offset++),
          capacity:     view.getUint16(offset, true),
          voltageOld:   view.getUint8(offset + 2) / 10.0,
          mAhDrawn:     view.getUint16(offset + 3, true),
          amperage:     view.getUint16(offset + 5, true) / 100,
          batteryState: view.getUint8(offset + 7),
        }
        console.log('MSP_BATTERY_STATE:', telemetryData.battery)
      }
      break

    case ChannelLabel.WPA_SUPPLICANT:
      channel.onmessage = ({ data }) => {
        let wifi = JSON.parse(data)
        wifi.status = { ...wifi.status, ...Utils.frequencyToWifiChannel(wifi.status.freq) }
        MonitorState.wifi = wifi
      }
      break
  }
}

// ---- ユーティリティ ----

/**
 * クォータニオンを YXZ 順のオイラー角（度）に変換する
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 * @returns {{ roll: number, pitch: number, yaw: number, heading: number }}
 */
function calculateEulerAngles(x, y, z, w) {
  const norm = Math.sqrt(x * x + y * y + z * z + w * w)
  x /= norm; y /= norm; z /= norm; w /= norm

  // Yaw (Y axis)
  const t0 = 2 * (w * y + x * z)
  const t1 = 1 - 2 * (y * y + x * x)
  let yaw = Math.atan2(t0, t1)

  // Pitch (X axis)
  let t2 = 2 * (w * x - y * z)
  t2 = Math.max(-1, Math.min(1, t2))
  let pitch = Math.asin(t2)

  // Roll (Z axis)
  const t3 = 2 * (w * z + y * x)
  const t4 = 1 - 2 * (x * x + z * z)
  let roll = Math.atan2(t3, t4)

  pitch = (pitch * 180) / Math.PI
  yaw   = (yaw   * 180) / Math.PI
  roll  = (roll  * 180) / Math.PI

  const heading = (yaw + 360) % 360

  return { roll, pitch, yaw, heading }
}
