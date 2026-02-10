-- Migration: Test management system
-- Creates test_definitions, job_tests, job_personality_profiles, candidate_documents tables

-- Ensure is_admin() exists (idempotent)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Table: test_definitions
-- Catalog of available tests (system + configurable)
-- ============================================================
CREATE TABLE IF NOT EXISTS test_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('system', 'configurable')),
  duration_label TEXT,
  url_template TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  requires_consent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE test_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active test definitions"
  ON test_definitions FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage test definitions"
  ON test_definitions FOR ALL
  USING (is_admin());

CREATE TRIGGER test_definitions_updated_at
  BEFORE UPDATE ON test_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed built-in tests
INSERT INTO test_definitions (slug, label, description, category, duration_label, url_template, requires_consent, config) VALUES
  ('big_five', 'Test de personnalite (Big Five)', 'Questionnaire de personnalite IPIP-NEO-120 mesurant les 5 grandes dimensions.', 'system', '~15 min', '/test/bigfive', 'personality', '{}'),
  ('intelligence', 'Test de raisonnement logique', 'Matrices progressives de Sandia pour evaluer le raisonnement abstrait.', 'system', '~15 min', '/test/intelligence', NULL, '{}'),
  ('quiz', 'Quiz connaissances produit', 'Quiz evaluant la comprehension des produits et services.', 'configurable', '~10 min', '/test/quiz', NULL, '{}'),
  ('roleplay', 'Roleplay vocal (Simulation d''appel)', 'Simulation d''appel telephonique evaluee par IA vocale.', 'configurable', '~15 min', '/test/roleplay', NULL,
   '{"criteria": [{"key": "ouverture", "label": "Ouverture", "description": "Naturelle, chaleureuse"}, {"key": "qualification", "label": "Qualification", "description": "Questions pertinentes, ecoute"}, {"key": "objections", "label": "Gestion objections", "description": "Repond avec assurance, rebondit"}, {"key": "closing", "label": "Closing", "description": "Demande claire, assume"}, {"key": "ton", "label": "Ton general", "description": "Chaleureux, souriant"}, {"key": "ecoute", "label": "Ecoute", "description": "Reformule, adapte"}]}'),
  ('video_presentation', 'Presentation video', 'Enregistrement video de presentation du candidat.', 'configurable', '~5 min', '/test/video', 'video_recording',
   '{"criteria": [{"key": "presentation", "label": "Presentation", "description": "Clarte, structure du discours"}, {"key": "motivation", "label": "Motivation", "description": "Enthousiasme et interet pour le poste"}, {"key": "experience", "label": "Experience", "description": "Pertinence du parcours"}, {"key": "communication", "label": "Communication", "description": "Aisance verbale, diction"}, {"key": "impression", "label": "Impression generale", "description": "Professionnalisme, presentation"}]}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Table: job_tests
-- Links tests to jobs with ordering, weights, thresholds
-- ============================================================
CREATE TABLE IF NOT EXISTS job_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  test_definition_id UUID NOT NULL REFERENCES test_definitions(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  weight NUMERIC DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  threshold NUMERIC CHECK (threshold IS NULL OR (threshold >= 0 AND threshold <= 100)),
  is_required BOOLEAN DEFAULT true,
  requires_status TEXT,
  config_override JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, test_definition_id)
);

ALTER TABLE job_tests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read job_tests for open jobs
CREATE POLICY "Authenticated can read job tests for open jobs"
  ON job_tests FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_tests.job_id AND (jobs.status = 'open' OR is_admin())
    )
  );

CREATE POLICY "Admins can manage job tests"
  ON job_tests FOR ALL
  USING (is_admin());

-- ============================================================
-- Table: job_personality_profiles
-- Ideal Big Five ranges per job
-- ============================================================
CREATE TABLE IF NOT EXISTS job_personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  n_min INT DEFAULT 0 CHECK (n_min >= 0 AND n_min <= 100),
  n_max INT DEFAULT 100 CHECK (n_max >= 0 AND n_max <= 100),
  e_min INT DEFAULT 0 CHECK (e_min >= 0 AND e_min <= 100),
  e_max INT DEFAULT 100 CHECK (e_max >= 0 AND e_max <= 100),
  o_min INT DEFAULT 0 CHECK (o_min >= 0 AND o_min <= 100),
  o_max INT DEFAULT 100 CHECK (o_max >= 0 AND o_max <= 100),
  a_min INT DEFAULT 0 CHECK (a_min >= 0 AND a_min <= 100),
  a_max INT DEFAULT 100 CHECK (a_max >= 0 AND a_max <= 100),
  c_min INT DEFAULT 0 CHECK (c_min >= 0 AND c_min <= 100),
  c_max INT DEFAULT 100 CHECK (c_max >= 0 AND c_max <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_personality_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read personality profiles"
  ON job_personality_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage personality profiles"
  ON job_personality_profiles FOR ALL
  USING (is_admin());

CREATE TRIGGER job_personality_profiles_updated_at
  BEFORE UPDATE ON job_personality_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Table: candidate_documents
-- CV, video and other candidate files
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cv', 'video')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
  ON candidate_documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all documents"
  ON candidate_documents FOR SELECT
  USING (is_admin());

-- ============================================================
-- Data migration: insert job_tests for all existing jobs
-- matching current hardcoded pipeline (4 tests)
-- ============================================================
INSERT INTO job_tests (job_id, test_definition_id, sort_order, weight, is_required, requires_status)
SELECT
  j.id,
  td.id,
  CASE td.slug
    WHEN 'big_five' THEN 1
    WHEN 'intelligence' THEN 2
    WHEN 'quiz' THEN 3
    WHEN 'roleplay' THEN 4
  END,
  CASE td.slug
    WHEN 'big_five' THEN 0.30
    WHEN 'intelligence' THEN 0.25
    WHEN 'quiz' THEN 0.20
    WHEN 'roleplay' THEN 0.25
  END,
  true,
  CASE WHEN td.slug = 'roleplay' THEN 'interview' ELSE NULL END
FROM jobs j
CROSS JOIN test_definitions td
WHERE td.slug IN ('big_five', 'intelligence', 'quiz', 'roleplay')
ON CONFLICT (job_id, test_definition_id) DO NOTHING;
