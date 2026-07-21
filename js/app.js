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

// A logged-in user whose profile has no org_id can't see or do anything in the
// app (all data is org-scoped by RLS). Instead of the empty, broken app, show a
// clean holding screen app-wide until an admin assigns them. Returns true when
// the holding screen was shown (caller should stop rendering the normal page).
async function renderUnassignedHoldingIfNeeded() {
  const profile = await window.aceAuth.getProfileCached();
  if (!profile || profile.org_id) return false;

  const esc = (window.aceUtils && window.aceUtils.escapeHtml) ? window.aceUtils.escapeHtml : (s) => s;
  const name = (profile.full_name || '').trim();
  document.body.innerHTML = `
    <main class="holding-screen">
      <div class="holding-card">
        <div class="holding-badge">${window.aceIcons ? window.aceIcons.usersRound(26) : ''}</div>
        <h1>You're almost set${name ? ', ' + esc(name.split(' ')[0]) : ''}</h1>
        <p>Your account isn't assigned to an organization yet. Ask your administrator
           to add you to their team, then sign in again.</p>
        <button class="btn-secondary" id="holdingSignOut">Sign out</button>
      </div>
    </main>
  `;
  const out = document.getElementById('holdingSignOut');
  if (out) out.addEventListener('click', async () => {
    await window.aceAuth.signOut();
    window.aceRouter.toLogin();
  });
  return true;
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
    // Unassigned (org_id NULL) users get the holding screen instead of the app.
    if (await renderUnassignedHoldingIfNeeded()) return;

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

    const isTeam = path.endsWith('team.html');
    if (isTeam && window.aceTeam) {
      await window.aceTeam.render();
    }
  }
});
