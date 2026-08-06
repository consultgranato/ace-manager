// =============================================================
// Ace Manager — goal bank authoring DSL
// =============================================================
// The domain files (dom-*.js) are the clinical content of this product, so the
// syntax around them is kept to almost nothing: a section fixes everything
// shared by a run of goals (domain, subskill, probe pool, standard, typical
// eligibility categories), and each template then states only what makes THAT
// skill different.
//
//   const S = section({ domain:'Reading', sub:'Fluency', pool:'rd-fluency', ... });
//   S('fl-01', 'Oral reading fluency in content-area text',
//     'Given {passage}',                       // condition
//     'read aloud for one minute',             // observable behavior
//     'wcpm', { '6-8':120, '9-12':140 }, [3,4],
//     ['read aloud with 95% word accuracy',    // benchmark 1
//      'read aloud with phrasing and 96% accuracy',
//      'read aloud at the target rate with expression'],
//     { note: 'Pair with repeated reading; graph words correct, not words read.' });
//
// Benchmark targets are derived from the goal target unless the array element
// is written as [behavior, target] — state a number only where the clinical
// ladder should not be the default one.

'use strict';

const { BANDS } = require('./core');

function section(defaults) {
  const out = [];
  const S = (id, skill, cond, beh, metric, target, trials, bms, extra) => {
    const e = extra || {};
    if (!Array.isArray(bms) || bms.length !== 3) {
      throw new Error(`${id}: expected 3 benchmarks, got ${(bms || []).length}`);
    }
    const bm = bms.map(b => {
      if (Array.isArray(b)) {
        const row = { beh: b[0] };
        if (b[1] !== undefined && b[1] !== null) row.t = b[1];
        if (b[2]) Object.assign(row, b[2]);
        return row;
      }
      return { beh: b };
    });
    const tpl = {
      bands: BANDS.slice(),
      ...defaults,
      ...e,
      id: (defaults.prefix || '') + id,
      skill, cond, beh, metric, target, trials, bm
    };
    delete tpl.prefix;
    out.push(tpl);
    return tpl;
  };
  S.templates = out;
  return S;
}

// Collect every section's templates in file order.
function collect(...sections) {
  const all = [];
  for (const s of sections) all.push(...s.templates);
  return all;
}

module.exports = { section, collect };
