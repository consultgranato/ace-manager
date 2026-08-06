// =============================================================
// Ace Manager — probe pool registry
// =============================================================
// One entry per progress-monitoring pool. Both builders read this: the goal
// bank stamps `pool` onto each goal, the probe bank materialises the curated
// item sets, and the runtime probe engine (js/probe-engine.js) uses `gen` to
// mint fresh alternate forms each cycle.
//
// Three kinds, because "how do you actually get a number for this skill" has
// three honest answers:
//   academic     — the student answers scored items alone, via a link
//   self_report  — the student rates their own behaviour, via a link
//   observation  — an adult scores a rubric or tally while watching the skill
//
// The observation kind is what lets fluency, articulation, motor and job-task
// goals be monitored at all. Before it, a third of the bank had no probe and
// the app just told the case manager to log data by hand.
//
// `gen` names a deterministic item GENERATOR. Generated pools produce
// equivalent alternate forms on demand, which is the actual defining property
// of curriculum-based measurement — every cycle is a different form of the
// same difficulty, so a rising score means learning and not memorisation.
// `curated: true` means the items are authored once (with band tokens) in the
// probe bank; those are the skills no generator can fake, like inference from
// a real passage or a judgement call about a co-worker.

'use strict';

const G = (id, label, method, gen, opts = {}) => ({
  label, kind: 'academic', method, gen, frequency: 'biweekly', items: 9,
  administration: opts.admin || 'Student completes the linked probe independently; items are auto-scored.',
  ...opts
});
const C = (id, label, method, opts = {}) => ({
  label, kind: opts.kind || 'academic', method, curated: true, frequency: 'biweekly', items: 9,
  administration: opts.admin || 'Student completes the linked probe independently; items are auto-scored.',
  ...opts
});
const O = (id, label, method, opts = {}) => ({
  label, kind: 'observation', method, curated: true, frequency: opts.frequency || 'biweekly', items: 6,
  administration: opts.admin || 'Case manager scores the rubric while observing the skill, then records it in the app.',
  default_method: opts.default_method || 'a scoring rubric',
  ...opts
});
const S = (id, label, method, opts = {}) => ({
  label, kind: 'self_report', method, curated: true, frequency: 'biweekly', items: 9,
  administration: opts.admin || 'Student rates their own performance on the linked check-in; ratings are auto-scored.',
  default_method: opts.default_method || 'a self-monitoring checklist',
  ...opts
});

