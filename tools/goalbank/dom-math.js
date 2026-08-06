// =============================================================
// Ace Manager — goal taxonomy: Math
// =============================================================
// Standards use the {msn} {mee} {mrp} {mg} {msp} band tokens, which resolve to
// the real Illinois/CCSS code for the strand at that band — a middle-grades
// domain code below grade 9, a high-school conceptual category above it.
//
// Almost every pool here is generated: computation, fractions, algebra and
// consumer math can be produced as equivalent alternate forms indefinitely,
// which is what makes a rising progress line mean fluency rather than a
// memorised item set.

'use strict';
const { section, collect } = require('./dsl');

// ---- number sense & place value ------------------------------------------------
const NS = section({
  domain: 'Math', sub: 'Number Sense & Place Value', pool: 'ma-numbersense',
  std: 'IL Math {msn}', dx: ['SLD', 'ID', 'OHI', 'MD']
});

NS('mt-ns-01', 'Reading and writing multi-digit whole numbers',
  'Given {n} multi-digit whole numbers presented in numerals or words',
  'read each number aloud and write it in the other form',
  'accuracy', 90, [4, 5],
  ['read and write numbers to the thousands',
   'read and write numbers to the hundred thousands',
   'read and write numbers to the millions in both numeral and word form'],
  { gen_opts: { v: 'readwrite' } });

NS('mt-ns-02', 'Comparing and ordering numbers',
  'Given {n} sets of whole numbers, decimals and fractions',
  'order each set from least to greatest',
  'accuracy', 90, [4, 5],
  ['order whole numbers from least to greatest',
   'order decimals to the hundredths',
   'order mixed sets containing whole numbers, decimals and fractions'],
  { gen_opts: { v: 'compare' } });

NS('mt-ns-03', 'Rounding and estimating',
  'Given {n} numbers and a place value to round to',
  'round each number correctly and use the estimate to check a calculation',
  'accuracy', 85, [4, 5],
  ['round whole numbers to the nearest ten and hundred',
   'round whole numbers and decimals to a stated place value',
   'round to estimate a sum or product and state whether an exact answer is reasonable'],
  { gen_opts: { v: 'rounding' }, note: 'Estimation is the skill that catches calculator entry errors — it belongs in every functional math sequence, not only in a rounding unit.' });

NS('mt-ns-04', 'Place value in decimals',
  'Given {n} decimal numbers',
  'name the value of each digit and write the number in expanded form',
  'accuracy', 85, [4, 5],
  ['name the place of a digit to the hundredths',
   'name the value of a digit to the thousandths',
   'write decimals in expanded form and compare values across place values'],
  { gen_opts: { v: 'decimalplace' } });

NS('mt-ns-05', 'Factors, multiples and prime numbers',
  'Given {n} whole numbers',
  'list the factors, identify primes and find least common multiples',
  'accuracy', 85, [4, 5],
  ['list the factors of a two-digit number',
   'identify prime and composite numbers and find the greatest common factor',
   'find the greatest common factor and least common multiple of a pair of numbers'],
  { gen_opts: { v: 'factors' }, bands: ['6-8', '9-12'] });

NS('mt-ns-06', 'Powers, exponents and square roots',
  'Given {n} expressions containing exponents and square roots',
  'evaluate each expression',
  'accuracy', 85, [4, 5],
  ['evaluate whole-number squares and cubes',
   'evaluate expressions with exponents and find perfect square roots',
   'evaluate expressions combining exponents, roots and order of operations'],
  { gen_opts: { v: 'exponents' }, bands: ['6-8', '9-12'], std: 'IL Math {mee}' });

NS('mt-ns-07', 'Number magnitude in real quantities',
  'Given {nshort} real quantities drawn from {life}',
  'state whether each quantity is reasonable and justify it with a benchmark number',
  'accuracy', 85, [4, 5],
  ['state whether a quantity is closer to 10, 100 or 1000',
   'state whether a stated quantity is reasonable for the situation',
   'judge the reasonableness of a quantity and name the benchmark used to decide'],
  { gen_opts: { v: 'magnitude' }, fade: 'functional' });

// ---- fact fluency ------------------------------------------------------------------
const FF = section({
  domain: 'Math', sub: 'Fact Fluency', pool: 'ma-facts',
  std: 'IL Math 3.OA.C.7 (foundational)', dx: ['SLD', 'ID', 'OHI', 'MD']
});

FF('mt-ff-01', 'Addition and subtraction fact fluency',
  'Given a one-minute timed probe of addition and subtraction facts to 20',
  'write correct answers',
  'dcpm', { '6-8': 40, '9-12': 45, '18-22': 40 }, [3, 4],
  ['write correct digits at a rate above the baseline median',
   'write correct digits approaching the target rate',
   'write correct digits at the target rate on an unpracticed probe'],
  { gen_opts: { v: 'addsub' } });

FF('mt-ff-02', 'Multiplication fact fluency',
  'Given a one-minute timed probe of multiplication facts through 12 x 12',
  'write correct answers',
  'dcpm', { '6-8': 40, '9-12': 45, '18-22': 40 }, [3, 4],
  ['write correct digits for facts through 5 x 12',
   'write correct digits for facts through 9 x 12',
   'write correct digits for the full fact range at the target rate'],
  { gen_opts: { v: 'mult' } });

FF('mt-ff-03', 'Division fact fluency',
  'Given a one-minute timed probe of division facts with divisors through 12',
  'write correct answers',
  'dcpm', { '6-8': 35, '9-12': 40, '18-22': 35 }, [3, 4],
  ['write correct digits for divisors through 5',
   'write correct digits for divisors through 9',
   'write correct digits across the full divisor range at the target rate'],
  { gen_opts: { v: 'div' } });

