# KisaanSahyog — Task Tracker

This document tracks all 16 phases of the KisaanSahyog Smart India Hackathon project. Each phase builds on the scaffold established in Phase 1.

## Status legend
- [ ] Not started
- [x] In progress / scaffold ready
- [~] Blocked
- [✓] Complete

## Phases

| Phase | Title | Status | Notes |
| --- | --- | --- | --- |
| 1 | Monorepo Scaffold & Stitch UI Integration Setup | [x] | Workspaces, Tailwind, Zustand, bilingual i18n, API stub, shared/skills packages, folder structure for Stitch drops. |
| 2 | Authentication & Farmer/Buyer Onboarding | [ ] | Supabase auth, role selection, district/crop profile, language onboarding. |
| 3 | PWA Setup & Offline Fundamentals | [ ] | Service worker, manifest, install prompt, cache-first shells, offline banner. |
| 4 | Voice Assistant (Hindi/English) | [ ] | ASR/TTS integration, intent routing, advisory voice flow, push-to-talk. |
| 5 | Advisory Engine & Crop Calendar | [ ] | Stage-wise advice, irrigation/fertilizer windows, field notes, reminders. |
| 6 | Skills Engine & Learning Hub | [ ] | Expand `packages/skills` with agronomic calculators, lesson library, progress tracking. |
| 7 | Soil Health Card & Recommendations | [ ] | SHC upload/entry, NPK/pH analysis, organic carbon, actionable splits. |
| 8 | Weather, Alerts & Risk Scoring | [ ] | Forecast, frost/heat/wind alerts, pest risk, 2G-optimized payloads. |
| 9 | Mandi Prices & Market Insights | [ ] | Price feeds, trends, nearby mandis, fallback mock data, rate comparison. |
| 10 | Monorepo Production Polish & Deployment Configs | [✓] | Root scripts, Docker/Docker-compose, Nginx PWA SPA configs, Vercel/Render manifests, CI pipeline, and docs/deployment.md |
| 11 | Requirements Board & Saved Crops | [ ] | Buyer requirements, matching, saved crops, notifications. |
| 12 | AI Chat & FAQ | [ ] | Context-aware chatbot, offline FAQ, guardrails, disclaimer enforcement. |
| 13 | KVK Integration & Knowledge Base | [ ] | KVK contact mapping, sanctioned advisories, curated content sync. |
| 14 | Notifications, Reminders & Analytics | [ ] | Push, SMS-like reminders, usage telemetry (opt-in), engagement metrics. |
| 15 | Testing, Performance & Accessibility | [ ] | Unit/integration/E2E, Lighthouse, accessibility audit, 2G testing. |
| 16 | Deployment, Demo Prep & Final Polish | [ ] | PWA deploy, API hosting, env hardening, demo script, submission checklist. |

## Credentials & Configuration

> Do **not** commit real secrets. Store live credentials in `.env` (local) or your deployment secret manager. Use `.env.example` as the template.

| Variable | Scope | Required | Purpose | Status |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | Web (client) | Yes | Base URL for the KisaanSahyog API. | Template ready |
| `VITE_SUPABASE_URL` | Web (client) | No | Supabase project URL for auth/storage (Phase 2). | Template ready |
| `VITE_SUPABASE_ANON_KEY` | Web (client) | No | Supabase anon key (Phase 2). Browser-safe only when restricted by RLS. | Template ready |
| `PORT` | API (server) | Yes | Port for the Express API (default `3001`). | Template ready |
| `LLM_API_KEY` | API (server) | No | Server-side API key for AI features (Phases 4, 12). Never expose to the browser. | Template ready |

## Notes
- Phase 1 uses mock data and in-memory app state. Real integrations are planned in later phases.
- 2G mode exists in the UI to drive lightweight layouts and reduced payloads.
- KVK disclaimers are wired into shared i18n and the scaffold screen for compliance readiness.
- Hindi is the default language for the pilot to maximize accessibility.
