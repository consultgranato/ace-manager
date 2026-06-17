-- ============================================================
-- ACE MANAGER — Phase 3.3a Migration
-- Shared teacher-feedback links (one active per student per cycle)
-- ============================================================

-- 1. feedback_links: one shared, supersede-on-regenerate link per student
CREATE TABLE IF NOT EXISTS public.feedback_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  case_manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,  -- nullable; attaches later
  token TEXT NOT NULL UNIQUE,
  cycle_label TEXT,                       -- e.g. "2025–2026 Annual Review"
  active BOOLEAN NOT NULL DEFAULT true,   -- superseded links flip to false
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fl_student ON public.feedback_links(student_id);
CREATE INDEX IF NOT EXISTS idx_fl_token ON public.feedback_links(token);
CREATE INDEX IF NOT EXISTS idx_fl_meeting ON public.feedback_links(meeting_id);

-- 2. Re-shape teacher_feedback: tie rows to a link, key by course + teacher name
ALTER TABLE public.teacher_feedback
  ADD COLUMN IF NOT EXISTS link_id UUID REFERENCES public.feedback_links(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS teacher_name TEXT;

-- The 3.1 teacher_feedback table had its own per-course token + RPCs.
-- Those are superseded by the shared-link model. Drop the old TF token RPCs.
DROP FUNCTION IF EXISTS public.get_tf_by_token(TEXT);
DROP FUNCTION IF EXISTS public.save_tf_draft(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.submit_tf(TEXT, JSONB);

-- The old per-course token column is no longer the access path; keep it nullable
-- for backward-compat but it is unused going forward.
ALTER TABLE public.teacher_feedback ALTER COLUMN token DROP NOT NULL;

ALTER TABLE public.feedback_links ENABLE ROW LEVEL SECURITY;

-- Case manager manages their own links
CREATE POLICY "CM manages own feedback links"
  ON public.feedback_links
  FOR ALL TO authenticated
  USING (case_manager_id = auth.uid())
  WITH CHECK (case_manager_id = auth.uid());

-- ============================================================
-- SECURITY DEFINER RPCs — anonymous teacher access via shared token
-- ============================================================

-- Load the picker: returns student first name + academic courses, ONLY if link active
CREATE OR REPLACE FUNCTION public.get_feedback_link_by_token(p_token TEXT)
RETURNS TABLE (link_id UUID, student_first TEXT, cycle_label TEXT, courses JSONB)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT fl.id, s.first_name, fl.cycle_label,
         COALESCE(
           (SELECT jsonb_agg(c) FROM jsonb_array_elements(s.courses) c
            WHERE (c->>'is_academic')::boolean = true),
           '[]'::jsonb
         ) AS courses
  FROM public.feedback_links fl
  JOIN public.students s ON s.id = fl.student_id
  WHERE fl.token = p_token AND fl.active = true
  LIMIT 1;
$$;

-- Submit teacher feedback for a chosen course + typed teacher name.
-- Upsert keyed by (link, course_name, teacher_name): same teacher resubmitting
-- the same course updates their row; a co-teacher (different name) makes a new row.
CREATE OR REPLACE FUNCTION public.submit_teacher_feedback(
  p_token TEXT, p_course_name TEXT, p_teacher_name TEXT, p_payload JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_link public.feedback_links%ROWTYPE;
  v_existing UUID;
BEGIN
  SELECT * INTO v_link FROM public.feedback_links WHERE token = p_token AND active = true LIMIT 1;
  IF v_link.id IS NULL THEN RETURN false; END IF;  -- inactive/stale token

  SELECT id INTO v_existing FROM public.teacher_feedback
    WHERE link_id = v_link.id AND course_name = p_course_name AND teacher_name = p_teacher_name
    LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE public.teacher_feedback
      SET payload = p_payload, status = 'completed', completed_at = now()
      WHERE id = v_existing;
  ELSE
    INSERT INTO public.teacher_feedback
      (student_id, case_manager_id, link_id, course_name, teacher_name, payload, status, completed_at)
    VALUES
      (v_link.student_id, v_link.case_manager_id, v_link.id, p_course_name, p_teacher_name, p_payload, 'completed', now());
  END IF;
  RETURN true;
END;
$$;

-- Save partial draft (keyed same way)
CREATE OR REPLACE FUNCTION public.save_teacher_feedback_draft(
  p_token TEXT, p_course_name TEXT, p_teacher_name TEXT, p_draft JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_link public.feedback_links%ROWTYPE;
  v_existing UUID;
BEGIN
  SELECT * INTO v_link FROM public.feedback_links WHERE token = p_token AND active = true LIMIT 1;
  IF v_link.id IS NULL THEN RETURN false; END IF;

  SELECT id INTO v_existing FROM public.teacher_feedback
    WHERE link_id = v_link.id AND course_name = p_course_name AND teacher_name = p_teacher_name
    LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE public.teacher_feedback
      SET draft_payload = p_draft,
          status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END,
          started_at = COALESCE(started_at, now())
      WHERE id = v_existing;
  ELSE
    INSERT INTO public.teacher_feedback
      (student_id, case_manager_id, link_id, course_name, teacher_name, draft_payload, status, started_at)
    VALUES
      (v_link.student_id, v_link.case_manager_id, v_link.id, p_course_name, p_teacher_name, p_draft, 'in_progress', now());
  END IF;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_feedback_link_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_teacher_feedback(TEXT, TEXT, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.save_teacher_feedback_draft(TEXT, TEXT, TEXT, JSONB) TO anon;
