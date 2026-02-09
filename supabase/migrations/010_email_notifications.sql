-- Migration: Email notification triggers
-- Story: S5-002
-- Note: These triggers call the send-email Edge Function via pg_net (Supabase HTTP extension)
-- pg_net must be enabled in Supabase dashboard > Database > Extensions

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function: Send email on new application
CREATE OR REPLACE FUNCTION notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  _profile RECORD;
  _job RECORD;
  _supabase_url TEXT;
  _service_key TEXT;
BEGIN
  SELECT full_name, email INTO _profile FROM profiles WHERE id = NEW.user_id;
  SELECT title INTO _job FROM jobs WHERE id = NEW.job_id;

  -- Get secrets from vault (set via Supabase dashboard)
  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_key := current_setting('app.settings.service_role_key', true);

  IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL AND _profile.email IS NOT NULL THEN
    PERFORM extensions.http_post(
      _supabase_url || '/functions/v1/send-email',
      jsonb_build_object(
        'template', 'application_received',
        'to', _profile.email,
        'data', jsonb_build_object(
          'name', COALESCE(_profile.full_name, 'Candidat'),
          'jobTitle', COALESCE(_job.title, 'Poste')
        )
      )::text,
      'application/json',
      ARRAY[
        extensions.http_header('x-service-key', _service_key)
      ]
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Send email on status change
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
  _profile RECORD;
  _job RECORD;
  _supabase_url TEXT;
  _service_key TEXT;
  _status_label TEXT;
  _template TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT full_name, email INTO _profile FROM profiles WHERE id = NEW.user_id;
  SELECT title INTO _job FROM jobs WHERE id = NEW.job_id;

  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_key := current_setting('app.settings.service_role_key', true);

  -- Determine template based on new status
  CASE NEW.status
    WHEN 'interview' THEN _template := 'roleplay_invitation';
    ELSE _template := 'status_change';
  END CASE;

  -- Status labels in French
  CASE NEW.status
    WHEN 'pending' THEN _status_label := 'En attente';
    WHEN 'testing' THEN _status_label := 'Tests en cours';
    WHEN 'review' THEN _status_label := 'En évaluation';
    WHEN 'interview' THEN _status_label := 'Entretien';
    WHEN 'hired' THEN _status_label := 'Embauché';
    WHEN 'rejected' THEN _status_label := 'Refusé';
    WHEN 'pool' THEN _status_label := 'En vivier';
    ELSE _status_label := NEW.status;
  END CASE;

  IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL AND _profile.email IS NOT NULL THEN
    PERFORM extensions.http_post(
      _supabase_url || '/functions/v1/send-email',
      jsonb_build_object(
        'template', _template,
        'to', _profile.email,
        'data', jsonb_build_object(
          'name', COALESCE(_profile.full_name, 'Candidat'),
          'jobTitle', COALESCE(_job.title, 'Poste'),
          'status', _status_label
        )
      )::text,
      'application/json',
      ARRAY[
        extensions.http_header('x-service-key', _service_key)
      ]
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: new application
DROP TRIGGER IF EXISTS on_application_created ON applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_received();

-- Trigger: status change
DROP TRIGGER IF EXISTS on_application_status_change ON applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_status_change();

-- Note: Test reminder (24h) should be implemented as a Supabase cron job
-- using pg_cron extension. Configuration:
-- SELECT cron.schedule('test-reminder', '0 9 * * *', $$
--   SELECT extensions.http_post(...)
--   FROM applications a
--   JOIN profiles p ON p.id = a.user_id
--   JOIN jobs j ON j.id = a.job_id
--   WHERE a.status = 'testing'
--   AND a.created_at < NOW() - INTERVAL '24 hours'
--   AND NOT EXISTS (
--     SELECT 1 FROM test_results tr
--     WHERE tr.application_id = a.id
--     AND tr.test_type IN ('bigfive', 'quiz')
--     AND tr.completed_at IS NOT NULL
--   );
-- $$);
