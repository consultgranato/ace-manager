-- ============================================================
-- ACE MANAGER — Phase 5.1a
-- Related services simplify: the card becomes a reference-only
-- chip list of service TYPES. Minutes/frequency/provider are no
-- longer collected (columns stay for old rows; the app stops
-- reading and writing them). One optional free-text note lives on
-- the student row, not per service.
--
-- Does NOT touch: services RLS (unchanged, still the 4a.3
-- ownership+org pattern), any other table.
-- ============================================================

alter table public.students
  add column if not exists related_services_note text not null default '';
