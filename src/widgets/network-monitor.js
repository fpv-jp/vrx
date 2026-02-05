import { MonitorState } from '../stats/index.js'

/**
 * 受信トラフィック情報を返す（D3 AreaChart のデータソース）
 * @returns {{ leftText: string, rightText: string, value: number }}
 */
function getInboundTraffic() {
  let { candidatePairReport: cp } = MonitorState
  let value = 0
  const parts = []

  if (MonitorState.wifi?.status?.wpa_state === 'COMPLETED') {
    const { channel } = MonitorState.wifi.status
    const { FREQUENCY, WIDTH } = MonitorState.wifi.signal_poll
    if (channel) parts.push(`Ch: ${channel} (${FREQUENCY}MHz) W: ${WIDTH}MHz`)
  }

  if (cp?.inboundNetworkTraffic) value = cp.inboundNetworkTraffic

  return { leftText: parts.join('  '), rightText: `Inbound ${value.toFixed(2)} kbps`, value }
}

/**
 * 送信トラフィック情報を返す（D3 AreaChart のデータソース）
 * @returns {{ leftText: string, rightText: string, value: number }}
 */
function getOutboundTraffic() {
  let { candidatePairReport: cp } = MonitorState
  let value = 0
  const parts = []

  if (MonitorState.wifi?.status?.wpa_state === 'COMPLETED') {
    const { RSSI, LINKSPEED } = MonitorState.wifi.signal_poll
    if (RSSI != null)      parts.push(`RSSI: ${RSSI}dBm`)
    if (LINKSPEED != null) parts.push(`Link: ${LINKSPEED}Mb/s`)
  }

  if (cp?.outboundNetworkTraffic) value = cp.outboundNetworkTraffic

  return { leftText: parts.join('  '), rightText: `Outbound ${value.toFixed(2)} kbps`, value }
}

let inboundChart = null
let outboundChart = null

/** NetworkMonitoring 要素に D3 AreaChart を生成・管理するモジュール */
const NetworkMonitor = {
  /**
   * 受信・送信トラフィックの AreaChart を NetworkMonitoring 要素に追加する
   * window.RealtimeCharts が未ロードの場合はスキップする
   */
  start() {
    if (!window.RealtimeCharts) {
      console.warn('RealtimeCharts not available')
      return
    }

    const { AreaChart } = window.RealtimeCharts
    const chartOption = {
      dataPointCount: 60,
      duration: 750,
      margin: { top: 20, right: 0, bottom: 20, left: 38 },
      width: 400,
      height: 100,
      yAxisTicks: 5,
      showGridX: true,
      showGridY: true,
    }

    let inboundDiv = document.createElement('div')
    NetworkMonitoring.appendChild(inboundDiv)
    inboundChart = new AreaChart(inboundDiv, getInboundTraffic, chartOption, 'basis')

    let outboundDiv = document.createElement('div')
    NetworkMonitoring.appendChild(outboundDiv)
    outboundChart = new AreaChart(outboundDiv, getOutboundTraffic, chartOption, 'basis')
  },

  /** AreaChart のアニメーションを停止し参照を解放する */
  stop() {
    if (inboundChart) inboundChart.stop()
    if (outboundChart) outboundChart.stop()
    inboundChart = null
    outboundChart = null
  },
}

export default NetworkMonitor
