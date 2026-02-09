-- Add result_data column (JSONB) for structured test result metadata
-- Used by: Big Five per-trait scores, Vapi call IDs, human scoring criteria
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS result_data JSONB;

-- Allow admins to INSERT test results (needed for human_score upsert)
-- Previously only SELECT and UPDATE were allowed for admins
CREATE POLICY "Admins can insert test results"
  ON test_results FOR INSERT
  WITH CHECK (is_admin());
