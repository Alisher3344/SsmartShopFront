import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 - boshqa qurilmalardan ham kirish mumkin
    allowedHosts: true, // localtunnel/ngrok tunnel domenlariga ruxsat
  },
})
