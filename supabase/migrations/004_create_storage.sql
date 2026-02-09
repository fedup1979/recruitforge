-- Migration: Setup Supabase Storage for CVs
-- Story: S2-006

-- Create 'candidates' bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: users can read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: admins can read all files
CREATE POLICY "Admins can read all candidate files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
