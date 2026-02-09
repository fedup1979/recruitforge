-- Migration: Create consents table
-- Story: S3-002

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own consents
CREATE POLICY "Users can read own consents"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can create their own consents
CREATE POLICY "Users can create own consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: admins can read all consents
CREATE POLICY "Admins can read all consents"
  ON consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
