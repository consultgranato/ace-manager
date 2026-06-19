-- ============================================================
-- ACE MANAGER — Phase 3.13
-- District non-school days, stored per user on profiles.
--
-- A JSONB array of ISO date strings ("YYYY-MM-DD") that the "Send draft to
-- parent by" prep item skips (in addition to weekends) when counting back
-- school days from a meeting date. Editable in Settings; seeded in-app with the
-- D219 2026-27 non-attendance calendar when empty.
--
-- Default '[]' so existing profile rows get a valid empty array; the app falls
-- back to the seeded default for computation until the user saves their list.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS non_school_days JSONB NOT NULL DEFAULT '[]'::jsonb;
