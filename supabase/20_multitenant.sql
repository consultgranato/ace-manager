-- ============================================================
-- ACE MANAGER — Phase 5.4
-- Multi-tenant/commercial layer: per-org course catalog, org join
-- codes (gated self-serve signup), new-district provisioning, SOPPA
-- purge, and hard-delete/export extended to the Phase 5 tables.
--
-- Every function is SECURITY DEFINER with authority enforced INSIDE:
-- org admins act only on their own org; join/create are limited to
-- still-unassigned accounts (org_id IS NULL), so nobody can move or
-- poach an assigned user. The A1 gate is untouched — an unassigned
-- user still cannot create students.
--
-- The D219 course catalog seed for the Niles North org runs as a
-- separate one-time statement (generated from js/courses-catalog.js),
-- not in this file.
-- ============================================================

alter table public.organizations add column if not exists join_code text unique;

-- ---- join-code helpers ------------------------------------------------------
-- Unambiguous alphabet (no 0/O/1/I/L): 8 chars ≈ 41 bits — combined with
-- admin-controlled rotation this gates membership, and joining also requires
-- an authenticated (email-verified) account.
create or replace function public._new_join_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', (floor(random()*31))::int + 1, 1), '')
  from generate_series(1, 8);
$$;
revoke all on function public._new_join_code() from public, anon, authenticated;

-- ---- rotate_my_org_join_code() : admin mints/rotates the code ---------------
drop function if exists public.rotate_my_org_join_code();
create function public.rotate_my_org_join_code()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  v_code text;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can manage the join code';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  loop
    v_code := public._new_join_code();
    begin
      update public.organizations set join_code = v_code, updated_at = now() where id = v_org;
      exit;
    exception when unique_violation then
      -- astronomically unlikely; retry with a fresh code
    end;
  end loop;

  return jsonb_build_object('success', true, 'join_code', v_code);
end;
$$;
revoke all on function public.rotate_my_org_join_code() from public, anon;
grant execute on function public.rotate_my_org_join_code() to authenticated;

-- ---- join_org_with_code(code) : gated self-serve membership -----------------
-- Only a still-unassigned account can join, and only as case_manager.
drop function if exists public.join_org_with_code(text);
create function public.join_org_with_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_current uuid;
  v_org uuid;
  v_org_name text;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.org_id into v_current from public.profiles p where p.id = v_caller;
  if v_current is not null then
    return jsonb_build_object('success', false, 'error', 'already_assigned',
      'message', 'Your account already belongs to an organization.');
  end if;

  select o.id, o.name into v_org, v_org_name
  from public.organizations o
  where o.join_code is not null and upper(trim(p_code)) = o.join_code
  limit 1;

  if v_org is null then
    return jsonb_build_object('success', false, 'error', 'bad_code',
      'message', 'That district code was not recognized. Check it with your administrator — codes rotate.');
  end if;

  update public.profiles set org_id = v_org, role = 'case_manager' where id = v_caller and org_id is null;

  return jsonb_build_object('success', true, 'org_name', v_org_name,
    'message', 'Welcome — your account is now part of ' || v_org_name || '.');
end;
$$;
revoke all on function public.join_org_with_code(text) from public, anon;
grant execute on function public.join_org_with_code(text) to authenticated;

