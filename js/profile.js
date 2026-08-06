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

    // One pass over the student's workflow state, shared by the stage rail and
    // the next-step callout. Without it each of those would re-ask questions the
    // individual cards already answer for themselves.
    this.state.status = await this.loadWorkflowStatus();

    // Status was just loaded — no need for the header's self-heal pass here.
    this.renderHeader({ skipStatusRefresh: true });
    this.renderSections();
    this.renderNotesDrawer();
    this.renderComplianceChip();
  },

  // -------------------------------------------------------------
  // Workflow status
  // -------------------------------------------------------------
  // The profile used to be nine cards of equal weight, which answered "what
  // features exist?" — never "what does this student need next?". Everything
  // below exists to answer the second question. It only ever *suggests*: the
  // next-step callout points at a step, it never performs one.
  async loadWorkflowStatus() {
    const sid = this.state.studentId;
    const s = this.state.student;
    const db = window.aceSupabase;

    const blank = {
      academicCourses: 0, meetingUpcoming: null, meetingHeld: 0,
      tfLink: null, tfResponses: 0, pfLink: null, pfComplete: false,
      taLatest: null, taComplete: false, goals: 0, probes: 0, ok: false
    };

    try {
      const [meetings, tfLinks, pfLinks, taRows, goals, probes] = await Promise.all([
        db.from('meetings').select('id, scheduled_date, completed, meeting_type')
          .eq('student_id', sid).order('scheduled_date', { ascending: true }),
        db.from('feedback_links').select('id, token').eq('student_id', sid)
          .eq('active', true).order('created_at', { ascending: false }).limit(1),
        db.from('parent_feedback').select('id, status').eq('student_id', sid)
          .eq('active', true).order('created_at', { ascending: false }).limit(1),
        db.from('transition_assessments').select('id, status, active').eq('student_id', sid)
          .order('created_at', { ascending: false }).limit(1),
        db.from('iep_goals').select('id').eq('student_id', sid),
        db.from('probes').select('id').eq('student_id', sid).limit(1)
      ]);

      const courses = Array.isArray(s.courses) ? s.courses : [];
      const mRows = meetings.data || [];
      const tfLink = (tfLinks.data && tfLinks.data[0]) || null;
      const pfLink = (pfLinks.data && pfLinks.data[0]) || null;
      const taLatest = (taRows.data && taRows.data[0]) || null;

      // Teacher responses hang off the active link, so this can only be asked
      // once we know there is one.
      let tfResponses = 0;
      if (tfLink) {
        const { data: tf } = await db.from('teacher_feedback')
          .select('id').eq('link_id', tfLink.id).eq('status', 'completed');
        tfResponses = (tf || []).length;
      }

      return {
        academicCourses: courses.filter(c => c && c.is_academic).length,
        meetingUpcoming: mRows.find(m => !m.completed) || null,
        meetingHeld: mRows.filter(m => m.completed).length,
        tfLink, tfResponses,
        pfLink, pfComplete: !!(pfLink && pfLink.status === 'completed'),
        taLatest, taComplete: !!(taLatest && taLatest.status === 'completed'),
        goals: (goals.data || []).length,
        probes: (probes.data || []).length,
        ok: true
      };
    } catch (e) {
      // A failed status read must never take the page down with it — the cards
      // below each load their own data and still work.
      console.error('Workflow status load failed:', e);
      return blank;
    }
  },

  // Five stages, in the order the work actually happens. Each is done /
  // started / not-started — never a percentage, because none of these are
  // partially true in a way a case manager would act on.
  stages() {
    const st = this.state.status || {};
    const s = this.state.student;
    const hasDates = !!(s.annual_review_date || s.reeval_due_date);
    const inputSent = !!(st.tfLink || st.pfLink || (st.taLatest && st.taLatest.active));
    const inputBack = (st.tfResponses > 0) || st.pfComplete || st.taComplete;

    return [
      { key: 'dates',   label: 'Dates',          state: hasDates ? 'done' : 'todo' },
      { key: 'courses', label: 'Courses',        state: st.academicCourses > 0 ? 'done' : 'todo' },
      { key: 'meeting', label: 'Meeting',        state: st.meetingUpcoming ? 'done' : (st.meetingHeld > 0 ? 'done' : 'todo') },
      { key: 'input',   label: 'Input',          state: inputBack ? 'done' : (inputSent ? 'started' : 'todo') },
      { key: 'levels',  label: 'Present levels', state: s.iep_draft_generated_at ? 'done' : 'todo' },
      { key: 'goals',   label: 'Goals',          state: st.goals > 0 ? 'done' : 'todo' }
    ];
  },

  // The single recommended next action. Ordered by the real workflow, so the
  // first unmet condition wins. `action` is a hint the callout wires to an
  // existing control — this never writes anything itself.
  nextStep() {
    const st = this.state.status || {};
    const s = this.state.student;
    const name = s.first_name;

    if (!s.annual_review_date && !s.reeval_due_date) {
      return { title: 'Add the review dates',
        body: `Nothing else on this page can tell you what's due until ${name} has an annual review or re-evaluation date on file.`,
        cta: 'Edit student', action: 'edit' };
    }
    if (st.academicCourses === 0) {
      return { title: 'Assign academic classes',
        body: 'Teacher feedback goes out per academic class, and present levels quote it by subject. Neither works until classes are on file.',
        cta: 'Edit student', action: 'edit' };
    }
    if (!st.meetingUpcoming) {
      return { title: 'Schedule the IEP meeting',
        body: 'Scheduling generates the prep checklist and computes the date the draft has to reach the family.',
        cta: 'Go to Meeting', action: 'scroll:meetings' };
    }
    if (!st.tfLink) {
      return { title: 'Send the teacher feedback link',
        body: `One link covers all ${st.academicCourses} of ${name}'s academic classes — send it to the whole team at once.`,
        cta: 'Go to Teacher Feedback', action: 'scroll:teacher-feedback' };
    }
    if (st.tfResponses === 0) {
      return { title: 'Waiting on teacher feedback',
        body: 'The link is out and no one has responded yet. A nudge with the link is usually all it takes.',
        cta: 'Copy the link again', action: 'scroll:teacher-feedback', tone: 'waiting' };
    }
    if (!s.iep_draft_generated_at) {
      return { title: 'Draft the present levels',
        body: `${st.tfResponses} teacher response${st.tfResponses === 1 ? '' : 's'} in. That's enough to generate a draft you can edit.`,
        cta: 'Open the builder', action: 'iep' };
    }
    if (st.goals === 0) {
      return { title: 'Write the goals',
        body: 'Present levels are drafted. Goals build straight from them, filtered to this student\'s profile.',
        cta: 'Go to Goals', action: 'scroll:goals' };
    }
    if (st.probes === 0) {
      return { title: 'Start progress monitoring',
        body: 'Goals are written. Probes run every two weeks and score themselves into the trend graphs.',
        cta: 'Go to Goals', action: 'scroll:goals' };
    }
    return { title: `${name} is ready for the meeting`,
      body: 'Dates, classes, input, present levels, goals and monitoring are all in place. Mark the meeting complete once it is held and the due dates roll forward.',
      cta: 'Go to Meeting', action: 'scroll:meetings', tone: 'clear' };
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

  renderHeader(opts) {
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

        ${this.stageRailHTML()}
      </div>

      ${this.nextStepHTML()}
    `;

    this.attachHeaderListeners();
    this.attachNextStepListener();

    // meetings.js calls renderHeader() on its own after marking a meeting
    // complete or editing a date. That also invalidates the stage rail and the
    // next step, so re-read the workflow state and repaint once it lands —
    // otherwise the header would show this student's state from before the
    // change and quietly recommend a step already taken.
    if (!opts || !opts.skipStatusRefresh) this.refreshStatus();
  },

  async refreshStatus() {
    if (this._statusRefreshing) return;
    this._statusRefreshing = true;
    try {
      // The student row is re-read too: marking a meeting complete advances the
      // due dates on it, which the deadline chip and the Dates stage both read.
      const { data } = await window.aceSupabase
        .from('students').select('*').eq('id', this.state.studentId).single();
      if (data) this.state.student = data;
      this.state.status = await this.loadWorkflowStatus();
    } catch (e) {
      console.error('Status refresh failed:', e);
    } finally {
      this._statusRefreshing = false;
    }
    this.renderHeader({ skipStatusRefresh: true });
    this.renderComplianceChip();
  },

  stageRailHTML() {
    if (!this.state.status || !this.state.status.ok) return '';
    const esc = window.aceUtils.escapeHtml;
    const done = this.stages().filter(x => x.state === 'done').length;
    const total = this.stages().length;
    return `
      <div class="stage-rail" role="list" aria-label="Workflow progress: ${done} of ${total} steps complete">
        ${this.stages().map(x => `
          <div class="stage-pill stage-${x.state}" role="listitem">
            <span class="stage-dot">${x.state === 'done' ? window.aceIcons.check(11) : ''}</span>
            <span class="stage-label">${esc(x.label)}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  nextStepHTML() {
    if (!this.state.status || !this.state.status.ok) return '';
    const esc = window.aceUtils.escapeHtml;
    const n = this.nextStep();
    this._nextStep = n;
    const tone = n.tone || 'action';
    return `
      <section class="next-step next-step-${tone}" aria-label="Suggested next step">
        <div class="next-step-body">
          <div class="next-step-eyebrow">${tone === 'clear' ? 'Up to date' : 'Next step'}</div>
          <h2 class="next-step-title">${esc(n.title)}</h2>
          <p class="next-step-text">${esc(n.body)}</p>
        </div>
        <button class="next-step-cta" id="nextStepCta">${esc(n.cta)} ${window.aceIcons.chevronRight(15)}</button>
      </section>
    `;
  },

  attachNextStepListener() {
    const btn = document.getElementById('nextStepCta');
    if (!btn || !this._nextStep) return;
    btn.addEventListener('click', async () => {
      const a = this._nextStep.action || '';
      if (a === 'edit') {
        const result = await window.aceEditStudent.open(this.state.student);
        if (result && result.confirmed && result.result) {
          this.state.student = result.result;
          this.state.status = await this.loadWorkflowStatus();
          this.renderHeader();
          this.renderSections();
        }
        return;
      }
      if (a === 'iep') {
        window.location.href = `${this.basePath()}pages/iep-builder.html?id=${this.state.student.id}`;
        return;
      }
      if (a.startsWith('scroll:')) {
        const card = document.querySelector(`[data-card="${a.slice(7)}"]`);
        if (card) {
          this.scrollToCard(card);
          // A brief highlight, so it's obvious which card the button meant.
          card.classList.add('card-flash');
          setTimeout(() => card.classList.remove('card-flash'), 1400);
        }
      }
    });
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

  // Centre a card in the viewport. Deliberately not scrollIntoView: smooth
  // scrolling is a silent no-op in some engines and embedded webviews (verified
  // here — `behavior:'auto'` moved, `behavior:'smooth'` did nothing at all).
  // A next-step button that appears to do nothing is worse than no button, so
  // if the page hasn't moved shortly after, jump there outright.
  scrollToCard(card) {
    const rect = card.getBoundingClientRect();
    const start = window.scrollY;
    const top = Math.max(0, start + rect.top - Math.max(0, (window.innerHeight - rect.height) / 2));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    if (reduce) return;
    setTimeout(() => {
      if (Math.abs(window.scrollY - start) < 2 && Math.abs(top - start) > 2) {
        window.scrollTo({ top, behavior: 'auto' });
      }
    }, 250);
  },

  // -------------------------------------------------------------
  // Sections
  // -------------------------------------------------------------
  // Three groups in workflow order instead of one flat grid of nine peers:
  // Prepare (collect what you need) → Write (produce the text) → Reference
  // (material you consult, not work you do). Reference starts collapsed so a
  // student with nothing on file doesn't open to a wall of empty cards.
  //
  // Every card still mounts the same module render(host, student) as before —
  // only the arrangement changed, not the contracts.
  renderSections() {
    const host = document.getElementById('profileCards');
    if (!host) return;
    const s = this.state.student;
    host.innerHTML = '';

    const prepare = [
      { id: 'meetings', icon: 'calendar', title: 'Meeting',
        mount: el => window.aceMeetings && window.aceMeetings.renderMeetingSection(el, s) },
      { id: 'teacher-feedback', icon: 'graduationCap', title: 'Teacher Feedback',
        mount: el => window.aceTeacherFeedback && window.aceTeacherFeedback.render(el, s) },
      { id: 'parent-feedback', icon: 'usersRound', title: 'Parent Feedback',
        mount: el => window.aceParentFeedback && window.aceParentFeedback.render(el, s) }
    ];
    // The student self-assessment is the intake side of transition planning and
    // is part of every student's file — transition planning is no longer gated.
    prepare.push({ id: 'transition', icon: 'compass', title: 'Student Transition Assessment',
      mount: el => window.aceTransition && window.aceTransition.render(el, s) });

    const iep = this.iepCardStatus();
    const write = [
      { id: 'iep', icon: 'fileText', title: 'Present Levels',
        html: `
          <div class="card-status-text">${window.aceUtils.escapeHtml(iep.text)}</div>
          <button class="card-action" data-nav="iep">${iep.dot === 'green' ? 'Open the builder' : 'Start the draft'}</button>` },
      { id: 'goals', icon: 'barChart', title: 'Goals &amp; Progress',
        mount: el => window.aceGoals && window.aceGoals.render(el, s) }
    ];
    write.push({ id: 'transition-plan', icon: 'compass', title: 'Transition Plan',
      html: `
        <div class="card-status-text">Postsecondary goals, services, courses of study &amp; the Indicator 13 checklist</div>
        <button class="card-action" data-nav="transition-plan">Open the plan</button>` });

    const reference = [
      { id: 'services', icon: 'settings', title: 'Related Services',
        mount: el => window.aceServices && window.aceServices.render(el, s) },
      { id: 'documents', icon: 'fileText', title: 'Documents',
        mount: el => window.aceDocuments && window.aceDocuments.render(el, s) }
    ];

    this.appendSection(host, 'Prepare', 'Collect what the meeting needs', prepare);
    this.appendSection(host, 'Write', 'Produce the text you paste into Embrace', write);

    this.appendSection(host, 'Reference', 'Consult as needed', reference, true);
  },

  appendSection(host, title, subtitle, cards, collapsed) {
    if (!cards.length) return;
    const esc = window.aceUtils.escapeHtml;
    const slug = title.toLowerCase();

    const wrap = document.createElement('section');
    wrap.className = 'profile-section';
    wrap.dataset.section = slug;
    wrap.innerHTML = `
      <div class="section-head">
        ${collapsed ? `
          <button class="section-toggle" id="sectionToggle-${slug}" aria-expanded="false" aria-controls="sectionGrid-${slug}">
            <span class="section-chevron">${window.aceIcons.chevronRight(15)}</span>
            <h2 class="section-title">${esc(title)}</h2>
            <span class="section-subtitle">${esc(subtitle)}</span>
          </button>`
        : `
          <h2 class="section-title">${esc(title)}</h2>
          <span class="section-subtitle">${esc(subtitle)}</span>`}
      </div>
      <div class="profile-card-grid" id="sectionGrid-${slug}"${collapsed ? ' hidden' : ''}></div>
    `;
    host.appendChild(wrap);

    const grid = wrap.querySelector(`#sectionGrid-${slug}`);
    cards.forEach(c => {
      const el = document.createElement('div');
      el.className = `profile-card profile-card-${c.id}`;
      el.dataset.card = c.id;
      el.innerHTML = `
        <div class="card-header">
          <div class="card-icon">${window.aceIcons[c.icon](18)}</div>
          <div class="card-title">${c.title}</div>
        </div>
        <div class="card-body" id="cardHost-${c.id}">${c.html || '<div class="muted" style="font-size:13px;">Loading…</div>'}</div>
      `;
      grid.appendChild(el);
      if (c.mount) c.mount(document.getElementById(`cardHost-${c.id}`));
    });

    // Static cards carry their navigation as a data-nav hint rather than each
    // one wiring its own listener.
    grid.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.nav === 'iep' ? 'iep-builder' : 'transition-plan';
        window.location.href = `${this.basePath()}pages/${page}.html?id=${this.state.student.id}`;
      });
    });

    if (collapsed) {
      const toggle = wrap.querySelector('.section-toggle');
      toggle.addEventListener('click', () => {
        const open = grid.hasAttribute('hidden');
        if (open) grid.removeAttribute('hidden'); else grid.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        wrap.classList.toggle('section-open', open);
      });
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
