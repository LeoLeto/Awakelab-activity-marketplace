import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8100',
      '/auth': 'http://localhost:8100',
      '/admin': 'http://localhost:8100',
      '/thumbs': 'http://localhost:8100',
    },
  },
})
