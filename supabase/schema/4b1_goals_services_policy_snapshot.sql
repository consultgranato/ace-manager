-- ============================================================
-- ACE MANAGER — Phase 4b.1 POLICY SNAPSHOT / RESTORE
-- Tables: iep_goals, goal_progress_entries, services, service_logs
--
-- Captured verbatim from pg_policies on 2026-07-21 (production
-- project npihodfemfpmhhooqtyl), BEFORE any 4b.1 write.
--
-- WHY THIS FILE EXISTS, AND WHY IT CHANGES NOTHING
-- ------------------------------------------------------------
-- Phase 4b.1 was scoped to ADD org-match to these four tables on
-- the report that they carried ownership (user_id) only — the
-- pre-4a.3 isolation model. That report was wrong. Every policy
-- on all four tables ALREADY carries the full 4a.3 pattern:
--
--     s.user_id = auth.uid()
--     AND s.org_id = (select org_id from profiles where id = auth.uid())
--
-- verified two independent ways on 2026-07-21:
--   1. pg_policies on the live database — 16 of 16 policies
--      (4 tables x select/insert/update/delete) contain the
--      org_id predicate; RLS is enabled on all four.
--   2. supabase/15_goals_services_compliance.sql, the migration
--      that created them, which shipped the org-match on day one.
--
-- So no DDL was applied. Re-issuing 16 identical policies would
-- have meant a drop/create window on live FERPA data in exchange
-- for no change in behaviour.
--
-- This file is therefore a verified BASELINE rather than the undo
-- of an edit: run it to restore these four tables to their known-
-- good 2026-07-21 state if they are ever altered. Safe to re-run.
--
-- The grandchild tables join through their parent to reach the
-- student (goal_progress_entries via iep_goals, service_logs via
-- services), the same shape tracker_entries uses.
--
-- NOT touched by 4b.1 and therefore NOT in this file:
--   the 9 tables secured in 4a.3 (see 4a3_rollback.sql),
--   organizations policies, the SECURITY DEFINER RPCs,
--   the anon *_requests submit policies, tracker_entries
--   "Anonymous insert entries", tracker_templates.
-- ============================================================

alter table public.iep_goals enable row level security;
alter table public.goal_progress_entries enable row level security;
alter table public.services enable row level security;
alter table public.service_logs enable row level security;

-- ---------- iep_goals (TO public) ----------
drop policy if exists "View goals for own students" on public.iep_goals;
create policy "View goals for own students" on public.iep_goals for select
  using (exists (select 1 from public.students s where s.id = iep_goals.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert goals for own students" on public.iep_goals;
create policy "Insert goals for own students" on public.iep_goals for insert
  with check (exists (select 1 from public.students s where s.id = iep_goals.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update goals for own students" on public.iep_goals;
create policy "Update goals for own students" on public.iep_goals for update
  using (exists (select 1 from public.students s where s.id = iep_goals.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.students s where s.id = iep_goals.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete goals for own students" on public.iep_goals;
create policy "Delete goals for own students" on public.iep_goals for delete
  using (exists (select 1 from public.students s where s.id = iep_goals.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

-- ---------- services (TO public) ----------
drop policy if exists "View services for own students" on public.services;
create policy "View services for own students" on public.services for select
  using (exists (select 1 from public.students s where s.id = services.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert services for own students" on public.services;
create policy "Insert services for own students" on public.services for insert
  with check (exists (select 1 from public.students s where s.id = services.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update services for own students" on public.services;
create policy "Update services for own students" on public.services for update
  using (exists (select 1 from public.students s where s.id = services.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.students s where s.id = services.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete services for own students" on public.services;
create policy "Delete services for own students" on public.services for delete
  using (exists (select 1 from public.students s where s.id = services.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

-- ---------- goal_progress_entries (TO public, via iep_goals) ----------
drop policy if exists "View progress for own students" on public.goal_progress_entries;
create policy "View progress for own students" on public.goal_progress_entries for select
  using (exists (select 1 from public.iep_goals g join public.students s on s.id = g.student_id
    where g.id = goal_progress_entries.goal_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert progress for own students" on public.goal_progress_entries;
create policy "Insert progress for own students" on public.goal_progress_entries for insert
  with check (exists (select 1 from public.iep_goals g join public.students s on s.id = g.student_id
    where g.id = goal_progress_entries.goal_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update progress for own students" on public.goal_progress_entries;
create policy "Update progress for own students" on public.goal_progress_entries for update
  using (exists (select 1 from public.iep_goals g join public.students s on s.id = g.student_id
    where g.id = goal_progress_entries.goal_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.iep_goals g join public.students s on s.id = g.student_id
    where g.id = goal_progress_entries.goal_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete progress for own students" on public.goal_progress_entries;
create policy "Delete progress for own students" on public.goal_progress_entries for delete
  using (exists (select 1 from public.iep_goals g join public.students s on s.id = g.student_id
    where g.id = goal_progress_entries.goal_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

-- ---------- service_logs (TO public, via services) ----------
drop policy if exists "View service logs for own students" on public.service_logs;
create policy "View service logs for own students" on public.service_logs for select
  using (exists (select 1 from public.services v join public.students s on s.id = v.student_id
    where v.id = service_logs.service_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert service logs for own students" on public.service_logs;
create policy "Insert service logs for own students" on public.service_logs for insert
  with check (exists (select 1 from public.services v join public.students s on s.id = v.student_id
    where v.id = service_logs.service_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update service logs for own students" on public.service_logs;
create policy "Update service logs for own students" on public.service_logs for update
  using (exists (select 1 from public.services v join public.students s on s.id = v.student_id
    where v.id = service_logs.service_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.services v join public.students s on s.id = v.student_id
    where v.id = service_logs.service_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete service logs for own students" on public.service_logs;
create policy "Delete service logs for own students" on public.service_logs for delete
  using (exists (select 1 from public.services v join public.students s on s.id = v.student_id
    where v.id = service_logs.service_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));
