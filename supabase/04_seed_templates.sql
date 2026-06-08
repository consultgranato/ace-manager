-- ============================================================
-- ACE MANAGER — SYSTEM TRACKER TEMPLATES
-- ============================================================

-- Frequency templates (behavior)
INSERT INTO public.tracker_templates (template_name, template_type, is_system) VALUES
  ('Off-task behavior', 'frequency', true),
  ('Calling out / blurting', 'frequency', true),
  ('Out of seat / wandering', 'frequency', true),
  ('Refusal to comply', 'frequency', true),
  ('Verbal aggression', 'frequency', true),
  ('Physical aggression', 'frequency', true),
  ('Property destruction', 'frequency', true),
  ('Self-injurious behavior', 'frequency', true),
  ('Self-advocacy (positive)', 'frequency', true),
  ('Peer interaction (positive)', 'frequency', true),
  ('Custom frequency tracker', 'frequency', true);

-- Academic templates
INSERT INTO public.tracker_templates (template_name, template_type, is_system) VALUES
  ('Reading words per minute (ORF)', 'academic', true),
  ('Reading comprehension %', 'academic', true),
  ('Math problem accuracy %', 'academic', true),
  ('Math fact fluency (problems/minute)', 'academic', true),
  ('Writing words per minute', 'academic', true),
  ('Writing rubric score', 'academic', true),
  ('Spelling accuracy %', 'academic', true),
  ('Vocabulary acquisition %', 'academic', true),
  ('Task completion %', 'academic', true),
  ('Goal mastery (yes/no per trial)', 'academic', true);