FF('mt-ff-04', 'Mixed operation fact fluency',
  'Given a one-minute timed probe of mixed addition, subtraction, multiplication and division facts',
  'write correct answers',
  'dcpm', { '6-8': 35, '9-12': 40, '18-22': 35 }, [3, 4],
  ['write correct digits on a probe of two mixed operations',
   'write correct digits on a probe of three mixed operations',
   'write correct digits on a probe of all four operations at the target rate'],
  { gen_opts: { v: 'mixed' }, note: 'Mixed-operation probes are where memorised sequences fall apart — a student fluent on a single-operation sheet and slow here is reading the operation sign, not recalling the fact.' });

FF('mt-ff-05', 'Fluency with fraction and decimal equivalents',
  'Given a one-minute timed probe of common fraction, decimal and percent equivalents',
  'write the equivalent value for each',
  'accuracy', 90, [3, 4],
  ['write decimal equivalents for halves, fourths and tenths',
   'write decimal and percent equivalents for common benchmark fractions',
   'convert fluently among fraction, decimal and percent forms'],
  { gen_opts: { v: 'fracdec' }, std: 'IL Math 4.NF.C.6 (foundational)' });

FF('mt-ff-06', 'Automatic recall of money and time equivalents',
  'Given a timed probe of money and time equivalences',
  'state or write the correct equivalent for each',
  'accuracy', 90, [3, 4],
  ['state coin values and the number of minutes in an hour',
   'state common money and time equivalents automatically',
   'convert between money and time units automatically within 3 seconds each'],
  { gen_opts: { v: 'moneytime' }, std: 'IL Math {msn}', fade: 'functional' });

// ---- whole number computation ------------------------------------------------------------
const CO = section({
  domain: 'Math', sub: 'Computation', pool: 'ma-computation',
  std: 'IL Math {msn}', dx: ['SLD', 'ID', 'OHI', 'MD']
});

CO('mt-co-01', 'Multi-digit addition with regrouping',
  'Given {n} multi-digit addition problems requiring regrouping',
  'solve each problem correctly',
  'accuracy', 90, [4, 5],
  ['solve two-digit addition with regrouping',
   'solve three-digit addition with regrouping',
   'solve four-digit addition with regrouping across multiple places'],
  { gen_opts: { v: 'addition' } });

CO('mt-co-02', 'Multi-digit subtraction with regrouping',
  'Given {n} multi-digit subtraction problems requiring regrouping',
  'solve each problem correctly',
  'accuracy', 90, [4, 5],
  ['solve two-digit subtraction with regrouping',
   'solve three-digit subtraction with regrouping',
   'solve subtraction requiring regrouping across zeros'],
  { gen_opts: { v: 'subtraction' } });

CO('mt-co-03', 'Multi-digit multiplication',
  'Given {n} multi-digit multiplication problems',
  'solve each problem correctly',
  'accuracy', 85, [4, 5],
  ['solve two-digit by one-digit multiplication',
   'solve two-digit by two-digit multiplication',
   'solve three-digit by two-digit multiplication'],
  { gen_opts: { v: 'multiplication' } });

CO('mt-co-04', 'Long division with and without remainders',
  'Given {n} division problems with multi-digit dividends',
  'solve each problem correctly and interpret the remainder',
  'accuracy', 85, [4, 5],
  ['solve division with one-digit divisors',
   'solve division with two-digit divisors',
   'solve division with two-digit divisors and interpret the remainder in context'],
  { gen_opts: { v: 'division' } });

CO('mt-co-05', 'Order of operations',
  'Given {n} numeric expressions containing more than one operation',
  'evaluate each expression using the correct order of operations',
  'accuracy', 85, [4, 5],
  ['evaluate expressions with two operations',
   'evaluate expressions with parentheses and three operations',
   'evaluate expressions with parentheses, exponents and four operations'],
  { gen_opts: { v: 'orderops' }, std: 'IL Math {mee}' });

CO('mt-co-06', 'Decimal computation',
  'Given {n} problems adding, subtracting, multiplying and dividing decimals',
  'solve each problem correctly with the decimal point placed accurately',
  'accuracy', 85, [4, 5],
  ['add and subtract decimals with aligned place values',
   'multiply decimals and place the decimal point correctly',
   'divide decimals and place the decimal point correctly'],
  { gen_opts: { v: 'decimals' } });

CO('mt-co-07', 'Selecting the correct operation for a situation',
  'Given {n} one-step situations described in words',
  'name the operation required and solve',
  'accuracy', 85, [4, 5],
  ['name the operation when the situation uses an obvious key word',
   'name the operation when no key word is present',
   'name the operation and solve for situations of all four operation types'],
  { gen_opts: { v: 'chooseop' }, note: 'Key-word instruction breaks the moment a problem is written naturally; score whether the student can justify the operation, not whether they spotted "in all".' });

CO('mt-co-08', 'Using a calculator accurately and checking the result',
  'Given {n} multi-step computations and a calculator',
  'enter each computation correctly and check the result against an estimate',
  'accuracy', 90, [4, 5],
  ['enter a two-step computation correctly',
   'enter a multi-step computation using the correct order',
   'enter a multi-step computation and reject an answer that fails the estimate check'],
  { gen_opts: { v: 'calculator' }, fade: 'functional' });

