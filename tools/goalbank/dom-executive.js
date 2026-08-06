// =============================================================
// Ace Manager — goal taxonomy: Executive Functioning
// =============================================================
// The domain where secondary IEPs most often go vague ("will improve
// organization"). Every goal here resolves to something countable from a
// gradebook, a binder check, a planner, or a timed observation — because the
// alternative is a goal nobody can report on in December.

'use strict';
const { section, collect } = require('./dsl');

// ---- task initiation --------------------------------------------------------------
const TI = section({
  domain: 'Executive Functioning', sub: 'Task Initiation', pool: 'ef-initiation',
  std: 'IL SEL 1B', dx: ['OHI', 'SLD', 'ASD', 'ED', 'TBI'], fade: 'behavior'
});

TI('ef-ti-01', 'Beginning assigned work promptly',
  'Given an assigned task in {setting}',
  'begin working within two minutes of the direction',
  'opportunities', 85, [4, 5],
  ['begin within two minutes after an adult prompt',
   'begin within two minutes after a nonverbal cue',
   'begin within two minutes with no prompt']);

TI('ef-ti-02', 'Reducing latency to start a task',
  'Given an assigned task and a timed observation',
  'begin the task within the target number of minutes',
  'latency', 2, [4, 5],
  ['begin the task faster than the baseline average',
   'begin the task within four minutes',
   'begin the task within the target time across a full week'],
  { pool: 'be-tally' });

TI('ef-ti-03', 'Starting a task without knowing exactly how',
  'Given a task whose first step is not obvious',
  'identify a reasonable first step and begin',
  'opportunities', 80, [4, 5],
  ['state the first step when an adult asks',
   'identify a first step using a starter checklist',
   'identify a first step and begin without adult support']);

TI('ef-ti-04', 'Beginning homework at a set time',
  'Given the student\'s own homework schedule',
  'begin homework at the scheduled time',
  'opportunities', 80, [4, 5],
  ['begin homework when reminded by an adult at home',
   'begin homework within 30 minutes of the scheduled time',
   'begin homework at the scheduled time without a reminder'],
  { fade: 'selfreport' });

TI('ef-ti-05', 'Restarting after an interruption',
  'Given an interruption during independent work',
  'return to the task within two minutes of the interruption ending',
  'opportunities', 85, [4, 5],
  ['return to the task after an adult prompt',
   'return to the task after a nonverbal cue',
   'return to the task within two minutes with no cue']);

TI('ef-ti-06', 'Breaking a large assignment into a first action',
  'Given a multi-day assignment and a planning tool',
  'break the assignment into steps and complete the first step the same day',
  'opportunities', 80, [3, 4],
  ['list the steps of the assignment with adult support',
   'list the steps independently',
   'list the steps and complete the first step on the day the assignment is given']);

// ---- organization ---------------------------------------------------------------------
const OR = section({
  domain: 'Executive Functioning', sub: 'Organization', pool: 'ef-organization',
  std: 'IL SEL 1C', dx: ['OHI', 'SLD', 'ASD', 'ED'], fade: 'behavior'
});

OR('ef-or-01', 'Maintaining an organized binder or folder system',
  'Given a weekly binder check',
  'keep papers filed in the correct section with no loose papers',
  'accuracy', 85, [4, 5],
  ['keep papers in the binder rather than loose',
   'file papers in the correct section with a prompt',
   'file every paper in the correct section with no prompt'],
  { pool: 'ef-materials' });

OR('ef-or-02', 'Maintaining an organized digital file system',
  'Given a weekly review of the student\'s digital files',
  'store files in named folders with names that identify the assignment',
  'accuracy', 85, [4, 5],
  ['save files to a single named folder rather than the desktop',
   'save files to course folders with meaningful names',
   'maintain a folder structure by course and unit with all files correctly named'],
  { pool: 'ef-materials', bands: ['6-8', '9-12', '18-22'] });

OR('ef-or-03', 'Recording assignments in a planner or app',
  'Given the daily assignments announced in each class',
  'record every assignment with its due date',
  'opportunities', 90, [4, 5],
  ['record assignments when an adult prompts at the end of class',
   'record assignments after a written or posted cue',
   'record every assignment and due date without any prompt']);

OR('ef-or-04', 'Keeping a workspace organized',
  'Given a work period at a desk or workstation',
  'set up the workspace with only the needed materials and clear it at the end',
  'steps', 90, [4, 5],
  ['clear the workspace when prompted',
   'set up and clear the workspace with a task card',
   'set up and clear the workspace independently every session'],
  { pool: 'ef-materials', fade: 'functional' });

OR('ef-or-05', 'Using a consistent system to track long-term work',
  'Given assignments spanning more than one week',
  'record each long-term assignment with interim checkpoints',
  'opportunities', 85, [3, 4],
  ['record the final due date of a long-term assignment',
   'record the due date and one interim checkpoint',
   'record the due date and all interim checkpoints and check them off as completed'],
  { bands: ['9-12', '18-22'] });

