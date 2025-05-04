import os from 'os'
import fs from 'fs'
import https from 'https'
import path from 'path'
import url, { fileURLToPath } from 'url'
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const VALID_EXTENSIONS = {
  '.html': 'text/html',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv',
  '.geojson': 'application/json',
  '.bin': 'application/octet-stream',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.bmp': 'image/bmp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.dae': 'application/vnd.oipf.dae.svg+xml',
  '.pbf': 'application/octet-stream',
  '.mtl': 'model/mtl',
  '.obj': 'model/obj',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.ttf': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.csv': 'text/csv',
}

function allowPathname(request, response) {
  const parsedUrl = url.parse(request.url)
  let pathname = decodeURIComponent(parsedUrl.pathname)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return null
  }
  if (pathname.endsWith('/')) {
    pathname += 'index.html'
  }
  const sanitizedPath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')
  const distPath = path.join(__dirname, 'dist')
  const resolvedPath = path.join(distPath, sanitizedPath)
  if (!resolvedPath.startsWith(distPath)) {
    response.writeHead(403)
    response.end('Forbidden')
    return null
  }
  const ext = path.extname(resolvedPath).toLowerCase()
  if (!VALID_EXTENSIONS[ext]) {
    response.writeHead(403)
    response.end('Forbidden')
    return null
  }
  return sanitizedPath
}

function readFile(pathname, response) {
  pathname = path.join(__dirname, 'dist', pathname)
  fs.access(pathname, fs.constants.F_OK, (err) => {
    if (err) {
      response.writeHead(404)
      response.end('Not Found: ' + pathname)
      return
    }

    const ext = path.extname(pathname).toLowerCase()
    const fileStream = fs.createReadStream(pathname)

    response.writeHead(200, { 'Content-Type': VALID_EXTENSIONS[ext] })
    fileStream.pipe(response)
    fileStream.on('error', (err) => {
      console.error('File read error:', err)
      if (!response.headersSent) {
        response.writeHead(500)
        response.end('Internal Server Error')
      }
    })
  })
}

function getLocalIPv4() {
  const interfaces = os.networkInterfaces()
  const ipv4Addresses = []
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        ipv4Addresses.push(details.address)
      }
    }
  }
  return ipv4Addresses.length > 0 ? ipv4Addresses[0] : 'localhost'
}

async function fetchDocument(serviceUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: serviceUrl,
      port: 8080,
      path: '/',
      method: 'GET',
      headers: {
        Accept: 'application/json, text/html',
        'User-Agent': 'demo-service/1.0',
      },
      timeout: 5000,
    }

    const req = https.request(options, (res) => {
      let data = ''
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode}`))
      }

      res.setEncoding('utf8')
      res.on('data', (chunk) => (data += chunk))

      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || ''

          if (contentType.includes('application/json')) {
            resolve(JSON.parse(data))
          } else {
            resolve({
              content: data,
              headers: res.headers,
              statusCode: res.statusCode,
            })
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`))
        }
      })
    })

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

async function callGrpcService(host, name) {
  const hello_proto = grpc.loadPackageDefinition(protoLoader.loadSync(__dirname + '/protos/helloworld.proto')).helloworld
  const client = new hello_proto.Greeter(host, grpc.credentials.createInsecure())
  return new Promise((resolve, reject) => {
    client.sayHello({ name }, (err, response) => {
      if (err) reject(err)
      else resolve(response.message)
    })
  })
}

export { allowPathname, readFile, getLocalIPv4, fetchDocument, callGrpcService }
