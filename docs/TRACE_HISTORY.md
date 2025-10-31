# TraceHistory (dev file-backed)

This project persists simple trace history records for development and testing using a file-backed store.

Where files are stored

- If the environment variable `CLAIMANT_DATA_DIR` is set, trace files are written into that directory. This is used by tests to isolate data.
- Otherwise the repository `data/` directory is used (e.g. `data/trace_history.json`).

File format

- The trace file is a JSON array of records. Each record has the shape:

```json
{
  "id": "<trace-id>",
  "claimant_id": "<claimant-id>",
  "timestamp": "<ISO-8601 timestamp>",
  "type": "skip-trace|reminder|activity|...",
  "payload": { /* service specific data */ },
  "confidence": 0-100 // optional
}
```

Notes

- The file store is intentionally simple and safe for local/dev use. It writes to a temporary `.tmp` file and attempts to rename or copy+unlink on Windows to avoid common rename/lock issues.
- In production you should persist traces to a real database table (the `traceStore` implementation is a development shim).

API

- GET /api/claimants/[id]/traces — returns JSON { traces: TraceRecord[] }

If you'd like, I can add a lightweight Supabase migration and a DB-backed `traceStore` implementation next.
