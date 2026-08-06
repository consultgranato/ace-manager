// =============================================================
// Ace Manager — goal taxonomy: Vocational
// =============================================================
// Written to feed the Indicator 13 employment postsecondary goal: each of these
// is an annual goal a team can point at when the transition page asks what
// instruction and services will reasonably enable the student to meet their
// employment outcome. Job-site goals are scored by a job coach on a task
// analysis, so "independent" is a percentage rather than an impression.

'use strict';
const { section, collect } = require('./dsl');

// ---- job seeking ----------------------------------------------------------------
const JS = section({
  domain: 'Vocational', sub: 'Job-Seeking Skills', pool: 'vo-jobseeking',
  std: 'IL ELA W.{gg}.4', dx: ['ID', 'SLD', 'ASD', 'ED', 'OHI', 'MD'],
  fade: 'functional', bands: ['9-12', '18-22']
});

JS('vo-js-01', 'Searching and screening job postings',
  'Given a job search site and the student\'s stated preferences',
  'locate postings that match the preferences and state why each fits',
  'accuracy', 85, [4, 5],
  ['locate three job postings using a provided search',
   'locate postings matching stated preferences and hours',
   'locate matching postings and state which requirements the student already meets']);

JS('vo-js-02', 'Completing a job application',
  'Given a job application and a personal information sheet',
  'complete every field accurately and honestly',
  'accuracy', 90, [4, 5],
  ['complete identifying and contact fields',
   'complete education, employment and reference sections',
   'complete an unfamiliar application in full, including availability and signature']);

JS('vo-js-03', 'Producing a resume',
  'Given a resume template and the student\'s experience record',
  'produce a complete, accurate and correctly formatted resume',
  'rubric', 3, [3, 4],
  ['complete a resume template with accurate information',
   'produce a resume including work, volunteer and skills sections',
   'produce a resume tailored to a specific posting with no errors'],
  { pool: 'wr-functional' });

JS('vo-js-04', 'Answering common interview questions',
  'Given a mock interview with an unfamiliar adult',
  'answer each question with a relevant, complete response',
  'rubric', 3, [3, 4],
  ['answer prepared questions using rehearsed responses',
   'answer common questions without a script',
   'answer unfamiliar questions, including questions about weaknesses and gaps'],
  { pool: 'co-expressive', fade: 'behavior' });

JS('vo-js-05', 'Presenting appropriately for an interview',
  'Given a scheduled interview',
  'arrive on time, dressed appropriately, with the required documents',
  'steps', 90, [3, 4],
  ['state what to wear and bring to an interview',
   'prepare for an interview using a checklist',
   'arrive on time, appropriately dressed and prepared with no reminders'],
  { pool: 'vo-jobtask' });

JS('vo-js-06', 'Following up after an application or interview',
  'Given a submitted application or completed interview',
  'send an appropriate follow-up within the expected timeframe',
  'opportunities', 85, [3, 4],
  ['state when and how to follow up',
   'send a follow-up message with adult support',
   'send an appropriate follow-up independently within the expected timeframe']);

JS('vo-js-07', 'Requesting and managing references',
  'Given the need for professional references',
  'identify appropriate references, ask permission and record their information',
  'steps', 85, [3, 4],
  ['name three people who could serve as references',
   'ask a reference for permission with adult support',
   'identify, ask and record complete reference information independently'],
  { pool: 'vo-jobtask' });

JS('vo-js-08', 'Completing employment documentation',
  'Given new-hire paperwork including tax and eligibility forms',
  'complete each form accurately with the required documents',
  'accuracy', 90, [3, 4],
  ['identify which documents are required for employment',
   'complete identifying sections of new-hire paperwork',
   'complete all new-hire paperwork accurately with the required documents present'],
  { bands: ['18-22'] });

// ---- workplace behavior ------------------------------------------------------------------
const WB = section({
  domain: 'Vocational', sub: 'Workplace Behavior', pool: 'vo-workplace',
  std: 'IL SEL 2C', dx: ['ID', 'SLD', 'ASD', 'ED', 'OHI', 'MD'],
  fade: 'behavior', bands: ['9-12', '18-22']
});

WB('vo-wb-01', 'Arriving on time and ready to work',
  'Given a scheduled shift at {work}',
  'arrive before the start time in required attire and clock in',
  'opportunities', 90, [4, 5],
  ['arrive on time with an adult reminder',
   'arrive on time using an alarm or reminder system',
   'arrive on time, in required attire, and clock in independently every shift']);

WB('vo-wb-02', 'Following workplace rules and procedures',
  'Given the site\'s posted rules and procedures',
  'follow each rule during the shift',
  'opportunities', 90, [4, 5],
  ['follow rules with supervisor reminders',
   'follow rules after one reminder per shift',
   'follow all site rules with no reminders']);

