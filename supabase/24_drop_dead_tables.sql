-- =============================================================
-- 24 — Retire the Phase 1–2 dead tables and their anon-write policies
-- =============================================================
-- Found in the 2026-08 pilot-readiness review. Four tables survived the
-- Phase 3 rewrite that replaced them, and no application code has referenced
-- any of them since:
--
--   trackers, tracker_entries            — superseded by probes (migration 19)
--   teacher_feedback_requests            — superseded by teacher_feedback +
--   parent_feedback_requests               parent_feedback and the token RPCs
--                                          (migrations 06–08)
--
-- They were not merely dead, they were open. Three policies from 03 were
-- written before the token-RPC pattern existed and let the anon role write
-- without any authentication at all:
--
--   tracker_entries            INSERT WITH CHECK (true)
--   teacher_feedback_requests  UPDATE USING (status = 'pending')
--   parent_feedback_requests   UPDATE USING (status = 'pending')
--
-- The anon key ships in a public repo, so those were unauthenticated write
-- endpoints on the database that holds IEP data. Nothing read back out — none
-- of the three grants SELECT to anon — but junk could be inserted at will.
-- All four tables are empty (verified before this ran), so dropping them
-- destroys nothing.
--
-- !! The three org-wide SECURITY DEFINER functions each deleted from or
-- exported these tables. plpgsql resolves table names at EXECUTION time, so
-- dropping the tables without rewriting the functions would leave
-- hard_delete_student / purge_my_org_data / export_my_org_data raising
-- "relation does not exist" the first time an admin used them — a failure
-- that only appears in production, on the one path with no undo. They are
-- rewritten here, in the same migration, for that reason.
--
-- tracker_templates is deliberately KEPT: it still holds its 21 seeded system
-- templates, it carries no anon-write policy, and nothing about it is unsafe.
-- It is orphaned, not dangerous, and dropping it would destroy seed data to
-- no benefit.
-- =============================================================

-- ---- 1. Rewrite the three functions first ----------------------------------
-- Ordering matters: while these still name the dead tables, the drops below
-- would succeed and leave the functions broken until the next deploy.

-- ---- hard_delete_student(uuid) ---------------------------------------------
create or replace function public.hard_delete_student(target_student_id uuid)
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
  c_meetings int; c_tf int; c_pf int; c_ta int;
  c_fl int; c_iep int;
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

  delete from public.students where id = target_student_id and org_id = v_org;

  return jsonb_build_object(
    'success', true,
    'student_name', v_name,
    'deleted', jsonb_build_object(
      'meetings', c_meetings, 'teacher_feedback', c_tf, 'parent_feedback', c_pf,
      'transition_assessments', c_ta, 'transition_plans', c_tp, 'feedback_links', c_fl,
      'iep_drafts', c_iep,
      'iep_goals', c_goals, 'goal_progress_entries', c_gpe, 'probes', c_pr,
      'services', c_svcs, 'service_logs', c_slogs
    )
  );
end;
$$;
revoke all on function public.hard_delete_student(uuid) from public, anon;
grant execute on function public.hard_delete_student(uuid) to authenticated;

-- ---- purge_my_org_data(text) -----------------------------------------------
create or replace function public.purge_my_org_data(p_confirm_name text)
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
  c_gpe int; c_goals int; c_slogs int; c_svcs int;
  c_meetings int; c_tf int; c_pf int; c_ta int; c_fl int; c_iep int;
  c_tp int; c_pr int; c_students int;
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
      'services', c_svcs, 'service_logs', c_slogs
    )
  );
end;
$$;
revoke all on function public.purge_my_org_data(text) from public, anon;
grant execute on function public.purge_my_org_data(text) to authenticated;

-- ---- export_my_org_data() --------------------------------------------------
create or replace function public.export_my_org_data()
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
      join public.students s on s.id = v.student_id where s.org_id = v_org)
  ) into result;

  return result;
end;
$$;
revoke all on function public.export_my_org_data() from public, anon;
grant execute on function public.export_my_org_data() to authenticated;

-- ---- 2. Drop the dead tables ------------------------------------------------
-- Their policies go with them. tracker_entries before trackers (FK order);
-- cascade is stated anyway so the order can never be the thing that fails.
drop table if exists public.tracker_entries cascade;
drop table if exists public.trackers cascade;
drop table if exists public.teacher_feedback_requests cascade;
drop table if exists public.parent_feedback_requests cascade;
