// =============================================================
// Ace Manager — Transition Plan builder (Indicator 13)
// =============================================================
// The full transition plan, not just present levels: measurable
// postsecondary goals (stored in iep_goals, goal_type='transition' — the
// plan reads them, never copies), transition services per goal area,
// courses of study, agency linkages, and a live Indicator 13 checklist.
//
// Illinois gates transition planning at age 14½ (earlier than the federal
// 16): with a birth date on file the gate is computed against the next
// annual review (the IEP that must contain the plan); without one it falls
// back to the grade-9+ proxy the PLAAFP engine already uses.
//
// TA1 data SUGGESTS, never sets: assessment-derived chips prefill the goal
// builder or highlight a service chip, and nothing is written until the
// case manager acts. Output is copy-out labeled sections, consistent with
// how the PLAAFP output works (Embrace stays the system of record).

const aceTransitionPlan = {

  AREAS: [
    { id: 'education_training', label: 'Education / Training' },
    { id: 'employment',         label: 'Employment' },
    { id: 'independent_living', label: 'Independent Living' }
  ],

  SERVICES: {
    education_training: [
      'Instruction in study and organizational strategies',
      'College awareness and campus visits',
      'Support with college applications and essays',
      'ACT/SAT accommodations and test preparation',
      'Instruction in disability rights and self-disclosure',
      'Assistance registering with college disability services',
      'Financial aid and FAFSA guidance',
      'Dual-credit or CTE coursework aligned to the goal'
    ],
    employment: [
      'Career interest and aptitude assessment',
      'Job shadowing or worksite visits',
      'Resume and application development',
      'Interview practice and coaching',
      'Work-based learning or work-study placement',
      'Instruction in workplace social skills',
      'Referral to the Division of Rehabilitation Services (DRS)',
      'Summer employment support'
    ],
    independent_living: [
      'Instruction in money management and budgeting',
      'Travel training on public transportation',
      'Instruction in meal planning and preparation',
      'Self-care and health management instruction',
      'Community safety instruction',
      'Instruction in accessing community resources',
      'Practice scheduling and attending appointments'
    ]
  },

  AGENCIES: [
    'Division of Rehabilitation Services (DRS)',
    'Illinois DHS — Developmental Disabilities (PUNS)',
    'Center for Independent Living',
    'Community college disability services office',
    'Job Corps',
    'Armed forces recruiter',
    'County health / mental health services',
    'Social Security Administration (SSI benefits)'
  ],

  // ---- 14½ gate ----------------------------------------------------------
  // True when the transition plan belongs in this student's IEP: age ≥ 14½ at
  // the next annual review (DOB on file), else the grade-9+ proxy.
  isEligible(student) {
    if (student && student.dob) {
      const dob = window.aceUtils.parseLocalDate(student.dob);
      const at = window.aceUtils.parseLocalDate(student.annual_review_date) || new Date();
      if (dob && !isNaN(dob)) {
        const ageYears = (at - dob) / (365.25 * 24 * 3600 * 1000);
        return ageYears >= 14.5;
      }
    }
    const g = parseInt(student && student.grade, 10);
    return !isNaN(g) && g >= 9;
  },

  gateExplanation(student) {
    if (student && student.dob) {
      return 'Illinois requires transition planning in the IEP in effect when the student turns 14½. Based on the birth date on file, this student has not reached that point yet — the plan unlocks automatically when they do.';
    }
    return 'Illinois requires transition planning by age 14½. No birth date is on file, so eligibility is estimated from grade level (9th and above). Add a birth date in Edit Student for an exact gate.';
  },

  // ---- state -------------------------------------------------------------
  state: { student: null, plan: null, goals: [], ta1: null, saveTimer: null },

  _emptyPlan() {
    return {
      services: { education_training: [], employment: [], independent_living: [] },
      courses_of_study: '',
      agencies: [],
      agency_notes: '',
      agency_not_needed: false,
      il_considered: false,
      student_invited: false,
      agency_invited: false
    };
  },

  basePath() {
    return window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
  },

  async init() {
    const host = document.getElementById('transitionPlanHost');
    if (!host) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { host.innerHTML = '<div class="iep-empty">No student specified.</div>'; return; }

    const { data: student, error } = await window.aceSupabase.from('students').select('*').eq('id', id).single();
    if (error || !student) { host.innerHTML = '<div class="iep-empty">Could not load student.</div>'; return; }
    this.state.student = student;

    if (!this.isEligible(student)) {
      const esc = window.aceUtils.escapeHtml;
      host.innerHTML = `
        <div class="tp-page">
          <a href="${this.basePath()}pages/student-profile.html?id=${student.id}" class="iep-toc-back">${window.aceIcons.arrowLeft(14)} Back to profile</a>
          <div class="ace-card tp-gate-card">
            <h2>Transition planning isn't required yet</h2>
            <p class="muted">${esc(this.gateExplanation(student))}</p>
          </div>
        </div>`;
      return;
    }

    await this._loadData();
    this.render(host);
  },

  async _loadData() {
    const sid = this.state.student.id;
    const [planResp, goalsResp, taResp] = await Promise.all([
      window.aceSupabase.from('transition_plans').select('*').eq('student_id', sid).limit(1),
      window.aceSupabase.from('iep_goals').select('*').eq('student_id', sid)
        .order('created_at', { ascending: true }),
      window.aceSupabase.from('transition_assessments').select('payload')
        .eq('student_id', sid).eq('status', 'completed')
        .order('completed_at', { ascending: false }).limit(1)
    ]);

    const row = planResp.data && planResp.data[0];
    this.state.planRowId = row ? row.id : null;
    this.state.plan = Object.assign(this._emptyPlan(), (row && row.data) || {});
    // Deep-merge the services map so a partial saved shape can't drop an area.
    this.state.plan.services = Object.assign(
      { education_training: [], employment: [], independent_living: [] },
      (row && row.data && row.data.services) || {});
    this.state.goals = goalsResp.data || [];
    this.state.ta1 = (taResp.data && taResp.data[0] && taResp.data[0].payload && taResp.data[0].payload.version)
      ? taResp.data[0].payload : null;
  },

  // Debounced upsert of the plan jsonb. Goals save themselves through the
  // goal builder; this only persists the plan-owned data.
  _scheduleSave() {
    clearTimeout(this.state.saveTimer);
    this.state.saveTimer = setTimeout(() => this._save(), 900);
  },

  async _save() {
    const s = this.state;
    const status = document.getElementById('tpSaveStatus');
    const payload = { student_id: s.student.id, data: s.plan, updated_at: new Date().toISOString() };
    const resp = s.planRowId
      ? await window.aceSupabase.from('transition_plans').update(payload).eq('id', s.planRowId).select().single()
      : await window.aceSupabase.from('transition_plans').insert(payload).select().single();
    if (resp.error) {
      console.error('Transition plan save failed:', resp.error);
      if (status) status.textContent = 'Could not save';
      return;
    }
    s.planRowId = resp.data.id;
    if (status) {
      status.textContent = 'Saved';
      setTimeout(() => { if (status.textContent === 'Saved') status.textContent = ''; }, 2000);
    }
    this._refreshChecklist();
  },

  // ---- TA1 suggestions (suggest, never set) ------------------------------
  _goalSuggestions() {
    const ta = this.state.ta1;
    if (!ta) return {};
    const out = {};
    const career = (ta.careerInterest || '').trim();

    const EDU = {
      '4-year college': 'enroll in a four-year college or university' + (career ? ` to study a field related to ${career}` : ''),
      '2-year or community college': 'enroll in a community college program' + (career ? ` related to ${career}` : ''),
      'Trade or technical school': 'enroll in a trade or technical training program' + (career ? ` in the area of ${career}` : ''),
      'Military': 'enlist in a branch of the armed forces and complete basic training',
      'Start working right away': 'complete on-the-job or employer-provided training in an entry-level position',
      'Still exploring my options': 'enroll in a postsecondary education or training program aligned with their interests'
    };
    if (ta.postSecondaryGoal && EDU[ta.postSecondaryGoal]) {
      out.education_training = {
        behavior: EDU[ta.postSecondaryGoal],
        need: `TA1 post-secondary goal: ${ta.postSecondaryGoal}`
      };
    }
    out.employment = {
      behavior: career
        ? `obtain competitive integrated employment in the field of ${career}`
        : 'obtain competitive integrated employment matched to their strengths and interests',
      need: career ? `TA1 career interest: ${career}` : 'TA1 completed — no specific career named'
    };
    const LIVE = {
      'Living with family': 'live with family while independently managing personal finances, transportation, and daily routines',
      'Living on my own': 'live independently, managing housing, budgeting, and daily living tasks',
      'Living with a roommate': 'live with a roommate while sharing household responsibilities and managing personal finances',
      'Living in a college dorm': 'live in a college residence hall, independently managing daily routines and self-care'
    };
    if (ta.independentLiving && LIVE[ta.independentLiving]) {
      out.independent_living = {
        behavior: LIVE[ta.independentLiving],
        need: `TA1 independent living: ${ta.independentLiving}`
      };
    }
    return out;
  },

  // Service chips suggested from TA1 school challenges / growth areas.
  _serviceSuggestions() {
    const ta = this.state.ta1;
    const suggested = { education_training: new Set(), employment: new Set(), independent_living: new Set() };
    if (!ta) return suggested;
    const ch = new Set(ta.schoolChallenges || []);
    if (ch.has('Staying organized') || ch.has('Managing my time')) {
      suggested.education_training.add('Instruction in study and organizational strategies');
    }
    if (ch.has('Taking tests')) {
      suggested.education_training.add('ACT/SAT accommodations and test preparation');
    }
    if (ch.has('Asking for help')) {
      suggested.education_training.add('Instruction in disability rights and self-disclosure');
    }
    if ((ta.communityActivities || []).includes('Nothing currently')) {
      suggested.employment.add('Job shadowing or worksite visits');
    }
    if (!(ta.careerInterest || '').trim()) {
      suggested.employment.add('Career interest and aptitude assessment');
    }
    const growth = new Set(ta.dailyLivingGrowth || []);
    if (growth.has('Managing money')) suggested.independent_living.add('Instruction in money management and budgeting');
    if (growth.has('Using transportation')) suggested.independent_living.add('Travel training on public transportation');
    if (growth.has('Cooking')) suggested.independent_living.add('Instruction in meal planning and preparation');
    if (growth.has('Scheduling appointments')) suggested.independent_living.add('Practice scheduling and attending appointments');
    if ((ta.outsideAgencies || []).some(a => a && a.startsWith('DRS'))) {
      suggested.employment.add('Referral to the Division of Rehabilitation Services (DRS)');
    }
    return suggested;
  },

  // ---- render ------------------------------------------------------------
  render(host) {
    const s = this.state.student;
    const esc = window.aceUtils.escapeHtml;

    host.innerHTML = `
      <div class="tp-page">
        <div class="tp-header">
          <a href="${this.basePath()}pages/student-profile.html?id=${s.id}" class="iep-toc-back">${window.aceIcons.arrowLeft(14)} Back to profile</a>
          <h1>${esc(s.first_name)} ${esc(s.last_initial)}. — Transition Plan</h1>
          <p class="muted">Postsecondary goals, services, courses of study, and agency linkages — with a live Indicator 13 checklist. Saves as you work. <span id="tpSaveStatus" class="tp-save-status"></span></p>
          ${this.state.ta1 ? '' : `<div class="tp-ta-warn">${window.aceIcons.compass(14)} No completed transition assessment on file — Indicator 13 requires goals based on age-appropriate assessment. Generate one from the profile.</div>`}
        </div>

        <section class="iep-section" id="tp-goals"></section>
        <section class="iep-section" id="tp-services"></section>
        <section class="iep-section" id="tp-courses"></section>
        <section class="iep-section" id="tp-agencies"></section>
        <section class="iep-section" id="tp-meeting"></section>
        <section class="iep-section" id="tp-checklist"></section>
        <section class="iep-section" id="tp-output"></section>
      </div>
    `;

    this._renderGoals();
    this._renderServices();
    this._renderCourses();
    this._renderAgencies();
    this._renderMeeting();
    this._refreshChecklist();
    this._renderOutput();
  },

  _transitionGoals(area) {
    return this.state.goals.filter(g => g.goal_type === 'transition' && g.transition_area === area);
  },

  _renderGoals() {
    const host = document.getElementById('tp-goals');
    const esc = window.aceUtils.escapeHtml;
    const suggestions = this._goalSuggestions();

    const areaHTML = (area) => {
      const goals = this._transitionGoals(area.id);
      const sug = suggestions[area.id];
      const showSuggest = sug && !goals.length;
      const ilToggle = area.id === 'independent_living' && !goals.length ? `
        <label class="tp-check tp-il-considered">
          <input type="checkbox" id="tpIlConsidered" ${this.state.plan.il_considered ? 'checked' : ''} />
          <span>Independent living was considered by the team; a goal is not needed at this time</span>
        </label>` : '';
      return `
        <div class="tp-area" data-area="${area.id}">
          <div class="tp-area-head">
            <span class="tp-area-title">${esc(area.label)}</span>
            <button type="button" class="goal-mini-btn tp-add-goal" data-area="${area.id}">${window.aceIcons.plus(12)} Add goal</button>
          </div>
          ${goals.length ? goals.map(g => `
            <div class="tp-goal-row">
              <div class="tp-goal-text">${esc(g.goal_text)}</div>
              <button type="button" class="goal-mini-btn tp-edit-goal" data-goal-id="${g.id}">Edit</button>
            </div>`).join('')
          : `<p class="muted tp-empty">No measurable postsecondary ${esc(area.label.toLowerCase())} goal yet.</p>`}
          ${showSuggest ? `
            <div class="goals-suggest-label muted">Suggested from the transition assessment — click to start</div>
            <button type="button" class="goal-suggest-chip tp-suggest-goal" data-area="${area.id}" title="${esc(sug.need)}">
              After high school, ${esc(this.state.student.first_name)} will ${esc(sug.behavior)}…
            </button>` : ''}
          ${ilToggle}
        </div>`;
    };

    host.innerHTML = `
      <h2 class="iep-section-title">Measurable Postsecondary Goals</h2>
      <p class="iep-section-hint muted">One per area, in the fixed Indicator 13 grammar: “After high school, ${esc(this.state.student.first_name)} will…”. Education/training and employment are required; independent living where appropriate.</p>
      ${this.AREAS.map(areaHTML).join('')}
    `;

    const openBuilder = async (area, seed) => {
      const r = await window.aceGoalBuilder.open(this.state.student, null, {
        goal_type: 'transition', transition_area: area, ...(seed || {})
      });
      if (r && r.confirmed) {
        await this._reloadGoals();
      }
    };

    host.querySelectorAll('.tp-add-goal').forEach(b =>
      b.addEventListener('click', () => openBuilder(b.dataset.area)));
    host.querySelectorAll('.tp-suggest-goal').forEach(b =>
      b.addEventListener('click', () => {
        const sug = this._goalSuggestions()[b.dataset.area];
        openBuilder(b.dataset.area, sug ? { behavior: sug.behavior, source_need: sug.need } : null);
      }));
    host.querySelectorAll('.tp-edit-goal').forEach(b =>
      b.addEventListener('click', async () => {
        const g = this.state.goals.find(x => x.id === b.dataset.goalId);
        if (!g) return;
        const r = await window.aceGoalBuilder.open(this.state.student, g);
        if (r && r.confirmed) await this._reloadGoals();
      }));

    const il = host.querySelector('#tpIlConsidered');
    if (il) il.addEventListener('change', () => {
      this.state.plan.il_considered = il.checked;
      this._scheduleSave();
    });
  },

  async _reloadGoals() {
    const { data } = await window.aceSupabase.from('iep_goals').select('*')
      .eq('student_id', this.state.student.id).order('created_at', { ascending: true });
    this.state.goals = data || [];
    this._renderGoals();
    this._refreshChecklist();
    this._renderOutput();
  },

  _renderServices() {
    const host = document.getElementById('tp-services');
    const esc = window.aceUtils.escapeHtml;
    const suggested = this._serviceSuggestions();
    const plan = this.state.plan;

    const areaHTML = (area) => {
      const chosen = new Set(plan.services[area.id] || []);
      // Custom services the CM added earlier render as extra selected chips.
      const custom = (plan.services[area.id] || []).filter(v => !this.SERVICES[area.id].includes(v));
      const all = this.SERVICES[area.id].concat(custom);
      return `
        <div class="tp-area" data-svcarea="${area.id}">
          <div class="tp-area-title">${esc(area.label)}</div>
          <div class="svc-chipgrid">
            ${all.map(v => `
              <button type="button" class="svc-chip ${chosen.has(v) ? 'selected' : ''}" data-value="${esc(v)}">
                ${chosen.has(v) ? window.aceIcons.check(12) + ' ' : ''}${esc(v)}${!chosen.has(v) && suggested[area.id].has(v) ? ' <span class="iep-chip-tag">suggested</span>' : ''}
              </button>`).join('')}
          </div>
          <div class="iep-chip-add" style="margin-top:8px;">
            <input type="text" class="iep-text iep-text-sm tp-svc-custom" placeholder="Add another service" autocomplete="off" />
            <button type="button" class="iep-chip-add-btn">Add</button>
          </div>
        </div>`;
    };

    host.innerHTML = `
      <h2 class="iep-section-title">Transition Services</h2>
      <p class="iep-section-hint muted">The coordinated activities that move ${esc(this.state.student.first_name)} toward each postsecondary goal. Click to select; “suggested” chips come from the transition assessment.</p>
      ${this.AREAS.map(areaHTML).join('')}
    `;

    host.querySelectorAll('[data-svcarea]').forEach(areaEl => {
      const areaId = areaEl.dataset.svcarea;
      areaEl.querySelectorAll('.svc-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const v = chip.dataset.value;
          const list = plan.services[areaId] || (plan.services[areaId] = []);
          const i = list.indexOf(v);
          if (i >= 0) list.splice(i, 1); else list.push(v);
          this._scheduleSave();
          this._renderServices();
        });
      });
      const input = areaEl.querySelector('.tp-svc-custom');
      const commit = () => {
        const v = input.value.trim();
        if (!v) return;
        const list = plan.services[areaId] || (plan.services[areaId] = []);
        if (!list.some(x => x.toLowerCase() === v.toLowerCase())) list.push(v);
        input.value = '';
        this._scheduleSave();
        this._renderServices();
      };
      areaEl.querySelector('.iep-chip-add-btn').addEventListener('click', commit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    });
  },

  _renderCourses() {
    const host = document.getElementById('tp-courses');
    const esc = window.aceUtils.escapeHtml;
    const s = this.state.student;
    const courses = (s.courses || []).map(c => c.name).filter(Boolean);
    const ta = this.state.ta1;

    const starterBits = [];
    if (courses.length) starterBits.push(`current enrollment (${courses.join(', ')})`);
    if (ta && ta.postSecondaryGoal) starterBits.push(`the stated postsecondary goal (${ta.postSecondaryGoal})`);

    host.innerHTML = `
      <h2 class="iep-section-title">Courses of Study</h2>
      <p class="iep-section-hint muted">The multi-year course plan that supports the postsecondary goals — name the pathway, not just this year's classes.</p>
      ${courses.length ? `
        <div class="goals-suggest-label muted">Insert current courses as a starting point</div>
        <button type="button" class="goal-suggest-chip" id="tpCoursesInsert">Start from current enrollment${starterBits.length > 1 ? ' + assessment goal' : ''}</button>` : ''}
      <textarea id="tpCoursesText" class="iep-text iep-textarea" rows="5"
        placeholder="General education curriculum with resource support, continuing through Algebra 2 and senior-year CTE electives aligned to the automotive pathway.">${esc(this.state.plan.courses_of_study || '')}</textarea>
    `;

    const text = host.querySelector('#tpCoursesText');
    text.addEventListener('input', () => {
      this.state.plan.courses_of_study = text.value;
      this._scheduleSave();
    });

    const insert = host.querySelector('#tpCoursesInsert');
    if (insert) insert.addEventListener('click', () => {
      const goalClause = (ta && ta.postSecondaryGoal)
        ? ` in support of the postsecondary goal of ${ta.postSecondaryGoal.toLowerCase()}`
        : '';
      const starter = `${s.first_name} is currently enrolled in ${courses.join(', ')}. The course of study continues this sequence${goalClause}, with electives selected to match ${s.first_name}'s interests and postsecondary plans.`;
      text.value = text.value.trim() ? text.value + '\n\n' + starter : starter;
      this.state.plan.courses_of_study = text.value;
      this._scheduleSave();
    });
  },

  _renderAgencies() {
    const host = document.getElementById('tp-agencies');
    const esc = window.aceUtils.escapeHtml;
    const plan = this.state.plan;
    const chosen = new Set(plan.agencies || []);
    const custom = (plan.agencies || []).filter(v => !this.AGENCIES.includes(v));
    const all = this.AGENCIES.concat(custom);

    host.innerHTML = `
      <h2 class="iep-section-title">Agency Linkages</h2>
      <p class="iep-section-hint muted">Outside agencies likely to provide or pay for transition services. Select any that apply, or record that none are needed.</p>
      <div class="svc-chipgrid">
        ${all.map(v => `
          <button type="button" class="svc-chip ${chosen.has(v) ? 'selected' : ''}" data-value="${esc(v)}" ${plan.agency_not_needed ? 'disabled' : ''}>
            ${chosen.has(v) ? window.aceIcons.check(12) + ' ' : ''}${esc(v)}
          </button>`).join('')}
      </div>
      <div class="iep-chip-add" style="margin-top:8px;">
        <input type="text" class="iep-text iep-text-sm" id="tpAgencyCustom" placeholder="Add another agency" autocomplete="off" ${plan.agency_not_needed ? 'disabled' : ''} />
        <button type="button" class="iep-chip-add-btn" id="tpAgencyAdd" ${plan.agency_not_needed ? 'disabled' : ''}>Add</button>
      </div>
      ${chosen.size ? `
        <label class="iep-label" style="margin-top:10px;">Responsibilities / notes <span class="goalb-hint">who is doing what</span></label>
        <textarea id="tpAgencyNotes" class="iep-text iep-textarea" rows="3"
          placeholder="DRS: intake meeting scheduled for spring; counselor will attend the annual review.">${esc(plan.agency_notes || '')}</textarea>` : ''}
      <label class="tp-check" style="margin-top:10px;">
        <input type="checkbox" id="tpAgencyNone" ${plan.agency_not_needed ? 'checked' : ''} />
        <span>The team considered agency linkage; no outside agency involvement is needed at this time</span>
      </label>
    `;

    host.querySelectorAll('.svc-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (plan.agency_not_needed) return;
        const v = chip.dataset.value;
        const list = plan.agencies || (plan.agencies = []);
        const i = list.indexOf(v);
        if (i >= 0) list.splice(i, 1); else list.push(v);
        this._scheduleSave();
        this._renderAgencies();
        this._refreshChecklist();
      });
    });

    const input = host.querySelector('#tpAgencyCustom');
    const commit = () => {
      const v = input.value.trim();
      if (!v) return;
      const list = plan.agencies || (plan.agencies = []);
      if (!list.some(x => x.toLowerCase() === v.toLowerCase())) list.push(v);
      input.value = '';
      this._scheduleSave();
      this._renderAgencies();
      this._refreshChecklist();
    };
    host.querySelector('#tpAgencyAdd').addEventListener('click', commit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });

    const notes = host.querySelector('#tpAgencyNotes');
    if (notes) notes.addEventListener('input', () => {
      plan.agency_notes = notes.value;
      this._scheduleSave();
    });

    host.querySelector('#tpAgencyNone').addEventListener('change', (e) => {
      plan.agency_not_needed = e.target.checked;
      if (e.target.checked) { plan.agencies = []; plan.agency_notes = ''; }
      this._scheduleSave();
      this._renderAgencies();
      this._refreshChecklist();
    });
  },

  _renderMeeting() {
    const host = document.getElementById('tp-meeting');
    const plan = this.state.plan;
    host.innerHTML = `
      <h2 class="iep-section-title">Meeting Participation</h2>
      <label class="tp-check">
        <input type="checkbox" id="tpStudentInvited" ${plan.student_invited ? 'checked' : ''} />
        <span>The student was (or will be) invited to the IEP meeting where transition is discussed</span>
      </label>
      <label class="tp-check">
        <input type="checkbox" id="tpAgencyInvited" ${plan.agency_invited ? 'checked' : ''} />
        <span>Where an agency is likely to provide or pay for services, a representative was invited with parent/student consent</span>
      </label>
    `;
    host.querySelector('#tpStudentInvited').addEventListener('change', (e) => {
      plan.student_invited = e.target.checked; this._scheduleSave();
    });
    host.querySelector('#tpAgencyInvited').addEventListener('change', (e) => {
      plan.agency_invited = e.target.checked; this._scheduleSave();
    });
  },

  // ---- Indicator 13 checklist -------------------------------------------
  _checklistItems() {
    const plan = this.state.plan;
    const goals = this.state.goals;
    const tGoals = (area) => this._transitionGoals(area);
    const svc = (area) => (plan.services[area] || []).length > 0;
    const anyIl = tGoals('independent_living').length > 0;
    const annualActive = goals.some(g => g.goal_type === 'annual' && g.status === 'active');
    const yearAgo = new Date(); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const transitionGoalsAll = goals.filter(g => g.goal_type === 'transition');
    const updatedAnnually = transitionGoalsAll.length > 0 &&
      transitionGoalsAll.every(g => new Date(g.updated_at || g.created_at) >= yearAgo);

    const areasInPlay = ['education_training', 'employment'].concat(anyIl ? ['independent_living'] : []);

    return [
      { ok: tGoals('education_training').length > 0,
        label: 'Measurable postsecondary goal: education / training' },
      { ok: tGoals('employment').length > 0,
        label: 'Measurable postsecondary goal: employment' },
      { ok: anyIl || !!plan.il_considered,
        label: 'Independent living: goal in place, or considered and documented as not needed' },
      { ok: updatedAnnually,
        label: 'Postsecondary goals reviewed within the last year' },
      { ok: !!this.state.ta1,
        label: 'Goals based on an age-appropriate transition assessment' },
      { ok: areasInPlay.every(svc),
        label: 'Transition services identified for each goal area' },
      { ok: !!(plan.courses_of_study || '').trim(),
        label: 'Courses of study documented' },
      { ok: annualActive,
        label: 'Annual IEP goal(s) in place supporting the transition service needs' },
      { ok: !!plan.student_invited,
        label: 'Student invited to the IEP meeting' },
      { ok: (plan.agencies || []).length > 0 ? !!plan.agency_invited : (!!plan.agency_not_needed || !!plan.agency_invited),
        label: 'Agency involvement addressed (invited with consent, or documented as not needed)' }
    ];
  },

  _refreshChecklist() {
    const host = document.getElementById('tp-checklist');
    if (!host) return;
    const items = this._checklistItems();
    const done = items.filter(i => i.ok).length;
    host.innerHTML = `
      <h2 class="iep-section-title">Indicator 13 Checklist</h2>
      <p class="iep-section-hint muted">${done} of ${items.length} elements in place. This updates live as you work — it is guidance, not a substitute for team judgment.</p>
      <div class="tp-checklist">
        ${items.map(i => `
          <div class="tp-checklist-row ${i.ok ? 'ok' : 'missing'}">
            <span class="tp-checklist-icon">${i.ok ? window.aceIcons.check(14) : window.aceIcons.x(14)}</span>
            <span>${i.label}</span>
          </div>`).join('')}
      </div>
    `;
  },

  // ---- copy-out output ---------------------------------------------------
  _outputSections() {
    const s = this.state.student;
    const plan = this.state.plan;
    const esc = (t) => t; // plain text output
    const first = s.first_name;

    const goalsText = () => {
      const lines = [];
      this.AREAS.forEach(a => {
        const goals = this._transitionGoals(a.id);
        if (goals.length) {
          lines.push(`${a.label.toUpperCase()}:`);
          goals.forEach(g => lines.push(g.goal_text));
          lines.push('');
        } else if (a.id === 'independent_living' && plan.il_considered) {
          lines.push('INDEPENDENT LIVING:');
          lines.push(`The IEP team considered independent living skills and determined that a measurable postsecondary goal in this area is not needed at this time.`);
          lines.push('');
        }
      });
      return lines.join('\n').trim();
    };

    const servicesText = () => {
      const lines = [];
      this.AREAS.forEach(a => {
        const list = plan.services[a.id] || [];
        if (!list.length) return;
        lines.push(`${a.label.toUpperCase()}:`);
        list.forEach(v => lines.push(`•  ${v}`));
        lines.push('');
      });
      return lines.join('\n').trim();
    };

    const agenciesText = () => {
      if (plan.agency_not_needed) {
        return `The IEP team considered linkage with outside agencies and determined that no outside agency involvement is needed at this time. This will be revisited at each annual review.`;
      }
      const list = plan.agencies || [];
      if (!list.length) return '';
      const lines = list.map(v => `•  ${v}`);
      if ((plan.agency_notes || '').trim()) {
        lines.push('');
        lines.push(plan.agency_notes.trim());
      }
      return lines.join('\n');
    };

    return [
      { label: 'Postsecondary Goals', text: goalsText() },
      { label: 'Transition Services', text: servicesText() },
      { label: 'Courses of Study', text: esc((plan.courses_of_study || '').trim()) },
      { label: 'Agency Linkages', text: agenciesText() }
    ];
  },

  _renderOutput() {
    const host = document.getElementById('tp-output');
    if (!host) return;
    const esc = window.aceUtils.escapeHtml;
    const sections = this._outputSections();

    host.innerHTML = `
      <h2 class="iep-section-title">Copy into Embrace</h2>
      <p class="iep-section-hint muted">Labeled sections matching the transition pages in Embrace. Edit freely — Copy takes the current text.</p>
      ${sections.map((sct, i) => `
        <div class="iep-output-block">
          <div class="iep-output-head">
            <label class="iep-label">${esc(sct.label)}</label>
            <button type="button" class="iep-output-copy btn-secondary" data-idx="${i}" ${sct.text ? '' : 'disabled'}>Copy</button>
          </div>
          <textarea class="iep-text iep-textarea tp-out" data-idx="${i}" rows="${Math.max(3, Math.min(10, (sct.text.match(/\n/g) || []).length + 2))}"
            placeholder="Nothing here yet — complete the section above.">${esc(sct.text)}</textarea>
        </div>`).join('')}
      <div class="iep-generate-actions" style="margin-top:8px;">
        <button type="button" class="btn-secondary" id="tpOutputRefresh">${window.aceIcons.rotateCcw(13)} Refresh from plan</button>
      </div>
    `;

    host.querySelectorAll('.iep-output-copy').forEach(b => {
      b.addEventListener('click', async () => {
        const area = host.querySelector(`.tp-out[data-idx="${b.dataset.idx}"]`);
        if (!area) return;
        try { await navigator.clipboard.writeText(area.value); }
        catch (e) { area.select(); try { document.execCommand('copy'); } catch (_) {} }
        window.aceToast?.success(sections[Number(b.dataset.idx)].label + ' copied');
      });
    });
    host.querySelector('#tpOutputRefresh').addEventListener('click', () => this._renderOutput());
  }
};

window.aceTransitionPlan = aceTransitionPlan;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('transitionPlanHost')) {
    window.aceTransitionPlan.init();
  }
});
