// =============================================================
// Ace Manager — goal taxonomy: Social/Emotional
// =============================================================
// Cited against the Illinois Social/Emotional Learning Standards (Goal 1 self-
// awareness and self-management, Goal 2 social awareness and relationships,
// Goal 3 decision-making), which is what an Illinois IEP references for this
// domain.

'use strict';
const { section, collect } = require('./dsl');

// ---- coping skills ---------------------------------------------------------------
const CS = section({
  domain: 'Social/Emotional', sub: 'Coping Skills', pool: 'se-coping',
  std: 'IL SEL 1B', dx: ['ED', 'ASD', 'OHI', 'SLD', 'TBI'], fade: 'selfreport'
});

CS('se-cs-01', 'Using a coping strategy when anxious or upset',
  'Given a situation in {life} that raises anxiety or distress',
  'select and use a coping strategy from the student\'s own plan',
  'opportunities', 85, [4, 5],
  ['name three coping strategies from the plan',
   'use a coping strategy when an adult suggests it',
   'select and use an effective coping strategy without a suggestion']);

CS('se-cs-02', 'Identifying personal triggers',
  'Given a review of recent difficult situations',
  'name the situations and internal signals that precede distress',
  'accuracy', 85, [3, 4],
  ['name one situation that reliably leads to distress',
   'name three triggers and the physical signals that accompany them',
   'name triggers, early signals and the strategy that matches each']);

CS('se-cs-03', 'Using a self-calming routine to return to work',
  'Given a distressing event during the school day',
  'complete the calming routine and return to the task within the agreed time',
  'opportunities', 85, [4, 5],
  ['complete the routine with adult support',
   'complete the routine with a written or visual reminder',
   'complete the routine and return to the task within the agreed time independently']);

CS('se-cs-04', 'Managing test and performance anxiety',
  'Given a test, presentation or evaluated task',
  'use a taught strategy and complete the task',
  'opportunities', 85, [3, 4],
  ['begin the task after adult reassurance',
   'use a taught anxiety strategy and begin the task',
   'use a strategy and complete the evaluated task without leaving or shutting down'],
  { bands: ['6-8', '9-12'] });

CS('se-cs-05', 'Reaching out to a support person',
  'Given a situation the student cannot manage alone',
  'contact an identified support person and state what is needed',
  'opportunities', 85, [3, 4],
  ['name the identified support people',
   'contact a support person when prompted',
   'contact a support person independently and state what is needed']);

CS('se-cs-06', 'Managing sensory overload',
  'Given an environment that produces sensory overload',
  'use an agreed sensory strategy and remain in or return to the activity',
  'opportunities', 85, [4, 5],
  ['use a sensory strategy when an adult offers it',
   'request the sensory strategy when needed',
   'use the strategy independently and return to the activity'],
  { dx: ['ASD', 'MD', 'OHI', 'SLI'] });

// ---- peer interaction ---------------------------------------------------------------
const PI = section({
  domain: 'Social/Emotional', sub: 'Peer Interaction', pool: 'se-peer',
  std: 'IL SEL 2B', dx: ['ASD', 'ED', 'SLI', 'ID', 'OHI'], fade: 'behavior'
});

PI('se-pi-01', 'Joining an existing peer activity',
  'Given an unstructured time with peers already engaged in an activity',
  'use a taught entry strategy to join the activity',
  'opportunities', 80, [4, 5],
  ['name two ways to join an activity',
   'join an activity with adult facilitation',
   'join an activity independently using an appropriate entry strategy']);

PI('se-pi-02', 'Working cooperatively in a group task',
  'Given an assigned group task in {setting}',
  'complete the assigned role and contribute to the group product',
  'opportunities', 85, [3, 4],
  ['complete an assigned role with adult check-ins',
   'complete an assigned role and contribute at least one idea',
   'complete the role, contribute ideas and help resolve a group disagreement']);

PI('se-pi-03', 'Giving and receiving compliments and feedback',
  'Given a peer interaction in which feedback or a compliment is appropriate',
  'give and accept feedback appropriately',
  'opportunities', 85, [4, 5],
  ['accept a compliment with an appropriate response',
   'give a genuine compliment to a peer',
   'give and receive both compliments and constructive feedback appropriately']);

