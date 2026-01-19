# vrx
video and telemetry visualization using webrtc

# ⚠️ Documentation is currently being written.


## Local development steps

1. Save the certificates locally
```sh
curl -L -o server-cert.pem https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-cert.pem

curl -L -o server-key.pem https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-key.pem
```

2. Add DNS entry
``` bash
sudo vim /etc/hosts

# /etc/hosts
127.0.0.1       localhost fpv
```

3. Install the CA certificate in the OS or browser
```sh
curl -L -o https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-ca-cert.pem
```

4. Start the web app
```sh
npm i
npm run dev
```

5. Open this in your browser
[https://localhost:4443](https://localhost:4443)
