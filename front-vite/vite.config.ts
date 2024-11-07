import { defineConfig } from 'vite'
import fs from 'fs';
import react from '@vitejs/plugin-react'


const envVariables: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
    envVariables[`import.meta.env.${key}`] = JSON.stringify(value);
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
      ca: [
        String(fs.readFileSync(process.env.SSL_CERT_PATH as string)),
      ],
    },
  }
});
