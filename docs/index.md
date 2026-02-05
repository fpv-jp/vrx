---
layout: home

hero:
  name: VRX
  text: FPV Video Receiver
  tagline: WebRTC でドローンの映像・テレメトリをブラウザで受信する
  actions:
    - theme: brand
      text: はじめる
      link: /guide/getting-started
    - theme: alt
      text: アーキテクチャを見る
      link: /guide/architecture

features:
  - icon: 📡
    title: WebRTC P2P
    details: シグナリングサーバーを中継し、SBC（Jetson / RPi）やスマホからブラウザへダイレクトに低遅延で映像を受信。
  - icon: 🎬
    title: 多コーデック対応
    details: H.264 / H.265 / VP8 / VP9 / AV1 に対応。プラットフォームごとのハードウェアエンコーダー（VA-API、VideoToolbox、NVCODEC）を自動選択。
  - icon: 🛸
    title: テレメトリ HUD
    details: IMU クォータニオン → Euler 角変換で Roll / Pitch / Yaw をリアルタイム表示。GNSS・バッテリー・WiFi 情報も重畳。
  - icon: 🔴
    title: ブラウザ内録画
    details: VideoEncoder + mp4-muxer で映像と HUD を合成した MP4 をワンクリックで録画・ダウンロード。サーバー不要。
---
