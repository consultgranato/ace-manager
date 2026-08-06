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

  // ---- word data for the literacy generators -------------------------------------
  // Small, high-utility sets rather than a dictionary: these are the patterns a
  // secondary intervention actually teaches.
  const W = {
    syll: [['photosynthesis',5],['democracy',4],['temperature',4],['calculator',4],['environment',4],
      ['independent',4],['legislature',4],['hypothesis',4],['calculation',4],['understanding',4],
      ['information',4],['electricity',5],['organization',5],['responsibility',6],['communication',5],
      ['multiplication',5],['constitution',4],['experiment',4],['definition',4],['probability',5],
      ['transportation',4],['significant',4],['evaporation',5],['discrimination',5],['recommendation',5]],
    phon: [['stress',5],['shrink',5],['clasp',5],['blend',5],['scratch',5],['string',5],['spend',5],
      ['crunch',5],['thrift',6],['splash',6],['branch',5],['strength',6],['flinch',6],['sprint',6]],
    vteam: ['detail','remain','complain','approach','floating','proceed','agreement','beneath','repeated',
      'account','announce','allowed','avoid','appoint','employ','because','autumn','withdraw'],
    rctrl: ['partner','market','forward','normal','perfect','service','circuit','confirm','further','disturb',
      'observe','purpose','surface','particular','information','performance'],
    blend: ['strength','construct','instruct','abstract','complex','district','transcript','substance',
      'framework','springboard','landscape','shipment','branches','wrestle'],
    vce: [['hop','hope'],['tap','tape'],['cub','cube'],['plan','plane'],['rid','ride'],['not','note'],
      ['pin','pine'],['can','cane'],['rob','robe'],['spin','spine']],
    irreg: ['through','though','enough','thought','because','friend','island','answer','business','government',
      'necessary','February','Wednesday','受' ,'receipt','weight','height','neighbor','ancient','science'],
    prefix: [['un','not'],['re','again'],['pre','before'],['dis','not or opposite'],['mis','wrongly'],
      ['sub','under'],['inter','between'],['trans','across'],['non','not'],['over','too much'],
      ['under','too little'],['anti','against'],['co','together'],['post','after'],['semi','half']],
    suffix: [['less','without'],['ful','full of'],['ness','the state of being'],['able','able to be'],
      ['ment','the act or result of'],['tion','the act or state of'],['ly','in a manner that is'],
      ['er','one who does'],['ist','a person who does'],['ous','full of'],['ive','tending to']],
    root: [['port','carry'],['dict','say or speak'],['struct','build'],['spect','look'],['scrib','write'],
      ['ject','throw'],['tract','pull'],['form','shape'],['duc','lead'],['vis','see'],['aud','hear'],
      ['graph','write'],['phon','sound'],['bio','life'],['geo','earth'],['therm','heat'],['chron','time'],
      ['meter','measure'],['cred','believe'],['mit','send']],
    homophone: [['their','there','they\'re'],['your','you\'re'],['to','too','two'],['its','it\'s'],
      ['whose','who\'s'],['affect','effect'],['then','than'],['accept','except'],['lose','loose'],
      ['principal','principle'],['weather','whether'],['past','passed']],
    spellRule: [['hope','ing','hoping','drop the silent e before a vowel suffix'],
      ['run','ing','running','double the final consonant'],
      ['carry','ed','carried','change y to i before adding the suffix'],
      ['use','ful','useful','keep the e before a consonant suffix'],
      ['begin','ing','beginning','double the final consonant'],
      ['happy','ness','happiness','change y to i before adding the suffix'],
      ['write','ing','writing','drop the silent e before a vowel suffix'],
      ['stop','ed','stopped','double the final consonant'],
      ['manage','ment','management','keep the e before a consonant suffix'],
      ['study','ed','studied','change y to i before adding the suffix']],
    // Sentences with a single injected error, by error type. [correct, broken, whatIsWrong]
    mech: {
      1: [['My brother and I went to the store.','my brother and i went to the store.','capitalization'],
          ['Where did you put the keys?','Where did you put the keys','end punctuation'],
          ['We visited Chicago in March.','we visited chicago in march.','capitalization'],
          ['That was an amazing game!','That was an amazing game','end punctuation'],
          ['Mr. Alvarez teaches biology.','mr. alvarez teaches biology.','capitalization']],
      2: [['I bought apples, bread, and milk.','I bought apples bread and milk.','commas in a series'],
          ['After the game, we went home.','After the game we went home.','comma after an introductory phrase'],
          ['That is my sister\'s locker.','That is my sisters locker.','apostrophe in a possessive'],
          ['They\'re going to be late.','Theyre going to be late.','apostrophe in a contraction'],
          ['On June 4, 2027, the lease ends.','On June 4 2027 the lease ends.','commas in a date']],
      3: [['The manager, who started last year, approved it.','The manager who started last year approved it.','commas around a nonrestrictive clause'],
          ['It rained all day; the game was cancelled.','It rained all day, the game was cancelled.','comma splice'],
          ['"I finished it," she said.','"I finished it" she said.','punctuation inside a quotation'],
          ['We ran late, so we took the bus.','We ran late so we took the bus.','comma before a coordinating conjunction'],
          ['The students\' projects were displayed.','The students projects were displayed.','plural possessive apostrophe']]
    },
    usage: {
      1: [['The dogs run every morning.','The dogs runs every morning.','subject-verb agreement'],
          ['She walked to the bus stop.','She walk to the bus stop.','verb tense'],
          ['He and I finished the project.','Him and me finished the project.','pronoun case'],
          ['They were ready early.','They was ready early.','subject-verb agreement'],
          ['I saw the movie last night.','I seen the movie last night.','irregular past tense']],
      2: [['The box of tools is heavy.','The box of tools are heavy.','agreement across an interrupting phrase'],
          ['Each of the students has a locker.','Each of the students have a locker.','indefinite pronoun agreement'],
          ['She sang more beautifully than he did.','She sang more beautiful than he did.','adjective used for an adverb'],
          ['The team plays its first game Friday.','The team plays their first game Friday.','collective noun agreement'],
          ['He had already gone home.','He had already went home.','past participle']],
      3: [['Neither the coach nor the players were ready.','Neither the coach nor the players was ready.','agreement with correlative subjects'],
          ['Running late, I missed the bus.','Running late, the bus was missed.','dangling modifier'],
          ['She likes hiking, swimming and running.','She likes hiking, to swim and running.','parallel structure'],
          ['If I were you, I would apply.','If I was you, I would apply.','subjunctive mood'],
          ['The report, which I finished, is due.','The report, that I finished, is due.','relative pronoun choice']]
    },
    combine: [[['The bus was late.','We missed first period.'],'The bus was late, so we missed first period.'],
      [['She studied for hours.','She still felt nervous.'],'Although she studied for hours, she still felt nervous.'],
      [['The store closed early.','We could not buy supplies.'],'Because the store closed early, we could not buy supplies.'],
      [['He finished the application.','He submitted it online.'],'He finished the application and submitted it online.'],
      [['The machine stopped.','Nobody knew why.'],'The machine stopped, but nobody knew why.']]
  };
  // A stray character slipped into the irregular word list at authoring time;
  // filter defensively rather than shipping a nonsense probe item.
  W.irreg = W.irreg.filter(w => /^[A-Za-z']+$/.test(w));

  // ---- literacy generators ---------------------------------------------------------
  const GEN = {};

  GEN.syllables = function (tier, r) {
    const pool = W.syll.filter(w => tier === 1 ? w[1] <= 3 : tier === 2 ? w[1] === 4 : w[1] >= 4);
    const [word, n] = pick(r, pool.length ? pool : W.syll);
    if (tier === 3 && r() < 0.4) {
      return { type: 'numeric', prompt: `How many syllables are in the word "${word}"?`, answer: n };
    }
    const o = mc(r, n, [n - 1, n + 1, n + 2, Math.max(1, n - 2)]);
    return { type: 'mc', prompt: `How many syllables are in the word "${word}"?`, choices: o.choices, answer: o.answer };
  };

  GEN.phonology = function (tier, r) {
    if (tier === 1) {
      const [word, n] = pick(r, W.phon);
      const o = mc(r, n, [n - 1, n + 1, n - 2]);
      return { type: 'mc', prompt: `How many separate sounds (phonemes) are in the word "${word}"?`, choices: o.choices, answer: o.answer };
    }
    if (tier === 2) {
      const pairs = [['brace','race'],['stop','top'],['train','rain'],['clamp','lamp'],['spark','park'],
        ['flight','light'],['scare','care'],['blend','lend']];
      const [full, cut] = pick(r, pairs);
      const o = mc(r, cut, [full.slice(1), full.slice(2), cut.slice(1)]);
      return { type: 'mc', prompt: `Say "${full}" without the first sound. What word is left?`, choices: o.choices, answer: o.answer };
    }
    const subs = [['mock','/d/','dock'],['pin','/w/','win'],['cat','/b/','bat'],['run','/f/','fun'],
      ['sink','/l/','link'],['tall','/b/','ball'],['ride','/h/','hide']];
    const [word, sound, result] = pick(r, subs);
    const o = mc(r, result, [word, result.slice(0, -1) + 'e', word.slice(1)]);
    return { type: 'mc', prompt: `Replace the first sound of "${word}" with a ${sound} sound. What word do you get?`, choices: o.choices, answer: o.answer };
  };

  GEN.decoding = function (tier, r) {
    const bank = tier === 1 ? W.vteam : tier === 2 ? W.rctrl : W.blend;
    const word = pick(r, bank);
    const kinds = [
      () => {
        const n = word.replace(/[^aeiouy]/g, '').length;
        const o = mc(r, n, [n - 1, n + 1, n + 2]);
        return { type: 'mc', prompt: `How many vowel sounds do you hear in "${word}"?`, choices: o.choices, answer: o.answer };
      },
      () => {
        const others = shuffle(r, W.vteam.concat(W.rctrl, W.blend).filter(w => w !== word)).slice(0, 3);
        const o = mc(r, word, others);
        return { type: 'mc', prompt: `Which word is spelled correctly?`, choices: o.choices.map((c, i) => i === o.answer ? c : misspell(r, c)), answer: o.answer };
      }
    ];
    return pick(r, kinds)();
  };
  function misspell(r, w) {
    const i = ri(r, 1, Math.max(1, w.length - 2));
    return w.slice(0, i) + w[i] + w.slice(i);
  }

  GEN.morphology = function (tier, r) {
    if (tier === 1) {
      const [p, meaning] = pick(r, W.prefix);
      const others = shuffle(r, W.prefix.filter(x => x[0] !== p)).slice(0, 3).map(x => x[1]);
      const o = mc(r, meaning, others);
      return { type: 'mc', prompt: `What does the prefix "${p}-" mean?`, choices: o.choices, answer: o.answer };
    }
    if (tier === 2) {
      const [s, meaning] = pick(r, W.suffix);
      const others = shuffle(r, W.suffix.filter(x => x[0] !== s)).slice(0, 3).map(x => x[1]);
      const o = mc(r, meaning, others);
      return { type: 'mc', prompt: `What does the suffix "-${s}" mean?`, choices: o.choices, answer: o.answer };
    }
    const [root, meaning] = pick(r, W.root);
    const others = shuffle(r, W.root.filter(x => x[0] !== root)).slice(0, 3).map(x => x[1]);
    const o = mc(r, meaning, others);
    return { type: 'mc', prompt: `What does the root "${root}" mean?`, choices: o.choices, answer: o.answer };
  };

  GEN.spelling = function (tier, r) {
    if (tier === 1) {
      const w = pick(r, W.irreg);
      const o = mc(r, w, [misspell(r, w), w.replace(/e/, 'a'), w.replace(/o/, 'u')].filter(x => x !== w));
      return { type: 'mc', prompt: 'Which spelling is correct?', choices: o.choices, answer: o.answer };
    }
    const [base, suf, correct, rule] = pick(r, W.spellRule);
    if (tier === 3) {
      const others = shuffle(r, W.spellRule.filter(x => x[3] !== rule)).slice(0, 3).map(x => x[3]);
      const o = mc(r, rule, others);
      return { type: 'mc', prompt: `To spell "${base}" + "-${suf}" as "${correct}", which rule applies?`, choices: o.choices, answer: o.answer };
    }
    const o = mc(r, correct, [base + suf, base.slice(0, -1) + suf, base + base.slice(-1) + suf]);
    return { type: 'mc', prompt: `Add "-${suf}" to "${base}". Which spelling is correct?`, choices: o.choices, answer: o.answer };
  };

  GEN.mechanics = function (tier, r) {
    const [correct, broken, what] = pick(r, W.mech[tier] || W.mech[1]);
    if (r() < 0.5) {
      const o = mc(r, correct, (W.mech[tier] || W.mech[1]).filter(x => x[0] !== correct).map(x => x[1]));
      return { type: 'mc', prompt: 'Which sentence is punctuated and capitalized correctly?', choices: o.choices, answer: o.answer };
    }
    const all = [].concat(W.mech[1], W.mech[2], W.mech[3]).map(x => x[2]);
    const o = mc(r, what, shuffle(r, all.filter(x => x !== what)).slice(0, 3));
    return { type: 'mc', prompt: `What is wrong with this sentence?\n"${broken}"`, choices: o.choices, answer: o.answer };
  };

  GEN.usage = function (tier, r) {
    const [correct, broken, what] = pick(r, W.usage[tier] || W.usage[1]);
    if (r() < 0.5) {
      const o = mc(r, correct, (W.usage[tier] || W.usage[1]).filter(x => x[0] !== correct).map(x => x[1]));
      return { type: 'mc', prompt: 'Which sentence is grammatically correct?', choices: o.choices, answer: o.answer };
    }
    const all = [].concat(W.usage[1], W.usage[2], W.usage[3]).map(x => x[2]);
    const o = mc(r, what, shuffle(r, all.filter(x => x !== what)).slice(0, 3));
    return { type: 'mc', prompt: `What is the error in this sentence?\n"${broken}"`, choices: o.choices, answer: o.answer };
  };

  GEN.editing = GEN.mechanics;

  GEN.sentence = function (tier, r) {
    if (tier === 1) {
      const frags = [['Because the bus was late.','fragment'],['We waited outside.','complete sentence'],
        ['Running down the hall.','fragment'],['The lock was broken.','complete sentence'],
        ['Which she finished yesterday.','fragment'],['He applied for the job.','complete sentence']];
      const [s, kind] = pick(r, frags);
      const o = mc(r, kind, ['fragment', 'complete sentence', 'run-on sentence'].filter(k => k !== kind));
      return { type: 'mc', prompt: `Is this a complete sentence?\n"${s}"`, choices: o.choices, answer: o.answer };
    }
    const [parts, combined] = pick(r, W.combine);
    const others = W.combine.filter(x => x[1] !== combined).map(x => x[1]);
    const o = mc(r, combined, others);
    return { type: 'mc', prompt: `Combine these into one clear sentence:\n"${parts[0]}" "${parts[1]}"`, choices: o.choices, answer: o.answer };
  };

  // ---- math generators ---------------------------------------------------------------
  const money = n => '$' + Number(n).toFixed(2);

  // opts.ops restricts which operations appear. A multiplication fact-fluency
  // goal probed with addition items would report a per-benchmark score for a
  // skill the goal never named, so the goal tells the generator what it is
  // about rather than the pool guessing.
  GEN.facts = function (tier, r, opts) {
    const hi = tier === 1 ? 5 : tier === 2 ? 9 : 12;
    const allowed = (opts && opts.ops && opts.ops.length) ? opts.ops
      : (tier === 1 ? ['+', '-'] : tier === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷']);
    const op = pick(r, allowed);
    let a = ri(r, 2, hi), b = ri(r, 2, hi), ans;
    if (op === '+') ans = a + b;
    else if (op === '-') { if (b > a) [a, b] = [b, a]; ans = a - b; }
    else if (op === '×') ans = a * b;
    else { const p = a * b; ans = a; return { type: 'numeric', prompt: `${p} ÷ ${b} =`, answer: ans }; }
    return { type: 'numeric', prompt: `${a} ${op} ${b} =`, answer: ans };
  };

  GEN.computation = function (tier, r) {
    if (tier === 1) {
      const a = ri(r, 12, 99), b = ri(r, 12, 99);
      return pick(r, [
        { type: 'numeric', prompt: `${a} + ${b} =`, answer: a + b },
        { type: 'numeric', prompt: `${Math.max(a, b)} − ${Math.min(a, b)} =`, answer: Math.abs(a - b) }
      ]);
    }
    if (tier === 2) {
      const a = ri(r, 120, 999), b = ri(r, 12, 99);
      return pick(r, [
        { type: 'numeric', prompt: `${a} + ${b} =`, answer: a + b },
        { type: 'numeric', prompt: `${a} − ${b} =`, answer: a - b },
        { type: 'numeric', prompt: `${ri(r, 12, 99)} × ${ri(r, 2, 9)} =`, answer: 0 }
      ].map(it => it.answer === 0 ? (function () { const x = ri(r, 12, 99), y = ri(r, 2, 9); return { type: 'numeric', prompt: `${x} × ${y} =`, answer: x * y }; })() : it));
    }
    const x = ri(r, 12, 99), y = ri(r, 12, 40);
    return pick(r, [
      { type: 'numeric', prompt: `${x} × ${y} =`, answer: x * y },
      (function () { const d = ri(r, 3, 12), q = ri(r, 12, 60); return { type: 'numeric', prompt: `${d * q} ÷ ${d} =`, answer: q }; })(),
      (function () { const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9); return { type: 'numeric', prompt: `${a} + ${b} × ${c} =`, answer: a + b * c }; })()
    ]);
  };

  GEN.numbersense = function (tier, r) {
    if (tier === 1) {
      const n = ri(r, 1000, 99999);
      const place = pick(r, [['tens', 10], ['hundreds', 100], ['thousands', 1000]]);
      const digit = Math.floor(n / place[1]) % 10;
      const o = mc(r, digit, [(digit + 1) % 10, (digit + 2) % 10, (digit + 5) % 10]);
      return { type: 'mc', prompt: `In the number ${n.toLocaleString()}, which digit is in the ${place[0]} place?`, choices: o.choices, answer: o.answer };
    }
    if (tier === 2) {
      const n = ri(r, 1000, 99999);
      const to = pick(r, [[10, 'ten'], [100, 'hundred'], [1000, 'thousand']]);
      return { type: 'numeric', prompt: `Round ${n.toLocaleString()} to the nearest ${to[1]}.`, answer: Math.round(n / to[0]) * to[0] };
    }
    const vals = shuffle(r, [ri(r, 1, 9) / 10, ri(r, 10, 99) / 100, ri(r, 1, 4) / ri(r, 5, 8), ri(r, 1, 3)]);
    const smallest = Math.min.apply(null, vals);
    const shown = vals.map(v => v.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''));
    const o = mc(r, Number(smallest).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''), shown);
    return { type: 'mc', prompt: 'Which value is the smallest?', choices: o.choices, answer: o.answer };
  };

  // opts.focus === 'percent' keeps every tier inside percent-of-a-number work
  // for the goals that are specifically about that, rather than walking the
  // whole rational-number strand.
  GEN.fractions = function (tier, r, opts) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    if (opts && opts.focus === 'percent') {
      const whole = ri(r, 20, tier === 1 ? 100 : 400);
      const pct = tier === 1 ? pick(r, [10, 25, 50]) : tier === 2 ? pick(r, [5, 15, 20, 30, 40, 75]) : ri(r, 1, 99);
      return { type: 'numeric', prompt: `What is ${pct}% of ${whole}?`, answer: Math.round(whole * pct) / 100 };
    }
    if (opts && opts.focus === 'compare') {
      const d1 = pick(r, [3, 4, 5, 6, 8]), d2 = pick(r, [4, 6, 8, 10, 12]);
      const n1 = ri(r, 1, d1 - 1), n2 = ri(r, 1, d2 - 1);
      const bigger = (n1 / d1) === (n2 / d2) ? 'They are equal' : (n1 / d1 > n2 / d2 ? `${n1}/${d1}` : `${n2}/${d2}`);
      const o = mc(r, bigger, [`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal']);
      return { type: 'mc', prompt: `Which is greater, ${n1}/${d1} or ${n2}/${d2}?`, choices: o.choices, answer: o.answer };
    }
    if (tier === 1) {
      const d = pick(r, [2, 4, 5, 8, 10]), n = ri(r, 1, d - 1);
      const dec = n / d;
      const o = mc(r, dec.toFixed(2), [(dec + 0.1).toFixed(2), (dec / 2).toFixed(2), (1 - dec).toFixed(2)]);
      return { type: 'mc', prompt: `Write ${n}/${d} as a decimal.`, choices: o.choices, answer: o.answer };
    }
    if (tier === 2) {
      const d = pick(r, [4, 6, 8, 10, 12]);
      const a = ri(r, 1, d - 1), b = ri(r, 1, d - 1);
      const sum = a + b, g = gcd(sum, d);
      return { type: 'text', prompt: `${a}/${d} + ${b}/${d} = ? (write your answer in simplest form, like 3/4)`, answer: `${sum / g}/${d / g}` };
    }
    const whole = ri(r, 20, 400), pct = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 75]);
    return { type: 'numeric', prompt: `What is ${pct}% of ${whole}?`, answer: Math.round(whole * pct) / 100 };
  };

  GEN.integers = function (tier, r) {
    const a = ri(r, -20, 20), b = ri(r, -20, 20);
    if (tier === 1) return { type: 'numeric', prompt: `${a} + (${b}) =`, answer: a + b };
    if (tier === 2) return { type: 'numeric', prompt: `${a} − (${b}) =`, answer: a - b };
    const c = ri(r, -12, 12) || 3;
    return pick(r, [
      { type: 'numeric', prompt: `${a} × (${c}) =`, answer: a * c },
      { type: 'numeric', prompt: `|${a}| + (${b}) =`, answer: Math.abs(a) + b }
    ]);
  };

  GEN.ratio = function (tier, r) {
    if (tier === 1) {
      const a = ri(r, 2, 9), k = ri(r, 2, 6);
      return { type: 'numeric', prompt: `${a} is to ${a * 2} as ${a * k} is to ___`, answer: a * 2 * k };
    }
    if (tier === 2) {
      const qty = ri(r, 2, 12), cost = ri(r, 200, 2400) / 100;
      return { type: 'numeric', prompt: `${qty} items cost ${money(cost * qty)}. What is the cost of one item? (enter a number, like 3.50)`, answer: Math.round(cost * 100) / 100 };
    }
    const sizeA = ri(r, 8, 16), priceA = ri(r, 300, 700) / 100;
    const sizeB = sizeA * 2, priceB = Math.round(priceA * 1.8 * 100) / 100;
    const better = (priceA / sizeA) <= (priceB / sizeB) ? `${sizeA} oz for ${money(priceA)}` : `${sizeB} oz for ${money(priceB)}`;
    const o = mc(r, better, [`${sizeA} oz for ${money(priceA)}`, `${sizeB} oz for ${money(priceB)}`, 'They cost the same per ounce']);
    return { type: 'mc', prompt: `Which is the better buy?`, choices: o.choices, answer: o.answer };
  };

  GEN.algebra = function (tier, r) {
    const x = ri(r, 2, 15), a = ri(r, 2, 9), b = ri(r, 1, 20);
    if (tier === 1) return { type: 'numeric', prompt: `Solve for x:   x + ${b} = ${x + b}`, answer: x };
    if (tier === 2) return { type: 'numeric', prompt: `Solve for x:   ${a}x + ${b} = ${a * x + b}`, answer: x };
    return pick(r, [
      { type: 'numeric', prompt: `Solve for x:   ${a}(x + ${b}) = ${a * (x + b)}`, answer: x },
      (function () { const c = ri(r, 2, 6); return { type: 'numeric', prompt: `Solve for x:   ${a}x + ${b} = ${a - c > 0 ? a - c : a + c}x + ${(a - (a - c > 0 ? a - c : a + c)) * x + b}`, answer: x }; })(),
      (function () { const m = ri(r, 2, 6), bb = ri(r, 1, 9), xx = ri(r, 2, 9); return { type: 'numeric', prompt: `If y = ${m}x + ${bb}, what is y when x = ${xx}?`, answer: m * xx + bb }; })()
    ]);
  };

  GEN.geometry = function (tier, r) {
    if (tier === 1) {
      const w = ri(r, 3, 20), h = ri(r, 3, 20);
      return pick(r, [
        { type: 'numeric', prompt: `A rectangle is ${w} cm by ${h} cm. What is its perimeter, in cm?`, answer: 2 * (w + h) },
        { type: 'numeric', prompt: `A rectangle is ${w} cm by ${h} cm. What is its area, in square cm?`, answer: w * h }
      ]);
    }
    if (tier === 2) {
      const b = ri(r, 4, 20), h = ri(r, 4, 20) * 2;
      return pick(r, [
        { type: 'numeric', prompt: `A triangle has a base of ${b} cm and a height of ${h} cm. What is its area, in square cm?`, answer: b * h / 2 },
        (function () { const a1 = ri(r, 20, 70); return { type: 'numeric', prompt: `Two angles are complementary. One measures ${a1}°. What is the other, in degrees?`, answer: 90 - a1 }; })()
      ]);
    }
    return pick(r, [
      (function () { const l = ri(r, 3, 12), w = ri(r, 3, 12), h = ri(r, 3, 12);
        return { type: 'numeric', prompt: `A rectangular prism is ${l} × ${w} × ${h} cm. What is its volume, in cubic cm?`, answer: l * w * h }; })(),
      (function () { const a = pick(r, [3, 6, 5, 8, 9]), b = a === 3 ? 4 : a === 6 ? 8 : a === 5 ? 12 : a === 8 ? 15 : 12;
        return { type: 'numeric', prompt: `A right triangle has legs of ${a} and ${b}. What is the length of the hypotenuse?`, answer: Math.round(Math.sqrt(a * a + b * b) * 100) / 100 }; })()
    ]);
  };

  GEN.data = function (tier, r) {
    const n = tier === 1 ? 4 : tier === 2 ? 5 : 6;
    const set = Array.from({ length: n }, () => ri(r, 2, 40));
    const sorted = set.slice().sort((a, b) => a - b);
    if (tier === 1) return { type: 'numeric', prompt: `Data set: ${set.join(', ')}\nWhat is the range?`, answer: sorted[n - 1] - sorted[0] };
    if (tier === 2) {
      const sum = set.reduce((a, b) => a + b, 0);
      return { type: 'numeric', prompt: `Data set: ${set.join(', ')}\nWhat is the mean? (round to one decimal place)`, answer: Math.round(sum / n * 10) / 10 };
    }
    const mid = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    return { type: 'numeric', prompt: `Data set: ${set.join(', ')}\nWhat is the median?`, answer: mid };
  };

  GEN.wordproblem = function (tier, r) {
    const names = ['Maya', 'Jordan', 'Ivan', 'Priya', 'Devon', 'Ana', 'Marcus', 'Leila'];
    const nm = pick(r, names);
    if (tier === 1) {
      const a = ri(r, 4, 30), b = ri(r, 3, 20);
      return { type: 'numeric', prompt: `${nm} had ${a} tickets and used ${b} of them. How many tickets are left?`, answer: a - b };
    }
    if (tier === 2) {
      const hrs = ri(r, 3, 20), rate = ri(r, 1200, 1900) / 100;
      return { type: 'numeric', prompt: `${nm} works ${hrs} hours at ${money(rate)} per hour. What are the gross earnings? (enter a number)`, answer: Math.round(hrs * rate * 100) / 100 };
    }
    const price = ri(r, 1500, 8000) / 100, disc = pick(r, [10, 15, 20, 25]), tax = 8.25;
    const after = price * (1 - disc / 100);
    return { type: 'numeric', prompt: `${nm} buys an item priced at ${money(price)} with ${disc}% off, then pays ${tax}% sales tax. What is the final total? (round to the nearest cent)`, answer: Math.round(after * (1 + tax / 100) * 100) / 100 };
  };

  GEN.consumer = GEN.money = function (tier, r) {
    if (tier === 1) {
      const cents = ri(r, 105, 1995);
      const next = Math.ceil(cents / 100);
      const o = mc(r, '$' + next, ['$' + (next - 1), '$' + (next + 1), '$' + (next + 2)]);
      return { type: 'mc', prompt: `An item costs ${money(cents / 100)}. Using the next-dollar strategy, how many whole dollars do you hand the cashier?`, choices: o.choices, answer: o.answer };
    }
    if (tier === 2) {
      const price = ri(r, 250, 1850) / 100, paid = Math.ceil(price / 5) * 5;
      return { type: 'numeric', prompt: `An item costs ${money(price)}. You pay with ${money(paid)}. How much change should you get back? (enter a number)`, answer: Math.round((paid - price) * 100) / 100 };
    }
    const sub = ri(r, 1200, 9000) / 100, tax = 8.25, tip = pick(r, [15, 18, 20]);
    return pick(r, [
      { type: 'numeric', prompt: `A bill is ${money(sub)}. With ${tax}% sales tax, what is the total? (round to the nearest cent)`, answer: Math.round(sub * (1 + tax / 100) * 100) / 100 },
      { type: 'numeric', prompt: `A restaurant bill is ${money(sub)}. What is a ${tip}% tip? (round to the nearest cent)`, answer: Math.round(sub * tip) / 100 }
    ]);
  };

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

    // Per-goal generator options: which operation a fact-fluency goal is about,
    // which sub-strand a fractions goal targets. Without these one pool-level
    // generator would probe a multiplication goal with addition items.
    const genOpts = (goal.probe_plan && goal.probe_plan.gen_opts) || goal.gen_opts || {};

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
      } else if (pool.gen && GEN[pool.gen]) {
        // Generators can land on the same item twice by chance. Retry a bounded
        // number of times rather than handing a student the same question
        // twice in one probe, which reads as a bug and skews the score.
        const seenPrompt = {};
        let guard = 0;
        while (got.length < want && guard < want * 12) {
          guard++;
          const it = GEN[pool.gen](tier, r, genOpts);
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
    GENERATORS: GEN
  };
})();
