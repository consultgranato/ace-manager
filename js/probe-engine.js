// =============================================================
// Ace Manager — probe engine
// =============================================================
// Builds a progress-monitoring probe for a goal. Three things make a probe here
// different from a quiz:
//
//   1. EVERY ITEM CARRIES A TIER (1-3) matching one of the goal's benchmarks.
//      One probe therefore yields four numbers: an overall score for the goal
//      and a separate score for each benchmark. That is what lets the app say
//      "benchmark 1 is mastered, benchmark 2 is where he is stuck" instead of
//      only "72%".
//
//   2. THE MIX SHIFTS WITH THE PHASE. Weeks 1-12 weight the benchmark being
//      taught; later cycles keep sampling earlier tiers so a skill that decays
//      shows up instead of hiding behind a rising average.
//
//   3. ITEMS ARE GENERATED, NOT DRAWN FROM A FIXED LIST, wherever the skill
//      allows it. Equivalent alternate forms are the defining property of
//      curriculum-based measurement: every cycle is a different form of the
//      same difficulty, so a rising line means fluency rather than a memorised
//      item set. Comprehension, judgement and knowledge items cannot be faked
//      that way, so those are hand-authored and drawn without replacement.
//
// Observation probes need no authored items at all: the rows ARE the goal's
// benchmarks, scored by an adult as a tally of correct opportunities. That is
// how a case manager already collects this data on paper.
//
// Answer keys live on the generated item and are stored on the probe row. The
// anonymous RPC strips them before the student's browser ever sees the probe;
// scoring happens server-side. Same trust model as before.

