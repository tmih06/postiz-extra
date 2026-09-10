/**
 * @file Production SPA static file server and reverse proxy for the Vite frontend.
 *
 * Built on Bun's native HTTP server (`serve`), this script serves pre-built static assets from `dist/`,
 * handles client-side routing via SPA fallback to `dist/index.html`, proxies `/api/*` requests to the
 * backend NestJS API (stripping the `/api` prefix), and forwards retained legacy routes to the
 * Next.js frontend instance on port 4201 during migration coexistence.
 */
import { file, serve } from 'bun';
import path from 'node:path';
import { existsSync } from 'node:fs';

/** Port on which the frontend production server listens (default: 4200, configurable via PORT env). */
const PORT = parseInt(process.env.PORT || '4200', 10);
/** Absolute path to the compiled Vite frontend distribution directory. */
const DIST_DIR = path.join(import.meta.dir, 'dist');
/** Internal upstream URL for the NestJS backend API service. */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000';
/** Upstream URL for legacy Next.js routes during frontend migration. */
const LEGACY_URL = process.env.LEGACY_FRONTEND_URL || 'http://localhost:4201';

serve({
  port: PORT,
  hostname: '0.0.0.0',
  /**
   * Handles incoming HTTP requests by routing between backend API proxy, legacy Next.js proxy,
   * static asset delivery, and single-page application fallback.
   *
   * Routing precedence:
   * 1. `/api/*` -> Rewrites pathname removing `/api` prefix and proxies directly to `BACKEND_URL`.
   * 2. Legacy paths (`/integrations/social`, `/provider`, `/p/`, `/modal`) -> Proxies to `LEGACY_URL`,
   *    falling through if the legacy service is unavailable.
   * 3. Static files -> Returns file from `dist/<pathname>` with automatic MIME resolution if present.
   * 4. SPA fallback -> Returns `dist/index.html` with `text/html` header for client-side routing.
   * 5. Unbuilt fallback -> Returns 503 Service Unavailable if `dist/index.html` is not found.
   *
   * @param req - The standard incoming Web Request object.
   * @returns A Response object containing the proxied response, static asset, or SPA index.
   */
  async fetch(req) {
    const url = new URL(req.url);

    // Proxy /api to backend (stripping /api prefix)
    if (url.pathname.startsWith('/api/')) {
      const backendTarget = new URL(
        url.pathname.replace(/^\/api/, '') + url.search,
        BACKEND_URL
      );
      const headers = new Headers(req.headers);
      headers.set('host', backendTarget.host);
      return fetch(backendTarget.toString(), {
        method: req.method,
        headers,
        body: req.body,
        redirect: 'manual',
      });
    }

    // Proxy retained legacy routes to legacy Next.js service if requested
    if (
      url.pathname.startsWith('/integrations/social') ||
      url.pathname.startsWith('/provider') ||
      url.pathname.startsWith('/p/') ||
      url.pathname.startsWith('/modal')
    ) {
      const legacyTarget = new URL(url.pathname + url.search, LEGACY_URL);
      const headers = new Headers(req.headers);
      headers.set('host', legacyTarget.host);
      try {
        return await fetch(legacyTarget.toString(), {
          method: req.method,
          headers,
          body: req.body,
          redirect: 'manual',
        });
      } catch {
        // Fallback to static SPA if legacy service is not running
      }
    }

    // Static file serving from dist/
    const filePath = path.join(DIST_DIR, url.pathname);
    if (existsSync(filePath) && !url.pathname.endsWith('/')) {
      return new Response(file(filePath));
    }

    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (existsSync(indexPath)) {
      return new Response(file(indexPath), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Building... Please ensure "bun run build:frontend" has run.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
});

console.log(`Frontend production server listening on port ${PORT}`);