CO('mt-co-09', 'Computation fluency in mixed operations',
  'Given a two-minute timed probe of mixed multi-digit computation',
  'write correct answers',
  'dcpm', { gen_opts: { v: 'addition' }, '6-8': 25, '9-12': 30, '18-22': 25 }, [3, 4],
  ['write correct digits above the baseline median',
   'write correct digits approaching the target rate',
   'write correct digits at the target rate on an unpracticed probe'],
  { pool: 'ma-compfluency', gen_opts: { v: 'addition' } });

// ---- fractions, decimals & percents ------------------------------------------------------------
const FR = section({
  domain: 'Math', sub: 'Fractions, Decimals & Percents', pool: 'ma-fractions',
  std: 'IL Math {msn}', dx: ['SLD', 'ID', 'OHI']
});

FR('mt-fr-01', 'Identifying and comparing fractions',
  'Given {n} fractions with unlike denominators',
  'compare each pair and order the set',
  'accuracy', 85, [4, 5],
  ['compare fractions with like denominators',
   'compare fractions with unlike denominators using a common denominator',
   'order a set of fractions, decimals and percents on one number line'],
  { gen_opts: { v: 'compare' } });

FR('mt-fr-02', 'Equivalent fractions and simplest form',
  'Given {n} fractions',
  'write each fraction in simplest form and produce an equivalent fraction',
  'accuracy', 85, [4, 5],
  ['produce an equivalent fraction by multiplying',
   'reduce a fraction to simplest form',
   'reduce fractions to simplest form and convert between improper fractions and mixed numbers'],
  { gen_opts: { v: 'equivalent' } });

FR('mt-fr-03', 'Adding and subtracting fractions',
  'Given {n} problems adding and subtracting fractions and mixed numbers',
  'solve each problem and write the answer in simplest form',
  'accuracy', 85, [4, 5],
  ['add and subtract fractions with like denominators',
   'add and subtract fractions with unlike denominators',
   'add and subtract mixed numbers requiring regrouping'],
  { gen_opts: { v: 'addsub' } });

FR('mt-fr-04', 'Multiplying and dividing fractions',
  'Given {n} problems multiplying and dividing fractions and mixed numbers',
  'solve each problem and write the answer in simplest form',
  'accuracy', 85, [4, 5],
  ['multiply a fraction by a whole number',
   'multiply two fractions and simplify',
   'divide fractions and mixed numbers and simplify'],
  { gen_opts: { v: 'multdiv' } });

FR('mt-fr-05', 'Converting among fractions, decimals and percents',
  'Given {n} values expressed as fractions, decimals or percents',
  'write each value in the other two forms',
  'accuracy', 85, [4, 5],
  ['convert benchmark fractions to decimals',
   'convert among fractions, decimals and percents for benchmark values',
   'convert any fraction, decimal or percent to the other two forms'],
  { gen_opts: { v: 'convert' } });

FR('mt-fr-06', 'Finding a percent of a number',
  'Given {n} percent problems set in {life} contexts',
  'find the percent of the number correctly',
  'accuracy', 85, [4, 5],
  ['find 10%, 25% and 50% of a number',
   'find any whole-number percent of a number',
   'find a percent of a number including percents greater than 100 and fractional percents'],
  { std: 'IL Math {mrp}', gen_opts: { v: 'percentof' } });

FR('mt-fr-07', 'Percent increase, decrease and discount',
  'Given {n} problems involving markup, discount, tax or tip',
  'calculate the final amount correctly',
  'accuracy', 85, [4, 5],
  ['calculate a discount amount',
   'calculate a sale price after a discount',
   'calculate final cost including discount and tax together'],
  { std: 'IL Math {mrp}', bands: ['9-12', '18-22'], gen_opts: { v: 'percentchange' } });

FR('mt-fr-08', 'Fractions in measurement contexts',
  'Given {n} measurement problems involving fractional units',
  'solve each problem and express the answer in the correct unit',
  'accuracy', 85, [4, 5],
  ['read a ruler to the nearest quarter inch',
   'add and subtract fractional measurements',
   'solve multi-step measurement problems with fractional units'],
  { gen_opts: { v: 'measurement' }, std: 'IL Math {mg}', fade: 'functional' });

FR('mt-fr-09', 'Fractions and decimals on a number line',
  'Given a number line and {n} values',
  'place each value at the correct point on the number line',
  'accuracy', 85, [4, 5],
  ['place halves and fourths on a number line',
   'place decimals to the hundredths on a number line',
   'place fractions, decimals and percents on one number line accurately'],
  { gen_opts: { v: 'numberline' } });

FR('mt-fr-10', 'Ratios expressed as fractions and percents',
  'Given {n} part-to-whole situations',
  'express each situation as a fraction, decimal and percent',
  'accuracy', 85, [4, 5],
  ['express a part-to-whole situation as a fraction',
   'express a part-to-whole situation as a fraction and a percent',
   'express any part-to-whole or part-to-part situation in all three forms'],
  { gen_opts: { v: 'ratios' }, std: 'IL Math {mrp}' });

FR('mt-fr-11', 'Estimating with fractions and percents',
  'Given {n} fraction and percent problems',
  'estimate the answer using benchmarks before calculating',
  'accuracy', 85, [4, 5],
  ['state whether a fraction is closer to 0, one half or 1',
   'estimate a sum or difference of fractions using benchmarks',
   'estimate a percent of a number and use it to check the calculated answer'],
  { gen_opts: { v: 'estimate' } });

// ---- integers & rational numbers ---------------------------------------------------------------
const IN = section({
  domain: 'Math', sub: 'Integers & Rational Numbers', pool: 'ma-integers',
  std: 'IL Math {msn}', dx: ['SLD', 'OHI'], bands: ['6-8', '9-12']
});

