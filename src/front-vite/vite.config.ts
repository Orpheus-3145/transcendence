import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const FRONTEND_PORT = process.env.PORT_FRONTEND || '3000'
// const HOST = process.env.ORIGIN_NAME || "localhost"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    },
    // host: HOST,
    port: parseInt(FRONTEND_PORT, 10),
    strictPort: true,
    // open: '/',
    host: '0.0.0.0',
  }
})
