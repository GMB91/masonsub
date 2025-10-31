Supabase integration notes

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

Or directly with psql (example):

   PGPASSWORD=<db_password> psql -h <db_host> -U <db_user> -d <db_name> -f migrations/create_claimants.sql

Notes

- The migration creates a `claimants` table with a text `id` primary key to match the existing application IDs. If you'd prefer UUIDs, adjust the `id` column and update code that creates IDs.
- Indexes for `org` and `email` are created to speed up typical queries.

Seeding data

You can insert seed rows with plain SQL or use the existing local seed at `src/lib/data/seed.ts` to generate JSON rows and insert them manually using SQL or via the Supabase SQL editor.

Programmatic seed helper

I included a runtime seed helper at `scripts/seed.js`. It supports two modes:

- `DATABASE_URL` (Postgres connection string): will upsert sample rows using `pg`.
- `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`: will upsert sample rows using `@supabase/supabase-js` and the service role key.

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

- If you enable Row Level Security (RLS) in Supabase, define appropriate policies for reads/writes (service role key bypasses RLS; use for server-only operations).
- Never commit the service role key to source control. Use environment variables on your deployment platform.

Next steps

- Provide `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your deployment environment to use Supabase in production.
- Optionally adapt the `id` column to UUIDs and add migrations if you prefer database-generated IDs.
