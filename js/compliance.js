// =============================================================
// Ace Manager — Compliance timeline engine
// =============================================================
// Indicator 11: an initial evaluation must be completed within 60 SCHOOL DAYS
// of parental consent (Illinois, 105 ILCS 5/14-8.02). School days = weekdays
// minus the org's non_school_days calendar — the same single source of truth
// the send-draft countback uses. The timeline is active from consent_date
// until a completed Initial Eligibility meeting exists.

const aceCompliance = {

  // A day is a school day when it is a weekday, not in non_school_days, and —
  // when the org has school-year bounds configured — inside a school year.
  // Without bounds, summer weekdays would count and wreck the clock for any
  // consent signed near year end. `years` = [{start, end}] ISO ranges; the
  // current AND next year can both be listed so a clock can span the summer.
  _isSchoolDay(d, skip, years) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return false;
    const iso = window.aceUtils.dateToISO(d);
    if (skip.has(iso)) return false;
    if (years && years.length) {
      if (!years.some(y => y.start && y.end && iso >= y.start && iso <= y.end)) return false;
    }
    return true;
  },

  // Count school days from (exclusive) startISO through (inclusive) endISO.
  schoolDaysBetween(startISO, endISO, nonSchoolDays, years) {
    const start = window.aceUtils.parseLocalDate(startISO);
    const end = window.aceUtils.parseLocalDate(endISO);
    if (!start || !end || end <= start) return 0;
    const skip = new Set(Array.isArray(nonSchoolDays) ? nonSchoolDays : []);
    let count = 0, guard = 0;
    const d = new Date(start);
    while (d < end && guard < 4000) {
      d.setDate(d.getDate() + 1);
      guard++;
      if (this._isSchoolDay(d, skip, years)) count++;
    }
    return count;
  },

  // The date on which the Nth school day after startISO falls.
  addSchoolDays(startISO, n, nonSchoolDays, years) {
    const start = window.aceUtils.parseLocalDate(startISO);
    if (!start) return null;
    const skip = new Set(Array.isArray(nonSchoolDays) ? nonSchoolDays : []);
    const d = new Date(start);
    let counted = 0, guard = 0;
    while (counted < n && guard < 4000) {
      d.setDate(d.getDate() + 1);
      guard++;
      if (this._isSchoolDay(d, skip, years)) counted++;
    }
    return counted === n ? window.aceUtils.dateToISO(d) : null;
  },

  // School-year ranges from org settings; [] disables the bounds check.
  async _schoolYears() {
    try {
      const org = window.aceAuth ? await window.aceAuth.getOrg() : null;
      const sy = org && org.settings && org.settings.school_years;
      if (Array.isArray(sy)) return sy.filter(y => y && y.start && y.end);
      const one = org && org.settings && org.settings.school_year;
      if (one && one.start && one.end) return [one];
    } catch (e) { /* fall through */ }
    return [];
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
    const years = await this._schoolYears();
    const used = this.schoolDaysBetween(student.consent_date, window.aceUtils.todayISO(), nonSchoolDays, years);
    const deadline = this.addSchoolDays(student.consent_date, 60, nonSchoolDays, years);
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
