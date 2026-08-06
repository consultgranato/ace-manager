// =============================================================
// Ace Manager — goal model (shared by the app AND the bank builder)
// =============================================================
// One implementation of what a measurable goal IS: the four-part statement,
// the metric registry, the benchmark ladder, the scaffold fade, and the prose
// assembly. The browser loads it as window.aceGoalModel; tools/build-goal-bank.js
// requires the same file in Node. That is deliberate — when the offline bank and
// the running app disagree about what a goal looks like, the case manager finds
// out at an IEP meeting.
//
// The bank ships SKILL TEMPLATES, not finished goals. A template plus a grade
// band expands into a goal here, at runtime. 566 templates is a ~400 KB file;
// the 1500 goals they expand into would be four times that, and every byte of
// the difference is the same sentence repeated with one noun changed.

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.aceGoalModel = api;
})(this, function () {
  'use strict';

  // ---- bands ------------------------------------------------------------------
  // 18-22 is a real IDEA/ISBE band: Illinois serves eligible students through the
  // end of the school year in which they turn 22, and those goals are genuinely
  // different — functional academics, community, workplace — not merely harder.
  const BANDS = ['6-8', '9-12', '18-22'];
  const BAND_LABEL = { '6-8': 'Grades 6-8', '9-12': 'Grades 9-12', '18-22': 'Age 18-22 (transition)' };
  const BAND_ORDER = { '6-8': 1, '9-12': 2, '18-22': 3 };

  // Tokens resolved per band inside every authored string. This table is what
  // lets one authored skill stay honest across three student populations.
  const BAND_TOKENS = {
    '6-8': {
      msn: '7.NS.A.3', mee: '8.EE.C.7', mrp: '7.RP.A.2', mg: '7.G.B.6', msp: '7.SP.B.4',
      gg: '7', grade: 'middle school', corpus: 'middle-grades content-area',
      text: 'a grade 6-8 informational text',
      passage: 'an unpracticed grade 6-8 passage of 200-250 words',
      lit: 'a grade 6-8 literary text', course: 'a core content class',
      setting: 'the classroom', adult: 'a teacher', peer: 'a classmate',
      life: 'school or home', work: 'a classroom job or school helper role',
      money: 'a $20 spending plan', doc: 'a school form', n: '15', nshort: '10'
    },
    '9-12': {
      msn: 'HSN-Q.A.1', mee: 'HSA-REI.B.3', mrp: 'HSN-Q.A.2', mg: 'HSG-GMD.A.3', msp: 'HSS-ID.A.2',
      gg: '9-10', grade: 'high school', corpus: 'high-school content-area',
      text: 'a grade 9-12 informational text',
      passage: 'an unpracticed grade 9-12 passage of 250-300 words',
      lit: 'a grade 9-12 literary text', course: 'a general education course',
      setting: 'the general education classroom', adult: 'a teacher or case manager',
      peer: 'a peer', life: 'school, home or the community',
      work: 'a work-based learning placement', money: 'a $200 monthly budget',
      doc: 'an employment or school form', n: '20', nshort: '10'
    },
    '18-22': {
      msn: 'HSN-Q.A.1', mee: 'HSA-CED.A.1', mrp: 'HSN-Q.A.2', mg: 'HSG-MG.A.3', msp: 'HSS-ID.A.1',
      gg: '11-12', grade: 'transition-age', corpus: 'workplace and community',
      text: 'a functional community text (lease, manual, benefits notice)',
      passage: 'an unpracticed functional passage of 250-300 words',
      lit: 'a community or workplace narrative', course: 'a transition or community-based program',
      setting: 'a community or job-site setting', adult: 'a job coach or transition coordinator',
      peer: 'a co-worker', life: 'an independent living or community setting',
      work: 'a community job site', money: 'a monthly household budget',
      doc: 'a housing, benefits or employment form', n: '20', nshort: '10'
    }
  };

  // ---- benchmark windows --------------------------------------------------------
  // Illinois IEPs run a year and progress reports go home each grading period.
  // Three benchmarks on trimester windows survives an audit and still gives the
  // case manager a mid-course correction point.
  const WINDOWS = [
    { index: 1, weeks: '1-12',  short: 'Weeks 1-12',  label: 'by the end of the first 12 instructional weeks',  report: '1st progress report' },
    { index: 2, weeks: '13-24', short: 'Weeks 13-24', label: 'by the end of the second 12 instructional weeks', report: '2nd progress report' },
    { index: 3, weeks: '25-36', short: 'Weeks 25-36', label: 'by the end of the third 12 instructional weeks',  report: '3rd progress report' }
  ];

  // Scaffold fade across the three benchmarks. Benchmark 3 always lands on the
  // goal's own condition — the last rung of the ladder IS the goal.
  const SCAFFOLDS = {
    academic:   ['following a teacher model and guided practice', 'with a reference support available', 'independently'],
    behavior:   ['with a visual cue and an adult prompt',         'with a visual cue only',             'independently'],
    selfreport: ['with an adult check-in',                        'with a written reminder',            'independently'],
    functional: ['with a task card and adult modeling',           'with a task card only',              'independently'],
    none:       ['', '', '']
  };

  // ---- metrics --------------------------------------------------------------------
  // `direction` decides what "at target" means. A behaviour-reduction goal is met
  // by going DOWN; charting it as an increase goal is a reporting error, not a
  // cosmetic one.
  const METRICS = [
    { id: 'accuracy',      label: '% accuracy',                         unit: '%',       direction: 'increase' },
    { id: 'opportunities', label: '% of observed opportunities',        unit: '%',       direction: 'increase' },
    { id: 'steps',         label: '% of task steps done independently', unit: '%',       direction: 'increase' },
    { id: 'wcpm',          label: 'words correct per minute',           unit: 'wcpm',    direction: 'increase' },
    { id: 'dcpm',          label: 'digits correct per minute',          unit: 'dcpm',    direction: 'increase' },
    { id: 'cws',           label: 'correct word sequences',             unit: 'cws',     direction: 'increase' },
    { id: 'rubric',        label: 'points on a 4-point rubric',         unit: 'pts',     direction: 'increase' },
    { id: 'score',         label: 'raw score',                          unit: 'pts',     direction: 'increase' },
    { id: 'duration',      label: 'consecutive minutes on task',        unit: 'min',     direction: 'increase' },
    { id: 'intervals',     label: '% of observed intervals',            unit: '%',       direction: 'increase' },
    { id: 'frequency',     label: 'occurrences per class period',       unit: '/period', direction: 'decrease' },
    { id: 'prompts',       label: 'adult prompts required',             unit: 'prompts', direction: 'decrease' },
    { id: 'latency',       label: 'minutes to begin a task',            unit: 'min',     direction: 'decrease' },
    { id: 'disfluency',    label: '% of syllables stuttered',           unit: '%',       direction: 'decrease' }
  ];
  const METRIC_BY_ID = {};
  METRICS.forEach(m => { METRIC_BY_ID[m.id] = m; });

  const TIMEFRAME = 'by the next annual review';
  const TIMEFRAMES = [TIMEFRAME, 'within 36 instructional weeks', 'by the end of the semester'];

  // Vague verbs make a goal unmeasurable; the builder refuses them and the bank
  // builder fails on them, so the two can never disagree about what counts.
  const VAGUE_VERBS = ['understand', 'know', 'learn', 'improve', 'be aware', 'appreciate',
    'develop', 'work on', 'try', 'get better', 'become', 'gain', 'increase his', 'increase her'];

  // Most benchmark ladders are the same clinical shape: about three quarters of
  // the way by the first report, most of the way by the second, the goal itself
  // by the third. Templates state a number only where judgment says otherwise.
  const LADDER_UP = [0.78, 0.90, 1.0];
  const LADDER_DOWN = [1.8, 1.35, 1.0];

  // ---- helpers ---------------------------------------------------------------------
  function metric(id) { return METRIC_BY_ID[id] || METRIC_BY_ID.accuracy; }

  function fill(str, band) {
    if (str == null) return '';
    const tok = BAND_TOKENS[band] || {};
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return tok[k] != null ? tok[k] : m; });
  }

  // A template value may be a scalar (same for every band) or a per-band map.
  function pick(v, band) {
    if (v == null) return v;
    if (typeof v === 'object' && !Array.isArray(v)) {
      if (v[band] !== undefined) return v[band];
      for (let i = 0; i < BANDS.length; i++) if (v[BANDS[i]] !== undefined) return v[BANDS[i]];
      return undefined;
    }
    return v;
  }

  function trimDot(s) { return String(s == null ? '' : s).trim().replace(/[.,\s]+$/, ''); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function lower(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  function roundTarget(metricId, v) {
    const m = metric(metricId);
    // Percent targets snap to 5s where that reads naturally, but a reduction
    // goal aiming at 3% would collapse to 5 / 5 / 3 — so small percents keep
    // whole-number precision and the ladder stays a ladder.
    if (m.unit === '%') {
      if (v < 20) return Math.max(1, Math.min(100, Math.round(v)));
      return Math.max(5, Math.min(100, Math.round(v / 5) * 5));
    }
    // Rubric points round DOWN to the half point. Rounding to nearest collapses
    // a 3-point goal's ladder to 2.5 / 2.5 / 3 — two identical benchmarks, which
    // is not a ladder at all.
    if (metricId === 'rubric') return Math.max(0.5, Math.floor(v * 2) / 2);
    if (['wcpm', 'dcpm', 'cws', 'score'].indexOf(metricId) >= 0) return Math.max(1, Math.round(v / 5) * 5);
    return Math.max(1, Math.round(v));
  }

  function ladderTarget(metricId, goalTarget, i, direction) {
    // The third benchmark IS the goal, so it takes the goal's target exactly.
    // Rounding it independently can land it past the goal — a ladder whose top
    // rung is above the roof.
    if (i === 2) return Number(goalTarget);
    const f = (direction === 'decrease' ? LADDER_DOWN : LADDER_UP)[i];
    return roundTarget(metricId, goalTarget * f);
  }

  function defaultBaseline(metricId, behavior) {
    const b = trimDot(behavior);
    const short = b.length > 80 ? b.slice(0, 77).replace(/\s\S*$/, '') + '…' : b;
    return 'Current ' + metric(metricId).label + ' — ' + short + ' — across 3 recent probes';
  }

  function makeCriterion(metricId, target, tx, ty, direction, timeframe) {
    const m = metric(metricId);
    return {
      metric: m.id, metric_label: m.label, unit: m.unit,
      direction: direction || m.direction,
      target: target == null ? null : Number(target),
      trials_x: tx || null, trials_y: ty || null,
      timeframe: timeframe || TIMEFRAME
    };
  }

  // ---- prose ------------------------------------------------------------------------
  function criterionClause(c) {
    if (!c || c.target == null || isNaN(c.target)) return '';
    const label = c.metric_label || (c.metric ? metric(c.metric).label : '');
    const pct = String(label).charAt(0) === '%';
    let out;
    if (c.direction === 'decrease') {
      out = pct ? ', reducing to no more than ' + c.target + label
                : ', reducing to no more than ' + c.target + ' ' + label;
    } else {
      out = pct ? ', achieving ' + c.target + label
                : ', achieving ' + c.target + ' ' + label;
    }
    if (c.trials_x && c.trials_y) out += ' in ' + c.trials_x + ' of ' + c.trials_y + ' trials';
    return out.replace(/ {2,}/g, ' ');
  }

  // The one place a goal sentence is built. The builder preview, the bank
  // browser and the saved goal_text all come through here.
  function assemble(p, name) {
    if (!p) return '';
    if (p.goal_type === 'transition') {
      if (!p.behavior) return '';
      return 'After high school, ' + name + ' will ' + trimDot(p.behavior) + '.';
    }
    if (!p.condition && !p.behavior) return '';
    let s = '';
    if (p.condition) s += trimDot(p.condition) + ', ';
    s += name + ' will ' + trimDot(p.behavior || '…');
    s += criterionClause(p.criterion);
    if (p.measurement_method) s += ', as measured by ' + p.measurement_method;
    const tf = p.criterion && p.criterion.timeframe;
    if (tf) s += ', ' + tf;
    return s + '.';
  }

  // "By the end of the first 12 instructional weeks, given …, NAME will …"
  function benchmarkText(bm, name) {
    const w = WINDOWS[(bm.index || 1) - 1];
    const core = assemble({
      condition: bm.condition, behavior: bm.behavior,
      criterion: Object.assign({}, bm.criterion, { timeframe: null })
    }, name);
    return cap(w.label) + ', ' + lower(core);
  }

  // ---- expansion ----------------------------------------------------------------------
  // One template + one band -> one hydrated goal. Pure: no DOM, no globals.
  function expand(tpl, band) {
    const metricId = pick(tpl.metric, band) || 'accuracy';
    const m = metric(metricId);
    const dir = pick(tpl.direction, band) || m.direction;
    const target = Number(pick(tpl.target, band));
    const trials = pick(tpl.trials, band) || null;
    const tx = trials ? trials[0] : null;
    const ty = trials ? trials[1] : null;

    const condition = trimDot(fill(pick(tpl.cond, band), band));
    const behavior = trimDot(fill(pick(tpl.beh, band), band));
    const fade = tpl.fade || 'academic';
    const ladder = SCAFFOLDS[fade] || SCAFFOLDS.academic;
    const method = pick(tpl.method, band) || poolMethod(tpl.pool) || 'curriculum-based measurement probes';

    const criterion = makeCriterion(metricId, target, tx, ty, dir);

    const benchmarks = (tpl.bm || []).map(function (b, i) {
      const bMetric = pick(b.metric, band) || metricId;
      let t = pick(b.t, band);
      if (t == null) t = ladderTarget(bMetric, target, i, dir);
      const scaffold = ladder[i] || '';
      const baseCond = b.cond ? trimDot(fill(pick(b.cond, band), band)) : condition;
      const bCondition = scaffold ? baseCond + ', ' + scaffold : baseCond;
      const bCriterion = makeCriterion(bMetric, t, pick(b.tx, band) || tx, pick(b.ty, band) || ty, dir, null);
      const out = {
        index: i + 1,
        window: WINDOWS[i].short,
        window_label: WINDOWS[i].label,
        report: WINDOWS[i].report,
        condition: bCondition,
        behavior: trimDot(fill(pick(b.beh, band), band)),
        criterion: bCriterion
      };
      out.text = benchmarkText(out, 'NAME');
      return out;
    });

    const goal = {
      id: tpl.id + '-' + band.replace('-', ''),
      template_id: tpl.id,
      domain: tpl.domain,
      subskill: tpl.sub,
      skill: fill(pick(tpl.skill, band), band),
      grade_band: band,
      band_label: BAND_LABEL[band],
      band_order: BAND_ORDER[band],
      disability_relevance: (tpl.dx || []).slice(),
      condition: condition,
      behavior: behavior,
      criterion: criterion,
      measurement_method: method,
      fade: fade,
      baseline_prompt: fill(pick(tpl.base, band), band) || defaultBaseline(metricId, behavior),
      benchmarks: benchmarks,
      objectives: benchmarks.map(function (b) { return b.text; }),
      probe_pool: tpl.pool,
      gen_opts: tpl.gen_opts || null,
      probe_plan: probePlan(tpl.pool, tpl.gen_opts || null),
      il_standard: fill(pick(tpl.std, band), band),
      teaching_note: fill(pick(tpl.note, band), band) || ''
    };
    goal.goal_text = assemble({
      condition: condition, behavior: behavior, criterion: criterion, measurement_method: method
    }, 'NAME');
    return goal;
  }

  // ---- probe plan ---------------------------------------------------------------------
  // How one probe splits across the three benchmarks. Early cycles weight the
  // benchmark currently being taught; later cycles keep sampling earlier tiers
  // so maintenance loss shows up instead of hiding behind a rising average.
  const PHASES = [
    { phase: 1, weeks: '1-12',  focus: 1, mix: [5, 3, 1] },
    { phase: 2, weeks: '13-24', focus: 2, mix: [2, 5, 2] },
    { phase: 3, weeks: '25-36', focus: 3, mix: [2, 3, 4] }
  ];

  function poolDef(key) {
    const bank = typeof window !== 'undefined' ? window.ACE_PROBE_BANK : null;
    return (bank && bank.pools && bank.pools[key]) || null;
  }
  function poolMethod(key) { const p = poolDef(key); return p ? p.default_method : null; }

  // `opts` are per-goal generator options carried from the skill template — the
  // operation a fact-fluency goal is actually about, for instance. Without them
  // one pool-level generator would probe a multiplication goal with addition
  // items and then report a per-benchmark score for skills the goal never named.
  function probePlan(key, opts) {
    const p = poolDef(key);
    if (!p) return { pool: key, kind: 'academic', phases: PHASES, items_per_probe: 9, frequency: 'biweekly', gen_opts: opts || null };
    return {
      gen_opts: opts || null,
      pool: key,
      kind: p.kind,
      label: p.label,
      method: p.method,
      administration: p.administration,
      frequency: p.frequency || 'biweekly',
      items_per_probe: p.items || 9,
      scored_by: p.kind === 'observation' ? 'case manager' : 'student (auto-scored)',
      phases: PHASES
    };
  }

  // ---- bank access ----------------------------------------------------------------------
  let _goals = null;
  function templates() {
    const b = typeof window !== 'undefined' ? window.ACE_GOAL_BANK : null;
    return (b && Array.isArray(b.templates)) ? b.templates : [];
  }
  function goals() {
    if (_goals) return _goals;
    const out = [];
    templates().forEach(function (t) {
      (t.bands || BANDS).forEach(function (band) {
        try { out.push(expand(t, band)); } catch (e) { /* a bad template must not blank the bank */ }
      });
    });
    _goals = out;
    return out;
  }
  function reset() { _goals = null; }

  // A saved goal row rendered through the same shape as a bank entry, so the
  // progress UI never needs two code paths.
  function hydrateSaved(row) {
    const c = row.criterion || {};
    const benchmarks = (row.benchmarks || []).map(function (b, i) {
      const bm = {
        index: i + 1,
        window: WINDOWS[i] ? WINDOWS[i].short : '',
        window_label: WINDOWS[i] ? WINDOWS[i].label : '',
        report: WINDOWS[i] ? WINDOWS[i].report : '',
        condition: b.condition || '',
        behavior: b.behavior || '',
        criterion: Object.assign({ metric: c.metric, metric_label: c.metric_label, unit: c.unit, direction: c.direction }, b.criterion || {})
      };
      bm.text = b.text || benchmarkText(bm, 'NAME');
      return bm;
    });
    return Object.assign({}, row, { benchmarks: benchmarks });
  }

  function vagueVerb(behavior) {
    const b = String(behavior || '').trim().toLowerCase();
    if (!b) return null;
    for (let i = 0; i < VAGUE_VERBS.length; i++) if (b.indexOf(VAGUE_VERBS[i]) === 0) return VAGUE_VERBS[i];
    return null;
  }

  // Value formatted in its own unit: "79%", "30 min", "115 wcpm".
  function fmtValue(v, unit) {
    if (v == null || v === '') return '—';
    return unit === '%' ? v + '%' : (unit ? v + ' ' + unit : String(v));
  }

  // Has this value reached the criterion? Direction-aware, which is the whole
  // reason `direction` is stored.
  function atTarget(value, criterion) {
    if (value == null || !criterion || criterion.target == null) return false;
    return criterion.direction === 'decrease'
      ? Number(value) <= Number(criterion.target)
      : Number(value) >= Number(criterion.target);
  }

  return {
    BANDS: BANDS, BAND_LABEL: BAND_LABEL, BAND_ORDER: BAND_ORDER, BAND_TOKENS: BAND_TOKENS,
    WINDOWS: WINDOWS, SCAFFOLDS: SCAFFOLDS, METRICS: METRICS, PHASES: PHASES,
    TIMEFRAME: TIMEFRAME, TIMEFRAMES: TIMEFRAMES, VAGUE_VERBS: VAGUE_VERBS,
    metric: metric, fill: fill, pick: pick, expand: expand, assemble: assemble,
    benchmarkText: benchmarkText, criterionClause: criterionClause,
    makeCriterion: makeCriterion, ladderTarget: ladderTarget, roundTarget: roundTarget,
    defaultBaseline: defaultBaseline, probePlan: probePlan,
    templates: templates, goals: goals, reset: reset, hydrateSaved: hydrateSaved,
    vagueVerb: vagueVerb, fmtValue: fmtValue, atTarget: atTarget
  };
});
