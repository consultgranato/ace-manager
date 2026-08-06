// =============================================================
// Ace Manager — goal taxonomy: Independent Living
// =============================================================
// These are the goals an Illinois transition IEP is measured on at the
// Indicator 13 and Indicator 14 level: what the student can actually do in a
// home, a store, a clinic and a bank the year after they leave. Task-analysis
// goals are scored in percent of steps completed independently, which is the
// measure that shows fading support rather than a pass/fail.

'use strict';
const { section, collect } = require('./dsl');

// ---- money & budgeting ---------------------------------------------------------
const MB = section({
  domain: 'Independent Living', sub: 'Money & Budgeting', pool: 'il-money',
  std: 'IL Math {msn}', dx: ['ID', 'SLD', 'ASD', 'MD', 'OHI'], fade: 'functional'
});

MB('il-mb-01', 'Identifying and counting currency',
  'Given a mixed set of bills and coins',
  'identify each denomination and state the total value',
  'accuracy', 95, [4, 5],
  ['identify each coin and bill by name and value',
   'count a set of coins to one dollar',
   'count mixed bills and coins to twenty dollars'],
  { gen_opts: { v: 'identify' } });

MB('il-mb-02', 'Making a purchase and verifying change',
  'Given {nshort} purchase scenarios',
  'pay the correct amount and verify the change received',
  'accuracy', 90, [4, 5],
  ['pay with the next whole dollar above the price',
   'pay and state whether the change is approximately correct',
   'pay, count the change and identify an incorrect amount'],
  { gen_opts: { v: 'purchase' } });

MB('il-mb-03', 'Tracking spending against a budget',
  'Given {money} and a record of purchases',
  'record each purchase and state the amount remaining',
  'accuracy', 90, [4, 5],
  ['record each purchase in a spending log',
   'record purchases and calculate the running total',
   'record purchases, calculate the remaining balance and state when to stop spending'],
  { gen_opts: { v: 'tracking' } });

MB('il-mb-04', 'Distinguishing needs from wants in spending decisions',
  'Given a fixed amount and a list of possible purchases',
  'sort the purchases and choose a spending plan that covers needs first',
  'accuracy', 90, [4, 5],
  ['sort purchases into needs and wants',
   'choose a plan that covers all needs',
   'choose a plan that covers needs, includes savings, and explain each trade-off'],
  { gen_opts: { v: 'needswants' } });

MB('il-mb-05', 'Using a bank account and debit card',
  'Given a bank statement, a debit card and {nshort} transactions',
  'complete each transaction and reconcile the balance',
  'accuracy', 90, [4, 5],
  ['state the current balance from a statement or app',
   'record a transaction and update the balance',
   'reconcile a statement, identify an unrecognised charge and state what to do'],
  { gen_opts: { v: 'banking' }, bands: ['9-12', '18-22'] });

MB('il-mb-06', 'Paying bills on time',
  'Given {nshort} bills with due dates and a payment method',
  'pay each bill before its due date and record the payment',
  'opportunities', 90, [4, 5],
  ['identify the amount due and the due date on a bill',
   'schedule a payment before the due date with support',
   'pay every bill before its due date and record it independently'],
  { gen_opts: { v: 'bills' }, bands: ['18-22'] });

MB('il-mb-07', 'Recognising financial scams and predatory offers',
  'Given {nshort} offers, messages and advertisements, including fraudulent ones',
  'identify which are scams and state what to do about each',
  'accuracy', 90, [4, 5],
  ['identify an obvious scam message',
   'identify scams using warning signs such as urgency and requests for information',
   'identify scams, predatory loans and subscription traps and state the correct response'],
  { bands: ['9-12', '18-22'], pool: 'il-safety',
    note: 'Financial exploitation is one of the most common harms to adults with disabilities — this goal belongs in more transition IEPs than it appears in.' });

