-- 0002_external_id_unique_partial.sql
-- Add a partial unique index for external_id so legacy ids are unique when present.

DO $$
BEGIN
  -- if the claimants table doesn't exist yet, skip and print a notice
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'claimants') THEN
    RAISE NOTICE 'claimants table does not exist; skipping external_id index creation';
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_claimants_external_id_unique'
    ) THEN
      -- create a unique partial index: only enforce uniqueness when external_id IS NOT NULL
      CREATE UNIQUE INDEX idx_claimants_external_id_unique ON claimants (external_id) WHERE external_id IS NOT NULL;
    END IF;
  END IF;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'migration skipped: table not present';
END $$;
