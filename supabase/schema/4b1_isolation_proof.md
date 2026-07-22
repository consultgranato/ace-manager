# Phase 4b.1 — cross-org isolation proof

The database connection used during development runs as `postgres` and
**bypasses RLS**. Nothing run from that session can prove isolation. The
checks below have to be run by a second person, signed in as a second user,
through the browser — that is the only path that exercises the policies.

## What is being proven

That a signed-in user in org B cannot read org A's `iep_goals`, `services`
or `goal_progress_entries`, even though those tables key off `student_id`
rather than carrying `org_id` themselves.

The policies these checks exercise are recorded verbatim in
`4b1_goals_services_policy_snapshot.sql`. No DDL was applied in 4b.1 — the
org-match was already present on all 16 policies. These checks confirm the
policies actually behave the way they read.

## Setup

The throwaway second org already exists:

| | |
|---|---|
| Org name | `ZZ ISOLATION TEST ORG (4b.1 — delete after audit)` |
| Org id | `7d6630a1-58c4-437e-914e-5130b7a52bd1` |

### Step 1 — create the second user (Supabase dashboard, Tony)

1. Open the project dashboard → **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Email: use an address you control that is *not* `antgra@d219.org`
   (a `+` alias such as `antgra+isolation@d219.org` is fine).
4. Set a password you can type into the login form.
5. Tick **Auto Confirm User** so no confirmation email is needed.
6. Click **Create user**, then copy the new user's **UID**.

Creating the user fires the existing signup trigger, which writes a
`profiles` row with `org_id` NULL. That user will land on the unassigned
holding screen until step 2 runs — which is itself worth seeing.

### Step 2 — assign that user to the test org

Paste the UID in place of `<UID>` and run in the SQL editor:

```sql
update public.profiles
set org_id = '7d6630a1-58c4-437e-914e-5130b7a52bd1',
    role   = 'case_manager'
where id = '<UID>';
```

### Step 3 — give org A something to fail to read

Org A (Niles North) currently has one student and no goals or services, so
there would be nothing to leak. Before auditing, sign in as **Tony** and add
to the existing student: one goal (Goals & Progress → New Goal), one progress
entry on that goal, and one related service. Note the goal text — the auditor
should never see it.

## The checks — run as the SECOND user, in a fresh browser profile

Sign in at https://consultgranato.github.io/ace-manager/ as the second user.
Use a separate Chrome profile or an incognito window so Tony's session is not
reused; that is the single easiest way to invalidate this whole exercise.

Open DevTools → Console and run each block. **Every one must report 0 rows.**

```js
// 1. Goals — must be 0
(await window.aceSupabase.from('iep_goals').select('*')).data.length
```

```js
// 2. Services — must be 0
(await window.aceSupabase.from('services').select('*')).data.length
```

```js
// 3. Progress entries — must be 0
(await window.aceSupabase.from('goal_progress_entries').select('*')).data.length
```

```js
// 4. Service delivery logs — must be 0
(await window.aceSupabase.from('service_logs').select('*')).data.length
```

```js
// 5. Students — must be 0 (the 4a.3 baseline this all hangs off)
(await window.aceSupabase.from('students').select('*')).data.length
```

```js
// 6. Targeted read: ask for org A's student by id explicitly.
//    Guessing a primary key must not be enough. Must be 0.
(await window.aceSupabase.from('students')
  .select('*').eq('id', 'e516d199-08b2-4c0e-9bab-f543ad998148')).data.length
```

```js
// 7. Write attempt: inserting a goal against org A's student must fail.
//    Expect an error (RLS violation), NOT a created row.
(await window.aceSupabase.from('iep_goals').insert({
  student_id: 'e516d199-08b2-4c0e-9bab-f543ad998148',
  domain: 'Reading', goal_text: 'ISOLATION PROBE — should never be written'
})).error?.message ?? 'NO ERROR — THIS IS A FAILURE'
```

Then, in the UI: the caseload should be empty and Tony's student must not
appear anywhere — sidebar, Home, or search.

### Interpreting the result

- Checks 1–6 return `0` and check 7 returns an RLS error → isolation holds.
- **Any** non-zero count, or check 7 succeeding, is a live FERPA-relevant
  finding. Stop, capture the output, and do not run the pilot.

## Teardown (after the audit)

```sql
-- probe row, if check 7 unexpectedly succeeded
delete from public.iep_goals where goal_text like 'ISOLATION PROBE%';

-- unassign and remove the test profile/org
delete from public.profiles where org_id = '7d6630a1-58c4-437e-914e-5130b7a52bd1';
delete from public.organizations where id = '7d6630a1-58c4-437e-914e-5130b7a52bd1';
```

Then delete the second user in **Authentication → Users**, and remove the
goal, progress entry and service added in step 3.