PI('se-pi-04', 'Maintaining a friendship over time',
  'Given ongoing opportunities to interact with the same peers',
  'initiate contact and follow through on shared plans',
  'opportunities', 80, [3, 4],
  ['identify a peer the student would like to spend time with',
   'initiate contact with a peer at least once a week',
   'initiate contact and follow through on a shared plan without adult facilitation'],
  { bands: ['9-12', '18-22'] });

PI('se-pi-05', 'Recognising safe and unsafe peer situations',
  'Given descriptions of peer situations, including unsafe ones',
  'identify which situations are unsafe and state the appropriate response',
  'accuracy', 90, [4, 5],
  ['identify clearly unsafe peer situations',
   'identify unsafe situations involving pressure or manipulation',
   'identify unsafe situations and state a specific plan for leaving each one'],
  { fade: 'academic', std: 'IL SEL 3B' });

PI('se-pi-06', 'Respecting personal space and boundaries',
  'Given interactions with peers and adults across the school day',
  'maintain appropriate physical distance and respect stated boundaries',
  'opportunities', 90, [4, 5],
  ['adjust distance when an adult prompts',
   'adjust distance after a nonverbal cue',
   'maintain appropriate distance and respect boundaries without a cue'],
  { dx: ['ASD', 'ID', 'MD', 'ED'] });

// ---- emotional identification --------------------------------------------------------------
const EI = section({
  domain: 'Social/Emotional', sub: 'Emotional Identification', pool: 'se-emotion',
  std: 'IL SEL 1A', dx: ['ASD', 'ED', 'SLI', 'ID', 'TBI'], fade: 'academic'
});

EI('se-ei-01', 'Naming own emotions',
  'Given a situation or a review of the school day',
  'name the emotion felt and the situation that produced it',
  'accuracy', 85, [4, 5],
  ['name basic emotions from a choice of four',
   'name the emotion felt in a situation without a choice list',
   'name the emotion, its intensity and the situation that produced it']);

EI('se-ei-02', 'Recognising emotions in others',
  'Given photographs, video or live social situations',
  'identify the emotion the other person is showing and the evidence for it',
  'accuracy', 85, [4, 5],
  ['identify basic emotions from facial expression',
   'identify emotions from facial expression, posture and tone together',
   'identify emotions in ambiguous situations and state the evidence used'],
  { std: 'IL SEL 2A' });

EI('se-ei-03', 'Rating emotional intensity',
  'Given a five-point intensity scale and a described situation',
  'rate the intensity of the emotion and justify the rating',
  'accuracy', 85, [4, 5],
  ['place an emotion on the scale with adult support',
   'rate emotional intensity independently',
   'rate intensity and match a strategy appropriate to that level']);

EI('se-ei-04', 'Connecting emotions to physical signals',
  'Given a body signal or a described situation',
  'name the physical signal and the emotion it usually accompanies',
  'accuracy', 85, [4, 5],
  ['name one physical signal of a strong emotion',
   'match three physical signals to the emotions they accompany',
   'notice a physical signal in the moment and name the emotion before it escalates']);

EI('se-ei-05', 'Expressing emotions in words rather than behavior',
  'Given a situation producing a strong emotion',
  'state the emotion in words rather than acting on it',
  'opportunities', 80, [4, 5],
  ['state the emotion when an adult asks',
   'state the emotion after an adult signal',
   'state the emotion in words independently before acting on it'],
  { fade: 'behavior' });

// ---- frustration tolerance -----------------------------------------------------------------------
const FT = section({
  domain: 'Social/Emotional', sub: 'Frustration Tolerance', pool: 'se-frustration',
  std: 'IL SEL 1B', dx: ['ED', 'ASD', 'SLD', 'OHI', 'TBI'], fade: 'selfreport'
});

FT('se-ft-01', 'Persisting with difficult work',
  'Given an assigned task the student finds difficult',
  'continue working for the full work period rather than stopping',
  'opportunities', 85, [4, 5],
  ['continue working after adult encouragement',
   'continue working after using a taught strategy',
   'continue working for the full period without adult encouragement']);

