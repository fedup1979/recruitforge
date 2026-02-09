-- Storage Policy Tests
-- Story: S2-006

-- Test 1: User can upload to their own folder
-- Upload path: /candidates/{user_id}/cv/{uuid}.pdf
-- Expected: allowed when (storage.foldername(name))[1] = auth.uid()

-- Test 2: User CANNOT upload to another user's folder
-- Expected: RLS violation

-- Test 3: User can read their own files
-- Expected: returns files in own folder

-- Test 4: User CANNOT read another user's files
-- Expected: 0 results

-- Test 5: Admin can read all files
-- Expected: returns all files across all user folders

-- Note: Storage policies are tested via Supabase Storage API calls,
-- not pure SQL. These tests document expected behavior.
-- Manual test procedure:
-- 1. Login as candidate-1
-- 2. Upload file to /candidates/{candidate-1-id}/cv/test.pdf → should succeed
-- 3. Try to upload to /candidates/{candidate-2-id}/cv/test.pdf → should fail
-- 4. List files in own folder → should see own files
-- 5. Try to list /candidates/{candidate-2-id}/ → should return empty
-- 6. Login as admin
-- 7. List files in any folder → should see all files
