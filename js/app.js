// =============================================================
// Ace Manager — Main App Entry Point
// =============================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Ace Manager initializing...');

  if (!window.aceSupabase) {
    console.error('✗ Supabase client failed to initialize');
    return;
  }
  console.log('✓ Supabase client initialized');

  const allowed = await window.aceRouter.guardPage();
  if (!allowed) return;

  if (window.aceRouter.isProtectedPage()) {
    const profile = await window.aceAuth.getProfile();
    if (profile) {
      console.log(`✓ Welcome ${profile.full_name || 'case manager'}`);
      const greeting = document.getElementById('greeting');
      if (greeting) {
        greeting.textContent = `Welcome back, ${profile.full_name || 'case manager'}!`;
      }
    }
  }
});
