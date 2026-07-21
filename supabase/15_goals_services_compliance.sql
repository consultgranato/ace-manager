-- ============================================================
-- ACE MANAGER — Phase 5 data layer
-- IEP goals (annual + transition), progress monitoring entries,
-- related services + service logs, compliance dates, org data export.
--
-- RLS on every new table follows the proven 4a.3 pattern verbatim:
-- ownership AND org-match, via the parent student join (or a two-level
-- join for grandchild tables, same as tracker_entries). Criterion and
-- measurement method are STRUCTURED (jsonb / text enums), not prose, so
-- progress monitoring rides on them without a rebuild.
--
-- Also redefines hard_delete_student to explicitly clear + count the new
-- child tables (they already cascade; explicit deletes keep the
-- deterministic zero-orphan guarantee and per-table counts).
--
-- Does NOT touch: 4a.3 policies on existing tables, anonymous form RPCs,
-- *_requests policies, organizations policies.
-- ============================================================

-- ---- tables -----------------------------------------------------------------

create table if not exists public.iep_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  goal_type text not null default 'annual' check (goal_type in ('annual','transition')),
  domain text not null,
  transition_area text check (transition_area in ('education_training','employment','independent_living')),
  condition text not null default '',
  behavior text not null default '',
  criterion jsonb not null default '{}'::jsonb,
  measurement_method text not null default '',
  baseline text not null default '',
  goal_text text not null default '',
  source_need text,
  status text not null default 'active' check (status in ('active','met','discontinued')),
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_iep_goals_student on public.iep_goals(student_id);

create table if not exists public.goal_progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.iep_goals(id) on delete cascade,
  entry_date date not null,
  value numeric,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_goal_progress_goal on public.goal_progress_entries(goal_id, entry_date);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  service_type text not null,
  provider text not null default '',
  minutes_per_week int not null default 0,
  frequency text not null default '',
  location text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_services_student on public.services(student_id);

