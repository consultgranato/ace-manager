// =============================================================
// Ace Manager — goal taxonomy: Study & Test Skills
// =============================================================
// The skills that decide whether a student who knows the content can show it.
// Kept separate from Executive Functioning on purpose: a student can be well
// organised and still have no idea how to study for a test, and writing both
// as one "organization" goal is how that gets missed.

'use strict';
const { section, collect } = require('./dsl');

// ---- note-taking ------------------------------------------------------------------
const NT = section({
  domain: 'Study & Test Skills', sub: 'Note-Taking', pool: 'st-notes',
  std: 'IL ELA SL.{gg}.2', dx: ['SLD', 'OHI', 'ASD', 'ED', 'TBI'], fade: 'academic'
});

NT('sk-nt-01', 'Taking notes from a lecture or presentation',
  'Given a lesson or presentation in {course}',
  'record notes that capture the main points and supporting details',
  'rubric', 3, [3, 4],
  ['record notes using a provided guided-notes outline',
   'record main points using a partially completed outline',
   'record main points and supporting details on a blank page independently']);

NT('sk-nt-02', 'Taking notes from a text',
  'Given {text} and a note-taking format',
  'record notes that capture the key information in the student\'s own words',
  'rubric', 3, [3, 4],
  ['highlight or underline key information in the text',
   'record notes from a text using a provided format',
   'select a format and record notes in own words independently']);

NT('sk-nt-03', 'Using a structured note-taking format',
  'Given a taught note-taking format such as two-column or outline notes',
  'apply the format correctly during a lesson',
  'accuracy', 85, [3, 4],
  ['complete a partially prepared version of the format',
   'apply the format with a reminder of its parts',
   'apply the format correctly and completely without a reminder']);

NT('sk-nt-04', 'Reviewing and revising notes after class',
  'Given notes taken during a lesson',
  'review the notes within 24 hours and add questions or clarifications',
  'opportunities', 85, [3, 4],
  ['review notes when prompted by an adult',
   'review notes after a scheduled reminder',
   'review and annotate notes within 24 hours independently'],
  { fade: 'selfreport', pool: 'st-study' });

NT('sk-nt-05', 'Recording assignments and due dates from a lesson',
  'Given assignments announced during class',
  'record each assignment and due date accurately',
  'accuracy', 90, [4, 5],
  ['record assignments with an adult prompt',
   'record assignments after a posted cue',
   'record every assignment and due date accurately with no cue']);

NT('sk-nt-06', 'Using recorded or digital notes',
  'Given recording or note-taking technology',
  'capture the lesson content and locate specific information in it afterward',
  'steps', 85, [3, 4],
  ['use the tool to record with adult setup',
   'use the tool to record and replay independently',
   'record, annotate and locate specific information in the notes independently'],
  { pool: 'vo-jobtask', fade: 'functional' });

// ---- test preparation -----------------------------------------------------------------
const TP = section({
  domain: 'Study & Test Skills', sub: 'Test Preparation', pool: 'st-testprep',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID'], fade: 'academic'
});

TP('sk-tp-01', 'Identifying what a test will cover',
  'Given an upcoming test and course materials',
  'state what content the test will cover and in what format',
  'accuracy', 85, [3, 4],
  ['state the date and the general topic of the test',
   'state the specific content the test will cover',
   'state the content, format and point weighting of the test']);

TP('sk-tp-02', 'Making a study plan before a test',
  'Given a test date and the content to be covered',
  'produce a study plan spread across more than one day',
  'accuracy', 85, [3, 4],
  ['produce a study plan with adult support',
   'produce a study plan covering all the content',
   'produce a multi-day study plan and follow it']);

TP('sk-tp-03', 'Using an active study strategy',
  'Given content to learn and a choice of study strategies',
  'use an active strategy such as self-testing rather than rereading',
  'opportunities', 85, [3, 4],
  ['name two active study strategies',
   'use an active strategy when an adult directs it',
   'select and use an active strategy independently'],
  { note: 'Rereading feels like studying and predicts almost nothing; the measurable shift is to self-testing, and it is worth writing a goal about.' });

TP('sk-tp-04', 'Creating study materials',
  'Given content to learn',
  'produce study materials such as cards, summaries or practice questions',
  'rubric', 3, [3, 4],
  ['complete study materials provided by an adult',
   'produce study materials covering the main content',
   'produce complete, accurate study materials covering all tested content'],
  { pool: 'st-notes' });

