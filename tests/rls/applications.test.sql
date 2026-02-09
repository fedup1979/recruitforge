-- RLS Tests for applications table
-- Story: S2-004

-- Test 1: Candidate can see only their own applications
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should return only own applications
SELECT count(*) AS own_apps
FROM applications
WHERE user_id = 'user-candidate-1';
-- Expected: >= 0

-- Should NOT see other candidates' applications
SELECT count(*) AS other_apps
FROM applications
WHERE user_id != 'user-candidate-1';
-- Expected: 0

ROLLBACK;

-- Test 2: Candidate can create their own application
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should succeed (own application)
INSERT INTO applications (user_id, job_id, knockout_answers)
VALUES ('user-candidate-1', 'some-job-id', '{"availability": true}');

-- Should fail (another user's application)
INSERT INTO applications (user_id, job_id, knockout_answers)
VALUES ('user-candidate-2', 'some-job-id', '{"availability": true}');
-- Expected: RLS violation

ROLLBACK;

-- Test 3: UNIQUE constraint on (user_id, job_id)
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

INSERT INTO applications (user_id, job_id)
VALUES ('user-candidate-1', 'job-1');

-- Should fail (duplicate)
INSERT INTO applications (user_id, job_id)
VALUES ('user-candidate-1', 'job-1');
-- Expected: unique violation error

ROLLBACK;

-- Test 4: Admin can see all applications
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

SELECT count(*) AS all_apps
FROM applications;
-- Expected: all applications visible

ROLLBACK;

-- Test 5: Admin can update application status
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

UPDATE applications SET status = 'testing'
WHERE id = 'some-app-id';

ROLLBACK;

-- Test 6: Anonymous cannot access applications
BEGIN;
SET LOCAL ROLE anon;

SELECT count(*) AS anon_apps
FROM applications;
-- Expected: 0

ROLLBACK;
