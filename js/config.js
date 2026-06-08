// =============================================================
// Ace Manager — Supabase Configuration
// =============================================================

const SUPABASE_URL = 'https://npihodfemfpmhhooqtyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waWhvZGZlbWZwbWhob29xdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzUwMzIsImV4cCI6MjA5NjQ1MTAzMn0.KDSh5GeGtbw-45-HK9gBg5Wkb-k2NQY5ui40Ln3H5ZI';

// Initialize Supabase client and expose globally as window.aceSupabase
// (We do NOT create a local `supabase` const because the CDN library already
// uses that name on the window object — declaring it locally throws
// "Identifier 'supabase' has already been declared")
window.aceSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
