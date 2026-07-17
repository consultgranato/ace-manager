// =============================================================
// Ace Manager — Main App Entry Point
// =============================================================

// Paint the org's accent onto the primary token before anything renders.
// Only --purple-primary is org-driven today; the deep/warm/tint shades stay as
// authored in css/styles.css. Deriving those shades (and the gradients that use
// them) from a single accent is a later refinement needed for real second-org
// onboarding — until then a non-purple accent would clash with the fixed shades.
async function applyOrgBranding() {
  const branding = await window.aceAuth.getBranding();
  if (branding.accent) {
    document.documentElement.style.setProperty('--purple-primary', branding.accent);
  }
}

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
    // One org fetch per load; everything downstream reads the cached row.
    await applyOrgBranding();

    const sidebarHost = document.getElementById('sidebarHost');
    if (sidebarHost && window.aceSidebar) {
      await window.aceSidebar.render(sidebarHost);
    }

    const path = window.location.pathname;
    const isHome = path.endsWith('index.html') || path.endsWith('/ace-manager/') || path.endsWith('/ace-manager');
    const isProfile = path.endsWith('student-profile.html');
    const isAddStudent = path.endsWith('add-student.html');

    if (isHome && window.aceHomepage) {
      await window.aceHomepage.render();
    }

    if (isProfile && window.aceProfile) {
      await window.aceProfile.render();
    }

    if (isAddStudent && window.aceAddStudent) {
      await window.aceAddStudent.render();
    }

    const isCaseload = path.endsWith('caseload.html');
    if (isCaseload && window.aceCaseload) {
      await window.aceCaseload.render();
    }

    const isSettings = path.endsWith('settings.html');
    if (isSettings && window.aceSettings) {
      await window.aceSettings.render();
    }
  }
});
