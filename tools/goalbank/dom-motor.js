// =============================================================
// Ace Manager — goal taxonomy: Motor
// =============================================================
// Motor goals are almost entirely adult-scored: nobody self-reports their own
// pencil grasp or gait. Every pool here is an observation pool, and the goals
// are written so an OT, PT or case manager can score them from a rubric or a
// timed sample in the setting where the skill has to work.

'use strict';
const { section, collect } = require('./dsl');

// ---- fine motor ------------------------------------------------------------------
const FM = section({
  domain: 'Motor', sub: 'Fine Motor', pool: 'mo-fine',
  std: 'IL PE 19A', dx: ['MD', 'ID', 'OHI', 'ASD', 'SLD'], fade: 'functional'
});

FM('mo-fm-01', 'Legible handwriting for functional tasks',
  'Given a writing task and lined paper',
  'produce writing a reader unfamiliar with the student can read',
  'accuracy', 90, [4, 5],
  ['produce legible letters in isolation',
   'produce legible words with consistent spacing',
   'produce a legible paragraph an unfamiliar reader can read without help']);

FM('mo-fm-02', 'Sustained handwriting without fatigue',
  'Given an extended writing task',
  'write continuously with legibility maintained throughout',
  'duration', { '6-8': 10, '9-12': 15, '18-22': 15 }, [3, 4],
  ['write legibly for a third of the target time',
   'write legibly for two thirds of the target time',
   'write legibly for the full target time without a break']);

FM('mo-fm-03', 'Using a functional pencil grasp and posture',
  'Given a writing or drawing task',
  'maintain a functional grasp and seated posture throughout',
  'opportunities', 85, [4, 5],
  ['use a functional grasp when an adult sets it up',
   'use a functional grasp after a verbal or visual reminder',
   'maintain a functional grasp and posture with no reminders']);

FM('mo-fm-04', 'Using scissors and cutting tools accurately',
  'Given a cutting task and appropriate tools',
  'cut along the line within the required tolerance',
  'accuracy', 90, [4, 5],
  ['cut along a straight line',
   'cut along curved and angled lines',
   'cut complex shapes within the required tolerance']);

FM('mo-fm-05', 'Manipulating fasteners and small objects',
  'Given clothing fasteners, containers and small objects',
  'manipulate each item successfully',
  'steps', 90, [4, 5],
  ['manipulate large fasteners and containers',
   'manipulate buttons, zippers and snaps',
   'manipulate all required fasteners and small objects independently and within a functional time']);

FM('mo-fm-06', 'Performing bilateral fine motor tasks',
  'Given a task requiring both hands to work together',
  'complete the task using both hands in a coordinated way',
  'steps', 90, [4, 5],
  ['stabilise with one hand while working with the other when set up by an adult',
   'complete two-handed tasks with a task card',
   'complete two-handed tasks independently at a functional speed']);

FM('mo-fm-07', 'Fine motor skills in a work or living task',
  'Given a job or household task requiring fine motor precision',
  'complete the task to the required standard',
  'steps', 90, [4, 5],
  ['complete the task with adult modelling',
   'complete the task using a task card',
   'complete the task to standard independently at the required pace'],
  { pool: 'vo-jobtask', bands: ['9-12', '18-22'] });

// ---- gross motor --------------------------------------------------------------------------
const GM = section({
  domain: 'Motor', sub: 'Gross Motor', pool: 'mo-gross',
  std: 'IL PE 19A', dx: ['MD', 'ID', 'OHI', 'ASD'], fade: 'functional'
});

GM('mo-gm-01', 'Moving safely through the school environment',
  'Given transitions through hallways, stairs and doorways',
  'move safely without contact or loss of balance',
  'opportunities', 90, [4, 5],
  ['move safely with adult support nearby',
   'move safely with a verbal reminder',
   'move safely through all school environments independently']);

GM('mo-gm-02', 'Navigating stairs, curbs and uneven surfaces',
  'Given stairs, curbs and uneven ground',
  'navigate each safely using the required technique or device',
  'steps', 90, [4, 5],
  ['navigate stairs with a handrail and adult support',
   'navigate stairs and curbs with a handrail only',
   'navigate stairs, curbs and uneven surfaces independently and safely']);

GM('mo-gm-03', 'Carrying and transporting items',
  'Given items to carry across a distance',
  'transport the items without dropping them or losing balance',
  'steps', 90, [4, 5],
  ['carry a light item a short distance',
   'carry required items across a room',
   'carry required items across the building or job site safely']);

GM('mo-gm-04', 'Participating in physical activity',
  'Given a physical education or recreation activity',
  'participate for the full activity period',
  'duration', { '6-8': 15, '9-12': 20, '18-22': 20 }, [3, 4],
  ['participate for a third of the activity period',
   'participate for two thirds of the activity period',
   'participate for the full activity period']);

GM('mo-gm-05', 'Building physical endurance for work demands',
  'Given the physical requirements of a work or community task',
  'sustain the activity for the required time',
  'duration', { '9-12': 45, '18-22': 90 }, [3, 4],
  ['sustain the activity for a third of the required time',
   'sustain the activity for two thirds of the required time',
   'sustain the activity for the full required time'],
  { bands: ['9-12', '18-22'], pool: 'vo-stamina' });

GM('mo-gm-06', 'Using a mobility device or adaptive equipment',
  'Given the student\'s mobility device and the school or community environment',
  'use the device correctly across all required settings',
  'steps', 90, [4, 5],
  ['use the device with adult support',
   'use the device independently in familiar settings',
   'use the device independently across unfamiliar settings and surfaces'],
  { dx: ['MD', 'OHI', 'ID'] });

