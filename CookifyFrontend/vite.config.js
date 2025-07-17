import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    hmr: {
      port: 5174,
      host: 'localhost',
      protocol: 'ws'
    },
    strictPort: true
  }
})
