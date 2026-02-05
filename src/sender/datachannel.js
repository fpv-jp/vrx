import Constants from '../constants.js'
import { SenderState } from './index.js'
const ChannelLabel = Constants.ChannelLabel
const Command = Constants.Command

// Sender Data Channels
export default async function CreateVtxDataChannel(pc) {
  // CMD Channel
  let cmd = SenderState.pc.createDataChannel(ChannelLabel.CMD, {
    ordered: true,
    reliable: true,
  })

  SenderState.cmd = cmd

  cmd.onopen = () => {
    cmd.onmessage = ({ data }) => {
      // PC1 Command Channel Message
      const message = JSON.parse(data)
      switch (message.cmd) {
        case Command.HANG_UP:
          SenderState?.stream.getTracks().forEach((track) => track.stop())
          SenderState.stream = null

          SenderState?.pc.close()
          SenderState.pc = null
          break

        case Command.PING:
          cmd.send(JSON.stringify({ cmd: Command.PONG }))
          break

        // case Command.SEND_KEYFRAME_REQUEST:
        //   Utils.sendKeyFrameRequest(pc)
        //   break

        default:
          console.error('Unknown command:', message.cmd)
      }
    }
  }

  // IMU Channel
  let imu = pc.createDataChannel(ChannelLabel.IMU, {
    ordered: false,
    reliable: false,
    maxPacketLifeTime: 50,
  })

  imu.onclosing = () => {
    console.log('DataChannel IMU closing...')
    SenderState.sensor.stop()
    if (SenderState.dummyIntervalId) {
      clearInterval(SenderState.dummyIntervalId)
      SenderState.dummyIntervalId = null
    }
  }

  imu.onopen = () => {
    const { AbsoluteOrientationSensor } = window.MotionSensors
    SenderState.sensor = new AbsoluteOrientationSensor({ frequency: 60, coordinateSystem: 'world' })

    SenderState.sensor.onreading = () => {
      const quaternion = new Float32Array([
        SenderState.sensor.quaternion[0], //
        SenderState.sensor.quaternion[1],
        SenderState.sensor.quaternion[2],
        SenderState.sensor.quaternion[3],
      ])
      imu.send(quaternion.buffer)
    }

    SenderState.sensor.onerror = ({ error }) => {
      if (error.name === 'NotReadableError') {
        console.warn('Sensor is not available.')

        SenderState.dummyIntervalId = setInterval(() => {
          const ε = 0.1
          const q = new Float32Array([
            //
            ε * (Math.random() - 0.5),
            ε * (Math.random() - 0.5),
            ε * (Math.random() - 0.5),
            1 + ε * (Math.random() - 0.5),
          ])
          if (imu && imu.readyState == 'open') {
            imu.send(q.buffer)
          }
        }, 1000 / 15) // 15 Hz
      }
    }

    SenderState.sensor.start()
  }

  // GNSS Channel
  let gnss = pc.createDataChannel(ChannelLabel.GNSS, {
    ordered: true,
    reliable: true,
    maxRetransmits: 3,
  })

  gnss.onclosing = () => {
    console.log('DataChannel GNSS closing...')
    if (SenderState.gpsWatchId) {
      navigator.geolocation.clearWatch(SenderState.gpsWatchId)
      SenderState.gpsWatchId = null
    }
  }

  const options = {
    enableHighAccuracy: true, //
    maximumAge: 1000,
    timeout: 5000,
  }

  gnss.onopen = async () => {
    try {
      const status = await navigator.permissions?.query({ name: 'geolocation' })
      if (status && status.state === 'denied') {
        console.warn('Geolocation is not available.')
        return
      }
    } catch (err) {
      console.error('GNSS Error 1:', err.code, err.message)
    }

    SenderState.gpsWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const { accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed } = position.coords
        gnss.send(JSON.stringify({ accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed }))
      },
      (err) => console.error('GNSS Error 2:', err.code, err.message),
      options,
    )
  }

  // BAT Channel
  if (navigator.getBattery) {
    let bat = pc.createDataChannel(ChannelLabel.BAT, {
      ordered: true,
      reliable: true,
      maxRetransmits: 3,
    })

    // send
    const sendBattery = (battery) => {
      let { charging, chargingTime, dischargingTime, level } = battery
      if (bat?.readyState === 'open') {
        bat.send(JSON.stringify({ charging, chargingTime, dischargingTime, level }))
      }
    }

    let batteryController = new AbortController()
    const { signal } = batteryController

    bat.onclosing = () => {
      console.log('DataChannel BAT closing...')
      batteryController.abort()
      batteryController = null
    }

    bat.onopen = () => {
      navigator.getBattery().then((battery) => {
        battery.addEventListener('chargingchange', () => sendBattery(battery), { signal })
        battery.addEventListener('levelchange', () => sendBattery(battery), { signal })
        battery.addEventListener('chargingtimechange', () => sendBattery(battery), { signal })
        battery.addEventListener('dischargingtimechange', () => sendBattery(battery), { signal })
        sendBattery(battery)
      })
    }
  }
}
