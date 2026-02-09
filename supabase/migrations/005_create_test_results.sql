-- Migration: Create test_results table
-- Story: S3-001

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  answers JSONB,
  score NUMERIC,
  audio_url TEXT,
  transcript TEXT,
  human_score NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Policy: candidates can see their own test results
CREATE POLICY "Candidates can read own test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Policy: candidates can insert their own test results
CREATE POLICY "Candidates can create own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Policy: candidates can update their own test results (for saving progress)
CREATE POLICY "Candidates can update own test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Policy: admins can see all test results
CREATE POLICY "Admins can read all test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: admins can update all test results (for human scoring)
CREATE POLICY "Admins can update all test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
