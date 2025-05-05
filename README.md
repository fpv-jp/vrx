# vrx
## video and telemetry visualization using webrtc

![Demo](demo.gif)

### Demo Instructions

1. On your **PC**, open the following URL:  
   [https://fpv.jp](https://fpv.jp)

2. On your **smartphone**, open this URL:  
   [https://fpv.jp/?p=s](https://fpv.jp/?p=s)  
   A **Sender ID** will be displayed.

3. On your **PC**, select the Sender ID shown on your smartphone and click **Start**.

> ⚠️ Please allow access to the **camera**, **microphone**, **motion sensors**, and **location** when prompted.  
> Recommended browser: **Google Chrome**  
> Recommended codec: **VP9** or similar.  
> If it doesn’t work at first, try reloading the page a few times.

## 📦 Usage

### 🧪 Local Development

1. **Generate a self-signed TLS certificate**

Modern browsers require HTTPS to access device features such as **sensors**, **camera**, **microphone**, and **GPS**. To enable TLS in local development, generate a self-signed certificate using OpenSSL:

```sh
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/C=JP/ST=Tokyo/L=Chiyoda/O=MyCompany/CN=localhost"
```

2. **Start the signaling server on port `8443`**

This server handles WebRTC signaling via WebSocket and must run over HTTPS.

```sh
npm install
npm run server

# Example output:
# Server is running at: https://192.168.1.1:8443/
# sender: https://192.168.1.1:8443/?p=s
```

> ⚠️ The signaling server must run on port **8443** to ensure compatibility with client behavior and service expectations.

3. **Launch the Vite development server on port `8444`**

This serves the front-end application and supports hot-reload during development.

```sh
npm run dev

# Example output:
# ➜  Local:   https://localhost:8444/
# ➜  Network: https://192.168.1.1:8444/
```

4. **Open the application in a browser**

* On desktop:
  [https://192.168.1.1:8444/](https://192.168.1.1:8444/)
* On a smartphone (as a sender):
  [https://192.168.1.1:8444/?p=s](https://192.168.1.1:8444/?p=s)

> 📱 On the sender device (smartphone), select the displayed Sender ID and press **Start** to initiate the connection.

---

### 🧪 Preview Mode (Production Simulation)

1. **Build the application**

```sh
npm run build
```

2. **Preview the production build**

Start the signaling server (`server-local.js`) using `npm run server`, then open:

> ℹ️ `server-local.js` is used for local development and launches an HTTPS server with both web and WebSocket signaling combined. For production, `server.js` is used, which runs over HTTP in environments like Cloud Run.

* On desktop:
  [https://192.168.1.1:8443/](https://192.168.1.1:8443/)
* On smartphone:
  [https://192.168.1.1:8443/?p=s](https://192.168.1.1:8443/?p=s)

> In preview mode, all static assets are served from the `dist/` directory. This simulates the production environment without deploying to Cloud Run.