WB('vo-wb-03', 'Accepting supervisor feedback and correction',
  'Given corrective feedback from a supervisor',
  'acknowledge the feedback and change the behavior',
  'opportunities', 90, [4, 5],
  ['accept feedback without arguing',
   'accept feedback and acknowledge it verbally',
   'accept feedback, acknowledge it and demonstrate the correction in the same shift']);

WB('vo-wb-04', 'Taking breaks and returning on time',
  'Given scheduled breaks during a shift',
  'take the break at the scheduled time and return on time',
  'opportunities', 90, [4, 5],
  ['return from break with a supervisor prompt',
   'return from break using a timer',
   'take and return from every break on time independently']);

WB('vo-wb-05', 'Reporting an absence appropriately',
  'Given an inability to attend a scheduled shift',
  'notify the supervisor through the correct channel before the shift begins',
  'opportunities', 95, [3, 4],
  ['state who to call and by when',
   'notify the supervisor with adult support',
   'notify the supervisor through the correct channel before the shift, independently'],
  { note: 'No-call-no-show is the single most common reason young workers with disabilities lose a first job — this goal belongs in the plan before the placement starts.' });

WB('vo-wb-06', 'Maintaining appropriate workplace boundaries',
  'Given interactions with co-workers, supervisors and customers',
  'maintain appropriate conversation topics, physical distance and phone use',
  'opportunities', 90, [4, 5],
  ['maintain boundaries with supervisor reminders',
   'maintain boundaries after one reminder',
   'maintain appropriate boundaries with no reminders across a full shift']);

WB('vo-wb-07', 'Managing frustration on the job',
  'Given a frustrating situation at {work}',
  'use a workplace-appropriate strategy and continue working',
  'opportunities', 85, [4, 5],
  ['use a strategy when a job coach prompts',
   'use a strategy after a nonverbal cue',
   'use an appropriate strategy independently and continue the shift']);

WB('vo-wb-08', 'Representing the employer appropriately',
  'Given customer or public contact at {work}',
  'use appropriate greeting, tone and appearance throughout the interaction',
  'opportunities', 90, [4, 5],
  ['greet customers when prompted',
   'greet and assist customers appropriately',
   'handle customer interactions independently, including difficult ones']);

// ---- career exploration --------------------------------------------------------------------------
const CX = section({
  domain: 'Vocational', sub: 'Career Exploration', pool: 'vo-career',
  std: 'IL SEL 3C', dx: ['ID', 'SLD', 'ASD', 'ED', 'OHI', 'MD'], fade: 'academic'
});

CX('vo-cx-01', 'Identifying personal interests and work preferences',
  'Given a career interest inventory and a reflection tool',
  'state work preferences and the interests they are based on',
  'accuracy', 85, [3, 4],
  ['state three jobs of interest',
   'state work preferences for setting, schedule and contact with people',
   'state preferences, the interests behind them and jobs that match']);

CX('vo-cx-02', 'Researching a career and its requirements',
  'Given a career of interest and career information resources',
  'state the training, wage, hours and outlook for the career',
  'accuracy', 85, [3, 4],
  ['state what a person in the career does day to day',
   'state the training and education required',
   'state training, wage, hours, outlook and the next step toward entering the field']);

CX('vo-cx-03', 'Matching personal strengths to job requirements',
  'Given a job description and a personal strengths inventory',
  'state which requirements the student already meets and which need development',
  'accuracy', 85, [3, 4],
  ['identify one strength that matches a job requirement',
   'identify strengths that match and requirements not yet met',
   'identify matches and gaps and state a plan for closing each gap']);

CX('vo-cx-04', 'Identifying supports and accommodations needed at work',
  'Given a job description and the student\'s own access needs',
  'state which accommodations would be needed and how to request them',
  'accuracy', 85, [3, 4],
  ['name the accommodations used at school',
   'state which school accommodations translate to the workplace',
   'state the workplace accommodations needed, why, and how to request them'],
  { bands: ['9-12', '18-22'], pool: 'sa-accommodations' });

CX('vo-cx-05', 'Comparing postsecondary training options',
  'Given career goals and information on training programs',
  'compare options on cost, length, entry requirements and outcome',
  'accuracy', 85, [3, 4],
  ['name two training options for a career of interest',
   'compare two options on cost and length',
   'compare options on cost, length, entry requirements and outcome and state a choice with reasons'],
  { bands: ['9-12', '18-22'] });

