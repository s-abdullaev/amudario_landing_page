import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'jayhun-trap': resolve(__dirname, 'jayhun-trap.html'),
        'oxus-airsense': resolve(__dirname, 'oxus-airsense.html'),
        'oxus-ws': resolve(__dirname, 'oxus-ws.html'),
        'gozanlink': resolve(__dirname, 'gozanlink.html'),
      },
    },
  },
})
