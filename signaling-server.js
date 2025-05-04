import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'

function createSignalingServer(server, endpoint = '/signaling', inactiveTimeout = 60 * 60 * 1000, debug = false) {
  const wsServer = new WebSocketServer({ server, path: endpoint })
  const wsClients = new Map()

  const getCurrentSenders = () =>
    Array.from(wsClients.values())
      .filter((client) => client.protocol === 'sender')
      .map((client) => client.sessionId)

  const notifySenderEntries = () => {
    const senders = getCurrentSenders()
    Array.from(wsClients.entries())
      .filter(([_, client]) => client.protocol === 'receiver')
      .forEach(([receiverWs]) => {
        receiverWs.send(JSON.stringify({ type: 1, senders })) // CHANGE_SENDER_ENTRIES: 1
      })
  }

  const sendMessage = (protocol, sessionId, text) => {
    const [target] = Array.from(wsClients.entries()).find(([_, client]) => client.protocol === protocol && client.sessionId === sessionId) || []
    if (target) {
      target.send(text)
      return true
    }
    return false
  }

  wsServer.on('connection', (ws, req) => {
    const protocol = req.headers['sec-websocket-protocol']?.toLowerCase()
    if (!['receiver', 'sender'].includes(protocol)) {
      ws.close()
      return
    }

    const sessionId = nanoid(8)
    wsClients.set(ws, { sessionId, protocol, lastActive: Date.now() })
    console.log(`connected ${protocol} sessionId: ${sessionId}`)

    if (protocol === 'receiver') {
      const senders = getCurrentSenders()
      ws.send(JSON.stringify({ type: 0, sessionId, senders })) // SESSION_ID_ISSUANCE: 0
    } else if (protocol === 'sender') {
      notifySenderEntries()
      ws.send(JSON.stringify({ type: 0, sessionId })) // SESSION_ID_ISSUANCE: 0
    }

    ws.on('message', (message) => {
      wsClients.get(ws).lastActive = Date.now()
      const text = message.toString('utf-8')
      const data = JSON.parse(text)
      if (debug) console.log(`\n Incoming message fom ${protocol} :`, data)
      if (sendMessage(protocol === 'receiver' ? 'sender' : 'receiver', protocol === 'receiver' ? data.ws1Id : data.ws2Id, text)) {
        protocol === 'receiver' ? console.log('relay to ws2 ---> ws1') : console.log('relay to ws1 ---> ws2')
        return
      }
      ws.send(JSON.stringify({ type: 'error', message: 'socket is not open' })) // SYSTEM_ERROR: 9
    })

    ws.on('close', () => {
      console.log(`disconnected ${protocol} sessionId: ${sessionId}`)
      if (protocol === 'sender') {
        notifySenderEntries()
      }
      wsClients.delete(ws)
    })
  })

  setInterval(() => {
    const now = Date.now()
    for (const [ws, client] of wsClients) {
      if (now - client.lastActive > inactiveTimeout) {
        ws.terminate()
        wsClients.delete(ws)
        console.log(`Session ${client.sessionId} removed due to inactivity.`)
      }
    }
  }, 60 * 1000)
}

export { createSignalingServer }
