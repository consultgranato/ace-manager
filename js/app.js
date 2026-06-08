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
    const sidebarHost = document.getElementById('sidebarHost');
    if (sidebarHost && window.aceSidebar) {
      await window.aceSidebar.render(sidebarHost);
    }

    const path = window.location.pathname;
    const isHome = path.endsWith('index.html') || path.endsWith('/ace-manager/') || path.endsWith('/ace-manager');
    if (isHome && window.aceHomepage) {
      await window.aceHomepage.render();
    }
  }
});