IN('mt-in-01', 'Adding and subtracting integers',
  'Given {n} problems adding and subtracting positive and negative integers',
  'solve each problem correctly',
  'accuracy', 85, [4, 5],
  ['add integers with the same sign',
   'add and subtract integers with different signs',
   'solve multi-term integer expressions with mixed signs'],
  { gen_opts: { v: 'addsub' } });

IN('mt-in-02', 'Multiplying and dividing integers',
  'Given {n} problems multiplying and dividing integers',
  'solve each problem correctly, including the sign',
  'accuracy', 85, [4, 5],
  ['state the sign rules for multiplication and division',
   'multiply and divide two integers correctly',
   'evaluate multi-step integer expressions with correct signs'],
  { gen_opts: { v: 'multdiv' } });

IN('mt-in-03', 'Absolute value and opposites',
  'Given {n} integer expressions containing absolute value',
  'evaluate each expression correctly',
  'accuracy', 85, [4, 5],
  ['state the absolute value of an integer',
   'evaluate expressions containing absolute value',
   'compare expressions containing absolute value and opposites'],
  { gen_opts: { v: 'absvalue' } });

IN('mt-in-04', 'Integers on a number line and in context',
  'Given {n} real situations involving positive and negative quantities',
  'represent each situation with an integer and place it on a number line',
  'accuracy', 85, [4, 5],
  ['represent a real situation with a positive or negative integer',
   'place integers on a number line and compare them',
   'solve a real problem involving change between positive and negative values'],
  { gen_opts: { v: 'contextline' }, fade: 'functional' });

IN('mt-in-05', 'Operations with rational numbers',
  'Given {n} problems combining integers, fractions and decimals',
  'solve each problem correctly',
  'accuracy', 85, [4, 5],
  ['solve problems combining integers and decimals',
   'solve problems combining integers and fractions',
   'solve multi-step problems combining all rational number forms'],
  { gen_opts: { v: 'rational' } });

IN('mt-in-06', 'Properties of operations',
  'Given {n} expressions to simplify',
  'apply the commutative, associative and distributive properties correctly',
  'accuracy', 85, [4, 5],
  ['identify which property an example demonstrates',
   'apply the distributive property to simplify an expression',
   'apply properties to simplify multi-term expressions efficiently'],
  { gen_opts: { v: 'properties' }, std: 'IL Math {mee}' });

// ---- ratio & proportional reasoning -------------------------------------------------------------------
const RP = section({
  domain: 'Math', sub: 'Ratio & Proportional Reasoning', pool: 'ma-ratio',
  std: 'IL Math {mrp}', dx: ['SLD', 'OHI', 'ID']
});

RP('mt-rp-01', 'Writing and simplifying ratios',
  'Given {n} situations comparing two quantities',
  'write the ratio in simplest form',
  'accuracy', 85, [4, 5],
  ['write a ratio from a picture or a stated comparison',
   'write and simplify part-to-part and part-to-whole ratios',
   'write equivalent ratios and identify which situations they describe'],
  { gen_opts: { v: 'writeratio' } });

RP('mt-rp-02', 'Solving proportions',
  'Given {n} proportions with one unknown',
  'solve for the unknown value',
  'accuracy', 85, [4, 5],
  ['solve a proportion with whole-number values',
   'solve a proportion requiring cross multiplication',
   'set up and solve a proportion from a described situation'],
  { gen_opts: { v: 'proportion' } });

RP('mt-rp-03', 'Unit rate and better buy',
  'Given {n} pricing situations',
  'calculate the unit rate and identify the better buy',
  'accuracy', 85, [4, 5],
  ['calculate a unit price from a total price and quantity',
   'compare two unit prices and identify the better buy',
   'compare unit prices across different units and sizes and justify the choice'],
  { gen_opts: { v: 'unitrate' }, fade: 'functional',
    note: 'Unit rate is the single highest-value proportional reasoning skill for adult life — anchor it in real store pricing rather than abstract ratio tables.' });

RP('mt-rp-04', 'Scale and scale drawings',
  'Given a scale drawing or map with a stated scale',
  'calculate actual distances and dimensions from the drawing',
  'accuracy', 85, [4, 5],
  ['read a scale and state what one unit represents',
   'calculate an actual distance from a map scale',
   'calculate actual dimensions and produce a scaled measurement'],
  { gen_opts: { v: 'scale' }, std: 'IL Math {mg}', bands: ['6-8', '9-12'] });

RP('mt-rp-05', 'Proportional relationships in tables and graphs',
  'Given tables and graphs of paired quantities',
  'determine whether the relationship is proportional and state the constant of proportionality',
  'accuracy', 85, [4, 5],
  ['state whether a table shows a constant rate',
   'find the constant of proportionality from a table',
   'identify proportional relationships in tables, graphs and equations'],
  { gen_opts: { v: 'tablegraph' }, bands: ['6-8', '9-12'] });

RP('mt-rp-06', 'Converting units of measure',
  'Given {n} measurements to convert within and between systems',
  'convert each measurement correctly',
  'accuracy', 85, [4, 5],
  ['convert within the customary system',
   'convert within the metric system',
   'convert between customary and metric units using a conversion factor'],
  { gen_opts: { v: 'unitconvert' }, std: 'IL Math {mg}' });

RP('mt-rp-07', 'Applying rates to real situations',
  'Given {n} rate situations drawn from {life}',
  'calculate the requested amount, time or distance',
  'accuracy', 85, [4, 5],
  ['calculate a total from a stated rate',
   'calculate time or quantity from a rate and a total',
   'solve multi-step rate problems, including pay, mileage and consumption'],
  { gen_opts: { v: 'rates' }, fade: 'functional' });

