-- ============================================================
-- ACE MANAGER — DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ============================================================

-- Note: We use "profiles" instead of "users" because auth.users is
-- Supabase-managed. Profiles extends it with our custom fields.

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  school_name TEXT NOT NULL DEFAULT '',
  tour_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- students
-- ============================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_initial TEXT NOT NULL CHECK (LENGTH(last_initial) <= 2),
  grade TEXT NOT NULL,
  primary_disability TEXT NOT NULL,
  secondary_disability TEXT,
  placement_type TEXT CHECK (placement_type IN ('gen_ed', 'co_taught', 'sped_resource', 'mixed')),
  has_bip BOOLEAN DEFAULT FALSE,
  service_minutes INTEGER,
  annual_review_date DATE,
  reeval_due_date DATE,
  notes TEXT DEFAULT '',
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_archived ON public.students(archived);

-- ============================================================
-- meetings
-- ============================================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('annual', 'reeval', 'initial', 'amendment', 'transition')),
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  meeting_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meetings_student_id ON public.meetings(student_id);
CREATE INDEX idx_meetings_scheduled_date ON public.meetings(scheduled_date);

-- ============================================================
-- teacher_feedback_requests
-- ============================================================
CREATE TABLE public.teacher_feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  course_name TEXT NOT NULL,
  teacher_name TEXT,
  setting_type TEXT,
  dna_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ
);
CREATE INDEX idx_teacher_feedback_student_id ON public.teacher_feedback_requests(student_id);
CREATE INDEX idx_teacher_feedback_session_token ON public.teacher_feedback_requests(session_token);

-- ============================================================
-- parent_feedback_requests
-- ============================================================
CREATE TABLE public.parent_feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  dna_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ
);
CREATE INDEX idx_parent_feedback_student_id ON public.parent_feedback_requests(student_id);
CREATE INDEX idx_parent_feedback_session_token ON public.parent_feedback_requests(session_token);

-- ============================================================
-- transition_assessments
-- ============================================================
CREATE TABLE public.transition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  dna_code TEXT NOT NULL,
  school_year TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transition_student_id ON public.transition_assessments(student_id);

-- ============================================================
-- iep_drafts
-- ============================================================
CREATE TABLE public.iep_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_narrative TEXT,
  version INTEGER DEFAULT 1,
  last_saved TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_iep_drafts_student_id ON public.iep_drafts(student_id);

-- ============================================================
-- tracker_templates (system library + custom)
-- ============================================================
CREATE TABLE public.tracker_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('frequency', 'academic')),
  default_criterion TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- trackers (instances per student)
-- ============================================================
CREATE TABLE public.trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.tracker_templates(id) ON DELETE SET NULL,
  tracker_name TEXT NOT NULL,
  linked_goal_id UUID,
  criterion TEXT,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trackers_student_id ON public.trackers(student_id);
CREATE INDEX idx_trackers_share_token ON public.trackers(share_token);

-- ============================================================
-- tracker_entries (data points)
-- ============================================================
CREATE TABLE public.tracker_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
  entered_by TEXT DEFAULT 'Anonymous',
  entry_value NUMERIC NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_period TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tracker_entries_tracker_id ON public.tracker_entries(tracker_id);
CREATE INDEX idx_tracker_entries_entry_date ON public.tracker_entries(entry_date);
