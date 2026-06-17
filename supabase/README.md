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
- `get_tf_by_token(token)` / `save_tf_draft(token, draft)` / `submit_tf(token, payload)`
- `get_pf_by_token(token)` / `save_pf_draft(token, draft)` / `submit_pf(token, payload)`

Authenticated case managers get full CRUD on rows where `case_manager_id = auth.uid()` via standard policies. The token is an unguessable UUID — knowing it grants access to exactly that one row, nothing more.
