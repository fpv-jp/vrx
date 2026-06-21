import Alpine from 'alpinejs'
import Constants from '../constants.js'
import { ReceiverState } from './index.js'
import { MonitorState } from '../stats/index.js'
import * as Utils from '../utils.js'
import * as VtxConsole from '../widgets/vtx-console.js'
import * as DroneMap from '../widgets/map.js'
const { updatePosition, setAltitude } = DroneMap

let telemetryData = {}

export function resetTelemetryData() {
  telemetryData = {}
}

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
    case BROWSER:
      VtxConsole.show()
      openBrowserDataChannel(channel)
      break
    case GSTREAMER:
      VtxConsole.show()
      openGstreamerDataChannel(channel)
      break
  }
}

// ---- 共通 ----

/**
 * CMD チャンネル（PING/PONG, HANG_UP）— browser・gstreamer 共通
 * @param {RTCDataChannel} channel
 */
function openCmdChannel(channel) {
  VtxConsole.log('CMD open')
  channel.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    switch (message.cmd) {
      case Command.HANG_UP:
        VtxConsole.log('HANG_UP')
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
      VtxConsole.log('IMU open')
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
        telemetryData = { ...telemetryData, ...result }
        ReceiverState.headUpDisplay.update(telemetryData)
      }
      break

    case ChannelLabel.GNSS:
      VtxConsole.log('GNSS open')
      channel.onmessage = ({ data }) => {
        const gps = Object.fromEntries(Object.entries(JSON.parse(data)).filter(([_, v]) => v !== null))
        telemetryData.gps = gps
        if (gps.latitude != null && gps.longitude != null) {
          VtxConsole.log(`GNSS lat:${gps.latitude.toFixed(5)} lon:${gps.longitude.toFixed(5)}`)
          updatePosition(gps.longitude, gps.latitude, telemetryData.heading, gps.altitude)
        }
      }
      break

    case ChannelLabel.BAT:
      VtxConsole.log('BAT open')
      channel.onmessage = ({ data }) => {
        const battery = Object.fromEntries(Object.entries(JSON.parse(data)).filter(([_, v]) => v !== null))
        telemetryData.battery = battery
        if (battery.voltage != null) {
          VtxConsole.log(`BAT ${battery.voltage}V ${battery.percentage ?? '--'}%`)
        }
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
      VtxConsole.log('MSP_RAW_IMU open')
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
      VtxConsole.log('MSP_ATTITUDE open')
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        const roll  = view.getInt16(offset, true) / 10.0
        const pitch = view.getInt16(offset + 2, true) / 10.0
        const yaw   = view.getInt16(offset + 4, true) // heading

        telemetryData.videoText = ReceiverState.videoText
        telemetryData.telemetryInfo = MonitorState.telemetryInfo
        telemetryData = { ...telemetryData, roll, pitch, yaw }
        ReceiverState.headUpDisplay.MSP(telemetryData)
      }
      break

    case ChannelLabel.MSP_RAW_GPS:
      VtxConsole.log('MSP_RAW_GPS open')
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

        if (data.byteLength > offset) {
          gps.positionalDop = view.getUint16(offset, true)
        }

        telemetryData.gps = gps
        VtxConsole.log(`GPS fix:${gps.fix} sat:${gps.numSat} lat:${(gps.latitude / 1e7).toFixed(5)} lon:${(gps.longitude / 1e7).toFixed(5)} alt:${gps.alt}m`)
        if (gps.fix > 0) {
          updatePosition(gps.longitude / 1e7, gps.latitude / 1e7, telemetryData.yaw, gps.alt)
        }
      }
      break

    case ChannelLabel.MSP_COMP_GPS:
      VtxConsole.log('MSP_COMP_GPS open')
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
      VtxConsole.log('MSP_ALTITUDE open')
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.altitude = parseFloat((view.getInt32(0, true) / 100.0).toFixed(2))
        setAltitude(telemetryData.altitude)
      }
      break

    case ChannelLabel.MSP_SONAR:
      VtxConsole.log('MSP_SONAR open')
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.sonar = view.getInt32(0, true)
      }
      break

    case ChannelLabel.MSP_ANALOG:
      VtxConsole.log('MSP_ANALOG open')
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
      VtxConsole.log('MSP_BATTERY_STATE open')
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0
        const battery = {
          cellCount:    view.getUint8(offset++),
          capacity:     view.getUint16(offset, true),
          voltageOld:   view.getUint8(offset + 2) / 10.0,
          mAhDrawn:     view.getUint16(offset + 3, true),
          amperage:     view.getUint16(offset + 5, true) / 100,
          batteryState: view.getUint8(offset + 7),
        }
        telemetryData.battery = battery
        VtxConsole.log(`BAT ${battery.voltageOld}V ${battery.cellCount}S mAh:${battery.mAhDrawn} A:${battery.amperage} state:${battery.batteryState}`)
      }
      break

    case ChannelLabel.WPA_SUPPLICANT:
      VtxConsole.log('WPA_SUPPLICANT open')
      channel.onmessage = ({ data }) => {
        let wifi = JSON.parse(data)
        wifi.status = { ...wifi.status, ...Utils.frequencyToWifiChannel(wifi.status.freq) }
        MonitorState.wifi = wifi
      }
      break

    case ChannelLabel.VTX_NOTIFY_MESSAGE:
      VtxConsole.log('VTX_NOTIFY_MESSAGE open')
      channel.onmessage = ({ data }) => {
        VtxConsole.log(data.trimEnd())
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
