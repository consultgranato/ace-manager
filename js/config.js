const SUPABASE_URL = 'https://npihodfemfpmhhooqtyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waWhvZGZlbWZwbWhob29xdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzUwMzIsImV4cCI6MjA5NjQ1MTAzMn0.KDSh5GeGtbw-45-HK9gBg5Wkb-k2NQY5ui40Ln3H5ZI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.aceSupabase = supabase;
