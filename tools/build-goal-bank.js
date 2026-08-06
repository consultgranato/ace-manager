#!/usr/bin/env node
// ============================================================
// Ace Manager — goal bank builder
//
//     node tools/build-goal-bank.js
//
// Collects every hand-authored skill template (tools/goalbank/dom-*.js),
// EXPANDS each one across its grade bands to prove it produces a valid goal,
// then writes the templates — not the expanded goals — to data/goal-bank.js.
//
// Shipping templates rather than finished goals is a size decision with a
// correctness bonus: the app expands them through js/goal-model.js, the same
// module this builder validates with, so the bank a case manager browses is
// produced by the code that will save it.
//
// Validation is fatal. A bank that ships a benchmark ladder pointing the wrong
// way, a dangling probe pool or an unmeasurable verb is worse than a small one,
// because a case manager will trust it and put it in front of a parent.
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const model = require('../js/goal-model.js');
const { POOLS } = require('./goalbank/pools');

const DOMAIN_FILES = [
  'dom-reading', 'dom-writing', 'dom-math', 'dom-communication',
  'dom-behavior', 'dom-social', 'dom-executive', 'dom-living',
  'dom-advocacy', 'dom-vocational', 'dom-motor', 'dom-study'
];

const templates = [];
const missing = [];
for (const f of DOMAIN_FILES) {
  const p = path.join(__dirname, 'goalbank', f + '.js');
  if (!fs.existsSync(p)) { missing.push(f); continue; }
  const list = require(p);
  if (!Array.isArray(list)) throw new Error(`${f} did not export an array of templates`);
  templates.push(...list);
}
if (missing.length) console.warn(`  (not authored yet: ${missing.join(', ')})`);

// ---- validate by expanding ----------------------------------------------------
const errors = [];
const goals = [];
const seenTpl = new Set();

for (const tpl of templates) {
  if (seenTpl.has(tpl.id)) errors.push(`duplicate template id ${tpl.id}`);
  seenTpl.add(tpl.id);
  if (!tpl.id || !/^[a-z]{2}-[a-z]{2}-\d\d$/.test(tpl.id)) errors.push(`${tpl.id}: id must look like xx-yy-01`);
  if (!tpl.domain) errors.push(`${tpl.id}: no domain`);
  if (!tpl.sub) errors.push(`${tpl.id}: no subskill`);
  if (!tpl.skill) errors.push(`${tpl.id}: no skill label`);
  if (!tpl.dx || !tpl.dx.length) errors.push(`${tpl.id}: no disability relevance`);
  if (!tpl.std) errors.push(`${tpl.id}: no Illinois standard`);
  if (!POOLS[tpl.pool]) errors.push(`${tpl.id}: unknown probe pool "${tpl.pool}"`);
  if (!Array.isArray(tpl.bm) || tpl.bm.length !== 3) errors.push(`${tpl.id}: needs exactly 3 benchmarks`);
  // A student-completed probe — academic or self-report — can only ever return
  // a percent correct. Anything measured in words per minute, rubric points,
  // prompts, minutes or independently completed task steps has to come from an
  // adult watching, so those metrics require an observation pool. Without this
  // check a goal could claim to be monitored by a link that structurally cannot
  // produce the number the goal is written in.
  const pool = POOLS[tpl.pool];
  const mdef = model.METRICS.filter(m => m.id === tpl.metric)[0];
  if (pool && mdef && pool.kind !== 'observation') {
    if (mdef.unit !== '%') {
      // …unless the pool is timed, which is what a one-minute math CBM is.
      if (!(pool.timed && pool.timed.metric === tpl.metric)) {
        errors.push(`${tpl.id}: metric "${tpl.metric}" (${mdef.unit}) cannot come from a ${pool.kind} probe — use an observation pool or a timed pool`);
      }
    } else if (tpl.metric === 'steps') {
      errors.push(`${tpl.id}: task-analysis steps must be scored by an adult — use an observation pool, not "${tpl.pool}"`);
    }
  }
  if (!model.metric(tpl.metric) || !model.METRICS.some(m => m.id === tpl.metric)) {
    errors.push(`${tpl.id}: unknown metric "${tpl.metric}"`);
  }

  const bands = tpl.bands || model.BANDS;
  for (const band of bands) {
    if (model.BANDS.indexOf(band) < 0) { errors.push(`${tpl.id}: unknown band "${band}"`); continue; }
    let g;
    try { g = model.expand(tpl, band); }
    catch (e) { errors.push(`${tpl.id}/${band}: ${e.message}`); continue; }
    goals.push(g);

    const where = `${g.id}`;
    if (!g.condition) errors.push(`${where}: empty condition`);
    if (!g.behavior) errors.push(`${where}: empty behavior`);
    if (g.criterion.target == null || isNaN(g.criterion.target)) errors.push(`${where}: no criterion target`);
    if (model.vagueVerb(g.behavior)) errors.push(`${where}: behavior opens with the vague verb "${model.vagueVerb(g.behavior)}"`);
    if (g.benchmarks.length !== 3) errors.push(`${where}: ${g.benchmarks.length} benchmarks`);

    const blob = g.condition + g.behavior + g.skill + g.il_standard + g.teaching_note +
      g.benchmarks.map(b => b.condition + b.behavior).join('');
    const stray = blob.match(/\{(\w+)\}/);
    if (stray) errors.push(`${where}: unresolved token ${stray[0]}`);

    // The ladder has to climb toward the goal, in the goal's own direction.
    const sign = g.criterion.direction === 'decrease' ? -1 : 1;
    const t = g.benchmarks.map(b => b.criterion.target);
    for (let i = 1; i < 3; i++) {
      if (g.benchmarks[i].criterion.metric === g.benchmarks[i - 1].criterion.metric &&
          sign * (t[i] - t[i - 1]) < 0) {
        errors.push(`${where}: benchmark ${i + 1} target ${t[i]} moves away from the goal`);
      }
    }
    if (g.benchmarks[2].criterion.metric === g.criterion.metric &&
        sign * (g.criterion.target - t[2]) < 0) {
      errors.push(`${where}: goal target ${g.criterion.target} is easier than benchmark 3 (${t[2]})`);
    }
    for (const b of g.benchmarks) {
      if (!b.behavior) errors.push(`${where}: benchmark ${b.index} has no behavior`);
      if (b.criterion.target == null || isNaN(b.criterion.target)) errors.push(`${where}: benchmark ${b.index} has no target`);
    }
  }
}

