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
              Used to calculate each meeting's “Send draft to parent by” date (3 school days before the meeting)
              and the 60-school-day initial evaluation clock, skipping weekends and these dates.
            </p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
              <span style="font-size:13.5px;font-weight:600;">School year:</span>
              <input type="date" id="syStart" value="${esc(org?.settings?.school_years?.[0]?.start || '')}" />
              <span class="muted" style="font-size:13px;">to</span>
              <input type="date" id="syEnd" value="${esc(org?.settings?.school_years?.[0]?.end || '')}" />
              <span class="muted" style="font-size:12.5px;">days outside this range don't count as school days</span>
            </div>
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

        ${profile?.role === 'org_admin' ? `
        <section class="settings-section">
          <h2 class="settings-section-title">Organization branding</h2>
          <div class="settings-card">
            <p class="muted settings-note" style="margin-top:0;">
              What everyone in ${esc(org?.name || 'your organization')} sees: school name, logo, and accent color.
            </p>
            <div class="org-brand-grid">
              <label><span class="label-text">School name</span>
                <input type="text" id="brandSchool" value="${esc(org?.branding?.school_name || org?.school_name || '')}" /></label>
              <label><span class="label-text">Logo URL</span>
                <input type="text" id="brandLogo" value="${esc(org?.branding?.logo_url || '')}" placeholder="https://…/logo.png" /></label>
              <label><span class="label-text">Accent color</span>
                <input type="color" id="brandAccent" value="${esc(org?.branding?.accent || '#4c2c7b')}" /></label>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
              <button class="btn-primary" id="brandSaveBtn" type="button">Save branding</button>
              <span id="brandStatus" class="muted" style="font-size:13px;"></span>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Course catalog</h2>
          <div class="settings-card">
            <p class="muted settings-note" style="margin-top:0;">
              The classes available in the course picker, org-wide.
              Currently <strong id="catalogCount">${Array.isArray(org?.course_catalog) ? org.course_catalog.length : 0}</strong> courses.
              Import replaces the whole catalog: paste a JSON array of
              {name, code, department, is_academic}, or CSV lines in the form
              <code>name,code,department,academic|nonacademic</code>.
            </p>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
              <button class="btn-secondary" id="catalogDownloadBtn" type="button">${window.aceIcons.fileText(14)} Download current catalog</button>
            </div>
            <textarea id="catalogImportText" class="doc-textarea" rows="6" placeholder='[{"name":"Freshman English","code":"ENYF03","department":"English","is_academic":true}]'></textarea>
            <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
              <button class="btn-primary" id="catalogImportBtn" type="button">Import catalog</button>
              <span id="catalogStatus" class="muted" style="font-size:13px;"></span>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Organization data export</h2>
          <div class="settings-card">
            <p class="muted settings-note" style="margin-top:0;">
              Download your organization's complete dataset as a single JSON file —
              students, meetings, feedback, assessments, goals, progress, probes,
              transition plans, services, and team. This is the SOPPA "hand the
              district their data" export. Treat the file as confidential student records.
            </p>
            <div style="display:flex;align-items:center;gap:12px;">
              <button class="btn-secondary" id="orgExportBtn" type="button">${window.aceIcons.fileText(15)} Export organization data</button>
              <span id="orgExportStatus" class="muted" style="font-size:13px;"></span>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Danger zone — purge organization data</h2>
          <div class="settings-card settings-danger-card">
            <p class="muted settings-note" style="margin-top:0;">
              Permanently deletes <strong>every student record</strong> in
              ${esc(org?.name || 'your organization')} — students, meetings, feedback,
              assessments, transition plans, goals, progress data, probes, services,
              and trackers. Team accounts, branding, the calendar, and the course
              catalog remain. <strong>This cannot be undone.</strong> Export first.
            </p>
            <label><span class="label-text">Type the organization name (<strong>${esc(org?.name || '')}</strong>) to confirm</span>
              <input type="text" id="purgeConfirmText" autocomplete="off" placeholder="${esc(org?.name || '')}" /></label>
            <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
              <button class="btn-secondary settings-danger-btn" id="purgeBtn" type="button" disabled>Purge all student data</button>
              <span id="purgeStatus" class="muted" style="font-size:13px;"></span>
            </div>
          </div>
        </section>` : ''}

        <section class="settings-section">
          <h2 class="settings-section-title">Coming Soon</h2>
          <div class="settings-card settings-card-disabled">
            <ul class="settings-coming-soon">
              <li>${window.aceIcons.rotateCcw(14)} Replay onboarding tour</li>
              <li>${window.aceIcons.settings(14)} Change password</li>
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
    this.initOrgExport();
    if (profile?.role === 'org_admin') {
      this.initBranding();
      this.initCatalog(org);
      this.initPurge(org);
    }
    await this.renderArchivedList();
  },

  // ---- Org branding (Phase 5.4d) — org_admin only; RLS enforces -----------
  initBranding() {
    const btn = document.getElementById('brandSaveBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const status = document.getElementById('brandStatus');
      const branding = {
        school_name: document.getElementById('brandSchool').value.trim(),
        logo_url: document.getElementById('brandLogo').value.trim(),
        accent: document.getElementById('brandAccent').value
      };
      btn.disabled = true;
      if (status) status.textContent = 'Saving…';
      const { error } = await window.aceAuth.updateOrg({ branding });
      btn.disabled = false;
      if (error) {
        if (status) status.textContent = 'Could not save branding.';
        window.aceToast?.error(error.message || 'Could not save');
        return;
      }
      if (status) status.textContent = 'Saved — reload to see it everywhere.';
      window.aceToast?.success('Branding saved');
      document.documentElement.style.setProperty('--purple-primary', branding.accent);
    });
  },

  // ---- Course catalog manager (Phase 5.4a) --------------------------------
  // Accepts a JSON array or CSV (name,code,department,academic|nonacademic).
  _parseCatalog(text) {
    const t = text.trim();
    if (!t) return { error: 'Paste a catalog first.' };
    if (t.startsWith('[')) {
      let arr;
      try { arr = JSON.parse(t); } catch (e) { return { error: 'That JSON does not parse: ' + e.message }; }
      if (!Array.isArray(arr)) return { error: 'Expected a JSON array.' };
      const bad = arr.findIndex(c => !c || typeof c.name !== 'string' || !c.name.trim());
      if (bad >= 0) return { error: `Entry ${bad + 1} has no name.` };
      return {
        catalog: arr.map(c => ({
          name: c.name.trim(),
          code: (typeof c.code === 'string' && c.code.trim()) ? c.code.trim() : null,
          department: (c.department || 'General').trim(),
          is_academic: c.is_academic !== false
        }))
      };
    }
    const rows = t.split('\n').map(l => l.trim()).filter(Boolean);
    const catalog = [];
    for (let i = 0; i < rows.length; i++) {
      const parts = rows[i].split(',').map(p => p.trim());
      if (!parts[0]) return { error: `Line ${i + 1} has no course name.` };
      catalog.push({
        name: parts[0],
        code: parts[1] || null,
        department: parts[2] || 'General',
        is_academic: !/^non/i.test(parts[3] || 'academic')
      });
    }
    return { catalog };
  },

  initCatalog(org) {
    const dl = document.getElementById('catalogDownloadBtn');
    const imp = document.getElementById('catalogImportBtn');
    const status = document.getElementById('catalogStatus');
    if (dl) dl.addEventListener('click', () => {
      const current = Array.isArray(org?.course_catalog) && org.course_catalog.length
        ? org.course_catalog : (window.aceCourseCatalog || []);
      const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'course-catalog.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    if (imp) imp.addEventListener('click', async () => {
      const parsed = this._parseCatalog(document.getElementById('catalogImportText').value);
      if (parsed.error) { status.textContent = parsed.error; return; }
      const ok = await window.aceModal.openModal({
        title: `Replace the course catalog?`,
        message: `The current catalog is replaced by the ${parsed.catalog.length} imported courses for everyone in the organization. Students' already-selected classes are unaffected.`,
        confirmLabel: 'Replace catalog',
        onConfirm: async () => {
          const { error } = await window.aceAuth.updateOrg({ course_catalog: parsed.catalog });
          if (error) throw error;
        }
      });
      if (ok) {
        window.aceCourseCatalog = parsed.catalog;
        const count = document.getElementById('catalogCount');
        if (count) count.textContent = parsed.catalog.length;
        status.textContent = `Imported ${parsed.catalog.length} courses.`;
        window.aceToast?.success('Catalog imported');
      }
    });
  },

  // ---- SOPPA purge (Phase 5.4b) — typed-name confirmation, RPC re-verifies -
  initPurge(org) {
    const input = document.getElementById('purgeConfirmText');
    const btn = document.getElementById('purgeBtn');
    if (!input || !btn) return;
    input.addEventListener('input', () => {
      btn.disabled = input.value !== (org?.name || '');
    });
    btn.addEventListener('click', async () => {
      const status = document.getElementById('purgeStatus');
      const ok = await window.aceModal.openModal({
        title: 'Purge ALL student data?',
        message: `Every student record in ${org?.name} will be permanently deleted. There is no undo and no recovery. Only proceed if you have exported the data and the district has requested this.`,
        confirmLabel: 'Purge permanently', variant: 'danger',
        onConfirm: async () => {
          const { data, error } = await window.aceSupabase.rpc('purge_my_org_data', { p_confirm_name: input.value });
          if (error) throw error;
          if (!data || !data.success) throw new Error('Purge did not run');
          const d = data.deleted || {};
          if (status) status.textContent = `Purged: ${d.students ?? 0} students and all related records.`;
        }
      });
      if (ok) {
        window.aceToast?.success('Organization data purged');
        input.value = '';
        btn.disabled = true;
      }
    });
  },

  // ---- Org data export (SOPPA) — org_admin only; RPC enforces the role ----
  initOrgExport() {
    const btn = document.getElementById('orgExportBtn');
    const status = document.getElementById('orgExportStatus');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      if (status) status.textContent = 'Building export…';
      const { data, error } = await window.aceSupabase.rpc('export_my_org_data');
      btn.disabled = false;
      if (error) {
        console.error('Org export failed:', error);
        if (status) status.textContent = 'Export failed.';
        if (window.aceToast) window.aceToast.error(error.message || 'Could not export');
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ace-manager-export-${window.aceUtils.todayISO()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      if (status) status.textContent = 'Downloaded.';
      if (window.aceToast) window.aceToast.success('Export downloaded');
    });
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
    const updates = { non_school_days: this._nsd };
    const syStart = document.getElementById('syStart')?.value;
    const syEnd = document.getElementById('syEnd')?.value;
    if (syStart && syEnd) {
      const org = await window.aceAuth.getOrg();
      updates.settings = { ...(org?.settings || {}), school_years: [{ start: syStart, end: syEnd }] };
    }
    const { error } = await window.aceAuth.updateOrg(updates);
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