MB('il-mb-08', 'Saving toward a stated goal',
  'Given an income, a savings goal and a tracking tool',
  'set aside the planned amount and track progress toward the goal',
  'opportunities', 85, [3, 4],
  ['state the savings goal and the amount needed',
   'set aside the planned amount with a reminder',
   'set aside the planned amount every pay period and track the balance independently'],
  { gen_opts: { v: 'saving' }, bands: ['9-12', '18-22'] });

// ---- community navigation ----------------------------------------------------------------
const CN = section({
  domain: 'Independent Living', sub: 'Community Navigation', pool: 'il-navigation',
  std: 'IL ELA RI.{gg}.7', dx: ['ID', 'ASD', 'MD', 'SLD', 'OHI'], fade: 'functional'
});

CN('il-cn-01', 'Planning a route using a transit schedule or app',
  'Given a destination, a departure time and a transit app or schedule',
  'plan a route stating the route number, departure time and arrival time',
  'accuracy', 90, [4, 5],
  ['locate a departure time for a familiar route',
   'plan a one-leg route stating departure and arrival times',
   'plan a route with a transfer and state a backup if the first option is missed']);

CN('il-cn-02', 'Riding public transportation independently',
  'Given a planned route and fare',
  'complete the trip, paying the fare and exiting at the correct stop',
  'steps', 90, [4, 5],
  ['complete a familiar trip with an adult present',
   'complete a familiar trip with an adult observing from a distance',
   'complete an unfamiliar trip independently'],
  { pool: 'il-household', bands: ['9-12', '18-22'] });

CN('il-cn-03', 'Locating a destination within a building or complex',
  'Given a building directory, map or room numbering system',
  'locate the destination without asking for directions',
  'accuracy', 90, [4, 5],
  ['locate a room using a provided map',
   'locate a destination using a building directory',
   'locate a destination in an unfamiliar building using signs and the directory']);

CN('il-cn-04', 'Using a mapping app to reach a destination on foot',
  'Given a destination and a mapping app',
  'follow the route to the destination and arrive by the required time',
  'steps', 90, [4, 5],
  ['follow a mapping app route with adult support',
   'follow a route independently on a familiar path',
   'follow a route to an unfamiliar destination and arrive on time'],
  { pool: 'il-household', bands: ['9-12', '18-22'] });

CN('il-cn-05', 'Responding when lost or a plan fails',
  'Given a scenario in which the student is lost or transport does not arrive',
  'state and carry out a plan to get help or reach the destination',
  'accuracy', 90, [4, 5],
  ['name one person to contact when lost',
   'state a plan for a missed bus or a wrong stop',
   'state and carry out a plan for being lost, stranded or unable to reach a contact'],
  { pool: 'il-safety' });

CN('il-cn-06', 'Making purchases and requests in community settings',
  'Given a community errand requiring interaction with staff',
  'complete the errand including the request, payment and confirmation',
  'steps', 90, [4, 5],
  ['complete the errand with adult modelling',
   'complete the errand with an adult present but not assisting',
   'complete the errand independently'],
  { pool: 'il-household' });

CN('il-cn-07', 'Scheduling and keeping appointments',
  'Given a need for a medical, benefits or service appointment',
  'schedule the appointment and attend it on the correct date and time',
  'opportunities', 90, [3, 4],
  ['attend a scheduled appointment with a reminder from an adult',
   'schedule an appointment with adult support and attend it',
   'schedule, record and attend an appointment independently'],
  { bands: ['18-22'] });

// ---- household management ----------------------------------------------------------------------
const HM = section({
  domain: 'Independent Living', sub: 'Household Management', pool: 'il-household',
  std: 'IL ELA RI.{gg}.3', dx: ['ID', 'MD', 'ASD', 'SLD'], fade: 'functional'
});

HM('il-hm-01', 'Completing a laundry routine',
  'Given laundry, a washer and dryer and a task analysis',
  'complete every step of the laundry routine',
  'steps', 90, [4, 5],
  ['complete the routine with adult modelling at each step',
   'complete the routine using a task card',
   'complete the routine independently, including sorting and settings']);

