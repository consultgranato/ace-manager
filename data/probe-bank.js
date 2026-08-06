// =============================================================
// Ace Manager — probe bank (GENERATED — do not hand-edit)
// =============================================================
// Built by tools/build-probe-bank.js. Re-run the builder instead of editing.
//
// `pools` describes HOW each goal is monitored: the kind of probe (student
// academic, student self-report, or adult observation), the cadence, who scores
// it, and how the case manager is meant to administer it.
//
// `items` holds the hand-authored items — the ones no generator can honestly
// produce, like inference from a passage or a judgement call about a co-worker.
// Every item carries a tier (1-3) naming the benchmark it measures, so a single
// probe reports a score per benchmark as well as an overall score.
//
// Generated pools appear in `pools` with a `gen` key and contribute NO items
// here: js/probe-engine.js mints a fresh equivalent form for those every cycle,
// which is what makes a rising progress line mean fluency and not memorisation.
//
// 87 pools (22 generated) · 309 curated items
// =============================================================

window.ACE_PROBE_BANK = {
"version": 2,
"built": "2026-08-06",
"pools": {
 "ws-phonology": {
  "label": "Word study — phonological awareness",
  "kind": "academic",
  "method": "auto-scored phonological awareness probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored phonological awareness probes",
  "gen": "phonology"
 },
 "ws-decoding": {
  "label": "Word study — decoding & word attack",
  "kind": "academic",
  "method": "auto-scored decoding probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored decoding probes",
  "gen": "decoding"
 },
 "ws-morphology": {
  "label": "Word study — morphology",
  "kind": "academic",
  "method": "auto-scored morphology probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored morphology probes",
  "gen": "morphology"
 },
 "ws-spelling": {
  "label": "Word study — spelling patterns",
  "kind": "academic",
  "method": "auto-scored spelling probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored spelling probes",
  "gen": "spelling"
 },
 "ws-syllables": {
  "label": "Word study — syllable analysis",
  "kind": "academic",
  "method": "auto-scored syllable probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored syllable probes",
  "gen": "syllables"
 },
 "rd-fluency": {
  "label": "Reading — oral reading fluency",
  "kind": "observation",
  "method": "timed oral reading fluency probes",
  "administration": "Student reads an unpracticed passage aloud for one minute; case manager marks errors and records words correct per minute.",
  "frequency": "weekly",
  "items": 3,
  "default_method": "curriculum-based measurement probes",
  "curated": 3
 },
 "rd-vocab": {
  "label": "Reading — vocabulary",
  "kind": "academic",
  "method": "auto-scored vocabulary probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored vocabulary probes",
  "curated": 9
 },
 "rd-literal": {
  "label": "Reading — literal comprehension",
  "kind": "academic",
  "method": "auto-scored comprehension probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored comprehension probes",
  "curated": 9
 },
 "rd-inferential": {
  "label": "Reading — inferential comprehension",
  "kind": "academic",
  "method": "auto-scored comprehension probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored comprehension probes",
  "curated": 9
 },
 "rd-structure": {
  "label": "Reading — text structure & analysis",
  "kind": "academic",
  "method": "auto-scored text analysis probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored text analysis probes",
  "curated": 9
 },
 "rd-functional": {
  "label": "Reading — functional & survival text",
  "kind": "academic",
  "method": "auto-scored functional reading probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored functional reading probes",
  "curated": 9
 },
 "rd-directions": {
  "label": "Reading — following written directions",
  "kind": "observation",
  "method": "a task analysis checklist",
  "administration": "Adult gives the written directions and scores each step as completed independently, prompted or not performed.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a task analysis checklist"
 },
 "rd-written": {
  "label": "Reading — written response to text",
  "kind": "observation",
  "method": "a scored written response",
  "administration": "Student writes a response to a passage; case manager scores each rubric row.",
  "frequency": "biweekly",
  "items": 5,
  "default_method": "work samples scored with a rubric",
  "curated": 3
 },
 "wr-mechanics": {
  "label": "Writing — mechanics & conventions",
  "kind": "academic",
  "method": "auto-scored conventions probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored conventions probes",
  "gen": "mechanics"
 },
 "wr-usage": {
  "label": "Writing — grammar & usage",
  "kind": "academic",
  "method": "auto-scored usage probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored usage probes",
  "gen": "usage"
 },
 "wr-sentence": {
  "label": "Writing — sentence construction",
  "kind": "academic",
  "method": "auto-scored sentence probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored sentence probes",
  "gen": "sentence"
 },
 "wr-editing": {
  "label": "Writing — editing & revision",
  "kind": "academic",
  "method": "auto-scored editing probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored editing probes",
  "gen": "editing"
 },
 "wr-paragraph": {
  "label": "Writing — paragraph & composition",
  "kind": "observation",
  "method": "a scored writing sample",
  "administration": "Student produces a timed writing sample; case manager scores the rubric rows and correct word sequences.",
  "frequency": "monthly",
  "items": 6,
  "default_method": "work samples scored with a rubric",
  "curated": 3
 },
 "wr-research": {
  "label": "Writing — research & citation",
  "kind": "academic",
  "method": "auto-scored research skills probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored research skills probes",
  "curated": 9
 },
 "wr-functional": {
  "label": "Writing — functional & workplace writing",
  "kind": "observation",
  "method": "a scored writing sample",
  "administration": "Case manager scores a completed form, message or application against the rubric rows.",
  "frequency": "monthly",
  "items": 6,
  "default_method": "work samples scored with a rubric",
  "curated": 3
 },
 "ma-numbersense": {
  "label": "Math — number sense & place value",
  "kind": "academic",
  "method": "auto-scored number sense probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored number sense probes",
  "gen": "numbersense"
 },
 "ma-facts": {
  "label": "Math — fact fluency",
  "kind": "academic",
  "method": "timed fact fluency probes",
  "administration": "Student completes as many items as possible in one minute on the linked probe; digits correct per minute is scored automatically.",
  "frequency": "weekly",
  "items": 30,
  "default_method": "timed fact fluency probes",
  "gen": "facts",
  "timed": {
   "seconds": 60,
   "metric": "dcpm"
  }
 },
 "ma-compfluency": {
  "label": "Math — computation fluency",
  "kind": "academic",
  "method": "timed computation probes",
  "administration": "Student completes as many items as possible in two minutes on the linked probe; digits correct per minute is scored automatically.",
  "frequency": "weekly",
  "items": 20,
  "default_method": "timed computation probes",
  "gen": "computation",
  "timed": {
   "seconds": 120,
   "metric": "dcpm"
  }
 },
 "ma-computation": {
  "label": "Math — whole number computation",
  "kind": "academic",
  "method": "auto-scored computation probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored computation probes",
  "gen": "computation"
 },
 "ma-fractions": {
  "label": "Math — fractions, decimals & percents",
  "kind": "academic",
  "method": "auto-scored rational number probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored rational number probes",
  "gen": "fractions"
 },
 "ma-integers": {
  "label": "Math — integers & rational numbers",
  "kind": "academic",
  "method": "auto-scored integer probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored integer probes",
  "gen": "integers"
 },
 "ma-ratio": {
  "label": "Math — ratio & proportional reasoning",
  "kind": "academic",
  "method": "auto-scored proportional reasoning probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored proportional reasoning probes",
  "gen": "ratio"
 },
 "ma-algebra": {
  "label": "Math — algebraic reasoning",
  "kind": "academic",
  "method": "auto-scored algebra probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored algebra probes",
  "gen": "algebra"
 },
 "ma-geometry": {
  "label": "Math — geometry & measurement",
  "kind": "academic",
  "method": "auto-scored geometry probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored geometry probes",
  "gen": "geometry"
 },
 "ma-data": {
  "label": "Math — data & statistics",
  "kind": "academic",
  "method": "auto-scored data analysis probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored data analysis probes",
  "gen": "data"
 },
 "ma-wordproblem": {
  "label": "Math — word problems & problem solving",
  "kind": "academic",
  "method": "auto-scored problem solving probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored problem solving probes",
  "gen": "wordproblem"
 },
 "ma-consumer": {
  "label": "Math — consumer & functional math",
  "kind": "academic",
  "method": "auto-scored consumer math probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored consumer math probes",
  "gen": "consumer"
 },
 "co-receptive": {
  "label": "Communication — receptive language",
  "kind": "academic",
  "method": "auto-scored receptive language probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored receptive language probes",
  "curated": 9
 },
 "co-expressive": {
  "label": "Communication — expressive language",
  "kind": "observation",
  "method": "a language sample scored with a rubric",
  "administration": "Case manager elicits a language sample and scores each rubric row.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a language sample scored with a rubric",
  "curated": 3
 },
 "co-pragmatics": {
  "label": "Communication — pragmatic language",
  "kind": "academic",
  "method": "auto-scored social communication probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored social communication probes",
  "curated": 9
 },
 "co-articulation": {
  "label": "Communication — articulation & intelligibility",
  "kind": "observation",
  "method": "a tally of correct productions",
  "administration": "Adult tallies correct productions of the target sound across the listed contexts.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "an articulation tally"
 },
 "co-fluency": {
  "label": "Communication — speech fluency",
  "kind": "observation",
  "method": "a tally of disfluencies",
  "administration": "Adult counts disfluent syllables across a timed speaking sample.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "a disfluency count"
 },
 "co-voice": {
  "label": "Communication — voice & vocal hygiene",
  "kind": "observation",
  "method": "a rated speaking sample",
  "administration": "Case manager scores the rubric while observing the skill, then records it in the app.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a rated speaking sample"
 },
 "co-aac": {
  "label": "Communication — AAC use",
  "kind": "observation",
  "method": "a tally of independent device use",
  "administration": "Adult tallies independent, prompted and missed communication opportunities on the device.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "an observation log"
 },
 "be-regulation": {
  "label": "Behavior — self-regulation",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "be-directions": {
  "label": "Behavior — following directions",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "be-expectations": {
  "label": "Behavior — classroom expectations",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "be-conflict": {
  "label": "Behavior — conflict resolution",
  "kind": "self_report",
  "method": "auto-scored situation judgement probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored situation judgement probes",
  "curated": 9
 },
 "be-attendance": {
  "label": "Behavior — attendance & participation",
  "kind": "observation",
  "method": "attendance and participation records",
  "administration": "Case manager records period-by-period attendance and participation counts.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "attendance and participation records"
 },
 "be-tally": {
  "label": "Behavior — frequency, prompt & interval tally",
  "kind": "observation",
  "method": "direct observation data",
  "administration": "Adult tallies occurrences, prompts delivered, or engaged intervals across the agreed observation window.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "an observation log"
 },
 "be-replacement": {
  "label": "Behavior — replacement behavior",
  "kind": "observation",
  "method": "frequency data from an observation log",
  "administration": "Adult tallies target and replacement behaviors during the observation window named in the BIP.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "an observation log"
 },
 "se-coping": {
  "label": "Social/Emotional — coping skills",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "se-peer": {
  "label": "Social/Emotional — peer interaction",
  "kind": "self_report",
  "method": "auto-scored social judgement probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored social judgement probes",
  "curated": 9
 },
 "se-emotion": {
  "label": "Social/Emotional — emotional identification",
  "kind": "academic",
  "method": "auto-scored emotion recognition probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored emotion recognition probes",
  "curated": 9
 },
 "se-frustration": {
  "label": "Social/Emotional — frustration tolerance",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "se-perspective": {
  "label": "Social/Emotional — perspective taking",
  "kind": "academic",
  "method": "auto-scored perspective taking probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored perspective taking probes",
  "curated": 9
 },
 "se-resilience": {
  "label": "Social/Emotional — resilience & self-concept",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "ef-initiation": {
  "label": "Executive Functioning — task initiation",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "ef-organization": {
  "label": "Executive Functioning — organization",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "ef-materials": {
  "label": "Executive Functioning — materials management",
  "kind": "observation",
  "method": "a materials check",
  "administration": "Adult checks the named materials at a set time and records how many were present without prompting.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "a self-monitoring checklist"
 },
 "ef-time": {
  "label": "Executive Functioning — time management",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "ef-completion": {
  "label": "Executive Functioning — work completion",
  "kind": "observation",
  "method": "assignment completion records",
  "administration": "Case manager records assignments due, submitted on time, and submitted late from the gradebook.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "assignment completion records"
 },
 "ef-monitoring": {
  "label": "Executive Functioning — self-monitoring",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "ef-planning": {
  "label": "Executive Functioning — planning & prioritizing",
  "kind": "academic",
  "method": "auto-scored planning probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored planning probes",
  "curated": 9
 },
 "ef-memory": {
  "label": "Executive Functioning — working memory strategies",
  "kind": "academic",
  "method": "auto-scored strategy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored strategy probes",
  "curated": 9
 },
 "il-money": {
  "label": "Independent Living — money & budgeting",
  "kind": "academic",
  "method": "auto-scored money probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored money probes",
  "gen": "money"
 },
 "il-navigation": {
  "label": "Independent Living — community navigation",
  "kind": "academic",
  "method": "auto-scored navigation probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored navigation probes",
  "curated": 9
 },
 "il-household": {
  "label": "Independent Living — household management",
  "kind": "observation",
  "method": "a task analysis checklist",
  "administration": "Adult scores each step of the task analysis as independent, prompted or not performed.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a task analysis checklist"
 },
 "il-safety": {
  "label": "Independent Living — personal safety",
  "kind": "academic",
  "method": "auto-scored safety judgement probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored safety judgement probes",
  "curated": 9
 },
 "il-health": {
  "label": "Independent Living — health & self-care",
  "kind": "academic",
  "method": "auto-scored health literacy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored health literacy probes",
  "curated": 9
 },
 "il-food": {
  "label": "Independent Living — food & nutrition",
  "kind": "observation",
  "method": "a task analysis checklist",
  "administration": "Adult scores each step of the food preparation task analysis.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a task analysis checklist"
 },
 "il-tech": {
  "label": "Independent Living — technology & digital literacy",
  "kind": "academic",
  "method": "auto-scored digital literacy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored digital literacy probes",
  "curated": 9
 },
 "sa-accommodations": {
  "label": "Self-Advocacy — requesting accommodations",
  "kind": "self_report",
  "method": "auto-scored self-advocacy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored self-advocacy probes",
  "curated": 9
 },
 "sa-awareness": {
  "label": "Self-Advocacy — disability awareness",
  "kind": "academic",
  "method": "auto-scored disability awareness probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored disability awareness probes",
  "curated": 9
 },
 "sa-helpseeking": {
  "label": "Self-Advocacy — help-seeking",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "sa-iep": {
  "label": "Self-Advocacy — IEP participation",
  "kind": "academic",
  "method": "auto-scored IEP knowledge probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored IEP knowledge probes",
  "curated": 9
 },
 "sa-determination": {
  "label": "Self-Advocacy — self-determination",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "vo-jobseeking": {
  "label": "Vocational — job seeking",
  "kind": "academic",
  "method": "auto-scored job-seeking probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored job-seeking probes",
  "curated": 9
 },
 "vo-workplace": {
  "label": "Vocational — workplace behavior",
  "kind": "self_report",
  "method": "auto-scored workplace judgement probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored workplace judgement probes",
  "curated": 9
 },
 "vo-career": {
  "label": "Vocational — career exploration",
  "kind": "academic",
  "method": "auto-scored career exploration probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored career exploration probes",
  "curated": 9
 },
 "vo-jobtask": {
  "label": "Vocational — job task performance",
  "kind": "observation",
  "method": "a task analysis checklist",
  "administration": "Job coach scores each step of the job task analysis as independent, prompted or not performed.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "a task analysis checklist"
 },
 "vo-communication": {
  "label": "Vocational — workplace communication",
  "kind": "self_report",
  "method": "auto-scored workplace communication probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored workplace communication probes",
  "curated": 9
 },
 "vo-stamina": {
  "label": "Vocational — work stamina & reliability",
  "kind": "observation",
  "method": "an observation log",
  "administration": "Job coach records minutes on task, breaks taken and prompts required for each work session.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "an observation log"
 },
 "mo-fine": {
  "label": "Motor — fine motor",
  "kind": "observation",
  "method": "a scored motor task",
  "administration": "Adult scores each rubric row while the student performs the motor task.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a scoring rubric"
 },
 "mo-gross": {
  "label": "Motor — gross motor",
  "kind": "observation",
  "method": "a scored motor task",
  "administration": "Case manager scores the rubric while observing the skill, then records it in the app.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a scoring rubric"
 },
 "mo-visualmotor": {
  "label": "Motor — visual-motor integration",
  "kind": "observation",
  "method": "a scored motor task",
  "administration": "Case manager scores the rubric while observing the skill, then records it in the app.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "a scoring rubric"
 },
 "mo-keyboarding": {
  "label": "Motor — keyboarding & digital access",
  "kind": "observation",
  "method": "a timed keyboarding sample",
  "administration": "Student types a standard passage for three minutes; adult records words per minute and accuracy.",
  "frequency": "weekly",
  "items": 6,
  "default_method": "a timed keyboarding sample"
 },
 "st-notes": {
  "label": "Study Skills — note-taking",
  "kind": "observation",
  "method": "scored notes from a lesson",
  "administration": "Case manager scores the student's notes from a recorded or live lesson against the rubric rows.",
  "frequency": "biweekly",
  "items": 6,
  "default_method": "work samples scored with a rubric",
  "curated": 3
 },
 "st-testprep": {
  "label": "Study Skills — test preparation",
  "kind": "academic",
  "method": "auto-scored study strategy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored study strategy probes",
  "curated": 9
 },
 "st-teststrategy": {
  "label": "Study Skills — test-taking strategies",
  "kind": "academic",
  "method": "auto-scored test strategy probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored test strategy probes",
  "curated": 9
 },
 "st-study": {
  "label": "Study Skills — study routines",
  "kind": "self_report",
  "method": "a self-monitoring check-in",
  "administration": "Student rates their own performance on the linked check-in; ratings are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "a self-monitoring checklist",
  "curated": 3
 },
 "st-directions": {
  "label": "Study Skills — assignment comprehension",
  "kind": "academic",
  "method": "auto-scored direction-following probes",
  "administration": "Student completes the linked probe independently; items are auto-scored.",
  "frequency": "biweekly",
  "items": 9,
  "default_method": "auto-scored direction-following probes",
  "curated": 9
 }
},
"items": {
"rd-vocab": [
{"id":"rd-vocab-1-001","tier":1,"type":"mc","prompt":"Read the sentence: \"The drought was so severe that the crops withered.\" What does severe mean here?","choices":["very bad","very short","very wet","very new"],"answer":0},
{"id":"rd-vocab-1-002","tier":1,"type":"mc","prompt":"Read the sentence: \"She was reluctant to speak, but finally raised her hand.\" What does reluctant mean?","choices":["unwilling","excited","loud","confused"],"answer":0},
{"id":"rd-vocab-1-003","tier":1,"type":"mc","prompt":"Which word means the opposite of \"expand\"?","choices":["shrink","grow","stretch","widen"],"answer":0},
{"id":"rd-vocab-2-004","tier":2,"type":"mc","prompt":"Read: \"The evidence was inconclusive, so the researchers repeated the experiment.\" What does inconclusive mean?","choices":["not giving a clear answer","completely wrong","very expensive","finished early"],"answer":0},
{"id":"rd-vocab-2-005","tier":2,"type":"mc","prompt":"Read: \"He gave a plausible explanation, though no one could prove it.\" What does plausible mean?","choices":["believable","dishonest","complicated","unnecessary"],"answer":0},
{"id":"rd-vocab-2-006","tier":2,"type":"mc","prompt":"In \"The bank was steep and covered in weeds,\" what does bank mean?","choices":["the side of a river","a place that holds money","to rely on something","a row of switches"],"answer":0},
{"id":"rd-vocab-3-007","tier":3,"type":"mc","prompt":"Read: \"Although the policy was ostensibly about safety, its real effect was to limit access.\" What does ostensibly mean?","choices":["apparently, but perhaps not really","obviously and certainly","unfortunately","legally required"],"answer":0},
{"id":"rd-vocab-3-008","tier":3,"type":"mc","prompt":"Rank these from least to most intense: warm, scalding, hot. Which order is correct?","choices":["warm, hot, scalding","scalding, hot, warm","hot, warm, scalding","warm, scalding, hot"],"answer":0},
{"id":"rd-vocab-3-009","tier":3,"type":"mc","prompt":"Read: \"The two accounts are analogous, though not identical.\" What does analogous mean?","choices":["similar in an important way","exactly the same","completely opposite","written down"],"answer":0}
],
"rd-literal": [
{"id":"rd-literal-1-010","tier":1,"type":"mc","prompt":"Passage: \"Marta left the house at 7:15. She caught the 7:30 bus and arrived at work at 8:05.\" What time did Marta catch the bus?","choices":["7:30","7:15","8:05","7:45"],"answer":0},
{"id":"rd-literal-1-011","tier":1,"type":"mc","prompt":"Passage: \"The recycling center accepts glass, aluminum and paper. It does not accept plastic bags or electronics.\" Which item is accepted?","choices":["aluminum","plastic bags","electronics","batteries"],"answer":0},
{"id":"rd-literal-1-012","tier":1,"type":"mc","prompt":"Passage: \"First, unplug the machine. Next, remove the filter. Finally, rinse the filter under cold water.\" What is the second step?","choices":["remove the filter","unplug the machine","rinse the filter","dry the filter"],"answer":0},
{"id":"rd-literal-2-013","tier":2,"type":"mc","prompt":"Passage: \"Sea otters eat sea urchins. Sea urchins eat kelp. Where otter populations fell, urchins multiplied and kelp forests disappeared.\" What happened to kelp forests when otters declined?","choices":["They disappeared","They grew larger","They stayed the same","They moved north"],"answer":0},
{"id":"rd-literal-2-014","tier":2,"type":"mc","prompt":"Passage: \"The library extended its hours in September. Attendance rose 30 percent that fall, mostly among students needing evening study space.\" What is the stated main idea?","choices":["Extending library hours increased attendance","Students dislike studying at home","The library is short of funding","September is the busiest month"],"answer":0},
{"id":"rd-literal-2-015","tier":2,"type":"mc","prompt":"Passage: \"Because the shipment was delayed, the store could not stock shelves before the sale, and customers left without buying.\" What was the cause of the store being unable to stock shelves?","choices":["The shipment was delayed","Customers left","The sale was cancelled","The shelves were broken"],"answer":0},
{"id":"rd-literal-3-016","tier":3,"type":"mc","prompt":"Passage: \"The city added protected bike lanes on three streets in 2024. Cycling trips on those streets rose 46 percent, while collisions involving cyclists fell by a third. Costs ran 12 percent over budget.\" Which statement is supported by the passage?","choices":["Cycling rose and collisions fell on those streets","The project came in under budget","Cycling fell after the lanes were added","The city removed the bike lanes"],"answer":0},
{"id":"rd-literal-3-017","tier":3,"type":"mc","prompt":"Which is the best objective summary of that passage?","choices":["Protected bike lanes on three streets increased cycling and reduced collisions, at a cost over budget","Bike lanes are a waste of money","The city should build more bike lanes everywhere","Cyclists are safer than drivers"],"answer":0},
{"id":"rd-literal-3-018","tier":3,"type":"mc","prompt":"Passage: \"Apply the primer and wait four hours. Do not sand until the primer is fully dry. Once dry, sand lightly, then apply the topcoat.\" When may you sand?","choices":["After the primer is fully dry","Immediately after priming","Before applying primer","After the topcoat"],"answer":0}
],
"rd-inferential": [
{"id":"rd-inferential-1-019","tier":1,"type":"mc","prompt":"Passage: \"Devon checked his pocket twice, then turned back toward the cafeteria, walking faster.\" What can you infer?","choices":["He thinks he lost something","He is going to lunch","He forgot his homework was due","He is meeting a friend"],"answer":0},
{"id":"rd-inferential-1-020","tier":1,"type":"mc","prompt":"Passage: \"The floor was wet and a yellow cone stood by the door.\" What most likely happened?","choices":["Someone recently cleaned the floor","It rained inside","The building is closed","A pipe burst"],"answer":0},
{"id":"rd-inferential-1-021","tier":1,"type":"mc","prompt":"Passage: \"Ana read the letter, sat down slowly, and did not answer when her sister spoke.\" How does Ana most likely feel?","choices":["Upset","Excited","Bored","Amused"],"answer":0},
{"id":"rd-inferential-2-022","tier":2,"type":"mc","prompt":"Passage: \"The manager posted the new schedule Friday. By Monday, three employees had asked to switch shifts and one had quit.\" What can you infer about the schedule?","choices":["Employees were unhappy with it","It gave everyone their preferred shifts","It was posted too early","It was the same as the old one"],"answer":0},
{"id":"rd-inferential-2-023","tier":2,"type":"mc","prompt":"Passage: \"Every article the writer cites supports one side. No opposing studies appear, though several exist.\" What is the author's likely purpose?","choices":["To persuade rather than inform","To entertain the reader","To summarize all research fairly","To teach a scientific method"],"answer":0},
{"id":"rd-inferential-2-024","tier":2,"type":"mc","prompt":"Passage: \"Ivan practised the presentation six times, but his hands shook when he stood up.\" Which inference is best supported?","choices":["Preparation did not remove his nervousness","He did not prepare","He was unwell","He disliked the topic"],"answer":0},
{"id":"rd-inferential-3-025","tier":3,"type":"mc","prompt":"Passage: \"The report notes that graduation rates rose after the program began. It does not mention that the district also changed its graduation requirements that year.\" What does this omission suggest?","choices":["The reported gain may have another explanation","The program definitely caused the gain","Graduation rates actually fell","The requirements were made harder"],"answer":0},
{"id":"rd-inferential-3-026","tier":3,"type":"mc","prompt":"Two texts describe the same factory closing. One calls it \"a necessary restructuring,\" the other \"a gutting of the town.\" What does this difference reveal?","choices":["Each author has a different point of view","One author has the facts wrong","The closing happened twice","Neither author was present"],"answer":0},
{"id":"rd-inferential-3-027","tier":3,"type":"mc","prompt":"Passage: \"Sales rose in every quarter the company advertised heavily, and in two quarters it did not.\" What conclusion is best supported?","choices":["Advertising is not the only factor in sales","Advertising always increases sales","Advertising has no effect","Sales fell overall"],"answer":0}
],
"rd-structure": [
{"id":"rd-structure-1-028","tier":1,"type":"mc","prompt":"A text is organized as: \"First… Next… Then… Finally…\". What structure is it?","choices":["Sequence","Compare and contrast","Problem and solution","Cause and effect"],"answer":0},
{"id":"rd-structure-1-029","tier":1,"type":"mc","prompt":"Where would you look first to find which section of an article covers a topic?","choices":["The headings","The last paragraph","The author's name","The page number"],"answer":0},
{"id":"rd-structure-1-030","tier":1,"type":"mc","prompt":"A text says: \"Unlike gas engines, electric motors have few moving parts.\" What structure does this signal?","choices":["Compare and contrast","Sequence","Description","Chronology"],"answer":0},
{"id":"rd-structure-2-031","tier":2,"type":"mc","prompt":"A caption under a chart says \"Figure 2: Costs by year, 2019-2025.\" What does the caption tell you?","choices":["What the chart shows and the years covered","The author's opinion of the costs","How the data were collected","Whether the costs were reasonable"],"answer":0},
{"id":"rd-structure-2-032","tier":2,"type":"mc","prompt":"A text describes a flooding problem, then three proposed fixes. What structure is it?","choices":["Problem and solution","Sequence","Compare and contrast","Description"],"answer":0},
{"id":"rd-structure-2-033","tier":2,"type":"mc","prompt":"An author writes \"critics claim\" before one position and \"experts confirm\" before another. What does this word choice reveal?","choices":["The author favours the second position","The author is neutral","Both positions are equally supported","The author is quoting directly"],"answer":0},
{"id":"rd-structure-3-034","tier":3,"type":"mc","prompt":"An argument states a claim, gives two examples, then dismisses the opposing view without evidence. What is the weakness?","choices":["The counterclaim is not actually addressed","The claim is unclear","There are too many examples","The structure is chronological"],"answer":0},
{"id":"rd-structure-3-035","tier":3,"type":"mc","prompt":"Which source is most likely to be reliable for current medical guidance?","choices":["A 2026 article from a national health agency","A 2011 blog post","An anonymous forum thread","An advertisement for a supplement"],"answer":0},
{"id":"rd-structure-3-036","tier":3,"type":"mc","prompt":"A writer places the strongest evidence in the final section rather than the first. What effect does this structure most likely have?","choices":["It builds toward the conclusion","It hides the claim","It shortens the argument","It makes the text chronological"],"answer":0}
],
"rd-functional": [
{"id":"rd-functional-1-037","tier":1,"type":"mc","prompt":"A sign reads \"CAUTION — WET FLOOR.\" What should you do?","choices":["Walk carefully or go around","Run past quickly","Ignore it","Move the sign"],"answer":0},
{"id":"rd-functional-1-038","tier":1,"type":"mc","prompt":"A bus schedule shows departures at 7:10, 7:40 and 8:10. You arrive at 7:45. When is the next bus?","choices":["8:10","7:40","7:10","8:40"],"answer":0},
{"id":"rd-functional-1-039","tier":1,"type":"mc","prompt":"A food label reads \"Best by 03/12/26.\" What does that date tell you?","choices":["When the food is no longer at its best","When it was made","How much it costs","How many servings it has"],"answer":0},
{"id":"rd-functional-2-040","tier":2,"type":"mc","prompt":"A medication label reads \"Take one tablet every 8 hours. Do not exceed 3 tablets in 24 hours.\" You took one at 7am. When is the next dose?","choices":["3pm","11am","7pm","Immediately"],"answer":0},
{"id":"rd-functional-2-041","tier":2,"type":"mc","prompt":"A job application asks for \"Employment history, most recent first.\" What do you list first?","choices":["Your most recent job","Your first job ever","Your preferred job","Your references"],"answer":0},
{"id":"rd-functional-2-042","tier":2,"type":"mc","prompt":"A label shows a skull-and-crossbones symbol. What does it mean?","choices":["The contents are poisonous","The contents are flammable","The contents are recyclable","The contents are fragile"],"answer":0},
{"id":"rd-functional-3-043","tier":3,"type":"mc","prompt":"A lease says: \"Rent is due on the 1st. A late fee of $50 applies after the 5th.\" You pay on the 6th. What do you owe?","choices":["Rent plus a $50 late fee","Rent only","A $50 fee only","Nothing extra"],"answer":0},
{"id":"rd-functional-3-044","tier":3,"type":"mc","prompt":"A utility bill lists \"Amount due $118.42, Due date 04/18, Previous balance $0.00.\" What must you pay by April 18?","choices":["$118.42","$0.00","$118.42 plus a deposit","Half of $118.42"],"answer":0},
{"id":"rd-functional-3-045","tier":3,"type":"mc","prompt":"An email says: \"Please confirm your shift by Thursday or it will be reassigned.\" What action is required?","choices":["Reply confirming before Thursday","Show up Thursday","Do nothing","Call after Thursday"],"answer":0}
],
"wr-research": [
{"id":"wr-research-1-046","tier":1,"type":"mc","prompt":"Which is the most reliable source for a research paper on climate?","choices":["A peer-reviewed scientific journal","A social media post","An anonymous wiki edit","A product advertisement"],"answer":0},
{"id":"wr-research-1-047","tier":1,"type":"mc","prompt":"What information do you need to record to cite a source?","choices":["Author, title, publisher and date","Only the website name","Only the author","Only the date you read it"],"answer":0},
{"id":"wr-research-1-048","tier":1,"type":"mc","prompt":"What does it mean to paraphrase?","choices":["Restate the idea in your own words","Copy the sentence exactly","Summarize the whole book","Quote with quotation marks"],"answer":0},
{"id":"wr-research-2-049","tier":2,"type":"mc","prompt":"You copy two sentences from a source into your paper without quotation marks but list the source at the end. What is this?","choices":["Plagiarism","Correct citation","Paraphrasing","Summarizing"],"answer":0},
{"id":"wr-research-2-050","tier":2,"type":"mc","prompt":"Which search would best find information on the effect of sleep on teenage memory?","choices":["\"sleep AND memory AND adolescents\"","\"sleep\"","\"teenagers\"","\"school\""],"answer":0},
{"id":"wr-research-2-051","tier":2,"type":"mc","prompt":"Where does an in-text citation go?","choices":["Immediately after the quoted or paraphrased material","At the end of the paper only","In the title","In a footnote only"],"answer":0},
{"id":"wr-research-3-052","tier":3,"type":"mc","prompt":"A source is written by an industry group that funds the study it reports. What should you do?","choices":["Use it but note the potential conflict of interest","Discard all industry sources automatically","Cite it as neutral","Use it without checking"],"answer":0},
{"id":"wr-research-3-053","tier":3,"type":"mc","prompt":"Two credible sources disagree on a fact. What is the best response in your paper?","choices":["Report the disagreement and evaluate the evidence for each","Pick the one you like","Leave the fact out","Report only the more recent one"],"answer":0},
{"id":"wr-research-3-054","tier":3,"type":"mc","prompt":"Which sentence integrates evidence most effectively?","choices":["As Chen notes, \"attendance rose sharply\" once transport was free (2025).","\"Attendance rose sharply.\" (Chen)","Attendance rose sharply.","Chen 2025."],"answer":0}
],
"co-receptive": [
{"id":"co-receptive-1-055","tier":1,"type":"mc","prompt":"You hear: \"Before you hand in the sheet, write your name at the top.\" What do you do first?","choices":["Write your name","Hand in the sheet","Ask a question","Turn the sheet over"],"answer":0},
{"id":"co-receptive-1-056","tier":1,"type":"mc","prompt":"You hear: \"Put the folders on the shelf, then wipe the table.\" What is the second task?","choices":["Wipe the table","Put the folders away","Both at once","Neither"],"answer":0},
{"id":"co-receptive-1-057","tier":1,"type":"mc","prompt":"You hear: \"Who left this here?\" What kind of answer is expected?","choices":["A person","A place","A time","A reason"],"answer":0},
{"id":"co-receptive-2-058","tier":2,"type":"mc","prompt":"You hear: \"Unless it rains, we will meet outside.\" When do you meet inside?","choices":["If it rains","If it does not rain","Always","Never"],"answer":0},
{"id":"co-receptive-2-059","tier":2,"type":"mc","prompt":"You hear: \"Take the forms to the office after you finish, but before lunch.\" When do you go?","choices":["After finishing and before lunch","Right now","After lunch","Tomorrow"],"answer":0},
{"id":"co-receptive-2-060","tier":2,"type":"mc","prompt":"You hear: \"Why did the machine stop?\" What kind of answer is expected?","choices":["A reason","A place","A person","A number"],"answer":0},
{"id":"co-receptive-3-061","tier":3,"type":"mc","prompt":"You hear: \"Everyone except the second group should start now.\" Who waits?","choices":["The second group","Everyone","The first group","Nobody"],"answer":0},
{"id":"co-receptive-3-062","tier":3,"type":"mc","prompt":"A supervisor says: \"It would be great if these were done by three.\" What is actually being asked?","choices":["Finish them by three","Nothing, it is only a comment","Finish them whenever","Ask someone else"],"answer":0},
{"id":"co-receptive-3-063","tier":3,"type":"mc","prompt":"Someone says \"Nice job locking up last night\" in a flat tone after you forgot to lock up. What do they mean?","choices":["They are pointing out that you forgot","They are genuinely thanking you","They are asking a question","They are talking to someone else"],"answer":0}
],
"co-pragmatics": [
{"id":"co-pragmatics-1-064","tier":1,"type":"sj","prompt":"A classmate is talking about a movie you have not seen. What is the best way to join in?","choices":["Ask a question about the movie","Change the subject to something you know","Say you are not interested","Wait silently until they finish"],"best":0,"partial":[3]},
{"id":"co-pragmatics-1-065","tier":1,"type":"sj","prompt":"Someone is mid-sentence and you remember something important. What do you do?","choices":["Wait for a pause, then speak","Interrupt immediately","Say it louder than they are talking","Walk away and come back"],"best":0,"partial":[3]},
{"id":"co-pragmatics-1-066","tier":1,"type":"mc","prompt":"A person crosses their arms, looks away and gives short answers. What are they most likely feeling?","choices":["Uncomfortable or annoyed","Excited","Confused about the topic","Very interested"],"answer":0},
{"id":"co-pragmatics-2-067","tier":2,"type":"sj","prompt":"You tell a story and the other person says \"Wait, who is Sam?\" What is the best response?","choices":["Explain who Sam is, then continue","Keep telling the story","Start the whole story again","Say \"never mind\""],"best":0,"partial":[2]},
{"id":"co-pragmatics-2-068","tier":2,"type":"sj","prompt":"In a group project, a peer keeps taking over your part. What is the strongest move?","choices":["Say privately that you want to do your assigned part, and propose how to split it","Let them do everything","Complain to the group loudly","Stop attending group meetings"],"best":0,"partial":[2]},
{"id":"co-pragmatics-2-069","tier":2,"type":"mc","prompt":"A teacher says \"I hear what you're saying, but…\" What does that signal?","choices":["They are about to disagree","They agree completely","They did not hear you","They are ending the conversation"],"answer":0},
{"id":"co-pragmatics-3-070","tier":3,"type":"sj","prompt":"A co-worker says \"It must be nice to leave early every day\" while smiling. What are they most likely communicating?","choices":["Irritation about your schedule","Genuine happiness for you","A request to leave early too","A joke about the weather"],"best":0,"partial":[2]},
{"id":"co-pragmatics-3-071","tier":3,"type":"sj","prompt":"You realise mid-conversation that the other person has misunderstood you. What is best?","choices":["Stop and rephrase what you meant","Repeat the same words louder","Keep going and hope it clears up","End the conversation"],"best":0,"partial":[1]},
{"id":"co-pragmatics-3-072","tier":3,"type":"sj","prompt":"You disagree with a decision in a meeting at {work}. What is the strongest approach?","choices":["State your concern with a reason and propose an alternative","Say nothing and complain afterward","Say the decision is wrong","Walk out of the meeting"],"best":0,"partial":[3]}
],
"be-conflict": [
{"id":"be-conflict-1-073","tier":1,"type":"sj","prompt":"A classmate bumps your desk and your work falls. What is the best first move?","choices":["Say calmly that it knocked your work over","Push their desk back","Yell at them","Report it without saying anything to them"],"best":0,"partial":[3]},
{"id":"be-conflict-1-074","tier":1,"type":"sj","prompt":"Someone takes the last chair you were walking toward. What is best?","choices":["Find another seat","Tell them to move","Stand and complain","Take the chair anyway"],"best":0,"partial":[2]},
{"id":"be-conflict-1-075","tier":1,"type":"mc","prompt":"What is the first step of the conflict resolution routine?","choices":["Stop and calm down before speaking","Explain who is at fault","Get a teacher","Walk away permanently"],"answer":0},
{"id":"be-conflict-2-076","tier":2,"type":"sj","prompt":"A peer makes a joke about you in front of others. What is the strongest response?","choices":["Ignore it and speak to them privately later","Make a joke back about them","Yell at them in front of everyone","Push them"],"best":0,"partial":[3]},
{"id":"be-conflict-2-077","tier":2,"type":"sj","prompt":"You and a peer both believe you are right about a group task. What works best?","choices":["Ask what evidence each of you has and check it","Insist you are right","Do it your way without telling them","Refuse to participate"],"best":0,"partial":[2]},
{"id":"be-conflict-2-078","tier":2,"type":"sj","prompt":"Someone keeps provoking you in the hallway. What is best?","choices":["Move away and tell a staff member","Provoke them back","Stay and argue","Wait for them after school"],"best":0,"partial":[3]},
{"id":"be-conflict-3-079","tier":3,"type":"sj","prompt":"After a conflict, you realise you contributed to it. What is the strongest move?","choices":["Acknowledge your part and offer a specific repair","Say the other person started it","Say nothing and avoid them","Apologise without saying what for"],"best":0,"partial":[3]},
{"id":"be-conflict-3-080","tier":3,"type":"sj","prompt":"A conflict at {work} involves a co-worker and a customer. What is best?","choices":["Follow the site procedure and get a supervisor","Take a side","Handle it yourself without telling anyone","Leave the area"],"best":0,"partial":[3]},
{"id":"be-conflict-3-081","tier":3,"type":"sj","prompt":"You are angry and know you will say something you regret. What is best?","choices":["Ask for a short break, then return to the conversation","Say it anyway","Walk out and not return","Stay silent and hold it in"],"best":0,"partial":[2]}
],
"se-peer": [
{"id":"se-peer-1-082","tier":1,"type":"sj","prompt":"A group of peers is playing a game you know. How do you join?","choices":["Ask if you can join at the next round","Take a turn without asking","Stand nearby and wait","Tell them they are playing wrong"],"best":0,"partial":[2]},
{"id":"se-peer-1-083","tier":1,"type":"sj","prompt":"A peer gives you a compliment. What is the best response?","choices":["Say thank you","Say it was nothing at all","Say nothing","Compliment them back immediately"],"best":0,"partial":[3]},
{"id":"se-peer-1-084","tier":1,"type":"mc","prompt":"What is a sign that someone wants to end a conversation?","choices":["They step back and glance away repeatedly","They ask a follow-up question","They turn toward you","They laugh at your joke"],"answer":0},
{"id":"se-peer-2-085","tier":2,"type":"sj","prompt":"A group member is not doing their part. What is the strongest first step?","choices":["Ask them directly what part they can do and by when","Do their part yourself","Report them to the teacher immediately","Say nothing and hand in incomplete work"],"best":0,"partial":[2]},
{"id":"se-peer-2-086","tier":2,"type":"sj","prompt":"A friend cancels plans twice in a row. What is best?","choices":["Ask if everything is okay and suggest another time","Stop talking to them","Cancel on them next time","Post about it online"],"best":0,"partial":[2]},
{"id":"se-peer-2-087","tier":2,"type":"sj","prompt":"You are asked to give feedback on a peer's work that has real problems. What is best?","choices":["Name one strength and one specific thing to change","Say it is fine","List everything wrong with it","Refuse to comment"],"best":0,"partial":[3]},
{"id":"se-peer-3-088","tier":3,"type":"sj","prompt":"Peers pressure you to skip class. What is the strongest response?","choices":["Say no, give a short reason and leave for class","Go along to avoid conflict","Argue with them about it","Say nothing and follow them"],"best":0,"partial":[2]},
{"id":"se-peer-3-089","tier":3,"type":"sj","prompt":"A friend asks you to lie for them to a supervisor. What is best?","choices":["Say you will not lie, but offer to support them in telling the truth","Lie to protect the friendship","Report them immediately without telling them","Avoid the supervisor"],"best":0,"partial":[2]},
{"id":"se-peer-3-090","tier":3,"type":"sj","prompt":"You realise a group you spend time with is getting you into trouble. What is best?","choices":["Reduce time with them and build other connections","Stay and hope it changes","Confront them all at once","Stop going to school"],"best":0,"partial":[2]}
],
"se-emotion": [
{"id":"se-emotion-1-091","tier":1,"type":"mc","prompt":"Someone has clenched fists, a tight jaw and a raised voice. What emotion is most likely?","choices":["Anger","Sadness","Boredom","Surprise"],"answer":0},
{"id":"se-emotion-1-092","tier":1,"type":"mc","prompt":"Your heart is racing, your hands are sweaty and your thoughts are speeding up. What emotion is this most likely?","choices":["Anxiety","Calm","Tiredness","Hunger"],"answer":0},
{"id":"se-emotion-1-093","tier":1,"type":"mc","prompt":"On a 1-5 scale where 5 is the most intense, where would \"slightly annoyed\" go?","choices":["2","5","4","1"],"answer":0},
{"id":"se-emotion-2-094","tier":2,"type":"mc","prompt":"Someone is smiling but their shoulders are slumped and their voice is flat. What should you consider?","choices":["They may not feel as fine as they look","They are definitely happy","They are angry","They did not hear you"],"answer":0},
{"id":"se-emotion-2-095","tier":2,"type":"mc","prompt":"Which is the earliest signal that you are getting frustrated?","choices":["A physical change like tension or heat","Raising your voice","Walking out","Slamming something"],"answer":0},
{"id":"se-emotion-2-096","tier":2,"type":"mc","prompt":"You feel a 4 out of 5 on the anger scale. Which strategy fits that level?","choices":["Leave the situation and use a calming routine","Ignore it and keep working","Talk it through in detail right now","Nothing is needed"],"answer":0},
{"id":"se-emotion-3-097","tier":3,"type":"mc","prompt":"A message reads: \"Fine. Do whatever.\" What emotion is most likely behind it?","choices":["Frustration","Enthusiasm","Gratitude","Confusion"],"answer":0},
{"id":"se-emotion-3-098","tier":3,"type":"mc","prompt":"You feel angry, but underneath you also feel embarrassed. Why does naming both matter?","choices":["Different feelings need different responses","It does not matter","Anger is the only real feeling","Naming feelings makes them stronger"],"answer":0},
{"id":"se-emotion-3-099","tier":3,"type":"mc","prompt":"A short text reply of \"k\" from a friend most likely means what?","choices":["It is ambiguous and could mean several things","They are definitely angry with you","They are definitely happy","They did not read it"],"answer":0}
],
"se-perspective": [
{"id":"se-perspective-1-100","tier":1,"type":"mc","prompt":"A classmate is chosen last for a team. How do they most likely feel?","choices":["Left out","Proud","Amused","Relieved"],"answer":0},
{"id":"se-perspective-1-101","tier":1,"type":"mc","prompt":"You take the last of a shared snack without asking. How might others feel?","choices":["Annoyed","Grateful","Impressed","Nothing at all"],"answer":0},
{"id":"se-perspective-1-102","tier":1,"type":"mc","prompt":"Two people want the same shift. What is true?","choices":["They both want something and only one can have it","One of them is wrong","Neither really wants it","They should both quit"],"answer":0},
{"id":"se-perspective-2-103","tier":2,"type":"mc","prompt":"Your friend cancels plans at the last minute. What is a second possible explanation besides \"they do not care\"?","choices":["Something urgent came up","They never liked you","They are lying","They forgot you exist"],"answer":0},
{"id":"se-perspective-2-104","tier":2,"type":"mc","prompt":"A teacher gives you a lower grade than you expected without an explanation. What is a reasonable first assumption?","choices":["There may be a reason you have not heard yet","They are targeting you","The grade is a mistake for sure","The class is unfair"],"answer":0},
{"id":"se-perspective-2-105","tier":2,"type":"mc","prompt":"You interrupt someone repeatedly in a meeting. What effect is this most likely to have?","choices":["They feel dismissed and stop contributing","They appreciate your energy","Nothing changes","They interrupt you back and it is fine"],"answer":0},
{"id":"se-perspective-3-106","tier":3,"type":"mc","prompt":"A co-worker does not greet you one morning. Which explanation should you consider FIRST?","choices":["They may be preoccupied or having a bad day","They dislike you","They want you fired","They are being rude on purpose"],"answer":0},
{"id":"se-perspective-3-107","tier":3,"type":"mc","prompt":"You and a supervisor disagree about how a task should be done. What perspective is worth considering?","choices":["They may know constraints you cannot see","They are always right","They are trying to make it harder","Their opinion does not matter"],"answer":0},
{"id":"se-perspective-3-108","tier":3,"type":"mc","prompt":"Why does generating more than one explanation for someone's behaviour matter?","choices":["The first explanation is often wrong and escalates conflict","It takes longer","It makes you agree with everyone","It avoids all conflict"],"answer":0}
],
"ef-planning": [
{"id":"ef-planning-1-109","tier":1,"type":"mc","prompt":"You have a test tomorrow and a project due next week. What do you work on first?","choices":["The test","The project","Neither","Both at the same time"],"answer":0},
{"id":"ef-planning-1-110","tier":1,"type":"mc","prompt":"What is the first step in planning a multi-step task?","choices":["List the steps","Start the hardest part","Set a deadline","Ask for an extension"],"answer":0},
{"id":"ef-planning-1-111","tier":1,"type":"mc","prompt":"Which task list is in a workable order for making a sandwich?","choices":["Get bread, add filling, close sandwich","Close sandwich, get bread, add filling","Add filling, close sandwich, get bread","Close sandwich, add filling, get bread"],"answer":0},
{"id":"ef-planning-2-112","tier":2,"type":"mc","prompt":"You have: an essay due Friday, a quiz Wednesday and a form due today. What order?","choices":["Form, quiz, essay","Essay, quiz, form","Quiz, essay, form","Essay, form, quiz"],"answer":0},
{"id":"ef-planning-2-113","tier":2,"type":"mc","prompt":"A project is due in 10 days. When should you plan the first work session?","choices":["Within the first two or three days","The night before it is due","Day 9","Whenever you feel like it"],"answer":0},
{"id":"ef-planning-2-114","tier":2,"type":"mc","prompt":"You planned to study at 6pm but have a shift until 8pm. What is the best adjustment?","choices":["Move the study block to a time you are actually free","Skip studying","Study at 6pm anyway","Quit the shift"],"answer":0},
{"id":"ef-planning-3-115","tier":3,"type":"mc","prompt":"Your plan depends on a library computer that may be unavailable. What should the plan include?","choices":["A backup option and when to switch to it","Nothing, it will probably be free","A complaint to the library","A later deadline"],"answer":0},
{"id":"ef-planning-3-116","tier":3,"type":"mc","prompt":"Halfway through a plan, you are behind schedule. What is the strongest response?","choices":["Identify which step is slow and adjust the remaining schedule","Keep going at the same pace","Abandon the plan","Ask for an extension immediately"],"answer":0},
{"id":"ef-planning-3-117","tier":3,"type":"mc","prompt":"You have three deadlines in one week plus a work shift. What should you do first?","choices":["Map all commitments onto a calendar before deciding order","Start with the easiest task","Start with the first thing you remember","Ask to drop one"],"answer":0}
],
"ef-memory": [
{"id":"ef-memory-1-118","tier":1,"type":"mc","prompt":"A teacher gives you three instructions at once. What is the most reliable strategy?","choices":["Write them down as they are given","Repeat them silently once","Trust you will remember","Ask a friend afterward"],"answer":0},
{"id":"ef-memory-1-119","tier":1,"type":"mc","prompt":"You need to remember a phone number for 30 seconds. What strategy helps most?","choices":["Repeat it out loud","Think about something else","Write it tomorrow","Guess it later"],"answer":0},
{"id":"ef-memory-1-120","tier":1,"type":"mc","prompt":"What does \"chunking\" mean as a memory strategy?","choices":["Grouping information into smaller sets","Reading it many times","Saying it louder","Writing it in cursive"],"answer":0},
{"id":"ef-memory-2-121","tier":2,"type":"mc","prompt":"You keep forgetting to bring a form home. What is the best support?","choices":["A reminder alarm plus putting the form in your bag immediately","Trying harder to remember","Asking a friend to remind you","Waiting until you remember"],"answer":0},
{"id":"ef-memory-2-122","tier":2,"type":"mc","prompt":"You are given a locker combination, a room number and a time. What is the best move?","choices":["Write all three down immediately","Memorise the room number only","Remember the time only","Ask again later"],"answer":0},
{"id":"ef-memory-2-123","tier":2,"type":"mc","prompt":"You lose track of a task halfway through. What support would help most?","choices":["A written checklist you can look back at","A longer deadline","A quieter room","A different task"],"answer":0},
{"id":"ef-memory-3-124","tier":3,"type":"mc","prompt":"Which is the strongest sign that a memory strategy is working?","choices":["You complete tasks without needing a repeat of the instructions","You feel more confident","You write more notes","You finish faster"],"answer":0},
{"id":"ef-memory-3-125","tier":3,"type":"mc","prompt":"You are asked to do a 5-step task in a noisy setting. What is the best plan?","choices":["Write the steps and check them off as you go","Rely on memory and work faster","Do the steps in any order","Wait until the noise stops"],"answer":0},
{"id":"ef-memory-3-126","tier":3,"type":"mc","prompt":"Why is using a checklist better than trying harder to remember?","choices":["It removes the load rather than increasing effort","It is faster to write","It impresses teachers","It is required by the IEP"],"answer":0}
],
"il-navigation": [
{"id":"il-navigation-1-127","tier":1,"type":"mc","prompt":"A bus route map shows Route 22 stopping at Main and 5th. You need to reach Main and 5th. Which route?","choices":["Route 22","Any route","Route 5","None"],"answer":0},
{"id":"il-navigation-1-128","tier":1,"type":"mc","prompt":"A building directory lists \"Records — Room 210.\" What floor is Room 210 most likely on?","choices":["The second floor","The first floor","The tenth floor","The basement"],"answer":0},
{"id":"il-navigation-1-129","tier":1,"type":"mc","prompt":"Your bus leaves at 8:15 and takes 25 minutes. What time do you arrive?","choices":["8:40","8:25","8:30","9:15"],"answer":0},
{"id":"il-navigation-2-130","tier":2,"type":"mc","prompt":"You must arrive by 9:00 and the trip takes 35 minutes. What is the latest you should leave?","choices":["8:25","8:45","9:00","8:55"],"answer":0},
{"id":"il-navigation-2-131","tier":2,"type":"mc","prompt":"Your route requires a transfer with a 6-minute window. What is the biggest risk?","choices":["A delay on the first leg makes you miss the transfer","The second bus is too fast","The fare will change","The stop will move"],"answer":0},
{"id":"il-navigation-2-132","tier":2,"type":"mc","prompt":"The bus you planned to take does not come. What is the best first step?","choices":["Check the app or schedule for the next option","Wait indefinitely","Walk the whole way without checking","Go home"],"answer":0},
{"id":"il-navigation-3-133","tier":3,"type":"mc","prompt":"You are at an unfamiliar stop, your phone is at 3 percent and the next bus is in 40 minutes. What is best?","choices":["Note the stop and route numbers now, then contact someone","Wait and use the phone for entertainment","Start walking in any direction","Turn the phone off entirely"],"answer":0},
{"id":"il-navigation-3-134","tier":3,"type":"mc","prompt":"You realise you boarded a bus going the wrong direction. What is best?","choices":["Get off at the next stop and check the return route","Ride to the end of the line","Ask another passenger to fix it","Stay on and hope it loops"],"answer":0},
{"id":"il-navigation-3-135","tier":3,"type":"mc","prompt":"You have a 10:00 appointment across town and one transfer. When should you plan to leave?","choices":["Early enough to absorb a missed transfer","Exactly the trip time before 10:00","Five minutes before","After 10:00"],"answer":0}
],
"il-safety": [
{"id":"il-safety-1-136","tier":1,"type":"mc","prompt":"When should you call 911?","choices":["When there is an immediate threat to life or safety","When you are bored","When you have a question","When a store is closed"],"answer":0},
{"id":"il-safety-1-137","tier":1,"type":"mc","prompt":"A stranger online asks for your home address. What do you do?","choices":["Do not give it and tell a trusted adult","Give it if they seem nice","Give a nearby address","Ask them for theirs first"],"answer":0},
{"id":"il-safety-1-138","tier":1,"type":"mc","prompt":"The smoke alarm sounds. What do you do first?","choices":["Leave the building","Look for the source","Open the windows","Call a friend"],"answer":0},
{"id":"il-safety-2-139","tier":2,"type":"mc","prompt":"A text says you won a prize and must send a fee to claim it. What is this?","choices":["A scam","A legitimate contest","A bank notice","A delivery update"],"answer":0},
{"id":"il-safety-2-140","tier":2,"type":"mc","prompt":"Someone insists you decide right now or lose the offer. What does urgency usually signal?","choices":["A pressure tactic worth stepping away from","A genuinely good deal","A legal requirement","A discount"],"answer":0},
{"id":"il-safety-2-141","tier":2,"type":"mc","prompt":"A person offers you a ride and says not to tell anyone. What is the warning sign?","choices":["The request for secrecy","The offer of a ride","The time of day","The type of car"],"answer":0},
{"id":"il-safety-3-142","tier":3,"type":"mc","prompt":"A caller says they are from your bank and asks for your full account number and PIN. What do you do?","choices":["Hang up and call the bank using the number on your card","Give the information","Give only the PIN","Ask them to call back"],"answer":0},
{"id":"il-safety-3-143","tier":3,"type":"mc","prompt":"A supervisor at work repeatedly comments on your body. You tell someone and nothing changes. What next?","choices":["Report it to a higher level or an outside agency and keep a record","Stop reporting it","Quit without telling anyone","Confront them alone"],"answer":0},
{"id":"il-safety-3-144","tier":3,"type":"mc","prompt":"A loan offers \"no credit check, money today\" at very high interest. What is the risk?","choices":["The total cost can far exceed the amount borrowed","There is no risk","It builds credit fast","It is always illegal"],"answer":0}
],
"il-health": [
{"id":"il-health-1-145","tier":1,"type":"mc","prompt":"A label says \"Take with food.\" What does that mean?","choices":["Eat something when you take it","Take it instead of food","Take it only at meals in restaurants","Take it with water only"],"answer":0},
{"id":"il-health-1-146","tier":1,"type":"mc","prompt":"Which is a reason to see a doctor rather than treat something yourself?","choices":["A fever that lasts several days","A single sneeze","Feeling tired after exercise","A small paper cut"],"answer":0},
{"id":"il-health-1-147","tier":1,"type":"mc","prompt":"How often should you wash your hands when preparing food?","choices":["Before starting and after handling raw meat","Once at the end","Only if they look dirty","Not necessary"],"answer":0},
{"id":"il-health-2-148","tier":2,"type":"mc","prompt":"You missed a dose of a daily medication and it is nearly time for the next one. What is generally advised?","choices":["Skip the missed dose and take the next one on schedule","Take both at once","Take a triple dose","Stop the medication"],"answer":0},
{"id":"il-health-2-149","tier":2,"type":"mc","prompt":"A nutrition label shows 250 calories per serving and 2 servings per container. You eat the whole container. How many calories?","choices":["500","250","125","750"],"answer":0},
{"id":"il-health-2-150","tier":2,"type":"mc","prompt":"Which symptom needs emergency care rather than a clinic visit?","choices":["Chest pain with shortness of breath","A mild cough","A sore knee","A headache after a long day"],"answer":0},
{"id":"il-health-3-151","tier":3,"type":"mc","prompt":"At an appointment, what is the most useful thing to bring?","choices":["A list of symptoms, when they started, and current medications","Nothing","Only your insurance card","A friend to speak for you"],"answer":0},
{"id":"il-health-3-152","tier":3,"type":"mc","prompt":"A doctor explains a plan you do not understand. What is the best response?","choices":["Ask them to explain it again in plain language","Nod and look it up later","Say nothing","Ask a different doctor"],"answer":0},
{"id":"il-health-3-153","tier":3,"type":"mc","prompt":"Your prescription is running out and refills need 3 days. When should you request one?","choices":["At least 3 days before you run out","On the day you run out","After you run out","Only at the next appointment"],"answer":0}
],
"il-tech": [
{"id":"il-tech-1-154","tier":1,"type":"mc","prompt":"What makes a password stronger?","choices":["Length and a mix of character types","Using your name","Using 1234","Using the same one everywhere"],"answer":0},
{"id":"il-tech-1-155","tier":1,"type":"mc","prompt":"You get an email from an unknown sender with an attachment. What do you do?","choices":["Do not open it","Open it to see what it is","Forward it to friends","Reply asking who they are"],"answer":0},
{"id":"il-tech-1-156","tier":1,"type":"mc","prompt":"Where should you save a school assignment so you can find it later?","choices":["In a named folder for that course","On the desktop with a random name","In the downloads folder","Nowhere, keep it open"],"answer":0},
{"id":"il-tech-2-157","tier":2,"type":"mc","prompt":"What does two-factor authentication add?","choices":["A second check beyond your password","A longer password","A faster login","A backup email"],"answer":0},
{"id":"il-tech-2-158","tier":2,"type":"mc","prompt":"An online form asks for your Social Security number to enter a giveaway. What do you do?","choices":["Do not enter it","Enter it to win","Enter a fake one","Ask a friend to enter theirs"],"answer":0},
{"id":"il-tech-2-159","tier":2,"type":"mc","prompt":"You need to reply to an employer with a document. What should you check before sending?","choices":["That the attachment is actually attached and correct","The font colour","The time of day","Nothing"],"answer":0},
{"id":"il-tech-3-160","tier":3,"type":"mc","prompt":"A search returns a result from a site selling the product it describes. What should you consider?","choices":["The source has an interest in the conclusion","It must be accurate","It is a government source","It is peer reviewed"],"answer":0},
{"id":"il-tech-3-161","tier":3,"type":"mc","prompt":"Your device will not connect to wifi. What is a reasonable troubleshooting sequence?","choices":["Check airplane mode, forget and rejoin the network, restart","Buy a new device","Wait a week","Ask to change schools"],"answer":0},
{"id":"il-tech-3-162","tier":3,"type":"mc","prompt":"You need a screen reader on a device that is not yours. What is the best step?","choices":["Find the accessibility settings and enable it yourself","Do without it","Ask someone to read everything aloud","Use a different task"],"answer":0}
],
"sa-accommodations": [
{"id":"sa-accommodations-1-163","tier":1,"type":"mc","prompt":"What is an accommodation?","choices":["A change in how you access learning, not in what you learn","A lower standard for you","Extra homework","A different diploma"],"answer":0},
{"id":"sa-accommodations-1-164","tier":1,"type":"sj","prompt":"You have extended time but the teacher collects the test at the bell. What do you do?","choices":["Tell the teacher you have extended time on your IEP","Hand it in incomplete","Say nothing and take a lower grade","Complain to a friend"],"best":0,"partial":[3]},
{"id":"sa-accommodations-1-165","tier":1,"type":"mc","prompt":"Who should know about your classroom accommodations?","choices":["Your teachers and your case manager","Only your parents","Nobody","Only your friends"],"answer":0},
{"id":"sa-accommodations-2-166","tier":2,"type":"sj","prompt":"A teacher says \"you don't seem like you need that.\" What is the strongest response?","choices":["Explain what the accommodation does for you and ask your case manager to follow up","Stop using it","Argue in front of the class","Skip the class"],"best":0,"partial":[3]},
{"id":"sa-accommodations-2-167","tier":2,"type":"mc","prompt":"Why does explaining WHY you need an accommodation help?","choices":["It makes the request understandable and harder to dismiss","It is legally required of you","It shortens the conversation","It removes the need for an IEP"],"answer":0},
{"id":"sa-accommodations-2-168","tier":2,"type":"sj","prompt":"You need to use a text-to-speech tool but the room is quiet. What is best?","choices":["Ask about headphones or a separate space","Skip the tool","Use it out loud anyway","Leave the room without asking"],"best":0,"partial":[2]},
{"id":"sa-accommodations-3-169","tier":3,"type":"mc","prompt":"In college, who is responsible for requesting accommodations?","choices":["The student","The college automatically","The high school","The parents"],"answer":0},
{"id":"sa-accommodations-3-170","tier":3,"type":"mc","prompt":"What do you usually need to provide to get college accommodations?","choices":["Documentation of your disability","A copy of your transcript only","Nothing","A letter from a friend"],"answer":0},
{"id":"sa-accommodations-3-171","tier":3,"type":"sj","prompt":"An employer asks why you need a schedule adjustment. What is the strongest response?","choices":["State the functional need and the adjustment, without over-disclosing medical detail","Explain your full diagnosis history","Say it is none of their business","Withdraw the request"],"best":0,"partial":[2]}
],
"sa-awareness": [
{"id":"sa-awareness-1-172","tier":1,"type":"mc","prompt":"What is an IEP?","choices":["A legal plan describing your goals and supports","A report card","A class schedule","A behaviour contract"],"answer":0},
{"id":"sa-awareness-1-173","tier":1,"type":"mc","prompt":"Which is an example of a learning strength?","choices":["Understanding ideas better when you see them drawn","Forgetting instructions","Struggling with reading","Missing deadlines"],"answer":0},
{"id":"sa-awareness-1-174","tier":1,"type":"mc","prompt":"Who is on your IEP team?","choices":["You, your parents, teachers and the case manager","Only the principal","Only your parents","Only teachers"],"answer":0},
{"id":"sa-awareness-2-175","tier":2,"type":"mc","prompt":"Which law covers special education services in school?","choices":["IDEA","The ADA only","The Fair Labor Standards Act","FERPA"],"answer":0},
{"id":"sa-awareness-2-176","tier":2,"type":"mc","prompt":"Which law covers accommodations at work?","choices":["The ADA","IDEA","ESSA","None"],"answer":0},
{"id":"sa-awareness-2-177","tier":2,"type":"mc","prompt":"Which statement describes a disability in non-deficit language?","choices":["I process written text more slowly, so I use audio versions","I am bad at reading","I cannot read","Reading is not for me"],"answer":0},
{"id":"sa-awareness-3-178","tier":3,"type":"mc","prompt":"At what age do educational rights typically transfer to the student in Illinois?","choices":["18","16","21","14"],"answer":0},
{"id":"sa-awareness-3-179","tier":3,"type":"mc","prompt":"What changes when educational rights transfer to you?","choices":["You make the educational decisions your parents previously made","Your IEP ends","You leave school","Nothing changes"],"answer":0},
{"id":"sa-awareness-3-180","tier":3,"type":"mc","prompt":"When is disclosing a disability to an employer generally required?","choices":["Only when you are requesting an accommodation","On every application","Never under any circumstances","During the first interview"],"answer":0}
],
"sa-iep": [
{"id":"sa-iep-1-181","tier":1,"type":"mc","prompt":"What happens at an IEP meeting?","choices":["The team reviews progress and sets goals and services","You take a test","You get your schedule","You choose electives"],"answer":0},
{"id":"sa-iep-1-182","tier":1,"type":"mc","prompt":"How often must an IEP be reviewed?","choices":["At least once a year","Every four years","Only when you ask","Every month"],"answer":0},
{"id":"sa-iep-1-183","tier":1,"type":"mc","prompt":"What is a present levels statement?","choices":["A description of what you can do now","A list of your grades","Your attendance record","Your class rank"],"answer":0},
{"id":"sa-iep-2-184","tier":2,"type":"mc","prompt":"What makes a goal measurable?","choices":["It states a condition, an observable behaviour and a criterion","It sounds ambitious","It is written by a teacher","It has a deadline"],"answer":0},
{"id":"sa-iep-2-185","tier":2,"type":"mc","prompt":"What are transition services?","choices":["Activities to prepare you for life after high school","Bus services","Changing classes","Summer school"],"answer":0},
{"id":"sa-iep-2-186","tier":2,"type":"mc","prompt":"Why should you attend your own IEP meeting?","choices":["You know what helps you and can say so","Attendance is graded","It gets you out of class","It is required by law at every age"],"answer":0},
{"id":"sa-iep-3-187","tier":3,"type":"mc","prompt":"You disagree with a proposed service reduction. What is the strongest step in the meeting?","choices":["State your disagreement, give a reason and propose an alternative","Say nothing and sign","Refuse to attend","Leave the meeting"],"answer":0},
{"id":"sa-iep-3-188","tier":3,"type":"mc","prompt":"What are the three transition goal areas in an Illinois IEP?","choices":["Education/training, employment and independent living","Reading, math and behaviour","Home, school and community","Short, medium and long term"],"answer":0},
{"id":"sa-iep-3-189","tier":3,"type":"mc","prompt":"How can you tell whether you are making progress on a goal?","choices":["Look at the progress monitoring data against the target","Ask how you feel about it","Check your grades only","Wait for the annual review"],"answer":0}
],
"vo-jobseeking": [
{"id":"vo-jobseeking-1-190","tier":1,"type":"mc","prompt":"What should you bring to a job interview?","choices":["Identification, references and a copy of your resume","Nothing","A friend","Your report card"],"answer":0},
{"id":"vo-jobseeking-1-191","tier":1,"type":"mc","prompt":"A posting says \"Must be available weekends.\" You cannot work weekends. What should you do?","choices":["Look for a different posting","Apply and hope they change it","Apply and say you can work weekends","Apply without reading further"],"answer":0},
{"id":"vo-jobseeking-1-192","tier":1,"type":"mc","prompt":"What goes at the top of a resume?","choices":["Your name and contact information","Your hobbies","Your references","Your salary expectation"],"answer":0},
{"id":"vo-jobseeking-2-193","tier":2,"type":"sj","prompt":"An interviewer asks \"What is your greatest weakness?\" What is the strongest answer?","choices":["Name a real one and what you do about it","Say you have none","Name something unrelated to work","Say you work too hard"],"best":0,"partial":[3]},
{"id":"vo-jobseeking-2-194","tier":2,"type":"mc","prompt":"What is the purpose of a cover letter?","choices":["To connect your experience to that specific job","To repeat your resume","To list your references","To state your salary"],"answer":0},
{"id":"vo-jobseeking-2-195","tier":2,"type":"sj","prompt":"You have not heard back a week after an interview. What is best?","choices":["Send a brief polite follow-up","Call every day","Assume you did not get it","Show up at the workplace"],"best":0,"partial":[2]},
{"id":"vo-jobseeking-3-196","tier":3,"type":"sj","prompt":"An application asks about a gap in your work history. What is the strongest approach?","choices":["State it briefly and truthfully, then describe what you did during it","Leave it blank","Give false dates","Explain in great personal detail"],"best":0,"partial":[1]},
{"id":"vo-jobseeking-3-197","tier":3,"type":"mc","prompt":"Who is an appropriate professional reference?","choices":["A former supervisor or teacher who knows your work","A close family member","A friend from school","Anyone with a phone"],"answer":0},
{"id":"vo-jobseeking-3-198","tier":3,"type":"mc","prompt":"What documents do you typically need on your first day of work?","choices":["Photo ID and proof of work eligibility","A resume only","Your IEP","A school transcript"],"answer":0}
],
"vo-workplace": [
{"id":"vo-workplace-1-199","tier":1,"type":"sj","prompt":"You will be 15 minutes late to your shift. What do you do?","choices":["Call your supervisor before the shift starts","Arrive and say nothing","Text a co-worker only","Skip the shift"],"best":0,"partial":[2]},
{"id":"vo-workplace-1-200","tier":1,"type":"sj","prompt":"A supervisor tells you your work needs to be redone. What is best?","choices":["Say okay, ask what to change and redo it","Explain why it was fine","Redo it silently while upset","Ask a co-worker to do it"],"best":0,"partial":[2]},
{"id":"vo-workplace-1-201","tier":1,"type":"mc","prompt":"Your break is 15 minutes. When should you return?","choices":["At 15 minutes or sooner","When you feel ready","After 20 minutes","When someone comes to find you"],"answer":0},
{"id":"vo-workplace-2-202","tier":2,"type":"sj","prompt":"You finish your assigned task and the supervisor is busy. What is best?","choices":["Check the task list and start the next task","Stand and wait","Look at your phone","Leave early"],"best":0,"partial":[1]},
{"id":"vo-workplace-2-203","tier":2,"type":"sj","prompt":"A customer is rude to you. What is the strongest response?","choices":["Stay calm, help if you can, and get a supervisor if it escalates","Respond in kind","Walk away without a word","Argue until they stop"],"best":0,"partial":[2]},
{"id":"vo-workplace-2-204","tier":2,"type":"sj","prompt":"You are sick and cannot work your shift. What do you do?","choices":["Notify the supervisor through the required channel as early as possible","Text a co-worker to cover","Post about it online","Just do not show up"],"best":0,"partial":[1]},
{"id":"vo-workplace-3-205","tier":3,"type":"sj","prompt":"You notice a co-worker taking supplies home. What is best?","choices":["Follow the site's reporting procedure","Confront them yourself","Take some too","Say nothing ever"],"best":0,"partial":[1]},
{"id":"vo-workplace-3-206","tier":3,"type":"sj","prompt":"You made an error that will affect the next shift. What is best?","choices":["Report it immediately with what happened and what is needed","Fix it quietly and say nothing","Wait to see if anyone notices","Blame the equipment"],"best":0,"partial":[1]},
{"id":"vo-workplace-3-207","tier":3,"type":"sj","prompt":"A supervisor gives you feedback you think is unfair. What is the strongest response?","choices":["Acknowledge it, then ask for a time to discuss it calmly","Argue on the spot","Ignore it","Complain to co-workers"],"best":0,"partial":[2]}
],
"vo-career": [
{"id":"vo-career-1-208","tier":1,"type":"mc","prompt":"What does a career interest inventory tell you?","choices":["Types of work that match your preferences","How much you will earn","Whether you will be hired","Your grade point average"],"answer":0},
{"id":"vo-career-1-209","tier":1,"type":"mc","prompt":"Which is a work preference rather than a job title?","choices":["Working outdoors","Electrician","Nurse","Mechanic"],"answer":0},
{"id":"vo-career-1-210","tier":1,"type":"mc","prompt":"Where can you find out what training a job requires?","choices":["A career information site or the job posting","A friend's guess","Social media","A movie"],"answer":0},
{"id":"vo-career-2-211","tier":2,"type":"mc","prompt":"Which is a transferable skill?","choices":["Showing up on time","Knowing one store's register system","Having a specific locker","Owning a car"],"answer":0},
{"id":"vo-career-2-212","tier":2,"type":"mc","prompt":"A job requires a certificate you do not have. What is a reasonable next step?","choices":["Find out how long the certificate takes and where to get it","Apply anyway and hope","Choose a different career entirely","Give up on that field"],"answer":0},
{"id":"vo-career-2-213","tier":2,"type":"mc","prompt":"What does \"outlook\" mean in career information?","choices":["Whether jobs in that field are expected to grow","The view from the workplace","Your chance of promotion","The dress code"],"answer":0},
{"id":"vo-career-3-214","tier":3,"type":"mc","prompt":"Which agency in Illinois helps adults with disabilities find and keep employment?","choices":["The Division of Rehabilitation Services (DRS)","The Department of Motor Vehicles","The local library","The school district"],"answer":0},
{"id":"vo-career-3-215","tier":3,"type":"mc","prompt":"Why apply to adult service agencies before leaving high school?","choices":["Waiting lists mean support may not start immediately","It is required for graduation","It replaces the IEP","It guarantees a job"],"answer":0},
{"id":"vo-career-3-216","tier":3,"type":"mc","prompt":"You are comparing a two-year certificate and a four-year degree for the same field. What should you compare?","choices":["Cost, length, entry requirements and what each qualifies you for","Only the cost","Only the length","Only which sounds better"],"answer":0}
],
"vo-communication": [
{"id":"vo-communication-1-217","tier":1,"type":"sj","prompt":"You do not understand a work instruction. What is best?","choices":["Ask a specific question before starting","Start and hope it is right","Ask a co-worker to do it","Do nothing"],"best":0,"partial":[2]},
{"id":"vo-communication-1-218","tier":1,"type":"sj","prompt":"You run out of a supply mid-shift. What do you do?","choices":["Tell the supervisor what ran out and what you need","Stop working","Use something else without asking","Wait until the end of the shift"],"best":0,"partial":[3]},
{"id":"vo-communication-1-219","tier":1,"type":"mc","prompt":"Which greeting is appropriate at work?","choices":["Good morning, how can I help?","Yo","What do you want?","Nothing at all"],"answer":0},
{"id":"vo-communication-2-220","tier":2,"type":"sj","prompt":"A co-worker and you are assigned one task together. What is best?","choices":["Agree who does what and check in partway through","Do it all yourself","Wait for them to lead","Do your half and leave"],"best":0,"partial":[3]},
{"id":"vo-communication-2-221","tier":2,"type":"sj","prompt":"You need next Friday off. What is best?","choices":["Request it through the proper channel with as much notice as possible","Tell a co-worker","Just do not come in","Ask on Friday morning"],"best":0,"partial":[1]},
{"id":"vo-communication-2-222","tier":2,"type":"mc","prompt":"A supervisor sends a group message asking who can cover a shift. What is an appropriate reply?","choices":["A clear yes or no with your availability","No reply","A joke","A reply to everyone complaining"],"answer":0},
{"id":"vo-communication-3-223","tier":3,"type":"sj","prompt":"A briefing mentions a process change you did not fully catch. What is best?","choices":["Ask for clarification before the shift, and write down the change","Guess and continue","Ask a co-worker mid-task","Do it the old way"],"best":0,"partial":[2]},
{"id":"vo-communication-3-224","tier":3,"type":"sj","prompt":"You are given feedback in front of customers. What is the strongest response?","choices":["Acknowledge it briefly and follow up privately if needed","Defend yourself immediately","Walk away","Ignore it entirely"],"best":0,"partial":[3]},
{"id":"vo-communication-3-225","tier":3,"type":"sj","prompt":"Your assigned task conflicts with a safety rule. What do you do?","choices":["Stop and raise it with a supervisor before continuing","Do it as told","Do it your own way silently","Refuse without explanation"],"best":0,"partial":[3]}
],
"st-testprep": [
{"id":"st-testprep-1-226","tier":1,"type":"mc","prompt":"Which is an active study strategy?","choices":["Testing yourself with questions","Rereading the chapter","Highlighting everything","Copying notes word for word"],"answer":0},
{"id":"st-testprep-1-227","tier":1,"type":"mc","prompt":"When should you start studying for a test in five days?","choices":["Within the first day or two","The night before","The morning of","After the test"],"answer":0},
{"id":"st-testprep-1-228","tier":1,"type":"mc","prompt":"What should you find out first about an upcoming test?","choices":["What content it covers and what format it uses","Who else is taking it","How long the teacher has taught","What the room number is"],"answer":0},
{"id":"st-testprep-2-229","tier":2,"type":"mc","prompt":"Why is studying on three separate days better than one long session?","choices":["Spacing improves retention","It takes less total time","It is easier to schedule","Teachers require it"],"answer":0},
{"id":"st-testprep-2-230","tier":2,"type":"mc","prompt":"You made flashcards and can answer them all. What should you do next?","choices":["Test yourself without the cards in front of you","Make more cards","Read them again","Stop studying"],"answer":0},
{"id":"st-testprep-2-231","tier":2,"type":"mc","prompt":"Which is the best use of a practice test?","choices":["Identify what you do not know, then restudy it","Confirm you already know everything","Memorise the answers","Skip the hard parts"],"answer":0},
{"id":"st-testprep-3-232","tier":3,"type":"mc","prompt":"Your practice test shows you know 3 of 5 topics well. How should you spend remaining study time?","choices":["Mostly on the two weak topics","Evenly on all five","Mostly on the three strong ones","On a different subject"],"answer":0},
{"id":"st-testprep-3-233","tier":3,"type":"mc","prompt":"Rereading feels effective but predicts poor test performance. Why?","choices":["Familiarity is mistaken for knowing","It takes too long","It is boring","It uses the wrong notes"],"answer":0},
{"id":"st-testprep-3-234","tier":3,"type":"mc","prompt":"A test will be short-answer rather than multiple choice. How should studying change?","choices":["Practise producing answers from memory, not recognising them","Study exactly the same way","Only reread notes","Memorise the textbook"],"answer":0}
],
"st-teststrategy": [
{"id":"st-teststrategy-1-235","tier":1,"type":"mc","prompt":"What should you do before answering the first question on a test?","choices":["Read the directions","Answer as fast as possible","Check the clock only","Ask a neighbour"],"answer":0},
{"id":"st-teststrategy-1-236","tier":1,"type":"mc","prompt":"You do not know an answer on a test with no penalty for guessing. What should you do?","choices":["Eliminate what you can and choose","Leave it blank","Choose the longest option always","Skip the rest of the test"],"answer":0},
{"id":"st-teststrategy-1-237","tier":1,"type":"mc","prompt":"You have 30 minutes and 30 questions. About how long per question?","choices":["One minute","Three minutes","Ten seconds","Five minutes"],"answer":0},
{"id":"st-teststrategy-2-238","tier":2,"type":"mc","prompt":"A question asks you to \"compare and contrast.\" What must your answer include?","choices":["Both similarities and differences","Only similarities","Only differences","A definition"],"answer":0},
{"id":"st-teststrategy-2-239","tier":2,"type":"mc","prompt":"You are stuck on question 4 with 20 questions left. What is best?","choices":["Mark it, move on, and return if time allows","Stay until you solve it","Guess and stop reading","Start over from question 1"],"answer":0},
{"id":"st-teststrategy-2-240","tier":2,"type":"mc","prompt":"You have 5 minutes left and 3 unanswered questions. What is best?","choices":["Answer all three quickly rather than perfecting one","Perfect one and leave two blank","Recheck answered questions","Stop working"],"answer":0},
{"id":"st-teststrategy-3-241","tier":3,"type":"mc","prompt":"A short-answer question has three parts. You answer two well. What will happen?","choices":["You lose the credit for the missing part","You get full credit","The question is thrown out","You get extra credit"],"answer":0},
{"id":"st-teststrategy-3-242","tier":3,"type":"mc","prompt":"You finish a test with time remaining. What is the highest-value use of that time?","choices":["Check for skipped items and reread the directions","Hand it in early","Change all uncertain answers","Rewrite neatly"],"answer":0},
{"id":"st-teststrategy-3-243","tier":3,"type":"mc","prompt":"Why show your work even when the final answer is wrong?","choices":["Partial credit is often awarded for correct reasoning","It looks neater","It takes longer","Teachers require it always"],"answer":0}
],
"st-directions": [
{"id":"st-directions-1-244","tier":1,"type":"mc","prompt":"Directions say: \"Answer questions 1-5. Skip question 6.\" What do you do with question 6?","choices":["Leave it blank","Answer it","Answer it for extra credit","Cross it out and answer 7"],"answer":0},
{"id":"st-directions-1-245","tier":1,"type":"mc","prompt":"Directions say \"Use complete sentences.\" What does that require?","choices":["Each answer has a subject and a verb","Answers are long","Answers are in bullet points","Answers are one word"],"answer":0},
{"id":"st-directions-1-246","tier":1,"type":"mc","prompt":"What does the task verb \"list\" require?","choices":["Name the items, without explanation","Explain each item fully","Compare the items","Argue for one item"],"answer":0},
{"id":"st-directions-2-247","tier":2,"type":"mc","prompt":"What does the task verb \"explain\" require that \"list\" does not?","choices":["Reasons or how something works","More items","Shorter answers","A drawing"],"answer":0},
{"id":"st-directions-2-248","tier":2,"type":"mc","prompt":"A rubric awards points for \"evidence from the text.\" What must your answer include?","choices":["A specific quotation or detail from the reading","Your opinion","A summary of the whole text","A title"],"answer":0},
{"id":"st-directions-2-249","tier":2,"type":"mc","prompt":"Directions say \"Choose two of the four prompts.\" How many do you answer?","choices":["Two","Four","One","All of them"],"answer":0},
{"id":"st-directions-3-250","tier":3,"type":"mc","prompt":"What does the task verb \"justify\" require?","choices":["State a position and give reasons and evidence for it","Describe the topic","List the facts","Summarize the reading"],"answer":0},
{"id":"st-directions-3-251","tier":3,"type":"mc","prompt":"Directions say: \"If you selected option A, complete section 3. Otherwise skip to section 4.\" You chose B. What next?","choices":["Go to section 4","Complete section 3","Complete both","Stop"],"answer":0},
{"id":"st-directions-3-252","tier":3,"type":"mc","prompt":"You do not understand one requirement in a long set of directions. What is best?","choices":["Identify the specific requirement and ask about that part","Ask the teacher to re-explain everything","Guess at the whole assignment","Skip the assignment"],"answer":0}
],
"be-regulation": [
{"id":"be-regulation-1-253","tier":1,"type":"scale","prompt":"I noticed I was getting upset before it became a problem.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-regulation-2-254","tier":2,"type":"scale","prompt":"I used a calming strategy instead of reacting.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-regulation-3-255","tier":3,"type":"scale","prompt":"I came back to what I was doing after getting upset.","scale_low":"Never","scale_high":"Every time"}
],
"be-directions": [
{"id":"be-directions-1-256","tier":1,"type":"scale","prompt":"I did what an adult asked the first time.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-directions-2-257","tier":2,"type":"scale","prompt":"I followed directions even when I did not want to.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-directions-3-258","tier":3,"type":"scale","prompt":"I followed directions given to the whole class without needing them repeated to me.","scale_low":"Never","scale_high":"Every time"}
],
"be-expectations": [
{"id":"be-expectations-1-259","tier":1,"type":"scale","prompt":"I stayed in my assigned area during class.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-expectations-2-260","tier":2,"type":"scale","prompt":"I waited to be called on before speaking.","scale_low":"Never","scale_high":"Every time"},
{"id":"be-expectations-3-261","tier":3,"type":"scale","prompt":"I followed the class expectations even when others did not.","scale_low":"Never","scale_high":"Every time"}
],
"se-coping": [
{"id":"se-coping-1-262","tier":1,"type":"scale","prompt":"I noticed when I was stressed or upset.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-coping-2-263","tier":2,"type":"scale","prompt":"I used a strategy from my plan when I was upset.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-coping-3-264","tier":3,"type":"scale","prompt":"The strategy I used actually helped.","scale_low":"Never","scale_high":"Every time"}
],
"se-frustration": [
{"id":"se-frustration-1-265","tier":1,"type":"scale","prompt":"I kept working on something hard instead of stopping.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-frustration-2-266","tier":2,"type":"scale","prompt":"I asked for help instead of giving up.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-frustration-3-267","tier":3,"type":"scale","prompt":"I stayed with a task even when I got it wrong the first time.","scale_low":"Never","scale_high":"Every time"}
],
"se-resilience": [
{"id":"se-resilience-1-268","tier":1,"type":"scale","prompt":"I could name something I am good at.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-resilience-2-269","tier":2,"type":"scale","prompt":"I said something encouraging to myself after a setback.","scale_low":"Never","scale_high":"Every time"},
{"id":"se-resilience-3-270","tier":3,"type":"scale","prompt":"I kept going after something did not work out.","scale_low":"Never","scale_high":"Every time"}
],
"ef-initiation": [
{"id":"ef-initiation-1-271","tier":1,"type":"scale","prompt":"I started my work without being told twice.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-initiation-2-272","tier":2,"type":"scale","prompt":"I started even when I was not sure how.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-initiation-3-273","tier":3,"type":"scale","prompt":"I got back to work quickly after an interruption.","scale_low":"Never","scale_high":"Every time"}
],
"ef-organization": [
{"id":"ef-organization-1-274","tier":1,"type":"scale","prompt":"My papers and files were where they belonged.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-organization-2-275","tier":2,"type":"scale","prompt":"I wrote down my assignments and due dates.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-organization-3-276","tier":3,"type":"scale","prompt":"I could find what I needed without searching for it.","scale_low":"Never","scale_high":"Every time"}
],
"ef-time": [
{"id":"ef-time-1-277","tier":1,"type":"scale","prompt":"I knew roughly how long my work would take.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-time-2-278","tier":2,"type":"scale","prompt":"I finished things before they were due.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-time-3-279","tier":3,"type":"scale","prompt":"I planned my week so nothing was left to the last night.","scale_low":"Never","scale_high":"Every time"}
],
"ef-monitoring": [
{"id":"ef-monitoring-1-280","tier":1,"type":"scale","prompt":"I noticed when I was off task.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-monitoring-2-281","tier":2,"type":"scale","prompt":"My rating of my own work matched what my teacher thought.","scale_low":"Never","scale_high":"Every time"},
{"id":"ef-monitoring-3-282","tier":3,"type":"scale","prompt":"I changed what I was doing when it was not working.","scale_low":"Never","scale_high":"Every time"}
],
"sa-helpseeking": [
{"id":"sa-helpseeking-1-283","tier":1,"type":"scale","prompt":"I asked for help when I was stuck.","scale_low":"Never","scale_high":"Every time"},
{"id":"sa-helpseeking-2-284","tier":2,"type":"scale","prompt":"I asked a specific question instead of saying \"I do not get it\".","scale_low":"Never","scale_high":"Every time"},
{"id":"sa-helpseeking-3-285","tier":3,"type":"scale","prompt":"I asked for help before the deadline, not after.","scale_low":"Never","scale_high":"Every time"}
],
"sa-determination": [
{"id":"sa-determination-1-286","tier":1,"type":"scale","prompt":"I set a goal for myself.","scale_low":"Never","scale_high":"Every time"},
{"id":"sa-determination-2-287","tier":2,"type":"scale","prompt":"I made a choice and stuck with it.","scale_low":"Never","scale_high":"Every time"},
{"id":"sa-determination-3-288","tier":3,"type":"scale","prompt":"I followed through on something I said I would do.","scale_low":"Never","scale_high":"Every time"}
],
"st-study": [
{"id":"st-study-1-289","tier":1,"type":"scale","prompt":"I studied at the time I planned to.","scale_low":"Never","scale_high":"Every time"},
{"id":"st-study-2-290","tier":2,"type":"scale","prompt":"I set up a place to study without distractions.","scale_low":"Never","scale_high":"Every time"},
{"id":"st-study-3-291","tier":3,"type":"scale","prompt":"I reviewed material more than once before the test.","scale_low":"Never","scale_high":"Every time"}
],
"rd-fluency": [
{"id":"rd-fluency-1-292","tier":1,"type":"rubric","prompt":"Phrasing","levels":["Word by word","Two-word phrases","Three- and four-word phrases","Meaningful phrases throughout"]},
{"id":"rd-fluency-2-293","tier":2,"type":"rubric","prompt":"Accuracy and self-correction","levels":["Frequent uncorrected errors","Some errors, few corrected","Most meaning-changing errors self-corrected","Errors rare and self-corrected immediately"]},
{"id":"rd-fluency-3-294","tier":3,"type":"rubric","prompt":"Expression and pace","levels":["Flat, no expression","Some expression, uneven pace","Expression matches meaning most of the time","Expression and pace consistently match the meaning"]}
],
"rd-written": [
{"id":"rd-written-1-295","tier":1,"type":"rubric","prompt":"Accuracy to the text","levels":["Not based on the text","Partly accurate","Accurate with minor gaps","Fully accurate to the text"]},
{"id":"rd-written-2-296","tier":2,"type":"rubric","prompt":"Completeness","levels":["One point covered","Some main points covered","Most main points covered","All main points covered in order"]},
{"id":"rd-written-3-297","tier":3,"type":"rubric","prompt":"Own words and objectivity","levels":["Copied from the text","Mostly copied phrasing","Mostly own words, some opinion","Own words throughout, no opinion"]}
],
"wr-paragraph": [
{"id":"wr-paragraph-1-298","tier":1,"type":"rubric","prompt":"Topic sentence and focus","levels":["No topic sentence","Topic sentence unclear","Clear topic sentence","Clear topic sentence that all details support"]},
{"id":"wr-paragraph-2-299","tier":2,"type":"rubric","prompt":"Development and detail","levels":["One detail or fewer","Two relevant details","Three relevant details","Three or more developed, relevant details"]},
{"id":"wr-paragraph-3-300","tier":3,"type":"rubric","prompt":"Organization and conventions","levels":["No clear order, frequent errors","Some order, several errors","Clear order, minor errors","Clear order with transitions, conventions correct"]}
],
"wr-functional": [
{"id":"wr-functional-1-301","tier":1,"type":"rubric","prompt":"Completeness of required fields","levels":["Most fields blank","Some fields complete","Nearly all fields complete","Every required field complete"]},
{"id":"wr-functional-2-302","tier":2,"type":"rubric","prompt":"Accuracy of information","levels":["Frequent inaccuracies","Some inaccuracies","Minor inaccuracies","All information accurate"]},
{"id":"wr-functional-3-303","tier":3,"type":"rubric","prompt":"Tone and appropriateness for the audience","levels":["Inappropriate for the audience","Inconsistent tone","Mostly appropriate tone","Consistently appropriate and professional"]}
],
"co-expressive": [
{"id":"co-expressive-1-304","tier":1,"type":"rubric","prompt":"Grammar and sentence structure","levels":["Mostly incomplete utterances","Simple sentences with errors","Complete sentences, occasional errors","Varied, grammatically complete sentences"]},
{"id":"co-expressive-2-305","tier":2,"type":"rubric","prompt":"Vocabulary specificity","levels":["Mostly nonspecific words","Some specific vocabulary","Mostly specific vocabulary","Precise vocabulary throughout"]},
{"id":"co-expressive-3-306","tier":3,"type":"rubric","prompt":"Clarity to an unfamiliar listener","levels":["Listener cannot follow","Listener follows with many questions","Listener follows with one or two questions","Listener follows with no questions"]}
],
"st-notes": [
{"id":"st-notes-1-307","tier":1,"type":"rubric","prompt":"Capture of main points","levels":["Few main points recorded","Some main points recorded","Most main points recorded","All main points recorded"]},
{"id":"st-notes-2-308","tier":2,"type":"rubric","prompt":"Supporting detail","levels":["No supporting detail","Occasional detail","Detail for most main points","Detail for every main point"]},
{"id":"st-notes-3-309","tier":3,"type":"rubric","prompt":"Usability for study","levels":["Not usable for study","Partly usable","Usable with effort","Organized and immediately usable for study"]}
]
}};