(function () {
  'use strict';

  // ---- seeded RNG ---------------------------------------------------------------
  // Seeded so a probe is reproducible from its stored seed, and so two items in
  // the same probe can be checked for collision deterministically.
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const ri = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Build a 4-option multiple choice from a correct value and distractors,
  // returning the shuffled choices plus the index of the right one.
  function mc(r, correct, distractors) {
    const seen = {}; const opts = [String(correct)];
    seen[String(correct)] = 1;
    for (const d of distractors) {
      const s = String(d);
      if (!seen[s] && opts.length < 4) { seen[s] = 1; opts.push(s); }
    }
    const shuffled = shuffle(r, opts);
    return { choices: shuffled, answer: shuffled.indexOf(String(correct)) };
  }

  // ---- generators ----------------------------------------------------------------
  // Item generation lives in js/probe-generators.js, one generator per pool and
  // ONE VARIANT PER SKILL inside it. It is a separate file because that is where
  // the content is and this file is the assembly and scoring machinery.
  //
  // A goal names its variant through gen_opts.v; tools/build-goal-bank.js fails
  // the build if a goal on a generated pool omits it or names one that does not
  // exist. That gate is why a graphing goal can no longer be probed with
  // equation solving.
  function generators() { return window.ACE_PROBE_GENERATORS || {}; }

  // Loud rather than silent: a goal on a generated pool that cannot say which
  // skill it is about will produce a probe that does not match it, and that is
  // worth a console line a developer will actually see.
  const _warned = {};
  function warnUnresolved(goal, pool) {
    const key = (goal && goal.id) || (goal && goal.probe_pool) || 'unknown';
    if (_warned[key]) return;
    _warned[key] = 1;
    console.warn('[probe-engine] Goal ' + key + ' is on generated pool "' + goal.probe_pool +
      '" but names no skill variant (gen_opts.v). Items will be sampled across the whole strand. ' +
      'If this goal came from the bank, re-saving it will repair the plan.');
  }

  // ---- pool access ---------------------------------------------------------------------
  function bank() { return window.ACE_PROBE_BANK || { pools: {}, items: {} }; }
  function poolDef(key) { return bank().pools[key] || null; }

  // ---- curated item sampling ------------------------------------------------------------
  // Draw without replacement across cycles: items this goal has already been
  // shown come last, so a student meets a genuinely new set until the pool is
  // exhausted and the exclusion resets.
  function curated(poolKey, tier, count, r, usedIds, band) {
    const all = (bank().items[poolKey] || []).filter(it => (it.tier || 1) === tier);
    if (!all.length) return [];
    const fresh = all.filter(it => !usedIds[it.id]);
    const ordered = shuffle(r, fresh).concat(shuffle(r, all.filter(it => usedIds[it.id])));
    // Curated items are authored once with band tokens ({work}, {setting}…) and
    // resolved here against the goal's band, so one authored item serves a 7th
    // grader and a 20-year-old on a job site without reading wrong for either.
    const f = s => (window.aceGoalModel ? window.aceGoalModel.fill(s, band) : s);
    return ordered.slice(0, count).map(function (it) {
      const copy = JSON.parse(JSON.stringify(it));
      copy.prompt = f(copy.prompt);
      if (copy.choices) copy.choices = copy.choices.map(f);
      if (copy.levels) copy.levels = copy.levels.map(f);
      if (copy.hint) copy.hint = f(copy.hint);
      return copy;
    });
  }

  // ---- benchmark-derived items -------------------------------------------------------------
  // Observation and self-report probes need no authored content: the thing being
  // measured is the goal's own benchmark. An adult tallies opportunities against
  // each benchmark; a student rates how often they did it. This is the paper
  // form a case manager already keeps, with the arithmetic done for them.
  function fromBenchmarks(goal, kind, tier) {
    const bm = (goal.benchmarks || [])[tier - 1];
    if (!bm) return [];
    const behavior = bm.behavior || '';
    if (kind === 'observation') {
      return [{
        type: 'tally', tier: tier,
        prompt: behavior.charAt(0).toUpperCase() + behavior.slice(1),
        hint: bm.condition
      }];
    }
    return [
      { type: 'scale', tier: tier, prompt: 'In the last two weeks, how often did you ' + behavior + '?',
        scale_low: 'Never', scale_high: 'Every time' },
      { type: 'scale', tier: tier, prompt: 'How hard was it to ' + behavior + '?',
        scale_low: 'Very hard', scale_high: 'Easy', reverse: false }
    ];
  }

  // ---- assembly ----------------------------------------------------------------------------
  // Build one probe for a goal, at a phase. Returns items tagged with the tier
  // they measure, plus the metadata the probe row needs.
  function build(goal, opts) {
    opts = opts || {};
    const model = window.aceGoalModel;
    const pool = poolDef(goal.probe_pool) || {};
    const kind = pool.kind || 'academic';
    const phaseIdx = Math.min(3, Math.max(1, opts.phase || currentPhase(goal, opts.cycleIndex)));
    const phase = (model.PHASES || [])[phaseIdx - 1] || { mix: [3, 3, 3] };
    const seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 2147483647);
    const r = rngFrom(seed);
    const usedIds = {};
    (opts.usedItemIds || []).forEach(id => { usedIds[id] = 1; });

    // Per-goal generator options: which SKILL on this pool the goal is about.
    // Three sources, in order of trust:
    //   1. the goal's own probe_plan (what the builder saves today)
    //   2. the hydrated bank entry, when building straight from the bank
    //   3. recovered from bank_id — goals saved before this was threaded
    //      through the builder have a pool but no variant, and would otherwise
    //      silently draw items for a different skill on the same pool
    let genOpts = (goal.probe_plan && goal.probe_plan.gen_opts) || goal.gen_opts || null;
    if (!genOpts && goal.bank_id && model && model.genOptsForBankId) {
      genOpts = model.genOptsForBankId(goal.bank_id);
    }
    genOpts = genOpts || {};

    const total = pool.items || 9;
    // Scale the phase mix to the pool's item count, keeping at least one item
    // per tier so every benchmark gets a number on every probe.
    const mixSum = phase.mix.reduce((a, b) => a + b, 0);
    let counts = phase.mix.map(m => Math.max(1, Math.round(total * m / mixSum)));
    while (counts.reduce((a, b) => a + b, 0) > total && Math.max.apply(null, counts) > 1) {
      counts[counts.indexOf(Math.max.apply(null, counts))] -= 1;
    }
    while (counts.reduce((a, b) => a + b, 0) < total) {
      counts[phase.focus ? phase.focus - 1 : 0] += 1;
    }

    const items = [];
    for (let tier = 1; tier <= 3; tier++) {
      const want = counts[tier - 1];
      let got = [];
      if (kind === 'observation') {
        // An authored rubric beats a generic tally where one exists — scoring a
        // writing sample against four descriptors is a different act from
        // counting opportunities. Everything else falls back to the goal's own
        // benchmarks, which is the paper form a case manager already keeps.
        got = curated(goal.probe_pool, tier, want, r, usedIds, goal.grade_band);
        if (!got.length) got = fromBenchmarks(goal, 'observation', tier);
      } else if (pool.gen && generators()[pool.gen]) {
        // A generated pool with no resolvable variant is a bug, not a default.
        // Sampling every variant is wrong too, but it is honestly wrong — a
        // mixed strand probe — where silently picking the generator's first
        // variant looks authoritative while measuring another skill entirely.
        if (!genOpts.v) warnUnresolved(goal, pool);
        // Generators can land on the same item twice by chance. Retry a bounded
        // number of times rather than handing a student the same question
        // twice in one probe, which reads as a bug and skews the score.
        const seenPrompt = {};
        let guard = 0;
        while (got.length < want && guard < want * 12) {
          guard++;
          const it = generators()[pool.gen](tier, r,
            genOpts.v ? genOpts : { v: pick(r, generators()[pool.gen].VARIANTS || []) });
          if (seenPrompt[it.prompt]) continue;
          seenPrompt[it.prompt] = 1;
          got.push(it);
        }
      } else {
        got = curated(goal.probe_pool, tier, want, r, usedIds, goal.grade_band);
        if (got.length < want && kind === 'self_report') {
          got = got.concat(fromBenchmarks(goal, 'self_report', tier).slice(0, want - got.length));
        }
      }
      got.forEach((it, i) => {
        it.tier = tier;
        if (!it.id) it.id = `${goal.probe_pool}-t${tier}-${seed.toString(36)}-${i}`;
        items.push(it);
      });
    }

    // Observation probes for a raw-unit goal also need the number itself: a
    // tally of benchmarks says which rungs are met, not how many words per
    // minute the student read.
    const unit = (goal.criterion || {}).unit;
    if (kind === 'observation' && unit && unit !== '%') {
      items.push({
        id: `${goal.probe_pool}-value-${seed.toString(36)}`,
        type: 'value', tier: 3, unit: unit,
        prompt: 'Recorded ' + ((goal.criterion || {}).metric_label || 'score') + ' for this session'
      });
    }

    return {
      items: items,
      seed: seed,
      phase: phaseIdx,
      kind: kind,
      pool_key: goal.probe_pool,
      timed: pool.timed || null,
      administration: pool.administration || ''
    };
  }

  // Which phase a goal is in, from how many probe cycles have already run.
  // Cadence is the pool's, so a weekly CBM reaches phase 2 in twelve weeks and
  // a biweekly check-in reaches it in six cycles, both at the right time.
  function currentPhase(goal, cycleIndex) {
    const pool = poolDef(goal.probe_pool) || {};
    const perPhase = pool.frequency === 'weekly' ? 12 : pool.frequency === 'monthly' ? 3 : 6;
    return Math.min(3, Math.floor((cycleIndex || 0) / perPhase) + 1);
  }

  // ---- scoring (client side, for observation probes only) ----------------------------------
  // Student-facing probes are scored server-side in submit_probe so the answer
  // key never reaches the browser. Observation probes are entered by the case
  // manager, who is already trusted with the key, so they score here.
  function scoreObservation(items, responses) {
    const tierPts = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
    let rawValue = null;
    items.forEach(it => {
      const resp = responses[it.id];
      if (it.type === 'value') { if (resp != null && resp !== '') rawValue = Number(resp); return; }
      if (!resp) return;
      const t = it.tier || 1;
      if (it.type === 'tally') {
        const c = Number(resp.correct), o = Number(resp.opportunities);
        if (!isNaN(c) && !isNaN(o) && o > 0) { tierPts[t][0] += c; tierPts[t][1] += o; }
      } else if (it.type === 'rubric') {
        const v = Number(resp);
        if (!isNaN(v)) { tierPts[t][0] += v; tierPts[t][1] += 4; }
      } else if (it.type === 'step') {
        const v = resp === 'independent' ? 1 : resp === 'prompted' ? 0.5 : 0;
        tierPts[t][0] += v; tierPts[t][1] += 1;
      }
    });
    const breakdown = {};
    [1, 2, 3].forEach(t => {
      breakdown[t] = tierPts[t][1] > 0 ? Math.round(tierPts[t][0] / tierPts[t][1] * 100) : null;
    });
    const totC = tierPts[1][0] + tierPts[2][0] + tierPts[3][0];
    const totO = tierPts[1][1] + tierPts[2][1] + tierPts[3][1];
    const pct = totO > 0 ? Math.round(totC / totO * 100) : null;
    return { score: rawValue != null ? rawValue : pct, percent: pct, breakdown: breakdown };
  }

  window.aceProbeEngine = {
    build: build,
    currentPhase: currentPhase,
    scoreObservation: scoreObservation,
    poolDef: poolDef,
    get GENERATORS() { return generators(); }
  };
})();
