// =============================================================
// Ace Manager — Supabase Configuration
// =============================================================

// Build version — single source of truth for cache-busting. bump-version.js
// rewrites the quoted value on every deploy and appends ?v=<BUILD_VERSION> to
// every local <script>/<link> across the HTML pages, so a fresh deploy always
// changes the query string and browsers can't serve stale JS/CSS.
// The deploy script matches the assignment below by pattern, so keep it on its
// own line with a digits-only value. Run `node bump-version.js` each deploy.
window.BUILD_VERSION = '20260811190143';

const SUPABASE_URL = 'https://npihodfemfpmhhooqtyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waWhvZGZlbWZwbWhob29xdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzUwMzIsImV4cCI6MjA5NjQ1MTAzMn0.KDSh5GeGtbw-45-HK9gBg5Wkb-k2NQY5ui40Ln3H5ZI';

// Branding fallbacks. The real values live on organizations.branding; these are
// only used when the org row (or an individual field) is missing, so the app can
// never render blank branding. Keep the accent in sync with the --accent token
// default in css/styles.css — CSS paints first, this only confirms it.
//
// These are deliberately PRODUCT-neutral, not Niles North: an organization that
// hasn't set its branding yet used to inherit another district's name and crest.
// aceAuth.getBranding() falls back to the org's own school_name / name first, so
// this generic mark only appears when there is no organization context at all.
//
// The accent is neutral slate grey for the same reason. D219 purple belongs to
// the Niles North org row and is painted only for a signed-in, org-assigned user
// — see applyOrgBranding() in js/app.js.
window.ACE_DEFAULT_BRANDING = {
  school_name: 'Ace Manager',
  logo_url: 'assets/ace-mark.svg',
  accent: '#5b6070'
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

// Placement continuum, shared by the onboarding form and the edit drawer.
// It lives here because config.js is the one file every page loads — kept in
// either of those two modules, the page that did not load it would silently
// fall back to a shorter list and quietly change what a case manager can pick.
// Ordered least to most restrictive, which is how an LRE discussion moves.
//
// !! students.placement_type carries a CHECK constraint listing these exact
// values. ADDING A PLACEMENT HERE REQUIRES A MIGRATION — see
// supabase/23_placement_continuum.sql — or the insert fails at save time with
// "violates check constraint students_placement_type_check", which is what
// happened when this list first grew past the original four.
window.ACE_PLACEMENTS = [
  ['gen_ed',         'General education (full inclusion)'],
  ['co_taught',      'Co-taught / collaborative'],
  ['resource',       'Resource / instructional support'],
  ['self_contained', 'Instructional (self-contained)'],
  ['life_skills',    'Life skills / functional academics'],
  ['therapeutic',    'Therapeutic / behavioral program'],
  ['vocational',     'Vocational / work-based placement'],
  ['transition',     'Transition program (18-22)'],
  ['separate_day',   'Separate day school'],
  ['residential',    'Residential placement'],
  ['home_hospital',  'Home / hospital instruction'],
  ['mixed',          'Mixed — varies by period']
];

// Initialize Supabase client and expose globally as window.aceSupabase
// (We do NOT create a local `supabase` const because the CDN library already
// uses that name on the window object — declaring it locally throws
// "Identifier 'supabase' has already been declared")
window.aceSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
