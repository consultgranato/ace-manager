-- ============================================================
-- ACE MANAGER — Phase 3.1 Migration
-- Tool integration foundation: courses, assessments, feedback
-- ============================================================

-- 1. Add courses array to students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS courses JSONB DEFAULT '[]'::jsonb;

-- Drop and recreate tool tables (safe — no data yet; handles partial prior runs)
DROP TABLE IF EXISTS public.parent_feedback CASCADE;
DROP TABLE IF EXISTS public.teacher_feedback CASCADE;
DROP TABLE IF EXISTS public.transition_assessments CASCADE;

-- 2. Transition Assessments (TA1)
CREATE TABLE public.transition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  case_manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | in_progress | completed
  payload JSONB DEFAULT '{}'::jsonb,        -- full TA1 object when completed
  draft_payload JSONB DEFAULT '{}'::jsonb,  -- partial progress autosave
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 3. Teacher Feedback (TF1) — one row per course link
CREATE TABLE public.teacher_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  case_manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  course_code TEXT,
  course_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | in_progress | completed
  payload JSONB DEFAULT '{}'::jsonb,
  draft_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 4. Parent Feedback (PF1)
CREATE TABLE public.parent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  case_manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB DEFAULT '{}'::jsonb,
  draft_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for student-scoped lookups
CREATE INDEX idx_ta_student ON public.transition_assessments(student_id);
CREATE INDEX idx_tf_student ON public.teacher_feedback(student_id);
CREATE INDEX idx_pf_student ON public.parent_feedback(student_id);

-- Token lookup indexes (anonymous form access)
CREATE INDEX idx_ta_token ON public.transition_assessments(token);
CREATE INDEX idx_tf_token ON public.teacher_feedback(token);
CREATE INDEX idx_pf_token ON public.parent_feedback(token);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.transition_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;

-- ---- Case manager full access to their own rows ----
-- (authenticated users where case_manager_id = auth.uid())

CREATE POLICY "CM manages own TA rows"
  ON public.transition_assessments
  FOR ALL TO authenticated
  USING (case_manager_id = auth.uid())
  WITH CHECK (case_manager_id = auth.uid());

CREATE POLICY "CM manages own TF rows"
  ON public.teacher_feedback
  FOR ALL TO authenticated
  USING (case_manager_id = auth.uid())
  WITH CHECK (case_manager_id = auth.uid());

CREATE POLICY "CM manages own PF rows"
  ON public.parent_feedback
  FOR ALL TO authenticated
  USING (case_manager_id = auth.uid())
  WITH CHECK (case_manager_id = auth.uid());

-- ---- Anonymous token-scoped access ----
-- Students/parents/teachers submitting via link have NO auth session.
-- They use the anon role. We must allow them to:
--   - SELECT a single row matched by exact token (to load the form + resume draft)
--   - UPDATE a single row matched by exact token (to save draft + submit)
-- They must NOT be able to: list rows, read other rows, insert, delete,
--   or touch any other table.
--
-- Supabase passes the token via a custom header → request.jwt is absent for
-- anon, so we match on the row's token column against a value the client
-- provides through a PostgREST filter. The security model: the token is a
-- long unguessable UUID. Knowing the token grants access to exactly that row.
--
-- The anon client will always query with ?token=eq.<token>, but RLS cannot
-- read query params directly. Instead we expose access through SECURITY
-- DEFINER RPC functions (defined below) rather than direct table policies,
-- so anon gets NO direct table policy at all.

-- NOTE: We intentionally do NOT create anon SELECT/UPDATE policies on the
-- tables. All anonymous access goes through the RPC functions below, which
-- are SECURITY DEFINER and validate the token internally. This is the
-- safest pattern — anon cannot touch the tables directly at all.

-- ============================================================
-- SECURITY DEFINER RPCs for anonymous token access
-- ============================================================

-- Load a transition assessment by token (returns form-relevant fields only)
CREATE OR REPLACE FUNCTION public.get_ta_by_token(p_token TEXT)
RETURNS TABLE (id UUID, status TEXT, draft_payload JSONB, student_first TEXT, student_grade TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT ta.id, ta.status, ta.draft_payload,
         s.first_name, s.grade
  FROM public.transition_assessments ta
  JOIN public.students s ON s.id = ta.student_id
  WHERE ta.token = p_token
    AND ta.status <> 'completed'  -- single-use: completed tokens return nothing
  LIMIT 1;
$$;

-- Save draft progress for a transition assessment
CREATE OR REPLACE FUNCTION public.save_ta_draft(p_token TEXT, p_draft JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.transition_assessments
    SET draft_payload = p_draft,
        status = 'in_progress',
        started_at = COALESCE(started_at, now())
    WHERE token = p_token AND status <> 'completed';
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Submit a completed transition assessment
CREATE OR REPLACE FUNCTION public.submit_ta(p_token TEXT, p_payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.transition_assessments
    SET payload = p_payload,
        status = 'completed',
        completed_at = now()
    WHERE token = p_token AND status <> 'completed';
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Teacher feedback: load by token (reusable — completed rows still load for editing)
CREATE OR REPLACE FUNCTION public.get_tf_by_token(p_token TEXT)
RETURNS TABLE (id UUID, status TEXT, draft_payload JSONB, payload JSONB, course_name TEXT, student_first TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT tf.id, tf.status, tf.draft_payload, tf.payload, tf.course_name,
         s.first_name
  FROM public.teacher_feedback tf
  JOIN public.students s ON s.id = tf.student_id
  WHERE tf.token = p_token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.save_tf_draft(p_token TEXT, p_draft JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.teacher_feedback
    SET draft_payload = p_draft,
        status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END,
        started_at = COALESCE(started_at, now())
    WHERE token = p_token;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Teacher feedback submit (reusable — latest wins, can resubmit)
CREATE OR REPLACE FUNCTION public.submit_tf(p_token TEXT, p_payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.teacher_feedback
    SET payload = p_payload,
        status = 'completed',
        completed_at = now()
    WHERE token = p_token;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Parent feedback: same reusable pattern as teacher
CREATE OR REPLACE FUNCTION public.get_pf_by_token(p_token TEXT)
RETURNS TABLE (id UUID, status TEXT, draft_payload JSONB, payload JSONB, student_first TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT pf.id, pf.status, pf.draft_payload, pf.payload, s.first_name
  FROM public.parent_feedback pf
  JOIN public.students s ON s.id = pf.student_id
  WHERE pf.token = p_token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.save_pf_draft(p_token TEXT, p_draft JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.parent_feedback
    SET draft_payload = p_draft,
        status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END,
        started_at = COALESCE(started_at, now())
    WHERE token = p_token;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_pf(p_token TEXT, p_payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_affected INT;
BEGIN
  UPDATE public.parent_feedback
    SET payload = p_payload,
        status = 'completed',
        completed_at = now()
    WHERE token = p_token;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Grant execute on RPCs to anon (the ONLY anon access to this data)
GRANT EXECUTE ON FUNCTION public.get_ta_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.save_ta_draft(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_ta(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.get_tf_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.save_tf_draft(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_tf(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.get_pf_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.save_pf_draft(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_pf(TEXT, JSONB) TO anon;
