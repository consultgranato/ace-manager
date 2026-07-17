-- ============================================================
-- ACE MANAGER — Phase 4a.3 ROLLBACK
-- Restores the RLS policies on the 9 isolated tables to their
-- EXACT state prior to Phase 4a.3 (org+user isolation).
--
-- Captured verbatim from pg_policies on 2026-07-17 (production
-- project npihodfemfpmhhooqtyl) BEFORE any 4a.3 write.
--
-- Recovery path: run this whole file via the SQL editor (service
-- role bypasses RLS). It drops the 4a.3 policies by name and
-- recreates the originals. Safe to re-run (drop if exists first).
--
-- NOT touched by 4a.3 and therefore NOT in this file:
--   organizations policies (org_select_own, org_update_admin),
--   the SECURITY DEFINER RPCs, the anon *_requests submit policies,
--   tracker_entries "Anonymous insert entries", tracker_templates.
-- ============================================================

-- ---------- students (TO public) ----------
drop policy if exists "View own students" on public.students;
create policy "View own students" on public.students
  for select to public using (auth.uid() = user_id);

drop policy if exists "Insert own students" on public.students;
create policy "Insert own students" on public.students
  for insert to public with check (auth.uid() = user_id);

drop policy if exists "Update own students" on public.students;
create policy "Update own students" on public.students
  for update to public using (auth.uid() = user_id);

drop policy if exists "Delete own students" on public.students;
create policy "Delete own students" on public.students
  for delete to public using (auth.uid() = user_id);

-- ---------- meetings (TO public) ----------
drop policy if exists "View meetings for own students" on public.meetings;
create policy "View meetings for own students" on public.meetings
  for select to public using (exists (select 1 from students where students.id = meetings.student_id and students.user_id = auth.uid()));

drop policy if exists "Insert meetings for own students" on public.meetings;
create policy "Insert meetings for own students" on public.meetings
  for insert to public with check (exists (select 1 from students where students.id = meetings.student_id and students.user_id = auth.uid()));

drop policy if exists "Update meetings for own students" on public.meetings;
create policy "Update meetings for own students" on public.meetings
  for update to public using (exists (select 1 from students where students.id = meetings.student_id and students.user_id = auth.uid()));

drop policy if exists "Delete meetings for own students" on public.meetings;
create policy "Delete meetings for own students" on public.meetings
  for delete to public using (exists (select 1 from students where students.id = meetings.student_id and students.user_id = auth.uid()));

-- ---------- teacher_feedback (TO authenticated) ----------
drop policy if exists "CM manages own TF rows" on public.teacher_feedback;
create policy "CM manages own TF rows" on public.teacher_feedback
  for all to authenticated using (case_manager_id = auth.uid()) with check (case_manager_id = auth.uid());

-- ---------- parent_feedback (TO authenticated) ----------
drop policy if exists "CM manages own PF rows" on public.parent_feedback;
create policy "CM manages own PF rows" on public.parent_feedback
  for all to authenticated using (case_manager_id = auth.uid()) with check (case_manager_id = auth.uid());

-- ---------- transition_assessments (TO authenticated) ----------
drop policy if exists "CM manages own TA rows" on public.transition_assessments;
create policy "CM manages own TA rows" on public.transition_assessments
  for all to authenticated using (case_manager_id = auth.uid()) with check (case_manager_id = auth.uid());

-- ---------- feedback_links (TO authenticated) ----------
drop policy if exists "CM manages own feedback links" on public.feedback_links;
create policy "CM manages own feedback links" on public.feedback_links
  for all to authenticated using (case_manager_id = auth.uid()) with check (case_manager_id = auth.uid());

-- ---------- iep_drafts (TO public) ----------
drop policy if exists "View drafts for own students" on public.iep_drafts;
create policy "View drafts for own students" on public.iep_drafts
  for select to public using (exists (select 1 from students where students.id = iep_drafts.student_id and students.user_id = auth.uid()));

drop policy if exists "Insert drafts for own students" on public.iep_drafts;
create policy "Insert drafts for own students" on public.iep_drafts
  for insert to public with check (exists (select 1 from students where students.id = iep_drafts.student_id and students.user_id = auth.uid()));

drop policy if exists "Update drafts for own students" on public.iep_drafts;
create policy "Update drafts for own students" on public.iep_drafts
  for update to public using (exists (select 1 from students where students.id = iep_drafts.student_id and students.user_id = auth.uid()));

-- ---------- trackers (TO public) ----------
drop policy if exists "View trackers for own students" on public.trackers;
create policy "View trackers for own students" on public.trackers
  for select to public using (exists (select 1 from students where students.id = trackers.student_id and students.user_id = auth.uid()));

drop policy if exists "Insert trackers for own students" on public.trackers;
create policy "Insert trackers for own students" on public.trackers
  for insert to public with check (exists (select 1 from students where students.id = trackers.student_id and students.user_id = auth.uid()));

drop policy if exists "Update trackers for own students" on public.trackers;
create policy "Update trackers for own students" on public.trackers
  for update to public using (exists (select 1 from students where students.id = trackers.student_id and students.user_id = auth.uid()));

-- ---------- tracker_entries (TO public) ----------
drop policy if exists "View entries for own trackers" on public.tracker_entries;
create policy "View entries for own trackers" on public.tracker_entries
  for select to public using (exists (select 1 from trackers t join students s on t.student_id = s.id where t.id = tracker_entries.tracker_id and s.user_id = auth.uid()));

drop policy if exists "CM delete own entries" on public.tracker_entries;
create policy "CM delete own entries" on public.tracker_entries
  for delete to public using (exists (select 1 from trackers t join students s on t.student_id = s.id where t.id = tracker_entries.tracker_id and s.user_id = auth.uid()));

-- ============================================================
-- End of 4a.3 rollback.
-- ============================================================