// ---- algebraic reasoning -----------------------------------------------------------------------------
const AL = section({
  domain: 'Math', sub: 'Algebraic Reasoning', pool: 'ma-algebra',
  std: 'IL Math {mee}', dx: ['SLD', 'OHI']
});

AL('mt-al-01', 'Evaluating algebraic expressions',
  'Given {n} algebraic expressions and values for the variables',
  'substitute and evaluate each expression',
  'accuracy', 85, [4, 5],
  ['evaluate one-variable expressions with one operation',
   'evaluate one-variable expressions with two operations',
   'evaluate two-variable expressions requiring order of operations'],
  { gen_opts: { v: 'evaluate' } });

AL('mt-al-02', 'Simplifying expressions by combining like terms',
  'Given {n} algebraic expressions',
  'simplify each expression by combining like terms',
  'accuracy', 85, [4, 5],
  ['identify like terms in an expression',
   'combine like terms in a two-term expression',
   'simplify expressions requiring distribution before combining like terms'],
  { gen_opts: { v: 'liketerms' } });

AL('mt-al-03', 'Solving one-step equations',
  'Given {n} one-step linear equations',
  'solve each equation and check the solution',
  'accuracy', 90, [4, 5],
  ['solve one-step addition and subtraction equations',
   'solve one-step multiplication and division equations',
   'solve one-step equations with rational coefficients and check each solution'],
  { gen_opts: { v: 'onestep' } });

AL('mt-al-04', 'Solving two-step and multi-step equations',
  'Given {n} multi-step linear equations',
  'solve each equation and check the solution',
  'accuracy', 85, [4, 5],
  ['solve two-step equations with integer coefficients',
   'solve multi-step equations requiring distribution',
   'solve equations with variables on both sides'],
  { gen_opts: { v: 'multistep' } });

AL('mt-al-05', 'Solving and graphing inequalities',
  'Given {n} one-variable inequalities',
  'solve each inequality and graph the solution on a number line',
  'accuracy', 85, [4, 5],
  ['graph a simple inequality on a number line',
   'solve and graph one-step inequalities',
   'solve and graph multi-step inequalities, reversing the sign when required'],
  { gen_opts: { v: 'inequality' }, bands: ['6-8', '9-12'] });

AL('mt-al-06', 'Writing equations from situations',
  'Given {n} real situations described in words',
  'write an equation that models the situation and solve it',
  'accuracy', 85, [4, 5],
  ['identify the unknown quantity and assign a variable',
   'write a one-step equation from a described situation',
   'write and solve a multi-step equation from a described situation'],
  { gen_opts: { v: 'writeeq' }, std: 'IL Math {mee}' });

AL('mt-al-07', 'Graphing linear equations',
  'Given {nshort} linear equations',
  'graph each equation on a coordinate plane',
  'accuracy', 85, [4, 5],
  ['plot ordered pairs on a coordinate plane',
   'graph a line from a table of values',
   'graph a line directly from slope-intercept form'],
  { gen_opts: { v: 'graphing' }, bands: ['6-8', '9-12'] });

AL('mt-al-08', 'Interpreting slope and intercept in context',
  'Given a linear graph or equation modelling a real situation',
  'state what the slope and the intercept mean in that situation',
  'accuracy', 85, [4, 5],
  ['identify the slope and the y-intercept of a line',
   'state what the y-intercept represents in the situation',
   'state what both the slope and the intercept represent and predict a value from the model'],
  { gen_opts: { v: 'slopeint' }, bands: ['9-12', '18-22'], std: 'IL Math HSF-IF.B.4' });

AL('mt-al-09', 'Solving systems of linear equations',
  'Given {nshort} systems of two linear equations',
  'solve each system and check the solution',
  'accuracy', 80, [3, 4],
  ['identify the solution of a system from a graph',
   'solve a system by substitution',
   'solve a system by substitution or elimination and check the solution'],
  { gen_opts: { v: 'systems' }, bands: ['9-12'], std: 'IL Math HSA-REI.C.6' });

AL('mt-al-10', 'Recognising and extending patterns',
  'Given {nshort} numeric and visual patterns',
  'state the rule and extend the pattern',
  'accuracy', 85, [4, 5],
  ['extend a repeating pattern',
   'state the rule for an arithmetic pattern and extend it',
   'state the rule for a growing pattern algebraically and predict a distant term'],
  { gen_opts: { v: 'patterns' } });

AL('mt-al-11', 'Function notation and input-output relationships',
  'Given {nshort} functions in table, graph or equation form',
  'evaluate the function for given inputs and state the corresponding outputs',
  'accuracy', 85, [4, 5],
  ['complete an input-output table from a stated rule',
   'evaluate a function for a given input using function notation',
   'move between table, graph and equation representations of the same function'],
  { gen_opts: { v: 'functions' }, bands: ['9-12'], std: 'IL Math HSF-IF.A.2' });

// ---- geometry & measurement -----------------------------------------------------------------------------
const GE = section({
  domain: 'Math', sub: 'Geometry & Measurement', pool: 'ma-geometry',
  std: 'IL Math {mg}', dx: ['SLD', 'ID', 'OHI']
});

GE('mt-ge-01', 'Measuring length with standard tools',
  'Given a ruler, tape measure and {n} objects or drawings',
  'measure each to the required precision',
  'accuracy', 90, [4, 5],
  ['measure to the nearest inch and centimetre',
   'measure to the nearest quarter inch and millimetre',
   'measure to the nearest sixteenth inch and record the measurement correctly'],
  { gen_opts: { v: 'measure' }, fade: 'functional' });

