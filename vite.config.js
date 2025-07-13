import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/signup': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/logout': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/add': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/remove': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/update': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/export': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});