# RLS Test Suite Report — AMBITIA
Generated: 2026-02-09

## Tables with RLS Enabled

| Table | RLS | Test File | Policies |
|-------|-----|-----------|----------|
| profiles | YES | profiles.test.sql | Users read/update own; Admins read all |
| jobs | YES | jobs.test.sql | Anyone reads open; Admins CRUD all |
| applications | YES | applications.test.sql | Users CRUD own; Admins read all |
| test_results | YES | test_results.test.sql | Users read own (via application); Admins read all |
| consents | YES | consents.test.sql | Users read/create own; Admins read all |
| storage (candidates) | YES | storage.test.sql | Users upload/read own folder; Admins read all |

## Security Test Scenarios

### 1. Candidate cannot see other candidates' data
- **profiles**: SELECT with `auth.uid() = id` filter — candidate only sees own row
- **applications**: SELECT with `auth.uid() = user_id` — candidate only sees own applications
- **test_results**: SELECT via application ownership — candidate sees only results for their applications
- **consents**: SELECT with `auth.uid() = user_id` — candidate only sees own consents
- **storage**: List/download restricted to `candidates/{user_id}/` folder

### 2. Candidate cannot access admin routes
- Admin routes check `profiles.role = 'admin'` client-side
- Non-admin users redirected to `/dashboard`
- Admin-only operations (update any application, read all profiles) blocked by RLS
- Jobs management: INSERT/UPDATE/DELETE restricted to admin role

### 3. Admin can access all data
- Admins can read all profiles, applications, test_results, consents
- Admins can update application status
- Admins can CRUD jobs
- Admins can read all storage files
- Admin notes (`admin_notes` column) updatable by admins

### 4. Service role bypasses RLS (Edge Functions only)
- `SUPABASE_SERVICE_ROLE_KEY` used only in Edge Functions
- Edge Functions: create-vapi-call, send-email
- Service role never exposed in frontend code

## Test Execution
These tests are designed to be run against a live Supabase instance:
1. Create test users (candidate-1, candidate-2, admin-1) via Supabase Auth
2. Execute each `.test.sql` file against the database
3. Verify expected results match actual results

## Recommendation
All 6 tables have RLS enabled with appropriate policies. The security model follows the principle of least privilege:
- Candidates can only access their own data
- Admins have broad read access for management
- Service role is restricted to Edge Functions
