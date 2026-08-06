// =============================================================
// Ace Manager — IEP Goal Builder
// =============================================================
// A goal is STRUCTURED, not prose: condition, observable behavior, criterion
// (metric / target / trials / timeframe as data), measurement method, baseline,
// and three benchmarks each with their own faded condition and escalating
// target. The prose sentence is assembled from the parts, so progress charts
// ride on criterion.target with nothing to re-parse.
//
// The workflow is four steps, because writing a defensible annual goal is four
// decisions and presenting them as one long form is how the last three get
// skipped:
//
//   1. Skill        what is being taught, under what conditions
//   2. Criterion    how good is good enough, measured how
//   3. Benchmarks   the three rungs between here and there
//   4. Monitoring   how the number actually gets collected
//
// The measurability gate is enforced per step and in total: Save stays disabled
// until every required component is present and the behavior leads with a verb
// somebody could watch happen. A rushed goal cannot come out vague.
//
// Two grammars:
//   annual      — "Given X, NAME will …"          (condition-first)
//   transition  — "After high school, NAME will …" (Indicator 13 measurable
//                 postsecondary goal; area = education/training, employment or
//                 independent living)

const aceGoalBuilder = {

  DOMAINS: [
    'Reading', 'Written Language', 'Math', 'Communication',
    'Social/Emotional', 'Behavior', 'Executive Functioning',
    'Independent Living', 'Vocational', 'Self-Advocacy', 'Motor',
    'Study & Test Skills'
  ],

  TRANSITION_AREAS: [
    { id: 'education_training', label: 'Education / Training' },
    { id: 'employment',         label: 'Employment' },
    { id: 'independent_living', label: 'Independent Living' }
  ],

  CONDITION_STARTERS: [
    'Given a grade-level text',
    'Given a writing prompt and a graphic organizer',
    'Given a multi-step math problem',
    'Given a real-world math scenario',
    'Given a structured social situation',
    'During unstructured or transition times',
    'Given a self-monitoring checklist',
    'Given a weekly planner and teacher check-in',
    'Given direct instruction and guided practice',
    'Given a job-related task with a visual task list'
  ],

  MEASUREMENT_METHODS: [
    'curriculum-based measurement probes',
    'teacher-charted data',
    'work samples scored with a rubric',
    'a scoring rubric',
    'an observation log',
    'a task analysis checklist',
    'exit tickets',
    'a self-monitoring checklist',
    'assignment completion records',
    'attendance and participation records',
    'a language sample scored with a rubric',
    'transition portfolio evidence'
  ],

  STEPS: [
    { id: 'skill',      label: 'Skill' },
    { id: 'criterion',  label: 'Criterion' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'monitoring', label: 'Monitoring' }
  ],

  get MODEL() { return window.aceGoalModel; },
  // Kept for callers that still read the old shape (the bank browser preview).
  get METRICS() { return window.aceGoalModel.METRICS; },
  get TIMEFRAMES() { return window.aceGoalModel.TIMEFRAMES; },
  get VAGUE_VERBS() { return window.aceGoalModel.VAGUE_VERBS; },

  // Open the builder. `existing` = goal row to edit, or null.
  // `seed` = prefill from a suggestion chip or a bank entry; prefills only,
  // never auto-saves.
  open(student, existing = null, seed = null) {
    const esc = window.aceUtils.escapeHtml;
    const M = this.MODEL;
    const g = existing || {};
    const s = seed || {};
    const crit = g.criterion || s.criterion || {};
    const name = `${student.first_name} ${student.last_initial}.`;
    const goalType = g.goal_type || s.goal_type || 'annual';

    // Benchmarks: from the saved row, else from the bank seed, else three empty
    // rungs so the ladder is always visible rather than something to discover.
    const seeded = (Array.isArray(g.benchmarks) && g.benchmarks.length ? g.benchmarks
      : Array.isArray(s.benchmarks) ? s.benchmarks : []);
    const benchmarks = [0, 1, 2].map(i => {
      const b = seeded[i] || {};
      return {
        behavior: String(b.behavior || '').replace(/\bNAME\b/g, student.first_name),
        condition: b.condition || '',
        target: (b.criterion && b.criterion.target != null) ? b.criterion.target : ''
      };
    });

    const opt = (list, sel) => list.map(v =>
      `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

    const state = {
      step: 0,
      fade: g.fade || s.fade || 'academic',
      probe_pool: g.probe_pool || s.probe_pool || null,
      gen_opts: (g.probe_plan && g.probe_plan.gen_opts) || s.gen_opts || null,
      bank_id: g.bank_id || s.bank_id || null,
      skill: g.skill || s.skill || '',
      grade_band: g.grade_band || s.grade_band || null,
      teaching_note: g.teaching_note || s.teaching_note || ''
    };

    const bodyHTML = `
      <div class="goalb" data-type="${esc(goalType)}">

        <div class="goalb-type-row" role="tablist">
          <button type="button" class="goalb-type ${goalType === 'annual' ? 'selected' : ''}" data-type="annual">Annual goal</button>
          <button type="button" class="goalb-type ${goalType === 'transition' ? 'selected' : ''}" data-type="transition">Postsecondary (transition)</button>
        </div>

        <ol class="goalb-rail" id="goalRail">
          ${this.STEPS.map((st, i) => `
            <li class="goalb-rail-step ${i === 0 ? 'current' : ''}" data-step="${i}">
              <span class="goalb-rail-dot">${i + 1}</span><span class="goalb-rail-label">${esc(st.label)}</span>
            </li>`).join('')}
        </ol>

        ${state.skill ? `<div class="goalb-source">${window.aceIcons.check(12)} From the goal bank: <strong>${esc(state.skill)}</strong>${state.teaching_note ? `<div class="goalb-source-note">${esc(state.teaching_note)}</div>` : ''}</div>` : ''}

        <!-- STEP 1 — SKILL -->
        <section class="goalb-step" data-step="0">
          <div class="goalb-annual">
            <label class="iep-label">Domain</label>
            <select id="goalDomain">${opt(this.DOMAINS, g.domain || s.domain || this.DOMAINS[0])}</select>

            <label class="iep-label">Condition <span class="goalb-hint">the setup — materials, support, setting</span></label>
            <input type="text" id="goalCondition" list="goalConditionList" placeholder="Given a grade-level text" value="${esc(g.condition || s.condition || '')}" autocomplete="off" />
            <datalist id="goalConditionList">${this.CONDITION_STARTERS.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
          </div>

          <div class="goalb-transition">
            <label class="iep-label">Postsecondary area (Indicator 13)</label>
            <select id="goalTransitionArea">${this.TRANSITION_AREAS.map(a =>
              `<option value="${a.id}" ${(g.transition_area || s.transition_area) === a.id ? 'selected' : ''}>${a.label}</option>`).join('')}</select>
            <p class="goalb-hint" style="margin:6px 0 0;">Grammar is fixed: “After high school, ${esc(name)} will …”. State an outcome someone could verify — enroll, obtain, live, manage.</p>
          </div>

          <label class="iep-label goalb-behavior-label">Observable behavior <span class="goalb-hint">starts with a verb you could watch happen</span></label>
          <textarea id="goalBehavior" rows="2" placeholder="read a passage aloud and answer literal and inferential questions">${esc(g.behavior || s.behavior || '')}</textarea>
          <div id="goalVerbWarning" class="goalb-verb-warning" style="display:none;"></div>
          ${(g.source_need || s.source_need) ? `<p class="goalb-hint" style="margin-top:8px;">Written from: ${esc(g.source_need || s.source_need)}</p>` : ''}
        </section>

        <!-- STEP 2 — CRITERION -->
        <section class="goalb-step" data-step="1" hidden>
          <label class="iep-label">Criterion <span class="goalb-hint">stored as data — progress graphs use it directly</span></label>
          <div class="goalb-crit-row">
            <input type="number" id="goalTarget" placeholder="80" step="any" value="${crit.target ?? ''}" />
            <select id="goalMetric">${M.METRICS.map(m =>
              `<option value="${m.id}" ${(crit.metric || 'accuracy') === m.id ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select>
          </div>
          <div id="goalDirectionNote" class="goalb-direction-note" hidden></div>
          <div class="goalb-crit-row">
            <span class="goalb-crit-label">in</span>
            <input type="number" id="goalTrialsX" min="1" max="99" placeholder="4" value="${crit.trials_x ?? ''}" />
            <span class="goalb-crit-label">of</span>
            <input type="number" id="goalTrialsY" min="1" max="99" placeholder="5" value="${crit.trials_y ?? ''}" />
            <span class="goalb-crit-label">trials <span class="goalb-hint">(optional)</span></span>
          </div>
          <div class="goalb-crit-row">
            <select id="goalTimeframe">${opt(M.TIMEFRAMES, crit.timeframe || M.TIMEFRAMES[0])}</select>
          </div>

          <label class="iep-label">As measured by</label>
          <select id="goalMethod">${opt(this.MEASUREMENT_METHODS, g.measurement_method || s.measurement_method || this.MEASUREMENT_METHODS[0])}</select>

          <label class="iep-label">Baseline <span class="goalb-hint">current performance, same metric</span></label>
          <input type="text" id="goalBaseline" placeholder="${esc(s.baseline_prompt || s.baseline_placeholder || 'Currently 55% accuracy across 3 probes')}" value="${esc(g.baseline || '')}" />
          ${(s.il_standard || g.il_standard) ? `<p class="goalb-hint" style="margin-top:10px;">Illinois Learning Standards: ${esc(g.il_standard || s.il_standard)}</p>` : ''}
        </section>

        <!-- STEP 3 — BENCHMARKS -->
        <section class="goalb-step" data-step="2" hidden>
          <p class="goalb-step-lead">Three rungs between the baseline and the goal, one per progress-reporting period. Leave a target blank and it fills from the ladder — roughly three quarters of the way, most of the way, then the goal itself.</p>
          <div id="goalBenchmarks" class="goalb-bm-list"></div>
          <button type="button" class="goal-mini-btn" id="goalBmFill">${window.aceIcons.rotateCcw(11)} Refill targets from the ladder</button>
          <div id="goalBmWarning" class="goalb-verb-warning" style="display:none;"></div>
        </section>

        <!-- STEP 4 — MONITORING -->
        <section class="goalb-step" data-step="3" hidden>
          <div id="goalMonitorPlan"></div>
          <label class="iep-label" style="margin-top:14px;">Progress monitoring pool</label>
          <select id="goalProbePool"></select>
          <p class="goalb-hint" id="goalPoolHint" style="margin-top:8px;"></p>
          <div id="goalSkillPicker"></div>
        </section>

        <div class="goalb-nav">
          <button type="button" class="btn-secondary" id="goalPrev" hidden>Back</button>
          <button type="button" class="btn-secondary" id="goalNext">Next: Criterion</button>
        </div>

        <div class="goalb-meter" id="goalMeter"></div>

        <label class="iep-label" style="margin-top:14px;">Goal preview</label>
        <div class="goalb-preview" id="goalPreview"></div>
        <div id="goalBmPreview" class="goalb-bm-preview"></div>
        <div id="goalError" class="hard-delete-error"></div>
      </div>
    `;

    return window.aceModal.openDrawer({
      title: existing ? 'Edit goal' : `New goal for ${name}`,
      bodyHTML,
      saveLabel: existing ? 'Save goal' : 'Add goal',
      afterRender: (body) => this._wire(body, student, benchmarks, state),
      onSave: async (body) => {
        const parts = this._collect(body, state);
        const errEl = body.querySelector('#goalError');
        errEl.textContent = '';
        const missing = this._missing(parts);
        if (missing.length) {
          errEl.textContent = 'Not measurable yet — missing: ' + missing.join(', ') + '.';
          const firstBad = this._stepOf(missing[0]);
          if (firstBad != null) this._goStep(body, firstBad, student, state);
          return false;
        }
        const isTransition = parts.goal_type === 'transition';
        const row = {
          student_id: student.id,
          goal_type: parts.goal_type,
          domain: isTransition
            ? (this.TRANSITION_AREAS.find(a => a.id === parts.transition_area) || {}).label || 'Transition'
            : parts.domain,
          transition_area: isTransition ? parts.transition_area : null,
          condition: parts.condition,
          behavior: parts.behavior,
          criterion: parts.criterion,
          measurement_method: parts.measurement_method,
          baseline: parts.baseline,
          goal_text: M.assemble(parts, name),
          source_need: g.source_need || s.source_need || null,
          benchmarks: parts.benchmarks,
          // `objectives` stays written because the IEP document generator and
          // every previously saved goal read it. Benchmarks are the structured
          // form; objectives are the prose the paperwork still expects.
          objectives: parts.benchmarks.map(b => M.benchmarkText(b, name)),
          bank_id: state.bank_id,
          il_standard: g.il_standard || s.il_standard || null,
          probe_pool: isTransition ? null : (parts.probe_pool || null),
          probe_plan: isTransition ? {} : (M.probePlan(parts.probe_pool, state.gen_opts || null) || {}),
          skill: state.skill || null,
          grade_band: state.grade_band || null,
          teaching_note: state.teaching_note || null,
          updated_at: new Date().toISOString()
        };
        let resp;
        if (existing) {
          resp = await window.aceSupabase.from('iep_goals').update(row).eq('id', existing.id).select().single();
        } else {
          resp = await window.aceSupabase.from('iep_goals').insert(row).select().single();
        }
        if (resp.error) {
          console.error('Goal save failed:', resp.error);
          errEl.textContent = resp.error.message || 'Could not save the goal.';
          return false;
        }
        return resp.data;
      }
    });
  },

  // Which step a missing component lives on, so a failed save lands the case
  // manager on the field that is actually blocking them.
  _stepOf(label) {
    if (/condition|behavior|observable verb|postsecondary area|outcome/.test(label)) return 0;
    if (/criterion|measurement/.test(label)) return 1;
    if (/benchmark/.test(label)) return 2;
    return null;
  },

  _wire(body, student, benchmarks, state) {
    const M = this.MODEL;
    const esc = window.aceUtils.escapeHtml;
    const name = `${student.first_name} ${student.last_initial}.`;

    // ---- benchmark rows ----------------------------------------------------
    const bmHost = body.querySelector('#goalBenchmarks');
    const paintBenchmarks = () => {
      bmHost.innerHTML = benchmarks.map((b, i) => {
        const w = M.WINDOWS[i];
        return `
          <div class="goalb-bm" data-i="${i}">
            <div class="goalb-bm-head">
              <span class="goalb-bm-num">${i + 1}</span>
              <span class="goalb-bm-window">${esc(w.short)} · ${esc(w.report)}</span>
            </div>
            <textarea class="goalb-bm-behavior" rows="2" placeholder="${esc(student.first_name)} will…">${esc(b.behavior)}</textarea>
            <div class="goalb-bm-foot">
              <label class="goalb-bm-target-label">Target</label>
              <input type="number" step="any" class="goalb-bm-target" value="${b.target === '' ? '' : esc(String(b.target))}" placeholder="—" />
              <span class="goalb-bm-unit"></span>
              <span class="goalb-bm-scaffold"></span>
            </div>
          </div>`;
      }).join('');
      bmHost.querySelectorAll('.goalb-bm').forEach(row => {
        const i = Number(row.dataset.i);
        row.querySelector('.goalb-bm-behavior').addEventListener('input', e => {
          benchmarks[i].behavior = e.target.value; refresh();
        });
        row.querySelector('.goalb-bm-target').addEventListener('input', e => {
          benchmarks[i].target = e.target.value; refresh();
        });
      });
    };
    paintBenchmarks();

    body.querySelector('#goalBmFill').addEventListener('click', () => {
      const parts = this._collect(body, state);
      const c = parts.criterion;
      if (c.target == null || isNaN(c.target)) {
        body.querySelector('#goalBmWarning').style.display = '';
        body.querySelector('#goalBmWarning').textContent = 'Set the goal target on the Criterion step first — the ladder is calculated from it.';
        return;
      }
      benchmarks.forEach((b, i) => { b.target = M.ladderTarget(c.metric, c.target, i, c.direction); });
      paintBenchmarks();
      refresh();
    });

    // ---- probe pool options ------------------------------------------------
    const poolSel = body.querySelector('#goalProbePool');
    const buildPoolOptions = () => {
      const pools = (window.ACE_PROBE_BANK && window.ACE_PROBE_BANK.pools) || {};
      const keys = Object.keys(pools).sort((a, b) => pools[a].label.localeCompare(pools[b].label));
      poolSel.innerHTML = '<option value="">No automated probe — log data by hand</option>' +
        keys.map(k => `<option value="${esc(k)}" ${state.probe_pool === k ? 'selected' : ''}>${esc(pools[k].label)}</option>`).join('');
    };
    buildPoolOptions();
    poolSel.addEventListener('change', () => {
      // A variant name belongs to one generator; carrying it across pools would
      // silently resolve to whatever that generator lists first.
      if (state.probe_pool !== poolSel.value) state.gen_opts = null;
      state.probe_pool = poolSel.value || null;
      refresh();
    });

    // ---- step navigation ---------------------------------------------------
    body.querySelector('#goalPrev').addEventListener('click', () => this._goStep(body, state.step - 1, student, state));
    body.querySelector('#goalNext').addEventListener('click', () => this._goStep(body, state.step + 1, student, state));
    body.querySelectorAll('.goalb-rail-step').forEach(li => {
      li.addEventListener('click', () => this._goStep(body, Number(li.dataset.step), student, state));
    });

    // ---- type toggle -------------------------------------------------------
    body.querySelectorAll('.goalb-type').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.goalb-type').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        body.querySelector('.goalb').dataset.type = btn.dataset.type;
        // A postsecondary goal is a single verifiable outcome — it has no
        // criterion, no benchmark ladder and nothing to probe, so those steps
        // disappear rather than sitting there greyed out.
        this._goStep(body, 0, student, state);
      });
    });

    const refresh = () => {
      const parts = this._collect(body, state);
      this._renderMeter(body, parts);
      body.querySelector('#goalPreview').textContent = M.assemble(parts, name) || '—';

      const warnEl = body.querySelector('#goalVerbWarning');
      const vague = M.vagueVerb(parts.behavior);
      if (vague) {
        warnEl.style.display = '';
        warnEl.textContent = `“${vague}” isn't observable — lead with a verb you could watch happen (read, write, solve, initiate, complete, ask…).`;
      } else {
        warnEl.style.display = 'none';
      }

      // Direction note: a reduction goal is met by going DOWN, and saying so
      // out loud is what stops a case manager typing 90 for a behaviour count.
      const dirNote = body.querySelector('#goalDirectionNote');
      const m = M.metric(parts.criterion.metric);
      if (m && m.direction === 'decrease') {
        dirNote.hidden = false;
        dirNote.textContent = `Lower is better for ${m.label}. The chart treats the target as a ceiling and “at target” means at or below it.`;
      } else { dirNote.hidden = true; }

      // Benchmark unit labels + scaffold preview
      const unit = parts.criterion.unit || '';
      const ladder = M.SCAFFOLDS[state.fade] || M.SCAFFOLDS.academic;
      bmHost.querySelectorAll('.goalb-bm').forEach(row => {
        const i = Number(row.dataset.i);
        row.querySelector('.goalb-bm-unit').textContent = unit;
        row.querySelector('.goalb-bm-scaffold').textContent = ladder[i] ? '· ' + ladder[i] : '';
      });

      // Assembled benchmark sentences, so the ladder is readable as prose
      const bmPrev = body.querySelector('#goalBmPreview');
      if (parts.goal_type === 'transition' || !parts.benchmarks.length) { bmPrev.innerHTML = ''; }
      else {
        bmPrev.innerHTML = parts.benchmarks.map(b =>
          `<div class="goalb-bm-preview-row"><span class="goalb-bm-preview-num">${b.index}</span>${esc(M.benchmarkText(b, name))}</div>`).join('');
      }

      this._renderMonitoring(body, parts, state);
      this._setSaveEnabled(body, this._missing(parts).length === 0);
    };

    body.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
    });

    this._goStep(body, 0, student, state);
    this._refresh = refresh;
    refresh();
  },

  _goStep(body, idx, student, state) {
    const isTransition = body.querySelector('.goalb').dataset.type === 'transition';
    const last = isTransition ? 0 : this.STEPS.length - 1;
    idx = Math.max(0, Math.min(last, idx));
    state.step = idx;

    body.querySelectorAll('.goalb-step').forEach(sec => {
      sec.hidden = Number(sec.dataset.step) !== idx;
    });
    body.querySelectorAll('.goalb-rail-step').forEach((li, i) => {
      li.classList.toggle('current', i === idx);
      li.classList.toggle('done', i < idx);
      li.hidden = isTransition && i > 0;
    });
    body.querySelector('#goalRail').hidden = isTransition;

    const prev = body.querySelector('#goalPrev');
    const next = body.querySelector('#goalNext');
    prev.hidden = idx === 0;
    next.hidden = idx >= last;
    if (!next.hidden) next.textContent = 'Next: ' + this.STEPS[idx + 1].label;
    body.querySelector('.goalb-nav').hidden = isTransition;
    if (this._refresh) this._refresh();
  },

  // The drawer's own Save button — disabled until the goal is measurable, so
  // the gate is visible before the case manager has typed everything.
  _setSaveEnabled(body, ok) {
    const drawer = body.closest('.ace-drawer');
    if (!drawer) return;
    const btn = drawer.querySelector('[data-action="save"]');
    if (!btn) return;
    btn.disabled = !ok;
    btn.classList.toggle('is-blocked', !ok);
    btn.title = ok ? '' : 'Complete the measurability checklist first';
  },

  _renderMonitoring(body, parts, state) {
    const host = body.querySelector('#goalMonitorPlan');
    const hint = body.querySelector('#goalPoolHint');
    if (!host) return;
    const esc = window.aceUtils.escapeHtml;
    if (parts.goal_type === 'transition') { host.innerHTML = ''; hint.textContent = ''; return; }

    const plan = this.MODEL.probePlan(parts.probe_pool);
    const pool = (window.ACE_PROBE_BANK && window.ACE_PROBE_BANK.pools && window.ACE_PROBE_BANK.pools[parts.probe_pool]) || null;
    if (!parts.probe_pool || !pool) {
      host.innerHTML = `<div class="goalb-plan goalb-plan-manual">
        <div class="goalb-plan-title">No automated probe</div>
        <p>Progress on this goal will be logged by hand. That is a legitimate choice — but if a pool below fits, the app will generate the probe, score it and chart it for you.</p>
      </div>`;
      hint.textContent = '';
      return;
    }

    const kindLabel = { academic: 'Student completes a link', self_report: 'Student rates themselves on a link', observation: 'You score it while observing' }[plan.kind] || plan.kind;
    host.innerHTML = `
      <div class="goalb-plan">
        <div class="goalb-plan-title">${esc(plan.label || pool.label)}</div>
        <dl class="goalb-plan-grid">
          <dt>How</dt><dd>${esc(kindLabel)}</dd>
          <dt>Cadence</dt><dd>${esc(plan.frequency)}</dd>
          <dt>Items</dt><dd>${plan.items_per_probe} per probe${pool.gen ? ' · freshly generated each cycle' : ''}${pool.timed ? ` · timed ${pool.timed.seconds}s` : ''}</dd>
          <dt>Scored by</dt><dd>${esc(plan.scored_by)}</dd>
        </dl>
        <div class="goalb-plan-phases">
          ${plan.phases.map(p => `<span class="goalb-plan-phase"><strong>Weeks ${esc(p.weeks)}</strong> ${p.mix.join(' / ')}</span>`).join('')}
          <span class="goalb-plan-phase-key">items per benchmark 1 / 2 / 3</span>
        </div>
        <p class="goalb-plan-admin">${esc(plan.administration)}</p>
      </div>`;
    hint.textContent = pool.gen
      ? 'Generated pool: every cycle draws a new equivalent form, so a rising line means the skill grew rather than the items being memorised.'
      : 'Curated pool: items are drawn without repeating until the pool is exhausted.';

    this._renderSkillPicker(body, pool, state);
  },

  // A generated pool serves many skills — ma-geometry alone covers rectangles,
  // circles, volume, angles and the Pythagorean theorem. A goal picked from the
  // bank already names its skill; a hand-written one has to say, or the probe
  // would draw from the wrong part of the strand.
  //
  // The options are labelled with a real item the variant produces, so the list
  // explains itself instead of asking the case manager to decode a key name.
  _renderSkillPicker(body, pool, state) {
    const esc = window.aceUtils.escapeHtml;
    const host = body.querySelector('#goalSkillPicker');
    if (!host) return;
    const gen = pool && pool.gen && window.ACE_PROBE_GENERATORS && window.ACE_PROBE_GENERATORS[pool.gen];
    if (!gen || !gen.VARIANTS || gen.VARIANTS.length < 2) { host.innerHTML = ''; return; }

    const current = (state.gen_opts && state.gen_opts.v) || '';
    const sample = (v) => {
      try {
        let a = 12345;
        const r = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const it = gen(2, r, { v });
        const p = String(it.prompt).replace(/\s+/g, ' ').trim();
        return p.length > 64 ? p.slice(0, 61) + '…' : p;
      } catch (e) { return ''; }
    };

    host.innerHTML = `
      <label class="iep-label" style="margin-top:14px;">Skill measured
        <span class="goalb-hint">which part of this pool the probe draws from</span></label>
      <select id="goalGenVariant">
        <option value="">Choose the skill…</option>
        ${gen.VARIANTS.map(v =>
          `<option value="${esc(v)}" ${v === current ? 'selected' : ''}>${esc(sample(v) || v)}</option>`).join('')}
      </select>
      ${current ? '' : '<p class="goalb-verb-warning" style="display:block;">Pick the skill, or the probe will sample the whole strand instead of what this goal is about.</p>'}`;

    const sel = host.querySelector('#goalGenVariant');
    sel.addEventListener('change', () => {
      state.gen_opts = sel.value ? { v: sel.value } : null;
      if (this._refresh) this._refresh();
    });
  },

  _collect(body, state) {
    const M = this.MODEL;
    const v = id => { const el = body.querySelector('#' + id); return el ? el.value.trim() : ''; };
    const sel = body.querySelector('.goalb-type.selected');
    const goal_type = sel ? sel.dataset.type : 'annual';
    const isTransition = goal_type === 'transition';

    const metricId = v('goalMetric') || 'accuracy';
    const m = M.metric(metricId);
    const target = v('goalTarget');
    const tx = v('goalTrialsX') === '' ? null : Number(v('goalTrialsX'));
    const ty = v('goalTrialsY') === '' ? null : Number(v('goalTrialsY'));
    const criterion = isTransition ? {} : Object.assign(
      M.makeCriterion(metricId, target === '' ? null : Number(target), tx, ty, m.direction, v('goalTimeframe') || M.TIMEFRAME));

    const benchmarks = isTransition ? [] : Array.from(body.querySelectorAll('.goalb-bm')).map((row, i) => {
      const behavior = row.querySelector('.goalb-bm-behavior').value.trim();
      const raw = row.querySelector('.goalb-bm-target').value.trim();
      let t = raw === '' ? null : Number(raw);
      if (t == null && criterion.target != null && !isNaN(criterion.target)) {
        t = M.ladderTarget(metricId, criterion.target, i, criterion.direction);
      }
      const scaffold = (M.SCAFFOLDS[state.fade] || M.SCAFFOLDS.academic)[i] || '';
      const baseCond = v('goalCondition');
      return {
        index: i + 1,
        window: M.WINDOWS[i].short,
        condition: scaffold && baseCond ? baseCond + ', ' + scaffold : baseCond,
        behavior,
        criterion: M.makeCriterion(metricId, t, tx, ty, m.direction, null)
      };
    }).filter(b => b.behavior);

    return {
      goal_type,
      domain: v('goalDomain'),
      transition_area: v('goalTransitionArea'),
      condition: isTransition ? '' : v('goalCondition'),
      behavior: v('goalBehavior'),
      criterion,
      measurement_method: isTransition ? '' : v('goalMethod'),
      baseline: isTransition ? '' : v('goalBaseline'),
      benchmarks,
      probe_pool: isTransition ? null : (state.probe_pool || null)
    };
  },

  // The measurability gate: every named component present, the behavior verb
  // observable, and — new — a benchmark ladder that actually climbs.
  _missing(p) {
    const M = this.MODEL;
    const out = [];
    if (p.goal_type === 'transition') {
      if (!p.transition_area) out.push('postsecondary area');
      if (!p.behavior) out.push('outcome');
      else if (M.vagueVerb(p.behavior)) out.push('an observable verb');
      return out;
    }
    if (!p.condition) out.push('condition');
    if (!p.behavior) out.push('observable behavior');
    else if (M.vagueVerb(p.behavior)) out.push('an observable verb');
    if (p.criterion.target == null || isNaN(p.criterion.target)) out.push('criterion target');
    if (!p.measurement_method) out.push('measurement method');
    if (p.benchmarks.length < 3) out.push('three benchmarks');
    else {
      const sign = p.criterion.direction === 'decrease' ? -1 : 1;
      const t = p.benchmarks.map(b => b.criterion.target);
      if (t.some(x => x == null || isNaN(x))) out.push('a target on every benchmark');
      else if (sign * (t[1] - t[0]) < 0 || sign * (t[2] - t[1]) < 0) out.push('benchmark targets that climb toward the goal');
      else if (sign * (p.criterion.target - t[2]) < 0) out.push('a goal target at least as hard as benchmark 3');
    }
    return out;
  },

  _renderMeter(body, parts) {
    const M = this.MODEL;
    const meter = body.querySelector('#goalMeter');
    if (!meter) return;
    const okVerb = !!parts.behavior && !M.vagueVerb(parts.behavior);
    const missing = this._missing(parts);
    const bmOk = !missing.some(x => /benchmark/.test(x));
    const items = parts.goal_type === 'transition'
      ? [['Area', !!parts.transition_area], ['Observable outcome', okVerb]]
      : [
          ['Condition', !!parts.condition],
          ['Observable behavior', okVerb],
          ['Criterion', parts.criterion.target != null && !isNaN(parts.criterion.target)],
          ['Measurement', !!parts.measurement_method],
          ['Benchmark ladder', bmOk],
          ['Monitoring plan', !!parts.probe_pool]
        ];
    meter.innerHTML = items.map(([label, ok]) =>
      `<span class="goalb-meter-item ${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${label}</span>`).join('')
      + (parts.goal_type !== 'transition' && !parts.probe_pool
        ? '<span class="goalb-meter-note">A monitoring plan is optional — without one you log every data point by hand.</span>' : '');
  },

  // Delegated to the shared model so the bank preview, the builder preview and
  // the saved goal_text are produced by one function.
  assemble(p, student) {
    const name = typeof student === 'string' ? student : `${student.first_name} ${student.last_initial}.`;
    return this.MODEL.assemble(p, name);
  }
};

window.aceGoalBuilder = aceGoalBuilder;
