# MasonSub — Architecture Overview

This document describes the high-level architecture for MasonSub, its main components, and how data flows between them.

## Components

- Frontend (Next.js App Router)
  - Pages and layouts (global Sidebar/Topbar)
  - UI components (StatCard, ClaimantCard, Forms)
  - Data fetching: @tanstack/react-query with optimistic helpers
  - Client validation: react-hook-form + zod

- Backend / API
  - Next.js server functions (app/api/*) for Claimants, Import preview, Health
  - Data store: Supabase (Postgres) primary; local file-backed fallback in `data/claimants.json`
  - Migrations: `migrations/*.sql` executed by `scripts/migrate.js`

- Ops
  - Seed script: `scripts/seed.js` (requires DATABASE_URL or service role)
  - CI: runs `migrate:ci`, seeds a test DB, runs tests and builds

## Data flow

1. User uploads CSV via the Upload page.
2. The import preview endpoint reads the CSV and runs duplicate detection against `claimants`.
3. The preview returns potential duplicates and a normalized row set to the client.
4. On confirmation, the import pipeline inserts rows (createClaimant) and logs activity.

## Key design decisions

- `id` is a UUID primary key. Legacy external IDs are stored in `external_id` (nullable text).
- Duplicate detection uses exact email, exact external_id/legacy id, and fuzzy name similarity (Levenshtein).
- Migrations are idempotent and versioned under `migrations/`.

## Diagram

See `rebuild/architecture.svg` for a tiny diagram illustrating the components.

---
Produced: 2025-10-31
