-- ============================================================
-- ACE MANAGER — Phase 2.3 Migration
-- Add checklist + attendees columns to meetings table
-- ============================================================

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS prep_checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS followup_checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attendees TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT;

-- Helper function to seed default prep checklist (called from JS on insert)
-- (No-op SQL function — actual seeding happens in JavaScript so we can use
--  centralized template definitions. Column defaults handle missing values.)
