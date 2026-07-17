// =============================================================
// Ace Manager — Settings Page
// =============================================================

const aceSettings = {

  async render() {
    const host = document.getElementById('settingsHost');
    if (!host) return;

    const profile = await window.aceAuth.getProfile();
    const user = await window.aceAuth.getUser();
    const org = await window.aceAuth.getOrg();

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
          <h2 class="settings-section-title">District non-school days (D219 2026-27) — edit each school year</h2>
          <div class="settings-card">
            <p class="muted settings-note" style="margin-top:0;">
              Used to calculate each meeting's “Send draft to parent by” date (3 school days before the meeting), skipping weekends and these dates.
            </p>
            <div class="nsd-add-row" style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
              <input type="date" id="nsdNewDate" />
              <button class="btn-secondary" id="nsdAddBtn" type="button">${window.aceIcons.plus(14)} Add date</button>
            </div>
            <div id="nsdList" class="nsd-list" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;">
              <button class="btn-primary" id="nsdSaveBtn" type="button">Save non-school days</button>
              <span id="nsdStatus" class="muted" style="font-size:13px;"></span>
            </div>
          </div>
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

    this.initNonSchoolDays(org);
    await this.renderArchivedList();
  },

  // ---- District non-school days editor (Phase 3.13) -----------
  // Phase 4a.2: the calendar is org-level, shared by everyone in the district —
  // it reads and writes organizations.non_school_days, not the profile.
  initNonSchoolDays(org) {
    const stored = org && org.non_school_days;
    const seeded = Array.isArray(window.D219_NON_SCHOOL_DAYS_SEED) ? window.D219_NON_SCHOOL_DAYS_SEED : [];
    // Working copy: the org's saved list when present, otherwise the seed (so the
    // editor is pre-populated and a first Save persists the seed to the org).
    this._nsd = (Array.isArray(stored) && stored.length) ? stored.slice() : seeded.slice();
    this._nsdUsingSeed = !(Array.isArray(stored) && stored.length);
    this._sortNsd();

    const addBtn = document.getElementById('nsdAddBtn');
    const saveBtn = document.getElementById('nsdSaveBtn');
    const input = document.getElementById('nsdNewDate');
    if (addBtn) addBtn.addEventListener('click', () => {
      const v = input && input.value;
      if (!v) return;
      if (!this._nsd.includes(v)) { this._nsd.push(v); this._sortNsd(); this.renderNonSchoolDays(); this._setNsdStatus('Unsaved changes'); }
      if (input) input.value = '';
    });
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveNonSchoolDays());

    this.renderNonSchoolDays();
    if (this._nsdUsingSeed) this._setNsdStatus('Showing the D219 seed — Save to make it your own.');
  },

  _sortNsd() { this._nsd.sort((a, b) => a.localeCompare(b)); },

  _setNsdStatus(msg) {
    const el = document.getElementById('nsdStatus');
    if (el) el.textContent = msg || '';
  },

  renderNonSchoolDays() {
    const list = document.getElementById('nsdList');
    if (!list) return;
    if (!this._nsd.length) {
      list.innerHTML = '<span class="muted" style="font-size:13px;">No dates — “Send draft by” will skip weekends only.</span>';
      return;
    }
    list.innerHTML = this._nsd.map(d => `
      <span class="nsd-chip" data-date="${d}" style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid var(--border);border-radius:14px;font-size:13px;background:#fff;">
        ${window.aceUtils.escapeHtml(window.aceUtils.formatShortDate(d))}, ${d.slice(0, 4)}
        <button type="button" class="nsd-remove" data-date="${d}" aria-label="Remove ${d}" style="border:none;background:none;cursor:pointer;color:var(--text-muted);line-height:1;padding:0;">${window.aceIcons.x(13)}</button>
      </span>
    `).join('');
    list.querySelectorAll('.nsd-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.date;
        this._nsd = this._nsd.filter(x => x !== d);
        this.renderNonSchoolDays();
        this._setNsdStatus('Unsaved changes');
      });
    });
  },

  async saveNonSchoolDays() {
    const saveBtn = document.getElementById('nsdSaveBtn');
    if (saveBtn) { saveBtn.disabled = true; }
    this._setNsdStatus('Saving…');
    // Writes to the org row. RLS allows this for org admins only — a non-admin's
    // attempt comes back as an error, which we surface rather than fail silently.
    const { error } = await window.aceAuth.updateOrg({ non_school_days: this._nsd });
    if (saveBtn) saveBtn.disabled = false;
    if (error) {
      console.error('Failed to save non-school days:', error);
      this._setNsdStatus('Could not save — you may not have permission to edit the district calendar.');
      if (window.aceToast) window.aceToast.error('Could not save non-school days');
      return;
    }
    this._nsdUsingSeed = false;
    this._setNsdStatus('Saved.');
    if (window.aceToast) window.aceToast.success('Non-school days saved');
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
