-- ============================================================
-- ACE MANAGER — Phase 3.11c
-- Durable "IEP draft generated" marker on the student record.
--
-- The present-levels narrative is generated in-session in the IEP
-- builder. Without a persisted signal, the meeting prep item
-- "Generate IEP draft from latest data" could never auto-check the
-- way the teacher/parent/transition items do (those re-derive from
-- their own DNA tables on every render).
--
-- This column is that durable signal: stamped when the narrative is
-- generated (or a section copied), read by aceMeetings.computeAutoConditions
-- so prep item #4 auto-checks through the same applyAutoChecks path as
-- the other three. It is only a "draft was generated" marker — it stores
-- no narrative text and drives no PLAAFP form fields.
-- ============================================================

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS iep_draft_generated_at TIMESTAMPTZ;
