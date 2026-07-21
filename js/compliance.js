// =============================================================
// Ace Manager — Compliance timeline engine
// =============================================================
// Indicator 11: an initial evaluation must be completed within 60 SCHOOL DAYS
// of parental consent (Illinois, 105 ILCS 5/14-8.02). School days = weekdays
// minus the org's non_school_days calendar — the same single source of truth
// the send-draft countback uses. The timeline is active from consent_date
// until a completed Initial Eligibility meeting exists.

const aceCompliance = {

  // Count school days from (exclusive) startISO through (inclusive) endISO.
  schoolDaysBetween(startISO, endISO, nonSchoolDays) {
    const start = window.aceUtils.parseLocalDate(startISO);
    const end = window.aceUtils.parseLocalDate(endISO);
    if (!start || !end || end <= start) return 0;
    const skip = new Set(Array.isArray(nonSchoolDays) ? nonSchoolDays : []);
    let count = 0, guard = 0;
    const d = new Date(start);
    while (d < end && guard < 4000) {
      d.setDate(d.getDate() + 1);
      guard++;
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      if (skip.has(window.aceUtils.dateToISO(d))) continue;
      count++;
    }
    return count;
  },

  // The date on which the Nth school day after startISO falls.
  addSchoolDays(startISO, n, nonSchoolDays) {
    const start = window.aceUtils.parseLocalDate(startISO);
    if (!start) return null;
    const skip = new Set(Array.isArray(nonSchoolDays) ? nonSchoolDays : []);
    const d = new Date(start);
    let counted = 0, guard = 0;
    while (counted < n && guard < 4000) {
      d.setDate(d.getDate() + 1);
      guard++;
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      if (skip.has(window.aceUtils.dateToISO(d))) continue;
      counted++;
    }
    return counted === n ? window.aceUtils.dateToISO(d) : null;
  },

  // Initial-evaluation timeline for one student, or null when not applicable.
  // Active when consent_date is set and no completed Initial Eligibility
  // meeting exists on or after that consent.
  async initialEvalStatus(student, meetings = null) {
    if (!student || !student.consent_date) return null;

    if (meetings === null) {
      const { data } = await window.aceSupabase.from('meetings')
        .select('meeting_type, completed, scheduled_date')
        .eq('student_id', student.id).eq('completed', true)
        .eq('meeting_type', 'Initial Eligibility');
      meetings = data || [];
    }
    const done = (meetings || []).some(m =>
      m.meeting_type === 'Initial Eligibility' && m.completed &&
      m.scheduled_date >= student.consent_date);
    if (done) return null;

    const nonSchoolDays = window.aceMeetings
      ? await window.aceMeetings._effectiveNonSchoolDays()
      : [];
    const used = this.schoolDaysBetween(student.consent_date, window.aceUtils.todayISO(), nonSchoolDays);
    const deadline = this.addSchoolDays(student.consent_date, 60, nonSchoolDays);
    const left = 60 - used;
    const level = left < 0 ? 'overdue' : left <= 10 ? 'critical' : left <= 20 ? 'approaching' : 'clear';

    return { used, left, deadline, level };
  },

  chipHTML(status) {
    if (!status) return '';
    const when = status.left < 0
      ? `overdue by ${Math.abs(status.left)} school days`
      : `${status.left} school days left`;
    return `<div class="profile-deadline urgency-${status.level}">Initial Evaluation: day ${status.used} of 60 · ${when} · due ${window.aceUtils.formatLongDate(status.deadline)}</div>`;
  }
};

window.aceCompliance = aceCompliance;
