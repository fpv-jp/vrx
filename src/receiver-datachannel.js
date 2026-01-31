import Constants from './constants.js'
import { ReceiverState } from './receiver.js'
import { MonitorState } from './widgets/monitoring.js'
import * as Utils from './utils.js'

let telemetryData = {}

const ChannelLabel = Constants.ChannelLabel
const Command = Constants.Command

//-------------------------------------
// DC2 Data Channel
//-------------------------------------
export default async function OpenVtxDataChannel(channel) {
  switch (channel.label) {

    // ----------------------------------------
    // PC2 Command Channel Message
    // ----------------------------------------
    case ChannelLabel.CMD:
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
      ReceiverState.dc2CMD = channel
      break

    // ----------------------------------------
    // Sensors in smartphones and tablets
    // ----------------------------------------
    case ChannelLabel.IMU:
      channel.onmessage = ({ data }) => {
        const quaternion = new Float32Array(data)

        // Get quaternion from sensor
        let [x, y, z, w] = quaternion

        // Convert sensor quaternion to match the original three.js conversion
        x = -x
        ;[y, z] = [z, y]

        let result = calculateEulerAngles(x, y, z, w)

        /// update HeadUpDisplay //////////////////////////////
        telemetryData.videoText = ReceiverState.videoText
        telemetryData.telemetryInfo = MonitorState.telemetryInfo
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

    // ----------------------------------------
    // Sensors in Flight controller Multiwii Serial Protocol (MSP)
    // ----------------------------------------
    case ChannelLabel.MSP_RAW_IMU:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        // Accelerometer (3 x int16) - scaled by 2048
        const acc = [
          //
          view.getInt16(offset, true) / 2048,
          view.getInt16(offset + 2, true) / 2048,
          view.getInt16(offset + 4, true) / 2048,
        ]
        offset += 6

        // Gyroscope (3 x int16) - scaled by (4 / 16.4)
        const gyro = [
          //
          view.getInt16(offset, true) * (4 / 16.4),
          view.getInt16(offset + 2, true) * (4 / 16.4),
          view.getInt16(offset + 4, true) * (4 / 16.4),
        ]
        offset += 6

        // Magnetometer (3 x int16) - no scaling
        const mag = [
          //
          view.getInt16(offset, true),
          view.getInt16(offset + 2, true),
          view.getInt16(offset + 4, true),
        ]

        telemetryData = { ...telemetryData, acc, gyro, mag }
      }
      break

    case ChannelLabel.MSP_RAW_GPS:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        const gps = {
          //
          fix: view.getUint8(offset++),
          numSat: view.getUint8(offset++),
          latitude: view.getInt32(offset, true),
          longitude: view.getInt32(offset + 4, true),
          alt: view.getUint16(offset + 8, true),
          speed: view.getUint16(offset + 10, true),
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
          //
          distanceToHome: view.getUint16(offset, true),
          directionToHome: view.getUint16(offset + 2, true),
          update: view.getUint8(offset + 4),
        }
      }
      break

    case ChannelLabel.MSP_ATTITUDE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        const roll = view.getInt16(offset, true) / 10.0
        const pitch = view.getInt16(offset + 2, true) / 10.0
        const yaw = view.getInt16(offset + 4, true)

        /// update HeadUpDisplay //////////////////////////////
        telemetryData.videoText = ReceiverState.videoText
        telemetryData.telemetryInfo = MonitorState.telemetryInfo
        telemetryData = { ...telemetryData, ...{ roll, pitch, yaw } }
        ReceiverState.headUpDisplay.MSP(telemetryData)
      }
      break

    case ChannelLabel.MSP_ALTITUDE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.altitude = parseFloat((view.getInt32(0, true) / 100.0).toFixed(2))
      }
      break

    case ChannelLabel.MSP_ANALOG:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0

        telemetryData.altitude = {
          //
          voltage: view.getUint8(offset++) / 10.0,
          mAhdrawn: view.getUint16(offset, true),
          rssi: view.getUint16(offset + 2, true),
          amperage: view.getInt16(offset + 4, true) / 100,
          voltageNew: view.getUint16(offset + 6, true) / 100,
          timestamp: performance.now(),
        }
      }
      break

    case ChannelLabel.MSP_SONAR:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        telemetryData.sonar = view.getInt32(0, true)
      }
      break

    case ChannelLabel.MSP_BATTERY_STATE:
      channel.onmessage = ({ data }) => {
        const view = new DataView(data)
        let offset = 0
        telemetryData.battery = {
          //
          cellCount: view.getUint8(offset++),
          capacity: view.getUint16(offset, true),
          voltageOld: view.getUint8(offset + 2) / 10.0,
          mAhDrawn: view.getUint16(offset + 3, true),
          amperage: view.getUint16(offset + 5, true) / 100,
          batteryState: view.getUint8(offset + 7),
          // voltage: view.getUint16(offset + 8, true) / 100,
        }
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

function calculateEulerAngles(x, y, z, w) {
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

// function calculateEulerAngles(x, y, z, w) {

//   // Normalize the quaternion
//   const norm = Math.sqrt(x * x + y * y + z * z + w * w)
//   const qx = x / norm
//   const qy = y / norm
//   const qz = z / norm
//   const qw = w / norm

//   // Conversion to Euler angles in YXZ order

//   // Yaw (Y axis)
//   const siny_cosp = 2 * (qw * qy + qx * qz)
//   const cosy_cosp = 1 - 2 * (qy * qy + qx * qx)
//   const yaw = Math.atan2(siny_cosp, cosy_cosp)

//   // Pitch (X axis)
//   let sinp = 2 * (qw * qx - qy * qz)
//   sinp = sinp > 1 ? 1 : sinp
//   sinp = sinp < -1 ? -1 : sinp
//   const pitch = Math.asin(sinp)

//   // Roll (Z axis)
//   const sinr_cosp = 2 * (qw * qz + qy * qx)
//   const cosr_cosp = 1 - 2 * (qx * qx + qz * qz)
//   const roll = Math.atan2(sinr_cosp, cosr_cosp)

//   // Convert radians to degrees
//   const rollDeg = (roll * 180) / Math.PI
//   const pitchDeg = (pitch * 180) / Math.PI
//   const yawDeg = (yaw * 180) / Math.PI

//   // Normalize heading to [0, 360)
//   const heading = (yawDeg + 360) % 360

//   return {
//     roll: rollDeg,
//     pitch: pitchDeg,
//     yaw: yawDeg,
//     heading: heading,
//   }
// }
