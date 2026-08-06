-- ============================================================
-- ACE MANAGER — placement continuum
--
-- students.placement_type carried a CHECK constraint pinned to the original
-- four options. The onboarding form and the edit drawer now offer the full
-- twelve-step continuum an IEP team actually chooses from, so any student saved
-- with one of the new values was rejected at the database with
-- "violates check constraint students_placement_type_check".
--
-- The legacy value `sped_resource` stays permitted. Students saved under the
-- old list still carry it, and the edit drawer offers it back as a "(legacy)"
-- option rather than silently blanking their placement — a constraint that
-- refused it would make those rows unsaveable on the next unrelated edit.
--
-- NULL remains valid: placement is optional, and `= ANY (...)` yields NULL for
-- a NULL input, which a CHECK constraint treats as passing.
--
-- Safe to re-run.
-- ============================================================

alter table public.students drop constraint if exists students_placement_type_check;

alter table public.students add constraint students_placement_type_check
  check (placement_type = any (array[
    -- current continuum, least to most restrictive
    'gen_ed'::text,
    'co_taught'::text,
    'resource'::text,
    'self_contained'::text,
    'life_skills'::text,
    'therapeutic'::text,
    'vocational'::text,
    'transition'::text,
    'separate_day'::text,
    'residential'::text,
    'home_hospital'::text,
    'mixed'::text,
    -- retained so rows created before the continuum stay editable
    'sped_resource'::text
  ]));
