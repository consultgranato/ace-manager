-- ============================================================
-- ACE MANAGER — Phase 6
-- Benchmarks on goals, benchmark-aware probes, per-benchmark scoring.
--
-- WHAT CHANGES AND WHY
--
-- 1. iep_goals gains `benchmarks` (jsonb array of three objects, each with its
--    own condition, behavior and criterion) alongside the existing free-text
--    `objectives`. Objectives stay because the IEP document generator and every
--    saved goal already read them; benchmarks are the structured form that
--    progress monitoring can actually score against. The app writes both.
--
-- 2. probes gains `phase`, `seed`, `breakdown` and `timed`. Phase is which
--    third of the year the probe was drawn for — the item mix shifts across the
--    year so earlier benchmarks keep being sampled. Seed makes a probe
--    reproducible. Breakdown is the per-benchmark score.
--
-- 3. probes.kind gains 'observation'. Before this, a third of the goal bank had
--    no probe at all and the app told the case manager to log data by hand,
--    because a student cannot self-administer their own oral reading fluency.
--    An observation probe is scored by the case manager in the app.
--
-- 4. goal_progress_entries gains `breakdown`, `source` and `probe_id`, so a
--    charted point knows which benchmark scores produced it and where it came
--    from. Existing rows are backfilled to source 'manual', which is what they
--    were.
--
-- 5. submit_probe is rewritten to score per benchmark tier as well as overall,
--    to handle short-text answers, and to report a RATE for timed probes
--    (digits correct per minute) rather than a percent, because that is the
--    metric a math CBM goal is actually written in.
--
-- SECURITY IS UNCHANGED. Answer keys still never reach the student's browser:
-- get_probe_by_token strips them and scoring happens inside the function.
-- Observation probes are scored by the authenticated case manager under the
-- existing RLS policies, which is the same trust boundary as logging data by
-- hand. Re-running this file is safe.
-- ============================================================

-- ---- goals ------------------------------------------------------------------

alter table public.iep_goals add column if not exists benchmarks jsonb not null default '[]'::jsonb;
alter table public.iep_goals add column if not exists probe_plan jsonb not null default '{}'::jsonb;
alter table public.iep_goals add column if not exists skill text;
alter table public.iep_goals add column if not exists grade_band text;
alter table public.iep_goals add column if not exists teaching_note text;

-- A goal carries at most three benchmarks. Enforced here rather than only in
-- the UI: the progress rail, the phase mix and the breakdown all assume three.
alter table public.iep_goals drop constraint if exists iep_goals_benchmarks_len;
alter table public.iep_goals add constraint iep_goals_benchmarks_len
  check (jsonb_typeof(benchmarks) = 'array' and jsonb_array_length(benchmarks) <= 3);

-- ---- probes -----------------------------------------------------------------

alter table public.probes add column if not exists phase int not null default 1;
alter table public.probes add column if not exists seed bigint;
alter table public.probes add column if not exists breakdown jsonb not null default '{}'::jsonb;
alter table public.probes add column if not exists timed jsonb;
alter table public.probes add column if not exists elapsed_seconds int;

alter table public.probes drop constraint if exists probes_phase_check;
alter table public.probes add constraint probes_phase_check check (phase between 1 and 3);

-- Widen the kind check to admit adult-scored observation probes.
alter table public.probes drop constraint if exists probes_kind_check;
alter table public.probes add constraint probes_kind_check
  check (kind in ('academic', 'self_report', 'observation'));

create index if not exists idx_probes_goal_status on public.probes(goal_id, status, created_at desc);

-- ---- progress entries -------------------------------------------------------

alter table public.goal_progress_entries add column if not exists breakdown jsonb not null default '{}'::jsonb;
alter table public.goal_progress_entries add column if not exists source text not null default 'manual';
alter table public.goal_progress_entries add column if not exists probe_id uuid;

alter table public.goal_progress_entries drop constraint if exists goal_progress_source_check;
alter table public.goal_progress_entries add constraint goal_progress_source_check
  check (source in ('manual', 'probe', 'observation'));

-- Points logged by an earlier build that came from a probe are identifiable by
-- the note the old submit_probe wrote. Reclassify them so the history view does
-- not label real probe data as hand-entered.
update public.goal_progress_entries
   set source = 'probe'
 where source = 'manual' and note like 'Probe%';

-- ---- anonymous RPCs ---------------------------------------------------------

-- Items with every scoring key stripped: what the student's browser receives.
-- `tier` is deliberately KEPT — it tells the form which benchmark a question
-- belongs to so the probe can be grouped, and it reveals nothing scoreable.
drop function if exists public.get_probe_by_token(text);
create function public.get_probe_by_token(p_token text)
returns table (id uuid, kind text, student_first text, items jsonb, timed jsonb, phase int)
language sql
security definer
set search_path = ''
as $$
  select p.id, p.kind, s.first_name,
    (select coalesce(jsonb_agg(elem - 'answer' - 'best' - 'partial' - 'reverse' - 'levels'), '[]'::jsonb)
       from jsonb_array_elements(p.items) elem),
    p.timed, p.phase
  from public.probes p
  join public.students s on s.id = p.student_id
  where p.token = p_token
    and p.active = true
    and p.status <> 'completed'   -- single-use: completed tokens return nothing
  limit 1;
$$;

