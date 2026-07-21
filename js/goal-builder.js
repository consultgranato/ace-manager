// =============================================================
// Ace Manager — IEP Goal Builder (structured, measurability-enforced)
// =============================================================
// A goal is stored as STRUCTURED PARTS — condition, observable behavior,
// criterion (metric/target/trials/timeframe as data, not prose), measurement
// method, baseline — and the prose sentence is assembled from them. The form
// won't save until every measurability component is present and the behavior
// verb is observable, so a rushed goal can't come out vague. Progress
// monitoring graphs ride directly on criterion.target with no re-parsing.
//
// Two grammars:
//   annual      — "By the next annual review, X will …"  (condition-first)
//   transition  — "After high school, X will …"          (Indicator 13
//                 measurable postsecondary goal; area = education/training,
//                 employment, or independent living)

const aceGoalBuilder = {

  DOMAINS: [
    'Reading', 'Written Language', 'Math', 'Communication',
    'Social/Emotional', 'Behavior', 'Executive Functioning',
    'Independent Living', 'Vocational'
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

  METRICS: [
    { id: 'accuracy',      label: '% accuracy',                     unit: '%'   },
    { id: 'opportunities', label: '% of observed opportunities',    unit: '%'   },
    { id: 'wcpm',          label: 'words correct per minute',       unit: 'wcpm'},
    { id: 'frequency',     label: 'occurrences per class period',   unit: '/period' },
    { id: 'duration',      label: 'consecutive minutes on task',    unit: 'min' },
    { id: 'rubric',        label: 'points on a 4-point rubric',     unit: 'pts' },
    { id: 'score',         label: 'raw score',                      unit: 'pts' }
  ],

  MEASUREMENT_METHODS: [
    'curriculum-based measurement probes',
    'teacher-charted data',
    'work samples',
    'a scoring rubric',
    'an observation log',
    'exit tickets',
    'a self-monitoring checklist',
    'attendance and participation records',
    'transition portfolio evidence'
  ],

  TIMEFRAMES: [
    'by the next annual review',
    'within 36 instructional weeks',
    'by the end of the semester'
  ],

  // Vague verbs that make a goal unmeasurable — the form flags them and the
  // measurability check refuses the behavior until an observable verb leads.
  VAGUE_VERBS: ['understand', 'know', 'learn', 'improve', 'be aware', 'appreciate', 'develop', 'work on', 'try', 'get better'],

  // Open the builder. `existing` = goal row to edit, or null.
  // `seed` = optional prefill from a suggestion chip: { goal_type, domain,
  // transition_area, behavior, source_need } — prefills only; never auto-saves.
  open(student, existing = null, seed = null) {
    const esc = window.aceUtils.escapeHtml;
    const g = existing || {};
    const s = seed || {};
    const crit = g.criterion || {};
    const name = `${student.first_name} ${student.last_initial}.`;
    const goalType = g.goal_type || s.goal_type || 'annual';

    const opt = (list, sel) => list.map(v =>
      `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(v)}</option>`).join('');

    const bodyHTML = `
      <div class="goalb">
        <div class="goalb-type-row" role="tablist">
          <button type="button" class="goalb-type ${goalType === 'annual' ? 'selected' : ''}" data-type="annual">Annual goal</button>
          <button type="button" class="goalb-type ${goalType === 'transition' ? 'selected' : ''}" data-type="transition">Postsecondary (transition)</button>
        </div>

        <div class="goalb-annual" ${goalType === 'transition' ? 'style="display:none;"' : ''}>
          <label class="iep-label">Domain</label>
          <select id="goalDomain">${opt(this.DOMAINS, g.domain || s.domain || this.DOMAINS[0])}</select>

          <label class="iep-label">Condition <span class="goalb-hint">the setup — materials, support, setting</span></label>
          <input type="text" id="goalCondition" list="goalConditionList" placeholder="Given a grade-level text" value="${esc(g.condition || '')}" autocomplete="off" />
          <datalist id="goalConditionList">${this.CONDITION_STARTERS.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
        </div>

        <div class="goalb-transition" ${goalType !== 'transition' ? 'style="display:none;"' : ''}>
          <label class="iep-label">Postsecondary area (Indicator 13)</label>
          <select id="goalTransitionArea">${this.TRANSITION_AREAS.map(a =>
            `<option value="${a.id}" ${(g.transition_area || s.transition_area) === a.id ? 'selected' : ''}>${a.label}</option>`).join('')}</select>
          <p class="goalb-hint" style="margin:6px 0 0;">Grammar is fixed: “After high school, ${esc(name.replace(/\.$/, ''))}. will …”. State an outcome someone could verify — enroll, obtain, live, manage.</p>
        </div>

        <label class="iep-label">${goalType === 'transition' ? 'Outcome' : 'Observable behavior'} <span class="goalb-hint">starts with a verb you could watch happen</span></label>
        <textarea id="goalBehavior" rows="2" placeholder="read a passage aloud and answer literal and inferential questions">${esc(g.behavior || s.behavior || '')}</textarea>
        <div id="goalVerbWarning" class="goalb-verb-warning" style="display:none;"></div>

        <div class="goalb-criterion" ${goalType === 'transition' ? 'style="display:none;"' : ''}>
          <label class="iep-label">Criterion <span class="goalb-hint">stored as data — progress graphs use it directly</span></label>
          <div class="goalb-crit-row">
            <input type="number" id="goalTarget" placeholder="80" step="any" value="${crit.target ?? ''}" />
            <select id="goalMetric">${this.METRICS.map(m =>
              `<option value="${m.id}" ${(crit.metric || 'accuracy') === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}</select>
          </div>
          <div class="goalb-crit-row">
            <span class="goalb-crit-label">in</span>
            <input type="number" id="goalTrialsX" min="1" max="99" placeholder="4" value="${crit.trials_x ?? ''}" />
            <span class="goalb-crit-label">of</span>
            <input type="number" id="goalTrialsY" min="1" max="99" placeholder="5" value="${crit.trials_y ?? ''}" />
            <span class="goalb-crit-label">trials <span class="goalb-hint">(optional)</span></span>
          </div>
          <div class="goalb-crit-row">
            <select id="goalTimeframe">${opt(this.TIMEFRAMES, crit.timeframe || this.TIMEFRAMES[0])}</select>
          </div>

          <label class="iep-label">As measured by</label>
          <select id="goalMethod">${opt(this.MEASUREMENT_METHODS, g.measurement_method || this.MEASUREMENT_METHODS[0])}</select>

          <label class="iep-label">Baseline <span class="goalb-hint">current performance, same metric</span></label>
          <input type="text" id="goalBaseline" placeholder="Currently 55% accuracy across 3 probes" value="${esc(g.baseline || '')}" />
        </div>

        <div class="goalb-meter" id="goalMeter"></div>

        <label class="iep-label" style="margin-top:14px;">Goal preview</label>
        <div class="goalb-preview" id="goalPreview"></div>
        <div id="goalError" class="hard-delete-error"></div>
      </div>
    `;

    return window.aceModal.openDrawer({
      title: existing ? 'Edit goal' : `New goal for ${name}`,
      bodyHTML,
      saveLabel: existing ? 'Save goal' : 'Add goal',
      afterRender: (body) => this._wire(body, student),
      onSave: async (body) => {
        const parts = this._collect(body);
        const errEl = body.querySelector('#goalError');
        errEl.textContent = '';
        const missing = this._missing(parts);
        if (missing.length) {
          errEl.textContent = 'Not measurable yet — missing: ' + missing.join(', ') + '.';
          return false;
        }
        const row = {
          student_id: student.id,
          goal_type: parts.goal_type,
          domain: parts.goal_type === 'transition'
            ? (this.TRANSITION_AREAS.find(a => a.id === parts.transition_area) || {}).label || 'Transition'
            : parts.domain,
          transition_area: parts.goal_type === 'transition' ? parts.transition_area : null,
          condition: parts.condition,
          behavior: parts.behavior,
          criterion: parts.criterion,
          measurement_method: parts.measurement_method,
          baseline: parts.baseline,
          goal_text: this.assemble(parts, student),
          source_need: g.source_need || s.source_need || null,
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

  _wire(body, student) {
    const refresh = () => {
      const parts = this._collect(body);
      this._renderMeter(body, parts);
      const prev = body.querySelector('#goalPreview');
      prev.textContent = this.assemble(parts, student) || '—';
      const warnEl = body.querySelector('#goalVerbWarning');
      const vague = this._vagueVerb(parts.behavior);
      if (vague) {
        warnEl.style.display = '';
        warnEl.textContent = `“${vague}” isn't observable — lead with a verb you could watch happen (read, write, solve, initiate, complete, ask…).`;
      } else {
        warnEl.style.display = 'none';
      }
    };

    body.querySelectorAll('.goalb-type').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.goalb-type').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const isTransition = btn.dataset.type === 'transition';
        body.querySelector('.goalb-annual').style.display = isTransition ? 'none' : '';
        body.querySelector('.goalb-transition').style.display = isTransition ? '' : 'none';
        body.querySelector('.goalb-criterion').style.display = isTransition ? 'none' : '';
        refresh();
      });
    });

    body.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', refresh);
      el.addEventListener('change', refresh);
    });
    refresh();
  },

  _collect(body) {
    const v = id => { const el = body.querySelector('#' + id); return el ? el.value.trim() : ''; };
    const sel = body.querySelector('.goalb-type.selected');
    const goal_type = sel ? sel.dataset.type : 'annual';
    const metricId = v('goalMetric') || 'accuracy';
    const metric = this.METRICS.find(m => m.id === metricId) || this.METRICS[0];
    const target = v('goalTarget');
    const criterion = goal_type === 'transition' ? {} : {
      metric: metric.id,
      metric_label: metric.label,
      unit: metric.unit,
      target: target === '' ? null : Number(target),
      trials_x: v('goalTrialsX') === '' ? null : Number(v('goalTrialsX')),
      trials_y: v('goalTrialsY') === '' ? null : Number(v('goalTrialsY')),
      timeframe: v('goalTimeframe') || this.TIMEFRAMES[0]
    };
    return {
      goal_type,
      domain: v('goalDomain'),
      transition_area: v('goalTransitionArea'),
      condition: v('goalCondition'),
      behavior: v('goalBehavior'),
      criterion,
      measurement_method: goal_type === 'transition' ? '' : v('goalMethod'),
      baseline: goal_type === 'transition' ? '' : v('goalBaseline')
    };
  },

  _vagueVerb(behavior) {
    const b = (behavior || '').trim().toLowerCase();
    if (!b) return null;
    return this.VAGUE_VERBS.find(verb => b.startsWith(verb)) || null;
  },

  // The measurability gate: every named component must be present (and the
  // behavior verb observable) before save enables. Condition + behavior +
  // criterion + measurement — the four-part structure, enforced.
  _missing(p) {
    const out = [];
    if (p.goal_type === 'transition') {
      if (!p.transition_area) out.push('postsecondary area');
      if (!p.behavior) out.push('outcome');
      else if (this._vagueVerb(p.behavior)) out.push('an observable verb');
      return out;
    }
    if (!p.condition) out.push('condition');
    if (!p.behavior) out.push('observable behavior');
    else if (this._vagueVerb(p.behavior)) out.push('an observable verb');
    if (p.criterion.target == null || isNaN(p.criterion.target)) out.push('criterion target');
    if (!p.measurement_method) out.push('measurement method');
    return out;
  },

  _renderMeter(body, parts) {
    const meter = body.querySelector('#goalMeter');
    if (!meter) return;
    const items = parts.goal_type === 'transition'
      ? [
          ['Area', !!parts.transition_area],
          ['Observable outcome', !!parts.behavior && !this._vagueVerb(parts.behavior)]
        ]
      : [
          ['Condition', !!parts.condition],
          ['Observable behavior', !!parts.behavior && !this._vagueVerb(parts.behavior)],
          ['Criterion', parts.criterion.target != null && !isNaN(parts.criterion.target)],
          ['Measurement', !!parts.measurement_method]
        ];
    meter.innerHTML = items.map(([label, ok]) =>
      `<span class="goalb-meter-item ${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${label}</span>`).join('');
  },

  // Assemble the prose sentence from the structured parts.
  assemble(p, student) {
    const name = `${student.first_name} ${student.last_initial}.`;
    if (p.goal_type === 'transition') {
      if (!p.behavior) return '';
      return `After high school, ${name} will ${this._trimDot(p.behavior)}.`;
    }
    if (!p.condition && !p.behavior) return '';
    const c = p.criterion || {};
    let sentence = '';
    if (p.condition) sentence += this._trimDot(p.condition) + ', ';
    sentence += `${name} will ${this._trimDot(p.behavior || '…')}`;
    if (c.target != null && !isNaN(c.target)) {
      // "80" + "% accuracy" reads as "80% accuracy", not "80 % accuracy".
      const label = c.metric_label || '';
      sentence += (label.startsWith('%')
        ? `, achieving ${c.target}${label}`
        : `, achieving ${c.target} ${label}`).replace(/ {2,}/g, ' ');
      if (c.trials_x && c.trials_y) sentence += ` in ${c.trials_x} of ${c.trials_y} trials`;
    }
    if (p.measurement_method) sentence += `, as measured by ${p.measurement_method}`;
    if (c.timeframe) sentence += `, ${c.timeframe}`;
    return sentence + '.';
  },

  _trimDot(s) { return String(s || '').trim().replace(/[.\s]+$/, ''); }
};

window.aceGoalBuilder = aceGoalBuilder;
