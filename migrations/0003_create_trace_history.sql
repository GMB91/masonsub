-- Create trace_history table for storing skip-traces, reminders, and activities

CREATE TABLE IF NOT EXISTS public.trace_history (
  id uuid PRIMARY KEY,
  claimant_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  payload jsonb NOT NULL,
  confidence integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trace_claimant_id ON public.trace_history(claimant_id);
CREATE INDEX IF NOT EXISTS idx_trace_timestamp ON public.trace_history(timestamp DESC);
