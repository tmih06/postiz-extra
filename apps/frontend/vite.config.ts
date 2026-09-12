/**
 * @file Vite configuration for the Postiz frontend application.
 *
 * Configures the development server, build pipeline, dependency pre-bundling, path aliases,
 * and reverse proxy mappings for both the NestJS backend and legacy Next.js services.
 *
 * Key configuration aspects:
 * - Dev Server: Listens on `0.0.0.0:4200`.
 * - Path Aliases: Maps `@/` to `apps/frontend/src/`.
 * - API Proxy: Rewrites and forwards `/api/*` to the NestJS backend on port 3000 (`BACKEND_INTERNAL_URL`).
 * - Legacy Next.js Proxy: Forwards `/integrations/social`, `/provider`, `/p`, `/modal`, and `/api/uploads`
 *   to the legacy Next.js server on port 4201 during migration coexistence.
 * - Optimization: Pre-bundles common React and Radix UI dependencies for faster cold starts.
 * - Build: Emits clean production artifacts into `dist/`.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@gitroom/helpers': path.resolve(import.meta.dirname, '../../libraries/helpers/src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'clsx',
      'tailwind-merge',
    ],
  },
  server: {
    port: 4200,
    host: '0.0.0.0',
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
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
