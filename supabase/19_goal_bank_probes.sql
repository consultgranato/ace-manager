-- ============================================================
-- ACE MANAGER — Phase 5.3
-- Goal bank support on iep_goals + student progress probes.
--
-- iep_goals grows structured objectives (jsonb array of strings), the
-- originating bank entry id, an Illinois Learning Standards hint, and the
-- probe pool key so probe generation never re-derives it from the bank.
--
-- probes: one row per generated probe. Items are SAMPLED AT GENERATION and
-- stored on the row (with answer keys); the anonymous RPC returns items with
-- every scoring key stripped, and scoring happens INSIDE submit_probe — the
-- student's browser never sees an answer key. On submit the function writes
-- the score into goal_progress_entries, so a completed probe IS a data point.
--
-- RLS: the proven 4a.3 pattern (ownership AND org match via the parent
-- student) on all four commands. Anon access is RPC-only — no direct anon
-- table policies, matching the 06/07/08 link model.
-- ============================================================

alter table public.iep_goals add column if not exists objectives jsonb not null default '[]'::jsonb;
alter table public.iep_goals add column if not exists bank_id text;
alter table public.iep_goals add column if not exists il_standard text;
alter table public.iep_goals add column if not exists probe_pool text;

create table if not exists public.probes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  goal_id uuid not null references public.iep_goals(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  token text unique not null,
  pool_key text not null,
  kind text not null check (kind in ('academic','self_report')),
  cycle_label text not null default '',
  items jsonb not null default '[]'::jsonb,
  responses jsonb,
  score numeric,
  status text not null default 'pending' check (status in ('pending','completed')),
  active boolean not null default true,
  entry_id uuid,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_probes_goal on public.probes(goal_id, created_at);
create index if not exists idx_probes_student on public.probes(student_id);
create index if not exists idx_probes_token on public.probes(token);

alter table public.probes enable row level security;

drop policy if exists "View probes for own students" on public.probes;
create policy "View probes for own students" on public.probes for select
  using (exists (select 1 from public.students s where s.id = probes.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Insert probes for own students" on public.probes;
create policy "Insert probes for own students" on public.probes for insert
  with check (exists (select 1 from public.students s where s.id = probes.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Update probes for own students" on public.probes;
create policy "Update probes for own students" on public.probes for update
  using (exists (select 1 from public.students s where s.id = probes.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())))
  with check (exists (select 1 from public.students s where s.id = probes.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

drop policy if exists "Delete probes for own students" on public.probes;
create policy "Delete probes for own students" on public.probes for delete
  using (exists (select 1 from public.students s where s.id = probes.student_id
    and s.user_id = auth.uid()
    and s.org_id = (select org_id from public.profiles where id = auth.uid())));

-- ---- anonymous RPCs ---------------------------------------------------------

-- Items with every scoring key stripped: what the student's browser receives.
drop function if exists public.get_probe_by_token(text);
create function public.get_probe_by_token(p_token text)
returns table (id uuid, kind text, student_first text, items jsonb)
language sql
security definer
set search_path = ''
as $$
  select p.id, p.kind, s.first_name,
    (select coalesce(jsonb_agg(elem - 'answer' - 'best' - 'partial' - 'reverse'), '[]'::jsonb)
       from jsonb_array_elements(p.items) elem)
  from public.probes p
  join public.students s on s.id = p.student_id
  where p.token = p_token
    and p.active = true
    and p.status <> 'completed'   -- single-use: completed tokens return nothing
  limit 1;
$$;

-- Scores inside the function and logs the data point. p_responses maps
-- item id -> answer: mc/sj the 0-based choice index, numeric the typed
-- number, scale 1–5. Unanswered items score zero (the form requires
-- completion before submit). Returns the rounded percent, or null when the
-- token is stale.
drop function if exists public.submit_probe(text, jsonb);
create function public.submit_probe(p_token text, p_responses jsonb)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_probe public.probes%rowtype;
  item jsonb;
  resp jsonb;
  pts numeric := 0;
  max_pts numeric := 0;
  v int;
  v_score numeric;
  v_entry uuid;
  v_note text;
begin
  select * into v_probe from public.probes
   where token = p_token and active = true and status <> 'completed'
   limit 1;
  if v_probe.id is null then return null; end if;

  for item in select * from jsonb_array_elements(v_probe.items) loop
    resp := p_responses -> (item->>'id');
    case item->>'type'
      when 'mc', 'numeric' then
        max_pts := max_pts + 1;
        if resp is not null and jsonb_typeof(resp) = 'number'
           and (resp::text)::numeric = (item->'answer')::text::numeric then
          pts := pts + 1;
        end if;
      when 'scale' then
        max_pts := max_pts + 1;
        if resp is not null and jsonb_typeof(resp) = 'number' then
          v := least(5, greatest(1, (resp::text)::int));
          if coalesce((item->>'reverse')::boolean, false) then v := 6 - v; end if;
          pts := pts + (v - 1) / 4.0;
        end if;
      when 'sj' then
        max_pts := max_pts + 1;
        if resp is not null and jsonb_typeof(resp) = 'number' then
          v := (resp::text)::int;
          if v = (item->>'best')::int then
            pts := pts + 1;
          elsif item->'partial' is not null
            and exists (select 1 from jsonb_array_elements(item->'partial') px
                        where (px::text)::int = v) then
            pts := pts + 0.5;
          end if;
        end if;
      else
        null;  -- unknown item type: excluded from scoring
    end case;
  end loop;

  if max_pts = 0 then return null; end if;
  v_score := round(pts / max_pts * 100);

  v_note := case when v_probe.kind = 'self_report'
    then 'Probe (self-report) — auto-scored; review before reporting'
    else 'Probe — auto-scored' end;

  insert into public.goal_progress_entries (goal_id, entry_date, value, note)
  values (v_probe.goal_id, current_date, v_score, v_note)
  returning id into v_entry;

  update public.probes
     set responses = p_responses, score = v_score, status = 'completed',
         completed_at = now(), entry_id = v_entry
   where id = v_probe.id;

  return v_score;
end;
$$;

grant execute on function public.get_probe_by_token(text) to anon;
grant execute on function public.submit_probe(text, jsonb) to anon;
grant execute on function public.get_probe_by_token(text) to authenticated;
grant execute on function public.submit_probe(text, jsonb) to authenticated;