GE('mt-ge-02', 'Perimeter and area of rectangles and triangles',
  'Given {n} figures with labelled dimensions',
  'calculate the perimeter and area of each figure',
  'accuracy', 85, [4, 5],
  ['calculate the perimeter of a rectangle',
   'calculate the area of rectangles and triangles',
   'calculate the area of composite figures made of rectangles and triangles'],
  { gen_opts: { v: 'perimarea' } });

GE('mt-ge-03', 'Circumference and area of circles',
  'Given {n} circles with a labelled radius or diameter',
  'calculate the circumference and area of each',
  'accuracy', 85, [4, 5],
  ['identify the radius and diameter of a circle',
   'calculate circumference from radius or diameter',
   'calculate circumference and area and solve for a missing dimension'],
  { gen_opts: { v: 'circles' }, bands: ['6-8', '9-12'] });

GE('mt-ge-04', 'Volume and surface area of solids',
  'Given {n} three-dimensional figures with labelled dimensions',
  'calculate the volume and surface area of each',
  'accuracy', 85, [4, 5],
  ['calculate the volume of a rectangular prism',
   'calculate the volume of prisms and cylinders',
   'calculate the surface area and volume of prisms, cylinders and composite solids'],
  { gen_opts: { v: 'volume' } });

GE('mt-ge-05', 'Classifying and describing figures',
  'Given {n} two- and three-dimensional figures',
  'name each figure and describe its defining properties',
  'accuracy', 85, [4, 5],
  ['name common two-dimensional figures',
   'classify triangles and quadrilaterals by sides and angles',
   'name and describe the properties of two- and three-dimensional figures'],
  { gen_opts: { v: 'classify' }, bands: ['6-8', '9-12'] });

GE('mt-ge-06', 'Angle relationships',
  'Given {n} figures containing angle relationships',
  'find the missing angle measures and name the relationship used',
  'accuracy', 85, [4, 5],
  ['measure an angle with a protractor and classify it',
   'find missing angles using complementary and supplementary relationships',
   'find missing angles using vertical, corresponding and triangle-sum relationships'],
  { gen_opts: { v: 'angles' }, bands: ['6-8', '9-12'] });

GE('mt-ge-07', 'The Pythagorean Theorem',
  'Given {nshort} right triangles with two known side lengths',
  'find the missing side length',
  'accuracy', 85, [4, 5],
  ['identify the hypotenuse and the legs of a right triangle',
   'find the hypotenuse given two legs',
   'find any missing side and apply the theorem to a real distance problem'],
  { gen_opts: { v: 'pythagorean' }, bands: ['6-8', '9-12'], std: 'IL Math 8.G.B.7' });

GE('mt-ge-08', 'Coordinate geometry',
  'Given a coordinate plane and {n} points or figures',
  'plot points, identify coordinates and find distances between points',
  'accuracy', 85, [4, 5],
  ['plot and name points in all four quadrants',
   'find the distance between two points on the same line',
   'find side lengths and perimeter of a figure plotted on the coordinate plane'],
  { gen_opts: { v: 'coordinate' }, bands: ['6-8', '9-12'] });

GE('mt-ge-09', 'Measurement in applied projects',
  'Given an applied task in {life} requiring measurement and calculation',
  'measure, calculate and state the quantity of material or time required',
  'accuracy', 85, [4, 5],
  ['measure and record the required dimensions',
   'calculate area or volume from the measurements taken',
   'calculate the material required, including waste, and state the cost'],
  { pool: 'ma-performance', fade: 'functional' });

GE('mt-ge-10', 'Reading and applying measurement in recipes and instructions',
  'Given a recipe or set of assembly instructions',
  'measure and apply each quantity accurately, converting where required',
  'accuracy', 90, [4, 5],
  ['measure stated quantities with the correct tool',
   'convert a stated quantity to an available measuring tool',
   'scale a recipe or instruction set up or down and measure accurately'],
  { pool: 'ma-performance', fade: 'functional' });

// ---- data & statistics ----------------------------------------------------------------------------------
const DA = section({
  domain: 'Math', sub: 'Data & Statistics', pool: 'ma-data',
  std: 'IL Math {msp}', dx: ['SLD', 'OHI', 'ID']
});

DA('mt-da-01', 'Reading data from tables and graphs',
  'Given {n} tables, bar graphs and line graphs',
  'answer questions by reading values directly from each display',
  'accuracy', 90, [4, 5],
  ['read a single value from a bar graph or table',
   'compare two values and state the difference',
   'read values from line, bar and circle graphs and answer multi-step questions'],
  { gen_opts: { v: 'readgraph' } });

DA('mt-da-02', 'Creating graphs from data',
  'Given a data set and graph paper or a spreadsheet',
  'construct an appropriately scaled and labelled graph',
  'accuracy', 85, [4, 5],
  ['construct a bar graph with a provided scale and labels',
   'choose an appropriate scale and construct a labelled bar or line graph',
   'choose the graph type that fits the data and construct it fully labelled'],
  { gen_opts: { v: 'makegraph' } });

DA('mt-da-03', 'Measures of center',
  'Given {n} data sets',
  'calculate the mean, median and mode of each',
  'accuracy', 85, [4, 5],
  ['calculate the mode and the range',
   'calculate the mean and the median',
   'calculate all measures of center and state which best represents the data'],
  { gen_opts: { v: 'center' } });

