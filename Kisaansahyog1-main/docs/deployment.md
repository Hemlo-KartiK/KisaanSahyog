# KisaanSahyog — Production Deployment & Operations Guide

This guide provides end-to-end instructions for deploying KisaanSahyog across local containers, cloud platforms, and edge networks for production and hackathon demonstration.

---

## 1. Architecture & Services

| Component | Technology | Directory | Production Target |
| :--- | :--- | :--- | :--- |
| **Web Client** | React 18, Vite, Tailwind CSS, Workbox PWA | `apps/web` | Vercel, Netlify, or Nginx Docker |
| **API Server** | Node.js 20, Express, CORS | `apps/api` | Render, Railway, or Node Docker |
| **Agronomy Engine** | TypeScript, ICAR Agronomic Formulas | `packages/skills` | Bundled with Web/API |
| **Shared Contracts** | TypeScript Types, Zod Schemas, i18n | `packages/shared` | Bundled with Web/API |
| **Database** | Supabase (PostgreSQL + RLS) with In-Memory fallback | Cloud / Mock | Supabase Hosted |

---

## 2. Monorepo Orchestration Scripts

The root `package.json` contains unified npm scripts:

```bash
# 1. Clean all dist folders across all workspaces
npm run clean

# 2. Build entire monorepo in topological order (packages -> apps)
npm run build

# 3. Targeted workspace builds
npm run build:shared
npm run build:web
npm run build:api

# 4. Code quality & testing
npm run lint         # ESLint across all packages and apps
npm run typecheck    # TypeScript compiler check
npm run test         # Unit & agronomic calculation tests (Vitest)

# 5. Production run & preview
npm run start:api    # Start compiled API on PORT (default 4000)
npm run preview      # Preview compiled Web PWA on port 4173
```

---

## 3. Containerized Deployment (Docker & Docker Compose)

The easiest way to run the full stack locally or on a VPS (EC2, DigitalOcean, Hetzner):

### Prerequisites
- Docker Engine 24+
- Docker Compose v2+

### Running the Stack

1. **Configure Environment:**
   ```bash
   cp .env.production.example .env
   ```

2. **Build and start services in the background:**
   ```bash
   docker compose up --build -d
   ```

3. **Verify running containers:**
   ```bash
   docker compose ps
   ```

4. **Check health status:**
   - Web PWA: `http://localhost` (or configured `WEB_PORT`)
   - API Health: `http://localhost:4000/health`

5. **Stop services:**
   ```bash
   docker compose down
   ```

---

## 4. Cloud Platform Deployments

### Option A: Web on Vercel + API on Render / Railway

#### 1. Deploy API Server (Render / Railway)
- **Repository:** Connect your GitHub repository.
- **Root Directory:** Repository root (`.`).
- **Build Command:**
  ```bash
  npm ci && npm run build:shared && npm run build:api
  ```
- **Start Command:**
  ```bash
  npm run start:api
  ```
- **Environment Variables:**
  - `NODE_ENV=production`
  - `PORT=4000` (or platform default)
  - `SUPABASE_URL` (optional)
  - `SUPABASE_ANON_KEY` (optional)
  - `SUPABASE_SERVICE_ROLE_KEY` (optional)
- **Health Check Path:** `/health`

#### 2. Deploy Web PWA (Vercel)
- **Repository:** Connect your GitHub repository.
- **Root Directory:** Repository root (`.`) or `apps/web`.
  - If Root Directory is `.`: Vercel will automatically use `vercel.json` from the repository root.
  - If Root Directory is `apps/web`: Vercel will use `apps/web/vercel.json`.
- **Build Command:**
  ```bash
  npm run build -w @kisaansahyog/shared && npm run build -w @kisaansahyog/skills && npm run build -w @kisaansahyog/web
  ```
- **Output Directory:** `apps/web/dist`
- **Environment Variables:**
  - `VITE_API_URL=https://<your-render-api>.onrender.com`
  - `VITE_SUPABASE_URL=https://<your-supabase-ref>.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

---

## 5. Supabase Database Setup

When ready to connect live cloud persistence instead of the resilient in-memory fallback:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Open **SQL Editor**.
4. Run the schema migrations from [`packages/shared/supabase-schema.sql`](../packages/shared/supabase-schema.sql).
5. Copy the Project URL and API keys from **Project Settings > API**.
6. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in API environment, and `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Web environment.

---

## 6. PWA & Offline Readiness Verification

KisaanSahyog includes full Service Worker support configured via `vite-plugin-pwa`:
- Static assets (scripts, CSS, fonts, SVG icons) are cached via **Cache-First** strategy.
- Mandi and listing APIs utilize **Network-First with 2-second timeout**, immediately serving cached telemetry on weak rural 2G connections.
- Offline transaction queue (`apps/web/src/utils/offlineQueue.ts`) caches farmer harvest listings in localStorage and syncs upon network reconnection.
- Service worker update manifests (`sw.js`, `manifest.webmanifest`) are served with `Cache-Control: no-cache` to ensure instant updates.
