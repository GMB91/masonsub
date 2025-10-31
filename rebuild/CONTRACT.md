Rebuild — Contract & Scope (iteration 1)

Purpose
-------
Define concise, testable contracts for the first iteration (Claimant CRUD + CSV import preview).

Primary endpoints (server-side)
-------------------------------
1) GET  /api/claimants
   - Query params: org?: string, q?: string
   - Returns: { claimants: Claimant[] }

2) GET  /api/claimants/:id
   - Returns: { claimant: Claimant | null }

3) POST /api/claimants
   - Body: Partial<ClaimantInput> (name required)
   - Returns: { claimant: Claimant }

4) PATCH /api/claimants/:id
   - Body: Partial<ClaimantInput>
   - Returns: { claimant: Claimant }

5) DELETE /api/claimants/:id
   - Returns: { success: boolean }

6) POST /api/import/preview
   - Body: multipart/form-data { file, mapping, org }
   - Returns: { total: number, duplicates: Array<{ row: number, matches: Array<Match> }> }

7) POST /api/import
   - Body: multipart/form-data or application/json { rows or file+mapping }
   - Returns: { imported: number, duplicates: number, errors: Array<{row:number,error:string}> }

Data shapes (TypeScript-like)
----------------------------
interface Claimant {
  id: string // uuid
  external_id?: string // legacy id if present
  org: string
  name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  city?: string
  amount?: number
  status?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

interface ClaimantInput {
  external_id?: string
  org?: string
  name: string
  email?: string
  phone?: string
  claimAmount?: number
  claimId?: string
  source?: string
}

interface Match {
  id: string
  name: string
  external_id?: string
}

Error modes
-----------
- Validation error: return 400 with details
- Auth/permission error: 403
- DB error / transient: 502 with retry guidance

Acceptance tests (high-level)
-----------------------------
- CRUD roundtrip: create -> read -> update -> delete
- Import preview: given a CSV with 2 rows, where one matches existing claimant, preview returns duplicate for that row
- Import commit: skipDuplicates true leads to only non-duplicate rows inserted

Next actions I will take automatically
--------------------------------------
1) Scaffold `src/app/api/claimants` route handlers (files only) with typed stubs and tests.
2) Add migration skeleton `migrations/0001_init.sql` (idempotent schema).
3) Add minimal react-query hooks `src/lib/hooks/useClaimants.ts` if missing.

If this matches your intent I'll begin implementing step (1) now: create the API route files and tests and run the test suite.
