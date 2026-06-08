-- ============================================================
-- ACE MANAGER — ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iep_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles: users access only their own
-- ============================================================
CREATE POLICY "View own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- students: users access only their own students
-- ============================================================
CREATE POLICY "View own students" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own students" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own students" ON public.students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own students" ON public.students FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- meetings: access via student ownership
-- ============================================================
CREATE POLICY "View meetings for own students" ON public.meetings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = meetings.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert meetings for own students" ON public.meetings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = meetings.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Update meetings for own students" ON public.meetings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = meetings.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Delete meetings for own students" ON public.meetings FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = meetings.student_id AND students.user_id = auth.uid()));

-- ============================================================
-- teacher_feedback_requests: CM creates/views, anonymous can update via share token
-- ============================================================
CREATE POLICY "View teacher feedback for own students" ON public.teacher_feedback_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = teacher_feedback_requests.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert teacher feedback for own students" ON public.teacher_feedback_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = teacher_feedback_requests.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Update teacher feedback for own students" ON public.teacher_feedback_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = teacher_feedback_requests.student_id AND students.user_id = auth.uid()));
-- Allow anonymous updates via share_token (teacher submitting DNA)
CREATE POLICY "Anonymous submit teacher feedback" ON public.teacher_feedback_requests FOR UPDATE
  USING (status = 'pending') WITH CHECK (status = 'received');

-- ============================================================
-- parent_feedback_requests: same pattern
-- ============================================================
CREATE POLICY "View parent feedback for own students" ON public.parent_feedback_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = parent_feedback_requests.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert parent feedback for own students" ON public.parent_feedback_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = parent_feedback_requests.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Anonymous submit parent feedback" ON public.parent_feedback_requests FOR UPDATE
  USING (status = 'pending') WITH CHECK (status = 'received');

-- ============================================================
-- transition_assessments: access via student ownership
-- ============================================================
CREATE POLICY "View transitions for own students" ON public.transition_assessments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = transition_assessments.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert transitions for own students" ON public.transition_assessments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = transition_assessments.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Update transitions for own students" ON public.transition_assessments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = transition_assessments.student_id AND students.user_id = auth.uid()));

-- ============================================================
-- iep_drafts: access via student ownership
-- ============================================================
CREATE POLICY "View drafts for own students" ON public.iep_drafts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = iep_drafts.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert drafts for own students" ON public.iep_drafts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = iep_drafts.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Update drafts for own students" ON public.iep_drafts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = iep_drafts.student_id AND students.user_id = auth.uid()));

-- ============================================================
-- tracker_templates: system templates visible to all, custom visible to creator
-- ============================================================
CREATE POLICY "View system or own templates" ON public.tracker_templates FOR SELECT
  USING (is_system = true OR created_by = auth.uid());
CREATE POLICY "Insert custom templates" ON public.tracker_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_system = false);

-- ============================================================
-- trackers: access via student ownership
-- ============================================================
CREATE POLICY "View trackers for own students" ON public.trackers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = trackers.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Insert trackers for own students" ON public.trackers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = trackers.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Update trackers for own students" ON public.trackers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = trackers.student_id AND students.user_id = auth.uid()));

-- ============================================================
-- tracker_entries: CM views, anonymous can insert via share token (validated at app layer)
-- ============================================================
CREATE POLICY "View entries for own trackers" ON public.tracker_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trackers t
    JOIN public.students s ON t.student_id = s.id
    WHERE t.id = tracker_entries.tracker_id AND s.user_id = auth.uid()
  ));
-- Anonymous insert allowed; share_token validated at application layer
CREATE POLICY "Anonymous insert entries" ON public.tracker_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "CM delete own entries" ON public.tracker_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.trackers t
    JOIN public.students s ON t.student_id = s.id
    WHERE t.id = tracker_entries.tracker_id AND s.user_id = auth.uid()
  ));
