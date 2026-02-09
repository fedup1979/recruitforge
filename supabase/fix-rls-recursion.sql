-- ============================================================================
-- AMBITIA — Fix RLS Infinite Recursion on profiles table
-- Coller ce fichier dans le SQL Editor du Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/gdvdvjymkakuoepyhajk/sql
-- ============================================================================

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
-- This function checks if the current user is an admin without triggering
-- any SELECT policy on profiles (which would cause infinite recursion).
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Fix the profiles admin policy (this was the recursive one)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Step 3: Fix all other tables that reference profiles for admin check
-- (these weren't directly recursive but using is_admin() is cleaner)

-- jobs
DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (is_admin());

-- applications
DROP POLICY IF EXISTS "Admins can read all applications" ON applications;
CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all applications" ON applications;
CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  USING (is_admin());

-- test_results
DROP POLICY IF EXISTS "Admins can read all test results" ON test_results;
CREATE POLICY "Admins can read all test results"
  ON test_results FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all test results" ON test_results;
CREATE POLICY "Admins can update all test results"
  ON test_results FOR UPDATE
  USING (is_admin());

-- consents
DROP POLICY IF EXISTS "Admins can read all consents" ON consents;
CREATE POLICY "Admins can read all consents"
  ON consents FOR SELECT
  USING (is_admin());

-- storage
DROP POLICY IF EXISTS "Admins can read all candidate files" ON storage.objects;
CREATE POLICY "Admins can read all candidate files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidates'
    AND is_admin()
  );