create table if not exists public.service_logs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  log_date date not null,
  minutes int not null default 0,
  status text not null default 'delivered' check (status in ('delivered','missed','makeup')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_service_logs_service on public.service_logs(service_id, log_date);

-- ---- compliance fields on students -----------------------------------------
-- referral/consent drive the 60-school-day initial evaluation timeline
-- (Indicator 11); accommodations feed the gen-ed one-pager document.
alter table public.students add column if not exists referral_date date;
alter table public.students add column if not exists consent_date date;
alter table public.students add column if not exists accommodations jsonb not null default '[]'::jsonb;

-- ---- RLS: ownership AND org-match (4a.3 pattern) ---------------------------

alter table public.iep_goals enable row level security;
alter table public.goal_progress_entries enable row level security;
alter table public.services enable row level security;
alter table public.service_logs enable row level security;

-- Direct child tables (student join) — iep_goals, services
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

-- Grandchild tables (two-level join, same as tracker_entries)
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

-- ---- hard_delete_student: extend to the new child tables --------------------
-- Same guards as 14_*; adds explicit deletes + counts for goals/progress/
-- services/logs so the zero-orphan guarantee stays deterministic.
drop function if exists public.hard_delete_student(uuid);
create function public.hard_delete_student(target_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  v_student_org uuid;
  v_name text;
  c_te int; c_tr int; c_meetings int; c_tf int; c_pf int; c_ta int;
  c_fl int; c_iep int; c_tfr int; c_pfr int;
  c_gpe int; c_goals int; c_slogs int; c_svcs int;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can permanently delete a student';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  select s.org_id, s.first_name || ' ' || s.last_initial || '.'
    into v_student_org, v_name
  from public.students s
  where s.id = target_student_id;

  if v_student_org is null then
    raise exception 'Student not found';
  end if;
  if v_student_org <> v_org then
    raise exception 'That student is not in your organization';
  end if;

  delete from public.goal_progress_entries gpe
   using public.iep_goals g
   where gpe.goal_id = g.id and g.student_id = target_student_id;
  get diagnostics c_gpe = row_count;

  delete from public.iep_goals where student_id = target_student_id;
  get diagnostics c_goals = row_count;

  delete from public.service_logs sl
   using public.services v
   where sl.service_id = v.id and v.student_id = target_student_id;
  get diagnostics c_slogs = row_count;

  delete from public.services where student_id = target_student_id;
  get diagnostics c_svcs = row_count;

  delete from public.tracker_entries te
   using public.trackers t
   where te.tracker_id = t.id and t.student_id = target_student_id;
  get diagnostics c_te = row_count;

  delete from public.trackers where student_id = target_student_id;
  get diagnostics c_tr = row_count;

  delete from public.meetings where student_id = target_student_id;
  get diagnostics c_meetings = row_count;

  delete from public.teacher_feedback where student_id = target_student_id;
  get diagnostics c_tf = row_count;

  delete from public.parent_feedback where student_id = target_student_id;
  get diagnostics c_pf = row_count;

  delete from public.transition_assessments where student_id = target_student_id;
  get diagnostics c_ta = row_count;

  delete from public.feedback_links where student_id = target_student_id;
  get diagnostics c_fl = row_count;

  delete from public.iep_drafts where student_id = target_student_id;
  get diagnostics c_iep = row_count;

  delete from public.teacher_feedback_requests where student_id = target_student_id;
  get diagnostics c_tfr = row_count;

  delete from public.parent_feedback_requests where student_id = target_student_id;
  get diagnostics c_pfr = row_count;

  delete from public.students where id = target_student_id and org_id = v_org;

  return jsonb_build_object(
    'success', true,
    'student_name', v_name,
    'deleted', jsonb_build_object(
      'meetings', c_meetings, 'teacher_feedback', c_tf, 'parent_feedback', c_pf,
      'transition_assessments', c_ta, 'feedback_links', c_fl, 'iep_drafts', c_iep,
      'trackers', c_tr, 'tracker_entries', c_te,
      'teacher_feedback_requests', c_tfr, 'parent_feedback_requests', c_pfr,
      'iep_goals', c_goals, 'goal_progress_entries', c_gpe,
      'services', c_svcs, 'service_logs', c_slogs
    )
  );
end;
$$;

revoke all on function public.hard_delete_student(uuid) from public, anon;
grant execute on function public.hard_delete_student(uuid) to authenticated;

-- ---- export_my_org_data(): SOPPA per-org export -----------------------------
-- Org-admin only. Returns the org's complete dataset as one jsonb document —
-- what "hand a district their data" means in practice. Read-only; no purge
-- counterpart here (org purge stays a deliberate, out-of-band operation).
drop function if exists public.export_my_org_data();
create function public.export_my_org_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  result jsonb;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can export organization data';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  select jsonb_build_object(
    'exported_at', now(),
    'organization', (select to_jsonb(o) from public.organizations o where o.id = v_org),
    'team', (select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', p.id, 'full_name', p.full_name, 'role', p.role, 'email', u.email)), '[]'::jsonb)
      from public.profiles p join auth.users u on u.id = p.id where p.org_id = v_org),
    'students', (select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
      from public.students s where s.org_id = v_org),
    'meetings', (select coalesce(jsonb_agg(to_jsonb(m)), '[]'::jsonb)
      from public.meetings m join public.students s on s.id = m.student_id where s.org_id = v_org),
    'teacher_feedback', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.teacher_feedback t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'parent_feedback', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.parent_feedback t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'transition_assessments', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.transition_assessments t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'feedback_links', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.feedback_links t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'iep_drafts', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.iep_drafts t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'iep_goals', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.iep_goals t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'goal_progress_entries', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb)
      from public.goal_progress_entries e join public.iep_goals g on g.id = e.goal_id
      join public.students s on s.id = g.student_id where s.org_id = v_org),
    'services', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.services t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'service_logs', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb)
      from public.service_logs e join public.services v on v.id = e.service_id
      join public.students s on s.id = v.student_id where s.org_id = v_org),
    'trackers', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.trackers t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'tracker_entries', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb)
      from public.tracker_entries e join public.trackers t on t.id = e.tracker_id
      join public.students s on s.id = t.student_id where s.org_id = v_org)
  ) into result;

  return result;
end;
$$;

revoke all on function public.export_my_org_data() from public, anon;
grant execute on function public.export_my_org_data() to authenticated;
