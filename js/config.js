// =============================================================
// Ace Manager — Supabase Configuration
// =============================================================

// Build version — single source of truth for cache-busting. bump-version.js
// rewrites the quoted value on every deploy and appends ?v=<BUILD_VERSION> to
// every local <script>/<link> across the HTML pages, so a fresh deploy always
// changes the query string and browsers can't serve stale JS/CSS.
// The deploy script matches the assignment below by pattern, so keep it on its
// own line with a digits-only value. Run `node bump-version.js` each deploy.
window.BUILD_VERSION = '20260722023607';

const SUPABASE_URL = 'https://npihodfemfpmhhooqtyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waWhvZGZlbWZwbWhob29xdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzUwMzIsImV4cCI6MjA5NjQ1MTAzMn0.KDSh5GeGtbw-45-HK9gBg5Wkb-k2NQY5ui40Ln3H5ZI';

// Branding fallbacks. The real values live on organizations.branding; these are
// only used when the org row (or an individual field) is missing, so the app can
// never render blank branding. Keep in sync with the CSS --purple-primary token
// default in css/styles.css.
window.ACE_DEFAULT_BRANDING = {
  school_name: 'Niles North',
  logo_url: 'assets/vikings-logo.jpg',
  accent: '#4c2c7b'
};

// Seed list of D219 2026-27 non-attendance days (weekday dates; weekends are
// skipped by the countback logic anyway). The source of truth is now
// organizations.non_school_days; this seed is only a safety fallback for when
// the org row is missing or its list is empty, so the countback never silently
// degrades to "weekends only". Edited each school year in Settings, which writes
// to the org. Source: official D219 2026-27 calendar.
window.D219_NON_SCHOOL_DAYS_SEED = [
  '2026-08-10', '2026-09-07', '2026-10-12', '2026-10-23', '2026-11-03',
  '2026-11-25', '2026-11-26', '2026-11-27',
  '2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-25',
  '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01',
  '2027-01-18', '2027-02-15', '2027-03-12',
  '2027-03-22', '2027-03-23', '2027-03-24', '2027-03-25', '2027-03-26'
];

// Initialize Supabase client and expose globally as window.aceSupabase
// (We do NOT create a local `supabase` const because the CDN library already
// uses that name on the window object — declaring it locally throws
// "Identifier 'supabase' has already been declared")
window.aceSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