HM('il-hm-02', 'Cleaning and maintaining a living space',
  'Given a cleaning task and the required supplies',
  'complete each step of the cleaning routine safely',
  'steps', 90, [4, 5],
  ['complete the routine with adult modelling',
   'complete the routine using a task card',
   'complete the routine independently and check the result against a standard']);

HM('il-hm-03', 'Using household appliances safely',
  'Given a household appliance and its instructions',
  'operate the appliance following every safety step',
  'steps', 95, [4, 5],
  ['operate the appliance with adult supervision at each step',
   'operate the appliance using a task card',
   'operate the appliance independently, following all safety steps']);

HM('il-hm-04', 'Following a household maintenance schedule',
  'Given a weekly household schedule',
  'complete each scheduled task on the assigned day',
  'opportunities', 85, [4, 5],
  ['complete tasks when an adult assigns them each day',
   'complete tasks after checking a posted schedule',
   'check the schedule and complete every task independently']);

HM('il-hm-05', 'Reporting a repair or maintenance problem',
  'Given a household problem requiring a repair request',
  'report the problem with enough detail for someone to act on it',
  'rubric', 3, [3, 4],
  ['state that something is broken',
   'state what is broken and where',
   'state what is broken, where, when it started and what has been tried'],
  { bands: ['18-22'], pool: 'co-expressive' });

HM('il-hm-06', 'Organizing and storing belongings',
  'Given personal belongings and a storage system',
  'store items so they can be located when needed',
  'steps', 90, [4, 5],
  ['put items away when directed',
   'put items away in the correct place using labels',
   'maintain the storage system and locate any item when asked']);

HM('il-hm-07', 'Managing housing paperwork and communications',
  'Given a lease, notice or landlord communication',
  'identify the required action and the deadline and respond appropriately',
  'accuracy', 90, [3, 4],
  ['state what a housing notice is about',
   'state the required action and the deadline',
   'state the action, the deadline and respond in writing by the deadline'],
  { bands: ['18-22'], pool: 'rd-functional', fade: 'academic' });

// ---- personal safety ----------------------------------------------------------------------------------
const PS = section({
  domain: 'Independent Living', sub: 'Personal Safety', pool: 'il-safety',
  std: 'IL SEL 3B', dx: ['ID', 'ASD', 'MD', 'SLD', 'ED'], fade: 'functional'
});

PS('il-ps-01', 'Responding to an emergency',
  'Given {nshort} emergency scenarios',
  'state the correct action and who to contact for each',
  'accuracy', 95, [4, 5],
  ['state when to call 911 and what to say',
   'state the correct response to fire, injury and severe weather scenarios',
   'state the correct response to any emergency scenario including who to contact and what information to give']);

PS('il-ps-02', 'Recognising unsafe people and situations',
  'Given {nshort} described situations, including unsafe ones',
  'identify the unsafe situations and state how to leave each one',
  'accuracy', 90, [4, 5],
  ['identify clearly unsafe situations',
   'identify unsafe situations involving pressure, secrecy or isolation',
   'identify subtle unsafe situations and state a specific exit plan for each']);

PS('il-ps-03', 'Protecting personal information',
  'Given {nshort} requests for personal information, in person and online',
  'identify which requests are legitimate and what information to withhold',
  'accuracy', 90, [4, 5],
  ['state which pieces of information are private',
   'identify an illegitimate request for personal information',
   'identify illegitimate requests across phone, email and in-person settings and state the correct response'],
  { bands: ['9-12', '18-22'] });

PS('il-ps-04', 'Internet and social media safety',
  'Given {nshort} online scenarios',
  'identify the risk in each and state the safe response',
  'accuracy', 90, [4, 5],
  ['identify what should not be posted publicly',
   'identify risky online contacts and requests',
   'identify risks in messaging, sharing and meeting scenarios and state the safe response'],
  { pool: 'il-tech', bands: ['6-8', '9-12', '18-22'] });

