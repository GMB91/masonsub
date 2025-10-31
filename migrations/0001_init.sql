-- 0001_init.sql — initial schema for claimants (id as UUID)
-- Idempotent: safe to run multiple times.

-- Ensure uuid generator is available (pgcrypto provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS claimants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
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

-- Add helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_claimants_org ON claimants (org);
CREATE INDEX IF NOT EXISTS idx_claimants_external_id ON claimants (external_id);
CREATE INDEX IF NOT EXISTS idx_claimants_email ON claimants (email);

-- If the older text-based table exists (legacy), do not alter types automatically — keep safe and additive only.
