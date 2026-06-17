-- ============================================================
-- ACE MANAGER — Phase 3.7.1 Fix
-- Add missing meeting_id column to transition_assessments
-- ============================================================

ALTER TABLE public.transition_assessments
  ADD COLUMN IF NOT EXISTS meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ta_meeting ON public.transition_assessments(meeting_id);
