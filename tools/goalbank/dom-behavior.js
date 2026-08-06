// =============================================================
// Ace Manager — goal taxonomy: Behavior
// =============================================================
// Behaviour goals are written as what the student WILL DO, not as what they
// will stop doing. Illinois FBA/BIP practice requires an identified replacement
// behaviour that serves the same function; a goal phrased only as a reduction
// gives the team nothing to teach. The few reduction goals here are paired with
// an acquisition goal by design and carry a decreasing direction so the graph
// reads correctly.
//
// Standards reference the Illinois Social/Emotional Learning Standards, which
// are the ones an Illinois IEP cites for behaviour and SEL goals.

'use strict';
const { section, collect } = require('./dsl');

// ---- self-regulation ------------------------------------------------------------
const SR = section({
  domain: 'Behavior', sub: 'Self-Regulation', pool: 'be-regulation',
  std: 'IL SEL 1B', dx: ['ED', 'ASD', 'OHI', 'SLD', 'TBI'], fade: 'behavior'
});

SR('bh-sr-01', 'Using a taught calming strategy when escalating',
  'Given a situation in {setting} that raises frustration or anxiety',
  'use a taught calming strategy before the behavior escalates',
  'opportunities', 85, [4, 5],
  ['name the taught calming strategies on request',
   'use a calming strategy when an adult prompts it',
   'use a calming strategy independently at the first sign of escalation']);

SR('bh-sr-02', 'Requesting a break appropriately',
  'Given a situation in which the student needs to leave the task or setting',
  'request a break using the agreed signal and return within the agreed time',
  'opportunities', 85, [4, 5],
  ['use the break signal when prompted by an adult',
   'use the break signal independently',
   'request a break independently and return within the agreed time without a prompt'],
  { note: 'A break goal without a return criterion trains escape; the returning half is the part that makes it a skill rather than a loophole.' });

SR('bh-sr-03', 'Recognising and naming own escalation early',
  'Given a rating scale and a situation that raises arousal',
  'identify the current level of escalation and name it before the top of the scale',
  'opportunities', 80, [4, 5],
  ['name the current level when an adult asks',
   'name the current level without being asked when at the midpoint',
   'name the level and choose a matching strategy before reaching the top of the scale']);

SR('bh-sr-04', 'Accepting correction or a "no" answer',
  'Given a correction, redirection or denied request',
  'respond with an acknowledgment and continue the activity',
  'opportunities', 85, [4, 5],
  ['respond without raised voice or leaving the area',
   'respond with a verbal acknowledgment',
   'acknowledge the correction and resume the activity within one minute']);

SR('bh-sr-05', 'Reducing disruptive outbursts',
  'Given a full class period in {setting}',
  'participate with disruptive outbursts at or below the target rate',
  'frequency', 1, [4, 5],
  ['participate with outbursts reduced from the baseline rate',
   'participate with outbursts at half the baseline rate',
   'participate with no more than the target number of outbursts per period'],
  { pool: 'be-tally', note: 'Pair this with an acquisition goal — a reduction target alone tells the team what to count, not what to teach.' });

SR('bh-sr-06', 'Transitioning between activities and settings',
  'Given a transition between activities or settings',
  'end the current activity and begin the next within the expected time',
  'opportunities', 85, [4, 5],
  ['transition with an adult prompt and a visual timer',
   'transition with a visual timer only',
   'transition independently within the expected time across the school day']);

SR('bh-sr-07', 'Tolerating changes to a routine or schedule',
  'Given an unexpected change to the schedule or routine',
  'accept the change and continue with the new plan',
  'opportunities', 80, [4, 5],
  ['accept a change when given advance warning and an adult explanation',
   'accept a change when given advance warning only',
   'accept an unannounced change and continue without escalation'],
  { dx: ['ASD', 'ED', 'OHI'] });

// ---- following directions ----------------------------------------------------------
const FD = section({
  domain: 'Behavior', sub: 'Following Directions', pool: 'be-directions',
  std: 'IL SEL 2C', dx: ['ED', 'OHI', 'ASD', 'ID', 'SLD'], fade: 'behavior'
});

FD('bh-fd-01', 'Following adult directions the first time',
  'Given an adult direction in {setting}',
  'begin following the direction within 30 seconds of the first request',
  'opportunities', 85, [4, 5],
  ['follow the direction after two requests',
   'follow the direction after one repeat',
   'follow the direction the first time it is given']);

FD('bh-fd-02', 'Following directions during preferred activities',
  'Given a direction to stop or change a preferred activity',
  'comply within the expected time without argument',
  'opportunities', 80, [4, 5],
  ['comply after a warning and a second request',
   'comply after a single warning',
   'comply on the first request during a preferred activity']);

FD('bh-fd-03', 'Following group directions without individual prompting',
  'Given a direction given to the whole class',
  'follow the direction without needing it repeated individually',
  'opportunities', 85, [4, 5],
  ['follow a group direction after an individual repeat',
   'follow a group direction after a nonverbal cue',
   'follow group directions with no individual prompt']);