DA('mt-da-04', 'Measures of spread and outliers',
  'Given {n} data sets',
  'calculate the range and identify outliers and their effect',
  'accuracy', 85, [4, 5],
  ['calculate the range of a data set',
   'identify an outlier in a data set',
   'state how an outlier changes the mean and why the median may be preferred'],
  { gen_opts: { v: 'spread' }, bands: ['9-12', '18-22'] });

DA('mt-da-05', 'Interpreting data displays in context',
  'Given a data display drawn from a news, health or workplace source',
  'state what the data show and what conclusion it supports',
  'accuracy', 85, [4, 5],
  ['state the topic and the units of a data display',
   'state the trend a data display shows',
   'state what conclusion the data support and what it does not support'],
  { gen_opts: { v: 'interpret' }, fade: 'functional',
    note: 'The transferable skill is not calculating the mean — it is refusing a conclusion the data do not support. Score the justification, not the number.' });

DA('mt-da-06', 'Basic probability',
  'Given {n} probability situations',
  'calculate the probability of each event and express it as a fraction, decimal and percent',
  'accuracy', 85, [4, 5],
  ['state whether an event is certain, likely, unlikely or impossible',
   'calculate the probability of a simple event',
   'calculate probabilities of simple and compound events and express them in all three forms'],
  { gen_opts: { v: 'probability' }, bands: ['6-8', '9-12'] });

DA('mt-da-07', 'Collecting and organizing data',
  'Given a question to investigate',
  'collect data systematically and organize it into a table',
  'accuracy', 85, [3, 4],
  ['record data on a provided tally sheet',
   'design a tally sheet and record data accurately',
   'collect, organize and summarize data to answer the original question'],
  { gen_opts: { v: 'collect' } });

DA('mt-da-08', 'Misleading graphs and data claims',
  'Given {nshort} data displays, at least one of which is misleading',
  'identify what makes a display misleading and state the correction',
  'accuracy', 85, [4, 5],
  ['identify the scale used on a graph',
   'identify a graph whose scale exaggerates a difference',
   'identify misleading scales, omitted data and unsupported claims and state the correction'],
  { gen_opts: { v: 'misleading' }, bands: ['9-12', '18-22'] });

// ---- word problems & problem solving --------------------------------------------------------------------------
const WP = section({
  domain: 'Math', sub: 'Word Problems & Problem Solving', pool: 'ma-wordproblem',
  std: 'IL Math {mee}', dx: ['SLD', 'ID', 'OHI', 'ASD']
});

WP('mt-wp-01', 'Solving one-step word problems',
  'Given {n} one-step word problems',
  'identify the operation, solve, and state the answer with its unit',
  'accuracy', 85, [4, 5],
  ['restate what a word problem is asking for',
   'identify the operation and solve a one-step problem',
   'solve one-step problems of all four operation types and label the answer'],
  { gen_opts: { v: 'onestep' } });

WP('mt-wp-02', 'Solving multi-step word problems',
  'Given {n} multi-step word problems',
  'carry out each step in order and state the answer with its unit',
  'accuracy', 85, [4, 5],
  ['list the steps required before solving',
   'solve two-step problems accurately',
   'solve three- and four-step problems accurately and label the answer'],
  { gen_opts: { v: 'multistep' } });

WP('mt-wp-03', 'Identifying relevant and irrelevant information',
  'Given {n} word problems containing extra information',
  'identify the information needed and solve using only that information',
  'accuracy', 85, [4, 5],
  ['underline the question being asked',
   'cross out information not needed to answer the question',
   'select only the needed information and solve problems containing distractors'],
  { gen_opts: { v: 'relevant' } });

WP('mt-wp-04', 'Using a visual model to represent a problem',
  'Given {n} word problems and a choice of models',
  'draw a model representing the problem and use it to solve',
  'accuracy', 85, [4, 5],
  ['complete a provided model for a word problem',
   'choose and draw an appropriate model for the problem',
   'draw a model independently and use it to justify the solution'],
  { gen_opts: { v: 'model' } });

WP('mt-wp-05', 'Checking the reasonableness of an answer',
  'Given {n} solved word problems, some with unreasonable answers',
  'state whether each answer is reasonable and justify it',
  'accuracy', 85, [4, 5],
  ['state whether an answer is larger or smaller than expected',
   'use an estimate to judge whether an answer is reasonable',
   'identify unreasonable answers, explain the error and correct it'],
  { gen_opts: { v: 'reasonable' } });

WP('mt-wp-06', 'Word problems involving money',
  'Given {n} word problems set in purchasing and payment situations',
  'solve each problem and state the answer as a dollar amount',
  'accuracy', 90, [4, 5],
  ['calculate a total cost from listed prices',
   'calculate total cost and change from a payment',
   'solve multi-step money problems involving tax, discount and multiple items'],
  { gen_opts: { v: 'money' }, fade: 'functional', std: 'IL Math {mrp}' });

WP('mt-wp-07', 'Word problems involving time and schedules',
  'Given {n} word problems involving elapsed time and scheduling',
  'calculate the required time and state the answer in hours and minutes',
  'accuracy', 90, [4, 5],
  ['calculate elapsed time within one hour',
   'calculate elapsed time across hours',
   'calculate elapsed time across days and solve scheduling conflicts'],
  { gen_opts: { v: 'time' }, fade: 'functional' });

WP('mt-wp-08', 'Word problems involving measurement and quantity',
  'Given {n} word problems requiring measurement or unit conversion',
  'solve each problem and state the answer in the correct unit',
  'accuracy', 85, [4, 5],
  ['solve problems using a single unit of measure',
   'solve problems requiring one unit conversion',
   'solve multi-step problems requiring more than one unit conversion'],
  { gen_opts: { v: 'measurement' }, std: 'IL Math {mg}' });

