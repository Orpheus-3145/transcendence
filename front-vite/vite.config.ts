import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'


const envVariables: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
    envVariables[`import.meta.env.${key}`] = JSON.stringify(value);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],
  define: envVariables,
  server: {
    watch: {
      usePolling: true
    },
    port: parseInt(process.env.PORT_FRONTEND as string, 10),
    strictPort: true,
    host: '0.0.0.0',
  }
});