FD('bh-fd-04', 'Reducing the number of prompts needed to start work',
  'Given an assigned task in {setting}',
  'begin the task with no more than the target number of adult prompts',
  'prompts', 1, [4, 5],
  ['begin the task with fewer prompts than the baseline average',
   'begin the task with two or fewer prompts',
   'begin the task with no more than one prompt'],
  { pool: 'be-tally' });

FD('bh-fd-05', 'Following safety directions immediately',
  'Given a safety direction in {life}',
  'comply immediately and without question',
  'opportunities', 95, [4, 5],
  ['comply with a safety direction after one repeat',
   'comply with a safety direction on the first request in familiar settings',
   'comply immediately with safety directions in any setting, including from unfamiliar adults'],
  { fade: 'functional',
    note: 'Safety compliance is the one place immediate, unquestioning response is the target — hold it to a higher criterion and generalise it to unfamiliar adults.' });

FD('bh-fd-06', 'Following a written or visual schedule',
  'Given a written or visual daily schedule',
  'move to each scheduled activity at the scheduled time',
  'opportunities', 90, [4, 5],
  ['follow the schedule with adult prompting at each transition',
   'follow the schedule after checking it when prompted',
   'check and follow the schedule independently across the full day']);

// ---- classroom expectations --------------------------------------------------------------
const CE = section({
  domain: 'Behavior', sub: 'Classroom Expectations', pool: 'be-expectations',
  std: 'IL SEL 2C', dx: ['ED', 'OHI', 'ASD', 'SLD', 'ID'], fade: 'behavior'
});

CE('bh-ce-01', 'Remaining in the assigned area',
  'Given a full class period in {setting}',
  'remain in the assigned area except when permission is given',
  'opportunities', 90, [4, 5],
  ['remain in the area with an adult prompt',
   'remain in the area with a visual reminder',
   'remain in the assigned area independently for the full period']);

CE('bh-ce-02', 'Raising a hand and waiting to be called on',
  'Given a class discussion or question in {setting}',
  'raise a hand and wait to be called on before speaking',
  'opportunities', 85, [4, 5],
  ['raise a hand when reminded',
   'raise a hand independently but call out occasionally',
   'raise a hand and wait to be called on across the full period']);

CE('bh-ce-03', 'Arriving to class on time and prepared',
  'Given the daily class schedule',
  'arrive before the bell with the required materials',
  'opportunities', 90, [4, 5],
  ['arrive on time with a reminder from an adult',
   'arrive on time with the required materials on most days',
   'arrive on time and prepared for every class']);

CE('bh-ce-04', 'Using respectful language with adults and peers',
  'Given interactions across the school day',
  'use respectful language, including during disagreement',
  'opportunities', 90, [4, 5],
  ['use respectful language when calm',
   'use respectful language when redirected',
   'use respectful language during disagreement and frustration']);

CE('bh-ce-05', 'Using technology according to classroom rules',
  'Given access to a device during instruction',
  'use the device only for the assigned task',
  'opportunities', 90, [4, 5],
  ['return to the assigned task when prompted',
   'stay on the assigned task with a visual reminder',
   'use the device only for the assigned task without any reminder']);

CE('bh-ce-06', 'Participating in class activities',
  'Given a class period containing opportunities to participate',
  'contribute to the activity at least the target number of times',
  'opportunities', 85, [4, 5],
  ['participate when directly invited by the teacher',
   'participate at least once per period without being invited',
   'participate at least three times per period without being invited']);

CE('bh-ce-07', 'Remaining engaged during independent work',
  'Given an independent work period in {setting}',
  'remain engaged with the task for the full work period',
  'intervals', 85, [4, 5],
  ['remain engaged for half of the observed intervals',
   'remain engaged for most of the observed intervals',
   'remain engaged for the target percentage of intervals across the full work period'],
  { pool: 'be-tally',
    note: 'Momentary time sampling is what makes "on task" a number rather than an impression; set the interval before the baseline, not after.' });

// ---- conflict resolution ---------------------------------------------------------------------
const CR = section({
  domain: 'Behavior', sub: 'Conflict Resolution', pool: 'be-conflict',
  std: 'IL SEL 2D', dx: ['ED', 'ASD', 'OHI', 'SLD'], fade: 'behavior'
});

CR('bh-cr-01', 'Using a conflict resolution routine with peers',
  'Given a peer conflict in {setting}',
  'use the taught conflict resolution steps to reach a resolution',
  'opportunities', 80, [4, 5],
  ['state the conflict resolution steps on request',
   'use the steps with adult facilitation',
   'use the steps independently to resolve a peer conflict']);

CR('bh-cr-02', 'Walking away from provocation',
  'Given a provoking comment or action from {peer}',
  'disengage and move away without escalating',
  'opportunities', 85, [4, 5],
  ['disengage when an adult intervenes',
   'disengage after a nonverbal adult signal',
   'disengage independently without responding to the provocation']);

