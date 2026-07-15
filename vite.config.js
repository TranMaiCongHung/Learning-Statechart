import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),       // Trang chủ React
        vanilla: resolve(__dirname, 'vanilla-app/index.html'), // Trang Vanilla JS
      },
    },
  },
})
