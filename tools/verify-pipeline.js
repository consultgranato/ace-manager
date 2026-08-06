#!/usr/bin/env node
// ============================================================
// Ace Manager — goal → progress-monitoring pipeline verification
//
//     node tools/verify-pipeline.js
//
// The goal bank builder proves each goal is well-formed. This proves the goal
// and its PROBE are about the same thing, which is a different question and the
// one that actually bit: a graphing goal was being probed with equation
// solving, because one pool-level generator served eleven different skills.
//
// Checks, in order of how badly each one hurts if it fails:
//
//   1. INTEGRITY   every probe has an item for all three benchmarks, valid
//                  answer keys, no duplicate choices, no unresolved band tokens
//   2. ALIGNMENT   two different skills sharing a generated pool must not
//                  produce the same items; if they do, the variant is inert
//   3. ESCALATION  tier 1 and tier 3 items must differ, either in form or in
//                  magnitude — the per-benchmark breakdown is meaningless if
//                  every tier is the same difficulty
//   4. ARITHMETIC  every generated numeric answer key is independently
//                  recomputed from the prompt
// ============================================================

'use strict';

global.window = {};
require('../data/goal-bank.js');
require('../data/probe-bank.js');
const model = require('../js/goal-model.js');
global.window.aceGoalModel = model;
require('../js/probe-generators.js');
require('../js/probe-engine.js');

const eng = global.window.aceProbeEngine;
const GEN = global.window.ACE_PROBE_GENERATORS;
const pools = global.window.ACE_PROBE_BANK.pools;
const goals = model.goals();

const fail = [];
const note = (msg) => fail.push(msg);

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const shape = it => (it.prompt + '|' + (it.choices || []).join(',')).replace(/-?\d+(\.\d+)?/g, 'N').replace(/\s+/g, ' ').trim();

// ---- 1. integrity --------------------------------------------------------------
let probesBuilt = 0;
const oneGoalPerPool = {};
for (const g of goals) if (!oneGoalPerPool[g.probe_pool]) oneGoalPerPool[g.probe_pool] = g;
for (const [pk, g] of Object.entries(oneGoalPerPool)) {
  for (let phase = 1; phase <= 3; phase++) {
    for (let s = 0; s < 6; s++) {
      const p = eng.build(g, { phase, seed: s * 1009 + phase });
      probesBuilt++;
      const tiers = new Set(p.items.map(i => i.tier));
      for (const t of [1, 2, 3]) if (!tiers.has(t)) note(`integrity ${pk} phase${phase}: no tier-${t} item`);
      for (const it of p.items) {
        if (!it.id || !it.prompt) note(`integrity ${pk}: item missing id or prompt`);
        if (/\{\w+\}/.test(it.prompt)) note(`integrity ${pk}: unresolved token in "${it.prompt.slice(0, 50)}"`);
        if (it.type === 'mc' || it.type === 'sj') {
          const key = it.type === 'mc' ? it.answer : it.best;
          if (!(key >= 0 && key < it.choices.length)) note(`integrity ${pk}: answer index out of range on ${it.id}`);
          if (new Set(it.choices).size !== it.choices.length) note(`integrity ${pk}: duplicate choices on ${it.id}`);
        }
        if (it.type === 'numeric' && (it.answer === undefined || isNaN(it.answer))) note(`integrity ${pk}: bad numeric key on ${it.id}`);
        if (it.type === 'text' && !it.answer) note(`integrity ${pk}: bad text key on ${it.id}`);
      }
    }
  }
}

// ---- 2. alignment --------------------------------------------------------------
const byPool = {};
for (const g of goals) {
  const p = pools[g.probe_pool];
  if (!p || !p.gen) continue;
  byPool[g.probe_pool] = byPool[g.probe_pool] || {};
  if (!byPool[g.probe_pool][g.template_id]) byPool[g.probe_pool][g.template_id] = g;
}
let skillsChecked = 0;
for (const [pk, tmap] of Object.entries(byPool)) {
  const sigs = {};
  for (const [tid, g] of Object.entries(tmap)) {
    const prompts = [];
    for (let s = 0; s < 8; s++) eng.build(g, { phase: 2, seed: s * 31 + 5 }).items.forEach(it => prompts.push(shape(it)));
    const sig = [...new Set(prompts)].sort().join('||');
    skillsChecked++;
    if (sigs[sig]) note(`alignment ${pk}: "${tid}" produces the same items as "${sigs[sig]}" — its variant is not differentiating`);
    else sigs[sig] = tid;
  }
}

