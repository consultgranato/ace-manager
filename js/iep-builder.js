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
          ${this.academicSectionHTML()}
          ${this.attendanceSectionHTML()}
          ${this.functionalSectionHTML()}
          ${this.goalsSectionHTML()}
          ${this.studentInfoSectionHTML()}
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
    this.wireStudentInfo(host);
    this.wireAcademic(host);
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

    const barrierChecks = (key, items, suggested = new Set()) => items.map(b => {
      const s = suggested.has(b.id);
      return `<label class="iep-check${s ? ' iep-check-suggested' : ''}">
        <input type="checkbox" id="bar-${key}-${b.id}" value="${esc(b.value)}" class="acad-barrier" />
        <span>${esc(b.label)}</span>${s ? ' <span class="iep-barrier-suggest-tag">suggested</span>' : ''}
      </label>`;
    }).join('');

    const subjectBlock = (s) => {
      const suggestions = computeSuggestions(s.key);
      return `<div class="iep-acad-block">
        <div class="iep-acad-block-title">${esc(s.label)}</div>
        ${this.selectField('acad-perf-' + s.key, 'Performance Level', perfOptions)}
        ${refPanelHTML(s.key)}
        <div class="iep-field">
          <label class="iep-label">Common barriers</label>
          <div class="iep-check-grid">${barrierChecks(s.key, commonBarriers, suggestions)}</div>
        </div>
        <div class="iep-field">
          <label class="iep-label">Subject-specific barriers</label>
          <div class="iep-check-grid">${barrierChecks(s.key, s.specific)}</div>
        </div>
      </div>`;
    };

    return `
      <section class="iep-section" id="sec-academic">
        <h2 class="iep-section-title">Academic Performance</h2>
        <p class="iep-section-hint muted">Select a performance level and any relevant barriers for each subject area.</p>
        ${subjects.map(subjectBlock).join('')}
        <div class="iep-field">
          <div class="iep-acad-assess-header">
            <label class="iep-label" style="margin-bottom:0;">Assessment Data</label>
            <button type="button" id="addAssessmentBtn" class="iep-acad-add-btn">+ Add Assessment</button>
          </div>
          <div id="assessmentRows"></div>
        </div>
        <div class="iep-field">
          <label class="iep-label">Evaluation Results</label>
          <textarea id="eval-results" rows="4" class="iep-text iep-textarea" placeholder="Summarize any recent evaluation findings — psych, speech, OT, etc. Reference report date if known."></textarea>
          <p class="iep-section-hint muted" style="margin-top:5px;">e.g., Triennial re-evaluation, psych report, speech evaluation, OT assessment</p>
        </div>
      </section>`;
  },

  wireAcademic(host) {
    const SCORE_TYPES = ['Percentile','Grade Equivalent','Standard Score','Lexile','Scale Score','Raw Score','Other'];
    const addRow = () => {
      const container = host.querySelector('#assessmentRows');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'assessment-row iep-assess-row';
      row.innerHTML = `
        <div class="iep-assess-name-wrap">
          <input type="text" class="assess-name iep-text iep-text-sm" placeholder="e.g., Star Reading, MAP, iReady" />
        </div>
        <div class="iep-assess-score-wrap">
          <input type="text" class="assess-score iep-text iep-text-sm iep-assess-score-input" placeholder="Score" />
          <span class="assess-interp iep-assess-interp hidden"></span>
        </div>
        <select class="assess-type iep-select iep-select-sm">
          <option value="">Type...</option>
          ${SCORE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <input type="date" class="assess-date iep-text iep-text-sm" />
        <button type="button" class="iep-assess-remove-btn" aria-label="Remove">&times;</button>`;
      const scoreEl = row.querySelector('.assess-score');
      const typeEl = row.querySelector('.assess-type');
      const interpEl = row.querySelector('.assess-interp');
      const updateInterp = () => {
        const val = parseInt(scoreEl.value);
        if (typeEl.value === 'Percentile' && !isNaN(val) && val >= 1 && val <= 99) {
          interpEl.textContent = val <= 24 ? 'Below Average Range' : val <= 74 ? 'Average Range' : 'Above Average Range';
          interpEl.classList.remove('hidden');
        } else {
          interpEl.classList.add('hidden');
        }
      };
      scoreEl.addEventListener('input', updateInterp);
      typeEl.addEventListener('change', updateInterp);
      row.querySelector('.iep-assess-remove-btn').addEventListener('click', () => row.remove());
      container.appendChild(row);
    };
    const addBtn = host.querySelector('#addAssessmentBtn');
    if (addBtn) addBtn.addEventListener('click', addRow);
  }
};

window.aceIepBuilder = aceIepBuilder;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('iepBuilderHost')) {
    window.aceIepBuilder.init();
  }
});
