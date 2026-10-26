# KisaanSahyog

KisaanSahyog is a mobile-first PWA for the Smart India Hackathon (SIH) designed to help smallholder farmers with crop advisory, soil health, mandi prices, buyer discovery, and practical skills in Hindi and English. Stitch UI screens can be dropped into the scaffold as they are delivered.

## Tech stack

- **Monorepo:** npm workspaces (`packages/*`, `apps/*`)
- **Web:** Vite + React + TypeScript + Tailwind CSS + Zustand + Workbox PWA
- **API:** Node.js + Express + Supabase / In-Memory Fallback
- **Shared contracts:** TypeScript + Zod schemas + Hindi/English i18n dictionaries
- **Skills engine:** Pure TypeScript agronomic helpers (Vitest verified)
- **Data:** Mock datasets in `data/`
- **Docs:** Project tracking and deployment guides in `docs/`

## Project structure

```text
apps/
  web/     # Vite PWA (Stitch UI zone)
  api/     # Express health-check API & Telemetry
packages/
  shared/  # Types, schemas, constants, bilingual i18n
  skills/  # Agronomic calculation engine
data/      # Knowledge base and mock datasets
docs/      # TASKS.md and technical documentation
```

## Quick start

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build shared packages:
   ```bash
   npm run build:shared
   ```

4. Run the app in development:
   ```bash
   npm run dev
   ```

   Or run individual services:
   ```bash
   npm run dev:web
   npm run dev:api
   ```

5. Build everything across all workspaces:
   ```bash
   npm run build
   ```

   Or build targeted workspaces:
   ```bash
   npm run build:shared
   npm run build:web
   npm run build:api
   ```

6. Clean all build outputs:
   ```bash
   npm run clean
   ```

7. Preview the web build:
   ```bash
   npm run preview
   ```

8. Start the API in production mode after building:
   ```bash
   npm run start:api
   ```

9. Run tests & code quality checks:
   ```bash
   npm run test
   npm run typecheck
   npm run lint
   ```

## Docker & Container Deployment

To launch the full production stack (Nginx PWA + Express API) with healthchecks:

```bash
docker compose up --build
```

- **Web PWA:** http://localhost:80
- **API Health:** http://localhost:4000/health

See [docs/deployment.md](docs/deployment.md) for full deployment instructions (Docker, Vercel, Render, Supabase).

## Environment variables

See `.env.example` and `.env.production.example` for the full list. Browser-exposed values must be prefixed with `VITE_`.

## Where to add Stitch UI

- **Page-level screens:** `apps/web/src/screens/` (use `ScaffoldScreen` as a drop-in pattern)
- **Reusable components:** `apps/web/src/components/stitch/` (buttons, gauges, cards, badges)
- **Layouts:** `apps/web/src/components/layout/` (TopBar, BottomNav)
- **App state:** `apps/web/src/store/useAppStore.ts` (language, role, tabs, 2G mode, voice)

The Phase 1 scaffold sets a mobile-first `max-w-md` container, bilingual copy, role switching, 2G/data-saver state, and a voice assistant entry point ready for later phases.
