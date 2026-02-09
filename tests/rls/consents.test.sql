-- RLS Tests for consents table
-- Story: S3-002

-- Test 1: User can read their own consents
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-1", "role": "authenticated"}';
SELECT count(*) FROM consents WHERE user_id = 'user-1';
-- Expected: own consents
SELECT count(*) FROM consents WHERE user_id != 'user-1';
-- Expected: 0
ROLLBACK;

-- Test 2: User can create their own consents
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-1", "role": "authenticated"}';
INSERT INTO consents (user_id, consent_type, granted, granted_at)
VALUES ('user-1', 'big_five_test', true, now());
-- Expected: success
ROLLBACK;

-- Test 3: User cannot create consents for others
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-1", "role": "authenticated"}';
INSERT INTO consents (user_id, consent_type, granted)
VALUES ('user-2', 'big_five_test', true);
-- Expected: RLS violation
ROLLBACK;

-- Test 4: Admin can read all consents
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "admin-1", "role": "authenticated"}';
SELECT count(*) FROM consents;
-- Expected: all consents
ROLLBACK;

-- Test 5: Anonymous cannot access
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) FROM consents;
-- Expected: 0
ROLLBACK;
