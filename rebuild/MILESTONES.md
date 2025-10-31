# Milestones and Estimates

This file describes the milestone plan (MVP → v1 → v2) with rough estimates and acceptance criteria.

## Milestone 0 — Prep (now)
- Tasks: migration runner, initial migrations, seed script, Supabase client stub, file fallback
- Estimate: 0.5–1 day
- Acceptance: migrations runnable via `npm run migrate:ci`; seed script inserts demo rows locally.

## Milestone 1 — MVP
- Tasks:
  - Claimant CRUD API (Supabase + file fallback)
  - Import preview endpoint + duplicate detection
  - Dashboard with StatCards
  - Basic auth scaffold and RLS skeleton
  - Unit/integration tests for core flows
- Estimate: 2–5 days
- Acceptance:
  - Vitest passes for unit/integration tests
  - Production build serves dashboard and claimants pages
  - Import preview flags duplicates for sample CSV

## Milestone 2 — v1
- Tasks:
  - Forms with RHF + Zod, optimistic updates
  - Robust import pipeline (background jobs, retries)
  - Playwright e2e tests for critical flows
  - CI: apply migrations to staging, deployable build
- Estimate: 1–2 weeks

## Milestone 3 — v2
- Tasks:
  - Role/permission management UI
  - Visual polish, tokens, logo asset
  - Accessibility audit and fixes
  - Observability & performance tuning
- Estimate: 2–4 weeks

---
Notes: estimates assume a single engineer working with the current codebase and existing dependencies. Break down further into smaller tickets during implementation.
