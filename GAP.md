# Gap analysis & prioritized plan

This file summarizes the current repo status relative to the Mason Vector product spec and provides a prioritized, actionable plan to reach a runnable MVP.

## Current coverage
- Claimant entity: CRUD store implemented (`src/lib/claimantStore.ts`) using `data/claimants.json`.
- API endpoints: `/api/claimants` and `/api/claimants/[id]` are implemented.
- Client pages: `/org/[org]/claimants` (list), `/org/[org]/claimants/[id]` (detail), `/org/[org]/claimants/new` (create) exist and wire to the API.
- UI primitives: modal, snackbar, confirm, card, button components exist and are used.
- Dev workflows: Typecheck, build, and a smoke-test CI job were added. Vitest unit test added for the store and runs locally.

## Gaps (short / medium / long term)

Short term (0-2 days)
- Add unit-test job to CI (done).
- Standardize test imports via path-alias or enforce relative imports (Vitest config added).
- Expand unit tests: add tests for API routes (mocking filesystem or using an in-memory adapter).
- Add simple docs (README or developer guide) describing how to run dev, test, and smoke tests locally.

Medium term (1-2 weeks)
- Migrate persistence to SQLite (dev) or add optional Supabase integration; add migration scripts and environment configuration.
- Add more comprehensive E2E tests (Playwright) for the UI flows (create/edit/delete, undo behavior, modals accessibility).
- Add more validation & accessibility improvements (ARIA, keyboard traps, form-level validation feedback).

Long term (months)
- Harden security and dependency updates: periodically run `npm audit` fixes, upgrade Next and React as needed.
- Add feature flags, multi-tenant considerations (per-org isolation beyond a URL param), and auth (e.g., NextAuth, JWT).

## Prioritized plan (next actions)
1. (Now) Add unit-test CI job (completed) and ensure tests pass in CI. CI workflow updated.
2. (Now) Add a `README.dev.md` describing local dev commands and smoke test usage.
3. (Next) Expand unit tests to cover API route handlers and edge cases (missing fields, validation failures).
4. (Next) Migrate data store to SQLite for better dev parity; add adapter layer in `src/lib` to support pluggable backends.
5. (Mid) Add Playwright E2E tests and run them in CI on a matrix (Node versions / browsers).

## Notes
- The current JSON-backed store is acceptable for early dev and fast iteration but should be replaced for production-like testing.
- Vitest config was added so `@/...` path alias can be supported by tests if desired; alternatively relative imports are stable and simple.

---

If you want, I can create `README.dev.md` and start expanding tests (APIs next). Which of the next actions should I start automatically?