// =============================================================
// Ace Manager — Settings Page
// =============================================================

const aceSettings = {

  async render() {
    const host = document.getElementById('settingsHost');
    if (!host) return;

    const profile = await window.aceAuth.getProfile();
    const user = await window.aceAuth.getUser();

    const fullName = profile?.full_name || 'Case Manager';
    const schoolName = profile?.school_name || '—';
    const email = user?.email || '—';
    const esc = window.aceUtils.escapeHtml;

    host.innerHTML = `
      <div class="settings-page">
        <header class="settings-header">
          <h1>Settings</h1>
          <p class="muted">Manage your account and view archived students.</p>
        </header>

        <section class="settings-section">
          <h2 class="settings-section-title">Account</h2>
          <div class="settings-card">
            <div class="settings-row">
              <div class="settings-label">Name</div>
              <div class="settings-value">${esc(fullName)}</div>
            </div>
            <div class="settings-row">
              <div class="settings-label">Email</div>
              <div class="settings-value">${esc(email)}</div>
            </div>
            <div class="settings-row">
              <div class="settings-label">School</div>
              <div class="settings-value">${esc(schoolName)}</div>
            </div>
          </div>
          <p class="muted settings-note">
            Account details can be edited in Phase 5. Contact support to change your email or school for now.
          </p>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Archived Students</h2>
          <div id="archivedList" class="settings-card-list">
            <div class="muted">Loading…</div>
          </div>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Coming Soon</h2>
          <div class="settings-card settings-card-disabled">
            <ul class="settings-coming-soon">
              <li>${window.aceIcons.rotateCcw(14)} Replay onboarding tour</li>
              <li>${window.aceIcons.settings(14)} Change password</li>
              <li>${window.aceIcons.fileText(14)} Export caseload as CSV</li>
              <li>${window.aceIcons.x(14)} Delete account</li>
            </ul>
          </div>
        </section>

        <section class="settings-section">
          <button class="btn-secondary settings-signout" id="settingsSignOutBtn">
            ${window.aceIcons.logOut(15)} Sign Out
          </button>
        </section>
      </div>
    `;

    document.getElementById('settingsSignOutBtn')?.addEventListener('click', async () => {
      await window.aceAuth.signOut();
      window.aceRouter.toLogin();
    });

    await this.renderArchivedList();
  },

  async renderArchivedList() {
    const list = document.getElementById('archivedList');
    if (!list) return;

    const { data, error } = await window.aceSupabase
      .from('students')
      .select('*')
      .eq('archived', true)
      .order('first_name', { ascending: true });

    if (error) {
      list.innerHTML = '<div class="muted">Could not load archived students.</div>';
      return;
    }

    if (!data || data.length === 0) {
      list.innerHTML = `
        <div class="settings-empty">
          <div class="settings-empty-icon">${window.aceIcons.archive(28)}</div>
          <div class="muted">No archived students.</div>
        </div>
      `;
      return;
    }

    const esc = window.aceUtils.escapeHtml;
    list.innerHTML = data.map(s => `
      <div class="archived-row" data-id="${s.id}">
        <div class="archived-info">
          <div class="archived-name">${esc(s.first_name)} ${esc(s.last_initial)}.</div>
          <div class="archived-meta muted">${esc(s.grade)} · ${esc(s.primary_disability)}</div>
        </div>
        <button class="btn-secondary archived-restore-btn" data-id="${s.id}">
          ${window.aceIcons.rotateCcw(14)} Restore
        </button>
      </div>
    `).join('');

    list.querySelectorAll('.archived-restore-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const student = data.find(s => s.id === id);
        if (!student) return;
        const ok = await window.aceArchiveStudent.restore(student);
        if (ok) await this.renderArchivedList();
      });
    });
  }
};

window.aceSettings = aceSettings;
