import { file, serve } from 'bun';
import path from 'node:path';
import { existsSync } from 'node:fs';

const PORT = parseInt(process.env.PORT || '4200', 10);
const DIST_DIR = path.join(import.meta.dir, 'dist');
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3000';
const LEGACY_URL = process.env.LEGACY_FRONTEND_URL || 'http://localhost:4201';

serve({
  port: PORT,
  hostname: '0.0.0.0',
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