const POOLS = {

  // ---- word study & decoding (generated) ------------------------------------
  'ws-phonology':   G(0, 'Word study — phonological awareness', 'auto-scored phonological awareness probes', 'phonology'),
  'ws-decoding':    G(0, 'Word study — decoding & word attack', 'auto-scored decoding probes', 'decoding'),
  'ws-morphology':  G(0, 'Word study — morphology', 'auto-scored morphology probes', 'morphology'),
  'ws-spelling':    G(0, 'Word study — spelling patterns', 'auto-scored spelling probes', 'spelling'),
  'ws-syllables':   G(0, 'Word study — syllable analysis', 'auto-scored syllable probes', 'syllables'),

  // ---- reading (curated + observation) --------------------------------------
  'rd-fluency':     O(0, 'Reading — oral reading fluency', 'timed oral reading fluency probes', {
    frequency: 'weekly', items: 3,
    default_method: 'curriculum-based measurement probes',
    admin: 'Student reads an unpracticed passage aloud for one minute; case manager marks errors and records words correct per minute.'
  }),
  'rd-vocab':       C(0, 'Reading — vocabulary', 'auto-scored vocabulary probes'),
  'rd-literal':     C(0, 'Reading — literal comprehension', 'auto-scored comprehension probes'),
  'rd-inferential': C(0, 'Reading — inferential comprehension', 'auto-scored comprehension probes'),
  'rd-structure':   C(0, 'Reading — text structure & analysis', 'auto-scored text analysis probes'),
  'rd-functional':  C(0, 'Reading — functional & survival text', 'auto-scored functional reading probes'),
  'rd-directions':  O(0, 'Reading — following written directions', 'a task analysis checklist', {
    default_method: 'a task analysis checklist',
    admin: 'Adult gives the written directions and scores each step as completed independently, prompted or not performed.'
  }),
  // Summary, paraphrase and analysis are constructed responses. They cannot be
  // auto-scored honestly, so they get an adult-scored rubric rather than a
  // multiple-choice stand-in that would measure something else.
  'rd-written':     O(0, 'Reading — written response to text', 'a scored written response', {
    frequency: 'biweekly', items: 5,
    default_method: 'work samples scored with a rubric',
    admin: 'Student writes a response to a passage; case manager scores each rubric row.'
  }),

  // ---- written language ------------------------------------------------------
  'wr-mechanics':   G(0, 'Writing — mechanics & conventions', 'auto-scored conventions probes', 'mechanics'),
  'wr-usage':       G(0, 'Writing — grammar & usage', 'auto-scored usage probes', 'usage'),
  'wr-sentence':    G(0, 'Writing — sentence construction', 'auto-scored sentence probes', 'sentence'),
  'wr-editing':     G(0, 'Writing — editing & revision', 'auto-scored editing probes', 'editing'),
  'wr-paragraph':   O(0, 'Writing — paragraph & composition', 'a scored writing sample', {
    frequency: 'monthly', items: 6,
    default_method: 'work samples scored with a rubric',
    admin: 'Student produces a timed writing sample; case manager scores the rubric rows and correct word sequences.'
  }),
  'wr-research':    C(0, 'Writing — research & citation', 'auto-scored research skills probes'),
  'wr-functional':  O(0, 'Writing — functional & workplace writing', 'a scored writing sample', {
    frequency: 'monthly', items: 6,
    default_method: 'work samples scored with a rubric',
    admin: 'Case manager scores a completed form, message or application against the rubric rows.'
  }),

  // ---- math (generated) -------------------------------------------------------
  // Applied measurement and writing-process goals cannot be auto-scored: the
  // skill IS the performance. They get an adult-scored pool rather than a
  // multiple-choice stand-in that would measure recognition and call it doing.
  'ma-performance': O(0, 'Math — applied measurement task', 'a task analysis checklist', {
    default_method: 'a task analysis checklist',
    admin: 'Adult scores each step of the applied measurement task as independent, prompted or not performed.'
  }),
  'wr-process':     O(0, 'Writing — process & revision behaviors', 'an observation log', {
    default_method: 'an observation log',
    admin: 'Case manager records opportunities to revise or self-edit and how many the student completed.'
  }),

  'ma-numbersense': G(0, 'Math — number sense & place value', 'auto-scored number sense probes', 'numbersense'),
  // A link probe CAN produce a rate metric as long as it is timed — that is
  // exactly what a one-minute math CBM is. `timed` tells the probe form to run
  // the clock and the scorer to report digits correct per minute rather than
  // percent correct.
  'ma-facts':       G(0, 'Math — fact fluency', 'timed fact fluency probes', 'facts', {
    frequency: 'weekly', items: 30, timed: { seconds: 60, metric: 'dcpm' },
    admin: 'Student completes as many items as possible in one minute on the linked probe; digits correct per minute is scored automatically.'
  }),
  'ma-compfluency': G(0, 'Math — computation fluency', 'timed computation probes', 'computation', {
    frequency: 'weekly', items: 20, timed: { seconds: 120, metric: 'dcpm' },
    admin: 'Student completes as many items as possible in two minutes on the linked probe; digits correct per minute is scored automatically.'
  }),
  'ma-computation': G(0, 'Math — whole number computation', 'auto-scored computation probes', 'computation'),
  'ma-fractions':   G(0, 'Math — fractions, decimals & percents', 'auto-scored rational number probes', 'fractions'),
  'ma-integers':    G(0, 'Math — integers & rational numbers', 'auto-scored integer probes', 'integers'),
  'ma-ratio':       G(0, 'Math — ratio & proportional reasoning', 'auto-scored proportional reasoning probes', 'ratio'),
  'ma-algebra':     G(0, 'Math — algebraic reasoning', 'auto-scored algebra probes', 'algebra'),
  'ma-geometry':    G(0, 'Math — geometry & measurement', 'auto-scored geometry probes', 'geometry'),
  'ma-data':        G(0, 'Math — data & statistics', 'auto-scored data analysis probes', 'data'),
  'ma-wordproblem': G(0, 'Math — word problems & problem solving', 'auto-scored problem solving probes', 'wordproblem'),
  'ma-consumer':    G(0, 'Math — consumer & functional math', 'auto-scored consumer math probes', 'consumer'),

  // ---- communication ----------------------------------------------------------
  'co-receptive':   C(0, 'Communication — receptive language', 'auto-scored receptive language probes'),
  'co-expressive':  O(0, 'Communication — expressive language', 'a language sample scored with a rubric', {
    default_method: 'a language sample scored with a rubric',
    admin: 'Case manager elicits a language sample and scores each rubric row.'
  }),
  'co-pragmatics':  C(0, 'Communication — pragmatic language', 'auto-scored social communication probes'),
  'co-articulation':O(0, 'Communication — articulation & intelligibility', 'a tally of correct productions', {
    frequency: 'weekly',
    default_method: 'an articulation tally',
    admin: 'Adult tallies correct productions of the target sound across the listed contexts.'
  }),
  'co-fluency':     O(0, 'Communication — speech fluency', 'a tally of disfluencies', {
    frequency: 'weekly',
    default_method: 'a disfluency count',
    admin: 'Adult counts disfluent syllables across a timed speaking sample.'
  }),
  'co-voice':       O(0, 'Communication — voice & vocal hygiene', 'a rated speaking sample', {
    default_method: 'a rated speaking sample'
  }),
  'co-aac':         O(0, 'Communication — AAC use', 'a tally of independent device use', {
    default_method: 'an observation log',
    admin: 'Adult tallies independent, prompted and missed communication opportunities on the device.'
  }),

  // ---- behavior ---------------------------------------------------------------
  'be-regulation':  S(0, 'Behavior — self-regulation', 'a self-monitoring check-in'),
  'be-directions':  S(0, 'Behavior — following directions', 'a self-monitoring check-in'),
  'be-expectations':S(0, 'Behavior — classroom expectations', 'a self-monitoring check-in'),
  'be-conflict':    C(0, 'Behavior — conflict resolution', 'auto-scored situation judgement probes', { kind: 'self_report' }),
  'be-attendance':  O(0, 'Behavior — attendance & participation', 'attendance and participation records', {
    frequency: 'weekly',
    default_method: 'attendance and participation records',
    admin: 'Case manager records period-by-period attendance and participation counts.'
  }),
  // Counting is not self-reporting. Anything measured in occurrences, prompts
  // or observed intervals needs an adult with a tally sheet, so it gets its own
  // observation pool rather than borrowing the BIP one.
  'be-tally':       O(0, 'Behavior — frequency, prompt & interval tally', 'direct observation data', {
    frequency: 'weekly', items: 6,
    default_method: 'an observation log',
    admin: 'Adult tallies occurrences, prompts delivered, or engaged intervals across the agreed observation window.'
  }),
  'be-replacement': O(0, 'Behavior — replacement behavior', 'frequency data from an observation log', {
    frequency: 'weekly',
    default_method: 'an observation log',
    admin: 'Adult tallies target and replacement behaviors during the observation window named in the BIP.'
  }),

  // ---- social / emotional ------------------------------------------------------
  'se-coping':      S(0, 'Social/Emotional — coping skills', 'a self-monitoring check-in'),
  'se-peer':        C(0, 'Social/Emotional — peer interaction', 'auto-scored social judgement probes', { kind: 'self_report' }),
  'se-emotion':     C(0, 'Social/Emotional — emotional identification', 'auto-scored emotion recognition probes'),
  'se-frustration': S(0, 'Social/Emotional — frustration tolerance', 'a self-monitoring check-in'),
  'se-perspective': C(0, 'Social/Emotional — perspective taking', 'auto-scored perspective taking probes'),
  'se-resilience':  S(0, 'Social/Emotional — resilience & self-concept', 'a self-monitoring check-in'),

  // ---- executive functioning ----------------------------------------------------
  'ef-initiation':  S(0, 'Executive Functioning — task initiation', 'a self-monitoring check-in'),
  'ef-organization':S(0, 'Executive Functioning — organization', 'a self-monitoring check-in'),
  'ef-materials':   O(0, 'Executive Functioning — materials management', 'a materials check', {
    frequency: 'weekly', items: 6,
    default_method: 'a self-monitoring checklist',
    admin: 'Adult checks the named materials at a set time and records how many were present without prompting.'
  }),
  'ef-time':        S(0, 'Executive Functioning — time management', 'a self-monitoring check-in'),
  'ef-completion':  O(0, 'Executive Functioning — work completion', 'assignment completion records', {
    frequency: 'weekly',
    default_method: 'assignment completion records',
    admin: 'Case manager records assignments due, submitted on time, and submitted late from the gradebook.'
  }),
  'ef-monitoring':  S(0, 'Executive Functioning — self-monitoring', 'a self-monitoring check-in'),
  'ef-planning':    C(0, 'Executive Functioning — planning & prioritizing', 'auto-scored planning probes'),
  'ef-memory':      C(0, 'Executive Functioning — working memory strategies', 'auto-scored strategy probes'),

  // ---- independent living --------------------------------------------------------
  'il-money':       G(0, 'Independent Living — money & budgeting', 'auto-scored money probes', 'money'),
  'il-navigation':  C(0, 'Independent Living — community navigation', 'auto-scored navigation probes'),
  'il-household':   O(0, 'Independent Living — household management', 'a task analysis checklist', {
    default_method: 'a task analysis checklist',
    admin: 'Adult scores each step of the task analysis as independent, prompted or not performed.'
  }),
  'il-safety':      C(0, 'Independent Living — personal safety', 'auto-scored safety judgement probes'),
  'il-health':      C(0, 'Independent Living — health & self-care', 'auto-scored health literacy probes'),
  'il-food':        O(0, 'Independent Living — food & nutrition', 'a task analysis checklist', {
    default_method: 'a task analysis checklist',
    admin: 'Adult scores each step of the food preparation task analysis.'
  }),
  'il-tech':        C(0, 'Independent Living — technology & digital literacy', 'auto-scored digital literacy probes'),

  // ---- self-advocacy ---------------------------------------------------------------
  'sa-accommodations': C(0, 'Self-Advocacy — requesting accommodations', 'auto-scored self-advocacy probes', { kind: 'self_report' }),
  'sa-awareness':      C(0, 'Self-Advocacy — disability awareness', 'auto-scored disability awareness probes'),
  'sa-helpseeking':    S(0, 'Self-Advocacy — help-seeking', 'a self-monitoring check-in'),
  'sa-iep':            C(0, 'Self-Advocacy — IEP participation', 'auto-scored IEP knowledge probes'),
  'sa-determination':  S(0, 'Self-Advocacy — self-determination', 'a self-monitoring check-in'),

  // ---- vocational --------------------------------------------------------------------
  'vo-jobseeking':  C(0, 'Vocational — job seeking', 'auto-scored job-seeking probes'),
  'vo-workplace':   C(0, 'Vocational — workplace behavior', 'auto-scored workplace judgement probes', { kind: 'self_report' }),
  'vo-career':      C(0, 'Vocational — career exploration', 'auto-scored career exploration probes'),
  'vo-jobtask':     O(0, 'Vocational — job task performance', 'a task analysis checklist', {
    frequency: 'weekly',
    default_method: 'a task analysis checklist',
    admin: 'Job coach scores each step of the job task analysis as independent, prompted or not performed.'
  }),
  'vo-communication': C(0, 'Vocational — workplace communication', 'auto-scored workplace communication probes', { kind: 'self_report' }),
  'vo-stamina':     O(0, 'Vocational — work stamina & reliability', 'an observation log', {
    frequency: 'weekly',
    default_method: 'an observation log',
    admin: 'Job coach records minutes on task, breaks taken and prompts required for each work session.'
  }),

  // ---- motor -----------------------------------------------------------------------------
  'mo-fine':        O(0, 'Motor — fine motor', 'a scored motor task', {
    default_method: 'a scoring rubric',
    admin: 'Adult scores each rubric row while the student performs the motor task.'
  }),
  'mo-gross':       O(0, 'Motor — gross motor', 'a scored motor task', { default_method: 'a scoring rubric' }),
  'mo-visualmotor': O(0, 'Motor — visual-motor integration', 'a scored motor task', { default_method: 'a scoring rubric' }),
  'mo-keyboarding': O(0, 'Motor — keyboarding & digital access', 'a timed keyboarding sample', {
    frequency: 'weekly',
    default_method: 'a timed keyboarding sample',
    admin: 'Student types a standard passage for three minutes; adult records words per minute and accuracy.'
  }),

  // ---- study & test skills ------------------------------------------------------------------
  'st-notes':       O(0, 'Study Skills — note-taking', 'scored notes from a lesson', {
    default_method: 'work samples scored with a rubric',
    admin: 'Case manager scores the student\'s notes from a recorded or live lesson against the rubric rows.'
  }),
  'st-testprep':    C(0, 'Study Skills — test preparation', 'auto-scored study strategy probes'),
  'st-teststrategy':C(0, 'Study Skills — test-taking strategies', 'auto-scored test strategy probes'),
  'st-study':       S(0, 'Study Skills — study routines', 'a self-monitoring check-in'),
  'st-directions':  C(0, 'Study Skills — assignment comprehension', 'auto-scored direction-following probes')
};

module.exports = { POOLS };
