$env:DATABASE_URL='postgres://BAhKbYWjZhjc3fpe@db.lvcnsbedlbnondlzadyl.supabase.co:5432/postgres; npm run migrate:apply:applySupabase integration notes

This repository supports a Supabase-backed persistence layer for `claimants` (server-side). The code is written so that when a server-side Supabase service-role key is present it will use Supabase; otherwise it falls back to the local file-backed store at `data/claimants.json`.

Required environment variables

- NEXT_PUBLIC_SUPABASE_URL — your Supabase project URL (for client-side usage)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — your anon/public API key (client-side)
- SUPABASE_SERVICE_ROLE_KEY — service role (server-only) key used by server routes to perform DB writes
- SUPABASE_URL — optional alternate name for the project URL

Optional: MCP/local creds file

If your environment provides Supabase credentials via an external system (for example a Machine Control Plane or CI), you can opt to write them into a local, gitignored file at `.mcp/supabase.json`. The application will prefer environment variables first, then fall back to this file if present.

Example file format (do NOT commit real secrets):

```json
{
   "url": "https://your-project.supabase.co",
   "anonKey": "public-anon-key-or-empty",
   "serviceRoleKey": "service_role.your_secret_key"
}
```

I included `.mcp/supabase.example.json` in the repo as a template. This approach is opt-in and intended for local tooling or CI agents that can write ephemeral credentials into `.mcp/` before running the app or scripts.

Local env example

Create a `.env.local` (gitignored) and copy from `.env.local.example` in repo root. Example values:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=pub.anonymous.key
SUPABASE_SERVICE_ROLE_KEY=service_role.your_secret_key
SUPABASE_URL=https://your-project.supabase.co

Database migration

A migration SQL file is included at `migrations/create_claimants.sql`. You can apply it using the Supabase CLI or psql.

Using the Supabase CLI (recommended):

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Authenticate and select your project.
3. Run the SQL against your database. If you have a connection string in `DATABASE_URL` you can run:

   supabase db remote set <your-connection-string>
   psql "$DATABASE_URL" -f migrations/create_claimants.sql

# Supabase integration notes

> Security note: do NOT store live DATABASE_URL values, service role keys, or other secrets in tracked files (including this README). Move any connection strings into environment variables, your CI secrets store, or a local `.mcp/supabase.json` file (gitignored).

This repository supports a Supabase-backed persistence layer for `claimants` (server-side). When server-side Supabase credentials are available the app will use Supabase; otherwise it falls back to the local file-backed store at `data/claimants.json` for development and tests.

Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (for client-side usage)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon/public API key (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — service role (server-only) key used by server routes to perform DB writes
- `SUPABASE_URL` — optional alternate name for the project URL

Optional: MCP/local creds file

If your environment provides Supabase credentials via an external system (for example a Machine Control Plane or CI), you can write them into a local, gitignored file at `.mcp/supabase.json`. The application prefers environment variables first, then falls back to this file.

Recommended minimal `.mcp/supabase.json` for local tooling (do NOT commit):

```json
{
  "url": "https://your-project.supabase.co",
  "anonKey": "pub.example.anonymous.key",
  "serviceRoleKey": "service_role.example_key",
  "databaseUrl": "postgres://user:password@db.host:5432/postgres"
}
```

Notes:
- `serviceRoleKey` is used by server-side code that needs elevated privileges (do not expose it to browsers).
- `databaseUrl` is optional; if present the local migration runner (`npm run migrate:apply`) will use it when `DATABASE_URL` is not set in the environment.
- `.mcp/supabase.json` is gitignored by default in this repo; treat it like a secrets file and do not commit it.

Database migration

A set of SQL migration files live in the `migrations/` directory. A small Node migration runner is included that records applied migrations and can apply any `.sql` files in order.

Runner (recommended):

- `npm run migrate:apply` — runs `scripts/apply-migrations.js`. It reads `DATABASE_URL` from the environment or falls back to `.mcp/supabase.json`'s `databaseUrl` field.

One-line PowerShell example (replace with your connection string):

```powershell
$env:DATABASE_URL='postgres://user:password@db.host:5432/postgres'; npm run migrate:apply
```

Or run a single file directly with `psql` if you prefer.

Notes

- The runner creates a `migrations` table to track applied files so it will not reapply the same migration twice.
- The DB user used must have privileges for DDL (CREATE TABLE, etc.).
- Keep secrets out of checked-in files; use environment variables, `.mcp/supabase.json`, or your CI secrets manager.

Programmatic seed helper

There is a seed helper at `scripts/seed.js`. It supports two modes:

- Using `DATABASE_URL` (Postgres connection string): upserts sample rows using `pg`.
- Using `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`: upserts rows using `@supabase/supabase-js` and the service role key.

Run examples (PowerShell):

```powershell
$env:DATABASE_URL='postgres://user:password@host:5432/dbname'
npm run seed
```

Or with Supabase service role:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='service_role.your_secret'
npm run seed
```

Security & RLS

- If you enable Row Level Security (RLS) in Supabase, define appropriate policies for reads/writes. A service role key bypasses RLS and should only be used server-side.
- Never commit the service role key or database connection strings to source control. Use environment variables, `.mcp/supabase.json`, or your CI secrets manager.

Next steps

- Provide `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your deployment environment to use Supabase in production.
- Remove any plain-text `DATABASE_URL` values from documentation, commits, or other files in the repo.