// ---- 3. escalation --------------------------------------------------------------
let variantsChecked = 0;
for (const [gname, gen] of Object.entries(GEN)) {
  for (const v of gen.VARIANTS) {
    variantsChecked++;
    const sets = [1, 2, 3].map(t => {
      const shapes = new Set(); let sum = 0, n = 0;
      for (let i = 0; i < 80; i++) {
        const it = gen(t, rng(i * 613 + t * 97), { v });
        shapes.add(shape(it));
        const num = it.type === 'numeric' ? it.answer : numberIn(it.prompt);
        if (typeof num === 'number' && !isNaN(num)) { sum += Math.abs(num); n++; }
      }
      return { shapes, mean: n ? sum / n : null };
    });
    const formDiffers = [...sets[0].shapes].some(x => !sets[2].shapes.has(x)) || [...sets[2].shapes].some(x => !sets[0].shapes.has(x));
    const magDiffers = sets[0].mean != null && sets[2].mean != null && Math.abs(sets[2].mean - sets[0].mean) / Math.max(1, sets[0].mean) > 0.15;
    if (!formDiffers && !magDiffers) {
      note(`escalation ${gname}.${v}: tier 1 and tier 3 items are the same form AND the same magnitude`);
    }
  }
}
function numberIn(prompt) {
  const m = /(-?\d+(?:\.\d+)?)/.exec(String(prompt).replace(/^[^$0-9-]*/, ''));
  return m ? Number(m[1]) : NaN;
}

// ---- 4. arithmetic ---------------------------------------------------------------
const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '-': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
let keysChecked = 0;
const seenTpl = new Set();
for (const g of goals) {
  const p = pools[g.probe_pool];
  if (!p || !p.gen || seenTpl.has(g.template_id)) continue;
  seenTpl.add(g.template_id);
  for (let s = 0; s < 25; s++) {
    for (const it of eng.build(g, { phase: (s % 3) + 1, seed: s * 977 + 13 }).items) {
      if (it.type !== 'numeric') continue;
      let m = /^\s*(-?\d+(?:\.\d+)?)\s*([+−\-×÷])\s*\(?(-?\d+(?:\.\d+)?)\)?\s*=\s*$/.exec(it.prompt);
      if (m) { check(OPS[m[2]](Number(m[1]), Number(m[3])), it, g); continue; }
      m = /^What is (\d+(?:\.\d+)?)% of (\d+)\?$/.exec(it.prompt);
      if (m) { check(Math.round(Number(m[2]) * Number(m[1])) / 100, it, g); continue; }
      m = /^Solve for x:\s+(\d*)x\s*([+−])\s*(\d+)\s*=\s*(-?\d+)$/.exec(it.prompt);
      if (m) { const a = m[1] === '' ? 1 : Number(m[1]); check((Number(m[4]) - (m[2] === '+' ? 1 : -1) * Number(m[3])) / a, it, g); }
    }
  }
}
function check(expected, it, g) {
  keysChecked++;
  if (Math.abs(expected - it.answer) > 1e-9) note(`arithmetic ${g.template_id}: "${it.prompt}" key=${it.answer} expected=${expected}`);
}

// ---- report -----------------------------------------------------------------------
console.log(`\ngoals ${goals.length} · probes built ${probesBuilt} · skills on generated pools ${skillsChecked} · generator variants ${variantsChecked} · answer keys recomputed ${keysChecked}\n`);
if (fail.length) {
  console.error(`PIPELINE VERIFICATION FAILED — ${fail.length} problem${fail.length === 1 ? '' : 's'}\n`);
  [...new Set(fail)].slice(0, 40).forEach(f => console.error('  ' + f));
  process.exit(1);
}
console.log('integrity, alignment, escalation and arithmetic all pass.');
