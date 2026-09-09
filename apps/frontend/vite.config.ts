import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      // Retained legacy Next.js handlers during migration coexistence:
      '/integrations/social': {
        target: 'http://localhost:4201',
        changeOrigin: true,
      },
      '/provider': {
        target: 'http://localhost:4201',
        changeOrigin: true,
      },
      '/p': {
        target: 'http://localhost:4201',
        changeOrigin: true,
      },
      '/modal': {
        target: 'http://localhost:4201',
        changeOrigin: true,
      },
      '/api/uploads': {
        target: 'http://localhost:4201',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4200,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
