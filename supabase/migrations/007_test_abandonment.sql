-- Migration: Add test abandonment and retry tracking
-- Story: S3-006

-- Add columns for tracking test progress and retries
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS progress JSONB;

-- Comment: Test abandonment logic
-- - When a test is started, started_at is set
-- - Progress is saved on each answer (progress column)
-- - If not completed within 24h, a scheduled job marks it abandoned_at = now()
-- - retry_count tracks how many times the test was attempted
-- - Max 1 retry allowed (retry_count < 2)
-- - Abandoned tests can be resumed within 24h (check started_at + 24h > now())
