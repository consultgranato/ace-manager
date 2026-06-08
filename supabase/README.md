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
