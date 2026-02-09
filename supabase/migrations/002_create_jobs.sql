-- Migration: Create jobs table (multi-country support)
-- Story: S1-008

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  country TEXT NOT NULL,
  salary_amount NUMERIC NOT NULL,
  salary_currency TEXT NOT NULL,
  salary_label TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'Freelance',
  location TEXT NOT NULL DEFAULT 'Télétravail',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  test_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (including anonymous) can read open jobs
CREATE POLICY "Anyone can read open jobs"
  ON jobs FOR SELECT
  USING (status = 'open');

-- Policy: admins can do everything on jobs
CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
