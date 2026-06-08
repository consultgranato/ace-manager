document.addEventListener('DOMContentLoaded', async () => {
  console.log('Ace Manager initializing...');
  if (window.aceSupabase) {
    console.log('✓ Supabase client initialized');
  } else {
    console.error('✗ Supabase client failed to initialize');
  }
});
