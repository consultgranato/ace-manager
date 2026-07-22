// =============================================================
// Ace Manager — Shared Utilities
// =============================================================

const aceUtils = {

  // Safely parse a date input as a LOCAL date.
  // Bare ISO strings like "2026-06-12" are parsed by `new Date()` as UTC
  // midnight, which causes off-by-one display bugs in any timezone west of UTC.
  // This helper detects that shape and constructs a local-midnight Date.
  parseLocalDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return new Date(dateInput);
    if (typeof dateInput === 'string') {
      const m = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
      }
    }
    const d = new Date(dateInput);
    return isNaN(d) ? null : d;
  },

  // Add a whole number of years to a date-only value, returning a YYYY-MM-DD
  // string. Parses as a LOCAL date (parseLocalDate) so there is no UTC-midnight
  // off-by-one. Feb 29 + N years lands on Feb 28 when the target year is not a
  // leap year (clamped, never rolls into March).
  addYearsISO(dateInput, years) {
    const d = this.parseLocalDate(dateInput);
    if (!d) return null;
    const month = d.getMonth();
    const target = new Date(d.getFullYear() + years, month, d.getDate());
    // Overflow guard: only Feb 29 → non-leap year shifts the month forward;
    // setDate(0) snaps back to the last day of the intended month (Feb 28).
    if (target.getMonth() !== month) target.setDate(0);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // Local Date object → "YYYY-MM-DD" (local components, no UTC shift).
  dateToISO(d) {
    if (!(d instanceof Date) || isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // "Send draft to parent by" countback: n SCHOOL days before meetingDate,
  // skipping Saturdays, Sundays, and any ISO date in nonSchoolDays (the single
  // source of truth — the district calendar is never hardcoded here).
  // Starts the day BEFORE the meeting and steps back one calendar day at a time,
  // counting only in-session weekdays. Out-of-session gaps are simply skipped;
  // a bounded guard ensures it never loops forever. Returns YYYY-MM-DD or null.
  sendDraftByDate(meetingDate, nonSchoolDays, n = 3) {
    const start = this.parseLocalDate(meetingDate);
    if (!start) return null;
    const skip = new Set(Array.isArray(nonSchoolDays) ? nonSchoolDays : []);
    const d = new Date(start);
    let counted = 0;
    let guard = 0;
    while (counted < n && guard < 4000) {
      d.setDate(d.getDate() - 1);   // begin the day before the meeting
      guard++;
      const dow = d.getDay();        // 0 = Sun, 6 = Sat
      if (dow === 0 || dow === 6) continue;
      if (skip.has(this.dateToISO(d))) continue;
      counted++;
    }
    return counted === n ? this.dateToISO(d) : null;
  },

  // Format a date string (YYYY-MM-DD or Date object) to "Mon, Jun 9"
  formatShortDate(dateInput) {
    const d = this.parseLocalDate(dateInput);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  // Format full date "June 9, 2026"
  formatLongDate(dateInput) {
    const d = this.parseLocalDate(dateInput);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  },

  // Days between today and a target date (negative = past)
  daysUntil(dateInput) {
    const d = this.parseLocalDate(dateInput);
    if (!d) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    return Math.floor((d - today) / (1000 * 60 * 60 * 24));
  },

  // Urgency level for a date
  urgency(dateInput) {
    const days = this.daysUntil(dateInput);
    if (days === null) return 'none';
    if (days < 0) return 'overdue';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'approaching';
    return 'clear';
  },

  // Today as ISO date string (YYYY-MM-DD)
  todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // Fallback school-year label for when the org has no calendar configured. A
  // school year is named for the calendar year it starts in and rolls over in
  // June, once the previous one has ended — so a summer date reports the
  // UPCOMING year (what a case manager is preparing for), never the one that
  // just finished.
  currentSchoolYear(todayISO) {
    const d = todayISO ? this.parseLocalDate(todayISO) : new Date();
    const year = d.getFullYear();
    return d.getMonth() >= 5 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
  },

  // School-year label from the org's configured [{start, end}] bounds — the
  // same single source of truth the compliance clock counts school days
  // against. In session: that year. Between years: the next one to start.
  // No bounds on file: the date heuristic above.
  schoolYearLabelFrom(years, todayISO) {
    const today = todayISO || this.todayISO();
    const ranges = (Array.isArray(years) ? years : [])
      .filter(y => y && y.start && y.end)
      .sort((a, b) => a.start.localeCompare(b.start));
    const label = (r) =>
      `${this.parseLocalDate(r.start).getFullYear()}–${this.parseLocalDate(r.end).getFullYear()}`;

    const inSession = ranges.find(r => today >= r.start && today <= r.end);
    if (inSession) return label(inSession);
    const upcoming = ranges.find(r => r.start > today);
    if (upcoming) return label(upcoming);
    return this.currentSchoolYear(today);
  },

  // Current school year as "2026–2027", read from the org calendar. Every
  // user-facing school-year string goes through here so the app never shows
  // two different years on two different screens.
  async currentSchoolYearLabel() {
    let years = [];
    try {
      const org = window.aceAuth ? await window.aceAuth.getOrg() : null;
      const sy = org && org.settings && org.settings.school_years;
      if (Array.isArray(sy)) years = sy;
      else if (org && org.settings && org.settings.school_year) years = [org.settings.school_year];
    } catch (e) { /* fall through to the date heuristic */ }
    return this.schoolYearLabelFrom(years);
  },

  // URL-safe random token for an unauthenticated share link. These links are
  // the only thing between the public internet and student PII, so the bytes
  // come from crypto and the length stays well clear of guessing range: 14
  // base62 characters is ~83 bits. Rejection sampling (bytes >= 248 are
  // discarded) keeps the distribution uniform — a plain modulo would bias the
  // first four letters of the alphabet.
  makeShareToken(prefix, length = 14) {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const limit = 256 - (256 % ALPHABET.length);
    const buf = new Uint8Array(length * 2);
    let out = '';
    while (out.length < length) {
      crypto.getRandomValues(buf);
      for (let i = 0; i < buf.length && out.length < length; i++) {
        if (buf[i] < limit) out += ALPHABET[buf[i] % ALPHABET.length];
      }
    }
    return prefix ? `${prefix}-${out}` : out;
  },

  // Short share URL. /f.html routes to the right form off the token prefix, so
  // the path a teacher or parent receives stays short. Links minted before
  // this (pointing straight at pages/*-form.html) keep working untouched.
  shareLinkURL(token) {
    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
    return `${window.location.origin}${basePath}f.html?t=${token}`;
  },

  // HTML escape helper
  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.aceUtils = aceUtils;
