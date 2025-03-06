import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:25000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})