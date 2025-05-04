import charts from './d3-realtime-chart.js'
const { AreaChart } = charts

// -----------------------------------
// ConnectionMonitoring
// -----------------------------------

export default (State, Constants) => {
  const ConnectionMonitoring = {
    startConnectionMonitoring: function () {
      let chartOption = {
        n: 60,
        duration: 750,
        margin: { top: 20, right: 0, bottom: 20, left: 55 },
        width: 400,
        height: 100,
        ticks: 5,
        gridx: true,
        gridy: true,
      }

      let InboundNetwork = document.createElement('div')
      NetworkMonitoring.appendChild(InboundNetwork)
      State.inboundAreaChart = new AreaChart(
        InboundNetwork, //
        this.getInboundNetworkTraffic,
        chartOption,
        'basis',
      )

      let OutboundNetwork = document.createElement('div')
      NetworkMonitoring.appendChild(OutboundNetwork)
      State.outboundAreaChart = new AreaChart(
        OutboundNetwork, //
        this.getOutboundNetworkTraffic,
        chartOption,
        'basis',
      )

      State.reportAggregateId = setInterval(this.reportAggregate.bind(this), 1000)
    },

    getInboundNetworkTraffic: function () {
      if (State.candidatePairReport) {
        if (State.inboundRtpAudioReport?.codec) {
          State.audioCodec = State.inboundRtpAudioReport.codec
          let { mimeType, clockRate, channels } = State.inboundRtpAudioReport.codec
          State.audioText = `${mimeType} rate ${clockRate} channels ${channels}`
        }

        if (State.inboundRtpVideoReport?.codec) {
          State.videoCodec = State.inboundRtpVideoReport.codec
          const { codec, frameWidth, frameHeight, framesPerSecond, jitter } = State.inboundRtpVideoReport
          State.videoText = `${codec ? codec.mimeType : ''} ${frameWidth}x${frameHeight} FPS ${framesPerSecond || 0} jitter ${jitter || 0}`
        }

        const { networkType, candidateType, protocol, address, port } = State.candidatePairReport.localCandidate
        State.networkInfo = {
          ...State.networkInfo,
          Local: { networkType, candidateType, protocol, address, port },
        }

        NetworkStatus.textContent = JSON.stringify(State.networkInfo, null, 2)
          .replace(/[{}[\]"]/g, '')
          .replace(/,\s*$/gm, '')
          .replace(/^\s*[\r\n]/gm, '')

        if (State.candidatePairReport.inboundNetworkTraffic) {
          const value = State.candidatePairReport.inboundNetworkTraffic
          const rightText = `Inbound Traffic ${value.toFixed(2)} kbps`
          return { rightText, value }
        }
      }
      return { leftText: '', rightText: 'Inbound Traffic 0 kbps', value: 0 }
    },

    getOutboundNetworkTraffic: function () {
      if (State.candidatePairReport) {
        const { candidateType, protocol, address, port } = State.candidatePairReport.remoteCandidate
        State.networkInfo = {
          ...State.networkInfo,
          Remote: { candidateType, protocol, address, port },
        }

        if (State.candidatePairReport.outboundNetworkTraffic) {
          const value = State.candidatePairReport.outboundNetworkTraffic
          const rightText = `Outbound Traffic ${value.toFixed(2)} kbps`
          return { rightText, value }
        }
      }
      return { rightText: 'Outbound Traffic 0 kbps', value: 0 }
    },

    previousStats: new Map(),

    reportAggregate: function () {
      if (State.pc2.iceConnectionState !== 'connected') {
        Helion10.style.visibility = 'hidden'
        State.Menu.WebrtcReportButton.disabled = true
        State.Menu.SearchRadarButton.disabled = true
        State.Menu.FullScreenButton.disabled = true
      }

      Helion10.style.visibility = 'visible'
      State.Menu.WebrtcReportButton.disabled = false
      State.Menu.SearchRadarButton.disabled = false
      State.Menu.FullScreenButton.disabled = false

      State.pingStartTime = window.performance.now()
      if (State.dc2CMD && State.dc2CMD.readyState == 'open') {
        State.dc2CMD.send(JSON.stringify({ cmd: Constants.Command.PING }))
      }

      State.pc2.getStats(null).then((stats) => {
        function resolveIds(report1, idNames) {
          idNames.forEach((idName) => {
            if (idName.endsWith('Id') && typeof report1[idName] === 'string' && stats.has(report1[idName])) {
              let report2 = { ...stats.get(report1[idName]) }
              delete report2.id
              delete report2.type
              delete report2.timestamp
              if (idName === 'localCandidateId') report2.address = State.localCandidateAddress[report2.port]
              if (idName === 'remoteCandidateId') report2.address = State.remoteCandidateAddress[report2.port]
              report1[idName.slice(0, -2)] = report2
              delete report1[idName]
            }
          })
        }

        let result = []

        stats.forEach((report) => {
          const { type, nominated } = report

          if ((type === 'candidate-pair' && nominated) || type === 'inbound-rtp' || type === 'data-channel') {
            let report_ = { ...report }

            if (type === 'candidate-pair') {
              resolveIds(report_, ['localCandidateId', 'remoteCandidateId'])
              let { id, bytesReceived, bytesSent, timestamp } = report_
              const prev = this.previousStats.get(id)
              if (prev) {
                const byteReceivedDiff = bytesReceived - prev.bytesReceived
                const byteSentDiff = bytesSent - prev.bytesSent
                const timeDiff = (timestamp - prev.timestamp) / 1000
                if (timeDiff > 0) {
                  report_.inboundNetworkTraffic = (byteReceivedDiff * 8) / timeDiff / 1000
                  report_.outboundNetworkTraffic = (byteSentDiff * 8) / timeDiff / 1000
                }
              }
              this.previousStats.set(id, { bytesReceived, bytesSent, timestamp })
            }

            if (type === 'inbound-rtp') {
              resolveIds(report_, ['codecId', 'remoteId'])
              let { ssrc, bytesReceived, timestamp } = report_
              const prev = this.previousStats.get(ssrc)
              if (prev) {
                const byteDiff = bytesReceived - prev.bytesReceived
                const timeDiff = (timestamp - prev.timestamp) / 1000
                if (timeDiff > 0) report_.networkTraffic = (byteDiff * 8) / timeDiff / 1000
              }
              this.previousStats.set(ssrc, { bytesReceived, timestamp })
            }

            if (type === 'data-channel') {
              let { id, messagesReceived, timestamp } = report_
              const prev = this.previousStats.get(id)
              if (prev) {
                const messagesDiff = messagesReceived - prev.messagesReceived
                const timeDiff = (timestamp - prev.timestamp) / 1000
                if (timeDiff > 0) {
                  report_.messages = Math.ceil(messagesDiff / timeDiff)
                }
              }
              this.previousStats.set(id, { messagesReceived, timestamp })
            }

            result.push(report_)
          }
        })

        for (const report of result) {
          switch (report.type) {
            case 'candidate-pair':
              State.candidatePairReport = report
              break

            case 'inbound-rtp':
              if (report.kind === 'audio') {
                State.inboundRtpAudioReport = report
              } else if (report.kind === 'video') {
                State.inboundRtpVideoReport = report
              }
              break

            case 'data-channel':
              const { label, state, messages } = report
              if (label === 'CMD') {
                State.networkInfo.DataChannel[label] = { state, messages, ping: State.ping }
              } else {
                State.networkInfo.DataChannel[label] = { state, messages }
              }
              break
          }
        }

        // Debug output
        WebrtcReport.innerHTML = JSON.stringify(result, null, 2)
          .replace(/[{}[\]"]/g, '')
          .replace(/,\s*$/gm, '')
      })
    },
  }

  return ConnectionMonitoring
}
