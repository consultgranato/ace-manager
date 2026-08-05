-- =============================================================
-- 21 — Provisioning gate + function hardening
-- =============================================================
-- Two unrelated defects found in the 2026-08 vision audit, both in the one
-- class the vision says an edit pass can't catch:
--
--   1. create_organization() was callable by ANY authenticated user, so anyone
--      who could sign up could stand up a tenant and make themselves its
--      org_admin. Isolation still held (they saw nothing of another org), but
--      §6 says provisioning is admin-driven and signup is never truly open.
--      Org creation now requires a provisioning code that only the platform
--      owner can mint, handed to a new district's first admin out of band.
--
--   2. Three functions ran with a mutable search_path, and the new-user trigger
--      function was additionally exposed on the REST API to anon. A
--      SECURITY DEFINER function with an unpinned search_path is the
--      privilege-escalation shape; pin it and stop publishing the trigger.
-- =============================================================

-- ---- provisioning_codes : platform-owner-minted, single-use by default ------
-- No RLS policies are defined on purpose. RLS is enabled and the table has no
-- policy, so every client role — anon and authenticated alike — sees zero rows
-- and can write nothing. The only readers are the SECURITY DEFINER function
-- below and the SQL editor, which is exactly the intended surface.
create table if not exists public.provisioning_codes (
  code        text primary key,
  label       text,
  max_uses    integer not null default 1,
  uses        integer not null default 0,
  expires_at  timestamptz,
  active      boolean not null default true,
  used_by_org uuid references public.organizations(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.provisioning_codes enable row level security;
revoke all on table public.provisioning_codes from public, anon, authenticated;

-- ---- create_organization(name, school, provisioning_code) ------------------
-- Replaces the ungated two-argument version. The old signature is dropped
-- rather than kept as an overload so a stale cached client fails closed with a
-- missing-function error instead of silently creating an org.
drop function if exists public.create_organization(text, text);
drop function if exists public.create_organization(text, text, text);

create function public.create_organization(
  p_name text,
  p_school_name text,
  p_provisioning_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller  uuid := auth.uid();
  v_current uuid;
  v_org     uuid;
  v_code    text;
  v_prov    public.provisioning_codes%rowtype;
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

  -- Provisioning gate. Checked before the name check so a probing caller
  -- without a valid code learns nothing about which org names are taken.
  if coalesce(trim(p_provisioning_code), '') = '' then
    return jsonb_build_object('success', false, 'error', 'missing_code',
      'message', 'A provisioning code is required to set up a new district. Contact Consult Granato Education to request one.');
  end if;

  select * into v_prov
  from public.provisioning_codes c
  where upper(c.code) = upper(trim(p_provisioning_code))
  for update;

  if v_prov.code is null
     or v_prov.active is not true
     or (v_prov.expires_at is not null and v_prov.expires_at < now())
     or v_prov.uses >= v_prov.max_uses then
    return jsonb_build_object('success', false, 'error', 'bad_provisioning_code',
      'message', 'That provisioning code is not valid, has expired, or has already been used.');
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

  update public.provisioning_codes
     set uses = uses + 1,
         used_by_org = coalesce(used_by_org, v_org)
   where code = v_prov.code;

  return jsonb_build_object('success', true, 'org_id', v_org, 'join_code', v_code,
    'message', 'Organization created — you are its admin.');
end;
$$;

revoke all on function public.create_organization(text, text, text) from public, anon;
grant execute on function public.create_organization(text, text, text) to authenticated;

-- ---- function hardening -----------------------------------------------------
-- Pin search_path on the three functions that were running with a mutable one.
alter function public.handle_new_user()     set search_path = '';
alter function public.update_updated_at()   set search_path = '';
alter function public.students_set_org_id() set search_path = '';

-- handle_new_user is an auth.users trigger, not an API. It was reachable at
-- /rest/v1/rpc/handle_new_user by anon. It has no business being callable.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- update_updated_at and students_set_org_id are likewise trigger-only.
revoke all on function public.update_updated_at()   from public, anon, authenticated;
revoke all on function public.students_set_org_id() from public, anon, authenticated;

-- ---- teardown: the 4b.1 isolation test org ----------------------------------
-- The cross-org isolation audit org (supabase/schema/4b1_isolation_proof.md).
-- Its user and students were removed at the end of that audit; this drops the
-- empty shell, closing step 1 of the vision's recommended sequence.
delete from public.organizations
 where name = 'ZZ ISOLATION TEST ORG (4b.1 — delete after audit)'
   and not exists (select 1 from public.profiles p where p.org_id = organizations.id)
   and not exists (select 1 from public.students s where s.org_id = organizations.id);
