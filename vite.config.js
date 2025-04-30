import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/currentsong': {
        target: 'https://listen.ramashamedia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/currentsong/, '/8330/currentsong?sid=1')
      }
    }
  }
})
