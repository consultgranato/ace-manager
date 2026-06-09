// =============================================================
// Ace Manager — Student Profile Dashboard
// =============================================================

const aceProfile = {

  state: {
    studentId: null,
    student: null
  },

  async render() {
    const params = new URLSearchParams(window.location.search);
    this.state.studentId = params.get('id');

    if (!this.state.studentId) {
      this.renderNotFound('No student ID provided.');
      return;
    }

    const { data, error } = await window.aceSupabase
      .from('students')
      .select('*')
      .eq('id', this.state.studentId)
      .single();

    if (error || !data) {
      this.renderNotFound('Student not found or you do not have access.');
      return;
    }

    this.state.student = data;
    this.renderHeader();
    this.renderCards();
    this.renderNotesDrawer();
  },

  renderHeader() {
    const host = document.getElementById('profileHeader');
    if (!host) return;
    const s = this.state.student;
    const nextDeadline = this.computeNextDeadline(s);
    const basePath = this.basePath();

    host.innerHTML = `
      <a href="${basePath}pages/caseload.html" class="back-link">${window.aceIcons.arrowLeft(15)} Back to Caseload</a>
      <div class="profile-identity">
        <h1 class="profile-name">${window.aceUtils.escapeHtml(s.first_name)} ${window.aceUtils.escapeHtml(s.last_initial)}.</h1>
        <div class="profile-meta">
          <span>${window.aceUtils.escapeHtml(s.grade)}</span>
          <span class="dot-sep">·</span>
          <span>${window.aceUtils.escapeHtml(s.primary_disability)}</span>
          ${s.secondary_disability ? `<span class="dot-sep">·</span><span class="muted">${window.aceUtils.escapeHtml(s.secondary_disability)}</span>` : ''}
        </div>
        ${nextDeadline.html}
      </div>
    `;
  },

  computeNextDeadline(s) {
    const candidates = [];
    if (s.annual_review_date) {
      candidates.push({
        label: 'Annual Review',
        date: s.annual_review_date,
        days: window.aceUtils.daysUntil(s.annual_review_date),
        urgency: window.aceUtils.urgency(s.annual_review_date)
      });
    }
    if (s.reeval_due_date) {
      candidates.push({
        label: 'Re-evaluation',
        date: s.reeval_due_date,
        days: window.aceUtils.daysUntil(s.reeval_due_date),
        urgency: window.aceUtils.urgency(s.reeval_due_date)
      });
    }

    if (candidates.length === 0) {
      return { html: '<div class="profile-deadline urgency-none muted">No deadlines on file</div>' };
    }

    candidates.sort((a, b) => a.days - b.days);
    const next = candidates[0];

    let label;
    if (next.days < 0) label = `${next.label}: overdue by ${Math.abs(next.days)} days`;
    else if (next.days === 0) label = `${next.label}: due today`;
    else label = `${next.label}: ${next.days} days`;

    return {
      html: `<div class="profile-deadline urgency-${next.urgency}">${label}</div>`
    };
  },

  renderCards() {
    const host = document.getElementById('profileCards');
    if (!host) return;

    const cards = [
      {
        id: 'iep',
        icon: window.aceIcons.fileText(18),
        title: 'IEP Builder',
        status: 'Never started',
        statusDot: 'gray',
        actionLabel: 'Open IEP Builder',
        actionDisabled: true,
        comingSoon: 'Phase 3'
      },
      {
        id: 'transition',
        icon: window.aceIcons.compass(18),
        title: 'Transition Assessment',
        status: 'Not yet administered',
        statusDot: 'gray',
        actionLabel: 'Administer Assessment',
        actionDisabled: true,
        comingSoon: 'Phase 3'
      },
      {
        id: 'teacher-feedback',
        icon: window.aceIcons.graduationCap(18),
        title: 'Teacher Feedback',
        status: 'No links sent',
        statusDot: 'gray',
        actionLabel: 'Manage Feedback',
        actionDisabled: true,
        comingSoon: 'Phase 3'
      },
      {
        id: 'parent-feedback',
        icon: window.aceIcons.usersRound(18),
        title: 'Parent Feedback',
        status: 'Not sent',
        statusDot: 'gray',
        actionLabel: 'Send Parent Form',
        actionDisabled: true,
        comingSoon: 'Phase 3'
      },
      {
        id: 'data',
        icon: window.aceIcons.barChart(18),
        title: 'Data Collection',
        status: 'No trackers active',
        statusDot: 'gray',
        actionLabel: 'View Trackers',
        actionDisabled: true,
        comingSoon: 'Phase 4'
      },
      {
        id: 'meetings',
        icon: window.aceIcons.calendar(18),
        title: 'Meeting Notes',
        status: 'No meeting scheduled',
        statusDot: 'gray',
        actionLabel: 'Schedule Meeting',
        actionDisabled: true,
        comingSoon: 'Phase 2'
      }
    ];

    host.innerHTML = cards.map(c => `
      <div class="profile-card" data-card="${c.id}">
        <div class="card-header">
          <div class="card-icon">${c.icon}</div>
          <div class="card-title">${c.title}</div>
          <div class="card-status-dot dot-${c.statusDot}" title="${c.status}"></div>
        </div>
        <div class="card-status-text">${c.status}</div>
        <button class="card-action" ${c.actionDisabled ? 'disabled' : ''}>
          ${c.actionLabel}
        </button>
        ${c.comingSoon ? `<div class="card-coming-soon">Coming in ${c.comingSoon}</div>` : ''}
      </div>
    `).join('');
  },

  renderNotesDrawer() {
    const existing = document.getElementById('notesDrawerHost');
    if (existing) existing.remove();

    const notesHost = document.createElement('div');
    notesHost.id = 'notesDrawerHost';
    notesHost.innerHTML = `
      <button class="notes-fab" id="notesFab" aria-label="Open notes">${window.aceIcons.pencilLine(24)}</button>
      <div class="notes-drawer" id="notesDrawer">
        <div class="notes-drawer-header">
          <h3>Notes</h3>
          <div class="notes-status-wrap">
            <span class="notes-status" id="notesStatus"></span>
            <button class="notes-close" id="notesClose" aria-label="Close">${window.aceIcons.x(18)}</button>
          </div>
        </div>
        <div class="notes-drawer-body">
          <p class="muted" style="font-size:13px;margin:0 0 4px;">
            Quick notes for ${window.aceUtils.escapeHtml(this.state.student.first_name)}. Saves automatically.
          </p>
          <textarea
            id="notesTextarea"
            placeholder="Jot quick notes here…"
            class="notes-textarea"
          >${window.aceUtils.escapeHtml(this.state.student.notes || '')}</textarea>
        </div>
      </div>
      <div class="notes-overlay" id="notesOverlay"></div>
    `;
    document.body.appendChild(notesHost);

    document.getElementById('notesFab').addEventListener('click', () => this.openNotes());
    document.getElementById('notesClose').addEventListener('click', () => this.closeNotes());
    document.getElementById('notesOverlay').addEventListener('click', () => this.closeNotes());

    // Wire up debounced auto-save
    this.setupAutoSave();
  },

  // Debounced save state
  _saveTimer: null,
  _saveInFlight: false,
  _lastSavedValue: null,

  setupAutoSave() {
    const textarea = document.getElementById('notesTextarea');
    if (!textarea) return;

    this._lastSavedValue = textarea.value;

    textarea.addEventListener('input', () => {
      this.setNotesStatus('typing');
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.saveNotes(textarea.value), 1000);
    });

    // Also save immediately on drawer close if there's pending content
    textarea.addEventListener('blur', () => {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        this.saveNotes(textarea.value);
      }
    });
  },

  async saveNotes(value) {
    if (!this.state.studentId) return;
    if (value === this._lastSavedValue) {
      this.setNotesStatus('saved');
      return;
    }
    if (this._saveInFlight) return;

    this._saveInFlight = true;
    this.setNotesStatus('saving');

    const { error } = await window.aceSupabase
      .from('students')
      .update({ notes: value })
      .eq('id', this.state.studentId);

    this._saveInFlight = false;

    if (error) {
      console.error('Notes save error:', error);
      this.setNotesStatus('error');
      if (window.aceToast) window.aceToast.error('Could not save notes');
      return;
    }

    this._lastSavedValue = value;
    if (this.state.student) this.state.student.notes = value;
    this.setNotesStatus('saved');
  },

  setNotesStatus(state) {
    const el = document.getElementById('notesStatus');
    if (!el) return;
    if (state === 'typing') {
      el.textContent = '';
      el.className = 'notes-status';
    } else if (state === 'saving') {
      el.textContent = 'Saving…';
      el.className = 'notes-status notes-status-saving';
    } else if (state === 'saved') {
      el.textContent = 'Saved';
      el.className = 'notes-status notes-status-saved';
      setTimeout(() => {
        if (el.textContent === 'Saved') el.textContent = '';
      }, 2000);
    } else if (state === 'error') {
      el.textContent = 'Could not save';
      el.className = 'notes-status notes-status-error';
    }
  },

  openNotes() {
    document.getElementById('notesDrawer').classList.add('open');
    document.getElementById('notesOverlay').classList.add('open');
  },

  closeNotes() {
    document.getElementById('notesDrawer').classList.remove('open');
    document.getElementById('notesOverlay').classList.remove('open');
  },

  renderNotFound(message) {
    const main = document.querySelector('.ace-app-main .page-content');
    if (!main) return;
    main.innerHTML = `
      <div class="ace-card">
        <h2>Student Not Found</h2>
        <p class="muted">${window.aceUtils.escapeHtml(message)}</p>
        <a href="${this.basePath()}pages/caseload.html" class="btn-primary" style="display:inline-block;text-decoration:none;margin-top:12px;">Back to Caseload</a>
      </div>
    `;
  },

  basePath() {
    const path = window.location.pathname;
    if (path.includes('/ace-manager/')) return '/ace-manager/';
    return '/';
  }
};

window.aceProfile = aceProfile;
