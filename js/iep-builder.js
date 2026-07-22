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

  // Stored values keep the original long strings (the engine and any saved
  // drafts key on them); the chip labels are short so a rating is one glance,
  // one click.
  FUNC_LEVELS: [
    { value: 'Significant Difficulty', label: 'Significant' },
    { value: 'Moderate Difficulty',    label: 'Moderate' },
    { value: 'Mild Difficulty',        label: 'Mild' },
    { value: 'Age Appropriate',        label: 'Age appropriate' }
  ],
  FUNC_SETTINGS: [
    { value: 'Across all settings',                                       label: 'All settings' },
    { value: 'Academic classes primarily',                                label: 'Academic classes' },
    { value: 'Unstructured time (lunch, passing periods, transitions)',   label: 'Unstructured time' },
    { value: 'Both structured and unstructured settings',                 label: 'Structured & unstructured' },
    { value: 'Testing situations',                                        label: 'Testing' }
  ],

  // 5.1c — Quick-select observations per functional domain. Each is a gerund
  // phrase so the engine can weave any combination into one natural sentence
  // ("This most often looks like X, Y, and Z."). Free text still exists for
  // anything the chips don't cover, but a typical domain is now three clicks:
  // level, setting, observation.
  FUNC_OBS: {
    'func-org': [
      'arriving to class without needed materials',
      'losing track of assignments and due dates',
      'keeping a binder or backpack disorganized to the point of losing work',
      'struggling to break multi-day projects into steps',
      'forgetting to turn in completed work',
      'relying on adult reminders to use a planner or task list'
    ],
    'func-init': [
      'delaying the start of work well after directions are given',
      'waiting for individual prompting before beginning tasks',
      'starting tasks only after watching peers begin',
      'shutting down when a task feels difficult at the outset',
      'needing directions repeated one-on-one before starting',
      'starting quickly on preferred tasks but stalling on non-preferred ones'
    ],
    'func-attn': [
      'drifting off-task during independent work',
      'being drawn off-task by phones or peers',
      'losing the thread of multi-step instruction',
      'needing frequent redirection to return to the task at hand',
      'fatiguing quickly during sustained reading or writing',
      'missing key directions when they are given verbally'
    ],
    'func-directions': [
      'completing only the first step of multi-step directions',
      'needing directions rephrased or chunked one step at a time',
      'benefiting from written or visual directions alongside verbal ones',
      'asking peers what to do after whole-class directions',
      'mis-sequencing steps in longer tasks',
      'losing later steps when directions are given only once'
    ],
    'func-reg': [
      'becoming visibly frustrated when work is challenging',
      'needing time and space to de-escalate after a conflict',
      'shutting down rather than asking for help when overwhelmed',
      'reacting strongly to unexpected changes in routine',
      'leaving the classroom to regain composure',
      'recovering slowly from setbacks during class'
    ],
    'func-social': [
      'preferring to work alone rather than in groups',
      'misreading peers’ tone, humor, or social cues',
      'coming into conflict with peers during group work',
      'interacting comfortably with adults but less so with peers',
      'withdrawing during unstructured social time',
      'dominating conversations or struggling with turn-taking'
    ],
    'func-work': [
      'leaving classwork unfinished without adult check-ins',
      'completing work in class but not returning homework',
      'rushing through work at the cost of accuracy',
      'abandoning tasks when the first attempt fails',
      'producing strong work only with one-on-one support',
      'underestimating how long assignments will take'
    ],
    'func-advocacy': [
      'rarely asking for help even when clearly stuck',
      'not using accommodations unless a teacher initiates them',
      'having difficulty explaining what supports they need',
      'advocating with familiar adults but not in general education classes',
      'waiting until after class to ask questions',
      'accepting confusion rather than requesting clarification'
    ]
  },

  ACADEMIC_STRENGTHS: ['Verbal/oral participation','Visual learning','1:1 performance','Math computation','Memorization/recall','Hands-on/project-based tasks','Technology use','Reading comprehension','Creative writing','Science/lab work'],
  FUNCTIONAL_STRENGTHS: ['Peer relationships','Routine-following','Self-advocacy','Punctuality/attendance','Vocational/work skills','Independent task completion','Communication with adults','Artistic/creative expression','Athletic ability','Community involvement'],

  // Attendance is one pick, not three. The absenteeism band is the objective
  // fact; the instructional impact follows from it (see narrAttendance), so
  // asking a case manager to restate that impact in two more dropdowns bought
  // nothing. Bands follow the Illinois chronic-absenteeism definition (10%).
  ATT_LEVELS: [
    { value: 'Satisfactory (fewer than 5% of days missed)',        label: 'Satisfactory',        hint: '<5% missed' },
    { value: 'Mild concern (5–9% of days missed)',                 label: 'Mild concern',        hint: '5–9% missed' },
    { value: 'Chronic absenteeism (10–19% of days missed)',        label: 'Chronic',             hint: '10–19% missed' },
    { value: 'Severe chronic absenteeism (20%+ of days missed)',   label: 'Severe chronic',      hint: '20%+ missed' }
  ],

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
    { id: 'sec-disability', label: 'Student Information' },
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

    // Render the form HTML into the DOM first…
    this.render(host);

    // …then run identity prefill as the very last step of the resolved
    // async chain, guaranteeing the student object is loaded AND the form
    // fields exist in the DOM before we touch them (3.9.1).
    this.prefillIdentity(this.state.student);
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
          <div class="iep-toc-head">
            <div class="iep-toc-title">IEP Present Levels</div>
            <button type="button" class="iep-toc-collapse" id="iepTocCollapse" title="Hide section nav" aria-label="Hide section nav">${window.aceIcons.chevronLeft(16)}</button>
          </div>
          <ul class="iep-toc-list">
            ${this.TOC_SECTIONS.map(t => `<li><a href="#${t.id}" class="iep-toc-link" data-target="${t.id}">${esc(t.label)}</a></li>`).join('')}
          </ul>
        </nav>
        <div class="iep-main">
          <button type="button" class="iep-toc-reopen" id="iepTocReopen" title="Show sections" aria-label="Show sections">${window.aceIcons.menu(15)} Sections</button>
          <div class="iep-doc-header">
            <h1>${esc(s.first_name)} ${esc(s.last_initial)}. — Present Levels</h1>
            <p class="muted">Build the PLAAFP. Fields the system already knows are filled in for you. The narrative pulls from transition, teacher, and parent feedback automatically.</p>
          </div>

          ${this.contextSectionHTML()}
          ${this.inputsSectionHTML()}
          ${this.strengthsSectionHTML()}
          ${this.academicSectionHTML()}
          ${this.attendanceSectionHTML()}
          ${this.functionalSectionHTML()}
          ${this.goalsSectionHTML()}
          ${this.studentInfoSectionHTML()}
          ${this.generateSectionHTML()}
        </div>
      </div>
    `;

    this.wireTOC(host);
    this.wireContextToggle(host);
    this.wireFuncCards(host);
    this.wireStrengths(host);
    this.wireStudentInfo(host);
    this.wireAcademic(host);
    this.wireGenerate(host);
    // NOTE: identity prefill is intentionally NOT called here. It runs as
    // the final step of init() — after the student fetch has resolved and
    // this render has committed the form to the DOM (see 3.9.1).
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

  // ---- chip inputs --------------------------------------------
  // Both helpers render a native input wrapped in a label, so selection is
  // handled by the browser (click, keyboard, and screen readers all work with
  // no JS) and the value is read exactly the way the narrative engine already
  // reads checkboxes and radios. The chip is the <span>; the input is visually
  // hidden but still the thing that holds state.

  // Multi-select. `options` are plain strings or {id, value, label, tag}.
  chipChecks(name, options, extraClass = '') {
    const esc = window.aceUtils.escapeHtml;
    return `<div class="iep-chipgrid" data-chipgroup="${esc(name)}">
      ${options.map(o => {
        const value = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : (o.label || o.value);
        const id = (typeof o === 'object' && o.id) ? ` id="${esc(o.id)}"` : '';
        const hasTag = typeof o === 'object' && o.tag;
        const tag = hasTag ? ` <span class="iep-chip-tag">${esc(o.tag)}</span>` : '';
        return `<label class="iep-chip${hasTag ? ' iep-chip-suggested' : ''}"><input type="checkbox"${id} name="${esc(name)}" value="${esc(value)}" class="${esc(extraClass)}" /><span>${esc(label)}${tag}</span></label>`;
      }).join('')}
    </div>`;
  },

  // Single-select — radios, so picking a second option clears the first for
  // free. Read with `input[name="…"]:checked`, not getElementById.
  chipRadios(name, options) {
    const esc = window.aceUtils.escapeHtml;
    return `<div class="iep-chiprow" data-chipradio="${esc(name)}">
      ${options.map(o => {
        const value = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : (o.label || o.value);
        const hint = (typeof o === 'object' && o.hint) ? `<span class="iep-chip-hint">${esc(o.hint)}</span>` : '';
        return `<label class="iep-chip"><input type="radio" name="${esc(name)}" value="${esc(value)}" /><span>${esc(label)}${hint}</span></label>`;
      }).join('')}
    </div>`;
  },

  // A free-text box the case manager can use to add a strength that isn't on
  // the list. What they type becomes another selected chip in the same group,
  // so custom entries and preset ones reach the narrative through one array
  // instead of a parallel "other" field the engine had to special-case.
  customAddHTML(group, placeholder) {
    const esc = window.aceUtils.escapeHtml;
    return `<div class="iep-chip-add" data-addfor="${esc(group)}">
      <input type="text" class="iep-text iep-text-sm" placeholder="${esc(placeholder)}" autocomplete="off" />
      <button type="button" class="iep-chip-add-btn">Add</button>
    </div>`;
  },

  strengthsSectionHTML() {
    return `
      <section class="iep-section" id="sec-strengths">
        <h2 class="iep-section-title">Strengths</h2>
        ${this.strengthsParentNoteHTML()}
        <div class="iep-field">
          <label class="iep-label">Academic strengths</label>
          ${this.chipChecks('ac-strength', this.ACADEMIC_STRENGTHS)}
          ${this.customAddHTML('ac-strength', 'Add another academic strength')}
          ${this.strengthChipsHTML('ac-strength')}
        </div>
        <div class="iep-field">
          <label class="iep-label">Functional &amp; transitional strengths</label>
          ${this.chipChecks('fn-strength', this.FUNCTIONAL_STRENGTHS)}
          ${this.customAddHTML('fn-strength', 'Add another functional strength')}
          ${this.strengthChipsHTML('fn-strength')}
        </div>
      </section>
    `;
  },

  // 3.15 — Suggestion chips drawn from TA1 studentStrengths. Advisory only:
  // nothing is inserted unless the case manager clicks a chip (see
  // wireStrengths). Renders nothing when no TA1 / no strengths on file.
  strengthChipsHTML(group) {
    const ta = this.state.ta1;
    if (!ta || !Array.isArray(ta.studentStrengths) || !ta.studentStrengths.length) return '';
    const esc = window.aceUtils.escapeHtml;
    const chips = ta.studentStrengths.map(v => `
      <span class="iep-strength-chip">
        <button type="button" class="iep-strength-chip-add" data-group="${esc(group)}" data-value="${esc(v)}">+ ${esc(v)}</button>
        <button type="button" class="iep-strength-chip-x" title="Dismiss suggestion" aria-label="Dismiss suggestion">&times;</button>
      </span>`).join('');
    return `<div class="iep-strength-suggest">
      <span class="iep-strength-suggest-label">From student's transition assessment — click to add</span>
      <div class="iep-strength-chips">${chips}</div>
    </div>`;
  },

  // 3.15 — Read-only parent reference from PF1 whatsGoingWell. Surfaced as a
  // reference note only; never parsed into a field, never auto-filled.
  strengthsParentNoteHTML() {
    const pf = this.state.pf1;
    const text = pf && pf.whatsGoingWell ? String(pf.whatsGoingWell).trim() : '';
    if (!text) return '';
    const esc = window.aceUtils.escapeHtml;
    return `<div class="iep-strength-parent-note">
      <span class="iep-strength-parent-label">Parent noted (reference only):</span>
      <span class="iep-strength-parent-text">${esc(text)}</span>
    </div>`;
  },

  // Select a strength in `group` by value: check the matching preset chip when
  // there is one, otherwise mint a new selected chip for it. Either way the
  // value ends up in the group's checked set, which is the single thing the
  // narrative engine reads. De-duped case-insensitively. Returns false when
  // the value was already selected.
  selectStrength(section, group, value) {
    const v = (value || '').trim();
    if (!v) return false;

    const existing = Array.from(section.querySelectorAll(`input[name="${group}"]`));
    const match = existing.find(box => box.value.trim().toLowerCase() === v.toLowerCase());
    if (match) {
      if (match.checked) return false;
      match.checked = true;
      return true;
    }

    const grid = section.querySelector(`[data-chipgroup="${group}"]`);
    if (!grid) return false;
    const esc = window.aceUtils.escapeHtml;
    const label = document.createElement('label');
    label.className = 'iep-chip';
    label.innerHTML = `<input type="checkbox" name="${esc(group)}" value="${esc(v)}" checked /><span>${esc(v)}</span>`;
    grid.appendChild(label);
    return true;
  },

  // 3.15 — Wire the strength suggestion chips, plus the custom-add box. A
  // suggestion acts ONLY on an explicit click; the × dismisses it without
  // selecting anything. Both actions remove the chip; ignored chips stay
  // visible and inert.
  wireStrengths(host) {
    const section = host.querySelector('#sec-strengths');
    if (!section) return;

    section.querySelectorAll('.iep-strength-chip-add').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectStrength(section, btn.dataset.group, btn.dataset.value);
        const chip = btn.closest('.iep-strength-chip');
        if (chip) chip.remove();
      });
    });

    section.querySelectorAll('.iep-strength-chip-x').forEach(btn => {
      btn.addEventListener('click', () => {
        const chip = btn.closest('.iep-strength-chip');
        if (chip) chip.remove();
      });
    });

    section.querySelectorAll('.iep-chip-add').forEach(wrap => {
      const group = wrap.dataset.addfor;
      const input = wrap.querySelector('input');
      const commit = () => {
        if (this.selectStrength(section, group, input.value)) input.value = '';
        input.focus();
      };
      wrap.querySelector('.iep-chip-add-btn').addEventListener('click', commit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
      });
    });
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
        <div class="iep-field">
          <label class="iep-label">Absenteeism this year</label>
          ${this.chipRadios('att-level', this.ATT_LEVELS)}
        </div>
      </section>
    `;
  },

  // 5.1c — Speed-first redesign. Rating a domain is one click; picking a
  // difficulty reveals a detail row (setting + quick-select observations +
  // optional free text). "Age appropriate" needs nothing more and untouched
  // domains are simply skipped, so the section costs clicks only where the
  // student actually has needs.
  functionalSectionHTML() {
    const esc = window.aceUtils.escapeHtml;
    const groups = {};
    this.FUNC_DOMAINS.forEach(d => { (groups[d.group] = groups[d.group] || []).push(d); });

    const domainHTML = (d) => `
      <div class="iep-func-domain" data-funcdomain="${d.id}">
        <div class="iep-func-label">${esc(d.label)}</div>
        ${this.chipRadios(d.id + '-level', this.FUNC_LEVELS)}
        <div class="iep-func-detail" id="${d.id}-detail" style="display:none;">
          <div class="iep-func-detail-label">Most evident in</div>
          ${this.chipRadios(d.id + '-setting', this.FUNC_SETTINGS)}
          <div class="iep-func-detail-label">What it looks like <span class="goalb-hint">select any — these become the narrative</span></div>
          ${this.chipChecks(d.id + '-obs', this.FUNC_OBS[d.id] || [])}
          <input type="text" id="${d.id}-obsfree" class="iep-text iep-text-sm" placeholder="Add your own observation (optional)" />
        </div>
      </div>
    `;

    return `
      <section class="iep-section" id="sec-functional">
        <h2 class="iep-section-title">Functional Performance</h2>
        <p class="iep-section-hint muted">Rate only the areas you have something to say about — one click each. Picking a difficulty opens quick-select observations; skip any area that isn't relevant.</p>
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
        // On the narrow single-column layout the nav is an overlay — close it
        // after picking a section so it doesn't cover the content.
        if (window.innerWidth <= 900) {
          const layout = host.querySelector('.iep-layout');
          if (layout) layout.classList.add('toc-collapsed');
        }
      });
    });

    // Collapsible section nav (Part 3.17) — reclaim width for content.
    const layout = host.querySelector('.iep-layout');
    const collapseBtn = host.querySelector('#iepTocCollapse');
    const reopenBtn = host.querySelector('#iepTocReopen');
    if (collapseBtn && layout) {
      collapseBtn.addEventListener('click', () => layout.classList.add('toc-collapsed'));
    }
    if (reopenBtn && layout) {
      reopenBtn.addEventListener('click', () => layout.classList.remove('toc-collapsed'));
    }
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

  // The detail row appears only while a difficulty level is selected — "Age
  // appropriate" and unrated domains stay one line tall.
  wireFuncCards(host) {
    const DIFFICULT = ['Significant Difficulty', 'Moderate Difficulty', 'Mild Difficulty'];
    host.querySelectorAll('.iep-func-domain').forEach(domain => {
      const id = domain.dataset.funcdomain;
      const detail = domain.querySelector('#' + id + '-detail');
      const sync = () => {
        const sel = domain.querySelector(`input[name="${id}-level"]:checked`);
        if (detail) detail.style.display = (sel && DIFFICULT.includes(sel.value)) ? '' : 'none';
      };
      domain.querySelectorAll(`input[name="${id}-level"]`).forEach(r =>
        r.addEventListener('change', sync));
      sync();
    });
  },

  studentInfoSectionHTML() {
    const sldCheckboxes = (prefix) => `
      <div class="iep-check-grid">
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-decoding" value="Reading Decoding" /><span>Reading Decoding</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-fluency" value="Reading Fluency" /><span>Reading Fluency</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-comprehension" value="Reading Comprehension" /><span>Reading Comprehension</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-written" value="Written Expression" /><span>Written Expression</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-math-calc" value="Math Calculation" /><span>Math Calculation</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-math-ps" value="Math Problem Solving" /><span>Math Problem Solving</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-spelling" value="Spelling" /><span>Spelling</span></label>
        <label class="iep-check"><input type="checkbox" id="${prefix}sld-listening" value="Listening Comprehension" /><span>Listening Comprehension</span></label>
      </div>`;

    const sldPrograms = (prefix) => `
      <div id="${prefix}sld-program-row" class="iep-field" style="display:none;">
        <label class="iep-label">Current reading/intervention program</label>
        <select id="${prefix}sld-program" class="iep-select">
          <option value="">Select...</option>
          <option>Reading 01 — Literacy Foundations (RDYR01)</option>
          <option>Reading 02 — Intro to Literacy Comprehension (RDYR02)</option>
          <option>Reading 03 — Literacy Applications (RDYR03)</option>
          <option>Integrated Reading 3-4 (RDYR39)</option>
          <option>None</option>
        </select>
      </div>
      <div id="${prefix}sld-math-program-row" class="iep-field" style="display:none;">
        <label class="iep-label">Current math intervention or support program</label>
        <select id="${prefix}sld-math-program" class="iep-select">
          <option value="">Select...</option>
          <option>Math Extension — Algebra 1 (MAYA03-E)</option>
          <option>Math Extension — Geometry (MAYG03-E)</option>
          <option>Math Extension — Algebra 2 (MAYA11-E)</option>
          <option>Math Extension — General (MASM03)</option>
          <option>Ascend Math</option>
          <option>IXL Math</option>
          <option>None</option>
        </select>
      </div>`;

    const idFuncCheckboxes = (prefix) => `
      <label class="iep-check"><input type="checkbox" id="${prefix}id-func-reading" value="Functional reading (signs, labels, forms)" /><span>Functional reading (signs, labels, forms)</span></label>
      <label class="iep-check"><input type="checkbox" id="${prefix}id-func-math" value="Functional math (money, time, measurement)" /><span>Functional math (money, time, measurement)</span></label>
      <label class="iep-check"><input type="checkbox" id="${prefix}id-func-writing" value="Written communication for daily living" /><span>Written communication for daily living</span></label>
      <label class="iep-check"><input type="checkbox" id="${prefix}id-func-voc" value="Vocational/job-related skills" /><span>Vocational/job-related skills</span></label>
      <label class="iep-check"><input type="checkbox" id="${prefix}id-func-tech" value="Technology for independence" /><span>Technology for independence</span></label>`;

    const edBipRadios = (prefix) => `
      <div class="iep-field">
        <label class="iep-label">Behavior intervention plan in place?</label>
        <div class="iep-radio-row">
          <label class="iep-radio-opt"><input type="radio" name="${prefix}ed-bip" id="${prefix}ed-bip-yes" value="Yes" /><span>Yes</span></label>
          <label class="iep-radio-opt"><input type="radio" name="${prefix}ed-bip" id="${prefix}ed-bip-no" value="No" /><span>No</span></label>
        </div>
      </div>`;

    const mdAcc = (id, title, content) => `
      <div class="iep-md-acc-wrap">
        <button type="button" class="iep-md-acc-btn" data-target="${id}">
          <span>${title}</span><span class="iep-md-acc-arrow">▾</span>
        </button>
        <div id="${id}" class="iep-md-acc-content">${content}</div>
      </div>`;

    return `
      <section class="iep-section" id="sec-disability">
        <h2 class="iep-section-title">Student Information</h2>
        <p class="iep-section-hint muted">These fields drive the disability-specific narrative. Pre-population from profile arrives in the next update.</p>

        <div class="iep-field">
          <label class="iep-label">Student First Name</label>
          <input type="text" id="studentName" class="iep-text" placeholder="First name" />
        </div>
        <div class="iep-si-grid">
          <div class="iep-field">
            <label class="iep-label">Grade</label>
            <select id="grade" class="iep-select">
              <option value="">Select...</option>
              <option value="9">9 (Freshman)</option>
              <option value="10">10 (Sophomore)</option>
              <option value="11">11 (Junior)</option>
              <option value="12">12 (Senior)</option>
            </select>
          </div>
          <div class="iep-field">
            <label class="iep-label">Primary Disability Category</label>
            <select id="disability" class="iep-select">
              <option value="">Select primary eligibility...</option>
              <option value="Specific Learning Disability">Specific Learning Disability (SLD)</option>
              <option value="Autism">Autism Spectrum Disorder</option>
              <option value="Other Health Impairment">Other Health Impairment (OHI)</option>
              <option value="Intellectual Disability">Intellectual Disability</option>
              <option value="Emotional Disability">Emotional Disability (ED)</option>
              <option value="Speech or Language Impairment">Speech or Language Impairment</option>
              <option value="Multiple Disabilities">Multiple Disabilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="iep-field">
          <label class="iep-label">Secondary Disability Category</label>
          <select id="secondaryDisability" class="iep-select">
            <option value="None">None</option>
            <option value="Specific Learning Disability">Specific Learning Disability (SLD)</option>
            <option value="Autism">Autism Spectrum Disorder</option>
            <option value="Other Health Impairment">Other Health Impairment (OHI)</option>
            <option value="Intellectual Disability">Intellectual Disability</option>
            <option value="Emotional Disability">Emotional Disability (ED)</option>
            <option value="Speech or Language Impairment">Speech or Language Impairment</option>
            <option value="Multiple Disabilities">Multiple Disabilities</option>
            <option value="Other">Other</option>
          </select>
          <div id="secondaryNote" class="iep-secondary-note" style="display:none;">Note: Secondary eligibility noted. Primary disability drives form prompts.</div>
        </div>

        <!-- SLD Block -->
        <div id="block-sld" class="iep-disability-block">
          <div class="iep-disability-block-title">SLD — Specific Learning Disability</div>
          <div class="iep-field">
            <label class="iep-label">Primary area(s) of deficit</label>
            ${sldCheckboxes('')}
          </div>
          ${sldPrograms('')}
        </div>

        <!-- ASD Block -->
        <div id="block-asd" class="iep-disability-block">
          <div class="iep-disability-block-title">ASD — Autism Spectrum Disorder</div>
          ${this.selectField('asd-social', 'Social communication needs', ['No significant impact noted','Difficulty initiating peer interactions','Difficulty maintaining conversations','Challenges with nonverbal communication','Difficulty with group work or collaborative tasks','Significant support needed across all social contexts'])}
          ${this.selectField('asd-sensory', 'Sensory considerations', ['None noted','Mild — manageable with minor accommodations','Moderate — sensory breaks or environment modifications needed','Significant — sensory needs affect participation daily'])}
          ${this.selectField('asd-exec', 'Executive functioning notes', ['Age-appropriate','Mild challenges with planning or organization','Moderate challenges — requires prompting and scaffolding','Significant challenges across multiple executive skill areas'])}
          ${this.selectField('asd-behavior', 'Behavior/self-regulation notes', ['No behavioral concerns noted','Occasional dysregulation with quick recovery','Frequent dysregulation requiring adult support','Behavior intervention plan in place'])}
        </div>

        <!-- OHI Block -->
        <div id="block-ohi" class="iep-disability-block">
          <div class="iep-disability-block-title">OHI — Other Health Impairment</div>
          ${this.selectField('ohi-attention', 'Attention/focus impact on academics', ['Minimal impact — manageable with current accommodations','Moderate impact — affects task completion and pacing','Significant impact — requires frequent redirection and support','Severe impact — affects all academic areas daily'])}
          ${this.selectField('ohi-medical', 'Functional medical impact on school performance', ['No significant functional impact noted','Fatigue affects afternoon performance','Fatigue affects performance throughout the day','Medication timing affects focus windows','Frequent nurse visits or health-related absences','Multiple functional impacts present'])}
          ${this.selectField('ohi-attendance', 'Attendance pattern', ['Satisfactory','Inconsistent — some absences but not chronic','Improving — was chronic, showing progress','Chronic absenteeism (10% or more of school days)'])}
        </div>

        <!-- ID Block -->
        <div id="block-id" class="iep-disability-block">
          <div class="iep-disability-block-title">ID — Intellectual Disability</div>
          ${this.selectField('id-adaptive', 'Adaptive behavior notes', ['Age-appropriate in most areas with support','Needs support in daily living skills','Needs support in communication and social skills','Needs support across multiple adaptive domains'])}
          <div class="iep-field">
            <label class="iep-label">Functional academics focus areas</label>
            <div class="iep-check-grid">
              ${idFuncCheckboxes('')}
            </div>
          </div>
          ${this.selectField('id-support', 'Level of support needed', ['Minimal — periodic check-ins','Moderate — regular adult support during tasks','Extensive — near-constant support across settings'])}
        </div>

        <!-- ED Block -->
        <div id="block-ed" class="iep-disability-block">
          <div class="iep-disability-block-title">ED — Emotional Disability</div>
          ${this.selectField('ed-supports', 'Current therapeutic supports', ['None in place currently','School-based social worker/counselor only','Outside therapy (student/family reported)','Both school-based and outside supports','Intensive supports — multiple providers'])}
          ${edBipRadios('')}
          ${this.selectField('ed-sem', 'Social-emotional functioning notes', ['Generally appropriate with occasional difficulty','Difficulty managing frustration or disappointment','Difficulty with peer relationships across settings','Frequent emotional dysregulation affecting learning','Significant mental health needs affecting daily function'])}
        </div>

        <!-- SLI Block -->
        <div id="block-sli" class="iep-disability-block">
          <div class="iep-disability-block-title">SLI — Speech or Language Impairment</div>
          ${this.selectField('sli-receptive', 'Receptive language notes', ['Within functional limits','Mild difficulty understanding complex directions','Moderate difficulty — benefits from repetition and visual supports','Significant difficulty understanding spoken language'])}
          ${this.selectField('sli-expressive', 'Expressive language notes', ['Within functional limits','Mild difficulty organizing verbal responses','Moderate difficulty — limited sentence complexity or vocabulary','Significant difficulty with verbal expression'])}
          ${this.selectField('sli-impact', 'Impact on academic access', ['Minimal — accommodations sufficient','Moderate — affects participation and written output','Significant — affects access across multiple content areas'])}
        </div>

        <!-- Multiple Disabilities Block -->
        <div id="block-multiple" class="iep-disability-block">
          <div class="iep-disability-block-title">Multiple Disabilities</div>
          <p class="iep-section-hint muted">Expand only the sections relevant to this student's classification.</p>

          ${mdAcc('acc-sld', 'Specific Learning Disability (SLD)', `
            <div class="iep-field">
              <label class="iep-label">Primary area(s) of deficit</label>
              ${sldCheckboxes('md-')}
            </div>
            ${sldPrograms('md-')}
          `)}

          ${mdAcc('acc-asd', 'Autism Spectrum Disorder (ASD)', `
            ${this.selectField('md-asd-social', 'Social communication needs', ['No significant impact noted','Difficulty initiating peer interactions','Difficulty maintaining conversations','Challenges with nonverbal communication','Difficulty with group work or collaborative tasks','Significant support needed across all social contexts'])}
            ${this.selectField('md-asd-sensory', 'Sensory considerations', ['None noted','Mild — manageable with minor accommodations','Moderate — sensory breaks or environment modifications needed','Significant — sensory needs affect participation daily'])}
            ${this.selectField('md-asd-exec', 'Executive functioning notes', ['Age-appropriate','Mild challenges with planning or organization','Moderate challenges — requires prompting and scaffolding','Significant challenges across multiple executive skill areas'])}
            ${this.selectField('md-asd-behavior', 'Behavior/self-regulation notes', ['No behavioral concerns noted','Occasional dysregulation with quick recovery','Frequent dysregulation requiring adult support','Behavior intervention plan in place'])}
          `)}

          ${mdAcc('acc-ohi', 'Other Health Impairment (OHI)', `
            ${this.selectField('md-ohi-attention', 'Attention/focus impact on academics', ['Minimal impact — manageable with current accommodations','Moderate impact — affects task completion and pacing','Significant impact — requires frequent redirection and support','Severe impact — affects all academic areas daily'])}
            ${this.selectField('md-ohi-medical', 'Functional medical impact on school performance', ['No significant functional impact noted','Fatigue affects afternoon performance','Fatigue affects performance throughout the day','Medication timing affects focus windows','Frequent nurse visits or health-related absences','Multiple functional impacts present'])}
            ${this.selectField('md-ohi-attendance', 'Attendance pattern', ['Satisfactory','Inconsistent — some absences but not chronic','Improving — was chronic, showing progress','Chronic absenteeism (10% or more of school days)'])}
          `)}

          ${mdAcc('acc-id', 'Intellectual Disability (ID)', `
            ${this.selectField('md-id-adaptive', 'Adaptive behavior notes', ['Age-appropriate in most areas with support','Needs support in daily living skills','Needs support in communication and social skills','Needs support across multiple adaptive domains'])}
            <div class="iep-field">
              <label class="iep-label">Functional academics focus areas</label>
              <div class="iep-check-grid">
                ${idFuncCheckboxes('md-')}
              </div>
            </div>
            ${this.selectField('md-id-support', 'Level of support needed', ['Minimal — periodic check-ins','Moderate — regular adult support during tasks','Extensive — near-constant support across settings'])}
          `)}

          ${mdAcc('acc-ed', 'Emotional Disability (ED)', `
            ${this.selectField('md-ed-supports', 'Current therapeutic supports', ['None in place currently','School-based social worker/counselor only','Outside therapy (student/family reported)','Both school-based and outside supports','Intensive supports — multiple providers'])}
            ${edBipRadios('md-')}
            ${this.selectField('md-ed-sem', 'Social-emotional functioning notes', ['Generally appropriate with occasional difficulty','Difficulty managing frustration or disappointment','Difficulty with peer relationships across settings','Frequent emotional dysregulation affecting learning','Significant mental health needs affecting daily function'])}
          `)}

          ${mdAcc('acc-sli', 'Speech or Language Impairment (SLI)', `
            ${this.selectField('md-sli-receptive', 'Receptive language notes', ['Within functional limits','Mild difficulty understanding complex directions','Moderate difficulty — benefits from repetition and visual supports','Significant difficulty understanding spoken language'])}
            ${this.selectField('md-sli-expressive', 'Expressive language notes', ['Within functional limits','Mild difficulty organizing verbal responses','Moderate difficulty — limited sentence complexity or vocabulary','Significant difficulty with verbal expression'])}
            ${this.selectField('md-sli-impact', 'Impact on academic access', ['Minimal — accommodations sufficient','Moderate — affects participation and written output','Significant — affects access across multiple content areas'])}
          `)}
        </div>
      </section>`;
  },

  wireStudentInfo(host) {
    const DISABILITY_MAP = {
      'Specific Learning Disability': 'block-sld',
      'Autism': 'block-asd',
      'Other Health Impairment': 'block-ohi',
      'Intellectual Disability': 'block-id',
      'Emotional Disability': 'block-ed',
      'Speech or Language Impairment': 'block-sli',
      'Multiple Disabilities': 'block-multiple'
    };

    const disabilitySelect = host.querySelector('#disability');
    if (disabilitySelect) {
      disabilitySelect.addEventListener('change', () => {
        const val = disabilitySelect.value;
        host.querySelectorAll('.iep-disability-block').forEach(b => b.classList.remove('active'));
        if (val && DISABILITY_MAP[val]) {
          const block = host.querySelector('#' + DISABILITY_MAP[val]);
          if (block) block.classList.add('active');
        }
      });
    }

    const secSelect = host.querySelector('#secondaryDisability');
    if (secSelect) {
      secSelect.addEventListener('change', () => {
        const note = host.querySelector('#secondaryNote');
        if (note) note.style.display = (secSelect.value && secSelect.value !== 'None') ? 'block' : 'none';
      });
    }

    const updateSldPrograms = () => {
      const readIds = ['sld-decoding','sld-fluency','sld-comprehension','sld-written','sld-spelling'];
      const mathIds = ['sld-math-calc','sld-math-ps'];
      const readOn = readIds.some(id => { const el = host.querySelector('#' + id); return el && el.checked; });
      const mathOn = mathIds.some(id => { const el = host.querySelector('#' + id); return el && el.checked; });
      const pr = host.querySelector('#sld-program-row');
      if (pr) pr.style.display = readOn ? 'block' : 'none';
      const mr = host.querySelector('#sld-math-program-row');
      if (mr) mr.style.display = mathOn ? 'block' : 'none';
    };
    ['sld-decoding','sld-fluency','sld-comprehension','sld-written','sld-spelling','sld-math-calc','sld-math-ps'].forEach(id => {
      const el = host.querySelector('#' + id);
      if (el) el.addEventListener('change', updateSldPrograms);
    });

    const updateMdSldPrograms = () => {
      const readIds = ['md-sld-decoding','md-sld-fluency','md-sld-comprehension','md-sld-written','md-sld-spelling'];
      const mathIds = ['md-sld-math-calc','md-sld-math-ps'];
      const readOn = readIds.some(id => { const el = host.querySelector('#' + id); return el && el.checked; });
      const mathOn = mathIds.some(id => { const el = host.querySelector('#' + id); return el && el.checked; });
      const pr = host.querySelector('#md-sld-program-row');
      if (pr) pr.style.display = readOn ? 'block' : 'none';
      const mr = host.querySelector('#md-sld-math-program-row');
      if (mr) mr.style.display = mathOn ? 'block' : 'none';
    };
    ['md-sld-decoding','md-sld-fluency','md-sld-comprehension','md-sld-written','md-sld-spelling','md-sld-math-calc','md-sld-math-ps'].forEach(id => {
      const el = host.querySelector('#' + id);
      if (el) el.addEventListener('change', updateMdSldPrograms);
    });

    host.querySelectorAll('.iep-md-acc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const content = host.querySelector('#' + btn.dataset.target);
        if (content) {
          const open = content.classList.toggle('active');
          btn.classList.toggle('open', open);
        }
      });
    });
  },

  // -------------------------------------------------------------
  // 3.9 — Deterministic identity pre-population
  // Fills ONLY #studentName, #grade, #disability, #secondaryDisability
  // from the loaded profile, with tolerant value normalization and a
  // no-clobber guard. No DNA reads, no suggestions, no narrative.
  // -------------------------------------------------------------
  prefillIdentity(student) {
    // 3.9.1 diagnostic — confirms prefill fires and whether the student
    // object is present at call time. Quiet enough to leave in place.
    console.log('[prefill] running with', !!student, student && student.first_name);
    if (!student) return;

    // Set a <select> to the option matching `target` by value OR label
    // text (trimmed, case-insensitive). Only acts when the select is
    // currently on one of `unsetValues` (no-clobber). Warns on no match.
    const fillSelect = (id, target, unsetValues) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      if (!unsetValues.includes(sel.value)) return; // already set — never clobber
      const want = (target == null ? '' : String(target)).trim().toLowerCase();
      if (!want) return;
      let match = null;
      for (const opt of sel.options) {
        const v = (opt.value || '').trim().toLowerCase();
        const t = (opt.textContent || '').trim().toLowerCase();
        if (v === want || t === want) { match = opt; break; }
      }
      if (match) {
        sel.value = match.value;
      } else {
        console.warn(`[IEP prefill] No matching #${id} option for profile value:`, target);
      }
    };

    // Student first name (text) — fill only when empty
    const nameEl = document.getElementById('studentName');
    if (nameEl && nameEl.value.trim() === '' && student.first_name) {
      nameEl.value = student.first_name;
    }

    // Grade — profile stores e.g. "9 (Freshman)"; option value is "9".
    // Matching on label text bridges that; unset = placeholder "".
    fillSelect('grade', student.grade, ['']);

    // Primary disability — profile stores label form e.g.
    // "Specific Learning Disability (SLD)"; option value is the short
    // form. Match on label text; unset = placeholder "".
    fillSelect('disability', student.primary_disability, ['']);

    // Secondary disability — leave the "None" default if profile has
    // none. Unset = "None" (the default) or "".
    if (student.secondary_disability && String(student.secondary_disability).trim() !== '') {
      fillSelect('secondaryDisability', student.secondary_disability, ['None', '']);
    }

    console.log('[prefill] identity set');
  },

  academicSectionHTML() {
    const esc = window.aceUtils.escapeHtml;
    const student = this.state.student;
    const tf1s = this.state.tf1s || [];
    const courses = (student && student.courses) || [];

    // Build per-domain course and TF1 lookup
    const getDomain = (c) => window.COURSE_DOMAIN_MAP ? window.COURSE_DOMAIN_MAP.getDomain(c) : 'none';
    const DOMAINS = ['literacy', 'math', 'science', 'socialscience'];
    const domainCourses = {};
    const domainTf1s = {};
    DOMAINS.forEach(d => {
      domainCourses[d] = courses.filter(c => getDomain(c) === d);
      domainTf1s[d] = [];
      domainCourses[d].forEach(c => {
        tf1s.filter(p => p.courseName === c.name).forEach(p => domainTf1s[d].push(p));
      });
    });

    // Compute suggested common barrier IDs from TF1 signals
    const computeSuggestions = (domainKey) => {
      const suggested = new Set();
      domainTf1s[domainKey].forEach(p => {
        const lowEng  = ['Rarely engaged — frequently off-task', 'Sometimes engaged — inconsistent attention'];
        const lowPart = ['Rarely participates — needs significant prompting', 'Sometimes participates — inconsistent'];
        const lowInd  = ['Requires near-constant adult support', 'Requires frequent check-ins and prompting'];
        if (lowEng.includes(p.engagementLevel) || lowPart.includes(p.participationLevel)) {
          suggested.add('attention');
          suggested.add('behavior');
        }
        if (lowInd.includes(p.independenceLevel)) suggested.add('organization');
      });
      return suggested;
    };

    // Read-only teacher-feedback reference panel
    const SETTING_LABELS = { gen_ed: 'Gen Ed', co_taught: 'Co-Taught', sped_resource: 'SpEd/Resource' };
    const refPanelHTML = (domainKey) => {
      if (!domainCourses[domainKey].length) return '';
      const pairs = domainTf1s[domainKey];
      if (!pairs.length) {
        return `<div class="iep-acad-tf-panel"><p class="iep-acad-tf-empty muted">No teacher feedback submitted yet for these courses.</p></div>`;
      }
      return `<div class="iep-acad-tf-panel">${pairs.map(p => {
        const setting = SETTING_LABELS[p.settingType] || (p.settingType || '');
        const dataRows = [
          ['Performance',       p.overallPerformance],
          ['Participation',     p.participationLevel],
          ['Engagement',        p.engagementLevel],
          ['Independence',      p.independenceLevel],
          ['Peer interactions', p.peerInteractions],
        ].filter(([, v]) => v);
        const strategies = Array.isArray(p.effectiveStrategies) && p.effectiveStrategies.length
          ? p.effectiveStrategies.join(', ') : '';
        return `<div class="iep-acad-tf-row">
          <div class="iep-acad-tf-row-header">
            <span class="iep-acad-tf-course">${esc(p.courseName || '')}</span>
            ${p.teacherName ? `<span class="iep-acad-tf-teacher">${esc(p.teacherName)}</span>` : ''}
            ${setting ? `<span class="iep-acad-tf-setting">${esc(setting)}</span>` : ''}
          </div>
          <div class="iep-acad-tf-fields">
            ${dataRows.map(([k, v]) => `<div class="iep-acad-tf-pair"><span class="iep-acad-tf-key">${esc(k)}</span><span class="iep-acad-tf-val">${esc(v)}</span></div>`).join('')}
            ${strategies ? `<div class="iep-acad-tf-pair"><span class="iep-acad-tf-key">Supports that help</span><span class="iep-acad-tf-val">${esc(strategies)}</span></div>` : ''}
          </div>
        </div>`;
      }).join('')}</div>`;
    };

    const perfOptions = [
      'Significantly Below Grade Level',
      'Below Grade Level',
      'Approaching Grade Level',
      'At Grade Level',
      'Above Grade Level'
    ];
    const commonBarriers = [
      { id: 'attention',    label: 'Attention',           value: 'Attention' },
      { id: 'speed',        label: 'Processing Speed',    value: 'Processing Speed' },
      { id: 'organization', label: 'Organization',        value: 'Organization' },
      { id: 'behavior',     label: 'Behavior',            value: 'Behavior' },
      { id: 'attendance',   label: 'Attendance',          value: 'Attendance' },
      { id: 'language',     label: 'Language Processing', value: 'Language Processing' }
    ];
    const subjects = [
      {
        key: 'literacy', label: 'Literacy',
        specific: [
          { id: 'decoding',      label: 'Decoding',              value: 'Decoding' },
          { id: 'fluency',       label: 'Reading Fluency',       value: 'Reading Fluency' },
          { id: 'comprehension', label: 'Reading Comprehension', value: 'Reading Comprehension' },
          { id: 'written',       label: 'Written Expression',    value: 'Written Expression' },
          { id: 'spelling',      label: 'Spelling',              value: 'Spelling' },
          { id: 'vocab',         label: 'Vocabulary',            value: 'Vocabulary' }
        ]
      },
      {
        key: 'math', label: 'Math',
        specific: [
          { id: 'calculation',    label: 'Calculation',                   value: 'Calculation' },
          { id: 'problemsolving', label: 'Problem Solving / Application', value: 'Problem Solving / Application' },
          { id: 'numbersense',    label: 'Number Sense',                  value: 'Number Sense' },
          { id: 'factfluency',    label: 'Fact Fluency',                  value: 'Fact Fluency' },
          { id: 'multistep',      label: 'Multi-Step Reasoning',          value: 'Multi-Step Reasoning' }
        ]
      },
      {
        key: 'science', label: 'Science',
        specific: [
          { id: 'vocab',   label: 'Scientific Vocabulary',      value: 'Scientific Vocabulary' },
          { id: 'lab',     label: 'Lab / Hands-on Application', value: 'Lab / Hands-on Application' },
          { id: 'reading', label: 'Reading Scientific Text',    value: 'Reading Scientific Text' },
          { id: 'data',    label: 'Data Interpretation',        value: 'Data Interpretation' }
        ]
      },
      {
        key: 'socialscience', label: 'Social Science',
        specific: [
          { id: 'reading',   label: 'Reading Comprehension of Complex Text', value: 'Reading Comprehension of Complex Text' },
          { id: 'writing',   label: 'Writing Extended Responses',            value: 'Writing Extended Responses' },
          { id: 'reasoning', label: 'Historical Reasoning',                  value: 'Historical Reasoning' },
          { id: 'vocab',     label: 'Vocabulary / Terminology',              value: 'Vocabulary / Terminology' }
        ]
      }
    ];

    // One barrier list per subject. Common and subject-specific barriers were
    // two separate grids, but the engine never distinguished them — a barrier
    // is a barrier, and only the id suffix (attention/organization/behavior)
    // carries the cross-cutting meaning. Merging them halves the fields
    // without changing a single thing the narrative reads.
    const barrierChips = (key, items, suggested) => this.chipChecks(
      'bar-' + key,
      items.map(b => ({
        id: `bar-${key}-${b.id}`,
        value: b.value,
        label: b.label,
        tag: suggested.has(b.id) ? 'suggested' : ''
      })),
      'acad-barrier'
    );

    const subjectBlock = (s) => {
      const suggestions = computeSuggestions(s.key);
      return `<div class="iep-acad-block" data-acadblock="${esc(s.key)}">
        <div class="iep-acad-block-title">${esc(s.label)}</div>
        <div class="iep-field">
          <label class="iep-label">Performance level</label>
          ${this.chipRadios('acad-perf-' + s.key, perfOptions)}
        </div>
        ${refPanelHTML(s.key)}
        <div class="iep-field iep-acad-barriers">
          <label class="iep-label">Barriers</label>
          ${barrierChips(s.key, commonBarriers.concat(s.specific), suggestions)}
        </div>
      </div>`;
    };

    return `
      <section class="iep-section" id="sec-academic">
        <h2 class="iep-section-title">Academic Performance</h2>
        <p class="iep-section-hint muted">Pick a performance level for each subject that applies — barriers appear once you do. Skip any subject you have nothing to record for.</p>
        ${subjects.map(subjectBlock).join('')}
        <div class="iep-field">
          <label class="iep-label">Evaluation results <span class="goalb-hint">optional</span></label>
          <textarea id="eval-results" rows="3" class="iep-text iep-textarea" placeholder="Recent evaluation findings — psych, speech, OT. Include the report date if you have it."></textarea>
          <p class="iep-section-hint muted" style="margin-top:5px;">Written into the academic narrative as-is, so phrase it the way you want it to read.</p>
        </div>
      </section>`;
  },

  // Barriers stay out of the way until the subject is actually in play — a
  // performance level is what says "this subject matters for this student".
  wireAcademic(host) {
    host.querySelectorAll('[data-acadblock]').forEach(block => {
      const sync = () => {
        const picked = !!block.querySelector('input[type="radio"]:checked');
        block.classList.toggle('acad-active', picked);
      };
      block.querySelectorAll('input[type="radio"]').forEach(r =>
        r.addEventListener('change', sync));
      sync();
    });
  },

  // =============================================================
  // 3.10a — PLAAFP Narrative Engine
  // Reads form fields + DNAs (TF1/PF1) and assembles editable PLAAFP
  // prose into #sec-generate. The engine only READS fields — it never
  // writes back into them. Academic claims come from the AP fields;
  // TF1 is attributed supporting evidence only. A shared concept tracker
  // ensures attention/organization/behavior are each stated once.
  // Compliance layer (adverse-impact, IL standards, transition, missing-
  // input flags) is 3.10b — see clearly-marked insertion points below.
  // =============================================================

  // 3.11a — five Embrace-aligned output sections (in render order) + a separate
  // non-copyable Compliance Notes area. Each section maps to a buildSegments()
  // destination and has its own Copy button.
  OUTPUT_SECTIONS: [
    { dest: 'academic',   label: 'Academic',   rows: 8, placeholder: 'Academic present levels — snapshot, domain levels, barriers, teacher evidence, and Illinois Learning Standards framing.' },
    { dest: 'strengths',  label: 'Strengths',  rows: 3, placeholder: 'Student strengths.' },
    { dest: 'functional', label: 'Functional', rows: 8, placeholder: 'Functional performance, behavior intervention plan, disability-specific impact, and transition present levels.' },
    { dest: 'parent',     label: 'Parent',     rows: 4, placeholder: 'Parent / family input.' },
    { dest: 'impact',     label: 'Impact',     rows: 4, placeholder: 'Adverse-impact statements (how the disability affects involvement and progress in the general education curriculum).' }
  ],

  generateSectionHTML() {
    const esc = window.aceUtils.escapeHtml;
    const blocks = this.OUTPUT_SECTIONS.map(sct => `
      <div class="iep-output-block" data-dest="${sct.dest}">
        <div class="iep-output-head">
          <label class="iep-label" for="iepOut-${sct.dest}">${esc(sct.label)}</label>
          <button type="button" class="iep-output-copy btn-secondary" data-dest="${sct.dest}" data-label="${esc(sct.label)}" style="display:none;">Copy</button>
        </div>
        <textarea id="iepOut-${sct.dest}" class="iep-text iep-textarea iep-output-area" rows="${sct.rows}" placeholder="${esc(sct.placeholder)}"></textarea>
      </div>`).join('');

    return `
      <section class="iep-section" id="sec-generate">
        <h2 class="iep-section-title">Generate</h2>
        <p class="iep-section-hint muted">Generates a professional Present Levels narrative split into Embrace-aligned sections from the fields above plus the teacher, parent, and transition input already received. Edit any section, then copy it into the matching Embrace field.</p>
        <div class="iep-generate-actions">
          <button type="button" id="iepGenerateBtn" class="btn-primary">Generate Present Levels</button>
        </div>
        <div class="iep-output-sections">
          ${blocks}
        </div>
        <div class="iep-output-compliance" id="iepComplianceWrap" style="display:none;">
          <div class="iep-output-compliance-head">Compliance Notes <span class="muted">— guidance for the case manager; not copied, remove before finalizing</span></div>
          <div class="iep-output-compliance-body" id="iepComplianceBody" style="white-space:pre-wrap;"></div>
        </div>
      </section>`;
  },

  wireGenerate(host) {
    const btn = host.querySelector('#iepGenerateBtn');
    if (!btn) return;
    const DESTS = this.OUTPUT_SECTIONS.map(s => s.dest);
    const areaFor = dest => host.querySelector('#iepOut-' + dest);
    // Per-destination snapshot of the last generated text, for no-clobber.
    this._lastGenerated = this._lastGenerated || {};

    btn.addEventListener('click', () => {
      // No-clobber: if any section diverges from what was last generated
      // (i.e. the case manager has hand-edited it), confirm before replacing.
      const edited = DESTS.some(dest => {
        const el = areaFor(dest);
        if (!el) return false;
        const cur = el.value.trim();
        return cur && cur !== ((this._lastGenerated[dest] || '').trim());
      });
      if (edited) {
        const ok = window.confirm('Regenerating will replace the current draft in all sections, including any edits you have made. Continue?');
        if (!ok) return;
      }

      const seg = this.buildSegments();
      DESTS.forEach(dest => {
        const el = areaFor(dest);
        if (!el) return;
        const text = (seg[dest] || []).join('\n\n');
        el.value = text;
        this._lastGenerated[dest] = text;
      });

      // Reveal copy buttons now that there is content to copy.
      host.querySelectorAll('.iep-output-copy').forEach(b => { b.style.display = ''; });

      // Compliance Notes — display-only, never a copy target.
      const wrap = host.querySelector('#iepComplianceWrap');
      const body = host.querySelector('#iepComplianceBody');
      if (wrap && body) {
        const compText = (seg.compliance || []).join('\n\n');
        if (compText.trim()) { body.textContent = compText; wrap.style.display = ''; }
        else { body.textContent = ''; wrap.style.display = 'none'; }
      }

      // 3.11c — stamp the durable students.iep_draft_generated_at marker.
      // Re-derived by aceMeetings.computeAutoConditions so prep item #4
      // ("Generate IEP draft from latest data") auto-checks through the same
      // applyAutoChecks path as the teacher/parent/transition items — keeping
      // every surface consistent via fullState. Fire-and-forget; never blocks UI.
      const sid = this.state.student && this.state.student.id;
      if (sid && window.aceMeetings && window.aceMeetings.markDraftGenerated) {
        window.aceMeetings.markDraftGenerated(sid);
      }
    });

    // Per-section copy — copies that section's CURRENT (possibly edited) value.
    host.querySelectorAll('.iep-output-copy').forEach(b => {
      b.addEventListener('click', async () => {
        const el = areaFor(b.dataset.dest);
        if (!el) return;
        const label = b.dataset.label || this._upperFirst(b.dataset.dest || '');
        try {
          await navigator.clipboard.writeText(el.value);
        } catch (e) {
          el.select();
          try { document.execCommand('copy'); } catch (_) {}
        }
        if (window.aceToast) window.aceToast.success(label + ' copied');
      });
    });
  },

  // ---- prose helpers -----------------------------------------
  _naturalList(arr) {
    const a = (arr || []).filter(Boolean);
    if (a.length === 0) return '';
    if (a.length === 1) return a[0];
    if (a.length === 2) return a[0] + ' and ' + a[1];
    return a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
  },
  _gradeOrdinal(g) {
    return ({ '9': '9th', '10': '10th', '11': '11th', '12': '12th' }[g]) || (g ? g + 'th' : '');
  },
  _lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; },
  _upperFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; },
  _softQuote(t) { return '“' + String(t).trim().replace(/\.+$/, '') + '”'; },

  // 3.10b.1 — Normalize first-person pronouns in TA1 option/free-text strings
  // to third person when woven into the third-person narrative (the student's
  // pronouns are rendered as they/their/them elsewhere in the engine).
  // Run BEFORE lowercasing so the standalone "I" boundary still matches.
  _thirdPerson(s) {
    if (!s) return s;
    return String(s)
      .replace(/\bmyself\b/gi, 'themselves')
      .replace(/\bmine\b/gi, 'theirs')
      .replace(/\bmy\b/gi, 'their')
      .replace(/\bI'm\b/g, "they're")
      .replace(/\bI\b/g, 'they')
      .replace(/\bme\b/gi, 'them');
  },

  // Behavioral concepts a single TF1 corroborates (de-dup keys)
  _tf1Concepts(tf) {
    const LOW_ENG  = ['Rarely engaged — frequently off-task', 'Sometimes engaged — inconsistent attention'];
    const LOW_PART = ['Rarely participates — needs significant prompting', 'Sometimes participates — inconsistent'];
    const LOW_IND  = ['Requires near-constant adult support', 'Requires frequent check-ins and prompting'];
    const NEG_PEER = ['Significant difficulty with peer interactions', 'Some difficulty — inconsistent peer interactions'];
    const set = new Set();
    if (LOW_ENG.includes(tf.engagementLevel) || LOW_PART.includes(tf.participationLevel)) set.add('attention');
    if (LOW_IND.includes(tf.independenceLevel)) set.add('organization');
    if (LOW_ENG.includes(tf.engagementLevel) || NEG_PEER.includes(tf.peerInteractions)) set.add('behavior');
    return set;
  },
  _conceptPhrase(c) {
    return ({
      attention: 'inconsistent attention and engagement',
      organization: 'a need for frequent adult support to stay organized',
      behavior: 'behavioral and peer-interaction challenges'
    })[c] || c;
  },
  _conceptNoun(c) {
    return ({
      attention: 'attention-related barriers',
      organization: 'organizational barriers',
      behavior: 'behavioral barriers'
    })[c] || c;
  },

  // ---- data collection (READ ONLY) ----------------------------
  collectNarrativeData() {
    const g = id => document.getElementById(id);
    const gv = id => (g(id) || {}).value || '';
    const checkVals = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
    // Chip rows are radio groups, so the selected value comes off the group,
    // not off an element id the way a <select> did.
    const radioVal = name => (document.querySelector(`input[name="${name}"]:checked`) || {}).value || '';

    const ACAD = [
      { key: 'literacy', label: 'Literacy' },
      { key: 'math', label: 'Math' },
      { key: 'science', label: 'Science' },
      { key: 'socialscience', label: 'Social Science' }
    ];
    const academicSubjects = ACAD.map(s => {
      const prefix = 'bar-' + s.key + '-';
      const barriers = Array.from(document.querySelectorAll('input.acad-barrier'))
        .filter(cb => cb.checked && cb.id.startsWith(prefix))
        .map(cb => ({ concept: cb.id.slice(prefix.length), value: cb.value }));
      return { key: s.key, label: s.label, level: radioVal('acad-perf-' + s.key), barriers };
    });

    const functionalDomains = this.FUNC_DOMAINS.map(d => ({
      id: d.id, label: d.label, group: d.group,
      level: radioVal(d.id + '-level'),
      setting: radioVal(d.id + '-setting'),
      obsChips: checkVals(d.id + '-obs'),
      obs: (gv(d.id + '-obsfree') || '').trim()
    }));

    const student = this.state.student || {};
    return {
      name: gv('studentName').trim(),
      grade: gv('grade'),
      disability: gv('disability').trim(),
      secondaryDisability: gv('secondaryDisability'),
      acStrengths: checkVals('ac-strength'),
      fnStrengths: checkVals('fn-strength'),
      academicSubjects,
      evalResults: gv('eval-results').trim(),
      attLevel: radioVal('att-level'),
      functionalDomains,
      bip: student.has_bip ? 'Yes' : 'No',
      // disability sub-blocks
      sldDeficits: Array.from(document.querySelectorAll('#block-sld input[type="checkbox"]:checked')).map(el => el.value),
      sldProgram: gv('sld-program'), sldMathProgram: gv('sld-math-program'),
      asdSocial: gv('asd-social'), asdSensory: gv('asd-sensory'), asdExec: gv('asd-exec'), asdBehavior: gv('asd-behavior'),
      ohiAttention: gv('ohi-attention'), ohiMedical: gv('ohi-medical'), ohiAttendance: gv('ohi-attendance'),
      idAdaptive: gv('id-adaptive'), idSupport: gv('id-support'),
      idFuncAreas: Array.from(document.querySelectorAll('#block-id input[type="checkbox"]:checked')).map(el => el.value),
      edSupports: gv('ed-supports'), edSem: gv('ed-sem'),
      edBip: ((document.querySelector('input[name="ed-bip"]:checked')) || {}).value || '',
      sliReceptive: gv('sli-receptive'), sliExpressive: gv('sli-expressive'), sliImpact: gv('sli-impact'),
      // DNAs (read via the same path 3.8d uses)
      courses: student.courses || [],
      tf1s: this.state.tf1s || [],
      pf1: this.state.pf1 || null,
      ta1: this.state.ta1 || null   // 3.10b — transition present-levels (gated 14½+)
    };
  },

  // ---- orchestrator ------------------------------------------
  // 3.11a — Produce destination-tagged segments for the five Embrace-aligned
  // output sections plus the compliance block. The CALL ORDER below is
  // identical to the 3.10b build order so the shared `stated` de-dup tracker
  // resolves back-references exactly as before — only the routing of each
  // segment to a destination changes (impact statements consolidate into
  // their own `impact` bucket rather than interleaving with academic/functional).
  buildSegments() {
    const d = this.collectNarrativeData();
    const stated = new Set(); // shared concept tracker across the whole build
    const seg = { academic: [], strengths: [], functional: [], parent: [], impact: [], compliance: [] };
    const add = (dest, p) => { if (p && p.trim()) seg[dest].push(p.trim()); };

    add('academic',   this.narrSnapshot(d));                       // snapshot/eligibility intro
    add('strengths',  this.narrStrengths(d));                      // strengths
    add('academic',   this.narrAcademic(d, stated));               // academic domains + attributed TF1 + IL Standards
    add('academic',   this.narrEvaluation(d));                     // evaluation summary, verbatim
    add('academic',   this.narrAttendance(d));                     // attendance present level + its instructional impact
    add('impact',     this.narrAdverseImpactAcademic(d, stated));  // adverse impact (academic) → Impact only
    add('functional', this.narrFunctional(d, stated));             // functional obs + TF1 corroboration + BIP
    add('impact',     this.narrAdverseImpactFunctional(d, stated));// adverse impact (functional) → Impact only
    add('functional', this.narrDisability(d, stated));             // disability-specific impact
    add('parent',     this.narrParent(d));                         // parent input
    // Transition / student-voice present levels (TA1), gated to age 14½+.
    if (this._isTransitionAge(d)) add('functional', this.narrTransition(d));
    // Missing-input compliance flags — removable guidance, never a copy target.
    add('compliance', this.complianceNotesBlock(d));
    return seg;
  },

  // Backward-compatible flat narrative (used by harnesses/any other callers).
  // Concatenates the segments in destination order.
  buildNarrative() {
    const seg = this.buildSegments();
    return [].concat(seg.academic, seg.strengths, seg.functional, seg.parent, seg.impact, seg.compliance);
  },

  // (1) Snapshot
  narrSnapshot(d) {
    const name = d.name || 'This student';
    const grade = d.grade ? this._gradeOrdinal(d.grade) + ' grade' : 'high school';
    const disability = d.disability || 'a qualifying disability';
    const sec = d.secondaryDisability;
    const secClause = (sec && sec !== 'None' && sec !== '')
      ? `, with a secondary eligibility of ${sec} also noted` : '';
    return `${name} is a ${grade} student at Niles North High School who receives special education services under the eligibility of ${disability}${secClause}.`;
  },

  // (2) Strengths (TA1-sourced strengths arrive in 3.10b)
  narrStrengths(d) {
    const name = d.name || 'This student';
    const ac = (d.acStrengths || []).filter(Boolean);
    const fn = (d.fnStrengths || []).filter(Boolean);
    if (ac.length && fn.length) {
      return `${name} demonstrates a range of academic and functional strengths, including ${this._naturalList(ac.map(s => s.toLowerCase()))}. Beyond the classroom, they also show strengths in ${this._naturalList(fn.map(s => s.toLowerCase()))}.`;
    }
    if (ac.length === 1) return `${name} demonstrates a notable academic strength in ${ac[0].toLowerCase()}.`;
    if (ac.length > 1) return `${name} demonstrates clear academic strengths in ${this._naturalList(ac.map(s => s.toLowerCase()))}.`;
    if (fn.length) return `${name} demonstrates meaningful strengths in ${this._naturalList(fn.map(s => s.toLowerCase()))}.`;
    // === 3.10b INSERTION POINT — TA1 student-identified strengths & interests ===
    return '';
  },

  // (3) Academic by domain — AP present level + barriers, then attributed TF1
  narrAcademic(d, stated) {
    const name = d.name || 'This student';
    const subjects = (d.academicSubjects || []).filter(r => r.level);
    if (!subjects.length) return '';

    const CROSS = { attention: 'attention', organization: 'organization', behavior: 'behavior' };
    const order = ['Significantly Below Grade Level', 'Below Grade Level', 'Approaching Grade Level', 'At Grade Level', 'Above Grade Level'];
    const sorted = subjects.slice().sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));

    // 3.10b — ISBE 34-54: frame academic present levels relative to the
    // Illinois Learning Standards. Stated once in the intro; each domain
    // sentence then references grade level normally (3.10b.1 — no repetition).
    const sentences = [`Current data reflects ${name}'s present levels of academic achievement relative to grade-level Illinois Learning Standards across content areas.`];
    sorted.forEach((r, idx) => {
      let s = (idx === 0)
        ? `In ${r.label}, ${name} is performing ${r.level.toLowerCase()}`
        : `In ${r.label}, they are performing ${r.level.toLowerCase()}`;
      if (r.barriers && r.barriers.length) {
        const blist = this._naturalList(r.barriers.map(b => b.value.toLowerCase()));
        s += idx === 0 ? `, with primary barriers including ${blist}` : `, with noted challenges in ${blist}`;
        // mark cross-cutting concepts so TF1 evidence corroborates rather than repeats
        r.barriers.forEach(b => { if (CROSS[b.concept]) stated.add(CROSS[b.concept]); });
      }
      sentences.push(s + '.');
      // attributed TF1 evidence for courses mapped to this domain
      this._domainTf1Sentences(d, r.key, name, stated).forEach(ev => sentences.push(ev));
    });
    return sentences.join(' ');
  },

  // TF1 course evidence for a domain — attributed, de-duped against `stated`
  _domainTf1Sentences(d, domainKey, name, stated) {
    const map = window.COURSE_DOMAIN_MAP;
    if (!map) return [];
    const courseNames = new Set((d.courses || []).filter(c => map.getDomain(c) === domainKey).map(c => c.name));
    if (!courseNames.size) return [];
    const tfs = (d.tf1s || []).filter(tf => tf && tf.courseName && courseNames.has(tf.courseName));
    if (!tfs.length) return [];

    const SETTING = { gen_ed: 'general education', co_taught: 'co-taught', sped_resource: 'special education/resource' };
    const PERF = {
      'Significantly below expectations': 'performing significantly below grade-level expectations',
      'Below expectations': 'performing below grade-level expectations',
      'Approaching expectations': 'approaching grade-level expectations',
      'Meeting expectations': 'meeting grade-level expectations',
      'Exceeding expectations': 'exceeding grade-level expectations'
    };

    return tfs.map(tf => {
      const setting = SETTING[tf.settingType] ? ` (${SETTING[tf.settingType]})` : '';
      const perf = PERF[tf.overallPerformance] || 'performing at their current level';
      let s = `In ${tf.courseName}${setting}, the teacher reports that ${name} is ${perf}`;

      // de-dup behavioral concepts: corroborate already-stated, introduce new
      const fresh = [], corro = [];
      this._tf1Concepts(tf).forEach(c => {
        if (stated.has(c)) corro.push(c);
        else { fresh.push(c); stated.add(c); }
      });
      if (fresh.length) s += `, and notes ${this._naturalList(fresh.map(c => this._conceptPhrase(c)))}`;
      if (corro.length) s += `, consistent with the ${this._naturalList(corro.map(c => this._conceptNoun(c)))} noted above`;
      s += '.';

      if (Array.isArray(tf.effectiveStrategies) && tf.effectiveStrategies.length) {
        s += ` Supports that help include ${this._naturalList(tf.effectiveStrategies.map(x => x.toLowerCase()))}.`;
      }
      return s;
    });
  },

  // (3b) Evaluation summary, in the case manager's own words. Passed through
  // with nothing but a closing period added — this is clinical content, and
  // rephrasing it risks changing what a report actually said.
  narrEvaluation(d) {
    const t = (d.evalResults || '').trim();
    if (!t) return '';
    return /[.!?]$/.test(t) ? t : t + '.';
  },

  // (3c) Attendance present level. The absenteeism band carries its own
  // instructional consequence, so a single selection produces both the fact
  // and its impact — which is what the three old dropdowns were asking the
  // case manager to spell out by hand. Bands follow the Illinois chronic-
  // absenteeism definition (10% of enrolled days, excused or not).
  narrAttendance(d) {
    const name = d.name || 'This student';
    return ({
      'Satisfactory (fewer than 5% of days missed)':
        `${name}'s attendance is consistent and does not present a barrier to accessing instruction.`,
      'Mild concern (5–9% of days missed)':
        `${name}'s attendance is generally consistent, though absences have periodically required re-teaching of missed content.`,
      'Chronic absenteeism (10–19% of days missed)':
        `${name} meets the State definition of chronic absenteeism, having missed 10–19% of school days. These absences produce gaps in instruction that compound across content areas and reduce opportunities for the repeated practice ${name} needs to build fluency.`,
      'Severe chronic absenteeism (20%+ of days missed)':
        `${name} has missed 20% or more of school days. At this level, attendance is a primary barrier to progress: sustained access to instruction has to be established for the supports described above to take effect.`
    })[d.attLevel] || '';
  },

  // (4) Functional performance — 5.1c: surfaces every domain the case manager
  //     RATED as a difficulty (quick-select observation chips supply the
  //     specifics; free text adds anything beyond them), opens with an
  //     age-appropriate strengths sentence, and keeps the TF1 corroboration +
  //     shared `stated` de-dup exactly as before.
  narrFunctional(d, stated) {
    const name = d.name || 'This student';
    const hasBip = d.bip === 'Yes';
    const CONCEPT_BY_FUNC = { 'func-attn': 'attention', 'func-org': 'organization', 'func-reg': 'behavior', 'func-social': 'behavior' };
    const DIFFICULTY = {
      'Significant Difficulty': 'significant difficulty',
      'Moderate Difficulty':   'moderate difficulty',
      'Mild Difficulty':       'mild difficulty'
    };
    // Setting phrases read as prose, not as pasted option labels.
    const SETTING_PHRASE = {
      'Across all settings': 'observed across all settings',
      'Academic classes primarily': 'most evident in academic classes',
      'Unstructured time (lunch, passing periods, transitions)': 'most evident during unstructured times such as lunch, passing periods, and transitions',
      'Both structured and unstructured settings': 'observed in both structured and unstructured settings',
      'Testing situations': 'most evident in testing situations'
    };

    const all = d.functionalDomains || [];
    const rated = all.filter(x => DIFFICULTY[x.level]);
    const ageApp = all.filter(x => x.level === 'Age Appropriate');

    const sentences = [];

    // Strengths first: one sentence covering every age-appropriate area.
    if (ageApp.length) {
      sentences.push(`${name} demonstrates age-appropriate skills in ${this._naturalList(ageApp.map(x => x.label.toLowerCase()))}.`);
    }

    rated.forEach(x => {
      const concept = CONCEPT_BY_FUNC[x.id];
      let lead;
      if (concept && stated.has(concept)) {
        // Concept already described earlier — back-reference, then surface the
        // specific observations (which are unique content).
        lead = `Consistent with the above, ${x.label.toLowerCase()} remains an area of need for ${name}`;
      } else {
        lead = `${x.label} is an area of ${DIFFICULTY[x.level]} for ${name}`;
        if (concept) stated.add(concept);
      }
      if (x.setting && SETTING_PHRASE[x.setting]) lead += `, ${SETTING_PHRASE[x.setting]}`;
      let s = lead + '.';

      const chips = (x.obsChips || []).filter(Boolean);
      if (chips.length) {
        s += ` This most often looks like ${this._naturalList(chips)}.`;
      }
      if (x.obs && x.obs.trim()) {
        const obs = x.obs.trim();
        s += ' ' + this._upperFirst(obs) + (/[.!?]$/.test(obs) ? '' : '.');
      }
      sentences.push(s);
    });

    let p = sentences.join(' ');

    // TF1 behavioral corroboration — back-reference concepts already described;
    // introduce a genuinely-new concept only once.
    const tfs = (d.tf1s || []).filter(tf => tf && tf.courseName);
    const corro = new Set(), fresh = new Set();
    tfs.forEach(tf => this._tf1Concepts(tf).forEach(c => {
      if (stated.has(c)) corro.add(c); else fresh.add(c);
    }));
    const clauses = [];
    if (corro.size) clauses.push(`teacher reports across ${name}'s classes are consistent with these observations`);
    if (fresh.size) {
      clauses.push(`teachers additionally note ${this._naturalList([...fresh].map(c => this._conceptPhrase(c)))}`);
      fresh.forEach(c => stated.add(c));
    }
    if (clauses.length) {
      if (p) p += ' ';
      p += this._upperFirst(clauses.join('; ')) + '.';
    }

    // BIP — UNCHANGED: sourced from student.has_bip (via d.bip). Do not modify.
    if (hasBip) {
      if (p) p += ' ';
      p += `A Behavior Intervention Plan is currently in place to support ${name}'s behavioral needs.`;
    }
    return p;
  },

  // (5) Disability-specific present-level IMPACT (from the active conditional
  //     block). Eligibility is stated ONCE in the snapshot and is never restated
  //     here — this paragraph describes how the disability presents. Returns ''
  //     when the active block has no impact data on file.
  narrDisability(d, stated) {
    const name = d.name || 'This student';
    const dis = d.disability;
    if (!dis) return '';
    const L = [];
    const meaningful = (v, ...neutral) => v && !neutral.some(n => v.toLowerCase().startsWith(n.toLowerCase()));
    // Light de-dup: if a tracked concept was already described, back-reference it
    // while still surfacing the specific clinical descriptor (unique content).
    const tagged = (concept, sentence) => {
      if (concept && stated.has(concept)) return 'As noted above, ' + sentence;
      if (concept) stated.add(concept);
      return sentence;
    };

    switch (dis) {
      case 'Specific Learning Disability':
        if (d.sldDeficits && d.sldDeficits.length) {
          L.push(`${name}'s specific learning disability primarily affects ${this._naturalList(d.sldDeficits.map(s => s.toLowerCase()))}.`);
        }
        if (meaningful(d.sldProgram, 'None', 'Select')) L.push(`${name} currently receives reading intervention through ${d.sldProgram}.`);
        if (meaningful(d.sldMathProgram, 'None', 'Select')) L.push(`Math intervention is provided through ${d.sldMathProgram}.`);
        break;
      case 'Autism':
        if (meaningful(d.asdSocial, 'No significant impact')) L.push(`In the area of social communication, ${name} presents with ${d.asdSocial.toLowerCase()}.`);
        if (meaningful(d.asdSensory, 'None')) L.push(`Sensory considerations are ${d.asdSensory.toLowerCase()}.`);
        if (meaningful(d.asdExec, 'Age-appropriate')) L.push(`With regard to executive functioning, ${name} shows ${d.asdExec.toLowerCase()}.`);
        if (meaningful(d.asdBehavior, 'No behavioral concerns')) L.push(tagged('behavior', `${name}'s behavioral presentation includes ${d.asdBehavior.toLowerCase()}.`));
        break;
      case 'Other Health Impairment':
        if (meaningful(d.ohiAttention, 'Minimal impact')) L.push(tagged('attention', `${name}'s health impairment has a ${d.ohiAttention.toLowerCase()} on attention and focus.`));
        if (meaningful(d.ohiMedical, 'No significant')) L.push(`In terms of functional medical impact, ${this._lowerFirst(d.ohiMedical)}.`);
        if (meaningful(d.ohiAttendance, 'Satisfactory')) L.push(`Attendance reflects ${d.ohiAttendance.toLowerCase()}.`);
        break;
      case 'Intellectual Disability':
        if (d.idAdaptive) L.push(`With respect to adaptive behavior, ${name} ${this._lowerFirst(d.idAdaptive)}.`);
        if (d.idFuncAreas && d.idFuncAreas.length) L.push(`Instruction emphasizes functional academics, including ${this._naturalList(d.idFuncAreas.map(s => s.toLowerCase()))}.`);
        if (d.idSupport) L.push(`${name} requires a ${d.idSupport.toLowerCase()} level of support.`);
        break;
      case 'Emotional Disability':
        if (meaningful(d.edSupports, 'None in place')) L.push(`${name} currently receives ${d.edSupports.toLowerCase()}.`);
        if (d.edSem) L.push(tagged('behavior', `${name}'s social-emotional functioning is marked by ${d.edSem.toLowerCase()}.`));
        // BIP is stated once via student.has_bip in the functional paragraph — not repeated here.
        break;
      case 'Speech or Language Impairment':
        if (meaningful(d.sliReceptive, 'Within functional limits')) L.push(`Receptive language is characterized by ${d.sliReceptive.toLowerCase()}.`);
        if (meaningful(d.sliExpressive, 'Within functional limits')) L.push(`Expressive language is characterized by ${d.sliExpressive.toLowerCase()}.`);
        if (meaningful(d.sliImpact, 'Minimal')) L.push(`The impact on academic access is ${d.sliImpact.toLowerCase()}.`);
        break;
      case 'Multiple Disabilities':
        if (d.sldDeficits && d.sldDeficits.length) L.push(`${name}'s learning needs span more than one area, including ${this._naturalList(d.sldDeficits.map(s => s.toLowerCase()))}.`);
        break;
      default:
        break;
    }
    return L.join(' ');
  },

  // (6) Parent input (attributed). Neutral placeholder if no PF1 (flagged in 3.10b).
  narrParent(d) {
    const name = d.name || 'This student';
    const pf = d.pf1;
    if (!pf) {
      // Single neutral line the 3.10b compliance layer can flag.
      return `Parent input has not yet been received and will be incorporated upon completion of the family feedback form.`;
    }
    const parent = (pf.parentName && pf.parentName.trim()) ? pf.parentName.trim() : `${name}'s family`;
    const L = [`${parent} contributed family input to this review.`];
    if (pf.hopesGoals) L.push(`${parent} shared the following hopes and goals for ${name}: ${this._softQuote(pf.hopesGoals)}.`);
    if (pf.whatsGoingWell) L.push(`At home, ${parent} reports that what is going well includes ${this._softQuote(pf.whatsGoingWell)}.`);
    if (pf.biggestConcerns) L.push(`Among ${parent}'s primary concerns: ${this._softQuote(pf.biggestConcerns)}.`);
    if (Array.isArray(pf.supportAreas) && pf.supportAreas.length) {
      L.push(`${parent} feels ${name} would benefit from additional support in ${this._naturalList(pf.supportAreas.map(s => s.toLowerCase()))}.`);
    }
    if (pf.anythingElse) L.push(`${parent} also shared: ${this._softQuote(pf.anythingElse)}.`);
    return L.join(' ');
  },

  // =============================================================
  // 3.10b — IDEA/ISBE compliance layer (ADDITIVE ONLY)
  // Adverse-impact statements, transition present-levels (gated), and
  // missing-input flags. Adds to the assembled narrative; the 3.10a
  // de-dup/functional/BIP/eligibility logic is untouched.
  // =============================================================

  // Age gate for transition present levels. No DOB field exists on the
  // student record, so per the 3.10b spec we default to grade 9 and above
  // (the IEP in effect when the student turns 14½).
  _isTransitionAge(d) {
    const g = parseInt(d.grade, 10);
    return !isNaN(g) && g >= 9;
  },

  // Adverse-impact statement (academic) — IDEA §300.320(a)(1). Explicit,
  // concrete, and tied to the academic levels/barriers already stated; not
  // boilerplate. References the named needs rather than re-describing them.
  narrAdverseImpactAcademic(d) {
    const name = d.name || 'This student';
    const subjects = (d.academicSubjects || []).filter(r => r.level);
    if (!subjects.length) return '';

    const below = ['Significantly Below Grade Level', 'Below Grade Level', 'Approaching Grade Level'];
    const needAreas = subjects.filter(r => below.includes(r.level));
    const focus = needAreas.length ? needAreas : subjects;
    const areaLabels = [...new Set(focus.map(r => r.label.toLowerCase()))];
    const barriers = [];
    focus.forEach(r => (r.barriers || []).forEach(b => barriers.push(b.value.toLowerCase())));
    const uniqBarriers = [...new Set(barriers)];

    const disPhrase = d.disability ? `${name}'s ${d.disability}` : `${name}'s disability`;
    const subjectClause = uniqBarriers.length
      ? `${name}'s documented needs in ${this._naturalList(uniqBarriers)}`
      : `${name}'s areas of academic need`;
    return `As a result of ${disPhrase}, ${subjectClause} adversely impact ${name}'s involvement and progress in the general education curriculum, limiting their ability to independently access and demonstrate grade-level content in ${this._naturalList(areaLabels)}.`;
  },

  // Adverse-impact statement (functional) — tied to the functional areas the
  // case manager documented (observations preferred; rated difficulties as a
  // fallback). Concrete effect on accessing the general curriculum.
  narrAdverseImpactFunctional(d) {
    const name = d.name || 'This student';
    const withObs = (d.functionalDomains || []).filter(x => x.obs && x.obs.trim());
    const rated = (d.functionalDomains || []).filter(x =>
      ['Significant Difficulty', 'Moderate Difficulty', 'Mild Difficulty'].includes(x.level));
    const source = withObs.length ? withObs : rated;
    if (!source.length) return '';
    const areas = [...new Set(source.map(x => x.label.toLowerCase()))];
    return `${name}'s functional needs in ${this._naturalList(areas)} adversely impact their involvement and progress in the general education curriculum by interfering with their ability to consistently engage in instruction, complete tasks independently, and participate fully alongside same-age peers.`;
  },

  // Transition / student-voice PRESENT LEVELS from a completed TA1. Attributed
  // to the student throughout. PRESENT LEVELS ONLY — no measurable postsecondary
  // goals, services, or course of study (those are Phase 4). Returns '' if no
  // TA1 is on file (the compliance block flags the absence).
  narrTransition(d) {
    const ta = d.ta1;
    if (!ta) return '';
    const name = d.name || 'This student';
    // 3.10b.1 — normalize any first-person leak from TA1 option text, then
    // lowercase for mid-sentence rendering.
    const tp = arr => (arr || []).filter(Boolean).map(x => this._thirdPerson(x).toLowerCase());
    const list = arr => this._naturalList(tp(arr));
    const L = [];

    const GOAL = {
      '4-year college': 'attending a four-year college',
      '2-year or community college': 'attending a two-year or community college',
      'Trade or technical school': 'attending a trade or technical school',
      'Military': 'entering the military',
      'Start working right away': 'entering the workforce directly after high school',
      'Still exploring my options': 'still exploring post-secondary options'
    };
    const careerPhrase = ta.careerInterest ? this._thirdPerson(ta.careerInterest) : '';
    if (ta.postSecondaryGoal) {
      let s = `Looking ahead, ${name} identifies a post-secondary vision of ${GOAL[ta.postSecondaryGoal] || ta.postSecondaryGoal.toLowerCase()}`;
      if (careerPhrase) s += `, expressing interest in the field of ${careerPhrase}`;
      L.push(s + '.');
    } else if (careerPhrase) {
      L.push(`Looking ahead, ${name} expresses interest in the field of ${careerPhrase}.`);
    }

    const sParts = [];
    if (ta.studentStrengths && ta.studentStrengths.length) sParts.push(`personal strengths in ${list(ta.studentStrengths)}`);
    if (ta.outsideInterests && ta.outsideInterests.length) sParts.push(`interests outside of school including ${list(ta.outsideInterests)}`);
    if (sParts.length) L.push(`${name} identifies ${this._naturalList(sParts)}.`);

    if (ta.learningStyles && ta.learningStyles.length) {
      L.push(`${name} reports learning best through ${list(ta.learningStyles)}.`);
    }

    if (ta.selfAdvocacyActions && ta.selfAdvocacyActions.length) {
      const acts = ta.selfAdvocacyActions.filter(a => a !== 'None of these yet');
      if (acts.length) L.push(`In the area of self-advocacy, ${name} reports having taken steps such as ${list(acts)}.`);
      else L.push(`${name} reports not yet having taken independent self-advocacy steps.`);
    }

    const AWARE = {
      'Yes — I understand it well': 'a strong understanding of how their disability affects their learning',
      'Somewhat — I know a little': 'some understanding of how their disability affects their learning',
      "Not really — I'm not sure": 'limited awareness of how their disability affects their learning',
      "No — I don't know much about it": 'little awareness of how their disability affects their learning'
    };
    if (ta.disabilityAwareness) {
      L.push(`${name} reports ${AWARE[ta.disabilityAwareness] || ta.disabilityAwareness.toLowerCase()}.`);
    }

    const LIVE = {
      'Living with family': 'living with family',
      'Living on my own': 'living independently',
      'Living with a roommate': 'living with a roommate',
      'Living in a college dorm': 'living in a college dorm',
      "I'm not sure yet": ''
    };
    const livingParts = [];
    if (ta.independentLiving && LIVE[ta.independentLiving]) livingParts.push(`anticipates ${LIVE[ta.independentLiving]} after high school`);
    if (ta.dailyLivingSkills && ta.dailyLivingSkills.length) livingParts.push(`reports being able to independently ${list(ta.dailyLivingSkills)}`);
    if (livingParts.length) L.push(`In the area of independent living, ${name} ${this._naturalList(livingParts)}.`);
    if (ta.dailyLivingGrowth && ta.dailyLivingGrowth.length) {
      L.push(`${name} identifies ${list(ta.dailyLivingGrowth)} as daily-living skills they would like to develop further.`);
    }

    if (typeof ta.overallReadinessScore === 'number' && ta.overallReadinessScore > 0) {
      L.push(`Based on self-report across these areas, ${name}'s overall transition-readiness score is currently ${ta.overallReadinessScore}%.`);
    }

    if (!L.length) return '';
    return `The following transition-related present levels reflect ${name}'s own input from a completed transition assessment. ` + L.join(' ');
  },

  // Missing-input compliance flags. A clearly-labeled, removable block — this
  // is guidance for the case manager, not part of the final narrative text.
  complianceNotesBlock(d) {
    const notes = [];
    const map = window.COURSE_DOMAIN_MAP;
    const ACAD_DOMAINS = ['literacy', 'math', 'science', 'socialscience'];
    const DOMAIN_LABEL = { literacy: 'Literacy', math: 'Math', science: 'Science', socialscience: 'Social Science' };

    if (!d.pf1) notes.push('Parent input has not yet been received.');

    if (this._isTransitionAge(d) && !d.ta1) {
      notes.push('Transition assessment is required for the IEP in effect at age 14½ and is not yet on file.');
    }

    if (map) {
      const tfNames = new Set((d.tf1s || []).filter(t => t && t.courseName).map(t => t.courseName));
      const missingCourses = (d.courses || [])
        .filter(c => ACAD_DOMAINS.includes(map.getDomain(c)))
        .filter(c => !tfNames.has(c.name))
        .map(c => c.name);
      if (missingCourses.length) {
        notes.push(`Teacher feedback not yet received for ${this._naturalList(missingCourses)}.`);
      }

      const ratingByKey = {};
      (d.academicSubjects || []).forEach(s => { ratingByKey[s.key] = s.level; });
      const missingRatings = ACAD_DOMAINS
        .filter(dom => (d.courses || []).some(c => map.getDomain(c) === dom) && !ratingByKey[dom])
        .map(dom => DOMAIN_LABEL[dom]);
      if (missingRatings.length) {
        notes.push(`Academic Performance rating not yet entered for ${this._naturalList(missingRatings)}.`);
      }
    }

    if (!notes.length) return '';
    return `— — — — — — — — — — — — — — — — — — — — — — — —\n` +
      `COMPLIANCE NOTES (guidance for the case manager — review and delete before finalizing):\n` +
      notes.map(n => '• ' + n).join('\n');
  }
};

window.aceIepBuilder = aceIepBuilder;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('iepBuilderHost')) {
    window.aceIepBuilder.init();
  }
});
