import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja',
  title: 'VRX',
  description: 'WebRTC FPV Video Receiver — ドローン映像・テレメトリをブラウザで受信',

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    nav: [
      { text: 'ガイド', link: '/guide/getting-started' },
      { text: 'プラットフォーム', link: '/platforms/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'ガイド',
          items: [
            { text: 'はじめに', link: '/guide/getting-started' },
            { text: 'アーキテクチャ', link: '/guide/architecture' },
            { text: 'ビルド', link: '/guide/build' },
          ],
        },
      ],
      '/platforms/': [
        {
          text: 'プラットフォーム',
          items: [
            { text: '概要', link: '/platforms/' },
            { text: 'Apple Mac', link: '/platforms/apple-mac' },
            { text: 'Linux x86', link: '/platforms/linux-x86' },
            { text: 'Raspberry Pi 4', link: '/platforms/raspberry-pi-4' },
            { text: 'Raspberry Pi 5', link: '/platforms/raspberry-pi-5' },
            { text: 'Jetson Nano 2GB', link: '/platforms/jetson-nano' },
            { text: 'Jetson Orin Nano Super', link: '/platforms/jetson-orin' },
            { text: 'Radxa ROCK 5', link: '/platforms/radxa-rock5' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/fpv-jp/vrx' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © fpv-jp',
    },

    search: {
      provider: 'local',
    },
  },
})
