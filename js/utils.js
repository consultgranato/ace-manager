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

  // Current school year as "2025–2026" based on today
  currentSchoolYear() {
    const d = new Date();
    const month = d.getMonth(); // 0 = January
    const year = d.getFullYear();
    // School year flips in August (month 7)
    if (month >= 7) return `${year}–${year + 1}`;
    return `${year - 1}–${year}`;
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
