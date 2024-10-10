import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define which environment variables are safe to expose
const safeEnvVars = ['ORIGIN_URL_BACK', 'ORIGIN_URL_FRONT', 'PORT_BACKEND', 'PORT_FRONTEND'];

const envVariables: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
  if (safeEnvVars.includes(key)) {
    envVariables[`import.meta.env.${key}`] = JSON.stringify(value);
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: envVariables,
  server: {
    watch: {
      usePolling: true
    },
    // host: HOST,
    port: parseInt(process.env.PORT_FRONTEND || '3000', 10),
    strictPort: true,
    // open: '/',
    host: '0.0.0.0',
  }
})
