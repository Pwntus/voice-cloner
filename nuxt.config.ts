export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'vercel'
  },
  sourcemap: {
    server: false,
    client: false
  },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Voice cloner',
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      meta: [
        { hid: 'charset', charset: 'utf-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        {
          hid: 'viewport',
          name: 'viewport',
          content:
            'width=device-width,height=device-height,initial-scale=1.0,user-scalable=0,minimum-scale=1.0,maximum-scale=1.0,viewport-fit=cover'
        },

        { hid: 'author', name: 'author', content: 'Pontus Aurdal' },
        {
          hid: 'description',
          name: 'description',
          content: 'Clone your own voice!'
        },
        {
          hid: 'og:type',
          name: 'og:type',
          property: 'og:type',
          content: 'website'
        },
        {
          hid: 'og:title',
          name: 'og:title',
          property: 'og:title',
          content: 'Voice Cloner'
        },
        {
          hid: 'og:description',
          name: 'og:description',
          property: 'og:description',
          content: 'Clone your own voice!'
        },
        {
          hid: 'msapplication-TileColor',
          name: 'msapplication-TileColor',
          content: '#ffffff'
        },
        { hid: 'theme-color', name: 'theme-color', content: '#ffffff' },
        {
          hid: 'mobile-web-app-capable',
          name: 'mobile-web-app-capable',
          content: 'yes'
        },
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          content: 'pontus-sofia.fi'
        }
      ],
      script: [],
      style: []
    }
  }
})