PS('il-ps-05', 'Personal safety in the community',
  'Given community scenarios involving strangers, transactions and unfamiliar settings',
  'state the safe action for each situation',
  'accuracy', 90, [4, 5],
  ['state safe practices for walking and waiting alone',
   'state safe practices for transactions and unfamiliar adults',
   'state safe practices across community scenarios and identify when to leave and call for help']);

PS('il-ps-06', 'Knowing and communicating personal identification information',
  'Given a request for identifying information from a legitimate source',
  'state name, address, phone number and emergency contact accurately',
  'accuracy', 95, [4, 5],
  ['state full name and phone number',
   'state name, address and phone number',
   'state name, address, phone number, date of birth and emergency contact']);

PS('il-ps-07', 'Recognising and reporting abuse or exploitation',
  'Given scenarios describing mistreatment or exploitation',
  'identify what is happening and state who to tell',
  'accuracy', 95, [3, 4],
  ['state that a described situation is not okay',
   'identify mistreatment and name a trusted adult to tell',
   'identify mistreatment or exploitation, name who to tell, and state what to do if not believed'],
  { bands: ['9-12', '18-22'],
    note: 'Include the "what if nobody believes you" step — a reporting goal that stops at telling one adult fails the students who most need it.' });

// ---- health & self-care ----------------------------------------------------------------------------------
const HS = section({
  domain: 'Independent Living', sub: 'Health & Self-Care', pool: 'il-health',
  std: 'IL ELA RI.{gg}.7', dx: ['ID', 'MD', 'ASD', 'OHI', 'SLD'], fade: 'functional'
});

HS('il-hs-01', 'Completing a daily hygiene routine',
  'Given a daily hygiene routine and the required supplies',
  'complete each step of the routine',
  'steps', 90, [4, 5],
  ['complete the routine with adult prompting at each step',
   'complete the routine using a task card',
   'complete the routine independently every day'],
  { pool: 'il-household' });

HS('il-hs-02', 'Managing medication',
  'Given a medication schedule and labels',
  'take the correct medication at the correct time in the correct dose',
  'accuracy', 95, [4, 5],
  ['state the name, dose and timing of each medication',
   'take medication at the correct time with a reminder',
   'manage the full medication schedule independently, including refills'],
  { bands: ['9-12', '18-22'] });

HS('il-hs-03', 'Recognising symptoms and deciding when to seek care',
  'Given {nshort} described symptoms of varying severity',
  'state whether each requires self-care, a clinic visit or emergency care',
  'accuracy', 90, [4, 5],
  ['state whether a symptom is serious',
   'sort symptoms into self-care and needs-a-doctor',
   'sort symptoms across self-care, urgent care and emergency and justify each choice']);

HS('il-hs-04', 'Communicating with a health care provider',
  'Given a medical appointment scenario',
  'describe the symptom, its history and ask a question about the plan',
  'rubric', 3, [3, 4],
  ['state the reason for the visit',
   'describe the symptom and when it started',
   'describe the symptom and history, ask a question and restate the plan'],
  { bands: ['9-12', '18-22'], pool: 'co-expressive', fade: 'behavior' });

HS('il-hs-05', 'Making basic nutrition decisions',
  'Given menus, food labels and a meal to plan',
  'choose a balanced meal and state the reason for the choices',
  'accuracy', 85, [4, 5],
  ['identify which foods belong to each food group',
   'plan a balanced meal from a menu',
   'plan balanced meals for a day within a budget and state the reasons']);

HS('il-hs-06', 'Preparing simple meals safely',
  'Given a recipe, ingredients and kitchen equipment',
  'prepare the meal following every food safety step',
  'steps', 90, [4, 5],
  ['prepare a no-cook meal following a task card',
   'prepare a simple cooked meal with adult supervision',
   'prepare a cooked meal independently following all food safety steps'],
  { pool: 'il-food' });