FT('se-ft-02', 'Asking for help instead of giving up',
  'Given a task the student cannot complete alone',
  'ask a specific help question rather than stopping or disrupting',
  'opportunities', 85, [4, 5],
  ['signal that help is needed',
   'ask a general help question',
   'ask a specific question naming exactly what is not understood']);

FT('se-ft-03', 'Accepting mistakes and correcting work',
  'Given returned work containing errors',
  'accept the correction and revise the work',
  'opportunities', 85, [4, 5],
  ['accept returned work without a negative reaction',
   'accept the correction and begin revising with support',
   'accept the correction and complete the revision independently']);

FT('se-ft-04', 'Tolerating waiting and delayed reinforcement',
  'Given a situation requiring the student to wait',
  'wait for the required time using an agreed waiting strategy',
  'duration', { '6-8': 10, '9-12': 15, '18-22': 15 }, [4, 5],
  ['wait with an adult present and a visual timer',
   'wait with a visual timer only',
   'wait for the full required time using a self-selected strategy'],
  { pool: 'be-tally' });

FT('se-ft-05', 'Responding to losing or not getting a preferred outcome',
  'Given a game, competition or decision that does not go the student\'s way',
  'respond appropriately and remain in the activity',
  'opportunities', 85, [4, 5],
  ['remain in the activity with adult support',
   'respond appropriately with a nonverbal adult cue',
   'respond appropriately and remain in the activity without any cue']);

FT('se-ft-06', 'Working through a task with unclear directions',
  'Given a task whose directions are incomplete or ambiguous',
  'use a strategy to proceed rather than stopping',
  'opportunities', 80, [4, 5],
  ['state that the directions are unclear rather than stopping silently',
   'reread the directions and attempt the first step',
   'reread, attempt, and ask a specific clarifying question if still stuck']);

// ---- perspective taking ---------------------------------------------------------------------------
const PT = section({
  domain: 'Social/Emotional', sub: 'Perspective Taking', pool: 'se-perspective',
  std: 'IL SEL 2A', dx: ['ASD', 'ED', 'TBI', 'SLI'], fade: 'academic'
});

PT('se-pt-01', 'Identifying another person\'s point of view',
  'Given a described or observed social situation',
  'state what the other person was thinking or wanting',
  'accuracy', 80, [4, 5],
  ['state what the other person did',
   'state what the other person was feeling',
   'state what the other person was thinking or wanting and the evidence for it']);

PT('se-pt-02', 'Predicting how an action will affect others',
  'Given a described action in a social situation',
  'state the likely effect of the action on the other people involved',
  'accuracy', 80, [4, 5],
  ['state whether an action would make someone feel better or worse',
   'state the likely effect of an action on one other person',
   'state the likely effect on several people and choose the action with the best outcome']);

PT('se-pt-03', 'Recognising that others hold different preferences and beliefs',
  'Given situations in which people disagree',
  'state each person\'s position and why they hold it',
  'accuracy', 80, [4, 5],
  ['state that two people want different things',
   'state each person\'s position in a disagreement',
   'state each position, the reason behind it, and a solution that respects both']);

PT('se-pt-04', 'Interpreting social situations with ambiguous intent',
  'Given a social situation in which another person\'s intent is unclear',
  'generate more than one explanation and identify the most likely one',
  'accuracy', 80, [4, 5],
  ['generate one explanation for an ambiguous action',
   'generate two possible explanations',
   'generate multiple explanations and choose the most likely using the evidence'],
  { bands: ['9-12', '18-22'],
    note: 'Jumping to hostile intent is the pattern that drives most adolescent conflict; generating a second explanation is the teachable step.' });

PT('se-pt-05', 'Apologising and repairing meaningfully',
  'Given a situation in which the student\'s action affected someone else',
  'state what happened, its effect on the other person, and what will change',
  'rubric', 3, [3, 4],
  ['state what happened',
   'state what happened and how it affected the other person',
   'state what happened, its effect, and a specific change, without prompting'],
  { pool: 'co-expressive' });

