import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { contactApiPlugin } from './vite-plugin-contact-api'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const gifMakerOnly = env.VITE_GIF_MAKER_ONLY === 'true'

  return {
    plugins: [react(), contactApiPlugin()],
    server: {
      host: true,
      port: 5173,
    },
    build: {
      rollupOptions: {
        input: gifMakerOnly
          ? path.resolve(rootDir, 'index.gif-maker.html')
          : path.resolve(rootDir, 'index.html'),
      },
    },
  }
})