OR('ef-or-06', 'Organizing information before writing or presenting',
  'Given a task requiring the student to organize information',
  'select and complete an appropriate organizing tool before producing the work',
  'opportunities', 85, [3, 4],
  ['complete a provided organizer before starting',
   'select an appropriate organizer from options and complete it',
   'select, complete and use an organizer without adult direction']);

// ---- materials management ------------------------------------------------------------------
const MM = section({
  domain: 'Executive Functioning', sub: 'Materials Management', pool: 'ef-materials',
  std: 'IL SEL 1C', dx: ['OHI', 'SLD', 'ID', 'ASD'], fade: 'behavior'
});

MM('ef-mm-01', 'Bringing required materials to class',
  'Given a daily materials check in each class',
  'have every required material present at the start of class',
  'accuracy', 90, [4, 5],
  ['bring the required materials with an adult reminder',
   'bring the required materials using a written checklist',
   'bring every required material with no reminder or checklist']);

MM('ef-mm-02', 'Returning materials and equipment',
  'Given borrowed materials, equipment or a device',
  'return each item to the correct place by the required time',
  'opportunities', 90, [4, 5],
  ['return items when prompted',
   'return items after a written or posted reminder',
   'return every item to the correct place on time without a reminder']);

MM('ef-mm-03', 'Charging and carrying required technology',
  'Given a school-issued device and daily charging expectations',
  'arrive with the device charged and present each day',
  'opportunities', 90, [4, 5],
  ['arrive with the device present',
   'arrive with the device present and charged on most days',
   'arrive with the device present and charged every day for four consecutive weeks']);

MM('ef-mm-04', 'Managing personal belongings across settings',
  'Given movement between classes, settings or job sites',
  'keep track of personal belongings with none lost or left behind',
  'opportunities', 90, [4, 5],
  ['locate belongings with adult help',
   'check for belongings after a visual cue at each transition',
   'keep track of all belongings across the day with no cue'],
  { fade: 'functional' });

MM('ef-mm-05', 'Preparing materials the night before',
  'Given the next day\'s schedule',
  'pack the required materials before the school day begins',
  'opportunities', 85, [4, 5],
  ['pack materials with adult help at home',
   'pack materials using a checklist',
   'pack the required materials independently every night'],
  { fade: 'selfreport' });

// ---- time management ---------------------------------------------------------------------------
const TM = section({
  domain: 'Executive Functioning', sub: 'Time Management', pool: 'ef-time',
  std: 'IL SEL 1C', dx: ['OHI', 'SLD', 'ASD', 'ED'], fade: 'selfreport'
});

TM('ef-tm-01', 'Estimating how long a task will take',
  'Given {nshort} assigned tasks',
  'estimate the time each will take and compare the estimate to the actual time',
  'accuracy', 80, [4, 5],
  ['estimate the time for a familiar task',
   'estimate within 10 minutes of the actual time',
   'estimate within 5 minutes of the actual time for unfamiliar tasks'],
  { note: 'Chronic lateness in adolescence is usually an estimation failure, not a motivation failure — measure the gap between estimate and actual before adding consequences.' });

TM('ef-tm-02', 'Using a timer or schedule to pace work',
  'Given a work period and a timer',
  'set the timer and complete the planned amount of work in the time allowed',
  'opportunities', 85, [4, 5],
  ['use a timer set by an adult',
   'set the timer with a reminder',
   'set and use the timer independently and finish the planned work within it']);

TM('ef-tm-03', 'Meeting assignment deadlines',
  'Given assignments with stated due dates',
  'submit each assignment on or before the due date',
  'opportunities', 85, [4, 5],
  ['submit assignments within two days of the due date',
   'submit assignments within one day of the due date',
   'submit assignments on or before the due date'],
  { pool: 'ef-completion' });

TM('ef-tm-04', 'Planning backward from a deadline',
  'Given a multi-week assignment and a calendar',
  'work backward from the due date to schedule interim steps',
  'opportunities', 85, [3, 4],
  ['identify the due date and the final step',
   'schedule two interim steps working back from the due date',
   'schedule every interim step working back from the due date and meet each one'],
  { bands: ['9-12', '18-22'] });

TM('ef-tm-05', 'Arriving on time to classes and appointments',
  'Given the student\'s daily schedule and appointments',
  'arrive on time to each class and appointment',
  'opportunities', 90, [4, 5],
  ['arrive on time with an adult reminder',
   'arrive on time using an alarm or reminder app',
   'arrive on time to every class and appointment without a reminder'],
  { pool: 'be-attendance', fade: 'behavior' });

