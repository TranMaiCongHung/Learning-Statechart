import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path' // <-- ĐẢM BẢO CÓ DÒNG NÀY

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vanilla: resolve(__dirname, 'vanilla-app/index.html'),
      },
    },
  },
})