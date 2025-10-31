# CSV Import / Temporary Snapshot Storage

This project stores temporary import snapshots under `tmp/imports/` when a user uploads a CSV for preview and mapping.

Behavior
- When a CSV is uploaded via the upload page, the server creates a snapshot JSON file in `tmp/imports/{id}.json` containing:
  - `id` — snapshot id
  - `org` — organization id
  - `suggestedMapping` — inferred header mapping (detailed shape with `top` + `alternatives`)
  - `preview` — first N parsed rows
  - `headers` — original CSV headers
  - `mapped` — optional mapped preview written after the user applies mappings

Cleanup
- Temporary snapshots are considered ephemeral. The included cleanup script (`scripts/cleanup-imports.js`) deletes files older than a TTL (default 24 hours).
- The TTL can be configured with the environment variable `IMPORT_TMP_TTL_HOURS` (integer hours).
- You can run the cleanup manually with the npm script:

```powershell
npm run cleanup:imports
```

Automation
- A GitHub Actions workflow `.github/workflows/cleanup-imports.yml` is provided to run the cleanup on a schedule (daily at 02:00 UTC) and can be triggered manually.
- Optionally set the `IMPORT_TMP_TTL_HOURS` secret in your repository to change the TTL for the scheduled run.

Security & notes
- These snapshots may contain PII from uploaded CSVs — ensure `tmp/` is not publicly served and is rotated/deleted according to your data retention policies.
- For production, consider storing snapshots in a private object store (S3, Supabase storage) with lifecycle policies and stronger access controls.