CX('vo-cx-06', 'Identifying adult service agencies and supports',
  'Given the student\'s postsecondary goals',
  'name the agencies that provide relevant support and what each does',
  'accuracy', 85, [3, 4],
  ['name one agency that supports adults with disabilities',
   'name the agencies relevant to the student\'s goals',
   'name each agency, what it provides, and the step required to apply'],
  { bands: ['9-12', '18-22'],
    note: 'Illinois adult services have long waiting lists — a student who cannot name DRS or their local agency at exit has effectively been handed nothing.' });

CX('vo-cx-07', 'Participating in a job shadow or informational interview',
  'Given a scheduled job shadow or informational interview',
  'prepare questions, participate, and summarize what was learned',
  'rubric', 3, [3, 4],
  ['attend and observe the experience',
   'prepare questions and ask at least two during the experience',
   'prepare questions, participate fully and summarize what was learned and what it changed'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

// ---- job task performance -----------------------------------------------------------------------------
const JT = section({
  domain: 'Vocational', sub: 'Job Task Performance', pool: 'vo-jobtask',
  std: 'IL SEL 1C', dx: ['ID', 'MD', 'ASD', 'SLD', 'OHI'],
  fade: 'functional', bands: ['9-12', '18-22']
});

JT('vo-jt-01', 'Completing an assigned job task to standard',
  'Given an assigned task at {work} and its task analysis',
  'complete every step to the site\'s quality standard',
  'steps', 90, [4, 5],
  ['complete the task with a job coach modelling each step',
   'complete the task using a picture or written task card',
   'complete every step to standard independently']);

JT('vo-jt-02', 'Working at the required pace',
  'Given a production or service task with a stated rate',
  'complete the task at or above the required rate',
  'accuracy', 90, [4, 5],
  ['complete the task at half the required rate',
   'complete the task at three quarters of the required rate',
   'complete the task at the required rate for a full shift']);

JT('vo-jt-03', 'Moving to the next task without prompting',
  'Given a completed task and a task list',
  'begin the next task without waiting for a supervisor prompt',
  'opportunities', 85, [4, 5],
  ['begin the next task after a supervisor prompt',
   'begin the next task after checking the task list',
   'check the task list and begin the next task with no prompt'],
  { note: 'Downtime behavior is what supervisors notice; a student who works well but stands still between tasks reads as unmotivated.' });

JT('vo-jt-04', 'Checking own work for quality',
  'Given a completed task and a quality checklist',
  'check the work and correct errors before reporting it complete',
  'opportunities', 85, [4, 5],
  ['check the work when prompted',
   'check the work using a checklist',
   'check and correct the work independently before reporting completion']);

JT('vo-jt-05', 'Following safety procedures on the job',
  'Given the site\'s safety requirements and equipment',
  'follow every safety procedure during the shift',
  'steps', 95, [4, 5],
  ['follow safety procedures with supervision at each step',
   'follow safety procedures using a task card',
   'follow every safety procedure independently, including using protective equipment']);

JT('vo-jt-06', 'Using workplace tools and equipment',
  'Given the tools and equipment required for the assigned task',
  'select, use and store each tool correctly',
  'steps', 90, [4, 5],
  ['use tools with a job coach modelling',
   'select and use the correct tools with a task card',
   'select, use, clean and store all tools independently']);

JT('vo-jt-07', 'Adapting when a task changes',
  'Given a change to the assigned task or routine',
  'adjust to the change and continue working',
  'opportunities', 85, [4, 5],
  ['adjust to a change with job coach support',
   'adjust to a change after a brief explanation',
   'adjust to an unannounced change and continue working independently']);

// ---- workplace communication -----------------------------------------------------------------------------------
const WK = section({
  domain: 'Vocational', sub: 'Workplace Communication', pool: 'vo-communication',
  std: 'IL ELA SL.{gg}.1', dx: ['ID', 'SLD', 'ASD', 'SLI', 'ED'],
  fade: 'behavior', bands: ['9-12', '18-22']
});

WK('vo-wk-01', 'Asking a supervisor for clarification',
  'Given an unclear or incomplete work direction',
  'ask a specific question before beginning the task',
  'opportunities', 85, [4, 5],
  ['indicate that the direction was not understood',
   'ask a general clarifying question',
   'ask a specific question naming exactly what is unclear']);

WK('vo-wk-02', 'Reporting a problem or error at work',
  'Given a problem, error or shortage at {work}',
  'report it to the correct person with the necessary detail',
  'opportunities', 90, [4, 5],
  ['report a problem when a job coach prompts',
   'report a problem to the correct person',
   'report the problem promptly with what happened, when and what is needed']);

WK('vo-wk-03', 'Communicating with co-workers about shared work',
  'Given a task shared with {peer}',
  'coordinate the work through appropriate communication',
  'opportunities', 85, [4, 5],
  ['respond when a co-worker initiates',
   'initiate communication about the shared task',
   'coordinate the shared task through initiation, updates and confirmation']);

WK('vo-wk-04', 'Using workplace-appropriate tone and language',
  'Given interactions across a shift',
  'use language and tone appropriate to the workplace',
  'opportunities', 90, [4, 5],
  ['use appropriate language after a reminder',
   'use appropriate language with no more than one reminder per shift',
   'use workplace-appropriate language and tone throughout the shift']);

WK('vo-wk-05', 'Requesting time off or a schedule change',
  'Given a need to change the work schedule',
  'make the request through the correct channel with the required notice',
  'opportunities', 90, [3, 4],
  ['state who to ask and how much notice is required',
   'make the request with adult support',
   'make the request through the correct channel with the required notice independently']);

WK('vo-wk-06', 'Participating in a workplace meeting or briefing',
  'Given a shift briefing or team meeting',
  'listen, record the assigned information and ask a question if needed',
  'rubric', 3, [3, 4],
  ['attend and remain attentive throughout',
   'record the assigned information from the briefing',
   'record the information, ask a clarifying question and act on the assignment'],
  { pool: 'st-notes' });

// ---- work stamina & reliability ---------------------------------------------------------------------------------------
const ST = section({
  domain: 'Vocational', sub: 'Work Stamina & Reliability', pool: 'vo-stamina',
  std: 'IL SEL 1B', dx: ['ID', 'MD', 'OHI', 'ASD', 'ED'],
  fade: 'functional', bands: ['9-12', '18-22']
});

ST('vo-st-01', 'Sustaining work across a full shift',
  'Given a scheduled shift at {work}',
  'work continuously except during scheduled breaks',
  'duration', { '9-12': 90, '18-22': 180 }, [4, 5],
  ['work continuously for a third of the shift',
   'work continuously for two thirds of the shift',
   'work continuously for the full shift except during scheduled breaks']);

ST('vo-st-02', 'Maintaining productivity across the whole shift',
  'Given a measured task rate at the start and end of a shift',
  'maintain the required rate through the end of the shift',
  'accuracy', 85, [4, 5],
  ['maintain the rate for the first half of the shift',
   'maintain the rate through three quarters of the shift',
   'maintain the required rate through the end of every shift']);

ST('vo-st-03', 'Attending scheduled shifts reliably',
  'Given the student\'s work schedule over a month',
  'attend every scheduled shift',
  'opportunities', 95, [3, 4],
  ['attend at least three quarters of scheduled shifts',
   'attend at least 90% of scheduled shifts',
   'attend every scheduled shift for four consecutive weeks']);

ST('vo-st-04', 'Reducing the number of job coach prompts required',
  'Given a shift at {work}',
  'complete the shift with no more than the target number of prompts',
  'prompts', 2, [4, 5],
  ['complete the shift with fewer prompts than the baseline average',
   'complete the shift with four or fewer prompts',
   'complete the shift with no more than the target number of prompts'],
  { note: 'Prompt count is the cleanest fading measure a job coach can collect — it shows whether support is actually being withdrawn or only described as withdrawn.' });

ST('vo-st-05', 'Managing physical demands of the job',
  'Given the physical requirements of the assigned task',
  'use correct technique and pacing throughout the shift',
  'steps', 90, [4, 5],
  ['use correct technique when a job coach models it',
   'use correct technique with a reminder card',
   'use correct technique and pacing independently for the full shift'],
  { pool: 'vo-jobtask' });

CX('vo-cx-08', 'Identifying transferable skills from current activities',
  'Given the student\'s current classes, chores, hobbies and volunteer work',
  'name the work skills each activity is already building',
  'accuracy', 85, [3, 4],
  ['name one skill built by a current activity',
   'name the skills built by three current activities',
   'name transferable skills across activities and match them to a job of interest']);

CX('vo-cx-09', 'Describing what different jobs involve',
  'Given {nshort} jobs in the local community',
  'state what each job involves, its setting and its schedule',
  'accuracy', 85, [4, 5],
  ['name what a person in each job does',
   'state the tasks, setting and schedule of each job',
   'state tasks, setting, schedule, training and pay for each job']);

CX('vo-cx-10', 'Setting a career goal and identifying the next step',
  'Given career exploration results and a planning tool',
  'state a career goal and the specific next step toward it',
  'accuracy', 85, [3, 4],
  ['state a career area of interest',
   'state a career goal and one step toward it',
   'state a career goal, the steps required, and the step to take this school year']);

module.exports = collect(JS, WB, CX, JT, WK, ST);
