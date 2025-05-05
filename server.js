import http from 'http'
import { allowPathname, readFile, callGrpcService, fetchDocument } from './server-common.js'

const DEBUG = true
const PORT = 8080

//------------------------------------------------------------------
// Web Server
//------------------------------------------------------------------
const server = http.createServer(async (request, response) => {
  try {
    let pathname = allowPathname(request, response)

    // if (pathname === '/helloworld' && request.method === 'GET') {
    //   try {
    //     console.log('/helloworld')
    //     const message = await callGrpcService('demo2-service-xxxxxxxxxx.asia-northeast1.run.app.internal:50051', 'World')
    //     console.log(message)
    //     response.writeHead(200, { 'Content-Type': 'application/json' })
    //     response.end(JSON.stringify({ message }))
    //   } catch (err) {
    //     console.error('gRPC Error:', err)
    //     response.writeHead(500, { 'Content-Type': 'application/json' })
    //     response.end(JSON.stringify({ error: 'Internal Server Error' }))
    //   }
    //   return
    // }

    // if (pathname === '/go' && request.method === 'GET') {
    //   try {
    //     console.log('Fetching document from demo2-service')
    //     const document = await fetchDocument('demo2-service-xxxxxxxxxx.asia-northeast1.run.app.internal')
    //     response.writeHead(200, { 'Content-Type': 'application/json' })
    //     response.end(JSON.stringify(document))
    //   } catch (err) {
    //     console.error('Fetch Error:', err)
    //     response.writeHead(502, { 'Content-Type': 'application/json' })
    //     response.end(
    //       JSON.stringify({
    //         error: 'Bad Gateway',
    //         details: err.message,
    //       }),
    //     )
    //   }
    //   return
    // }

    readFile(pathname, response)
  } catch ({ stack }) {
    response.writeHead(500)
    response.end('Internal Server Error')
    console.error(stack)
  }
})

//------------------------------------------------------------------
// Signaling Server
//------------------------------------------------------------------
import { createSignalingServer } from './signaling-server.js'
createSignalingServer(server, '/signaling', 3 * 60 * 60 * 1000, DEBUG)

server.listen(PORT, '0.0.0.0')
