import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Ojo: NO se puede proxyear '/admin' — son rutas de la SPA (el panel
      // de administracion). El API del panel cuelga de '/api/admin'.
      '/api': 'http://localhost:8100',
      '/auth': 'http://localhost:8100',
      '/thumbs': 'http://localhost:8100',
    },
  },
})
