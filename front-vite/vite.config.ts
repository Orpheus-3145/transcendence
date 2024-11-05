import { defineConfig } from 'vite'
import fs from 'fs';
import react from '@vitejs/plugin-react'

// Define which environment variables are safe to expose
// const safeEnvVars = ['URL_BACKEND', 'URL_FRONTEND', 'PORT_BACKEND', 'PORT_FRONTEND'];

const envVariables: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
  // if (key.startsWith('URL_') || key.startsWith('PORT_')) {
    envVariables[`import.meta.env.${key}`] = JSON.stringify(value);
  // }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: envVariables,
  server: {
    watch: {
      usePolling: true
    },
    port: parseInt(process.env.PORT_FRONTEND as string, 10),
    strictPort: true,
    host: '0.0.0.0',
    https: {
      key: String(fs.readFileSync(process.env.SSL_KEY_PATH as string)),
      cert: String(fs.readFileSync(process.env.SSL_CERT_PATH as string)),
      requestCert: false,
      ca: [
        String(fs.readFileSync(process.env.SSL_CERT_PATH as string)),
      ],
    },
    // rejectUnauthorized: false, // Solo se non vuoi validare i certificati client
    // proxy: {     //Se stai facendo delle chiamate al backend in sviluppo e vuoi evitare problemi di CORS usa proxy
    //   '/api/channels/mychats': {
    //     target: 'http://backend:4000/',
    //     changeOrigin: false,
    //     secure: false,
    //     // rewrite: (path: string) => path.replace(/^/api/, ''),
    //   },
    // },
  }
});
