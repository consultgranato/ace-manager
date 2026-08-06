// =============================================================
// Ace Manager — probe item generators
// =============================================================
// One generator per probe pool, and inside it ONE VARIANT PER SKILL.
//
// This structure exists because of a real defect: the algebra pool serves
// eleven different skills — evaluating expressions, combining like terms,
// graphing lines, interpreting slope, systems — and a single generator emitted
// "Solve for x" for all of them. A student with a graphing goal was probed on
// equation solving, and the per-benchmark breakdown then reported progress on a
// skill the goal never named. A probe that measures the wrong thing is worse
// than no probe, because it produces a number somebody will put in front of a
// parent.
//
// So every template on a generated pool must declare `gen_opts.v` naming its
// variant, and tools/build-goal-bank.js FAILS if it does not, or if the named
// variant does not exist. Alignment is enforced at build time rather than left
// to reviewer attention.
//
// Each variant is a function (tier, rng, opts) -> item. Tier 1-3 must track the
// goal's own three benchmarks: tier 1 is the entry rung, tier 3 is the goal.
//
// Where a skill genuinely cannot be auto-generated — scoring a student's own
// writing, watching them measure a board — the goal belongs on an observation
// or curated pool instead. Inventing a multiple-choice stand-in for those would
// measure recognition and call it performance.