TM('ef-tm-06', 'Balancing competing demands across a week',
  'Given a week containing school, work and personal commitments',
  'produce a weekly plan that fits all commitments and follow it',
  'opportunities', 80, [3, 4],
  ['list all commitments for the week',
   'produce a weekly plan that fits all commitments',
   'produce and follow the weekly plan, adjusting it when a conflict arises'],
  { bands: ['9-12', '18-22'] });

// ---- work completion -------------------------------------------------------------------------------
const WC = section({
  domain: 'Executive Functioning', sub: 'Work Completion', pool: 'ef-completion',
  std: 'IL SEL 1C', dx: ['OHI', 'SLD', 'ED', 'ASD', 'ID'], fade: 'behavior'
});

WC('ef-wc-01', 'Completing and submitting assigned work',
  'Given assignments across all classes',
  'complete and submit each assignment',
  'opportunities', 85, [4, 5],
  ['submit at least two thirds of assigned work',
   'submit at least 80% of assigned work',
   'submit at least the target percentage of assigned work for four consecutive weeks']);

WC('ef-wc-02', 'Completing work to the stated requirements',
  'Given an assignment with stated requirements or a rubric',
  'submit work that meets every stated requirement',
  'accuracy', 85, [4, 5],
  ['meet the length or item-count requirement',
   'meet most stated requirements',
   'meet every stated requirement without adult review before submitting']);

WC('ef-wc-03', 'Finishing work within the allotted class time',
  'Given an in-class assignment and the class period',
  'finish the assignment within the period',
  'opportunities', 85, [4, 5],
  ['finish with additional time provided',
   'finish within the period with pacing prompts',
   'finish within the period without pacing prompts']);

WC('ef-wc-04', 'Making up missed work after an absence',
  'Given work missed during an absence',
  'obtain and complete the missed work within the allowed window',
  'opportunities', 85, [3, 4],
  ['obtain the list of missed work with adult help',
   'obtain the list independently and complete part of the work',
   'obtain and complete all missed work within the allowed window']);

WC('ef-wc-05', 'Working independently for a sustained period',
  'Given an independent work period in {setting}',
  'work continuously on the task for the target number of minutes',
  'duration', { '6-8': 15, '9-12': 20, '18-22': 25 }, [4, 5],
  ['work continuously for longer than the baseline average',
   'work continuously for three quarters of the target time',
   'work continuously for the full target time with no adult redirection'],
  { pool: 'be-tally' });

WC('ef-wc-06', 'Checking work before submitting',
  'Given completed work and a checking routine',
  'complete the checking routine before submitting',
  'opportunities', 85, [4, 5],
  ['complete the checking routine when prompted',
   'complete the checking routine using a written checklist',
   'complete the checking routine independently before every submission']);

WC('ef-wc-07', 'Tracking own grades and missing work',
  'Given access to the online gradebook',
  'check the gradebook weekly and list missing assignments',
  'opportunities', 85, [3, 4],
  ['check the gradebook when prompted by an adult',
   'check the gradebook weekly and identify missing work',
   'check weekly, identify missing work and make a plan to complete it'],
  { fade: 'selfreport', bands: ['6-8', '9-12'] });

// ---- self-monitoring -----------------------------------------------------------------------------------
const SM = section({
  domain: 'Executive Functioning', sub: 'Self-Monitoring', pool: 'ef-monitoring',
  std: 'IL SEL 1A', dx: ['OHI', 'SLD', 'ASD', 'ED', 'TBI'], fade: 'selfreport'
});

SM('ef-sm-01', 'Using a self-monitoring checklist during work',
  'Given a self-monitoring checklist and a work period',
  'record on-task status at each interval and total the results',
  'opportunities', 85, [4, 5],
  ['record at each interval when an adult signals',
   'record at each interval when a timer signals',
   'record at every interval and total the results independently']);

SM('ef-sm-02', 'Rating own performance accurately',
  'Given the student\'s self-rating and the adult\'s rating of the same work period',
  'produce a self-rating that matches the adult rating',
  'accuracy', 85, [4, 5],
  ['produce a self-rating within two points of the adult rating',
   'produce a self-rating within one point of the adult rating',
   'produce a self-rating that matches the adult rating'],
  { note: 'Rating accuracy is the skill that makes every other self-monitoring goal trustworthy; a student who rates themselves at 5 every day is not monitoring.' });

SM('ef-sm-03', 'Noticing and correcting off-task behavior',
  'Given an independent work period',
  'notice off-task behavior and return to work without an adult prompt',
  'opportunities', 85, [4, 5],
  ['return to work after an adult prompt',
   'return to work after a self-monitoring signal',
   'notice off-task behavior and return to work with no external signal']);

SM('ef-sm-04', 'Reviewing own progress data',
  'Given the student\'s own progress monitoring graph',
  'state the trend and whether the current strategy is working',
  'accuracy', 85, [3, 4],
  ['state the most recent data point',
   'state whether the trend is rising, flat or falling',
   'state the trend and whether the current strategy should continue or change'],
  { fade: 'academic' });

