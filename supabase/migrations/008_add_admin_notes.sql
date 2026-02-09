-- Migration: Add admin_notes to applications
-- Story: S4-004

ALTER TABLE applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Allow admins to update admin_notes (already covered by existing admin update policy)