WP('mt-wp-09', 'Explaining a solution path',
  'Given a solved multi-step problem',
  'explain each step of the solution and why it was necessary',
  'rubric', 3, [3, 4],
  ['name the first step taken and why',
   'explain each step of a two-step solution',
   'explain a multi-step solution completely, including why an alternative approach was rejected'],
  { pool: 'st-notes', std: 'IL Math HSA-CED.A.1', bands: ['9-12', '18-22'] });

// ---- consumer & functional math --------------------------------------------------------------------------------
const CM = section({
  domain: 'Math', sub: 'Consumer & Functional Math', pool: 'ma-consumer',
  std: 'IL Math {msn}', dx: ['ID', 'SLD', 'ASD', 'MD', 'OHI'], fade: 'functional'
});

CM('mt-cm-01', 'Counting money and making change',
  'Given {n} purchase situations with bills and coins',
  'count out the correct amount and calculate the change owed',
  'accuracy', 95, [4, 5],
  ['count a mixed set of bills and coins',
   'count out an exact amount for a stated price',
   'calculate the change owed and count it back correctly'],
  { gen_opts: { v: 'counting' } });

CM('mt-cm-02', 'Using the next-dollar strategy',
  'Given {n} price tags',
  'state the number of whole dollars needed to cover each price',
  'accuracy', 95, [4, 5],
  ['state the next whole dollar above a price under $10',
   'state the next whole dollar above any two-digit price',
   'state the total whole dollars needed for a multi-item purchase'],
  { gen_opts: { v: 'nextdollar' }, note: 'Next-dollar is the strategy that makes independent purchasing possible before change calculation is mastered — it is a bridge skill, not a lowered expectation.' });

CM('mt-cm-03', 'Calculating sales tax and total cost',
  'Given {n} purchase situations and the local sales tax rate',
  'calculate the tax and the total cost',
  'accuracy', 90, [4, 5],
  ['calculate tax with a calculator and a stated rate',
   'calculate tax and add it to the subtotal',
   'calculate total cost for a multi-item purchase including tax and verify the receipt'],
  { gen_opts: { v: 'tax' }, std: 'IL Math {mrp}' });

CM('mt-cm-04', 'Calculating a tip and splitting a bill',
  'Given {nshort} restaurant bills',
  'calculate an appropriate tip and the amount owed per person',
  'accuracy', 90, [4, 5],
  ['calculate a 10% tip',
   'calculate a 15% or 20% tip',
   'calculate the tip and split the total bill evenly among a group'],
  { gen_opts: { v: 'tip' }, std: 'IL Math {mrp}', bands: ['9-12', '18-22'] });

CM('mt-cm-05', 'Reading a pay stub and calculating earnings',
  'Given a pay stub and an hourly wage',
  'calculate gross pay, identify each deduction and state net pay',
  'accuracy', 90, [4, 5],
  ['calculate gross pay from hours and hourly wage',
   'identify each deduction listed on a pay stub',
   'calculate gross pay, total deductions and net pay and check them against the stub'],
  { gen_opts: { v: 'paystub' }, bands: ['9-12', '18-22'] });

CM('mt-cm-06', 'Building and following a budget',
  'Given a stated monthly income and a list of expenses',
  'build a budget in which planned expenses do not exceed income',
  'accuracy', 90, [3, 4],
  ['sort expenses into needs and wants',
   'total monthly expenses and compare them to income',
   'build a balanced budget and adjust it when an expense changes'],
  { gen_opts: { v: 'budget' }, bands: ['9-12', '18-22'] });

CM('mt-cm-07', 'Comparison shopping and unit pricing',
  'Given {nshort} products in different sizes with different prices',
  'calculate unit prices and identify the better value',
  'accuracy', 90, [4, 5],
  ['calculate the unit price of one product',
   'compare two unit prices and choose the better value',
   'compare unit prices across sizes and brands and justify the choice'],
  { gen_opts: { v: 'unitprice' }, std: 'IL Math {mrp}' });

CM('mt-cm-08', 'Understanding credit, interest and account balances',
  'Given a bank or credit statement',
  'calculate the balance, interest charged and cost of carrying a balance',
  'accuracy', 85, [3, 4],
  ['read the balance and payment due from a statement',
   'calculate the interest charged on a stated balance',
   'calculate the total cost of paying only the minimum for a stated period'],
  { gen_opts: { v: 'credit' }, bands: ['18-22'] });

CM('mt-cm-09', 'Telling time and managing a schedule',
  'Given analog and digital clocks and a daily schedule',
  'state the time and calculate the time remaining before each scheduled event',
  'accuracy', 95, [4, 5],
  ['state the time to the nearest five minutes on an analog clock',
   'state the time to the minute and calculate elapsed time',
   'calculate arrival and departure times for a full daily schedule including travel'],
  { gen_opts: { v: 'time' } });

CM('mt-cm-10', 'Estimating cost before purchasing',
  'Given a shopping list and {money}',
  'estimate the total before checkout and state whether the purchase is affordable',
  'accuracy', 90, [4, 5],
  ['estimate the cost of three items by rounding',
   'estimate the total of a full shopping list',
   'estimate the total including tax and adjust the list to stay within budget'],
  { gen_opts: { v: 'estimate' } });

module.exports = collect(NS, FF, CO, FR, IN, RP, AL, GE, DA, WP, CM);
