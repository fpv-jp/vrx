import Constants from '../constants.js'
import { ReceiverState } from '../receiver.js'
import * as Utils from '../utils.js'

import charts from '../thirdparty/realtime-chart.js'
const { AreaChart } = charts

const Command = Constants.Command
const Interva = 1000 // ms

//-------------------------------------
//
//-------------------------------------
export const MonitorState = {
  monitorId: null,

  inboundAreaChart: null,
  outboundAreaChart: null,

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
      MonitorState.telemetryInfo = {
        ...MonitorState.telemetryInfo,
        Local: Utils.excludedCandidate(candidatePairReport.localCandidate),
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
      MonitorState.telemetryInfo = {
        ...MonitorState.telemetryInfo,
        Remote: Utils.excludedCandidate(candidatePairReport.remoteCandidate),
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
        let channelInfo = `Ping ${MonitorState.ping} ms`
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
  // メインの集約関数
  reportAggregate: function () {
    // ping
    let { dc2CMD } = ReceiverState
    if (dc2CMD && dc2CMD.readyState == 'open') {
      let cmd = Command.PING
      MonitorState.pingStartTime = window.performance.now()
      dc2CMD.send(JSON.stringify({ cmd }))
    }

    ReceiverState.pc2.getStats(null).then((stats) => {
      const processedReports = this.collectRelevantStats(stats)

      processedReports.forEach((report) => {
        this.updateMonitorState(report)
      })

      WebrtcReport.innerHTML = this.formatDebugOutput(processedReports)
    })
  },
}

export default ConnectionMonitoring