-- Scores inside the function and logs the data point.
--
-- p_responses maps item id -> answer: mc/sj the 0-based choice index, numeric
-- the typed number, text the typed string, scale 1-5.
--
-- Returns the value that was charted, or null when the token is stale. For a
-- timed probe that value is a RATE (digits correct per minute); otherwise it is
-- a percent. Per-benchmark percents are written to probes.breakdown and onto
-- the progress entry, so the app can show which rung of the ladder is stuck
-- without re-reading the item list.
drop function if exists public.submit_probe(text, jsonb);
drop function if exists public.submit_probe(text, jsonb, int);
create function public.submit_probe(p_token text, p_responses jsonb, p_elapsed_seconds int default null)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_probe public.probes%rowtype;
  item jsonb;
  resp jsonb;
  v_tier int;
  v_correct numeric;
  pts numeric := 0;
  max_pts numeric := 0;
  -- per-tier running totals, index 1..3
  t_pts numeric[] := array[0,0,0];
  t_max numeric[] := array[0,0,0];
  digits numeric := 0;
  v int;
  v_score numeric;
  v_pct numeric;
  v_entry uuid;
  v_note text;
  v_breakdown jsonb := '{}'::jsonb;
  v_minutes numeric;
  i int;
begin
  select * into v_probe from public.probes
   where token = p_token and active = true and status <> 'completed'
   limit 1;
  if v_probe.id is null then return null; end if;

  for item in select * from jsonb_array_elements(v_probe.items) loop
    resp := p_responses -> (item->>'id');
    v_tier := coalesce((item->>'tier')::int, 1);
    if v_tier < 1 or v_tier > 3 then v_tier := 1; end if;
    v_correct := 0;

    case item->>'type'
      when 'mc', 'numeric' then
        max_pts := max_pts + 1;
        t_max[v_tier] := t_max[v_tier] + 1;
        if resp is not null and jsonb_typeof(resp) = 'number'
           and (resp::text)::numeric = (item->'answer')::text::numeric then
          v_correct := 1;
          -- Digits correct is the CBM math metric. Counting the digits of a
          -- fully correct answer under-credits a partially correct one; that is
          -- a deliberate simplification, and it is consistent across cycles so
          -- the trend line stays comparable to itself.
          digits := digits + length(regexp_replace((item->>'answer'), '[^0-9]', '', 'g'));
        end if;

      when 'text' then
        max_pts := max_pts + 1;
        t_max[v_tier] := t_max[v_tier] + 1;
        if resp is not null and jsonb_typeof(resp) = 'string'
           and lower(btrim(resp #>> '{}')) = lower(btrim(item->>'answer')) then
          v_correct := 1;
          digits := digits + length(regexp_replace((item->>'answer'), '[^0-9]', '', 'g'));
        end if;

      when 'scale' then
        max_pts := max_pts + 1;
        t_max[v_tier] := t_max[v_tier] + 1;
        if resp is not null and jsonb_typeof(resp) = 'number' then
          v := least(5, greatest(1, (resp::text)::int));
          if coalesce((item->>'reverse')::boolean, false) then v := 6 - v; end if;
          v_correct := (v - 1) / 4.0;
        end if;

      when 'sj' then
        max_pts := max_pts + 1;
        t_max[v_tier] := t_max[v_tier] + 1;
        if resp is not null and jsonb_typeof(resp) = 'number' then
          v := (resp::text)::int;
          if v = (item->>'best')::int then
            v_correct := 1;
          elsif item->'partial' is not null
            and exists (select 1 from jsonb_array_elements(item->'partial') px
                        where (px::text)::int = v) then
            v_correct := 0.5;
          end if;
        end if;

      else
        null;  -- unknown item type: excluded from scoring entirely
    end case;

    pts := pts + v_correct;
    t_pts[v_tier] := t_pts[v_tier] + v_correct;
  end loop;

  if max_pts = 0 then return null; end if;
  v_pct := round(pts / max_pts * 100);

  for i in 1..3 loop
    if t_max[i] > 0 then
      v_breakdown := v_breakdown || jsonb_build_object(i::text, round(t_pts[i] / t_max[i] * 100));
    end if;
  end loop;

  -- A timed probe reports a rate, because that is the unit the goal is written
  -- in. Elapsed time comes from the form; fall back to the configured limit so
  -- a missing client value cannot divide by zero.
  if v_probe.timed is not null and (v_probe.timed->>'seconds') is not null then
    v_minutes := greatest(coalesce(p_elapsed_seconds, (v_probe.timed->>'seconds')::int), 1) / 60.0;
    v_score := round(digits / v_minutes);
  else
    v_score := v_pct;
  end if;

  v_note := case
    when v_probe.kind = 'self_report' then 'Probe (self-report) — auto-scored; review before reporting'
    else 'Probe — auto-scored' end;

  insert into public.goal_progress_entries (goal_id, entry_date, value, note, breakdown, source, probe_id)
  values (v_probe.goal_id, current_date, v_score, v_note, v_breakdown, 'probe', v_probe.id)
  returning id into v_entry;

  update public.probes
     set responses = p_responses, score = v_score, breakdown = v_breakdown,
         status = 'completed', completed_at = now(), entry_id = v_entry,
         elapsed_seconds = p_elapsed_seconds
   where id = v_probe.id;

  return v_score;
end;
$$;

grant execute on function public.get_probe_by_token(text) to anon, authenticated;
grant execute on function public.submit_probe(text, jsonb, int) to anon, authenticated;