// ---- visual-motor integration ------------------------------------------------------------------
const VM = section({
  domain: 'Motor', sub: 'Visual-Motor Integration', pool: 'mo-visualmotor',
  std: 'IL PE 19A', dx: ['MD', 'ID', 'SLD', 'OHI', 'ASD', 'TBI'], fade: 'academic'
});

VM('mo-vm-01', 'Copying from a board or reference',
  'Given information displayed on a board or reference sheet',
  'copy the information accurately and completely',
  'accuracy', 90, [4, 5],
  ['copy from a reference at the desk',
   'copy from the board with the reference also at the desk',
   'copy accurately and completely from the board within the time allowed']);

VM('mo-vm-02', 'Aligning written work on the page',
  'Given lined or gridded paper and a written task',
  'produce work aligned within the lines or grid',
  'accuracy', 90, [4, 5],
  ['produce work within the lines with a highlighted guide',
   'produce work within the lines on standard paper',
   'align multi-digit computation and written work correctly without a guide']);

VM('mo-vm-03', 'Completing forms and grids accurately',
  'Given a form, answer sheet or data grid',
  'enter each response in the correct field or bubble',
  'accuracy', 95, [4, 5],
  ['enter responses on a large-format form',
   'enter responses on a standard form with a place marker',
   'enter every response in the correct field on a standard form with no marker'],
  { fade: 'functional' });

VM('mo-vm-04', 'Tracking and scanning visual information',
  'Given a page, screen or shelf containing target information',
  'locate the target information systematically',
  'accuracy', 90, [4, 5],
  ['locate information with the target highlighted',
   'locate information using a systematic scanning strategy with a reminder',
   'locate target information systematically with no reminder']);

VM('mo-vm-05', 'Drawing, diagramming and constructing to specification',
  'Given a diagram, drawing or construction task with a specification',
  'produce the product within the stated tolerance',
  'accuracy', 85, [4, 5],
  ['produce the product with a template',
   'produce the product from a model',
   'produce the product from written specifications within tolerance']);

// ---- keyboarding & digital access ------------------------------------------------------------------------
const KB = section({
  domain: 'Motor', sub: 'Keyboarding & Digital Access', pool: 'mo-keyboarding',
  std: 'IL ELA W.{gg}.6', dx: ['MD', 'SLD', 'OHI', 'ID', 'ASD'], fade: 'academic'
});

KB('mo-kb-01', 'Keyboarding rate and accuracy',
  'Given a three-minute typing sample',
  'type at the target rate with at least 95% accuracy',
  'wcpm', { '6-8': 25, '9-12': 35, '18-22': 30 }, [3, 4],
  ['type above the baseline rate with 90% accuracy',
   'type approaching the target rate with 93% accuracy',
   'type at the target rate with 95% accuracy']);

KB('mo-kb-02', 'Using keyboard shortcuts and editing commands',
  'Given a document editing task',
  'use keyboard commands to complete each editing operation',
  'accuracy', 90, [4, 5],
  ['use copy, paste and save commands',
   'use formatting and navigation commands',
   'complete a full editing task using keyboard commands rather than menus']);

KB('mo-kb-03', 'Using speech-to-text to produce written work',
  'Given a writing task and speech-to-text software',
  'produce and correct text using the software',
  'accuracy', 90, [4, 5],
  ['dictate a sentence and check it for errors',
   'dictate a paragraph and correct recognition errors',
   'dictate and fully edit an extended piece independently']);

KB('mo-kb-04', 'Using an alternative access method',
  'Given the student\'s alternative access method and a computer task',
  'complete the task using the access method',
  'steps', 90, [4, 5],
  ['complete a task with adult setup and support',
   'complete a task with the access method already configured',
   'configure and use the access method independently to complete the task'],
  { dx: ['MD', 'OHI', 'ID'] });

KB('mo-kb-05', 'Maintaining ergonomic positioning at a workstation',
  'Given a computer workstation and an extended work session',
  'maintain the prescribed positioning throughout the session',
  'opportunities', 85, [4, 5],
  ['maintain positioning when set up by an adult',
   'maintain positioning after a reminder',
   'set up and maintain correct positioning independently for the full session'],
  { fade: 'behavior', bands: ['9-12', '18-22'] });

FM('mo-fm-08', 'Fine motor skills for personal care',
  'Given personal care tasks requiring fine motor control',
  'complete each task to a functional standard',
  'steps', 90, [4, 5],
  ['complete the task with hand-over-hand support',
   'complete the task with a task card and adult nearby',
   'complete every personal care task independently to a functional standard']);

FM('mo-fm-09', 'Handwriting speed for note-taking and tests',
  'Given a timed copying task',
  'write legibly at a speed that keeps pace with instruction',
  'wcpm', { '6-8': 15, '9-12': 20, '18-22': 18 }, [3, 4],
  ['write legibly above the baseline rate',
   'write legibly approaching the target rate',
   'write legibly at the target rate while maintaining letter formation']);

GM('mo-gm-07', 'Balance and postural control during daily activities',
  'Given activities requiring standing balance and postural control',
  'maintain balance without loss of stability or external support',
  'opportunities', 90, [4, 5],
  ['maintain balance with adult support available',
   'maintain balance with a stable surface within reach',
   'maintain balance during daily activities with no support']);

VM('mo-vm-06', 'Organizing work spatially on a page or screen',
  'Given a multi-part task on a page or screen',
  'arrange the work so each part is in the correct place and readable',
  'accuracy', 90, [4, 5],
  ['arrange work using a provided template',
   'arrange work using a drawn guide',
   'arrange multi-part work correctly on a blank page or screen']);

module.exports = collect(FM, GM, VM, KB);
