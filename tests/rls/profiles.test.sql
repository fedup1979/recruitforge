-- RLS Tests for profiles table
-- Story: S1-007

-- Test 1: Candidate can read their own profile
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should return 1 (own profile)
SELECT count(*) AS own_profile_count
FROM profiles
WHERE id = 'user-candidate-1';
-- Expected: 1 (if profile exists)

-- Should return 0 (cannot see other profiles)
SELECT count(*) AS other_profiles_count
FROM profiles
WHERE id != 'user-candidate-1';
-- Expected: 0

ROLLBACK;

-- Test 2: Candidate can update their own profile
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should succeed
UPDATE profiles
SET full_name = 'Test Name Updated'
WHERE id = 'user-candidate-1';

-- Should NOT update other profiles (0 rows affected)
UPDATE profiles
SET full_name = 'Hacked Name'
WHERE id = 'user-candidate-2';

ROLLBACK;

-- Test 3: Admin can read all profiles
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

-- Should return all profiles (admin has role='admin' in profiles table)
SELECT count(*) AS all_profiles_count
FROM profiles;
-- Expected: > 1

ROLLBACK;

-- Test 4: Anonymous cannot read any profiles
BEGIN;
SET LOCAL ROLE anon;

SELECT count(*) AS anon_count
FROM profiles;
-- Expected: 0

ROLLBACK;
