-- ============================================================
-- ACE MANAGER — Phase 3.7 Migration
-- Add supersede model to transition_assessments (one active per student)
-- ============================================================

ALTER TABLE public.transition_assessments
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cycle_label TEXT;

CREATE INDEX IF NOT EXISTS idx_ta_active ON public.transition_assessments(student_id, active);

-- Update the 3.1 RPCs to respect active=true (in addition to single-use status check)
DROP FUNCTION IF EXISTS public.get_ta_by_token(TEXT);
CREATE OR REPLACE FUNCTION public.get_ta_by_token(p_token TEXT)
RETURNS TABLE (id UUID, status TEXT, draft_payload JSONB, student_first TEXT, student_grade TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT ta.id, ta.status, ta.draft_payload, s.first_name, s.grade
  FROM public.transition_assessments ta
  JOIN public.students s ON s.id = ta.student_id
  WHERE ta.token = p_token
    AND ta.active = true
    AND ta.status <> 'completed'   -- single-use: completed tokens return nothing
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.save_ta_draft(TEXT, JSONB);
CREATE OR REPLACE FUNCTION public.save_ta_draft(p_token TEXT, p_draft JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  UPDATE public.transition_assessments
    SET draft_payload = p_draft, status = 'in_progress', started_at = COALESCE(started_at, now())
    WHERE token = p_token AND active = true AND status <> 'completed';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

DROP FUNCTION IF EXISTS public.submit_ta(TEXT, JSONB);
CREATE OR REPLACE FUNCTION public.submit_ta(p_token TEXT, p_payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  UPDATE public.transition_assessments
    SET payload = p_payload, status = 'completed', completed_at = now()
    WHERE token = p_token AND active = true AND status <> 'completed';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ta_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.save_ta_draft(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_ta(TEXT, JSONB) TO anon;
