import fs from 'fs'
import https from 'https'
import { allowPathname, readFile, getLocalIPv4 } from './server-common.js'

const options = {
  // openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/C=JP/ST=Tokyo/L=Chiyoda/O=MyCompany/CN=localhost"
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}

const DEBUG = true
const PORT = 8443

//------------------------------------------------------------------
// Web Server
//------------------------------------------------------------------
const server = https.createServer(options, (request, response) => {
  try {
    let pathname = allowPathname(request, response)
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
createSignalingServer(server, '/signaling', 60 * 60 * 1000, DEBUG)

server.listen(PORT, () => {
  const SERVER_IP_ADDRESS = getLocalIPv4()

  console.log(`Server is running at: https://${SERVER_IP_ADDRESS}:${PORT}/`)
  console.log(`sender: https://${SERVER_IP_ADDRESS}:${PORT}/?p=s`)
})
