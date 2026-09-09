# Frontend Architecture & Migration Routing

## Overview

As part of the profile-first social workspace roadmap (Issue #1 and Issue #7), the primary publishing workspace has been transitioned to a modern, responsive Vite + React 19 + TypeScript + Tailwind CSS application using a strict monochrome design system and accessible shadcn/Radix primitives.

During this migration stage, the new Vite publishing workspace serves all primary creator and manager operations directly on port 4200. Required legacy Next.js services (social connection callbacks, public preview pages, and browser extension modals) are retained behind an explicit migration routing arrangement until complete cutover in follow-on issues (#13, #14).

## Routing Map

| Route Pattern | Target Service | Port | Description |
|---|---|---|---|
| `/` or `/composer` | Redesigned Vite SPA | 4200 | Multi-channel publishing composer, channel overrides, media reuse |
| `/scheduled` | Redesigned Vite SPA | 4200 | Upcoming scheduled content and status |
| `/calendar` | Redesigned Vite SPA | 4200 | Month/day grid view of scheduled and published posts |
| `/list` | Redesigned Vite SPA | 4200 | Publications listing with per-channel delivery outcomes |
| `/drafts` | Redesigned Vite SPA | 4200 | Saved drafts with local recovery and backend persistence |
| `/login` | Redesigned Vite SPA | 4200 | Session-based authentication (no organization API keys in client) |
| `/api/*` | NestJS Backend | 3000 | Authenticated backend HTTP operations (proxied, stripping `/api`) |
| `/uploads/*` | Nginx / Local Disk | 5000 / 3000 | Static media file delivery |
| `/integrations/social/*` | Retained Next.js | 4201 | OAuth callback handlers for external provider connections |
| `/provider/*` | Retained Next.js | 4201 | Provider preview iframes and connection bridge |
| `/p/*` | Retained Next.js | 4201 | Public post preview sharing links |
| `/modal/*` | Retained Next.js | 4201 | Browser extension cookie authentication modal |
| `/api/uploads/*` | Retained Next.js | 4201 | Legacy non-nginx file streaming route |

## Development Workflow

### Starting Development Services

1. **Backend & Worker**:
   ```bash
   bun run dev:backend
   ```
2. **Redesigned Frontend (Vite)**:
   ```bash
   bun run dev:frontend
   # Serves Vite SPA on http://localhost:4200 with same-origin proxies
   ```
3. **Legacy Handlers (Optional, when testing OAuth callbacks or extension modals)**:
   ```bash
   bun run --cwd apps/frontend dev:legacy
   # Serves legacy Next.js on http://localhost:4201
   ```

### Production Build & Serving

1. **Build Frontend**:
   ```bash
   bun run build:frontend
   # Executes `vite build` into apps/frontend/dist
   ```
2. **Serve Production Frontend**:
   ```bash
   bun run start:prod:frontend
   # Serves apps/frontend/dist via apps/frontend/serve.mjs on port 4200
   ```
3. **Container Deployment**:
   Docker Compose routes port 5000 via Nginx:
   - `/api/` -> NestJS Backend on port 3000
   - `/uploads/` -> static directory
   - Retained legacy paths -> port 4201 with fallback to port 4200
   - All other routes (`/`) -> Vite Frontend on port 4200

## Client Seam Architecture

Browser-to-backend communication uses a typed, browser-safe API client module located at `apps/frontend/src/api/client.ts`. It strictly consumes authenticated HTTP endpoints without importing backend, NestJS, Prisma, or server-side dependencies. This client seam will be replaced with generated contracts in follow-on issue #14.
