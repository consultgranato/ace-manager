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

// Phase 5.4a — the course catalog is org data. When the org row carries one,
// it replaces the bundled D219 seed (js/courses-catalog.js stays as the
// fallback so the search never comes up empty).
async function applyOrgCatalog() {
  try {
    const org = await window.aceAuth.getOrg();
    if (org && Array.isArray(org.course_catalog) && org.course_catalog.length) {
      window.aceCourseCatalog = org.course_catalog;
    }
  } catch (e) { /* keep the bundled fallback */ }
}

// A logged-in user whose profile has no org_id can't see or do anything in the
// app (all data is org-scoped by RLS). Instead of the empty, broken app, show a
// holding screen app-wide until they join an org — with a district code, by
// admin assignment, or by standing up a new organization (Phase 5.4c/4d).
// Returns true when the holding screen was shown.
async function renderUnassignedHoldingIfNeeded() {
  const profile = await window.aceAuth.getProfileCached();
  if (!profile || profile.org_id) return false;

  const esc = (window.aceUtils && window.aceUtils.escapeHtml) ? window.aceUtils.escapeHtml : (s) => s;
  const name = (profile.full_name || '').trim();

  // A district code captured at signup rides in user metadata — try it once,
  // silently, before showing the holding screen.
  try {
    const user = await window.aceAuth.getUser();
    const pendingCode = user && user.user_metadata && user.user_metadata.join_code;
    if (pendingCode && !sessionStorage.getItem('aceJoinTried')) {
      sessionStorage.setItem('aceJoinTried', '1');
      const { data } = await window.aceSupabase.rpc('join_org_with_code', { p_code: pendingCode });
      if (data && data.success) { window.location.reload(); return true; }
    }
  } catch (e) { /* fall through to the manual form */ }

  document.body.innerHTML = `
    <main class="holding-screen">
      <div class="holding-card">
        <div class="holding-badge">${window.aceIcons ? window.aceIcons.usersRound(26) : ''}</div>
        <h1>You're almost set${name ? ', ' + esc(name.split(' ')[0]) : ''}</h1>
        <p>Your account isn't part of an organization yet. Enter your district code,
           ask your administrator to add you, or set up a new district.</p>

        <div class="holding-join">
          <div class="team-add-row">
            <input type="text" id="holdingJoinCode" placeholder="District code" autocomplete="off" maxlength="12" />
            <button class="btn-primary" id="holdingJoinBtn" type="button">Join</button>
          </div>
          <div id="holdingJoinStatus" class="team-status muted"></div>
        </div>

        <button class="holding-newdistrict-toggle" id="holdingNewToggle" type="button">Setting up a new district? Create an organization →</button>
        <div class="holding-newdistrict" id="holdingNewForm" style="display:none;">
          <input type="text" id="holdingOrgName" placeholder="District name (e.g. Maine Township HSD 207)" autocomplete="off" />
          <input type="text" id="holdingSchoolName" placeholder="School name (e.g. Maine East High School)" autocomplete="off" />
          <button class="btn-primary" id="holdingCreateBtn" type="button">Create organization</button>
          <div id="holdingCreateStatus" class="team-status muted"></div>
        </div>

        <button class="btn-secondary" id="holdingSignOut">Sign out</button>
      </div>
    </main>
  `;

  document.getElementById('holdingSignOut').addEventListener('click', async () => {
    await window.aceAuth.signOut();
    window.aceRouter.toLogin();
  });

  const joinStatus = document.getElementById('holdingJoinStatus');
  const joinBtn = document.getElementById('holdingJoinBtn');
  const doJoin = async () => {
    const code = document.getElementById('holdingJoinCode').value.trim();
    if (!code) { joinStatus.textContent = 'Enter the code your district admin shared.'; return; }
    joinBtn.disabled = true;
    joinStatus.className = 'team-status muted';
    joinStatus.textContent = 'Checking…';
    const { data, error } = await window.aceSupabase.rpc('join_org_with_code', { p_code: code });
    joinBtn.disabled = false;
    if (error || !data || !data.success) {
      joinStatus.className = 'team-status team-status-error';
      joinStatus.textContent = (data && data.message) || 'That code was not recognized.';
      return;
    }
    joinStatus.className = 'team-status team-status-ok';
    joinStatus.textContent = data.message;
    setTimeout(() => window.location.reload(), 700);
  };
  joinBtn.addEventListener('click', doJoin);
  document.getElementById('holdingJoinCode').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doJoin();
  });

  document.getElementById('holdingNewToggle').addEventListener('click', () => {
    const form = document.getElementById('holdingNewForm');
    form.style.display = form.style.display === 'none' ? '' : 'none';
  });
  document.getElementById('holdingCreateBtn').addEventListener('click', async () => {
    const status = document.getElementById('holdingCreateStatus');
    const orgName = document.getElementById('holdingOrgName').value.trim();
    const school = document.getElementById('holdingSchoolName').value.trim();
    status.className = 'team-status muted';
    if (!orgName || !school) { status.textContent = 'District name and school name are both required.'; return; }
    status.textContent = 'Creating…';
    const { data, error } = await window.aceSupabase.rpc('create_organization', { p_name: orgName, p_school_name: school });
    if (error || !data || !data.success) {
      status.className = 'team-status team-status-error';
      status.textContent = (data && data.message) || 'Could not create the organization.';
      return;
    }
    status.className = 'team-status team-status-ok';
    status.textContent = 'Created — loading your new organization…';
    setTimeout(() => window.location.reload(), 700);
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
    await applyOrgCatalog();

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
