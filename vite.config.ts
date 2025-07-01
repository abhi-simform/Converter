import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/Converter/favicon.svg', '/Converter/favicon.ico', '/Converter/apple-touch-icon.png', '/Converter/web-app-manifest-192x192.png', '/Converter/web-app-manifest-512x512.png'],
      manifest: {
        name: 'MKV to MP4 Converter',
        short_name: 'MKV2MP4',
        description: 'Fast, client-side MKV to MP4 converter using FFmpeg.wasm',
        theme_color: '#667eea',
        background_color: '#242424',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '/Converter/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Converter/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Converter/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  base: "/Converter"
})
