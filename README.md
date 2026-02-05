# vrx

Video and telemetry visualization using WebRTC.

A web application that visualizes video, audio, and telemetry streams received via WebRTC from [vtx](https://github.com/fpv-jp/vtx).

## Development Setup

The following instructions assume remote development over SSH (e.g., using VS Code Remote SSH) connected to a development machine.

### 1. Start the signaling server

Start the signaling server from [app](https://github.com/fpv-jp/app) for SDP/ICE exchange.

### 2. [Remote] Download the TLS certificates

```sh
curl -L -o server-cert.pem https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-cert.pem
curl -L -o server-key.pem https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-key.pem
```

### 3. [Remote] Add a DNS entry for the server hostname

```bash
sudo vim /etc/hosts

# /etc/hosts
127.0.0.1 fpv
```

### 4. [Remote] Start the dev server

```sh
npm i
npm run dev
```

### 5. [Local] Install the CA certificate in the OS or browser

```sh
curl -L -o server-ca-cert.pem https://raw.githubusercontent.com/fpv-jp/app/refs/heads/main/certificate/server-ca-cert.pem
```

### 6. [Local] Add a DNS entry pointing to the remote machine

```bash
sudo vim /etc/hosts

# /etc/hosts
192.168.xxx.xxx fpv
```

### 7. [Local] Open the application in your browser

[https://fpv:4443](https://fpv:4443)

## Creating a Release

Pushing to the `main` branch (or triggering manually) automatically runs the [Build and Create Release](.github/workflows/build-release.yml) workflow, which:

1. Builds both `public` and `private` modes (`npm run build`)
2. Archives the output (`vrx/public` + `vrx/private`) as `dist.tar.gz`
3. Creates a GitHub Release with a timestamped tag (e.g. `release-20251103-012538`)

To trigger manually, go to **Actions → Build and Create Release → Run workflow** on GitHub.

The release artifact is consumed by [app](https://github.com/fpv-jp/app) to build its Docker images.
