Import pipeline — Iteration 1 spec

Goal
----
Implement a robust CSV import pipeline with a preview UI that detects duplicates and allows selective importing.

Contract
--------
- Input: multipart/form-data (file + mapping + org) or JSON rows array
- Preview output: { total, duplicates: [{ row, matches: [{ id, name, external_id? }] }] }
- Import commit: accepts rows array and skipDuplicates flag

Acceptance criteria
-------------------
- Server parses CSV reliably (handles quoted fields, CRLF, headers)
- Duplicate detection uses email exact match, claimId exact match, and fuzzy name match
- Preview returns matches with `external_id` where applicable
- Import commit inserts new records and avoids duplicates when requested

Next steps to implement
-----------------------
1. Add robust CSV parser utility (reuse `src/lib/csvImport.ts`) and ensure it supports streaming large files.
2. Strengthen duplicate detector (edge cases, performance) and add integration tests.
3. Improve import API to accept `rows` JSON as well as file+mapping and return structured errors per row.
4. UI: show `external_id` and allow forcing creation per-row.

Notes
-----
- We'll ensure migrations include `external_id` and an index (already present in `0001_init.sql`).
- We'll add tests to cover preview and import commit paths (happy & error cases).
