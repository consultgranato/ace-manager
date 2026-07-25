// =============================================================
// Ace Manager — Student Profile Dashboard
// =============================================================

const aceProfile = {

  state: {
    studentId: null,
    student: null,
    isAdmin: false
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
    this.state.isAdmin = await window.aceAuth.isOrgAdmin();
    this.renderHeader();
    this.renderCards();
    this.renderNotesDrawer();
    this.renderComplianceChip();
  },

  // Initial-eval (Indicator 11) chip appears under the header deadline chip
  // whenever the 60-school-day clock is running. Async and non-blocking.
  async renderComplianceChip() {
    if (!window.aceCompliance) return;
    const status = await window.aceCompliance.initialEvalStatus(this.state.student);
    if (!status) return;
    const anchor = document.querySelector('.profile-identity-main .profile-deadline');
    if (anchor) anchor.insertAdjacentHTML('afterend', window.aceCompliance.chipHTML(status));
  },

  renderHeader() {
    const host = document.getElementById('profileHeader');
    if (!host) return;
    const s = this.state.student;
    const nextDeadline = this.computeNextDeadline(s);
    const basePath = this.basePath();
    const esc = window.aceUtils.escapeHtml;

    host.innerHTML = `
      <a href="${basePath}pages/caseload.html" class="back-link">${window.aceIcons.arrowLeft(15)} Back to Caseload</a>

      <div class="profile-identity">
        <div class="profile-identity-row">
          <div class="profile-identity-main">
            <h1 class="profile-name">${esc(s.first_name)} ${esc(s.last_initial)}.</h1>
            <div class="profile-meta">
              <span>${esc(s.grade)}</span>
              <span class="dot-sep">·</span>
              <span>${esc(s.primary_disability)}</span>
              ${s.secondary_disability ? `<span class="dot-sep">·</span><span class="muted">${esc(s.secondary_disability)}</span>` : ''}
            </div>
            ${nextDeadline.html}
          </div>

          <div class="profile-identity-actions">
            <button class="btn-secondary profile-edit-btn" id="profileEditBtn">
              ${window.aceIcons.edit(14)} Edit
            </button>
            <div class="profile-menu-wrap">
              <button class="profile-menu-btn" id="profileMenuBtn" aria-label="More options"
                      aria-haspopup="true" aria-expanded="false" aria-controls="profileMenu">
                ${window.aceIcons.moreHorizontal(18)}
              </button>
              <div class="profile-menu" id="profileMenu" role="menu" style="display:none;">
                ${s.archived
                  ? `<button class="profile-menu-item" data-action="restore">${window.aceIcons.rotateCcw(14)} Restore Student</button>`
                  : `<button class="profile-menu-item profile-menu-danger" data-action="archive">${window.aceIcons.archive(14)} Archive Student</button>`
                }
                ${this.state.isAdmin ? `
                  <div class="profile-menu-sep"></div>
                  <button class="profile-menu-item profile-menu-danger" data-action="hard-delete">${window.aceIcons.x(14)} Permanently Delete…</button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachHeaderListeners();
  },

  attachHeaderListeners() {
    const editBtn = document.getElementById('profileEditBtn');
    if (editBtn) {
      editBtn.addEventListener('click', async () => {
        const result = await window.aceEditStudent.open(this.state.student);
        if (result && result.confirmed && result.result) {
          this.state.student = result.result;
          this.renderHeader();
        }
      });
    }

    const menuBtn = document.getElementById('profileMenuBtn');
    const menu = document.getElementById('profileMenu');
    if (menuBtn && menu) {
      const setMenu = (open) => {
        menu.style.display = open ? 'block' : 'none';
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenu(menu.style.display === 'none');
      });
      document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !menu.contains(e.target)) setMenu(false);
      });
      // Escape closes it and hands focus back to the trigger.
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.style.display === 'block') {
          setMenu(false);
          try { menuBtn.focus(); } catch (err) { /* non-fatal */ }
        }
      });

      menu.querySelectorAll('.profile-menu-item').forEach(item => {
        item.setAttribute('role', 'menuitem');
        item.addEventListener('click', async () => {
          setMenu(false);
          const action = item.dataset.action;
          if (action === 'archive') {
            await window.aceArchiveStudent.confirm(this.state.student);
          } else if (action === 'restore') {
            const ok = await window.aceArchiveStudent.restore(this.state.student);
            if (ok) {
              this.state.student.archived = false;
              this.renderHeader();
            }
          } else if (action === 'hard-delete') {
            await window.aceHardDeleteStudent.confirm(this.state.student);
          }
        });
      });
    }
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

    // Explicit "Due" labeling + the actual date so this reads unambiguously as a
    // due date, never a scheduled meeting time.
    const dateStr = window.aceUtils.formatLongDate(next.date);
    let when;
    if (next.days < 0) when = `overdue by ${Math.abs(next.days)} days`;
    else if (next.days === 0) when = 'due today';
    else when = `in ${next.days} days`;
    const label = `${next.label} Due: ${dateStr} · ${when}`;

    // Chip color from the Part 2 shared scale, so the same student reads the
    // same urgency color here and on the caseload / sidebar.
    const level = window.aceStatus ? window.aceStatus.urgencyLevel(next.days) : next.urgency;

    return {
      html: `<div class="profile-deadline urgency-${level}">${label}</div>`
    };
  },

  // The IEP card used to hard-code "Never started" no matter what, so a student
  // whose draft was generated last week still read as untouched. The generate
  // step stamps students.iep_draft_generated_at — report from it.
  iepCardStatus() {
    const stamp = this.state.student && this.state.student.iep_draft_generated_at;
    if (!stamp) return { text: 'Never started', dot: 'gray' };
    const when = window.aceUtils.formatShortDate(new Date(stamp));
    const days = window.aceUtils.daysUntil(window.aceUtils.dateToISO(new Date(stamp)));
    const age = days === 0 ? 'today' : days === -1 ? 'yesterday' : when;
    return { text: `Draft generated ${age}`, dot: 'green' };
  },

  renderCards() {
    const host = document.getElementById('profileCards');
    if (!host) return;

    const iep = this.iepCardStatus();
    const cards = [
      {
        id: 'iep',
        icon: window.aceIcons.fileText(18),
        title: 'IEP Builder',
        status: iep.text,
        statusDot: iep.dot,
        actionLabel: iep.dot === 'green' ? 'Open IEP Builder' : 'Start IEP draft',
        actionDisabled: false
      }
    ];

    // Render the standard cards
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
      </div>
    `).join('');

    // Wire IEP Builder card navigation
    const iepBtn = host.querySelector('[data-card="iep"] .card-action');
    if (iepBtn) {
      iepBtn.disabled = false;
      iepBtn.addEventListener('click', () => {
        const bp = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
        window.location.href = `${bp}pages/iep-builder.html?id=${this.state.student.id}`;
      });
    }

    // Append the Goals & Progress card — live, custom content
    const goalsCard = document.createElement('div');
    goalsCard.className = 'profile-card profile-card-goals';
    goalsCard.dataset.card = 'goals';
    goalsCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.barChart(18)}</div>
        <div class="card-title">Goals &amp; Progress</div>
      </div>
      <div id="goalsHost"><div class="muted" style="font-size:13px;">Loading…</div></div>
    `;
    host.appendChild(goalsCard);
    if (window.aceGoals) {
      window.aceGoals.render(document.getElementById('goalsHost'), this.state.student);
    }

    // Append the Meeting Info card — it has custom dynamic content
    const meetingCard = document.createElement('div');
    meetingCard.className = 'profile-card profile-card-meetings';
    meetingCard.dataset.card = 'meetings';
    meetingCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.calendar(18)}</div>
        <div class="card-title">Meeting Info</div>
      </div>
      <div id="meetingSectionHost">
        <div class="muted" style="font-size:13px;">Loading…</div>
      </div>
    `;
    host.appendChild(meetingCard);

    // Render live meeting content
    if (window.aceMeetings) {
      window.aceMeetings.renderMeetingSection(
        document.getElementById('meetingSectionHost'),
        this.state.student
      );
    }

    // Append the Teacher Feedback card — live, custom content
    const tfCard = document.createElement('div');
    tfCard.className = 'profile-card profile-card-teacher-feedback';
    tfCard.dataset.card = 'teacher-feedback';
    tfCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.graduationCap(18)}</div>
        <div class="card-title">Teacher Feedback</div>
      </div>
      <div id="teacherFeedbackHost">
        <div class="muted" style="font-size:13px;">Loading…</div>
      </div>
    `;
    host.appendChild(tfCard);

    if (window.aceTeacherFeedback) {
      window.aceTeacherFeedback.render(
        document.getElementById('teacherFeedbackHost'),
        this.state.student
      );
    }

    // Append the Parent Feedback card — live, custom content
    const pfCard = document.createElement('div');
    pfCard.className = 'profile-card profile-card-parent-feedback';
    pfCard.dataset.card = 'parent-feedback';
    pfCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.usersRound(18)}</div>
        <div class="card-title">Parent Feedback</div>
      </div>
      <div id="parentFeedbackHost">
        <div class="muted" style="font-size:13px;">Loading…</div>
      </div>
    `;
    host.appendChild(pfCard);

    if (window.aceParentFeedback) {
      window.aceParentFeedback.render(
        document.getElementById('parentFeedbackHost'),
        this.state.student
      );
    }

    // Append the Transition Assessment card — live, custom content
    const taCard = document.createElement('div');
    taCard.className = 'profile-card profile-card-transition';
    taCard.dataset.card = 'transition';
    taCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.compass(18)}</div>
        <div class="card-title">Transition Assessment</div>
      </div>
      <div id="transitionHost"><div class="muted" style="font-size:13px;">Loading…</div></div>
    `;
    host.appendChild(taCard);

    if (window.aceTransition) {
      window.aceTransition.render(document.getElementById('transitionHost'), this.state.student);
    }

    // Append the Transition Plan card (Phase 5.2) — gate-aware entry point
    const tpCard = document.createElement('div');
    tpCard.className = 'profile-card profile-card-transition-plan';
    tpCard.dataset.card = 'transition-plan';
    const tpEligible = window.aceTransitionPlan
      ? window.aceTransitionPlan.isEligible(this.state.student) : false;
    tpCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.compass(18)}</div>
        <div class="card-title">Transition Plan</div>
      </div>
      <div class="card-status-text">${tpEligible
        ? 'Postsecondary goals, services, courses of study & Indicator 13 checklist'
        : 'Not required yet — unlocks at age 14½'}</div>
      ${tpEligible ? '' : `<p class="muted" style="font-size:12.5px;line-height:1.5;margin:6px 0 0;">${
        window.aceUtils.escapeHtml(window.aceTransitionPlan
          ? window.aceTransitionPlan.gateExplanation(this.state.student) : '')}</p>`}
      <button class="card-action" ${tpEligible ? '' : 'disabled'}>Open Transition Plan</button>
    `;
    host.appendChild(tpCard);
    const tpBtn = tpCard.querySelector('.card-action');
    if (tpBtn && tpEligible) {
      tpBtn.addEventListener('click', () => {
        window.location.href = `${this.basePath()}pages/transition-plan.html?id=${this.state.student.id}`;
      });
    }

    // Append the Services & Minutes card — live, custom content
    const svcCard = document.createElement('div');
    svcCard.className = 'profile-card profile-card-services';
    svcCard.dataset.card = 'services';
    svcCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.settings(18)}</div>
        <div class="card-title">Related Services</div>
      </div>
      <div id="servicesHost"><div class="muted" style="font-size:13px;">Loading…</div></div>
    `;
    host.appendChild(svcCard);
    if (window.aceServices) {
      window.aceServices.render(document.getElementById('servicesHost'), this.state.student);
    }

    // Append the Documents card — generators for the recurring paperwork
    const docCard = document.createElement('div');
    docCard.className = 'profile-card profile-card-documents';
    docCard.dataset.card = 'documents';
    docCard.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${window.aceIcons.fileText(18)}</div>
        <div class="card-title">Documents</div>
      </div>
      <div id="documentsHost"><div class="muted" style="font-size:13px;">Loading…</div></div>
    `;
    host.appendChild(docCard);
    if (window.aceDocuments) {
      window.aceDocuments.render(document.getElementById('documentsHost'), this.state.student);
    }
  },

  renderNotesDrawer() {
    const existing = document.getElementById('notesDrawerHost');
    if (existing) existing.remove();

    const notesHost = document.createElement('div');
    notesHost.id = 'notesDrawerHost';
    notesHost.innerHTML = `
      <button class="notes-fab" id="notesFab" aria-label="Open notes">${window.aceIcons.pencilLine(16)}<span>Notes</span></button>
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

    // Escape closes the notes drawer, like every other panel in the app.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const drawer = document.getElementById('notesDrawer');
      if (drawer && drawer.classList.contains('open')) {
        e.preventDefault();
        this.closeNotes();
      }
    });

    // Wire up debounced auto-save
    this.setupAutoSave();
  },

  // Debounced save state. _pendingValue holds anything typed while a save is in
  // flight: the old code returned early and dropped it, so the last keystrokes
  // before a slow save silently never persisted.
  _saveTimer: null,
  _saveInFlight: false,
  _pendingValue: null,
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
    // A save is already running — remember the newest text and let that save
    // flush it when it lands, so nothing typed mid-request is lost.
    if (this._saveInFlight) {
      this._pendingValue = value;
      return;
    }

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
      // Keep the newest text queued so the next keystroke or blur retries it.
      return;
    }

    this._lastSavedValue = value;
    if (this.state.student) this.state.student.notes = value;

    if (this._pendingValue !== null && this._pendingValue !== value) {
      const next = this._pendingValue;
      this._pendingValue = null;
      return this.saveNotes(next);
    }
    this._pendingValue = null;
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
    const ta = document.getElementById('notesTextarea');
    if (ta) { try { ta.focus(); } catch (e) { /* non-fatal */ } }
  },

  closeNotes() {
    document.getElementById('notesDrawer').classList.remove('open');
    document.getElementById('notesOverlay').classList.remove('open');
    // Flush anything typed in the last second before the drawer goes away.
    const ta = document.getElementById('notesTextarea');
    if (ta && this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      this.saveNotes(ta.value);
    }
    const fab = document.getElementById('notesFab');
    if (fab) { try { fab.focus(); } catch (e) { /* non-fatal */ } }
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
