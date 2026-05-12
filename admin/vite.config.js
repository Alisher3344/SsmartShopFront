import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Ttp0xssmart/',
  plugins: [react()],
  cacheDir: 'node_modules/.vite-admin',
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5174,
      clientPort: 5174,
    },
  },
})
