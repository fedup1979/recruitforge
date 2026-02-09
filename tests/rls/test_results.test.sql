-- RLS Tests for test_results table
-- Story: S3-001

-- Test 1: Candidate can see only their own test results
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should return only results linked to own applications
SELECT count(*) AS own_results
FROM test_results tr
JOIN applications a ON tr.application_id = a.id
WHERE a.user_id = 'user-candidate-1';
-- Expected: >= 0

-- Should NOT see results for other candidates' applications
SELECT count(*) AS other_results
FROM test_results tr
JOIN applications a ON tr.application_id = a.id
WHERE a.user_id != 'user-candidate-1';
-- Expected: 0

ROLLBACK;

-- Test 2: Candidate can create test results for own applications
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should succeed (own application)
INSERT INTO test_results (application_id, test_type, answers)
VALUES ('own-app-id', 'big_five', '{"q1": 5}');

ROLLBACK;

-- Test 3: Admin can see all test results
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

SELECT count(*) AS all_results FROM test_results;
-- Expected: all results visible

ROLLBACK;

-- Test 4: Admin can update human_score
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

UPDATE test_results
SET human_score = 25
WHERE id = 'some-result-id';

ROLLBACK;

-- Test 5: Anonymous cannot access test results
BEGIN;
SET LOCAL ROLE anon;

SELECT count(*) FROM test_results;
-- Expected: 0

ROLLBACK;
