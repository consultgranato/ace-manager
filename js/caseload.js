// =============================================================
// Ace Manager — Caseload Grid Page
// =============================================================

const aceCaseload = {

  state: {
    filter: 'active',  // 'active' | 'archived'
    view: 'cards'      // 'cards' | 'list' — remembered in-memory for the session
  },

  async render() {
    await this.renderShell();
    await this.loadAndRenderStudents();
  },

  async renderShell() {
    const host = document.getElementById('caseloadHost');
    if (!host) return;

    host.innerHTML = `
      <div class="caseload-page">
        <header class="caseload-header">
          <div>
            <h1>My Caseload</h1>
            <p class="muted" id="caseloadSubtitle">Loading…</p>
          </div>
          <button class="btn-primary" id="caseloadAddBtn">
            ${window.aceIcons.plus(16)} New Student
          </button>
        </header>

        <div class="caseload-toolbar">
          <div class="caseload-filter">
            <button class="caseload-tab ${this.state.filter === 'active' ? 'active' : ''}" data-filter="active">
              Active
              <span class="caseload-tab-count" id="activeCount">0</span>
            </button>
            <button class="caseload-tab ${this.state.filter === 'archived' ? 'active' : ''}" data-filter="archived">
              Archived
              <span class="caseload-tab-count" id="archivedCount">0</span>
            </button>
          </div>

          <div class="caseload-viewtoggle" role="group" aria-label="View">
            <button class="caseload-view-btn ${this.state.view === 'cards' ? 'active' : ''}" data-view="cards" title="Card view" aria-label="Card view">
              ${window.aceIcons.layoutGrid ? window.aceIcons.layoutGrid(15) : ''} Cards
            </button>
            <button class="caseload-view-btn ${this.state.view === 'list' ? 'active' : ''}" data-view="list" title="List view" aria-label="List view">
              ${window.aceIcons.list ? window.aceIcons.list(15) : ''} List
            </button>
          </div>
        </div>

        <div class="caseload-grid" id="caseloadGrid">
          <div class="muted" style="padding:20px;">Loading students…</div>
        </div>
      </div>
    `;

    document.getElementById('caseloadAddBtn').addEventListener('click', () => {
      window.location.href = this.basePath() + 'pages/add-student.html';
    });

    document.querySelectorAll('.caseload-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.filter = btn.dataset.filter;
        this.updateFilterUI();
        this.loadAndRenderStudents();
      });
    });

    document.querySelectorAll('.caseload-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.state.view === btn.dataset.view) return;
        this.state.view = btn.dataset.view;
        document.querySelectorAll('.caseload-view-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.view === this.state.view);
        });
        this.loadAndRenderStudents();
      });
    });
  },

  updateFilterUI() {
    document.querySelectorAll('.caseload-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.state.filter);
    });
  },

  async loadAndRenderStudents() {
    const grid = document.getElementById('caseloadGrid');
    const subtitle = document.getElementById('caseloadSubtitle');
    if (!grid) return;

    const { data: allStudents, error } = await window.aceSupabase
      .from('students')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      grid.innerHTML = `<div class="empty-state">Could not load students.</div>`;
      return;
    }

    const active = (allStudents || []).filter(s => !s.archived);
    const archived = (allStudents || []).filter(s => s.archived);

    document.getElementById('activeCount').textContent = active.length;
    document.getElementById('archivedCount').textContent = archived.length;

    const list = this.state.filter === 'active' ? active : archived;

    if (subtitle) {
      if (this.state.filter === 'active') {
        subtitle.textContent = `${active.length} of 15 students on your caseload`;
      } else {
        subtitle.textContent = archived.length === 0 ? 'No archived students' : `${archived.length} archived ${archived.length === 1 ? 'student' : 'students'}`;
      }
    }

    if (list.length === 0) {
      grid.innerHTML = this.emptyStateHTML();
      return;
    }

    // Bulk fetch meetings for the students we're about to render
    const studentIds = list.map(s => s.id);
    let meetingsByStudent = {};
    if (window.aceMeetings && studentIds.length > 0) {
      const { data: meetings } = await window.aceSupabase
        .from('meetings')
        .select('*')
        .in('student_id', studentIds);
      (meetings || []).forEach(m => {
        if (!meetingsByStudent[m.student_id]) meetingsByStudent[m.student_id] = [];
        meetingsByStudent[m.student_id].push(m);
      });
    }

    const isList = this.state.view === 'list';
    grid.classList.toggle('caseload-grid-cards', !isList);
    grid.classList.toggle('caseload-grid-list', isList);

    grid.innerHTML = list.map(s => {
      const activeMeeting = window.aceMeetings
        ? window.aceMeetings.computeActiveFromMeetings(meetingsByStudent[s.id] || [])
        : null;
      return isList ? this.studentRowHTML(s, activeMeeting) : this.studentCardHTML(s, activeMeeting);
    }).join('');

    grid.querySelectorAll('.caseload-card, .caseload-row').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        window.location.href = `${this.basePath()}pages/student-profile.html?id=${id}`;
      });
    });
  },

  studentCardHTML(s, activeMeeting) {
    const escapeHtml = window.aceUtils.escapeHtml;

    // Archived students always show neutral pill labeled "Archived"
    if (s.archived) {
      return `
        <div class="caseload-card archived" data-id="${s.id}">
          <div class="caseload-card-header">
            <div class="caseload-card-name">${escapeHtml(s.first_name)} ${escapeHtml(s.last_initial)}.</div>
            <span class="status-dot dot-gray"></span>
          </div>
          <div class="caseload-card-meta">
            <span class="caseload-card-grade">${escapeHtml(s.grade)}</span>
            <span class="caseload-card-disability">${escapeHtml(s.primary_disability)}</span>
          </div>
          <div class="caseload-card-pill">
            <span class="ace-pill ace-pill-neutral">Archived</span>
          </div>
          ${s.has_bip ? `<div class="caseload-card-tag">BIP in place</div>` : ''}
          <div class="caseload-card-footer">
            <span class="caseload-card-open">Open profile</span>
          </div>
        </div>
      `;
    }

    // Meeting-aware status for active students
    const state = window.aceStatus.fullState(s, activeMeeting);

    // Pill color derives from the same dot the status uses (Part 2 shared
    // scale), so the dot and pill can never disagree.
    const pillClass = window.aceStatus.pillClassForDot(state.dot);

    return `
      <div class="caseload-card" data-id="${s.id}">
        <div class="caseload-card-header">
          <div class="caseload-card-name">${escapeHtml(s.first_name)} ${escapeHtml(s.last_initial)}.</div>
          <span class="status-dot dot-${state.dot}"></span>
        </div>
        <div class="caseload-card-meta">
          <span class="caseload-card-grade">${escapeHtml(s.grade)}</span>
          <span class="caseload-card-disability">${escapeHtml(s.primary_disability)}</span>
        </div>
        <div class="caseload-card-pill">
          <span class="ace-pill ${pillClass}">${escapeHtml(state.pillLabel)}</span>
        </div>
        ${s.has_bip ? `<div class="caseload-card-tag">BIP in place</div>` : ''}
        <div class="caseload-card-footer">
          <span class="caseload-card-open">Open profile</span>
        </div>
      </div>
    `;
  },

  // Prefer a parenthetical abbreviation (e.g., "…(SLD)" → "SLD") for the dense
  // list; fall back to the full label (CSS truncates it).
  _disabilityAbbrev(d) {
    if (!d) return '';
    const m = String(d).match(/\(([^)]+)\)/);
    return m ? m[1] : d;
  },

  // Compact grade for the dense list (e.g., "10 (Sophomore)" → "Gr 10") so it
  // never wraps; full grade stays available via the title attribute.
  _gradeShort(g) {
    if (!g) return '';
    const m = String(g).match(/\d+/);
    return m ? `Gr ${m[0]}` : String(g);
  },

  // Dense one-row-per-student rendering for the list view (Part 4).
  studentRowHTML(s, activeMeeting) {
    const esc = window.aceUtils.escapeHtml;

    if (s.archived) {
      return `
        <div class="caseload-row archived" data-id="${s.id}">
          <span class="status-dot dot-gray"></span>
          <span class="caseload-row-name">${esc(s.first_name)} ${esc(s.last_initial)}.</span>
          <span class="caseload-row-grade" title="${esc(s.grade || '')}">${esc(this._gradeShort(s.grade))}</span>
          <span class="caseload-row-disability" title="${esc(s.primary_disability || '')}">${esc(this._disabilityAbbrev(s.primary_disability))}</span>
          <span class="caseload-row-status"><span class="ace-pill ace-pill-neutral">Archived</span></span>
        </div>
      `;
    }

    const state = window.aceStatus.fullState(s, activeMeeting);
    const pillClass = window.aceStatus.pillClassForDot(state.dot);

    return `
      <div class="caseload-row" data-id="${s.id}">
        <span class="status-dot dot-${state.dot}"></span>
        <span class="caseload-row-name">${esc(s.first_name)} ${esc(s.last_initial)}.${s.has_bip ? ' <span class="caseload-row-bip">BIP</span>' : ''}</span>
        <span class="caseload-row-grade" title="${esc(s.grade || '')}">${esc(this._gradeShort(s.grade))}</span>
        <span class="caseload-row-disability" title="${esc(s.primary_disability || '')}">${esc(this._disabilityAbbrev(s.primary_disability))}</span>
        <span class="caseload-row-status"><span class="ace-pill ${pillClass}">${esc(state.pillLabel)}</span></span>
      </div>
    `;
  },

  emptyStateHTML() {
    const basePath = this.basePath();
    if (this.state.filter === 'active') {
      return `
        <div class="caseload-empty">
          <div class="caseload-empty-icon">${window.aceIcons.usersRound(36)}</div>
          <h3>Your caseload is empty</h3>
          <p class="muted">
            Add your first student to get started. Ace Manager works best with up to 15 students per case manager.
          </p>
          <a href="${basePath}pages/add-student.html" class="btn-primary caseload-empty-cta">
            ${window.aceIcons.plus(15)} Add Student
          </a>
        </div>
      `;
    }
    return `
      <div class="caseload-empty">
        <div class="caseload-empty-icon">${window.aceIcons.archive(36)}</div>
        <h3>Nothing archived yet</h3>
        <p class="muted">
          When you archive a student, they move here. Archived students don't appear on your caseload, calendar, or homepage — but you can restore them anytime.
        </p>
      </div>
    `;
  },

  basePath() {
    const path = window.location.pathname;
    if (path.includes('/ace-manager/')) return '/ace-manager/';
    return '/';
  }
};

window.aceCaseload = aceCaseload;
