#!/usr/bin/env node
// ============================================================
// Ace Manager — probe bank builder
//
//     node tools/build-probe-bank.js
//
// Emits data/probe-bank.js: the pool registry (what kind of probe each goal
// gets, how often, and who scores it) plus the curated item sets.
//
// Generated pools contribute NO items to this file — their items are minted on
// demand by js/probe-engine.js, which is the point: a generated pool produces a
// different equivalent form every cycle instead of recycling a fixed list.
//
// Validation is fatal, and it checks the things that would silently produce a
// wrong number rather than an error: an item whose answer index is out of
// range, a tier with no items in a pool the engine will ask for, a pool that
// no goal uses.
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const { POOLS } = require('./goalbank/pools');
const { POOL_ITEMS } = require('./probebank/items');

const errors = [];
const warnings = [];

// ---- validate items -----------------------------------------------------------
let itemCount = 0;
const seenIds = new Set();
for (const [pool, list] of Object.entries(POOL_ITEMS)) {
  if (!POOLS[pool]) { errors.push(`items authored for unknown pool "${pool}"`); continue; }
  const tiers = { 1: 0, 2: 0, 3: 0 };
  for (const it of list) {
    itemCount++;
    if (seenIds.has(it.id)) errors.push(`duplicate item id ${it.id}`);
    seenIds.add(it.id);
    if (!it.prompt) errors.push(`${it.id}: empty prompt`);
    if (!tiers.hasOwnProperty(it.tier)) errors.push(`${it.id}: tier must be 1, 2 or 3`);
    else tiers[it.tier]++;
    if (it.type === 'mc') {
      if (!Array.isArray(it.choices) || it.choices.length < 2) errors.push(`${it.id}: needs at least 2 choices`);
      else if (!(it.answer >= 0 && it.answer < it.choices.length)) errors.push(`${it.id}: answer index ${it.answer} out of range`);
      if (new Set(it.choices).size !== it.choices.length) errors.push(`${it.id}: duplicate choices`);
    } else if (it.type === 'sj') {
      if (!Array.isArray(it.choices) || it.choices.length < 2) errors.push(`${it.id}: needs at least 2 choices`);
      else if (!(it.best >= 0 && it.best < it.choices.length)) errors.push(`${it.id}: best index ${it.best} out of range`);
      for (const p of (it.partial || [])) {
        if (!(p >= 0 && p < it.choices.length)) errors.push(`${it.id}: partial index ${p} out of range`);
        if (p === it.best) errors.push(`${it.id}: best answer also listed as partial credit`);
      }
    } else if (it.type === 'rubric') {
      if (!Array.isArray(it.levels) || it.levels.length !== 4) errors.push(`${it.id}: a rubric row needs exactly 4 level descriptors`);
    } else if (it.type !== 'scale') {
      errors.push(`${it.id}: unknown item type ${it.type}`);
    }
  }
  for (const t of [1, 2, 3]) {
    if (!tiers[t]) errors.push(`pool ${pool}: no tier ${t} items — benchmark ${t} would never be measured`);
  }
}

// ---- validate pools ------------------------------------------------------------
// Every pool must be able to produce items somehow: a generator, curated items,
// or (observation and self-report only) the goal's own benchmarks.
const { execSync } = require('child_process');
for (const [key, p] of Object.entries(POOLS)) {
  const hasGen = !!p.gen;
  const hasItems = !!(POOL_ITEMS[key] && POOL_ITEMS[key].length);
  const canDerive = p.kind === 'observation' || p.kind === 'self_report';
  if (!hasGen && !hasItems && !canDerive) {
    errors.push(`pool ${key} (${p.kind}) has no generator, no curated items and cannot derive from benchmarks`);
  }
  if (p.timed && !p.timed.metric) errors.push(`pool ${key}: timed pools must name the metric they produce`);
}

// Cross-check against the goal bank so a pool nobody points at gets flagged.
const goalBankPath = path.join(__dirname, '..', 'data', 'goal-bank.js');
if (fs.existsSync(goalBankPath)) {
  global.window = {};
  require(goalBankPath);
  const used = new Set((global.window.ACE_GOAL_BANK.templates || []).map(t => t.pool));
  for (const key of Object.keys(POOLS)) if (!used.has(key)) warnings.push(`pool ${key} is not used by any goal`);
  for (const key of used) if (!POOLS[key]) errors.push(`goal bank references unknown pool ${key}`);
}

if (errors.length) {
  console.error('\nPROBE BANK BUILD FAILED\n');
  errors.slice(0, 40).forEach(e => console.error('  ' + e));
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`);
  process.exit(1);
}

// ---- emit -----------------------------------------------------------------------
// Pool metadata only; the authoring helpers in pools.js are build-time.
const pools = {};
for (const [key, p] of Object.entries(POOLS)) {
  pools[key] = {
    label: p.label, kind: p.kind, method: p.method,
    administration: p.administration,
    frequency: p.frequency || 'biweekly',
    items: p.items || 9,
    default_method: p.default_method || p.method
  };
  if (p.gen) pools[key].gen = p.gen;
  if (p.timed) pools[key].timed = p.timed;
  if (POOL_ITEMS[key] && POOL_ITEMS[key].length) pools[key].curated = POOL_ITEMS[key].length;
}

const genCount = Object.values(POOLS).filter(p => p.gen).length;
const header = `// =============================================================
// Ace Manager — probe bank (GENERATED — do not hand-edit)
// =============================================================
// Built by tools/build-probe-bank.js. Re-run the builder instead of editing.
//
// \`pools\` describes HOW each goal is monitored: the kind of probe (student
// academic, student self-report, or adult observation), the cadence, who scores
// it, and how the case manager is meant to administer it.
//
// \`items\` holds the hand-authored items — the ones no generator can honestly
// produce, like inference from a passage or a judgement call about a co-worker.
// Every item carries a tier (1-3) naming the benchmark it measures, so a single
// probe reports a score per benchmark as well as an overall score.
//
// Generated pools appear in \`pools\` with a \`gen\` key and contribute NO items
// here: js/probe-engine.js mints a fresh equivalent form for those every cycle,
// which is what makes a rising progress line mean fluency and not memorisation.
//
// ${Object.keys(pools).length} pools (${genCount} generated) · ${itemCount} curated items
// =============================================================

window.ACE_PROBE_BANK = {
"version": 2,
"built": ${JSON.stringify(new Date().toISOString().slice(0, 10))},
"pools": ${JSON.stringify(pools, null, 1)},
"items": {
`;

const body = Object.entries(POOL_ITEMS)
  .map(([pool, list]) => JSON.stringify(pool) + ': [\n' + list.map(i => JSON.stringify(i)).join(',\n') + '\n]')
  .join(',\n');

fs.writeFileSync(path.join(__dirname, '..', 'data', 'probe-bank.js'), header + body + '\n}};\n');

// ---- report ---------------------------------------------------------------------
const byKind = {};
for (const p of Object.values(pools)) byKind[p.kind] = (byKind[p.kind] || 0) + 1;
const size = fs.statSync(path.join(__dirname, '..', 'data', 'probe-bank.js')).size;
console.log(`\ndata/probe-bank.js — ${Object.keys(pools).length} pools, ${itemCount} curated items (${(size / 1024).toFixed(0)} KB)\n`);
for (const [k, n] of Object.entries(byKind)) console.log(`  ${k.padEnd(14)} ${n} pools`);
console.log(`  generated      ${genCount} pools mint fresh alternate forms each cycle`);
if (warnings.length) { console.log(''); warnings.forEach(w => console.log('  note: ' + w)); }
