-- RLS Tests for jobs table
-- Story: S1-008

-- Test 1: Anonymous can read open jobs
BEGIN;
SET LOCAL ROLE anon;

SELECT count(*) AS open_jobs_count
FROM jobs
WHERE status = 'open';
-- Expected: >= 0 (can see open jobs)

-- Anonymous cannot see draft jobs
SELECT count(*) AS draft_jobs_count
FROM jobs
WHERE status = 'draft';
-- Expected: 0

ROLLBACK;

-- Test 2: Authenticated user can read open jobs
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

SELECT count(*) AS open_jobs_count
FROM jobs
WHERE status = 'open';
-- Expected: >= 0

-- Cannot see draft or closed jobs
SELECT count(*) AS non_open_jobs_count
FROM jobs
WHERE status != 'open';
-- Expected: 0

ROLLBACK;

-- Test 3: Candidate cannot insert/update/delete jobs
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-candidate-1", "role": "authenticated"}';

-- Should fail (no INSERT policy for candidates)
INSERT INTO jobs (title, country, salary_amount, salary_currency, salary_label)
VALUES ('Hack Job', 'XX', 0, 'XXX', 'hack');
-- Expected: RLS violation error

ROLLBACK;

-- Test 4: Admin can CRUD all jobs
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

-- Admin can see all jobs (including draft/closed)
SELECT count(*) AS all_jobs_count
FROM jobs;
-- Expected: >= 0 (all jobs visible)

-- Admin can insert jobs
INSERT INTO jobs (title, country, salary_amount, salary_currency, salary_label, status)
VALUES ('Test Job', 'MG', 1000000, 'MGA', '1M Ariary/mois', 'draft');

-- Admin can update jobs
UPDATE jobs SET status = 'open' WHERE title = 'Test Job';

-- Admin can delete jobs
DELETE FROM jobs WHERE title = 'Test Job';

ROLLBACK;

-- Test 5: Same title can exist for multiple countries (multi-country support)
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin-1", "role": "authenticated"}';

INSERT INTO jobs (title, country, salary_amount, salary_currency, salary_label, status)
VALUES
  ('Setter - FSM', 'MG', 2500000, 'MGA', '2.5M Ariary/mois', 'open'),
  ('Setter - FSM', 'MA', 6000, 'MAD', '6 000 DH/mois', 'open');

SELECT count(*) AS multi_country_count
FROM jobs
WHERE title = 'Setter - FSM';
-- Expected: 2

ROLLBACK;
