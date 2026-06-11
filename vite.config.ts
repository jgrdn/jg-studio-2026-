import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { contactApiPlugin } from './vite-plugin-contact-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contactApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
