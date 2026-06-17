-- ============================================================
-- ACE MANAGER — Phase 3.5 Migration
-- Align parent feedback to shared-link model (matches teacher feedback)
-- ============================================================

-- parent_feedback already exists (from 3.1). Add link-model columns.
ALTER TABLE public.parent_feedback
  ADD COLUMN IF NOT EXISTS cycle_label TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_name TEXT;

CREATE INDEX IF NOT EXISTS idx_pf_active ON public.parent_feedback(student_id, active);

-- Drop the old single-row token RPCs from 3.1 (superseded by shared-link model)
DROP FUNCTION IF EXISTS public.get_pf_by_token(TEXT);
DROP FUNCTION IF EXISTS public.save_pf_draft(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.submit_pf(TEXT, JSONB);

-- ---- Shared-link RPCs (anonymous parent access) ----

-- Load the parent form by token (only when active)
CREATE OR REPLACE FUNCTION public.get_parent_link_by_token(p_token TEXT)
RETURNS TABLE (id UUID, status TEXT, draft_payload JSONB, payload JSONB, cycle_label TEXT, student_first TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT pf.id, pf.status, pf.draft_payload, pf.payload, pf.cycle_label, s.first_name
  FROM public.parent_feedback pf
  JOIN public.students s ON s.id = pf.student_id
  WHERE pf.token = p_token AND pf.active = true
  LIMIT 1;
$$;

-- Save draft (reusable; never burns)
CREATE OR REPLACE FUNCTION public.save_parent_feedback_draft(p_token TEXT, p_draft JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  UPDATE public.parent_feedback
    SET draft_payload = p_draft,
        status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END,
        started_at = COALESCE(started_at, now())
    WHERE token = p_token AND active = true;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

-- Submit (reusable; latest wins)
CREATE OR REPLACE FUNCTION public.submit_parent_feedback(p_token TEXT, p_payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  UPDATE public.parent_feedback
    SET payload = p_payload,
        parent_name = COALESCE(p_payload->>'parentName', parent_name),
        status = 'completed',
        completed_at = now()
    WHERE token = p_token AND active = true;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_parent_link_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.save_parent_feedback_draft(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_parent_feedback(TEXT, JSONB) TO anon;
