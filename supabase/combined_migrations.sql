-- ============================================================
-- AMBITIA - Combined Migrations (001-010) + Seed + Admin Setup
-- Paste this entire script into Supabase SQL Editor
-- https://supabase.com/dashboard/project/gdvdvjymkakuoepyhajk/sql/new
-- ============================================================

-- ============================================================
-- 001: Create profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 002: Create jobs table
-- ============================================================
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

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read open jobs"
  ON jobs FOR SELECT
  USING (status = 'open');

CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 003: Create applications table
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'review', 'interview', 'hired', 'rejected', 'pool')),
  knockout_answers JSONB,
  cv_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can read own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE OR REPLACE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 004: Setup Storage for CVs
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can read all candidate files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 005: Create test_results table
-- ============================================================
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

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can read own test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can update own test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 006: Create consents table
-- ============================================================
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  ip_address TEXT
);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consents"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all consents"
  ON consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 007: Test abandonment tracking
-- ============================================================
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS progress JSONB;

-- ============================================================
-- 008: Admin notes on applications
-- ============================================================
ALTER TABLE applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================================
-- 009: Unique index for test_results upsert
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_results_app_type
  ON test_results (application_id, test_type);

-- ============================================================
-- 010: Email notification triggers
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  _profile RECORD;
  _job RECORD;
  _supabase_url TEXT;
  _service_key TEXT;
BEGIN
  SELECT full_name, email INTO _profile FROM profiles WHERE id = NEW.user_id;
  SELECT title INTO _job FROM jobs WHERE id = NEW.job_id;

  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_key := current_setting('app.settings.service_role_key', true);

  IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL AND _profile.email IS NOT NULL THEN
    PERFORM extensions.http_post(
      _supabase_url || '/functions/v1/send-email',
      jsonb_build_object(
        'template', 'application_received',
        'to', _profile.email,
        'data', jsonb_build_object(
          'name', COALESCE(_profile.full_name, 'Candidat'),
          'jobTitle', COALESCE(_job.title, 'Poste')
        )
      )::text,
      'application/json',
      ARRAY[
        extensions.http_header('x-service-key', _service_key)
      ]
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
  _profile RECORD;
  _job RECORD;
  _supabase_url TEXT;
  _service_key TEXT;
  _status_label TEXT;
  _template TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT full_name, email INTO _profile FROM profiles WHERE id = NEW.user_id;
  SELECT title INTO _job FROM jobs WHERE id = NEW.job_id;

  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_key := current_setting('app.settings.service_role_key', true);

  CASE NEW.status
    WHEN 'interview' THEN _template := 'roleplay_invitation';
    ELSE _template := 'status_change';
  END CASE;

  CASE NEW.status
    WHEN 'pending' THEN _status_label := 'En attente';
    WHEN 'testing' THEN _status_label := 'Tests en cours';
    WHEN 'review' THEN _status_label := 'En évaluation';
    WHEN 'interview' THEN _status_label := 'Entretien';
    WHEN 'hired' THEN _status_label := 'Embauché';
    WHEN 'rejected' THEN _status_label := 'Refusé';
    WHEN 'pool' THEN _status_label := 'En vivier';
    ELSE _status_label := NEW.status;
  END CASE;

  IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL AND _profile.email IS NOT NULL THEN
    PERFORM extensions.http_post(
      _supabase_url || '/functions/v1/send-email',
      jsonb_build_object(
        'template', _template,
        'to', _profile.email,
        'data', jsonb_build_object(
          'name', COALESCE(_profile.full_name, 'Candidat'),
          'jobTitle', COALESCE(_job.title, 'Poste'),
          'status', _status_label
        )
      )::text,
      'application/json',
      ARRAY[
        extensions.http_header('x-service-key', _service_key)
      ]
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_created ON applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_received();

DROP TRIGGER IF EXISTS on_application_status_change ON applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_status_change();

-- ============================================================
-- SEED: Initial job data (2 countries)
-- ============================================================
INSERT INTO jobs (title, description, requirements, country, salary_amount, salary_currency, salary_label, contract_type, location, status, test_config) VALUES (
  'Setter - Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec Yasmine (conseillère formation) pour la Formation Secrétaire Médicale de l''École de Santé de Suisse Romande (ESSR).

Vos missions :
- Contacter les prospects ayant demandé des informations via Facebook/Instagram
- Qualifier les leads (motivation, disponibilité, budget)
- Gérer les objections avec empathie et professionnalisme
- Booker des rendez-vous de 15 minutes avec Yasmine, notre conseillère formation
- Atteindre un objectif de 8-12 RDV bookés par jour

Volume : ~50 leads/jour, 80-120 appels/jour, 25-40 conversations/jour

KPIs :
- Taux de contact : >50%
- Taux de RDV : >20%
- Qualité RDV (prospect présent) : >70%',
  ARRAY[
    'Français fluide avec accent compréhensible',
    'Voix agréable et ton chaleureux',
    'Écoute active et capacité à reformuler',
    'Résilience face au rejet',
    'Connexion internet stable (min 10 Mbps)',
    'Ordinateur avec casque audio',
    'Disponible du lundi au vendredi, 9h-18h (heure suisse)',
    'Expérience en appels téléphoniques (call center, téléprospection) est un plus'
  ],
  'MG',
  2500000,
  'MGA',
  '2.5M Ariary/mois',
  'Freelance',
  'Remote (Télétravail 100%)',
  'open',
  '{"tests": ["bigfive", "quiz", "roleplay_easy", "roleplay_medium"], "min_quiz_score": 60, "min_roleplay_score": 18}'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO jobs (title, description, requirements, country, salary_amount, salary_currency, salary_label, contract_type, location, status, test_config) VALUES (
  'Setter - Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec Yasmine (conseillère formation) pour la Formation Secrétaire Médicale de l''École de Santé de Suisse Romande (ESSR).

Vos missions :
- Contacter les prospects ayant demandé des informations via Facebook/Instagram
- Qualifier les leads (motivation, disponibilité, budget)
- Gérer les objections avec empathie et professionnalisme
- Booker des rendez-vous de 15 minutes avec Yasmine, notre conseillère formation
- Atteindre un objectif de 8-12 RDV bookés par jour

Volume : ~50 leads/jour, 80-120 appels/jour, 25-40 conversations/jour

KPIs :
- Taux de contact : >50%
- Taux de RDV : >20%
- Qualité RDV (prospect présent) : >70%',
  ARRAY[
    'Français fluide avec accent compréhensible',
    'Voix agréable et ton chaleureux',
    'Écoute active et capacité à reformuler',
    'Résilience face au rejet',
    'Connexion internet stable (min 10 Mbps)',
    'Ordinateur avec casque audio',
    'Disponible du lundi au vendredi, 9h-18h (heure suisse)',
    'Expérience en appels téléphoniques (call center, téléprospection) est un plus'
  ],
  'MA',
  6000,
  'MAD',
  '6 000 DH/mois',
  'Freelance',
  'Remote (Télétravail 100%)',
  'open',
  '{"tests": ["bigfive", "quiz", "roleplay_easy", "roleplay_medium"], "min_quiz_score": 60, "min_roleplay_score": 18}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================
-- ADMIN SETUP: Create profile for François Dupuis
-- (User was created before profiles table existed, so trigger didn't fire)
-- ============================================================
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '58f657fc-3c1f-487f-b528-c5da06d03e29',
  'francois.dupuis@essr.ch',
  'François Dupuis',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- DONE! All tables, policies, triggers, seed data, and admin account are set up.
-- ============================================================
