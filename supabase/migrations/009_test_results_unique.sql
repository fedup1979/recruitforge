-- Migration: Add unique constraint for upsert on test_results
-- Story: S4-006

-- Allow upsert by application_id + test_type
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_results_app_type
  ON test_results (application_id, test_type);
