-- ============================================================
-- ACE MANAGER — Phase 5.2
-- Transition plan builder (Indicator 13). One plan row per student
-- carrying the structured plan data (services by area, courses of
-- study, agency linkages, consideration/invite checkboxes) as jsonb.
-- Measurable postsecondary goals stay in iep_goals
-- (goal_type = 'transition') — the plan reads them, never copies them.
--
-- students.dob is added (optional) so the Illinois 14½ transition
-- gate can be computed from a real birth date; when absent the app
-- falls back to the grade-9+ proxy already used by the PLAAFP engine.
--
-- RLS: the proven 4a.3 pattern verbatim — ownership AND org match via
-- the parent student. Does NOT touch existing policies or RPCs
-- (hard-delete/export pick up this table in migration 20).
-- ============================================================

alter table public.students add column if not exists dob date;

create table if not exists public.transition_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_transition_plans_student on public.transition_plans(student_id);

alter table public.transition_plans enable row level security;

drop policy if exists "View transition plans for own students" on public.transition_plans;
create policy "View transition plans for own students" on public.transition_plans for select
  using (exists (select 1 from public.students s where s.id = transition_plans.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert transition plans for own students" on public.transition_plans;
create policy "Insert transition plans for own students" on public.transition_plans for insert
  with check (exists (select 1 from public.students s where s.id = transition_plans.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update transition plans for own students" on public.transition_plans;
create policy "Update transition plans for own students" on public.transition_plans for update
  using (exists (select 1 from public.students s where s.id = transition_plans.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.students s where s.id = transition_plans.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete transition plans for own students" on public.transition_plans;
create policy "Delete transition plans for own students" on public.transition_plans for delete
  using (exists (select 1 from public.students s where s.id = transition_plans.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));
