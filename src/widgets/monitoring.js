import Constants from '../constants.js'
import { ReceiverState } from '../receiver'
import * as Utils from '../utils.js'

import charts from '../thirdparty/realtime-chart.js'
const { AreaChart } = charts

const Command = Constants.Command
const Interva = 1000 // ms

function getRemoteAddress() {
  try {
    const store = window.Alpine?.store('menu')
    const network = store?.message?.network
    const selected = store?.network_interface
    if (!network || !selected || selected === 'none') return null
    const nic = network.find((n) => n.name === selected)
    return nic?.address || null
  } catch (e) {
    return null
  }
}

function formatLocalIP(ip) {
  if (!ip) return '(unknown)'
  if (ip.endsWith('.local')) return '(mDNS)'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(ip)) return '(mDNS)'
  return ip
}

//-------------------------------------
//
//-------------------------------------
export const MonitorState = {
  monitorId: null,

  inboundAreaChart: null,
  outboundAreaChart: null,
  statsDiv: null,

  candidatePairReport: null,

  previousStats: new Map(),

  inboundRtpAudioReport: null,
  inboundRtpVideoReport: null,

  pingStartTime: null,
  ping: null,

  wifi: null,

  telemetryInfo: { DataChannel: {} },
}

//-------------------------------------
//
//-------------------------------------
const ConnectionMonitoring = {
  // start ---------------------------
  start: function () {
    let chartOption = {
      dataPointCount: 60,
      duration: 750,
      margin: { top: 20, right: 0, bottom: 20, left: 55 },
      width: 400,
      height: 100,
      yAxisTicks: 5,
      showGridX: true,
      showGridY: true,
    }

    let InboundNetwork = document.createElement('div')
    NetworkMonitoring.appendChild(InboundNetwork)
    MonitorState.inboundAreaChart = new AreaChart(
      //
      InboundNetwork,
      this.getInboundTraffic,
      chartOption,
      'basis',
    )

    let OutboundNetwork = document.createElement('div')
    NetworkMonitoring.appendChild(OutboundNetwork)
    MonitorState.outboundAreaChart = new AreaChart(
      //
      OutboundNetwork,
      this.getOutboundTraffic,
      chartOption,
      'basis',
    )

    const statsDiv = document.createElement('pre')
    statsDiv.style.cssText = 'margin:4px 0 0; font:10px monospace; color:rgba(0,255,0,0.9); white-space:pre; line-height:1.4;'
    NetworkMonitoring.appendChild(statsDiv)
    MonitorState.statsDiv = statsDiv

    MonitorState.monitorId = setInterval(this.reportAggregate.bind(this), Interva)
  },

  // stop ---------------------------
  stop: function () {
    if (MonitorState.monitorId) {
      clearInterval(MonitorState.monitorId)
      MonitorState.monitorId = null
    }
    if (MonitorState.inboundAreaChart) MonitorState.inboundAreaChart.stop()
    if (MonitorState.outboundAreaChart) MonitorState.outboundAreaChart.stop()
    MonitorState.statsDiv = null
  },

  // getInboundTraffic ---------------------------
  getInboundTraffic: function () {
    let { candidatePairReport } = MonitorState
    let value = 0
    let leftText = ''

    if (MonitorState.wifi?.status.wpa_state === 'COMPLETED') {
      let { band, channel, freq, ssid, ip_address, address } = MonitorState.wifi.status
      let { RSSI, LINKSPEED, FREQUENCY, WIDTH, CENTER_FRQ1, CENTER_FRQ2 } = MonitorState.wifi.signal_poll
      leftText = `channel: ${channel} (${FREQUENCY} MHz) width: ${WIDTH}`
    }

    if (candidatePairReport) {
      const local = Utils.excludedCandidate(candidatePairReport.localCandidate)
      if (local.ip) local.ip = formatLocalIP(local.ip)
      MonitorState.telemetryInfo = {
        ...MonitorState.telemetryInfo,
        Local: local,
      }

      if (candidatePairReport.inboundNetworkTraffic) {
        value = candidatePairReport.inboundNetworkTraffic
      }
    }

    let rightText = `Inbound ${value.toFixed(2)} kbps`
    return { leftText, rightText, value }
  },

  // getOutboundTraffic ---------------------------
  getOutboundTraffic: function () {
    let { candidatePairReport } = MonitorState
    let value = 0
    let leftText = ''

    if (MonitorState.wifi?.status.wpa_state === 'COMPLETED') {
      let { band, channel, freq, ssid, ip_address, address } = MonitorState.wifi.status
      let { RSSI, LINKSPEED, FREQUENCY, WIDTH, CENTER_FRQ1, CENTER_FRQ2 } = MonitorState.wifi.signal_poll
      leftText = `RSSI: ${RSSI}dBm  LINKSPEED: ${LINKSPEED}Mb/s`
    }

    if (candidatePairReport) {
      const remote = Utils.excludedCandidate(candidatePairReport.remoteCandidate)
      const remoteIP = getRemoteAddress()
      if (remoteIP) remote.ip = remoteIP
      MonitorState.telemetryInfo = {
        ...MonitorState.telemetryInfo,
        Remote: remote,
      }

      if (candidatePairReport.outboundNetworkTraffic) {
        value = candidatePairReport.outboundNetworkTraffic
      }
    }

    let rightText = `Outbound ${value.toFixed(2)} kbps`
    return { leftText, rightText, value }
  },

  // ---------------------------
  // ID参照を実際のオブジェクトに解決
  resolveReportIds: function (r, idNames, stats) {
    idNames.forEach((idName) => {
      if (idName.endsWith('Id') && typeof r[idName] === 'string' && stats.has(r[idName])) {
        let resolvedReport = { ...stats.get(r[idName]) }
        delete resolvedReport.id
        delete resolvedReport.type
        delete resolvedReport.timestamp
        r[idName.slice(0, -2)] = resolvedReport
        delete r[idName]
      }
    })
  },

  // ---------------------------
  // candidate-pair統計の処理
  processCandidatePair: function (r) {
    this.resolveReportIds(r, ['localCandidateId', 'remoteCandidateId'], r._stats)

    let { id, bytesReceived, bytesSent, timestamp } = r
    const prev = MonitorState.previousStats.get(id)

    if (prev) {
      const byteReceivedDiff = bytesReceived - prev.bytesReceived
      const byteSentDiff = bytesSent - prev.bytesSent
      const timeDiff = (timestamp - prev.timestamp) / 1000

      if (timeDiff > 0) {
        r.inboundNetworkTraffic = (byteReceivedDiff * 8) / timeDiff / 1000
        r.outboundNetworkTraffic = (byteSentDiff * 8) / timeDiff / 1000
      }
    }

    MonitorState.previousStats.set(id, { bytesReceived, bytesSent, timestamp })
  },

  // ---------------------------
  // inbound-rtp統計の処理
  processInboundRtp: function (r) {
    this.resolveReportIds(r, ['codecId', 'remoteId'], r._stats)

    let { ssrc, bytesReceived, timestamp } = r
    const prev = MonitorState.previousStats.get(ssrc)

    if (prev) {
      const byteDiff = bytesReceived - prev.bytesReceived
      const timeDiff = (timestamp - prev.timestamp) / 1000

      if (timeDiff > 0) {
        r.networkTraffic = (byteDiff * 8) / timeDiff / 1000
      }
    }

    MonitorState.previousStats.set(ssrc, { bytesReceived, timestamp })
  },

  // ---------------------------
  // data-channel統計の処理
  processDataChannel: function (r) {
    let { id, messagesReceived, timestamp } = r
    const prev = MonitorState.previousStats.get(id)

    if (prev) {
      const messagesDiff = messagesReceived - prev.messagesReceived
      const timeDiff = (timestamp - prev.timestamp) / 1000

      if (timeDiff > 0) {
        r.messages = Math.ceil(messagesDiff / timeDiff)
      }
    }

    MonitorState.previousStats.set(id, { messagesReceived, timestamp })
  },

  // ---------------------------
  // 各レポートタイプに応じた状態更新
  updateMonitorState: function (r) {
    switch (r.type) {
      case 'candidate-pair':
        MonitorState.candidatePairReport = r
        break

      case 'inbound-rtp':
        switch (r.kind) {
          case 'video':
            MonitorState.inboundRtpVideoReport = r
            if (r?.codec) {
              const { codec, frameWidth, frameHeight, framesPerSecond, jitter } = r
              // videoText
              ReceiverState.videoText = `${codec ? codec.mimeType : ''} ${frameWidth}x${frameHeight} FPS ${framesPerSecond || 0} jitter ${jitter || 0}`
            }
            break
          case 'audio':
            MonitorState.inboundRtpAudioReport = r
            if (r?.codec) {
              const { mimeType, clockRate, channels } = r.codec
              // audioText
              ReceiverState.audioText = `${mimeType} rate ${clockRate} channels ${channels}`
              if (ReceiverState.audioVisualizer) ReceiverState.audioVisualizer.text(ReceiverState.audioText)
            }
            break
        }
        break

      case 'data-channel':
        const { label, state, messages } = r
        let channelInfo = `Ping ${MonitorState.ping ?? '--'} ms`
        if (label !== 'CMD') {
          channelInfo = `${state} (${messages}Hz)`
        }
        MonitorState.telemetryInfo.DataChannel[label] = channelInfo
        break
    }
  },

  // ---------------------------
  // デバッグ出力の整形
  formatDebugOutput: function (data) {
    return JSON.stringify(data, null, 2)
      .replace(/[{}[\]"]/g, '')
      .replace(/,\s*$/gm, '')
  },

  // ---------------------------
  // 統計レポートの収集とフィルタリング
  collectRelevantStats: function (stats) {
    let result = []

    stats.forEach((report) => {
      const { type, nominated } = report

      if ((type === 'candidate-pair' && nominated) || type === 'inbound-rtp' || type === 'data-channel') {
        let report_ = { ...report }
        report_._stats = stats // 後でresolveIdsで使用

        if (type === 'candidate-pair') {
          this.processCandidatePair(report_)
        } else if (type === 'inbound-rtp') {
          this.processInboundRtp(report_)
        } else if (type === 'data-channel') {
          this.processDataChannel(report_)
        }

        delete report_._stats
        result.push(report_)
      }
    })

    return result
  },

  // ---------------------------
  // statsDiv テキスト更新
  updateStatsDiv: function () {
    if (!MonitorState.statsDiv) return

    const lines = []

    // Ping
    lines.push(`Ping : ${MonitorState.ping ?? '--'} ms`)

    // Remote IP (from selected network interface)
    const remoteIP = getRemoteAddress()
    if (remoteIP) lines.push(`Remote: ${remoteIP}`)

    // Local IP (from ICE, may be mDNS)
    const localIP = MonitorState.candidatePairReport?.localCandidate?.ip
    if (localIP) lines.push(`Local : ${formatLocalIP(localIP)}`)

    // Video stats
    const v = MonitorState.inboundRtpVideoReport
    if (v?.codec) {
      const mime = v.codec.mimeType.replace('video/', '')
      lines.push(`Video : ${mime} ${v.frameWidth}x${v.frameHeight} ${v.framesPerSecond || 0}fps jitter ${(v.jitter || 0).toFixed(3)}`)
    }

    // Audio stats
    const a = MonitorState.inboundRtpAudioReport
    if (a?.codec) {
      const mime = a.codec.mimeType.replace('audio/', '')
      lines.push(`Audio : ${mime} ${a.codec.clockRate}Hz ch${a.codec.channels}`)
    }

    // WiFi
    if (MonitorState.wifi?.status?.wpa_state === 'COMPLETED') {
      const { ssid, ip_address } = MonitorState.wifi.status
      const { RSSI, LINKSPEED, FREQUENCY, WIDTH } = MonitorState.wifi.signal_poll
      lines.push(`WiFi  : ${ssid}  ${FREQUENCY}MHz W:${WIDTH}`)
      lines.push(`        ${ip_address}  RSSI:${RSSI}dBm ${LINKSPEED}Mb/s`)
    }

    MonitorState.statsDiv.textContent = lines.join('\n')
  },

  // ---------------------------
  // メインの集約関数
  reportAggregate: function () {
    // ping
    let { cmd } = ReceiverState
    if (cmd && cmd.readyState == 'open') {
      MonitorState.pingStartTime = window.performance.now()
      cmd.send(JSON.stringify({ cmd: Command.PING }))
    }

    ReceiverState.pc.getStats(null).then((stats) => {
      const processedReports = this.collectRelevantStats(stats)

      processedReports.forEach((report) => {
        this.updateMonitorState(report)
      })

      this.updateStatsDiv()

      WebrtcReport.innerHTML = this.formatDebugOutput(processedReports)
    })
  },
}

export default ConnectionMonitoring
