// =============================================================
// Ace Manager — IEP Builder (lean, ported)
// =============================================================
// Single scrollable page, sticky TOC. Pulls student from profile.
// 3.8a: shell, TOC, context, DNA status, strengths/attendance/functional/goals
// =============================================================

const aceIepBuilder = {
  state: { student: null, ta1: null, tf1s: [], pf1: null },

  FUNC_DOMAINS: [
    { id: 'func-org',        label: 'Organization and planning',       group: 'Executive Functioning' },
    { id: 'func-init',       label: 'Task initiation',                 group: 'Executive Functioning' },
    { id: 'func-attn',       label: 'Attention and focus',             group: 'Executive Functioning' },
    { id: 'func-directions', label: 'Following multi-step directions', group: 'Executive Functioning' },
    { id: 'func-reg',        label: 'Emotional regulation',            group: 'Social-Emotional' },
    { id: 'func-social',     label: 'Social interaction',              group: 'Social-Emotional' },
    { id: 'func-work',       label: 'Independent work completion',     group: 'Social-Emotional' },
    { id: 'func-advocacy',   label: 'Self-advocacy',                   group: 'Social-Emotional' }
  ],

  FUNC_LEVELS: ['Significant Difficulty', 'Moderate Difficulty', 'Mild Difficulty', 'Age Appropriate'],
  FUNC_SETTINGS: ['Across all settings','Academic classes primarily','Unstructured time (lunch, passing periods, transitions)','Both structured and unstructured settings','Testing situations'],

  ACADEMIC_STRENGTHS: ['Verbal/oral participation','Visual learning','1:1 performance','Math computation','Memorization/recall','Hands-on/project-based tasks','Technology use','Reading comprehension','Creative writing','Science/lab work'],
  FUNCTIONAL_STRENGTHS: ['Peer relationships','Routine-following','Self-advocacy','Punctuality/attendance','Vocational/work skills','Independent task completion','Communication with adults','Artistic/creative expression','Athletic ability','Community involvement'],

  ATT_RATE: ['Satisfactory (fewer than 5% of days missed)','Mild concern (5–9% of days missed)','Chronic absenteeism (10–19% of days missed)','Severe chronic absenteeism (20%+ of days missed)'],
  ATT_PATTERN: ['No notable pattern','Primarily excused (illness/medical)','Primarily unexcused','Mixed excused and unexcused','Improving — was higher earlier in year'],
  ATT_IMPACT: ['Minimal impact','Moderate — gaps in instruction noted','Significant — major gaps affecting multiple areas','Severe — attendance is a primary barrier to progress'],

  GOAL_AREAS: [
    { id: 'goal-reading', label: 'Reading' },
    { id: 'goal-math', label: 'Math' },
    { id: 'goal-writing', label: 'Writing' },
    { id: 'goal-behavior', label: 'Behavior/Social-Emotional' },
    { id: 'goal-communication', label: 'Communication' },
    { id: 'goal-functional', label: 'Functional/Adaptive Skills' },
    { id: 'goal-transition', label: 'Transition' }
  ],
  GOAL_OPTIONS: ['N/A — No goal in this area','Goal met — mastered','Goal met — continuing to maintain','Adequate progress — goal will continue','Some progress — goal will be revised','Minimal progress — goal will be significantly revised','No progress — goal will be discontinued','Not yet introduced this period'],

  TOC_SECTIONS: [
    { id: 'sec-context', label: 'Student Context' },
    { id: 'sec-inputs', label: 'Inputs Received' },
    { id: 'sec-strengths', label: 'Strengths' },
    { id: 'sec-academic', label: 'Academic Performance' },
    { id: 'sec-attendance', label: 'Attendance' },
    { id: 'sec-functional', label: 'Functional Performance' },
    { id: 'sec-goals', label: 'Goal Progress' },
    { id: 'sec-disability', label: 'Disability Detail' },
    { id: 'sec-generate', label: 'Generate' }
  ],

  basePath() {
    return window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
  },

  async init() {
    const host = document.getElementById('iepBuilderHost');
    if (!host) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { host.innerHTML = '<div class="iep-empty">No student specified.</div>'; return; }

    const { data: student, error } = await window.aceSupabase.from('students').select('*').eq('id', id).single();
    if (error || !student) { host.innerHTML = '<div class="iep-empty">Could not load student.</div>'; return; }
    this.state.student = student;

    // Load DNAs (used by inputs status now; full pre-pop in 3.9)
    await this.loadDNAs(student.id);

    this.render(host);
  },

  async loadDNAs(studentId) {
    // Latest completed transition assessment
    const { data: ta } = await window.aceSupabase.from('transition_assessments')
      .select('payload,status').eq('student_id', studentId).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(1);
    this.state.ta1 = (ta && ta[0] && ta[0].payload && ta[0].payload.version) ? ta[0].payload : null;

    // Teacher feedback from the active link
    const { data: links } = await window.aceSupabase.from('feedback_links')
      .select('id').eq('student_id', studentId).eq('active', true).limit(1);
    if (links && links[0]) {
      const { data: tfs } = await window.aceSupabase.from('teacher_feedback')
        .select('payload,course_name,teacher_name').eq('link_id', links[0].id).eq('status', 'completed');
      this.state.tf1s = (tfs || []).map(t => t.payload).filter(p => p && p.version);
    } else {
      this.state.tf1s = [];
    }

    // Parent feedback (active completed)
    const { data: pf } = await window.aceSupabase.from('parent_feedback')
      .select('payload,status').eq('student_id', studentId).eq('active', true).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(1);
    this.state.pf1 = (pf && pf[0] && pf[0].payload && pf[0].payload.version) ? pf[0].payload : null;
  },

  render(host) {
    const s = this.state.student;
    const esc = window.aceUtils.escapeHtml;
    const bp = this.basePath();

    host.innerHTML = `
      <div class="iep-layout">
        <nav class="iep-toc">
          <a href="${bp}pages/student-profile.html?id=${s.id}" class="iep-toc-back">${window.aceIcons.arrowLeft(14)} Back to profile</a>
          <div class="iep-toc-title">IEP Present Levels</div>
          <ul class="iep-toc-list">
            ${this.TOC_SECTIONS.map(t => `<li><a href="#${t.id}" class="iep-toc-link" data-target="${t.id}">${esc(t.label)}</a></li>`).join('')}
          </ul>
        </nav>
        <div class="iep-main">
          <div class="iep-doc-header">
            <h1>${esc(s.first_name)} ${esc(s.last_initial)}. — Present Levels</h1>
            <p class="muted">Build the PLAAFP. Fields the system already knows are filled in for you. The narrative pulls from transition, teacher, and parent feedback automatically.</p>
          </div>

          ${this.contextSectionHTML()}
          ${this.inputsSectionHTML()}
          ${this.strengthsSectionHTML()}
          <section class="iep-section" id="sec-academic">
            <h2 class="iep-section-title">Academic Performance</h2>
            <div class="iep-placeholder muted">Built in the next update (3.8b).</div>
          </section>
          ${this.attendanceSectionHTML()}
          ${this.functionalSectionHTML()}
          ${this.goalsSectionHTML()}
          <section class="iep-section" id="sec-disability">
            <h2 class="iep-section-title">Disability Detail</h2>
            <div class="iep-placeholder muted">Built in the next update (3.8b).</div>
          </section>
          <section class="iep-section" id="sec-generate">
            <h2 class="iep-section-title">Generate</h2>
            <div class="iep-placeholder muted">The Generate button and output panel arrive in a later update.</div>
          </section>
        </div>
      </div>
    `;

    this.wireTOC(host);
    this.wireContextToggle(host);
    this.wireFuncCards(host);
  },

  contextSectionHTML() {
    const s = this.state.student;
    const esc = window.aceUtils.escapeHtml;
    const courses = (s.courses || []);
    return `
      <section class="iep-section" id="sec-context">
        <div class="iep-context-bar" id="iepContextToggle">
          <div class="iep-context-summary">
            <span class="iep-context-icon">${window.aceIcons.usersRound(16)}</span>
            <span><strong>${esc(s.first_name)} ${esc(s.last_initial)}.</strong> · ${esc(s.grade)} · ${esc(s.primary_disability)}${s.has_bip ? ' · BIP' : ''}</span>
          </div>
          <button class="iep-context-expand" type="button">${window.aceIcons.chevronRight(16)}</button>
        </div>
        <div class="iep-context-detail" id="iepContextDetail" style="display:none;">
          <dl class="iep-context-fields">
            <div><dt>Name</dt><dd>${esc(s.first_name)} ${esc(s.last_initial)}.</dd></div>
            <div><dt>Grade</dt><dd>${esc(s.grade)}</dd></div>
            <div><dt>Primary disability</dt><dd>${esc(s.primary_disability)}</dd></div>
            ${s.secondary_disability ? `<div><dt>Secondary</dt><dd>${esc(s.secondary_disability)}</dd></div>` : ''}
            <div><dt>BIP</dt><dd>${s.has_bip ? 'Yes' : 'No'}</dd></div>
            <div><dt>Classes</dt><dd>${courses.length ? courses.map(c => esc(c.name)).join(', ') : '<span class="muted">None added</span>'}</dd></div>
          </dl>
          <a href="${this.basePath()}pages/student-profile.html?id=${s.id}" class="iep-context-edit">Edit in profile →</a>
        </div>
      </section>
    `;
  },

  inputsSectionHTML() {
    const s = this.state.student;
    const bp = this.basePath();
    const academicCourses = (s.courses || []).filter(c => c.is_academic);
    const tfCount = this.state.tf1s.length;

    const chip = (ok, label, nudge) => `
      <div class="iep-input-chip ${ok ? 'ok' : 'missing'}">
        <span class="iep-input-icon">${ok ? window.aceIcons.check(14) : window.aceIcons.x(14)}</span>
        <span class="iep-input-label">${label}</span>
        ${!ok && nudge ? `<a href="${bp}pages/student-profile.html?id=${s.id}" class="iep-input-nudge">${nudge}</a>` : ''}
      </div>
    `;

    return `
      <section class="iep-section" id="sec-inputs">
        <h2 class="iep-section-title">Inputs Received</h2>
        <p class="iep-section-hint muted">These flow into the narrative automatically. Missing ones can be collected from the profile.</p>
        <div class="iep-inputs-grid">
          ${chip(!!this.state.ta1, this.state.ta1 ? 'Transition assessment received' : 'No transition assessment yet', 'Generate link')}
          ${chip(tfCount > 0, tfCount > 0 ? `Teacher feedback: ${tfCount} received${academicCourses.length ? ` of ${academicCourses.length} classes` : ''}` : 'No teacher feedback yet', 'Generate link')}
          ${chip(!!this.state.pf1, this.state.pf1 ? 'Parent feedback received' : 'No parent feedback yet', 'Generate link')}
        </div>
      </section>
    `;
  },

  checkGrid(name, options) {
    const esc = window.aceUtils.escapeHtml;
    return `<div class="iep-check-grid" data-group="${name}">
      ${options.map(o => `<label class="iep-check"><input type="checkbox" name="${name}" value="${esc(o)}" /><span>${esc(o)}</span></label>`).join('')}
    </div>`;
  },

  strengthsSectionHTML() {
    return `
      <section class="iep-section" id="sec-strengths">
        <h2 class="iep-section-title">Strengths</h2>
        <div class="iep-field">
          <label class="iep-label">Academic strengths</label>
          ${this.checkGrid('ac-strength', this.ACADEMIC_STRENGTHS)}
          <input type="text" id="str-ac-other" class="iep-text" placeholder="Any academic strengths not listed" />
        </div>
        <div class="iep-field">
          <label class="iep-label">Functional &amp; transitional strengths</label>
          ${this.checkGrid('fn-strength', this.FUNCTIONAL_STRENGTHS)}
          <input type="text" id="str-fn-other" class="iep-text" placeholder="Any functional strengths not listed" />
        </div>
      </section>
    `;
  },

  selectField(id, label, options) {
    const esc = window.aceUtils.escapeHtml;
    return `
      <div class="iep-field">
        <label class="iep-label">${esc(label)}</label>
        <select id="${id}" class="iep-select">
          <option value="">Select…</option>
          ${options.map(o => `<option>${esc(o)}</option>`).join('')}
        </select>
      </div>
    `;
  },

  attendanceSectionHTML() {
    return `
      <section class="iep-section" id="sec-attendance">
        <h2 class="iep-section-title">Attendance</h2>
        ${this.selectField('att-rate', 'Current absenteeism rate', this.ATT_RATE)}
        ${this.selectField('att-pattern', 'Absence pattern', this.ATT_PATTERN)}
        ${this.selectField('att-impact', 'Impact of attendance on performance', this.ATT_IMPACT)}
      </section>
    `;
  },

  functionalSectionHTML() {
    const esc = window.aceUtils.escapeHtml;
    const groups = {};
    this.FUNC_DOMAINS.forEach(d => { (groups[d.group] = groups[d.group] || []).push(d); });

    const domainHTML = (d) => `
      <div class="iep-func-domain" data-funcdomain="${d.id}">
        <div class="iep-func-label">${esc(d.label)}</div>
        <div class="iep-func-cards">
          ${this.FUNC_LEVELS.map(l => `<button type="button" class="iep-func-card" data-level="${esc(l)}">${esc(l)}</button>`).join('')}
        </div>
        <div class="iep-func-extra">
          <select id="${d.id}-setting" class="iep-select iep-select-sm">
            <option value="">Most evident in…</option>
            ${this.FUNC_SETTINGS.map(o => `<option>${esc(o)}</option>`).join('')}
          </select>
          <input type="text" id="${d.id}-obs" class="iep-text iep-text-sm" placeholder="Specific observation (optional)" />
        </div>
      </div>
    `;

    return `
      <section class="iep-section" id="sec-functional">
        <h2 class="iep-section-title">Functional Performance</h2>
        ${Object.keys(groups).map(g => `
          <div class="iep-func-group">
            <div class="iep-func-group-title">${esc(g)}</div>
            ${groups[g].map(domainHTML).join('')}
          </div>
        `).join('')}
      </section>
    `;
  },

  goalsSectionHTML() {
    const esc = window.aceUtils.escapeHtml;
    return `
      <section class="iep-section" id="sec-goals">
        <h2 class="iep-section-title">Progress on Current IEP Goals</h2>
        <div class="iep-goals-list">
          ${this.GOAL_AREAS.map(g => `
            <div class="iep-goal-row">
              <span class="iep-goal-label">${esc(g.label)}</span>
              <select id="${g.id}" class="iep-select">
                <option value="">Select…</option>
                ${this.GOAL_OPTIONS.map(o => `<option>${esc(o)}</option>`).join('')}
              </select>
            </div>
          `).join('')}
          <div class="iep-goal-row">
            <input type="text" id="goal-other-label" class="iep-text iep-goal-otherlabel" placeholder="Other goal area (optional)" />
            <select id="goal-other" class="iep-select">
              <option value="">Select…</option>
              ${this.GOAL_OPTIONS.map(o => `<option>${esc(o)}</option>`).join('')}
            </select>
          </div>
        </div>
      </section>
    `;
  },

  wireTOC(host) {
    host.querySelectorAll('.iep-toc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    // Scroll-spy: highlight active section
    const sections = this.TOC_SECTIONS.map(t => document.getElementById(t.id)).filter(Boolean);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          host.querySelectorAll('.iep-toc-link').forEach(l => l.classList.toggle('active', l.dataset.target === en.target.id));
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(sec => obs.observe(sec));
  },

  wireContextToggle(host) {
    const bar = host.querySelector('#iepContextToggle');
    const detail = host.querySelector('#iepContextDetail');
    if (bar && detail) {
      bar.addEventListener('click', () => {
        const open = detail.style.display !== 'none';
        detail.style.display = open ? 'none' : 'block';
        bar.classList.toggle('expanded', !open);
      });
    }
  },

  wireFuncCards(host) {
    host.querySelectorAll('.iep-func-domain').forEach(domain => {
      domain.querySelectorAll('.iep-func-card').forEach(card => {
        card.addEventListener('click', () => {
          domain.querySelectorAll('.iep-func-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });
    });
  }
};

window.aceIepBuilder = aceIepBuilder;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('iepBuilderHost')) {
    window.aceIepBuilder.init();
  }
});