const seenGoal = new Set();
for (const g of goals) {
  if (seenGoal.has(g.id)) errors.push(`duplicate goal id ${g.id}`);
  seenGoal.add(g.id);
}

if (errors.length) {
  console.error('\nGOAL BANK BUILD FAILED\n');
  errors.slice(0, 40).forEach(e => console.error('  ' + e));
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`);
  process.exit(1);
}

// ---- emit ----------------------------------------------------------------------
// One template per line: at this size a pretty-printed bank triples the bytes a
// browser downloads, and a line-per-template diff is easier to review than an
// indented one anyway.
const usedPools = [...new Set(templates.map(t => t.pool))].sort();
const subskills = new Set(templates.map(t => t.domain + ' — ' + t.sub));

const header = `// =============================================================
// Ace Manager — IEP goal bank (GENERATED — do not hand-edit)
// =============================================================
// Built by tools/build-goal-bank.js from the hand-authored skill templates in
// tools/goalbank/dom-*.js. Re-run the builder instead of editing this file.
//
// These are SKILL TEMPLATES. js/goal-model.js expands each one across the grade
// bands it lists, producing the finished goals the app browses — condition,
// observable behavior, criterion, three benchmarks with a faded scaffold
// ladder, and a progress-monitoring probe plan.
//
// Keys: cond/beh = condition and observable behavior · target/trials =
// criterion · bm = the three benchmarks (beh, optional t) · pool = probe pool ·
// std = Illinois Learning Standard · dx = eligibility categories the skill
// commonly fits · fade = which scaffold ladder the benchmarks step down.
//
// ${templates.length} templates → ${goals.length} goals · ${subskills.size} subskills · ${usedPools.length} probe pools
// =============================================================

window.ACE_GOAL_BANK = {
"version": 3,
"built": ${JSON.stringify(new Date().toISOString().slice(0, 10))},
"goal_count": ${goals.length},
"templates": [
`;

const body = templates.map(t => JSON.stringify(t)).join(',\n');
const out = header + body + '\n]};\n';

fs.writeFileSync(path.join(__dirname, '..', 'data', 'goal-bank.js'), out);

// ---- report ---------------------------------------------------------------------
const byDomain = {};
for (const g of goals) {
  const d = byDomain[g.domain] = byDomain[g.domain] || { n: 0, subs: new Set(), tpl: new Set() };
  d.n++; d.subs.add(g.subskill); d.tpl.add(g.template_id);
}
console.log(`\ndata/goal-bank.js — ${templates.length} templates → ${goals.length} goals (${(out.length / 1024).toFixed(0)} KB)\n`);
for (const [d, v] of Object.entries(byDomain).sort((a, b) => b[1].n - a[1].n)) {
  console.log(`  ${d.padEnd(22)} ${String(v.n).padStart(4)} goals   ${String(v.tpl.size).padStart(3)} skills   ${v.subs.size} subskills`);
}
const unused = Object.keys(POOLS).filter(p => !usedPools.includes(p));
if (unused.length) console.log(`\n  pools not yet referenced (${unused.length}): ${unused.join(', ')}`);
