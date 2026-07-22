-- ============================================================
-- ACE MANAGER — Phase 4b.1
-- Correct cycle labels stamped with the wrong school year
-- ============================================================
-- Until 4b.1, aceUtils.currentSchoolYear() rolled the school year
-- over in August. Any link generated during the summer therefore
-- got stamped with the year that had just ENDED — a link created
-- 2026-07-21, while preparing for 2026-27, was labelled
-- "2025–2026 Annual Review" on the student profile.
--
-- The code fix (utils.js: derive the label from the org calendar,
-- and between school years report the UPCOMING one) only affects
-- labels generated from here on. cycle_label is a stored display
-- string, so rows already written keep the wrong year until they
-- are corrected — which is what this does.
--
-- Scope is deliberately narrow: only rows labelled 2025–2026 that
-- were created AFTER that school year ended (2026-05-21 per the
-- org calendar). A link genuinely created during 2025-26 keeps its
-- label. Tokens are untouched, so links already shared with
-- teachers and families keep working.
--
-- Safe to re-run: the WHERE clause no longer matches once applied.
-- ============================================================

update public.feedback_links
set cycle_label = replace(cycle_label, '2025–2026', '2026–2027')
where cycle_label like '2025–2026%'
  and created_at >= date '2026-06-01';

update public.parent_feedback
set cycle_label = replace(cycle_label, '2025–2026', '2026–2027')
where cycle_label like '2025–2026%'
  and created_at >= date '2026-06-01';

update public.transition_assessments
set cycle_label = replace(cycle_label, '2025–2026', '2026–2027')
where cycle_label like '2025–2026%'
  and created_at >= date '2026-06-01';
