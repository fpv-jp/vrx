import Constants from '../constants.js'
import { ReceiverState } from '../receiver'
import * as Utils from '../utils.js'

const Command = Constants.Command
const Interval = 1000 // ms

/**
 * Alpine store から選択中ネットワークインターフェースの IP を返す
 * @returns {string|null}
 */
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

/**
 * ローカル IP を表示用に整形する（mDNS は省略表記）
 * @param {string} ip
 * @returns {string}
 */
function formatLocalIP(ip) {
  if (!ip) return '(unknown)'
  if (ip.endsWith('.local')) return '(mDNS)'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(ip)) return '(mDNS)'
  return ip
}

/** RTCPeerConnection 統計の集約状態 */
export const MonitorState = {
  monitorId: null,

  candidatePairReport: null,

  previousStats: new Map(),

  inboundRtpAudioReport: null,
  inboundRtpVideoReport: null,

  pingStartTime: null,
  ping: null,

  wifi: null,

  telemetryInfo: {},
  dataChannelInfo: {},
}

/** RTCPeerConnection 統計を定期収集・処理するモジュール */
const RtcStats = {
  /** 定期収集インターバルを開始する */
  start() {
    MonitorState.monitorId = setInterval(this.reportAggregate.bind(this), Interval)
  },

  /** 定期収集インターバルを停止する */
  stop() {
    if (MonitorState.monitorId) {
      clearInterval(MonitorState.monitorId)
      MonitorState.monitorId = null
    }
  },

  /**
   * レポート内の ID 参照を実オブジェクトに解決する
   * @param {Object} r - 対象レポート
   * @param {string[]} idNames - 解決する ID プロパティ名の配列
   * @param {RTCStatsReport} stats - 全統計マップ
   */
  resolveReportIds(r, idNames, stats) {
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

  /**
   * candidate-pair レポートを処理し、送受信スループット（kbps）を計算する
   * @param {Object} r - candidate-pair レポート（_stats を含む）
   */
  processCandidatePair(r) {
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

  /**
   * inbound-rtp レポートを処理し、ビットレート（kbps）を計算する
   * @param {Object} r - inbound-rtp レポート（_stats を含む）
   */
  processInboundRtp(r) {
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

  /**
   * data-channel レポートを処理し、メッセージレート（Hz）を計算する
   * @param {Object} r - data-channel レポート
   */
  processDataChannel(r) {
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

  /**
   * レポートタイプに応じて MonitorState を更新する
   * @param {Object} r - 処理済みレポート
   */
  updateMonitorState(r) {
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
              const mime = codec.mimeType.replace('video/', '')
              ReceiverState.videoText = `${mime} ${frameWidth}x${frameHeight} ${framesPerSecond || 0}fps jitter ${(jitter || 0).toFixed(3)}`
            }
            break
          case 'audio':
            MonitorState.inboundRtpAudioReport = r
            if (r?.codec) {
              const { mimeType, clockRate, channels } = r.codec
              const mime = mimeType.replace('audio/', '')
              ReceiverState.audioText = `${mime} ${clockRate}Hz ch${channels}`
              if (ReceiverState.audioVisualizer) ReceiverState.audioVisualizer.text(ReceiverState.audioText)
            }
            break
        }
        break

      case 'data-channel': {
        const { label, state: chState, messages } = r
        if (label === 'CMD') {
          MonitorState.dataChannelInfo[label] = `Ping ${MonitorState.ping ?? '--'} ms`
        } else {
          MonitorState.dataChannelInfo[label] = `${chState ?? '?'} ${messages ?? 0}Hz`
        }
        break
      }
    }
  },

  /**
   * 処理済みレポートをデバッグ表示用のテキストに整形する
   * @param {Object[]} data - 処理済みレポートの配列
   * @returns {string}
   */
  formatDebugOutput(data) {
    return JSON.stringify(data, null, 2)
      .replace(/[{}[\]"]/g, '')
      .replace(/,\s*$/gm, '')
  },

  /**
   * RTCStatsReport から nominated candidate-pair・inbound-rtp・data-channel を
   * 抽出し、各統計値を計算して返す
   * @param {RTCStatsReport} stats
   * @returns {Object[]} 処理済みレポートの配列
   */
  collectRelevantStats(stats) {
    let result = []

    stats.forEach((report) => {
      const { type, nominated } = report

      if ((type === 'candidate-pair' && nominated) || type === 'inbound-rtp' || type === 'data-channel') {
        let report_ = { ...report }
        report_._stats = stats

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

  /**
   * ネットワーク・チャンネル情報を HUD 用 telemetryInfo として構築し設定する
   */
  buildTelemetryInfo() {
    const cp = MonitorState.candidatePairReport
    const telemetryInfo = {}

    if (cp) {
      const network = {}

      const localIP = cp.localCandidate?.ip
      const remoteIP = getRemoteAddress() || cp.remoteCandidate?.ip
      if (localIP)  network['Local']    = formatLocalIP(localIP)
      if (remoteIP) network['Remote']   = remoteIP

      const ctype = cp.localCandidate?.candidateType
      if (ctype)    network['Type']     = ctype
      const proto = cp.localCandidate?.protocol
      if (proto)    network['Protocol'] = proto

      if (MonitorState.wifi?.status?.wpa_state === 'COMPLETED') {
        const { ssid } = MonitorState.wifi.status
        if (ssid) network['SSID'] = ssid
        network['Net'] = 'WiFi'
      } else {
        network['Net'] = 'LAN'
      }

      network['Ping'] = `${MonitorState.ping ?? '--'} ms`
      telemetryInfo.Network = network
    }

    const channelKeys = Object.keys(MonitorState.dataChannelInfo)
    if (channelKeys.length > 0) {
      telemetryInfo.Channel = { ...MonitorState.dataChannelInfo }
    }

    MonitorState.telemetryInfo = telemetryInfo
    ReceiverState.headUpDisplay.setTelemetryInfo(telemetryInfo)
  },

  /**
   * 1秒ごとに呼ばれるメイン集約処理。
   * CMD チャンネルへ ping 送信後、RTCPeerConnection 統計を収集・処理して HUD と WebrtcReport を更新する
   */
  async reportAggregate() {
    const { cmd } = ReceiverState
    if (cmd && cmd.readyState == 'open') {
      MonitorState.pingStartTime = window.performance.now()
      cmd.send(JSON.stringify({ cmd: Command.PING }))
    }

    const stats = await ReceiverState.pc.getStats(null)
    const processedReports = this.collectRelevantStats(stats)

    processedReports.forEach((report) => {
      this.updateMonitorState(report)
    })

    this.buildTelemetryInfo()

    WebrtcReport.innerHTML = this.formatDebugOutput(processedReports)
  },
}

export default RtcStats
