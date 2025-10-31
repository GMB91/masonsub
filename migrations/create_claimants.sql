-- Migration: create claimants table
-- Run with psql or the supabase CLI: `psql <CONN_STRING> -f migrations/create_claimants.sql`

CREATE TABLE IF NOT EXISTS claimants (
  id text PRIMARY KEY,
  org text NOT NULL DEFAULT 'demo',
  name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  city text,
  amount numeric,
  status text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_claimants_org ON claimants (org);
CREATE INDEX IF NOT EXISTS idx_claimants_email ON claimants (email);
