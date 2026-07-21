-- ============================================================
-- ACE MANAGER — Phase 4a.4
-- Org-admin team provisioning + student hard-delete RPCs.
--
-- Every function is SECURITY DEFINER (owned by postgres, bypasses RLS) and
-- enforces authority INSIDE the function: the caller must be an org_admin and
-- may act ONLY within their own organization. A non-admin — or an admin aiming
-- at another org's user/student — is rejected. This is the FERPA line.
--
-- Security-critical guard failures RAISE (hard abort); user-facing validation
-- (email not found, already a member, etc.) returns a {success:false,...} jsonb
-- so the UI can show a friendly message.
--
-- Does NOT touch: 4a.3 RLS policies, the anonymous form RPCs, the *_requests
-- policies, or the organizations policies. No org-wide purge exists here.
-- ============================================================

-- ---- list_my_org_team() : admin-only team roster (name, email, role) --------
drop function if exists public.list_my_org_team();
create function public.list_my_org_team()
returns table (user_id uuid, full_name text, email text, role text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can view the team';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  return query
    select p.id, p.full_name, u.email::text, p.role
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.org_id = v_org
    order by (p.role = 'org_admin') desc, p.full_name nulls last, u.email;
end;
$$;

-- ---- assign_user_to_my_org(target_email) : add an existing user to my org ----
drop function if exists public.assign_user_to_my_org(text);
create function public.assign_user_to_my_org(target_email text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  v_target uuid;
  v_target_org uuid;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can add members';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  select u.id into v_target
  from auth.users u
  where lower(u.email) = lower(trim(target_email))
  limit 1;

  if v_target is null then
    return jsonb_build_object('success', false, 'error', 'not_found',
      'message', 'No user found with that email. Ask them to create an account first, then add them.');
  end if;

  select p.org_id into v_target_org from public.profiles p where p.id = v_target;

  if v_target_org is not null then
    if v_target_org = v_org then
      return jsonb_build_object('success', false, 'error', 'already_member',
        'message', 'That user is already a member of your organization.');
    else
      return jsonb_build_object('success', false, 'error', 'in_other_org',
        'message', 'That user already belongs to another organization and cannot be added.');
    end if;
  end if;

  -- Only ever touch a still-unassigned user; never poach another org's member.
  update public.profiles
     set org_id = v_org, role = 'case_manager'
   where id = v_target and org_id is null;

  return jsonb_build_object('success', true, 'user_id', v_target,
    'message', 'Member added to your organization.');
end;
$$;

-- ---- remove_user_from_my_org(target_user_id) : revoke a member's access ------
drop function if exists public.remove_user_from_my_org(uuid);
create function public.remove_user_from_my_org(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_role text;
  v_org uuid;
  v_target_org uuid;
begin
  if v_caller is null then raise exception 'Not authenticated'; end if;
  select p.role, p.org_id into v_role, v_org from public.profiles p where p.id = v_caller;
  if v_role is distinct from 'org_admin' then
    raise exception 'Only organization admins can remove members';
  end if;
  if v_org is null then
    raise exception 'Your account is not assigned to an organization';
  end if;

  if target_user_id = v_caller then
    return jsonb_build_object('success', false, 'error', 'self',
      'message', 'You cannot remove yourself from the organization.');
  end if;

  select p.org_id into v_target_org from public.profiles p where p.id = target_user_id;
  if v_target_org is null or v_target_org <> v_org then
    return jsonb_build_object('success', false, 'error', 'not_in_your_org',
      'message', 'That user is not a member of your organization.');
  end if;

  -- Revoke access: org_id -> NULL (their data remains, they can no longer reach it).
  update public.profiles set org_id = null
   where id = target_user_id and org_id = v_org;

  return jsonb_build_object('success', true, 'message', 'Member removed from your organization.');
end;
$$;

-- ---- hard_delete_student(target_student_id) : irreversible full delete -------
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
    -- The FERPA line: never delete another org's student.
    raise exception 'That student is not in your organization';
  end if;

  -- All child FKs are ON DELETE CASCADE, so the final students delete alone
  -- would suffice; we still delete children explicitly (in FK-safe order) to
  -- guarantee zero orphans deterministically and to report per-table counts.
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
      'teacher_feedback_requests', c_tfr, 'parent_feedback_requests', c_pfr
    )
  );
end;
$$;

-- ---- grants: authenticated only (never anon) --------------------------------
-- Supabase's default privileges auto-grant EXECUTE to anon on new public
-- functions, so we revoke from BOTH public and anon explicitly. (Each function
-- also rejects an unauthenticated caller internally, so this is defense in
-- depth, not the only guard.)
revoke all on function public.list_my_org_team()            from public, anon;
revoke all on function public.assign_user_to_my_org(text)   from public, anon;
revoke all on function public.remove_user_from_my_org(uuid) from public, anon;
revoke all on function public.hard_delete_student(uuid)     from public, anon;

grant execute on function public.list_my_org_team()            to authenticated;
grant execute on function public.assign_user_to_my_org(text)   to authenticated;
grant execute on function public.remove_user_from_my_org(uuid) to authenticated;
grant execute on function public.hard_delete_student(uuid)     to authenticated;