HS('il-hs-07', 'Maintaining physical activity and sleep routines',
  'Given a self-tracked routine covering activity and sleep',
  'complete the routine on the target number of days per week',
  'opportunities', 80, [3, 4],
  ['track activity and sleep for a full week',
   'meet the routine target on half the days',
   'meet the routine target on the planned number of days for four consecutive weeks'],
  { fade: 'selfreport', bands: ['9-12', '18-22'] });

HS('il-hs-08', 'Managing a personal health condition',
  'Given the student\'s own health condition and care plan',
  'carry out the care plan and report changes to the right person',
  'steps', 90, [4, 5],
  ['state the condition and the steps of the care plan',
   'carry out the care plan with reminders',
   'carry out the care plan independently and report changes without prompting'],
  { pool: 'il-household', dx: ['OHI', 'MD', 'ID'], bands: ['9-12', '18-22'] });

// ---- technology & digital literacy -------------------------------------------------------------------------------
const TC = section({
  domain: 'Independent Living', sub: 'Technology & Digital Literacy', pool: 'il-tech',
  std: 'IL ELA W.{gg}.6', dx: ['ID', 'SLD', 'ASD', 'MD', 'OHI'], fade: 'functional'
});

TC('il-tc-01', 'Managing accounts and passwords',
  'Given the student\'s own accounts and a password manager or record system',
  'access each account and keep credentials secure',
  'accuracy', 90, [4, 5],
  ['log in to a familiar account independently',
   'reset a forgotten password using the recovery process',
   'manage all accounts securely, including two-factor authentication']);

TC('il-tc-02', 'Sending and managing email',
  'Given an email account and {nshort} messages requiring a response',
  'read, respond to and organize each message appropriately',
  'accuracy', 90, [4, 5],
  ['open and read email and identify who sent it',
   'reply to a message with the requested information',
   'reply, attach a file and organize the inbox independently']);

TC('il-tc-03', 'Completing an online form or application',
  'Given an online {doc}',
  'complete and submit the form with accurate information',
  'accuracy', 90, [4, 5],
  ['complete identifying fields on an online form',
   'complete all fields and upload a required document',
   'complete and submit an unfamiliar online application independently'],
  { bands: ['9-12', '18-22'] });

TC('il-tc-04', 'Searching for and evaluating online information',
  'Given a question to answer using the internet',
  'locate accurate information and state why the source is trustworthy',
  'accuracy', 85, [4, 5],
  ['locate information using a provided search term',
   'construct a search that returns relevant results',
   'locate accurate information and justify the source\'s reliability']);

TC('il-tc-05', 'Using video calling and digital communication tools',
  'Given a scheduled video call or digital meeting',
  'join on time and participate using the tool\'s controls',
  'steps', 90, [4, 5],
  ['join a call with adult support',
   'join on time and use mute and camera controls',
   'join, participate and share a screen or file independently'],
  { pool: 'il-household', bands: ['9-12', '18-22'] });

TC('il-tc-06', 'Using assistive technology features',
  'Given the student\'s own device and assistive features',
  'turn on and use the assistive features that support access',
  'steps', 90, [4, 5],
  ['use an assistive feature when an adult enables it',
   'enable and use an assistive feature with a task card',
   'enable and use the appropriate assistive feature independently across applications'],
  { pool: 'il-household',
    note: 'A student who cannot turn on their own accommodations does not have them once they leave a school that turns them on for them.' });

TC('il-tc-07', 'Troubleshooting a device problem',
  'Given a device that is not working as expected',
  'work through troubleshooting steps and seek help if unresolved',
  'accuracy', 85, [4, 5],
  ['state the problem clearly',
   'try two troubleshooting steps before asking for help',
   'work through a troubleshooting sequence and describe the problem accurately when asking for help']);

module.exports = collect(MB, CN, HM, PS, HS, TC);
