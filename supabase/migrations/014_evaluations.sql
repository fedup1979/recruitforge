-- Migration: Evaluations table for multi-evaluator scoring
-- Replaces hardcoded human_score in test_results with a proper evaluation system

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  test_definition_id UUID NOT NULL REFERENCES test_definitions(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES profiles(id),
  scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC,
  max_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, test_definition_id, evaluator_id)
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage evaluations"
  ON evaluations FOR ALL
  USING (is_admin());

CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