// ---- resilience & self-concept -------------------------------------------------------------------------
const RC = section({
  domain: 'Social/Emotional', sub: 'Resilience & Self-Concept', pool: 'se-resilience',
  std: 'IL SEL 1C', dx: ['ED', 'SLD', 'OHI', 'ASD'], fade: 'selfreport'
});

RC('se-rc-01', 'Identifying personal strengths',
  'Given a strengths inventory or reflection prompt',
  'name personal strengths and give an example of each',
  'accuracy', 85, [3, 4],
  ['name two personal strengths',
   'name four personal strengths with an example of each',
   'name strengths and explain how each one could be used in school or work']);

RC('se-rc-02', 'Using positive self-talk after a setback',
  'Given a setback such as a failed test or a rejected application',
  'use a prepared self-talk statement and identify the next action',
  'opportunities', 80, [3, 4],
  ['state a prepared self-talk statement when prompted',
   'use a self-talk statement after a setback without prompting',
   'use self-talk and independently identify the next action to take']);

RC('se-rc-03', 'Setting and reviewing a personal goal',
  'Given a goal-setting template and a review schedule',
  'set a specific personal goal and review progress on schedule',
  'opportunities', 85, [3, 4],
  ['set a personal goal with adult support',
   'set a specific, measurable personal goal',
   'set the goal, review it on schedule and adjust it based on the result'],
  { std: 'IL SEL 1C' });

RC('se-rc-04', 'Recognising growth and progress over time',
  'Given the student\'s own progress data or work samples',
  'identify the growth shown and name what produced it',
  'accuracy', 85, [3, 4],
  ['state whether the data show growth',
   'state the amount of growth shown',
   'state the growth and name the specific actions that produced it'],
  { fade: 'academic',
    note: 'Students who never see their own progress data conclude they are not improving; showing them the graph is itself an intervention.' });

RC('se-rc-05', 'Making decisions and accepting the consequences',
  'Given a real choice with foreseeable consequences',
  'state the options and consequences, make a choice and accept the result',
  'rubric', 3, [3, 4],
  ['state two options for a decision',
   'state the options and one consequence of each',
   'state the options and consequences, choose, and accept the result without blaming others'],
  { std: 'IL SEL 3B', pool: 'co-expressive', bands: ['9-12', '18-22'] });

RC('se-rc-06', 'Maintaining routines that support wellbeing',
  'Given a self-tracked wellbeing routine covering sleep, activity and connection',
  'complete the routine on the target number of days',
  'opportunities', 80, [3, 4],
  ['complete the routine with daily adult check-ins',
   'complete the routine with a written reminder',
   'complete the routine independently on the target number of days per week'],
  { bands: ['9-12', '18-22'] });

CS('se-cs-07', 'Using a coping strategy that fits the setting',
  'Given distress in a setting where the usual strategy is not available',
  'select a strategy that fits the setting and use it',
  'opportunities', 80, [4, 5],
  ['name a strategy that works in a public setting',
   'use a setting-appropriate strategy when prompted',
   'select and use a setting-appropriate strategy independently across settings']);

PI('se-pi-07', 'Responding to peer pressure',
  'Given peer pressure to do something the student does not want to do',
  'refuse and offer an alternative without escalating',
  'opportunities', 85, [4, 5],
  ['state a refusal',
   'refuse and give a reason',
   'refuse, give a reason, offer an alternative and leave if the pressure continues'],
  { std: 'IL SEL 3B' });

EI('se-ei-06', 'Recognising emotions in written and digital communication',
  'Given {nshort} messages, emails or posts',
  'state the writer\'s likely emotion and the words that signal it',
  'accuracy', 80, [4, 5],
  ['state whether a message sounds positive or negative',
   'state the writer\'s likely emotion',
   'state the emotion, the words signalling it, and where the message could be misread'],
  { note: 'Tone in text is where most adolescent conflict now starts; a student who reads every short reply as anger needs this taught explicitly.' });

module.exports = collect(CS, PI, EI, FT, PT, RC);