-- ---- create_organization(name, school) : new-district provisioning ----------
-- An unassigned authenticated user stands up a new org and becomes its first
-- org_admin. Nothing here references any specific district; branding,
-- calendar, and catalog are configured by the new admin in Settings.
drop function if exists public.create_organization(text, text);
create function public.create_organization(p_name text, p_school_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_current uuid;
  v_org uuid;
  v_code text;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_school_name), '') = '' then
    return jsonb_build_object('success', false, 'error', 'missing_fields',
      'message', 'A district name and school name are both required.');
  end if;
  select p.org_id into v_current from public.profiles p where p.id = v_caller;
  if v_current is not null then
    return jsonb_build_object('success', false, 'error', 'already_assigned',
      'message', 'Your account already belongs to an organization.');
  end if;
  if exists (select 1 from public.organizations o where lower(o.name) = lower(trim(p_name))) then
    return jsonb_build_object('success', false, 'error', 'name_taken',
      'message', 'An organization with that name already exists. If it is your district, ask its admin for the join code instead.');
  end if;

  v_code := public._new_join_code();
  insert into public.organizations (name, school_name, branding, non_school_days, course_catalog, settings, join_code)
  values (trim(p_name), trim(p_school_name),
          jsonb_build_object('school_name', trim(p_school_name)),
          '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, v_code)
  returning id into v_org;

  update public.profiles set org_id = v_org, role = 'org_admin' where id = v_caller and org_id is null;

  return jsonb_build_object('success', true, 'org_id', v_org, 'join_code', v_code,
    'message', 'Organization created — you are its admin.');
end;
$$;
revoke all on function public.create_organization(text, text) from public, anon;
grant execute on function public.create_organization(text, text) to authenticated;

-- ---- purge_my_org_data(confirm) : SOPPA destructive purge -------------------
-- Deletes EVERY student record and all derived data for the caller's own org.
-- The org shell (team, branding, calendar, catalog) survives so the account
-- remains usable; deleting the org itself stays a deliberate out-of-band act.
-- The typed org name must match exactly — enforced here, not just in the UI.
drop function if exists public.purge_my_org_data(text);
create function public.purge_my_org_data(p_confirm_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  v_org_name text;
  c_gpe int; c_goals int; c_slogs int; c_svcs int; c_te int; c_tr int;
  c_meetings int; c_tf int; c_pf int; c_ta int; c_fl int; c_iep int;
  c_tfr int; c_pfr int; c_tp int; c_pr int; c_students int;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can purge organization data';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;
  select o.name into v_org_name from public.organizations o where o.id = v_org;
  if v_org_name is distinct from p_confirm_name then
    raise exception 'Confirmation text does not match the organization name';
  end if;

  delete from public.goal_progress_entries e using public.iep_goals g, public.students s
   where e.goal_id = g.id and g.student_id = s.id and s.org_id = v_org;
  get diagnostics c_gpe = row_count;
  delete from public.probes p using public.students s where p.student_id = s.id and s.org_id = v_org;
  get diagnostics c_pr = row_count;
  delete from public.iep_goals g using public.students s where g.student_id = s.id and s.org_id = v_org;
  get diagnostics c_goals = row_count;
  delete from public.service_logs sl using public.services v, public.students s
   where sl.service_id = v.id and v.student_id = s.id and s.org_id = v_org;
  get diagnostics c_slogs = row_count;
  delete from public.services v using public.students s where v.student_id = s.id and s.org_id = v_org;
  get diagnostics c_svcs = row_count;
  delete from public.tracker_entries te using public.trackers t, public.students s
   where te.tracker_id = t.id and t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_te = row_count;
  delete from public.trackers t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_tr = row_count;
  delete from public.transition_plans tp using public.students s where tp.student_id = s.id and s.org_id = v_org;
  get diagnostics c_tp = row_count;
  delete from public.meetings m using public.students s where m.student_id = s.id and s.org_id = v_org;
  get diagnostics c_meetings = row_count;
  delete from public.teacher_feedback t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_tf = row_count;
  delete from public.parent_feedback t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_pf = row_count;
  delete from public.transition_assessments t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_ta = row_count;
  delete from public.feedback_links t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_fl = row_count;
  delete from public.iep_drafts t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_iep = row_count;
  delete from public.teacher_feedback_requests t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_tfr = row_count;
  delete from public.parent_feedback_requests t using public.students s where t.student_id = s.id and s.org_id = v_org;
  get diagnostics c_pfr = row_count;
  delete from public.students s where s.org_id = v_org;
  get diagnostics c_students = row_count;

  return jsonb_build_object(
    'success', true, 'organization', v_org_name,
    'deleted', jsonb_build_object(
      'students', c_students, 'meetings', c_meetings,
      'teacher_feedback', c_tf, 'parent_feedback', c_pf,
      'transition_assessments', c_ta, 'transition_plans', c_tp,
      'feedback_links', c_fl, 'iep_drafts', c_iep,
      'iep_goals', c_goals, 'goal_progress_entries', c_gpe, 'probes', c_pr,
      'services', c_svcs, 'service_logs', c_slogs,
      'trackers', c_tr, 'tracker_entries', c_te,
      'teacher_feedback_requests', c_tfr, 'parent_feedback_requests', c_pfr
    )
  );
end;
$$;
revoke all on function public.purge_my_org_data(text) from public, anon;
grant execute on function public.purge_my_org_data(text) to authenticated;

-- ---- hard_delete_student: extend to transition_plans + probes ---------------
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
  c_gpe int; c_goals int; c_slogs int; c_svcs int; c_tp int; c_pr int;
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

  delete from public.probes where student_id = target_student_id;
  get diagnostics c_pr = row_count;

  delete from public.iep_goals where student_id = target_student_id;
  get diagnostics c_goals = row_count;

  delete from public.service_logs sl
   using public.services v
   where sl.service_id = v.id and v.student_id = target_student_id;
  get diagnostics c_slogs = row_count;

  delete from public.services where student_id = target_student_id;
  get diagnostics c_svcs = row_count;

  delete from public.transition_plans where student_id = target_student_id;
  get diagnostics c_tp = row_count;

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
      'transition_assessments', c_ta, 'transition_plans', c_tp, 'feedback_links', c_fl,
      'iep_drafts', c_iep, 'trackers', c_tr, 'tracker_entries', c_te,
      'teacher_feedback_requests', c_tfr, 'parent_feedback_requests', c_pfr,
      'iep_goals', c_goals, 'goal_progress_entries', c_gpe, 'probes', c_pr,
      'services', c_svcs, 'service_logs', c_slogs
    )
  );
end;
$$;
revoke all on function public.hard_delete_student(uuid) from public, anon;
grant execute on function public.hard_delete_student(uuid) to authenticated;

-- ---- export_my_org_data(): extend to transition_plans + probes --------------
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
    'organization', (select to_jsonb(o) - 'join_code' from public.organizations o where o.id = v_org),
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
    'transition_plans', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.transition_plans t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'feedback_links', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.feedback_links t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'iep_drafts', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.iep_drafts t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'iep_goals', (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from public.iep_goals t join public.students s on s.id = t.student_id where s.org_id = v_org),
    'goal_progress_entries', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb)
      from public.goal_progress_entries e join public.iep_goals g on g.id = e.goal_id
      join public.students s on s.id = g.student_id where s.org_id = v_org),
    'probes', (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb)
      from public.probes p join public.students s on s.id = p.student_id where s.org_id = v_org),
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
