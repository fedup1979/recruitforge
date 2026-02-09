-- ============================================================================
-- AMBITIA — Run All Migrations + Seed Data
-- Coller ce fichier dans le SQL Editor du Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/gdvdvjymkakuoepyhajk/sql
-- ============================================================================

-- ============================================================================
-- 001: CREATE PROFILES
-- ============================================================================

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

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
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

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 002: CREATE JOBS
-- ============================================================================

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

DROP POLICY IF EXISTS "Anyone can read open jobs" ON jobs;
CREATE POLICY "Anyone can read open jobs"
  ON jobs FOR SELECT
  USING (status = 'open');

DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 003: CREATE APPLICATIONS
-- ============================================================================

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

DROP POLICY IF EXISTS "Candidates can read own applications" ON applications;
CREATE POLICY "Candidates can read own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can create applications" ON applications;
CREATE POLICY "Candidates can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all applications" ON applications;
CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all applications" ON applications;
CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 004: CREATE STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can read all candidate files" ON storage.objects;
CREATE POLICY "Admins can read all candidate files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 005: CREATE TEST RESULTS
-- ============================================================================

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

DROP POLICY IF EXISTS "Candidates can read own test results" ON test_results;
CREATE POLICY "Candidates can read own test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidates can create own test results" ON test_results;
CREATE POLICY "Candidates can create own test results"
  ON test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidates can update own test results" ON test_results;
CREATE POLICY "Candidates can update own test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = test_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can read all test results" ON test_results;
CREATE POLICY "Admins can read all test results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all test results" ON test_results;
CREATE POLICY "Admins can update all test results"
  ON test_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 006: CREATE CONSENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  ip_address TEXT,
  consent_text TEXT
);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own consents" ON consents;
CREATE POLICY "Users can read own consents"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own consents" ON consents;
CREATE POLICY "Users can create own consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all consents" ON consents;
CREATE POLICY "Admins can read all consents"
  ON consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 007: TEST ABANDONMENT COLUMNS
-- ============================================================================

ALTER TABLE test_results ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS progress JSONB;

-- ============================================================================
-- 008: ADMIN NOTES
-- ============================================================================

ALTER TABLE applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================================================
-- 009: TEST RESULTS UNIQUE INDEX
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_test_results_app_type
  ON test_results (application_id, test_type);

-- ============================================================================
-- 010: EMAIL NOTIFICATION TRIGGERS (skip pg_net if not available)
-- ============================================================================

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net extension not available, skipping email triggers';
END;
$$;

-- ============================================================================
-- SEED: Demo jobs
-- ============================================================================

INSERT INTO jobs (title, description, requirements, country, salary_amount, salary_currency, salary_label, contract_type, location, status) VALUES
(
  'Setter — Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec notre conseillère formation pour la Formation Secrétaire Médicale ESSR. Volume : 50 leads/jour, objectif 8-12 RDV/jour.',
  ARRAY['Français fluide avec accent compréhensible', 'Voix agréable et ton chaleureux', 'Écoute active et capacité de reformulation', 'Résilience face au rejet', 'PC/Mac avec casque micro et connexion internet stable (min 10 Mbps)', 'Disponible lundi-vendredi, 9h-18h CET'],
  'MG', 2500000, 'MGA', '2.5M Ariary/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Setter — Formation Secrétaire Médicale',
  'Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec notre conseillère formation pour la Formation Secrétaire Médicale ESSR. Volume : 50 leads/jour, objectif 8-12 RDV/jour.',
  ARRAY['Français fluide avec accent compréhensible', 'Voix agréable et ton chaleureux', 'Écoute active et capacité de reformulation', 'Résilience face au rejet', 'PC/Mac avec casque micro et connexion internet stable (min 10 Mbps)', 'Disponible lundi-vendredi, 9h-18h CET'],
  'MA', 6000, 'MAD', '6 000 DH/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Assistant Virtuel — Support Client',
  'Gérer les demandes clients par email et chat. Traiter les tickets de support niveau 1, escalader les cas complexes, maintenir un taux de satisfaction client élevé.',
  ARRAY['Excellente communication écrite en français', 'Maîtrise des outils bureautiques (Google Workspace)', 'Capacité à gérer plusieurs conversations simultanément', 'Patience et empathie', 'Connexion internet stable (min 10 Mbps)', 'Disponible lundi-vendredi, 9h-17h CET'],
  'MG', 2000000, 'MGA', '2M Ariary/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Assistant Virtuel — Support Client',
  'Gérer les demandes clients par email et chat. Traiter les tickets de support niveau 1, escalader les cas complexes, maintenir un taux de satisfaction client élevé.',
  ARRAY['Excellente communication écrite en français', 'Maîtrise des outils bureautiques (Google Workspace)', 'Capacité à gérer plusieurs conversations simultanément', 'Patience et empathie', 'Connexion internet stable (min 10 Mbps)', 'Disponible lundi-vendredi, 9h-17h CET'],
  'SN', 250000, 'XOF', '250 000 FCFA/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Community Manager',
  'Animer nos réseaux sociaux (Instagram, Facebook, LinkedIn). Créer du contenu engageant, planifier les publications, répondre aux commentaires et messages, analyser les performances.',
  ARRAY['Créativité et sens de la communication', 'Maîtrise de Canva ou équivalent', 'Connaissance des algorithmes des réseaux sociaux', 'Français et anglais courant', 'Portfolio ou exemples de gestion de comptes', 'Disponible pour 20h/semaine minimum'],
  'CI', 200000, 'XOF', '200 000 FCFA/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Développeur Web Frontend',
  'Développer et maintenir des interfaces web modernes avec React/Next.js. Intégrer des maquettes Figma, optimiser les performances, collaborer avec l''équipe backend.',
  ARRAY['Maîtrise de React, TypeScript et Tailwind CSS', '2+ ans d''expérience en développement web', 'Connaissance de Git et des workflows CI/CD', 'Capacité à travailler en autonomie', 'Connexion internet stable', 'Disponible lundi-vendredi, horaires flexibles'],
  'TN', 3000, 'TND', '3 000 TND/mois', 'Freelance', 'Télétravail', 'open'
),
(
  'Closer — Vente de Formations',
  'Conduire les appels de vente avec les prospects qualifiés par nos setters. Présenter les formations, gérer les objections, finaliser les inscriptions. Objectif : 30-40% de taux de closing.',
  ARRAY['Expérience en vente téléphonique (2+ ans)', 'Excellent français oral', 'Capacité de persuasion et gestion des objections', 'Connaissance du secteur de la formation professionnelle', 'Autonomie et orientation résultats', 'Disponible lundi-vendredi, 10h-19h CET'],
  'MA', 8000, 'MAD', '8 000 DH/mois + commissions', 'Freelance', 'Télétravail', 'open'
);

-- ============================================================================
-- BACKFILL: Create profiles for existing auth users who don't have one yet
-- ============================================================================

INSERT INTO profiles (id, email, full_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ADMIN ROLE: Set francois.dupuis@essr.ch as admin
-- ============================================================================

UPDATE profiles SET role = 'admin' WHERE email = 'francois.dupuis@essr.ch';
