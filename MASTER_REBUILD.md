MASTER REBUILD — Full project rebuild plan

Goal
----
Execute a focused "Master Prompt" full rebuild to deliver a production-quality Next.js + Supabase application with:
- Robust data layer (Supabase/Postgres) with migrations and RLS
- Server actions and typed client/server contracts
- Full forms (react-hook-form + zod) and import pipeline
- Duplicate detection and import preview UX
- AI assistant/chat integration (optional, pluggable)
- Comprehensive tests and CI/CD for migrations, builds, and deploys

High-level contract (MVP)
-------------------------
Inputs:
- CSV import files (up to 1k rows)
- UI actions (create/update/delete claimants)
- Authenticated users with role-based access

Outputs:
- Persisted claimants in Postgres (UUID primary keys, optional external_id)
- Import preview with duplicate detection results
- Server responses following JSON API with typed shapes
- Full test coverage for core flows

Success criteria (MVP):
- Claimant CRUD implemented server-side and wired in UI
- CSV import with preview and duplicate detection works end-to-end
- Migrations are tracked and runnable in CI via `npm run migrate:ci`
- Tests (unit + integration) pass in CI
- RLS policies in place for basic role model

Milestones
----------
MVP (target first):
1. Define contract & scope (this is where we are now)
2. DB migrations + seed helpers + migration runner
3. Claimant CRUD server layer + react-query hooks
4. CSV import preview + duplicate detection
5. Forms, validations, and UX polish
6. Tests: unit + API integration tests
7. CI: migrations + tests + build

v1+:
- Auth/RLS polish, performance tuning, AI assistant integration, e2e tests, accessibility audits

Immediate next steps (iteration 1)
---------------------------------
- Produce a short, machine-readable contract file (rebuild/CONTRACT.md).
- Implement migrations skeleton (migrations/0001_init.sql) and add a migration runner script if missing.
- Implement Claimant CRUD API routes and simple react-query hooks.
- Add 3–5 unit tests for CRUD and import preview.

Risks & assumptions
-------------------
- Supabase project credentials and service-role keys are required for remote migrations and seeding.
- We'll avoid destructive migrations in-place; prefer additive/idempotent SQL.
- Some features (AI agents, animations) will be implemented after core flows are stable.

Notes
-----
- I'll break the work into small PR-sized changes and run tests after each change.
- If you want a different priority (e.g., focus on AI features first), tell me and I'll reprioritize.

Contact
-------
I'll update the project's todo list and create a `rebuild/` folder for specs and initial work.
