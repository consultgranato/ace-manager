-- ============================================================
-- ACE MANAGER — Phase 3.12a
-- Snapshot columns on meetings for due-date revert.
--
-- When a meeting is marked complete, the student's annual_review_date and/or
-- reeval_due_date are advanced (held-date anchor). Before advancing, the
-- pre-advancement value(s) are snapshotted onto the meeting row so 3.12b can
-- restore them if the completed meeting is deleted or edited.
--
-- Only the field(s) a given meeting type changes get snapshotted; the other
-- stays NULL.
-- ============================================================

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS prior_annual_review_date DATE;

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS prior_reeval_due_date DATE;