CR('bh-cr-03', 'Reporting a problem to an adult instead of retaliating',
  'Given a conflict the student cannot resolve alone',
  'report the problem to an adult rather than responding physically or verbally',
  'opportunities', 85, [4, 5],
  ['report the problem after an adult notices the conflict',
   'report the problem to a preferred adult',
   'report the problem to any available adult before responding']);

CR('bh-cr-04', 'Accepting responsibility and repairing after a conflict',
  'Given a conflict in which the student contributed to the problem',
  'state their own part in the conflict and complete an agreed repair',
  'opportunities', 80, [3, 4],
  ['state what happened without blaming only the other person',
   'state their own part in the conflict when asked',
   'state their own part and complete the agreed repair without prompting']);

CR('bh-cr-05', 'Responding to teasing or exclusion',
  'Given a situation involving teasing or exclusion',
  'use a taught response that does not escalate the situation',
  'opportunities', 80, [4, 5],
  ['name two responses that do not escalate',
   'use a taught response with adult support nearby',
   'use a taught response independently in a real situation']);

// ---- attendance & participation -------------------------------------------------------------------
const AT = section({
  domain: 'Behavior', sub: 'Attendance & Engagement', pool: 'be-attendance',
  std: 'IL SEL 3A', dx: ['ED', 'OHI', 'SLD', 'ASD'], fade: 'behavior'
});

AT('bh-at-01', 'Attending scheduled classes',
  'Given the student\'s daily class schedule',
  'attend every scheduled class period',
  'opportunities', 90, [4, 5],
  ['attend at least three quarters of scheduled periods',
   'attend at least 85% of scheduled periods',
   'attend at least the target percentage of scheduled periods for four consecutive weeks']);

AT('bh-at-02', 'Returning to class after a break or pass',
  'Given a hall pass, break or lunch period',
  'return to class within the agreed time',
  'opportunities', 90, [4, 5],
  ['return within the agreed time when an adult checks in',
   'return within the agreed time with a timer',
   'return within the agreed time independently every time']);

AT('bh-at-03', 'Remaining in class for the full period',
  'Given a full class period',
  'remain in class for the entire period without leaving early',
  'opportunities', 90, [4, 5],
  ['remain in class with one adult check-in',
   'remain in class using an agreed in-class break instead of leaving',
   'remain in class for the full period without leaving']);

AT('bh-at-04', 'Re-entering school after an absence',
  'Given a return to school after an absence',
  'complete the re-entry routine and collect missed work on the first day back',
  'opportunities', 85, [3, 4],
  ['complete the re-entry routine with adult support',
   'complete the re-entry routine with a written checklist',
   'complete the routine and collect missed work independently on the day of return']);

// ---- replacement behavior ---------------------------------------------------------------------------
const RB = section({
  domain: 'Behavior', sub: 'Replacement Behavior', pool: 'be-replacement',
  std: 'IL SEL 1B', dx: ['ED', 'ASD', 'ID', 'MD', 'OHI'], fade: 'behavior'
});

RB('bh-rb-01', 'Using a functionally equivalent replacement behavior',
  'Given the antecedent conditions identified in the functional behavior assessment',
  'use the identified replacement behavior instead of the target behavior',
  'opportunities', 85, [4, 5],
  ['use the replacement behavior when an adult prompts it',
   'use the replacement behavior after a nonverbal cue',
   'use the replacement behavior independently at the identified antecedent'],
  { note: 'The replacement has to get the student the same thing the target behaviour got, and get it faster — otherwise the plan is asking them to accept a worse deal.' });

RB('bh-rb-02', 'Reducing the target behavior identified in the BIP',
  'Given the observation window identified in the behavior intervention plan',
  'participate with the target behavior at or below the agreed rate',
  'frequency', 1, [4, 5],
  ['participate with the target behavior below the baseline rate',
   'participate with the target behavior at half the baseline rate',
   'participate with the target behavior at or below the agreed rate']);

RB('bh-rb-03', 'Escaping a demand appropriately rather than through behavior',
  'Given a task the student finds difficult or aversive',
  'use the agreed escape signal rather than the target behavior',
  'opportunities', 85, [4, 5],
  ['use the escape signal when prompted',
   'use the escape signal independently',
   'use the escape signal independently and return to the task within the agreed time']);

RB('bh-rb-04', 'Gaining adult attention appropriately',
  'Given a need for adult attention or help in {setting}',
  'use the agreed signal to gain attention rather than the target behavior',
  'opportunities', 85, [4, 5],
  ['use the agreed signal when prompted',
   'use the agreed signal independently in the primary setting',
   'use the agreed signal independently across all settings and adults']);

RB('bh-rb-05', 'Maintaining reduced behavior across settings',
  'Given the school day across all settings and adults',
  'maintain the replacement behavior outside the setting where it was taught',
  'opportunities', 80, [4, 5],
  ['use the replacement behavior in the setting where it was taught',
   'use the replacement behavior in a second setting',
   'use the replacement behavior across all settings and with unfamiliar adults'],
  { bands: ['9-12', '18-22'] });

module.exports = collect(SR, FD, CE, CR, AT, RB);