(function () {
  'use strict';

  // ---- helpers -----------------------------------------------------------------
  const ri = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
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
  const MC = (r, prompt, correct, distractors) => {
    const o = mc(r, correct, distractors);
    return { type: 'mc', prompt, choices: o.choices, answer: o.answer };
  };
  const NUM = (prompt, answer) => ({ type: 'numeric', prompt, answer });
  const TXT = (prompt, answer) => ({ type: 'text', prompt, answer });
  const money = n => '$' + Number(n).toFixed(2);
  // "1x" is not how anyone writes a coefficient of one, and a student who has
  // been taught the convention will read it as an error in the question.
  const coef = m => (m === 1 ? 'x' : m === -1 ? '−x' : `${m}x`);
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const NAMES = ['Maya', 'Jordan', 'Ivan', 'Priya', 'Devon', 'Ana', 'Marcus', 'Leila', 'Sofia', 'Omar'];

  // Wrap a variant map into a generator, and expose the variant names so the
  // bank builder can verify every goal points at one that exists.
  function variants(map, fallback) {
    const fn = function (tier, r, opts) {
      const v = opts && opts.v;
      const impl = (v && map[v]) || map[fallback] || map[Object.keys(map)[0]];
      return impl(tier, r, opts || {});
    };
    fn.VARIANTS = Object.keys(map);
    return fn;
  }

  const GEN = {};

  // =============================================================================
  // MATH
  // =============================================================================

  GEN.algebra = variants({
    evaluate: (t, r) => {
      const x = ri(r, 2, 12), y = ri(r, 2, 9), a = ri(r, 2, 9), b = ri(r, 1, 15);
      if (t === 1) return NUM(`Evaluate  ${coef(a)}  when x = ${x}`, a * x);
      if (t === 2) return NUM(`Evaluate  ${coef(a)} + ${b}  when x = ${x}`, a * x + b);
      const yy = ri(r, 2, 6);
      return NUM(`Evaluate  ${a}x − ${y}y  when x = ${x} and y = ${yy}`, a * x - y * yy);
    },
    liketerms: (t, r) => {
      const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9);
      if (t === 1) return MC(r, `Which terms in  ${a}x + ${b}y + ${c}x  are like terms?`,
        `${a}x and ${c}x`, [`${a}x and ${b}y`, `${b}y and ${c}x`, 'There are none']);
      if (t === 2) return TXT(`Simplify:  ${a}x + ${c}x  (write like 7x)`, `${a + c}x`);
      return TXT(`Simplify:  ${a}(x + ${b}) + ${c}x  (write like 7x + 14)`, `${a + c}x + ${a * b}`);
    },
    onestep: (t, r) => {
      const x = ri(r, 2, 20), b = ri(r, 2, 20), a = ri(r, 2, 9);
      if (t === 1) return NUM(`Solve for x:   x + ${b} = ${x + b}`, x);
      if (t === 2) return NUM(`Solve for x:   x − ${b} = ${x - b}`, x);
      return pick(r, [NUM(`Solve for x:   ${a}x = ${a * x}`, x), NUM(`Solve for x:   x/${a} = ${x}`, a * x)]);
    },
    multistep: (t, r) => {
      const x = ri(r, 2, 12), a = ri(r, 2, 9), b = ri(r, 1, 15), c = ri(r, 2, 6);
      if (t === 1) return NUM(`Solve for x:   ${a}x + ${b} = ${a * x + b}`, x);
      if (t === 2) return NUM(`Solve for x:   ${a}(x + ${b}) = ${a * (x + b)}`, x);
      return NUM(`Solve for x:   ${a + c}x + ${b} = ${c}x + ${c * x + b + a * x}`, x);
    },
    inequality: (t, r) => {
      const x = ri(r, 2, 12), a = ri(r, 2, 6), b = ri(r, 1, 12);
      if (t === 1) return MC(r, `Which numbers make  x > ${b}  true?`,
        `every number greater than ${b}`, [`every number less than ${b}`, `only ${b}`, `only ${b + 1}`]);
      if (t === 2) return NUM(`Solve for x:   x + ${b} > ${x + b}  — what is the smallest whole number x that does NOT work?`, x);
      return MC(r, `Solve:   −${a}x > ${a * x}. What happens to the inequality sign?`,
        'it flips, because both sides are divided by a negative',
        ['it stays the same', 'it becomes an equals sign', 'the inequality has no solution']);
    },
    writeeq: (t, r) => {
      const nm = pick(r, NAMES), rate = ri(r, 8, 20), fee = ri(r, 10, 60), h = ri(r, 2, 9);
      if (t === 1) return MC(r, `${nm} earns $${rate} per hour. Which equation gives pay p for h hours?`,
        `p = ${rate}h`, [`p = h + ${rate}`, `p = ${rate} + h`, `h = ${rate}p`]);
      if (t === 2) return MC(r, `${nm} pays a $${fee} fee plus $${rate} per hour. Which equation gives cost c for h hours?`,
        `c = ${rate}h + ${fee}`, [`c = ${fee}h + ${rate}`, `c = ${rate}h`, `c = ${rate} + ${fee}`]);
      return NUM(`${nm} pays a $${fee} fee plus $${rate} per hour. Write and solve for the cost of ${h} hours.`, rate * h + fee);
    },
    graphing: (t, r) => {
      const m = ri(r, 1, 5), b = ri(r, -6, 8), x = ri(r, 1, 6);
      if (t === 1) {
        const px = ri(r, -5, 5), py = ri(r, -5, 5);
        return MC(r, `Which quadrant contains the point (${px}, ${py})?`,
          px > 0 && py > 0 ? 'Quadrant I' : px < 0 && py > 0 ? 'Quadrant II' : px < 0 && py < 0 ? 'Quadrant III' : px > 0 && py < 0 ? 'Quadrant IV' : 'On an axis',
          ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV', 'On an axis']);
      }
      if (t === 2) {
        const rhs = b === 0 ? coef(m) : `${coef(m)} ${b < 0 ? '− ' + Math.abs(b) : '+ ' + b}`;
        return NUM(`For  y = ${rhs}, complete the table: when x = ${x}, y = ?`, m * x + b);
      }
      const m2 = m + ri(r, 1, 4);
      return MC(r, `Which line is steeper:  y = ${coef(m)} + 1  or  y = ${coef(m2)} − 2 ?`,
        'the second line, because its slope is larger',
        ['the first line, because its intercept is larger', 'they are equally steep', 'you cannot tell without graphing']);
    },
    slopeint: (t, r) => {
      const m = ri(r, 2, 12), b = ri(r, 5, 60), x = ri(r, 2, 10);
      if (t === 1) return MC(r, `In  y = ${coef(m)} + ${b}, what is the slope?`, String(m), [String(b), String(m + b), '1']);
      if (t === 2) return MC(r, `A phone plan costs  c = ${m}g + ${b}, where g is gigabytes. What does the ${b} represent?`,
        'the fixed monthly cost before any data is used',
        [`the cost per gigabyte`, 'the total bill', 'the number of gigabytes included']);
      return NUM(`A plan costs  c = ${m}g + ${b}. What is the bill for ${x} gigabytes?`, m * x + b);
    },
    systems: (t, r) => {
      const x = ri(r, 1, 8), y = ri(r, 1, 8), a = ri(r, 1, 4), b = ri(r, 1, 4);
      if (t === 1) return MC(r, `Two lines cross at (${x}, ${y}). What does that point mean?`,
        'it is the solution that satisfies both equations',
        ['it is the slope of both lines', 'it is the y-intercept', 'the system has no solution']);
      if (t === 2) return NUM(`Solve the system:   y = x + ${y - x}   and   y = ${a}x + ${y - a * x}.   What is x?`, x);
      return NUM(`Solve the system:   x + y = ${x + y}   and   ${a}x + ${b}y = ${a * x + b * y}.   What is y?`, y);
    },
    patterns: (t, r) => {
      const start = ri(r, 2, 12), step = ri(r, 2, 9), n = ri(r, 8, 20);
      if (t === 1) return NUM(`Continue the pattern:  ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ___`, start + 4 * step);
      if (t === 2) return MC(r, `What is the rule for  ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step} ?`,
        `add ${step} each time`, [`multiply by ${step} each time`, `add ${step + 1} each time`, `subtract ${step} each time`]);
      return NUM(`A pattern starts at ${start} and adds ${step} each time. What is the ${n}th term?`, start + (n - 1) * step);
    },
    functions: (t, r) => {
      const m = ri(r, 2, 8), b = ri(r, 1, 12), x = ri(r, 2, 9);
      if (t === 1) return NUM(`The rule is "multiply by ${m}". Complete the table: input ${x} gives output ___`, m * x);
      if (t === 2) return NUM(`If  f(x) = ${m}x + ${b}, what is  f(${x}) ?`, m * x + b);
      return NUM(`If  f(x) = ${m}x + ${b}  and  f(x) = ${m * x + b}, what is x?`, x);
    }
  }, 'onestep');

  GEN.geometry = variants({
    measure: (t, r) => {
      if (t === 1) return MC(r, 'A line measures exactly halfway between the 4 and 5 inch marks. How long is it?',
        '4 1/2 inches', ['4 1/4 inches', '5 1/2 inches', '9 inches']);
      if (t === 2) return MC(r, 'A board measures 3 marks past 7 inches on a ruler divided into quarters. How long is it?',
        '7 3/4 inches', ['7 1/4 inches', '7 1/2 inches', '10 inches']);
      const cm = ri(r, 3, 40);
      return NUM(`A part is ${cm} cm long. How many millimetres is that?`, cm * 10);
    },
    perimarea: (t, r) => {
      const w = ri(r, 3, 20), h = ri(r, 3, 20), b = ri(r, 4, 20), th = ri(r, 4, 20) * 2;
      if (t === 1) return NUM(`A rectangle is ${w} cm by ${h} cm. What is its perimeter, in cm?`, 2 * (w + h));
      if (t === 2) return NUM(`A rectangle is ${w} cm by ${h} cm. What is its area, in square cm?`, w * h);
      return NUM(`A shape is a ${w}×${h} cm rectangle with a triangle on top, base ${b} cm and height ${th} cm. What is the total area, in square cm?`, w * h + b * th / 2);
    },
    circles: (t, r) => {
      const d = ri(r, 2, 20) * 2;
      if (t === 1) return NUM(`A circle has a diameter of ${d} cm. What is its radius, in cm?`, d / 2);
      if (t === 2) return NUM(`A circle has a radius of ${d / 2} cm. What is its circumference? Use 3.14 and round to one decimal place.`, Math.round(3.14 * d * 10) / 10);
      return NUM(`A circle has a radius of ${d / 2} cm. What is its area? Use 3.14 and round to one decimal place.`, Math.round(3.14 * (d / 2) * (d / 2) * 10) / 10);
    },
    volume: (t, r) => {
      const l = ri(r, 3, 12), w = ri(r, 3, 12), h = ri(r, 3, 12);
      if (t === 1) return NUM(`A box is ${l} × ${w} × ${h} cm. What is its volume, in cubic cm?`, l * w * h);
      if (t === 2) return NUM(`A box is ${l} × ${w} × ${h} cm. What is its surface area, in square cm?`, 2 * (l * w + l * h + w * h));
      return NUM(`A cylinder has radius ${w} cm and height ${h} cm. What is its volume? Use 3.14 and round to one decimal place.`, Math.round(3.14 * w * w * h * 10) / 10);
    },
    classify: (t, r) => {
      if (t === 1) return MC(r, 'A shape has four equal sides and four right angles. What is it?', 'a square', ['a rectangle', 'a rhombus', 'a trapezoid']);
      if (t === 2) return MC(r, 'A triangle has one angle of 90°. What kind of triangle is it?', 'right', ['acute', 'obtuse', 'equilateral']);
      return MC(r, 'Which statement about a rhombus is always true?', 'all four sides are equal in length',
        ['all four angles are right angles', 'it has exactly one pair of parallel sides', 'its diagonals are equal in length']);
    },
    angles: (t, r) => {
      const a = ri(r, 20, 70);
      if (t === 1) return MC(r, `An angle measures ${a}°. What type is it?`, 'acute', ['right', 'obtuse', 'straight']);
      if (t === 2) return NUM(`Two angles are complementary. One measures ${a}°. What is the other, in degrees?`, 90 - a);
      const b = ri(r, 30, 80);
      return NUM(`In a triangle, two angles measure ${a}° and ${b}°. What is the third, in degrees?`, 180 - a - b);
    },
    pythagorean: (t, r) => {
      const trips = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25]];
      const [a, b, c] = pick(r, trips);
      if (t === 1) return MC(r, 'In a right triangle, which side is the hypotenuse?', 'the side opposite the right angle',
        ['the shortest side', 'the side touching the right angle', 'either of the two legs']);
      if (t === 2) return NUM(`A right triangle has legs of ${a} and ${b}. What is the hypotenuse?`, c);
      return NUM(`A right triangle has a hypotenuse of ${c} and one leg of ${a}. What is the other leg?`, b);
    },
    coordinate: (t, r) => {
      const x1 = ri(r, -8, 8), y1 = ri(r, -8, 8), d = ri(r, 2, 9);
      if (t === 1) return MC(r, `Where is the point (${x1}, ${y1}) ?`,
        `${Math.abs(x1)} units ${x1 < 0 ? 'left' : 'right'} and ${Math.abs(y1)} units ${y1 < 0 ? 'down' : 'up'} from the origin`,
        [`${Math.abs(y1)} units ${y1 < 0 ? 'left' : 'right'} and ${Math.abs(x1)} units ${x1 < 0 ? 'down' : 'up'} from the origin`,
         'at the origin', 'it cannot be plotted']);
      if (t === 2) return NUM(`How far apart are (${x1}, ${y1}) and (${x1 + d}, ${y1}) ?`, d);
      const d2 = ri(r, 2, 7);
      return NUM(`A rectangle has corners (0,0), (${d},0), (${d},${d2}) and (0,${d2}). What is its perimeter?`, 2 * (d + d2));
    },
    unitconvert: (t, r) => {
      const ft = ri(r, 2, 20), kg = ri(r, 2, 20);
      if (t === 1) return NUM(`How many inches are in ${ft} feet?`, ft * 12);
      if (t === 2) return NUM(`How many grams are in ${kg} kilograms?`, kg * 1000);
      const cups = ri(r, 2, 8);
      return NUM(`A recipe needs ${cups} cups. How many fluid ounces is that? (1 cup = 8 fl oz)`, cups * 8);
    }
  }, 'perimarea');

  GEN.fractions = variants({
    compare: (t, r) => {
      const d1 = pick(r, [3, 4, 5, 6, 8]), d2 = pick(r, [4, 6, 8, 10, 12]);
      const n1 = ri(r, 1, d1 - 1), n2 = ri(r, 1, d2 - 1);
      if (t === 1) {
        const d = pick(r, [4, 5, 6, 8]), a = ri(r, 1, d - 1);
        let b = ri(r, 1, d - 1); if (b === a) b = (b % (d - 1)) + 1;
        return MC(r, `Which is greater, ${a}/${d} or ${b}/${d} ?`, `${Math.max(a, b)}/${d}`, [`${Math.min(a, b)}/${d}`, 'They are equal']);
      }
      const bigger = (n1 / d1) === (n2 / d2) ? 'They are equal' : (n1 / d1 > n2 / d2 ? `${n1}/${d1}` : `${n2}/${d2}`);
      if (t === 2) return MC(r, `Which is greater, ${n1}/${d1} or ${n2}/${d2} ?`, bigger, [`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal']);
      const dec = ri(r, 30, 90) / 100;
      return MC(r, `Which is greatest:  ${n1}/${d1},  ${dec},  or  ${ri(r, 30, 90)}% ?`, 'it depends on the values shown',
        [`${n1}/${d1}`, String(dec), 'they are all equal']);
    },
    equivalent: (t, r) => {
      const d = pick(r, [2, 3, 4, 5, 6]), n = ri(r, 1, d - 1), k = ri(r, 2, 5);
      if (t === 1) return TXT(`Write a fraction equal to ${n}/${d} with denominator ${d * k}. (write like 3/4)`, `${n * k}/${d * k}`);
      if (t === 2) { const g = gcd(n * k, d * k); return TXT(`Write ${n * k}/${d * k} in simplest form. (write like 3/4)`, `${n * k / g}/${d * k / g}`); }
      const whole = ri(r, 1, 4);
      return TXT(`Write ${whole * d + n}/${d} as a mixed number. (write like 2 1/3)`, `${whole} ${n}/${d}`);
    },
    addsub: (t, r) => {
      const d = pick(r, [4, 6, 8, 10, 12]);
      if (t === 1) { const a = ri(r, 1, d - 2), b = ri(r, 1, d - a - 1); const g = gcd(a + b, d); return TXT(`${a}/${d} + ${b}/${d} = ?  (simplest form, like 3/4)`, `${(a + b) / g}/${d / g}`); }
      const d2 = d / 2;
      if (t === 2) { const a = ri(r, 1, d2 - 1), b = ri(r, 1, d - 1); const num = a * 2 + b; const g = gcd(num, d); return TXT(`${a}/${d2} + ${b}/${d} = ?  (simplest form, like 3/4)`, `${num / g}/${d / g}`); }
      const w1 = ri(r, 2, 5), w2 = ri(r, 1, w1 - 1), a = ri(r, 1, d - 1), b = ri(r, a + 1 > d - 1 ? d - 1 : a + 1, d - 1);
      const num = (w1 * d + a) - (w2 * d + b); const g = gcd(Math.abs(num), d);
      return TXT(`${w1} ${a}/${d} − ${w2} ${b}/${d} = ?  (improper fraction in simplest form, like 7/4)`, `${num / g}/${d / g}`);
    },
    multdiv: (t, r) => {
      const d = pick(r, [2, 3, 4, 5, 6, 8]), n = ri(r, 1, d - 1), w = ri(r, 2, 12);
      if (t === 1) { const g = gcd(n * w, d); return TXT(`${n}/${d} × ${w} = ?  (simplest form, like 3/4 or 6)`, d / g === 1 ? String(n * w / g) : `${n * w / g}/${d / g}`); }
      const d2 = pick(r, [2, 3, 4, 5]), n2 = ri(r, 1, d2 - 1);
      if (t === 2) { const g = gcd(n * n2, d * d2); return TXT(`${n}/${d} × ${n2}/${d2} = ?  (simplest form, like 3/4)`, `${n * n2 / g}/${d * d2 / g}`); }
      const g = gcd(n * d2, d * n2);
      return TXT(`${n}/${d} ÷ ${n2}/${d2} = ?  (simplest form, like 3/4)`, `${n * d2 / g}/${d * n2 / g}`);
    },
    convert: (t, r) => {
      const pairs = [[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [1, 10, 0.1, 10], [2, 5, 0.4, 40], [3, 5, 0.6, 60], [1, 8, 0.125, 12.5]];
      const [n, d, dec, pct] = pick(r, pairs);
      if (t === 1) return MC(r, `Write ${n}/${d} as a decimal.`, String(dec), [String(dec * 2), String(dec / 2), String(1 - dec)]);
      if (t === 2) return NUM(`Write ${n}/${d} as a percent. (enter just the number)`, pct);
      return NUM(`Write ${pct}% as a decimal.`, pct / 100);
    },
    percentof: (t, r) => {
      const whole = ri(r, 20, t === 1 ? 100 : 400);
      const pct = t === 1 ? pick(r, [10, 25, 50]) : t === 2 ? pick(r, [5, 15, 20, 30, 40, 75]) : ri(r, 1, 99);
      return NUM(`What is ${pct}% of ${whole}?`, Math.round(whole * pct) / 100);
    },
    percentchange: (t, r) => {
      const price = ri(r, 1000, 12000) / 100, disc = pick(r, [10, 15, 20, 25, 30, 40]);
      if (t === 1) return NUM(`An item costs ${money(price)}. What is ${disc}% off, in dollars? (round to the nearest cent)`, Math.round(price * disc) / 100);
      if (t === 2) return NUM(`An item costs ${money(price)} with ${disc}% off. What is the sale price? (round to the nearest cent)`, Math.round(price * (100 - disc)) / 100);
      const tax = 8.25;
      return NUM(`An item costs ${money(price)} with ${disc}% off, then ${tax}% tax. What is the final total? (round to the nearest cent)`,
        Math.round(price * (100 - disc) / 100 * (1 + tax / 100) * 100) / 100);
    },
    measurement: (t, r) => {
      if (t === 1) return MC(r, 'A ruler is divided into quarter inches. A line ends one mark past 6 inches. How long is it?',
        '6 1/4 inches', ['6 1/2 inches', '6 3/4 inches', '7 inches']);
      if (t === 2) return TXT(`A board is 5 1/2 inches and another is 2 1/4 inches. What is the total length? (write like 7 3/4)`, '7 3/4');
      const c = ri(r, 2, 6);
      return TXT(`A recipe needs 3/4 cup per batch. How much is needed for ${c} batches? (improper fraction, like 9/4)`, `${3 * c}/4`);
    },
    numberline: (t, r) => {
      if (t === 1) return MC(r, 'On a number line from 0 to 1 divided into fourths, which mark is 1/2?', 'the second mark', ['the first mark', 'the third mark', 'the last mark']);
      if (t === 2) { const v = ri(r, 10, 99) / 100; return MC(r, `Between which two tenths does ${v} fall?`, `${(Math.floor(v * 10) / 10).toFixed(1)} and ${((Math.floor(v * 10) + 1) / 10).toFixed(1)}`, ['0.0 and 0.1', '0.9 and 1.0', 'it is greater than 1']); }
      return MC(r, 'Order from least to greatest:  0.6,  1/2,  55%', '1/2, 55%, 0.6', ['0.6, 55%, 1/2', '55%, 1/2, 0.6', 'they are equal']);
    },
    ratios: (t, r) => {
      const a = ri(r, 2, 9), b = ri(r, 2, 9);
      if (t === 1) return TXT(`${a} of ${a + b} students walk to school. Write that as a fraction. (like 3/4)`, `${a}/${a + b}`);
      if (t === 2) return NUM(`${a} of ${a + b} students walk to school. What percent is that? (round to a whole number)`, Math.round(a / (a + b) * 100));
      return MC(r, `In a class, the ratio of ${a} girls to ${b} boys is given. What fraction of the class is girls?`,
        `${a}/${a + b}`, [`${a}/${b}`, `${b}/${a + b}`, `${b}/${a}`]);
    },
    estimate: (t, r) => {
      const d = pick(r, [5, 6, 7, 8, 9, 10, 11, 12]), n = ri(r, 1, d - 1);
      const near = n / d < 0.25 ? '0' : n / d < 0.7 ? '1/2' : '1';
      if (t === 1) return MC(r, `Is ${n}/${d} closest to 0, 1/2, or 1?`, near, ['0', '1/2', '1']);
      if (t === 2) return MC(r, `Estimate:  ${n}/${d} + ${ri(r, 1, d - 1)}/${d}. Is the answer closer to 0, 1, or 2?`, '1', ['0', '1', '2']);
      const whole = ri(r, 40, 400), pct = pick(r, [19, 21, 24, 26, 49, 51]);
      return MC(r, `Estimate ${pct}% of ${whole}. Which is closest?`,
        String(Math.round(whole * Math.round(pct / 5) * 5 / 100)),
        [String(Math.round(whole * pct / 100) * 2), String(Math.round(whole / 10)), String(whole)]);
    }
  }, 'convert');

  GEN.consumer = variants({
    counting: (t, r) => {
      if (t === 1) return NUM('How many cents is 3 quarters, 1 dime and 2 pennies?', 87);
      if (t === 2) { const q = ri(r, 1, 6), d = ri(r, 1, 6), n = ri(r, 1, 5); return NUM(`How many cents is ${q} quarters, ${d} dimes and ${n} nickels?`, q * 25 + d * 10 + n * 5); }
      const price = ri(r, 250, 1850) / 100, paid = Math.ceil(price / 5) * 5;
      return NUM(`An item costs ${money(price)}. You pay with ${money(paid)}. How much change? (enter a number)`, Math.round((paid - price) * 100) / 100);
    },
    nextdollar: (t, r) => {
      // Tier 1 stays under $10, tier 2 under $30, tier 3 goes to three figures —
      // the ladder is the size of the amount, since the strategy itself is one step.
      const cents = ri(r, 105, t === 1 ? 995 : t === 2 ? 2995 : 9995);
      const next = Math.ceil(cents / 100);
      if (t === 3) return NUM(`An item costs ${money(cents / 100)}. Using next-dollar, how many whole dollars do you hand over? (enter a number)`, next);
      return MC(r, `An item costs ${money(cents / 100)}. Using next-dollar, how many whole dollars do you hand over?`,
        '$' + next, ['$' + (next - 1), '$' + (next + 1), '$' + (next + 2)]);
    },
    tax: (t, r) => {
      const sub = ri(r, 500, 9000) / 100, tax = 8.25;
      if (t === 1) return NUM(`A purchase is ${money(sub)}. What is ${tax}% sales tax? (round to the nearest cent)`, Math.round(sub * tax) / 100);
      if (t === 2) return NUM(`A purchase is ${money(sub)}. What is the total with ${tax}% tax? (round to the nearest cent)`, Math.round(sub * (1 + tax / 100) * 100) / 100);
      const a = ri(r, 200, 2000) / 100, b = ri(r, 200, 2000) / 100;
      return NUM(`You buy items at ${money(a)} and ${money(b)}. With ${tax}% tax, what is the total? (round to the nearest cent)`,
        Math.round((a + b) * (1 + tax / 100) * 100) / 100);
    },
    tip: (t, r) => {
      const sub = ri(r, 1500, 9000) / 100;
      if (t === 1) return NUM(`A bill is ${money(sub)}. What is a 10% tip? (round to the nearest cent)`, Math.round(sub * 10) / 100);
      if (t === 2) { const p = pick(r, [15, 20]); return NUM(`A bill is ${money(sub)}. What is a ${p}% tip? (round to the nearest cent)`, Math.round(sub * p) / 100); }
      const n = ri(r, 2, 5);
      return NUM(`A bill of ${money(sub)} plus a 20% tip is split evenly among ${n} people. How much does each pay? (round to the nearest cent)`,
        Math.round(sub * 1.2 / n * 100) / 100);
    },
    paystub: (t, r) => {
      const rate = ri(r, 1200, 2200) / 100, hrs = ri(r, 10, 40);
      const gross = Math.round(rate * hrs * 100) / 100;
      if (t === 1) return NUM(`You work ${hrs} hours at ${money(rate)} per hour. What is your gross pay? (enter a number)`, gross);
      if (t === 2) return MC(r, 'On a pay stub, what does a deduction for "FICA" pay for?', 'Social Security and Medicare',
        ['your health insurance premium', 'your retirement savings account', 'state income tax']);
      const ded = Math.round(gross * 0.22 * 100) / 100;
      return NUM(`Gross pay is ${money(gross)} and total deductions are ${money(ded)}. What is net pay? (enter a number)`, Math.round((gross - ded) * 100) / 100);
    },
    budget: (t, r) => {
      const income = ri(r, 12, 30) * 100, rent = ri(r, 5, 12) * 100, food = ri(r, 2, 4) * 100;
      if (t === 1) return MC(r, 'Which of these is a NEED rather than a want?', 'rent', ['a concert ticket', 'a streaming subscription', 'new headphones']);
      if (t === 2) return NUM(`Monthly income is ${money(income)}. Rent is ${money(rent)} and food is ${money(food)}. How much is left? (enter a number)`, income - rent - food);
      const extra = ri(r, 1, 3) * 100;
      return NUM(`Income ${money(income)}; rent ${money(rent)}, food ${money(food)}, transport ${money(extra)}. If you want $200 in savings, how much is left for everything else?`,
        income - rent - food - extra - 200);
    },
    unitprice: (t, r) => {
      const size = ri(r, 8, 24), price = ri(r, 200, 900) / 100;
      if (t === 1) return NUM(`A ${size} oz box costs ${money(price)}. What is the price per ounce? (round to the nearest cent)`, Math.round(price / size * 100) / 100);
      const size2 = size * 2, price2 = Math.round(price * ri(r, 15, 24) / 10 * 100) / 100;
      if (t === 2) return MC(r, `Which is the better buy: ${size} oz for ${money(price)} or ${size2} oz for ${money(price2)} ?`,
        (price / size <= price2 / size2) ? `${size} oz for ${money(price)}` : `${size2} oz for ${money(price2)}`,
        [`${size} oz for ${money(price)}`, `${size2} oz for ${money(price2)}`, 'They cost the same per ounce']);
      return MC(r, `Brand A: ${size} oz for ${money(price)}. Brand B: ${size2} oz for ${money(price2)}. Which is cheaper per ounce, and by roughly how much?`,
        (price / size <= price2 / size2) ? 'Brand A' : 'Brand B', ['Brand A', 'Brand B', 'They are identical']);
    },
    credit: (t, r) => {
      const bal = ri(r, 300, 2500), apr = pick(r, [18, 22, 24, 26]);
      if (t === 1) return MC(r, 'On a credit card statement, what is the "minimum payment"?',
        'the least you can pay to avoid a late fee', ['the full balance owed', 'the interest charged that month', 'your credit limit']);
      if (t === 2) return NUM(`A balance of $${bal} carries ${apr}% annual interest. What is roughly one month's interest? (round to the nearest cent)`,
        Math.round(bal * apr / 12) / 100);
      return MC(r, `Paying only the minimum on a $${bal} balance at ${apr}% APR means what?`,
        'you pay far more than $' + bal + ' in total, over a long time',
        ['you pay exactly $' + bal, 'the interest stops accruing', 'the balance is forgiven after a year']);
    },
    time: (t, r) => {
      const h = ri(r, 1, 11), m = pick(r, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
      if (t === 1) return MC(r, `An analog clock shows the hour hand just past ${h} and the minute hand on the ${m / 5 || 12}. What time is it?`,
        `${h}:${String(m).padStart(2, '0')}`, [`${h + 1}:${String(m).padStart(2, '0')}`, `${m / 5 || 12}:${String(h * 5).padStart(2, '0')}`, `${h}:${String((m + 15) % 60).padStart(2, '0')}`]);
      if (t === 2) { const dur = ri(r, 20, 90); return NUM(`A shift starts at ${h}:00 and lasts ${dur} minutes. How many minutes past ${h + 1}:00 does it end? (0 if before)`, Math.max(0, dur - 60)); }
      const travel = ri(r, 15, 50);
      return NUM(`You must arrive by ${h + 2}:00 and travel takes ${travel} minutes. How many minutes before ${h + 2}:00 should you leave?`, travel);
    },
    estimate: (t, r) => {
      const a = ri(r, 150, 990) / 100, b = ri(r, 150, 990) / 100, c = ri(r, 150, 990) / 100;
      if (t === 1) return NUM(`Estimate by rounding to the nearest dollar: ${money(a)} + ${money(b)} + ${money(c)}`,
        Math.round(a) + Math.round(b) + Math.round(c));
      if (t === 2) return MC(r, `You have $20. Items cost ${money(a)}, ${money(b)} and ${money(c)}. Can you afford all three?`,
        (a + b + c <= 20) ? 'Yes' : 'No', ['Yes', 'No']);
      return MC(r, `You have $20 and a cart of ${money(a)}, ${money(b)}, ${money(c)} plus 8.25% tax. Can you afford it?`,
        ((a + b + c) * 1.0825 <= 20) ? 'Yes' : 'No', ['Yes', 'No']);
    }
  }, 'counting');

  GEN.numbersense = variants({
    readwrite: (t, r) => {
      const n = t === 1 ? ri(r, 1000, 9999) : t === 2 ? ri(r, 10000, 999999) : ri(r, 1000000, 99999999);
      return MC(r, `Which is ${n.toLocaleString()} written in words?`, wordsFor(n),
        [wordsFor(n + 1000), wordsFor(Math.floor(n / 10)), wordsFor(n * 10)]);
    },
    compare: (t, r) => {
      if (t === 1) { const a = ri(r, 100, 9999), b = ri(r, 100, 9999); return MC(r, `Which is greater, ${a} or ${b}?`, String(Math.max(a, b)), [String(Math.min(a, b)), 'They are equal']); }
      if (t === 2) { const a = ri(r, 10, 99) / 100, b = ri(r, 10, 99) / 100; return MC(r, `Which is greater, ${a} or ${b}?`, String(Math.max(a, b)), [String(Math.min(a, b)), 'They are equal']); }
      return MC(r, 'Order from least to greatest:  0.75,  2/3,  70%', '2/3, 70%, 0.75', ['0.75, 70%, 2/3', '70%, 0.75, 2/3', 'they are equal']);
    },
    rounding: (t, r) => {
      const n = ri(r, 1000, 99999);
      const to = t === 1 ? [10, 'ten'] : t === 2 ? [100, 'hundred'] : [1000, 'thousand'];
      return NUM(`Round ${n.toLocaleString()} to the nearest ${to[1]}.`, Math.round(n / to[0]) * to[0]);
    },
    decimalplace: (t, r) => {
      const n = (ri(r, 1000, 99999) / 1000).toFixed(3);
      const places = [['tenths', 1], ['hundredths', 2], ['thousandths', 3]];
      const [label, idx] = places[Math.min(t, 3) - 1];
      const digit = Number(String(n).split('.')[1][idx - 1]);
      return MC(r, `In ${n}, which digit is in the ${label} place?`, String(digit),
        [String((digit + 1) % 10), String((digit + 2) % 10), String((digit + 5) % 10)]);
    },
    factors: (t, r) => {
      if (t === 1) { const n = pick(r, [12, 18, 20, 24, 28, 30, 36]); return NUM(`How many factors does ${n} have? (count 1 and ${n})`, countFactors(n)); }
      if (t === 2) { const n = pick(r, [11, 13, 15, 17, 21, 23, 27, 29]); return MC(r, `Is ${n} prime or composite?`, isPrime(n) ? 'prime' : 'composite', ['prime', 'composite']); }
      const a = pick(r, [6, 8, 9, 12]), b = pick(r, [10, 14, 15, 18]);
      return NUM(`What is the greatest common factor of ${a} and ${b}?`, gcd(a, b));
    },
    exponents: (t, r) => {
      const b = ri(r, 2, 9);
      if (t === 1) return NUM(`${b}² =`, b * b);
      if (t === 2) return NUM(`${b}³ =`, b * b * b);
      const sq = pick(r, [16, 25, 36, 49, 64, 81, 100, 121, 144]);
      return NUM(`√${sq} =`, Math.sqrt(sq));
    },
    magnitude: (t, r) => {
      if (t === 1) return MC(r, 'About how many students are in a typical high school class?', '25', ['3', '250', '2500']);
      if (t === 2) return MC(r, 'A gallon of milk costs about how much?', '$4', ['$0.40', '$40', '$400']);
      return MC(r, 'A news story says a town of 5,000 people had 8,000 visitors in a day. Is that plausible?',
        'Yes — visitors can outnumber residents', ['No, a town cannot have visitors', 'No, that is impossible', 'It is exactly the same number']);
    }
  }, 'rounding');

  GEN.computation = variants({
    addition: (t, r) => {
      const a = t === 1 ? ri(r, 12, 99) : t === 2 ? ri(r, 120, 999) : ri(r, 1200, 9999);
      const b = t === 1 ? ri(r, 12, 99) : t === 2 ? ri(r, 120, 999) : ri(r, 1200, 9999);
      return NUM(`${a} + ${b} =`, a + b);
    },
    subtraction: (t, r) => {
      let a = t === 1 ? ri(r, 20, 99) : t === 2 ? ri(r, 200, 999) : ri(r, 1000, 9999);
      let b = t === 1 ? ri(r, 11, 89) : t === 2 ? ri(r, 110, 899) : ri(r, 1100, 8999);
      if (b > a) [a, b] = [b, a];
      return NUM(`${a} − ${b} =`, a - b);
    },
    multiplication: (t, r) => {
      const a = t === 1 ? ri(r, 12, 99) : t === 2 ? ri(r, 12, 99) : ri(r, 120, 999);
      const b = t === 1 ? ri(r, 2, 9) : ri(r, 12, 40);
      return NUM(`${a} × ${b} =`, a * b);
    },
    division: (t, r) => {
      const d = t === 1 ? ri(r, 2, 9) : ri(r, 11, 40);
      const q = ri(r, 12, 90);
      if (t === 3) { const rem = ri(r, 1, d - 1); return NUM(`${d * q + rem} ÷ ${d} = ?  Enter the whole-number part only.`, q); }
      return NUM(`${d * q} ÷ ${d} =`, q);
    },
    orderops: (t, r) => {
      const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9), d = ri(r, 2, 5);
      if (t === 1) return NUM(`${a} + ${b} × ${c} =`, a + b * c);
      if (t === 2) return NUM(`(${a} + ${b}) × ${c} =`, (a + b) * c);
      return NUM(`${a} + ${b}² × ${c} − ${d} =`, a + b * b * c - d);
    },
    decimals: (t, r) => {
      const a = ri(r, 100, 9999) / 100, b = ri(r, 100, 9999) / 100;
      if (t === 1) return NUM(`${a.toFixed(2)} + ${b.toFixed(2)} =`, Math.round((a + b) * 100) / 100);
      if (t === 2) { const w = ri(r, 2, 9); return NUM(`${a.toFixed(2)} × ${w} =`, Math.round(a * w * 100) / 100); }
      const d = ri(r, 2, 8);
      return NUM(`${(a * d).toFixed(2)} ÷ ${d} =`, Math.round(a * 100) / 100);
    },
    chooseop: (t, r) => {
      const nm = pick(r, NAMES), a = ri(r, 12, 60), b = ri(r, 2, 9);
      if (t === 1) return MC(r, `${nm} has ${a} cards and gives away ${b}. Which operation finds how many are left?`,
        'subtraction', ['addition', 'multiplication', 'division']);
      if (t === 2) return MC(r, `${nm} packs ${a} items into boxes of ${b}. Which operation finds the number of boxes?`,
        'division', ['addition', 'subtraction', 'multiplication']);
      return MC(r, `${nm} works ${b} shifts and earns $${a} each. Which operation finds total pay?`,
        'multiplication', ['addition', 'subtraction', 'division']);
    },
    calculator: (t, r) => {
      const a = ri(r, 120, 990), b = ri(r, 12, 60), c = ri(r, 2, 9);
      if (t === 1) return NUM(`Using a calculator:  ${a} + ${b} × ${c} =`, a + b * c);
      if (t === 2) return NUM(`Using a calculator:  (${a} − ${b}) ÷ ${c} = ?  (round to two decimals)`, Math.round((a - b) / c * 100) / 100);
      return MC(r, `You enter ${a} × ${b} and get ${a * b * 10}. What most likely happened?`,
        'a digit was entered twice or a decimal was misplaced',
        ['the calculator is broken', 'the answer is correct', 'you should multiply again']);
    }
  }, 'addition');

  GEN.integers = variants({
    addsub: (t, r) => {
      const a = ri(r, -20, -2), b = ri(r, 2, 20);
      if (t === 1) { const c = ri(r, -15, -2); return NUM(`${a} + (${c}) =`, a + c); }
      if (t === 2) return NUM(`${b} + (${a}) =`, b + a);
      return NUM(`${a} − (${b}) =`, a - b);
    },
    multdiv: (t, r) => {
      const a = ri(r, -12, -2), b = ri(r, 2, 12);
      if (t === 1) return MC(r, 'A negative times a negative gives what sign?', 'positive', ['negative', 'zero', 'it depends']);
      if (t === 2) return NUM(`${a} × ${b} =`, a * b);
      return NUM(`${a * b} ÷ ${a} =`, b);
    },
    absvalue: (t, r) => {
      const a = ri(r, -25, -1), b = ri(r, 2, 20);
      if (t === 1) return NUM(`|${a}| =`, Math.abs(a));
      if (t === 2) return NUM(`|${a}| + ${b} =`, Math.abs(a) + b);
      return NUM(`|${a} + ${b}| =`, Math.abs(a + b));
    },
    contextline: (t, r) => {
      const d = ri(r, 5, 40);
      if (t === 1) return MC(r, `The temperature is ${d} degrees below zero. Which integer represents it?`, String(-d), [String(d), '0', String(-d * 2)]);
      if (t === 2) { const dep = d + ri(r, 5, 40); return NUM(`An account is $${d} overdrawn and you deposit $${dep}. What is the new balance?`, dep - d); }
      const a = ri(r, 5, 30), b = ri(r, 5, 30);
      return NUM(`The temperature rises from −${a}° to ${b}°. How many degrees did it rise?`, a + b);
    },
    rational: (t, r) => {
      const a = ri(r, -12, -2), b = ri(r, 100, 900) / 100;
      if (t === 1) return NUM(`${a} + ${b.toFixed(2)} = ?  (round to two decimals)`, Math.round((a + b) * 100) / 100);
      if (t === 2) return TXT(`${a} + 1/2 = ?  (write as a decimal, like -3.5)`, String(a + 0.5));
      return NUM(`${a} × ${b.toFixed(2)} = ?  (round to two decimals)`, Math.round(a * b * 100) / 100);
    },
    properties: (t, r) => {
      const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9);
      if (t === 1) return MC(r, `${a} + ${b} = ${b} + ${a}  demonstrates which property?`, 'commutative', ['associative', 'distributive', 'identity']);
      if (t === 2) return NUM(`Use the distributive property:  ${a}(${b} + ${c}) =`, a * (b + c));
      return TXT(`Simplify using properties:  ${a}(x + ${b}) + ${c}x  (write like 7x + 14)`, `${a + c}x + ${a * b}`);
    }
  }, 'addsub');

  GEN.ratio = variants({
    writeratio: (t, r) => {
      const a = ri(r, 2, 12), b = ri(r, 2, 12), g = gcd(a, b);
      if (t === 1) return TXT(`There are ${a} red and ${b} blue counters. Write the ratio of red to blue. (like 3:4)`, `${a}:${b}`);
      if (t === 2) return TXT(`Simplify the ratio ${a * 2}:${b * 2}. (like 3:4)`, `${a / g}:${b / g}`);
      return TXT(`There are ${a} red and ${b} blue counters. Write the ratio of red to the TOTAL. (like 3:7)`, `${a}:${a + b}`);
    },
    proportion: (t, r) => {
      const a = ri(r, 2, 9), k = ri(r, 2, 8), b = ri(r, 2, 9);
      if (t === 1) return NUM(`Solve:   ${a}/${b} = ___/${b * k}`, a * k);
      if (t === 2) return NUM(`Solve for x:   ${a}/${b} = x/${b * k}`, a * k);
      return NUM(`If ${a} items cost $${a * k}, how much do ${b} items cost?`, b * k);
    },
    unitrate: (t, r) => {
      const qty = ri(r, 3, 12), each = ri(r, 150, 800) / 100;
      if (t === 1) return NUM(`${qty} items cost ${money(each * qty)}. What is the cost of ONE item? (round to the nearest cent)`, Math.round(each * 100) / 100);
      if (t === 2) { const q2 = qty * 2, p2 = Math.round(each * qty * 1.8 * 100) / 100;
        return MC(r, `Which is the better buy: ${qty} for ${money(each * qty)} or ${q2} for ${money(p2)} ?`,
          (each <= p2 / q2) ? `${qty} for ${money(each * qty)}` : `${q2} for ${money(p2)}`,
          [`${qty} for ${money(each * qty)}`, `${q2} for ${money(p2)}`, 'the same']); }
      const miles = ri(r, 120, 400), gal = ri(r, 4, 16);
      return NUM(`A car goes ${miles} miles on ${gal} gallons. What is the mileage, in miles per gallon? (round to one decimal)`, Math.round(miles / gal * 10) / 10);
    },
    scale: (t, r) => {
      const scale = pick(r, [10, 20, 25, 50, 100]), d = ri(r, 2, 12);
      if (t === 1) return MC(r, `A map scale says 1 inch = ${scale} miles. What does 1 inch represent?`, `${scale} miles`, ['1 mile', `${scale} inches`, `${scale / 2} miles`]);
      if (t === 2) return NUM(`A map scale is 1 inch = ${scale} miles. How many miles is ${d} inches?`, scale * d);
      return NUM(`A map scale is 1 inch = ${scale} miles. How many inches represent ${scale * d} miles?`, d);
    },
    tablegraph: (t, r) => {
      const k = ri(r, 2, 9), x = ri(r, 2, 9);
      if (t === 1) return MC(r, `A table shows 1→${k}, 2→${k * 2}, 3→${k * 3}. Is the relationship constant?`, 'Yes, it increases by the same amount each time', ['No', 'Only for the first two rows', 'It decreases']);
      if (t === 2) return NUM(`A table shows 1→${k}, 2→${k * 2}, 3→${k * 3}. What is the constant of proportionality?`, k);
      return NUM(`If y is proportional to x with constant ${k}, what is y when x = ${x}?`, k * x);
    },
    unitconvert: (t, r) => {
      if (t === 1) { const ft = ri(r, 2, 20); return NUM(`How many inches are in ${ft} feet?`, ft * 12); }
      if (t === 2) { const m = ri(r, 2, 20); return NUM(`How many centimetres are in ${m} metres?`, m * 100); }
      const mi = ri(r, 2, 20);
      return NUM(`About how many kilometres is ${mi} miles? (1 mile ≈ 1.6 km, round to one decimal)`, Math.round(mi * 1.6 * 10) / 10);
    },
    rates: (t, r) => {
      const rate = ri(r, 10, 25), h = ri(r, 3, 30);
      if (t === 1) return NUM(`You earn $${rate} per hour. How much for ${h} hours?`, rate * h);
      if (t === 2) return NUM(`You earn $${rate} per hour and need $${rate * h}. How many hours must you work?`, h);
      const mpg = ri(r, 20, 40), gal = ri(r, 5, 15), price = ri(r, 300, 480) / 100;
      return NUM(`A car gets ${mpg} mpg. What does it cost in fuel to drive ${mpg * gal} miles at ${money(price)} per gallon? (round to the nearest cent)`,
        Math.round(gal * price * 100) / 100);
    }
  }, 'unitrate');

  GEN.data = variants({
    readgraph: (t, r) => {
      const vals = Array.from({ length: 4 }, () => ri(r, 5, 60));
      const labels = ['Mon', 'Tue', 'Wed', 'Thu'];
      const table = labels.map((l, i) => `${l}: ${vals[i]}`).join(', ');
      if (t === 1) { const i = ri(r, 0, 3); return NUM(`Data — ${table}\nHow many on ${labels[i]}?`, vals[i]); }
      if (t === 2) return NUM(`Data — ${table}\nHow many more on ${labels[0]} than ${labels[1]}? (enter a positive number)`, Math.abs(vals[0] - vals[1]));
      return NUM(`Data — ${table}\nWhat is the total across all four days?`, vals.reduce((a, b) => a + b, 0));
    },
    makegraph: (t, r) => {
      if (t === 1) return MC(r, 'You are graphing counts for 5 categories. Which graph type fits best?', 'bar graph', ['line graph', 'circle graph', 'scatter plot']);
      if (t === 2) return MC(r, 'Your largest value is 47. Which y-axis scale is most appropriate?', 'count by 5s up to 50', ['count by 1s up to 100', 'count by 100s up to 1000', 'count by 20s up to 40']);
      return MC(r, 'You are showing how one value changes over 12 months. Which graph fits best?', 'line graph', ['bar graph', 'circle graph', 'pictograph']);
    },
    center: (t, r) => {
      const n = t === 1 ? 4 : t === 2 ? 5 : 6;
      const set = Array.from({ length: n }, () => ri(r, 2, 40));
      const sorted = set.slice().sort((a, b) => a - b);
      if (t === 1) return NUM(`Data set: ${set.join(', ')}\nWhat is the range?`, sorted[n - 1] - sorted[0]);
      if (t === 2) return NUM(`Data set: ${set.join(', ')}\nWhat is the mean? (round to one decimal)`, Math.round(set.reduce((a, b) => a + b, 0) / n * 10) / 10);
      const mid = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      return NUM(`Data set: ${set.join(', ')}\nWhat is the median?`, mid);
    },
    spread: (t, r) => {
      const set = [ri(r, 10, 20), ri(r, 10, 20), ri(r, 10, 20), ri(r, 10, 20), ri(r, 90, 140)];
      if (t === 1) return NUM(`Data set: ${set.join(', ')}\nWhat is the range?`, Math.max(...set) - Math.min(...set));
      if (t === 2) return MC(r, `Data set: ${set.join(', ')}\nWhich value is the outlier?`, String(set[4]), set.slice(0, 3).map(String));
      return MC(r, `Data set: ${set.join(', ')}\nWhich measure of center best represents this data?`,
        'the median, because the outlier pulls the mean up', ['the mean, because it uses every value', 'the mode', 'the range']);
    },
    interpret: (t, r) => {
      if (t === 1) return MC(r, 'A graph is titled "Monthly rainfall (inches), 2025". What is being measured?', 'rainfall in inches', ['months', 'temperature', 'the year']);
      if (t === 2) return MC(r, 'A line rises steadily from January to June. What does that show?', 'the value increased over that period', ['the value decreased', 'the value stayed flat', 'nothing can be said']);
      return MC(r, 'Ice cream sales and drowning deaths both rise in summer. What conclusion is supported?',
        'both are related to warm weather, not to each other',
        ['ice cream causes drowning', 'drowning causes ice cream sales', 'the data must be wrong']);
    },
    probability: (t, r) => {
      const total = ri(r, 5, 12), fav = ri(r, 1, total - 1);
      if (t === 1) return MC(r, 'A bag has only red counters. What is the probability of drawing red?', 'certain', ['likely', 'unlikely', 'impossible']);
      if (t === 2) return TXT(`A bag has ${fav} red of ${total} counters. What is P(red)? (write like 3/7)`, (function () { const g = gcd(fav, total); return `${fav / g}/${total / g}`; })());
      return NUM(`A bag has ${fav} red of ${total} counters. What is P(red) as a percent? (round to a whole number)`, Math.round(fav / total * 100));
    },
    collect: (t, r) => {
      if (t === 1) return MC(r, 'You are counting how many students choose each lunch option. What is the best recording tool?', 'a tally chart', ['a paragraph', 'a photograph', 'a line graph']);
      if (t === 2) return MC(r, 'You survey only your own friends about a school-wide question. What is the problem?', 'the sample is not representative', ['the sample is too large', 'tally marks are inaccurate', 'there is no problem']);
      return MC(r, 'You collected data over 3 days but recorded no dates. What is the consequence?', 'you cannot show change over time', ['the totals are wrong', 'the mean cannot be found', 'there is no consequence']);
    },
    misleading: (t, r) => {
      if (t === 1) return MC(r, 'A bar graph y-axis starts at 90 instead of 0. What is the effect?', 'small differences look much larger', ['the data is more accurate', 'nothing changes', 'the bars disappear']);
      if (t === 2) return MC(r, 'A graph shows only the 3 months where sales rose, out of 12. What is wrong?', 'the data was cherry-picked', ['the scale is wrong', 'the colours are wrong', 'nothing is wrong']);
      return MC(r, 'A headline says "Crime doubles!" — from 2 incidents to 4. What is misleading?', 'the percentage sounds large but the raw numbers are tiny',
        ['doubling is impossible', 'the data must be false', 'nothing is misleading']);
    }
  }, 'readgraph');

  GEN.wordproblem = variants({
    onestep: (t, r) => {
      const nm = pick(r, NAMES), a = ri(r, 8, 60), b = ri(r, 3, 30);
      if (t === 1) return NUM(`${nm} had ${a} tickets and used ${b}. How many are left?`, a - b);
      if (t === 2) return NUM(`${nm} saved $${a} and earned $${b} more. How much now?`, a + b);
      const per = ri(r, 3, 9);
      return NUM(`${nm} packs ${a * per} items into boxes of ${per}. How many boxes?`, a);
    },
    multistep: (t, r) => {
      const nm = pick(r, NAMES), rate = ri(r, 10, 20), h = ri(r, 5, 20), cost = ri(r, 20, 90);
      if (t === 1) return NUM(`${nm} works ${h} hours at $${rate}/hour, then spends $${cost}. How much is left?`, rate * h - cost);
      if (t === 2) { const h2 = ri(r, 3, 10); return NUM(`${nm} works ${h} hours one week and ${h2} the next at $${rate}/hour. Total earnings?`, rate * (h + h2)); }
      const n = ri(r, 2, 5);
      return NUM(`${nm} works ${h} hours at $${rate}/hour, spends $${cost}, then splits the rest evenly with ${n - 1} friends. How much does each get? (round to the nearest cent)`,
        Math.round((rate * h - cost) / n * 100) / 100);
    },
    relevant: (t, r) => {
      const nm = pick(r, NAMES), a = ri(r, 10, 50), b = ri(r, 2, 9), age = ri(r, 14, 18);
      if (t === 1) return MC(r, `"${nm} is ${age} years old and has ${a} cards. ${nm} gives away ${b}." What is the question likely asking about?`,
        'how many cards are left', [`${nm}'s age`, 'how many friends there are', 'the day of the week']);
      if (t === 2) return MC(r, `"${nm} is ${age} and buys ${a} pens at $${b} each." Which fact is NOT needed to find the cost?`,
        `${nm}'s age`, [`the number of pens`, 'the price per pen', 'all facts are needed']);
      return NUM(`"${nm} is ${age}, has ${a} cards, buys ${b} packs of 10." How many cards in total?`, a + b * 10);
    },
    model: (t, r) => {
      const a = ri(r, 12, 40), b = ri(r, 2, 8);
      if (t === 1) return MC(r, `Which model fits "${a} items shared equally among ${b} people"?`,
        'a set of ' + a + ' split into ' + b + ' equal groups', ['a bar of length ' + (a + b), 'two separate bars', 'a number line to ' + (a * b)]);
      if (t === 2) return NUM(`A bar model shows a whole of ${a * b} split into ${b} equal parts. What is one part?`, a);
      return NUM(`A bar model shows ${b} equal parts of ${a} each, with ${a} more added on. What is the whole?`, a * b + a);
    },
    reasonable: (t, r) => {
      const a = ri(r, 20, 90), b = ri(r, 3, 9);
      if (t === 1) return MC(r, `${a} × ${b} — should the answer be bigger or smaller than ${a}?`, 'bigger', ['smaller', 'the same', 'it depends']);
      if (t === 2) return MC(r, `Estimate ${a} × ${b}. Which answer is unreasonable?`, String(a + b), [String(a * b), String(Math.round(a * b * 1.02)), String(Math.round(a * b * 0.98))]);
      return MC(r, `A student computed ${a} ÷ ${b} = ${a * b}. What went wrong?`,
        'they multiplied instead of dividing', ['they rounded', 'they used the wrong calculator', 'the answer is correct']);
    },
    money: (t, r) => {
      const a = ri(r, 200, 1800) / 100, b = ri(r, 200, 1800) / 100;
      if (t === 1) return NUM(`You buy items at ${money(a)} and ${money(b)}. What is the total? (enter a number)`, Math.round((a + b) * 100) / 100);
      if (t === 2) return NUM(`You buy items at ${money(a)} and ${money(b)} and pay with $50. What is the change? (enter a number)`, Math.round((50 - a - b) * 100) / 100);
      return NUM(`You buy items at ${money(a)} and ${money(b)}, get 10% off, then pay 8.25% tax. What is the total? (round to the nearest cent)`,
        Math.round((a + b) * 0.9 * 1.0825 * 100) / 100);
    },
    time: (t, r) => {
      const h = ri(r, 1, 10), m = pick(r, [10, 15, 20, 25, 30, 40, 45]);
      if (t === 1) return NUM(`A class starts at ${h}:00 and ends at ${h}:${m}. How many minutes long is it?`, m);
      if (t === 2) return NUM(`A shift runs from ${h}:00 to ${h + 3}:${m}. How many minutes is that?`, 3 * 60 + m);
      return NUM(`You must arrive at ${h + 4}:00. Travel is ${m} minutes and getting ready is 30 minutes. How many minutes before ${h + 4}:00 must you start?`, m + 30);
    },
    measurement: (t, r) => {
      const ft = ri(r, 3, 20), n = ri(r, 2, 8);
      if (t === 1) return NUM(`A board is ${ft} feet long. How many inches is that?`, ft * 12);
      if (t === 2) return NUM(`You need ${n} pieces of ${ft} inches each. How many inches of material in total?`, n * ft);
      return NUM(`You need ${n} pieces of ${ft} inches each. How many whole FEET of material must you buy?`, Math.ceil(n * ft / 12));
    }
  }, 'onestep');

  GEN.facts = variants({
    add: (t, r) => { const hi = t === 1 ? 5 : t === 2 ? 9 : 12; const a = ri(r, 2, hi), b = ri(r, 2, hi); return NUM(`${a} + ${b} =`, a + b); },
    sub: (t, r) => { const hi = t === 1 ? 5 : t === 2 ? 9 : 12; let a = ri(r, 2, hi * 2), b = ri(r, 2, hi); if (b > a) [a, b] = [b, a]; return NUM(`${a} − ${b} =`, a - b); },
    addsub: (t, r) => { const hi = t === 1 ? 5 : t === 2 ? 9 : 12; const a = ri(r, 2, hi), b = ri(r, 2, hi); return r() < 0.5 ? NUM(`${a} + ${b} =`, a + b) : NUM(`${a + b} − ${b} =`, a); },
    mult: (t, r) => { const hi = t === 1 ? 5 : t === 2 ? 9 : 12; const a = ri(r, 2, hi), b = ri(r, 2, 12); return NUM(`${a} × ${b} =`, a * b); },
    div: (t, r) => { const hi = t === 1 ? 5 : t === 2 ? 9 : 12; const d = ri(r, 2, hi), q = ri(r, 2, hi); return NUM(`${d * q} ÷ ${d} =`, q); },
    mixed: (t, r) => {
      const hi = t === 1 ? 5 : t === 2 ? 9 : 12;
      const a = ri(r, 2, hi), b = ri(r, 2, hi);
      const op = pick(r, t === 1 ? ['+', '−'] : t === 2 ? ['+', '−', '×'] : ['+', '−', '×', '÷']);
      if (op === '+') return NUM(`${a} + ${b} =`, a + b);
      if (op === '−') return NUM(`${a + b} − ${b} =`, a);
      if (op === '×') return NUM(`${a} × ${b} =`, a * b);
      return NUM(`${a * b} ÷ ${b} =`, a);
    },
    fracdec: (t, r) => {
      const pairs = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [1, 10, 0.1], [2, 5, 0.4], [3, 5, 0.6], [1, 3, 0.33]];
      const [n, d, dec] = pick(r, pairs);
      if (t === 3) return NUM(`Write ${n}/${d} as a percent. (enter just the number)`, Math.round(dec * 100));
      return NUM(`Write ${n}/${d} as a decimal.`, dec);
    },
    moneytime: (t, r) => {
      if (t === 1) return NUM('How many cents in a quarter?', 25);
      if (t === 2) return NUM('How many minutes in an hour?', 60);
      return NUM('How many quarters make $2.00?', 8);
    }
  }, 'mixed');

  GEN.money = variants({
    identify: (t, r) => {
      if (t === 1) return NUM('How many cents is a dime plus a nickel?', 15);
      if (t === 2) { const q = ri(r, 1, 6), d = ri(r, 1, 6); return NUM(`How many cents is ${q} quarters and ${d} dimes?`, q * 25 + d * 10); }
      const b5 = ri(r, 1, 4), q = ri(r, 1, 6);
      return NUM(`How many dollars is ${b5} five-dollar bills and ${q} quarters? (enter a number like 12.50)`, b5 * 5 + q * 0.25);
    },
    purchase: (t, r) => {
      const price = ri(r, 150, 1850) / 100, paid = Math.ceil(price / 5) * 5;
      if (t === 1) return MC(r, `An item costs ${money(price)}. Is $${paid} enough?`, 'Yes', ['Yes', 'No']);
      if (t === 2) return NUM(`An item costs ${money(price)}. You pay ${money(paid)}. What is the change? (enter a number)`, Math.round((paid - price) * 100) / 100);
      return MC(r, `An item costs ${money(price)}. You pay ${money(paid)} and get ${money(paid - price + 0.25)} back. Is that correct?`,
        'No, that is 25 cents too much', ['Yes, that is correct', 'No, that is 25 cents too little', 'You cannot tell']);
    },
    tracking: (t, r) => {
      const start = ri(r, 20, 200), a = ri(r, 300, 900) / 100, b = ri(r, 300, 900) / 100;
      if (t === 1) return NUM(`You start with $${start} and spend ${money(a)}. What is left? (enter a number)`, Math.round((start - a) * 100) / 100);
      if (t === 2) return NUM(`You start with $${start} and spend ${money(a)} then ${money(b)}. What is left? (enter a number)`, Math.round((start - a - b) * 100) / 100);
      return MC(r, `You have $${start} and have spent ${money(a + b)} of a $${start} budget. Can you afford another ${money(a * 3)}?`,
        (start - a - b >= a * 3) ? 'Yes' : 'No', ['Yes', 'No']);
    },
    needswants: (t, r) => {
      if (t === 1) return MC(r, 'Which is a need?', 'groceries', ['a video game', 'concert tickets', 'a second phone']);
      if (t === 2) return MC(r, 'You have $100. Rent share is $80 and you want $40 of games. What should you do?',
        'pay the $80 rent share first', ['buy the games first', 'buy both', 'buy neither']);
      return MC(r, 'Your budget is short $50 this month. Which cut is most sensible first?',
        'cancel a subscription you rarely use', ['skip a rent payment', 'skip groceries entirely', 'stop paying for transport to work']);
    },
    banking: (t, r) => {
      const bal = ri(r, 100, 900), amt = ri(r, 20, 90);
      if (t === 1) return NUM(`Your balance is $${bal}. You deposit $${amt}. What is the new balance?`, bal + amt);
      if (t === 2) return NUM(`Your balance is $${bal}. A debit of $${amt} clears. What is the new balance?`, bal - amt);
      return MC(r, `Your statement shows a $${amt} charge you do not recognise. What should you do first?`,
        'contact the bank to dispute it', ['ignore it', 'close the account immediately', 'pay it and move on']);
    },
    bills: (t, r) => {
      const due = ri(r, 4000, 18000) / 100, fee = ri(r, 15, 50);
      if (t === 1) return MC(r, `A bill shows "Amount due ${money(due)}, Due 04/18". What must you pay by April 18?`, money(due), ['$0.00', money(due / 2), money(due + fee)]);
      if (t === 2) return NUM(`A bill of ${money(due)} is paid late and carries a $${fee} fee. What is now owed? (enter a number)`, Math.round((due + fee) * 100) / 100);
      return MC(r, `You cannot pay a ${money(due)} bill in full this month. What is the best first step?`,
        'contact the company to ask about a payment plan', ['ignore the bill', 'pay a different bill twice', 'close the account']);
    },
    saving: (t, r) => {
      const goal = ri(r, 200, 1200), per = ri(r, 20, 100);
      if (t === 1) return MC(r, `You want to save $${goal}. What is the first step?`, 'decide how much to set aside each pay period', ['spend less on rent', 'borrow the money', 'wait for a raise']);
      if (t === 2) return NUM(`You save $${per} per week. How many weeks to reach $${per * 8}?`, 8);
      return NUM(`You want $${goal} and save $${per} per week. How many whole weeks will it take?`, Math.ceil(goal / per));
    }
  }, 'purchase');


  // =============================================================================
  // LITERACY — word study, mechanics, usage, sentences
  // =============================================================================

  const W = {
    syll: [['photosynthesis',5],['democracy',4],['temperature',4],['calculator',4],['environment',4],
      ['independent',4],['legislature',4],['hypothesis',4],['calculation',4],['understanding',4],
      ['information',4],['electricity',5],['organization',5],['responsibility',6],['communication',5],
      ['multiplication',5],['constitution',4],['experiment',4],['definition',4],['probability',5],
      ['transportation',4],['significant',4],['evaporation',5],['discrimination',5],['recommendation',5],
      ['napkin',2],['basket',2],['pilot',2],['reptile',2],['contest',2],['pattern',2],['problem',2],
      ['remember',3],['important',3],['computer',3],['together',3],['discover',3],['adventure',3]],
    phon: [['stress',5],['shrink',5],['clasp',5],['blend',5],['scratch',5],['string',5],['spend',5],
      ['crunch',5],['thrift',6],['splash',6],['branch',5],['strength',6],['flinch',6],['sprint',6],
      ['cat',3],['ship',3],['flag',4],['desk',4],['jump',4],['tape',3],['brick',5]],
    vteam: ['detail','remain','complain','approach','floating','proceed','agreement','beneath','repeated',
      'account','announce','allowed','avoid','appoint','employ','because','autumn','withdraw'],
    rctrl: ['partner','market','forward','normal','perfect','service','circuit','confirm','further','disturb',
      'observe','purpose','surface','particular','information','performance'],
    blend: ['strength','construct','instruct','abstract','complex','district','transcript','substance',
      'framework','springboard','landscape','shipment','branches','wrestle'],
    closedopen: ['napkin','basket','rabbit','pilot','robot','tiger','music','open','magnet','picnic','hotel','silent'],
    vce: [['hop','hope'],['tap','tape'],['cub','cube'],['plan','plane'],['rid','ride'],['not','note'],
      ['pin','pine'],['can','cane'],['rob','robe'],['spin','spine']],
    irreg: ['through','though','enough','thought','because','friend','island','answer','business','government',
      'necessary','February','Wednesday','receipt','weight','height','neighbor','ancient','science','beautiful'],
    technical: ['photosynthesis','hypothesis','democracy','legislature','equation','molecule','coefficient',
      'amendment','metaphor','denominator','ecosystem','constitution','variable','precipitation'],
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
    derive: [['decide','decision','noun'],['create','creation','noun'],['happy','happiness','noun'],
      ['strong','strength','noun'],['beauty','beautiful','adjective'],['danger','dangerous','adjective'],
      ['quick','quickly','adverb'],['care','careful','adjective'],['inform','information','noun']],
    multimorph: [['unhelpful','un + help + ful'],['rebuilding','re + build + ing'],['disagreement','dis + agree + ment'],
      ['unbelievable','un + believe + able'],['misinformation','mis + inform + ation'],['transportation','trans + port + ation']],
    abbrev: [['etc.','and so on'],['i.e.','that is'],['e.g.','for example'],['vs.','versus'],['approx.','approximately'],
      ['max.','maximum'],['min.','minimum'],['ASAP','as soon as possible'],['FAQ','frequently asked questions'],
      ['GPA','grade point average'],['ID','identification'],['PPE','personal protective equipment']],
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
    homophone: [['to','too','two'],['their','there',"they're"],['your',"you're"],['its',"it's"],
      ['whose',"who's"],['affect','effect'],['then','than'],['accept','except'],['lose','loose'],
      ['principal','principle'],['weather','whether'],['past','passed']]
  };

  function misspell(r, w) { const i = ri(r, 1, Math.max(1, w.length - 2)); return w.slice(0, i) + w[i] + w.slice(i); }
  const sylCount = w => (w.toLowerCase().match(/[aeiouy]+/g) || ['x']).length;

  GEN.syllables = variants({
    count: (t, r) => {
      const pool = W.syll.filter(w => t === 1 ? w[1] <= 3 : t === 2 ? w[1] === 4 : w[1] >= 4);
      const [word, n] = pick(r, pool.length ? pool : W.syll);
      if (t === 3 && r() < 0.4) return NUM(`How many syllables are in "${word}"?`, n);
      return MC(r, `How many syllables are in "${word}"?`, n, [n - 1, n + 1, n + 2]);
    },
    divide: (t, r) => {
      const sets = { 1: [['napkin','nap/kin'],['basket','bas/ket'],['rabbit','rab/bit'],['magnet','mag/net']],
                     2: [['pilot','pi/lot'],['robot','ro/bot'],['tiger','ti/ger'],['music','mu/sic']],
                     3: [['information','in/for/ma/tion'],['temperature','tem/per/a/ture'],['calculator','cal/cu/la/tor'],['understanding','un/der/stand/ing']] };
      const [word, split] = pick(r, sets[t] || sets[1]);
      return MC(r, `Where does "${word}" divide into syllables?`, split,
        [word.slice(0,1) + '/' + word.slice(1), word.slice(0,-1) + '/' + word.slice(-1), 'it does not divide']);
    },
    stress: (t, r) => {
      const sets = { 1: [['record (the noun)','RE-cord'],['present (the gift)','PRE-sent'],['object (the thing)','OB-ject']],
                     2: [['computer','com-PU-ter'],['important','im-POR-tant'],['remember','re-MEM-ber']],
                     3: [['information','in-for-MA-tion'],['photography','pho-TOG-ra-phy'],['opportunity','op-por-TU-ni-ty']] };
      const [word, stressed] = pick(r, sets[t] || sets[1]);
      return MC(r, `Which syllable is stressed in "${word}"?`, stressed,
        [stressed.toLowerCase(), stressed.split('-').reverse().join('-'), 'no syllable is stressed']);
    }
  }, 'count');

  GEN.phonology = variants({
    segment: (t, r) => {
      const pool = W.phon.filter(w => t === 1 ? w[1] <= 3 : t === 2 ? w[1] === 4 : w[1] >= 5);
      const [word, n] = pick(r, pool.length ? pool : W.phon);
      return MC(r, `How many separate sounds (phonemes) are in "${word}"?`, n, [n - 1, n + 1, n - 2]);
    },
    deletesub: (t, r) => {
      const del = [['brace','race'],['stop','top'],['train','rain'],['clamp','lamp'],['spark','park'],['flight','light'],['scare','care'],['blend','lend']];
      const sub = [['mock','/d/','dock'],['pin','/w/','win'],['cat','/b/','bat'],['run','/f/','fun'],['sink','/l/','link'],['tall','/b/','ball'],['ride','/h/','hide']];
      if (t === 3) { const [word, sound, res] = pick(r, sub); return MC(r, `Replace the first sound of "${word}" with a ${sound} sound. What word do you get?`, res, [word, word.slice(1), res.slice(1)]); }
      const [full, cut] = pick(r, del);
      return MC(r, `Say "${full}" without the first sound. What word is left?`, cut, [full.slice(1), full.slice(2), cut.slice(1)]);
    },
    blend: (t, r) => {
      const pool = W.phon.filter(w => t === 1 ? w[1] <= 3 : t === 2 ? w[1] === 4 : w[1] >= 5);
      const [word] = pick(r, pool.length ? pool : W.phon);
      const spaced = word.split('').join(' - ');
      return MC(r, `Blend these sounds into a word:  ${spaced}`, word,
        [word.split('').reverse().join(''), word.slice(1), word + 's']);
    }
  }, 'segment');

  function wordListVariant(bank) {
    return (t, r) => {
      const word = pick(r, bank);
      if (t === 1) return MC(r, 'Which word is spelled correctly?', word, [misspell(r, word), word.replace(/e/, 'a'), word.replace(/o/, 'u')].filter(x => x !== word));
      if (t === 2) return MC(r, `How many syllables are in "${word}"?`, sylCount(word), [sylCount(word) - 1, sylCount(word) + 1, sylCount(word) + 2]);
      return MC(r, `How many vowel SOUNDS do you hear in "${word}"?`, sylCount(word), [sylCount(word) + 1, sylCount(word) - 1, 1]);
    };
  }

  GEN.decoding = variants({
    closedopen: wordListVariant(W.closedopen),
    vowelteam: wordListVariant(W.vteam),
    rcontrolled: wordListVariant(W.rctrl),
    blends: wordListVariant(W.blend),
    vce: (t, r) => {
      const [short, long] = pick(r, W.vce);
      if (t === 1) return MC(r, `Which word has the long vowel sound?`, long, [short]);
      if (t === 2) return MC(r, `Adding a silent e to "${short}" makes which word?`, long, [short + 's', short + short.slice(-1) + 'e', short]);
      return MC(r, `Why does "${long}" have a long vowel but "${short}" does not?`,
        'the silent e at the end makes the vowel say its name',
        ['it has more letters', 'it starts with a different sound', 'there is no reason']);
    },
    chunking: (t, r) => {
      const [word] = pick(r, W.syll.filter(w => w[1] >= (t === 1 ? 3 : t === 2 ? 4 : 5)).length ? W.syll.filter(w => w[1] >= (t === 1 ? 3 : t === 2 ? 4 : 5)) : W.syll);
      if (t === 1) return MC(r, `What should you do FIRST with an unfamiliar long word like "${word}"?`,
        'break it into syllable chunks', ['guess from the first letter', 'skip it', 'sound out every letter separately']);
      return MC(r, `How many chunks would you break "${word}" into?`, sylCount(word), [sylCount(word) - 1, sylCount(word) + 1, 1]);
    },
    irregular: (t, r) => {
      const word = pick(r, W.irreg);
      return MC(r, 'Which spelling is correct?', word, [misspell(r, word), word.replace(/gh/, 'f'), word.replace(/ei/, 'ie')].filter(x => x !== word));
    },
    technical: wordListVariant(W.technical)
  }, 'vowelteam');

  GEN.morphology = variants({
    prefix: (t, r) => {
      const [p, meaning] = pick(r, W.prefix);
      if (t === 3) { const base = pick(r, ['read','write','build','count','pack']); return MC(r, `What does "${p}${base}" most likely mean?`, meaning + ' ' + base, ['the opposite of ' + meaning, base + ' quickly', 'nothing']); }
      return MC(r, `What does the prefix "${p}-" mean?`, meaning, shuffle(r, W.prefix.filter(x => x[0] !== p)).slice(0, 3).map(x => x[1]));
    },
    suffix: (t, r) => {
      const [sfx, meaning] = pick(r, W.suffix);
      return MC(r, `What does the suffix "-${sfx}" mean?`, meaning, shuffle(r, W.suffix.filter(x => x[0] !== sfx)).slice(0, 3).map(x => x[1]));
    },
    root: (t, r) => {
      const [root, meaning] = pick(r, W.root);
      return MC(r, `What does the root "${root}" mean?`, meaning, shuffle(r, W.root.filter(x => x[0] !== root)).slice(0, 3).map(x => x[1]));
    },
    derivation: (t, r) => {
      const [base, derived, part] = pick(r, W.derive);
      if (t === 1) return MC(r, `What is the ${part} form of "${base}"?`, derived, [base + 's', base + 'ing', base + 'ed']);
      if (t === 2) return MC(r, `"${derived}" is which part of speech?`, part, ['noun', 'verb', 'adjective', 'adverb'].filter(x => x !== part).slice(0, 3));
      return MC(r, `Which sentence uses "${derived}" correctly?`, `That was a ${part === 'noun' ? 'good ' + derived : derived + ' choice'}.`,
        [`She will ${derived} tomorrow.`, `They ${derived} quickly yesterday.`, `The ${derived} of them left.`]);
    },
    multimorph: (t, r) => {
      const [word, parts] = pick(r, W.multimorph);
      if (t === 1) return NUM(`How many word parts (prefix, root, suffix) are in "${word}"?`, parts.split('+').length);
      return MC(r, `Break "${word}" into its parts.`, parts,
        [word.slice(0, 2) + ' + ' + word.slice(2), word + ' (one part)', parts.split(' + ').reverse().join(' + ')]);
    },
    infer: (t, r) => {
      const [root, meaning] = pick(r, W.root);
      const [p, pmean] = pick(r, W.prefix);
      return MC(r, `A text uses the word "${p}${root}ion". Using word parts, what does it most likely involve?`,
        `${pmean}, and something to do with "${meaning}"`,
        ['nothing that can be worked out', 'the opposite of ' + meaning, 'a person who ' + meaning]);
    },
    abbrev: (t, r) => {
      const [abbr, meaning] = pick(r, W.abbrev);
      return MC(r, `What does "${abbr}" stand for?`, meaning, shuffle(r, W.abbrev.filter(x => x[0] !== abbr)).slice(0, 3).map(x => x[1]));
    }
  }, 'prefix');

  GEN.spelling = variants({
    vowelpattern: (t, r) => {
      const bank = t === 1 ? W.closedopen : t === 2 ? W.vteam : W.rctrl;
      const word = pick(r, bank);
      return MC(r, 'Which spelling is correct?', word, [misspell(r, word), word.replace(/a/, 'e'), word.replace(/i/, 'e')].filter(x => x !== word));
    },
    suffixrules: (t, r) => {
      const [base, suf, correct, rule] = pick(r, W.spellRule);
      if (t === 3) return MC(r, `To spell "${base}" + "-${suf}" as "${correct}", which rule applies?`, rule,
        shuffle(r, W.spellRule.filter(x => x[3] !== rule)).slice(0, 3).map(x => x[3]));
      return MC(r, `Add "-${suf}" to "${base}". Which spelling is correct?`, correct,
        [base + suf, base.slice(0, -1) + suf, base + base.slice(-1) + suf]);
    },
    irregular: (t, r) => { const w = pick(r, W.irreg); return MC(r, 'Which spelling of this high-frequency word is correct?', w, [misspell(r, w), w.replace(/e/, 'a'), w.replace(/o/, 'u')].filter(x => x !== w)); },
    technical: (t, r) => { const w = pick(r, W.technical); return MC(r, 'Which spelling of this content-area term is correct?', w, [misspell(r, w), w.replace(/o/, 'a'), w.replace(/i/, 'e')].filter(x => x !== w)); },
    morphology: (t, r) => {
      const [p] = pick(r, W.prefix); const base = pick(r, ['read', 'write', 'agree', 'appear', 'connect']);
      if (t === 1) return MC(r, `Spell "${p}" + "${base}".`, p + base, [p + '-' + base, p + base.slice(1), base + p]);
      const [sfx] = pick(r, W.suffix);
      return MC(r, `Spell "${base}" + "-${sfx}".`, base + sfx, [base + '-' + sfx, base.slice(0, -1) + sfx, base + base.slice(-1) + sfx]);
    },
    proofread: (t, r) => {
      const pairs = pick(r, W.homophone);
      const right = pairs[0], wrong = pairs[1];
      if (t === 1) return MC(r, 'A spell-checker underlines "recieve". What is the correction?', 'receive', ['recieve', 'receeve', 'reseive']);
      if (t === 2) return MC(r, `Which error would a spell-checker NOT catch?`, `using "${wrong}" where "${right}" belongs`,
        ['a misspelled long word', 'a word typed backwards', 'a random letter string']);
      return MC(r, 'What is the most reliable way to catch homophone errors a spell-checker misses?',
        'read the sentence aloud or use text-to-speech', ['run spell-check twice', 'type faster', 'use a longer word']);
    }
  }, 'vowelpattern');

  const MECH = {
    capitalization: [['My brother and I went to the store.','my brother and i went to the store.'],
      ['We visited Chicago in March.','we visited chicago in march.'],
      ['Mr. Alvarez teaches biology.','mr. alvarez teaches biology.'],
      ['She read "The Giver" last year.','she read "the giver" last year.']],
    endpunct: [['Where did you put the keys?','Where did you put the keys'],
      ['That was an amazing game!','That was an amazing game'],
      ['The bus leaves at four.','The bus leaves at four'],
      ['Are you coming with us?','Are you coming with us.']],
    comma: [['I bought apples, bread, and milk.','I bought apples bread and milk.'],
      ['After the game, we went home.','After the game we went home.'],
      ['On June 4, 2027, the lease ends.','On June 4 2027 the lease ends.'],
      ['We ran late, so we took the bus.','We ran late so we took the bus.']],
    apostrophe: [["That is my sister's locker.",'That is my sisters locker.'],
      ["They're going to be late.",'Theyre going to be late.'],
      ["The students' projects were displayed.",'The students projects were displayed.'],
      ["It's going to rain.",'Its going to rain.']],
    quotation: [['"I finished it," she said.','"I finished it" she said.'],
      ['He asked, "Are you ready?"','He asked "Are you ready?"'],
      ['"Wait," he called, "I am coming."','"Wait" he called "I am coming."']],
    lists: [['You will need: a pencil, paper, and a calculator.','You will need a pencil paper and a calculator'],
      ['1. Unplug the machine.  2. Remove the filter.','1 unplug the machine 2 remove the filter']]
  };

  function mechVariant(key) {
    return (t, r) => {
      const bank = MECH[key];
      const [correct, broken] = pick(r, bank);
      if (t === 1 || (t === 2 && r() < 0.5)) {
        return MC(r, 'Which sentence is written correctly?', correct, bank.filter(x => x[0] !== correct).map(x => x[1]));
      }
      return MC(r, `What is wrong with this sentence?\n"${broken}"`, LABEL[key],
        shuffle(r, Object.keys(LABEL).filter(k => k !== key)).slice(0, 3).map(k => LABEL[k]));
    };
  }
  const LABEL = { capitalization: 'a capitalization error', endpunct: 'a missing or wrong end mark',
    comma: 'a missing comma', apostrophe: 'an apostrophe error', quotation: 'quotation punctuation',
    lists: 'list formatting and punctuation' };

  GEN.mechanics = variants({
    capitalization: mechVariant('capitalization'),
    endpunct: mechVariant('endpunct'),
    comma: mechVariant('comma'),
    apostrophe: mechVariant('apostrophe'),
    quotation: mechVariant('quotation'),
    lists: mechVariant('lists'),
    homophone: (t, r) => {
      const set = pick(r, W.homophone);
      const sentences = {
        'to': ['I want ___ go home.', 'to'], 'their': ['They lost ___ keys.', 'their'],
        'your': ['Is this ___ bag?', 'your'], 'its': ['The dog wagged ___ tail.', 'its'],
        'whose': ['___ jacket is this?', 'Whose'], 'affect': ['Rain will ___ the game.', 'affect'],
        'then': ['We ate, ___ we left.', 'then'], 'accept': ['Please ___ my apology.', 'accept'],
        'lose': ['Do not ___ your ticket.', 'lose'], 'principal': ['The ___ runs the school.', 'principal'],
        'weather': ['The ___ is cold today.', 'weather'], 'past': ['We walked ___ the store.', 'past']
      };
      const key = set[0];
      const s = sentences[key];
      if (!s) return MC(r, `Which spelling fits: "I have ___ books."`, 'two', ['to', 'too']);
      return MC(r, `Which word fits?  "${s[0]}"`, s[1], set.filter(x => x.toLowerCase() !== s[1].toLowerCase()));
    }
  }, 'comma');

  const USAGE = {
    subjectverb: [['The dogs run every morning.','The dogs runs every morning.'],
      ['The box of tools is heavy.','The box of tools are heavy.'],
      ['Each of the students has a locker.','Each of the students have a locker.'],
      ['Neither the coach nor the players were ready.','Neither the coach nor the players was ready.']],
    tense: [['She walked to the bus stop.','She walk to the bus stop.'],
      ['I saw the movie last night.','I seen the movie last night.'],
      ['He had already gone home.','He had already went home.'],
      ['They have finished the project.','They have finish the project.']],
    pronoun: [['He and I finished the project.','Him and me finished the project.'],
      ['The team plays its first game Friday.','The team plays their first game Friday.'],
      ['Give the form to her and me.','Give the form to she and I.']],
    modifier: [['She sang more beautifully than he did.','She sang more beautiful than he did.'],
      ['Running late, I missed the bus.','Running late, the bus was missed.'],
      ['He did well on the test.','He did good on the test.']],
    parallel: [['She likes hiking, swimming and running.','She likes hiking, to swim and running.'],
      ['The job requires reading, writing and speaking.','The job requires reading, to write and speaking.']],
    sentencetypes: [['We waited, and the bus came.','We waited and the bus came and we got on and we sat down.'],
      ['Although it rained, the game continued.','Although it rained. The game continued.']]
  };
  const ULABEL = { subjectverb: 'subject-verb agreement', tense: 'verb tense', pronoun: 'pronoun use',
    modifier: 'a misused modifier', parallel: 'faulty parallel structure', sentencetypes: 'sentence structure' };

  function usageVariant(key) {
    return (t, r) => {
      const bank = USAGE[key];
      const [correct, broken] = pick(r, bank);
      if (t === 1 || (t === 2 && r() < 0.5)) return MC(r, 'Which sentence is grammatically correct?', correct, bank.filter(x => x[0] !== correct).map(x => x[1]));
      return MC(r, `What is the error in this sentence?\n"${broken}"`, ULABEL[key],
        shuffle(r, Object.keys(ULABEL).filter(k => k !== key)).slice(0, 3).map(k => ULABEL[k]));
    };
  }
  GEN.usage = variants({
    subjectverb: usageVariant('subjectverb'), tense: usageVariant('tense'), pronoun: usageVariant('pronoun'),
    modifier: usageVariant('modifier'), parallel: usageVariant('parallel'), sentencetypes: usageVariant('sentencetypes')
  }, 'subjectverb');

  GEN.sentence = variants({
    complete: (t, r) => {
      const frags = [['Because the bus was late.','fragment'],['We waited outside.','complete sentence'],
        ['Running down the hall.','fragment'],['The lock was broken.','complete sentence'],
        ['Which she finished yesterday.','fragment'],['He applied for the job.','complete sentence'],
        ['We ran late we missed the bus.','run-on sentence'],['I studied so I passed the test.','complete sentence']];
      const [s, kind] = pick(r, frags);
      return MC(r, `Is this a complete sentence?\n"${s}"`, kind, ['fragment', 'complete sentence', 'run-on sentence'].filter(k => k !== kind));
    },
    combine: (t, r) => {
      const bank = [[['The bus was late.','We missed first period.'],'The bus was late, so we missed first period.'],
        [['She studied for hours.','She still felt nervous.'],'Although she studied for hours, she still felt nervous.'],
        [['The store closed early.','We could not buy supplies.'],'Because the store closed early, we could not buy supplies.'],
        [['He finished the application.','He submitted it online.'],'He finished the application and submitted it online.'],
        [['The machine stopped.','Nobody knew why.'],'The machine stopped, but nobody knew why.']];
      const [parts, combined] = pick(r, bank);
      return MC(r, `Combine these into one clear sentence:\n"${parts[0]}"  "${parts[1]}"`, combined, bank.filter(x => x[1] !== combined).map(x => x[1]));
    },
    expand: (t, r) => {
      const base = pick(r, ['The dog barked.', 'She left.', 'The bus arrived.', 'He waited.']);
      const q = t === 1 ? 'when' : t === 2 ? 'where' : 'why';
      const good = { when: base.replace('.', ' this morning.'), where: base.replace('.', ' outside the school.'), why: base.replace('.', ' because it was time to go.') }[q];
      return MC(r, `Expand "${base}" by adding a detail that answers ${q.toUpperCase()}.`, good,
        [base.replace('.', ' loudly.'), base.replace('.', ' and then stopped.'), base]);
    },
    vary: (t, r) => {
      return MC(r, 'Every sentence in a paragraph begins with "The". What is the best revision?',
        'rewrite some sentences to begin with a phrase or a different subject',
        ['make the sentences longer', 'delete every other sentence', 'combine them all into one sentence']);
    },
    topic: (t, r) => {
      const sets = [
        { details: 'buses run late, the parking lot floods, there is no crossing guard', best: 'Getting to school safely is a growing problem.' },
        { details: 'she practised daily, watched film, and asked for feedback', best: 'She prepared carefully for the tryout.' },
        { details: 'shorter shifts, closer to home, and better pay', best: 'The new job offers several advantages.' }];
      const s = pick(r, sets);
      return MC(r, `Which is the best topic sentence for a paragraph about: ${s.details}?`, s.best,
        ['I like school.', 'There are many things in the world.', 'This paragraph is about a topic.']);
    },
    transitions: (t, r) => {
      const bank = [['showing a result','therefore'],['showing contrast','however'],['adding an example','for instance'],
        ['showing sequence','next'],['showing cause','because'],['showing addition','in addition']];
      const [purpose, word] = pick(r, bank);
      return MC(r, `Which transition word is best for ${purpose}?`, word, shuffle(r, bank.filter(x => x[1] !== word)).slice(0, 3).map(x => x[1]));
    },
    thesis: (t, r) => {
      const sets = [
        { topic: 'later school start times', best: 'Schools should start later because teenagers need more sleep to learn well.' },
        { topic: 'a part-time job during school', best: 'A part-time job builds skills, but only if it does not cut into study time.' }];
      const s = pick(r, sets);
      return MC(r, `Which is the strongest thesis statement about ${s.topic}?`, s.best,
        [`This essay is about ${s.topic}.`, `${s.topic} is interesting.`, `There are many opinions about ${s.topic}.`]);
    }
  }, 'complete');

  GEN.editing = variants({
    conventions: (t, r) => {
      const keys = ['capitalization', 'endpunct', 'comma', 'apostrophe'];
      const key = keys[Math.min(t, keys.length) - 1] || 'comma';
      return mechVariant(key)(t, r);
    },
    wordchoice: (t, r) => {
      const bank = [['The food was good.','The soup was rich and perfectly seasoned.'],
        ['He went to the place.','He drove to the clinic.'],
        ['It was a big problem.','It was a costly and time-consuming problem.'],
        ['She said something.','She explained the change to the whole team.']];
      const [vague, precise] = pick(r, bank);
      if (t === 1) return MC(r, `Which word in "${vague}" is too vague?`,
        vague.split(' ').filter(w => /good|place|big|something/.test(w))[0] || 'good',
        ['The', 'was', 'a']);
      return MC(r, `Which is the stronger revision of "${vague}"?`, precise, bank.filter(x => x[1] !== precise).map(x => x[1]));
    },
    organization: (t, r) => {
      if (t === 1) return MC(r, 'A paragraph about bus routes contains one sentence about a favourite movie. What should you do?',
        'delete the sentence about the movie', ['delete the whole paragraph', 'move it to the start', 'add more about the movie']);
      if (t === 2) return MC(r, 'A how-to paragraph lists step 3 before step 1. What is the fix?', 'reorder the steps into sequence',
        ['delete step 3', 'combine the steps into one sentence', 'add a title']);
      return MC(r, 'An essay states its conclusion in paragraph 1 and its evidence in paragraph 4. What is the strongest revision?',
        'move the evidence before the conclusion so the argument builds',
        ['delete the conclusion', 'delete the evidence', 'leave it as is']);
    },
    tts: (t, r) => {
      if (t === 1) return MC(r, 'What does text-to-speech help you catch that reading silently often misses?',
        'words you left out or typed twice', ['spelling of long words', 'your handwriting', 'the page margins']);
      if (t === 2) return MC(r, 'Text-to-speech reads: "I went to the the store." What is the error?',
        'a doubled word', ['a spelling error', 'a missing comma', 'there is no error']);
      return MC(r, 'Text-to-speech reads your sentence and it sounds wrong, but spell-check flagged nothing. What is the most likely cause?',
        'a real word used incorrectly, like a homophone',
        ['the software is broken', 'the sentence is too long', 'there is no error']);
    }
  }, 'conventions');

  window.ACE_PROBE_GENERATORS = GEN;

  // ---- small local helpers used above -------------------------------------------
  function isPrime(n) { for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return n > 1; }
  function countFactors(n) { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; }
  function wordsFor(n) {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function under1000(x) {
      let s = '';
      if (x >= 100) { s += ones[Math.floor(x / 100)] + ' hundred'; x %= 100; if (x) s += ' '; }
      if (x >= 20) { s += tens[Math.floor(x / 10)]; if (x % 10) s += '-' + ones[x % 10]; }
      else if (x > 0) s += ones[x];
      return s;
    }
    if (n === 0) return 'zero';
    let out = [];
    const units = [[1000000, 'million'], [1000, 'thousand']];
    for (const [v, name] of units) {
      if (n >= v) { out.push(under1000(Math.floor(n / v)) + ' ' + name); n %= v; }
    }
    if (n > 0) out.push(under1000(n));
    return out.join(' ');
  }
})();