SM('ef-sm-05', 'Adjusting strategy when progress stalls',
  'Given progress data showing a flat or falling trend',
  'select a different strategy and state why it might work better',
  'accuracy', 80, [3, 4],
  ['identify that progress has stalled',
   'select a different strategy from a list',
   'select a different strategy and explain why it addresses the specific problem'],
  { fade: 'academic', bands: ['9-12', '18-22'] });

// ---- planning & prioritizing -------------------------------------------------------------------------------
const PP = section({
  domain: 'Executive Functioning', sub: 'Planning & Prioritizing', pool: 'ef-planning',
  std: 'IL SEL 1C', dx: ['OHI', 'SLD', 'ASD', 'TBI'], fade: 'academic'
});

PP('ef-pp-01', 'Prioritizing tasks by urgency and importance',
  'Given a list of {nshort} competing tasks with deadlines',
  'rank the tasks in the order they should be done and justify the order',
  'accuracy', 85, [4, 5],
  ['identify which task is due first',
   'rank tasks by deadline',
   'rank tasks by deadline and importance together and justify the ranking']);

PP('ef-pp-02', 'Breaking a large task into steps',
  'Given a multi-step assignment or project',
  'list the steps required and put them in a workable order',
  'accuracy', 85, [4, 5],
  ['list three steps of a task',
   'list all the steps of a task',
   'list all steps in a workable order with a time estimate for each']);

PP('ef-pp-03', 'Anticipating obstacles and planning around them',
  'Given a plan and a set of possible obstacles',
  'identify what could go wrong and state a backup plan',
  'accuracy', 80, [3, 4],
  ['identify one thing that could go wrong',
   'identify obstacles and one backup plan',
   'identify obstacles, backup plans and the point at which to switch to the backup'],
  { bands: ['9-12', '18-22'] });

PP('ef-pp-04', 'Sequencing steps of a multi-part task',
  'Given the steps of a task in random order',
  'place the steps in a workable sequence',
  'accuracy', 90, [4, 5],
  ['sequence four steps of a familiar task',
   'sequence all the steps of a familiar task',
   'sequence the steps of an unfamiliar task and explain why the order matters']);

PP('ef-pp-05', 'Deciding when a plan needs to change',
  'Given a plan in progress that is not working',
  'state what is not working and revise the plan',
  'accuracy', 80, [3, 4],
  ['state that the plan is not working',
   'state which part of the plan is not working',
   'state what is not working and produce a revised plan']);

// ---- working memory strategies ---------------------------------------------------------------------------------
const WM = section({
  domain: 'Executive Functioning', sub: 'Working Memory Strategies', pool: 'ef-memory',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'TBI', 'ID', 'ASD'], fade: 'academic'
});

WM('ef-wm-01', 'Writing down information rather than holding it',
  'Given multi-part oral information such as directions or a schedule change',
  'record the information in writing at the time it is given',
  'opportunities', 85, [4, 5],
  ['record the information when an adult prompts',
   'record the information after a posted cue',
   'record multi-part information in writing every time without a prompt'],
  { fade: 'behavior' });

WM('ef-wm-02', 'Using a memory strategy to hold information',
  'Given information the student must hold across a short delay',
  'use a taught strategy such as rehearsal, chunking or visualisation to recall it',
  'accuracy', 85, [4, 5],
  ['name the taught memory strategies',
   'use a strategy when an adult names it',
   'select and use an effective strategy without adult direction']);

WM('ef-wm-03', 'Following multi-step instructions accurately',
  'Given oral instructions containing three or more steps',
  'complete all the steps in order without asking for a repeat',
  'accuracy', 85, [4, 5],
  ['complete two-step instructions',
   'complete three-step instructions',
   'complete four-step instructions in order with no repeat requested']);

WM('ef-wm-04', 'Using external supports to reduce memory load',
  'Given tasks that exceed what the student can hold in mind',
  'use checklists, notes or reminder tools rather than relying on memory',
  'opportunities', 85, [4, 5],
  ['use a support tool when an adult provides it',
   'select an appropriate support tool with a reminder',
   'select and use an appropriate support tool independently'],
  { fade: 'behavior',
    note: 'The goal is not a bigger working memory — it is a student who reaches for a tool. Score tool use, not recall.' });

WM('ef-wm-05', 'Holding a goal in mind while working',
  'Given a multi-step task and a stated goal',
  'complete the task without losing track of the original goal',
  'opportunities', 85, [4, 5],
  ['restate the goal when an adult asks mid-task',
   'restate the goal from a written reminder mid-task',
   'complete the task and restate the original goal without any reminder']);

module.exports = collect(TI, OR, MM, TM, WC, SM, PP, WM);
