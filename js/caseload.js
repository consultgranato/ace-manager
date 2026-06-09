// =============================================================
// Ace Manager — Caseload Grid Page
// =============================================================

const aceCaseload = {

  state: {
    filter: 'active'  // 'active' | 'archived'
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
      const addBtn = grid.querySelector('[data-action="add"]');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          window.location.href = this.basePath() + 'pages/add-student.html';
        });
      }
      return;
    }

    grid.innerHTML = list.map(s => this.studentCardHTML(s)).join('');

    grid.querySelectorAll('.caseload-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        window.location.href = `${this.basePath()}pages/student-profile.html?id=${id}`;
      });
    });
  },

  studentCardHTML(s) {
    const status = window.aceStatus.forStudent(s);
    const pillClass = {
      overdue: 'ace-pill-critical',
      critical: 'ace-pill-critical',
      approaching: 'ace-pill-warning',
      clear: 'ace-pill-success',
      none: 'ace-pill-neutral'
    }[status.urgency] || 'ace-pill-neutral';

    const pillText = status.reasons.length > 0
      ? status.reasons[0].text
      : (s.archived ? 'Archived' : 'On track');

    const escapeHtml = window.aceUtils.escapeHtml;

    return `
      <div class="caseload-card ${s.archived ? 'archived' : ''}" data-id="${s.id}">
        <div class="caseload-card-header">
          <div class="caseload-card-name">
            ${escapeHtml(s.first_name)} ${escapeHtml(s.last_initial)}.
          </div>
          <span class="status-dot dot-${status.dot}"></span>
        </div>
        <div class="caseload-card-meta">
          <span>${escapeHtml(s.grade)}</span>
          <span class="dot-sep">·</span>
          <span>${escapeHtml(s.primary_disability)}</span>
        </div>
        <div class="caseload-card-pill">
          <span class="ace-pill ${pillClass}">${escapeHtml(pillText)}</span>
        </div>
        ${s.has_bip ? `<div class="caseload-card-tag">BIP in place</div>` : ''}
        <div class="caseload-card-footer">
          <span class="caseload-card-open">Open profile</span>
        </div>
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
