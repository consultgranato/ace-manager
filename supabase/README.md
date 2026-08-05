# Supabase Setup Instructions

Run these SQL files in order in your Supabase dashboard:
SQL Editor → New query → paste file contents → Run

1. `01_schema.sql` — Creates all tables
2. `02_triggers.sql` — Auto-creates profile rows on signup + updated_at triggers
3. `03_rls_policies.sql` — Row Level Security policies (each user only sees their data)
4. `04_seed_templates.sql` — System tracker templates library

After running all four, verify in Table Editor:
- 10 tables should exist under "public" schema
- 21 rows should exist in `tracker_templates` (all system templates)

5. `05_meetings_checklists.sql` — Meeting logs and checklist tables
6. `06_phase3_tools.sql` — Phase 3.1: courses column on students, TA/TF/PF tables, anonymous token RPCs

## Phase 3.1 — Anonymous Token RLS Pattern

`06_phase3_tools.sql` introduces three new tables (`transition_assessments`, `teacher_feedback`, `parent_feedback`) and a SECURITY DEFINER RPC pattern for anonymous access.

**Design:** Anon users (students/parents/teachers submitting via link) have **no direct table policies**. All anonymous access goes through 9 SECURITY DEFINER functions granted to the `anon` role:

- `get_ta_by_token(token)` / `save_ta_draft(token, draft)` / `submit_ta(token, payload)`
- ~~`get_tf_by_token` / `save_tf_draft` / `submit_tf`~~ — superseded by 3.3a shared-link RPCs (see below)
- `get_pf_by_token(token)` / `save_pf_draft(token, draft)` / `submit_pf(token, payload)`

Authenticated case managers get full CRUD on rows where `case_manager_id = auth.uid()` via standard policies. The token is an unguessable UUID — knowing it grants access to exactly that one row, nothing more.

7. `07_feedback_links.sql` — Phase 3.3a: shared teacher-feedback link model, supersedes per-course TF RPCs

## Phase 3.3a — Shared Teacher-Feedback Link Model

`07_feedback_links.sql` replaces the per-course teacher-feedback token model (3.1) with a single shared link per student per cycle.

**Design:** The case manager generates one link and sends it to the whole team. Each teacher opens it, picks their class from the student's academic courses, types their name, and submits. Co-teachers submitting the same course under different names each get their own row (upsert keyed on `link_id + course_name + teacher_name`).

**Supersede model:** Generating a new link flips `active = false` on all prior links for that student. Stale/inactive tokens return `false` / no rows from all RPCs.

**New RPCs (granted to `anon`):**
- `get_feedback_link_by_token(token)` — returns student first name + academic-only courses, only when `active = true`
- `submit_teacher_feedback(token, course_name, teacher_name, payload)` — upsert on (link, course, teacher)
- `save_teacher_feedback_draft(token, course_name, teacher_name, draft)` — same upsert key, preserves completed rows

**Dropped RPCs (per-course model, no longer needed):** `get_tf_by_token`, `save_tf_draft`, `submit_tf`

No direct anon table policies — all anonymous access is RPC-only.

---

8–20. `08`–`20` — parent links, transition links/meeting id, draft marker, meeting prior dates,
non-school days, org-admin team + hard delete, goals/services/compliance, cycle-label school year,
related-services simplify, transition plans, goal bank + probes, multi-tenant.
*(Not individually documented here — read the header comment at the top of each file.)*

21. `21_provisioning_and_function_hardening.sql` — provisioning gate + function hardening

## Phase 21 — Provisioning gate

Before this migration, `create_organization()` was callable by **any** authenticated user:
anyone who could sign up could stand up a tenant and become its `org_admin`. Org isolation
still held, but that is open self-provisioning, which the product vision explicitly rules out
("never truly open signup on student data"; second-district onboarding is admin-driven).

Org creation now requires a **provisioning code** that only the platform owner can mint.
The `provisioning_codes` table has RLS enabled and **no policies at all**, plus every grant
revoked — so `anon` and `authenticated` can neither read nor write it. The only readers are
the `SECURITY DEFINER` RPC and the SQL editor.

### Minting a code for a new district

```sql
insert into public.provisioning_codes (code, label, max_uses, expires_at)
values ('MTHS-207-2026', 'Maine Township HSD 207 — first admin', 1, now() + interval '30 days');
```

Hand the code to the new district's first admin out of band. They sign up, land on the holding
screen, open "Setting up a new district?", and enter it alongside the district and school names.
The code is consumed on success (`uses` increments, `used_by_org` records which org it created).

To revoke an unused code: `update public.provisioning_codes set active = false where code = '…';`
To audit: `select code, label, uses, max_uses, active, used_by_org, expires_at from public.provisioning_codes;`

### Function hardening

`handle_new_user`, `update_updated_at`, and `students_set_org_id` were running with a mutable
`search_path`, and all three were reachable on the REST API. They are trigger-only functions;
`search_path` is now pinned to `''` and `EXECUTE` is revoked from `public`, `anon`, and
`authenticated`. **Revoking EXECUTE does not stop a trigger from firing** — Postgres checks that
privilege at `CREATE TRIGGER` time, not per-row. This was verified end to end (signup still
creates the profile row; `updated_at` still stamps on update).

This migration also drops the empty `ZZ ISOLATION TEST ORG (4b.1 — delete after audit)` shell,
closing step 1 of the vision's recommended sequence.
