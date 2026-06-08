// =============================================================
// Ace Manager — Shared Utilities
// =============================================================

const aceUtils = {

  // Format a date string (YYYY-MM-DD or Date object) to "Mon, Jun 9"
  formatShortDate(dateInput) {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  // Format full date "June 9, 2026"
  formatLongDate(dateInput) {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  },

  // Days between today and a target date (negative = past)
  daysUntil(dateInput) {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d)) return null;
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