TP('sk-tp-05', 'Distributing study over time',
  'Given a test more than three days away',
  'study on more than one day rather than only the night before',
  'opportunities', 80, [3, 4],
  ['study on the day before the test',
   'study on two separate days before the test',
   'study on three or more separate days before the test'],
  { fade: 'selfreport', pool: 'st-study' });

TP('sk-tp-06', 'Checking understanding before the test',
  'Given study materials and practice questions',
  'self-test and identify what still needs review',
  'accuracy', 85, [3, 4],
  ['complete practice questions',
   'complete practice questions and check the answers',
   'self-test, identify the content still not known, and restudy it']);

// ---- test-taking strategies -----------------------------------------------------------------
const TS = section({
  domain: 'Study & Test Skills', sub: 'Test-Taking Strategies', pool: 'st-teststrategy',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID'], fade: 'academic'
});

TS('sk-ts-01', 'Reading and following test directions',
  'Given a test containing directions of varied format',
  'follow the directions for each section correctly',
  'accuracy', 90, [4, 5],
  ['follow directions when they are read aloud',
   'follow written directions after underlining the key words',
   'follow all written directions correctly with no support']);

TS('sk-ts-02', 'Managing time during a test',
  'Given a timed test and a clock',
  'pace the work so every section is attempted before time expires',
  'opportunities', 85, [3, 4],
  ['attempt every section with pacing prompts',
   'attempt every section using a written time plan',
   'pace independently and attempt every section within the time limit']);

TS('sk-ts-03', 'Using elimination on multiple choice items',
  'Given multiple choice items containing distractors',
  'eliminate implausible options before choosing',
  'accuracy', 85, [4, 5],
  ['eliminate one clearly wrong option',
   'eliminate two options before choosing',
   'eliminate implausible options systematically and justify the final choice']);

TS('sk-ts-04', 'Answering constructed-response items completely',
  'Given constructed-response items with stated requirements',
  'produce a response that addresses every part of the question',
  'rubric', 3, [3, 4],
  ['address the first part of a multi-part question',
   'address every part of a multi-part question',
   'address every part with the required evidence and the required length'],
  { pool: 'rd-written' });

TS('sk-ts-05', 'Checking work before submitting a test',
  'Given a completed test and remaining time',
  'review the test for skipped items and correctable errors',
  'opportunities', 85, [4, 5],
  ['review when an adult prompts',
   'review using a written checking routine',
   'review independently and correct at least one error before submitting']);

TS('sk-ts-06', 'Using approved testing accommodations',
  'Given a test and the student\'s approved accommodations',
  'request and use each accommodation the student is entitled to',
  'opportunities', 90, [4, 5],
  ['use accommodations when they are set up by an adult',
   'request accommodations after a reminder',
   'request and use every approved accommodation independently'],
  { pool: 'sa-accommodations', fade: 'behavior' });

TS('sk-ts-07', 'Attempting rather than skipping difficult items',
  'Given a test containing items the student finds difficult',
  'attempt every item rather than leaving it blank',
  'opportunities', 85, [4, 5],
  ['attempt difficult items with adult encouragement',
   'attempt difficult items after using a taught strategy',
   'attempt every item on the test with no encouragement']);

// ---- study routines ---------------------------------------------------------------------------
const SR = section({
  domain: 'Study & Test Skills', sub: 'Study Routines', pool: 'st-study',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'ASD', 'ED'], fade: 'selfreport'
});

SR('sk-sr-01', 'Maintaining a consistent study time',
  'Given the student\'s own weekly schedule',
  'study at the scheduled time on the target number of days',
  'opportunities', 80, [3, 4],
  ['study at the scheduled time with an adult reminder',
   'study at the scheduled time on half the planned days',
   'study at the scheduled time on the target number of days for four consecutive weeks']);

SR('sk-sr-02', 'Setting up a study environment that works',
  'Given a study session',
  'set up the environment by removing the distractions the student has identified',
  'opportunities', 85, [3, 4],
  ['name the distractions that interfere with studying',
   'remove identified distractions when prompted',
   'set up the environment independently before every study session']);

SR('sk-sr-03', 'Taking planned breaks during study',
  'Given a study session longer than 30 minutes',
  'take planned breaks and return on time',
  'opportunities', 85, [3, 4],
  ['take breaks when an adult signals',
   'take planned breaks using a timer',
   'take planned breaks and return on time without a timer']);

SR('sk-sr-04', 'Using a homework routine',
  'Given nightly assignments',
  'complete the homework routine from setup through submission',
  'steps', 85, [3, 4],
  ['complete the routine with adult support',
   'complete the routine using a written checklist',
   'complete the full homework routine independently'],
  { pool: 'ef-materials', fade: 'behavior' });

SR('sk-sr-05', 'Reviewing content regularly rather than only before tests',
  'Given ongoing course content',
  'review previously taught content on the planned schedule',
  'opportunities', 80, [3, 4],
  ['review previous content when directed',
   'review previous content weekly with a reminder',
   'review previous content on schedule independently']);

// ---- assignment comprehension ------------------------------------------------------------------------
const AD = section({
  domain: 'Study & Test Skills', sub: 'Assignment Comprehension', pool: 'st-directions',
  std: 'IL ELA RI.{gg}.3', dx: ['SLD', 'OHI', 'ASD', 'ID', 'SLI'], fade: 'academic'
});

AD('sk-ad-01', 'Restating what an assignment requires',
  'Given a written assignment and its directions',
  'restate what the assignment requires and how it will be graded',
  'accuracy', 90, [4, 5],
  ['restate the general topic of the assignment',
   'restate what the assignment requires the student to produce',
   'restate the requirements, the format and the grading criteria']);

AD('sk-ad-02', 'Identifying the task verbs in directions',
  'Given assignment directions containing academic task verbs',
  'state what each task verb requires the student to do',
  'accuracy', 85, [4, 5],
  ['state the meaning of describe, list and define',
   'state the meaning of compare, explain and summarize',
   'state the meaning of analyze, justify, evaluate and cite and what each requires']);

AD('sk-ad-03', 'Breaking assignment directions into steps',
  'Given multi-part assignment directions',
  'list every required step in the order it should be done',
  'accuracy', 85, [4, 5],
  ['list the first two required steps',
   'list every required step',
   'list every step in order with an estimate of the time each will take']);

AD('sk-ad-04', 'Using a rubric to guide work',
  'Given an assignment rubric',
  'use the rubric to plan the work and check it before submitting',
  'opportunities', 85, [3, 4],
  ['state what the rubric is measuring',
   'use the rubric to check the work before submitting',
   'use the rubric to plan the work and to check it before submitting']);

AD('sk-ad-05', 'Identifying what is not understood in an assignment',
  'Given assignment directions containing something the student does not understand',
  'identify the specific part that is unclear and ask about it',
  'accuracy', 85, [4, 5],
  ['state that part of the assignment is unclear',
   'identify which section is unclear',
   'identify the specific unclear requirement and ask a question about it']);

AD('sk-ad-06', 'Following written directions on a test or form',
  'Given written directions on a test, application or workplace form',
  'complete the task exactly as the directions specify',
  'accuracy', 90, [4, 5],
  ['complete a task with three written direction steps',
   'complete a task with five written direction steps',
   'complete a task with written directions of any length including conditional steps'],
  { fade: 'functional' });

NT('sk-nt-07', 'Summarizing notes into a study-ready form',
  'Given a set of notes from a unit',
  'condense the notes into a summary covering the main points',
  'rubric', 3, [3, 4],
  ['highlight the main points within the notes',
   'condense the notes into a one-page summary',
   'condense the notes into a study-ready summary organized by concept']);

TP('sk-tp-07', 'Predicting likely test questions',
  'Given unit content and previous assessments',
  'write questions likely to appear and answer them',
  'accuracy', 80, [3, 4],
  ['write two questions about the unit content',
   'write questions covering each main topic',
   'write likely questions in the test\'s own format and answer them correctly']);

TS('sk-ts-08', 'Showing work and partial reasoning for credit',
  'Given items that award credit for shown work',
  'record the reasoning steps as well as the answer',
  'accuracy', 85, [4, 5],
  ['record the final answer with one supporting step',
   'record each major step of the work',
   'record complete reasoning that would earn partial credit even when the answer is wrong']);

module.exports = collect(NT, TP, TS, SR, AD);
