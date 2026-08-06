// =============================================================
// Ace Manager — goal taxonomy: Communication
// =============================================================
// Speech and language goals are written so a case manager can monitor them
// even when the SLP holds the service minutes: every goal here resolves to a
// number an adult can collect in a classroom, not only in a therapy room.

'use strict';
const { section, collect } = require('./dsl');

// ---- receptive language ---------------------------------------------------------
const RE = section({
  domain: 'Communication', sub: 'Receptive Language', pool: 'co-receptive',
  std: 'IL ELA SL.{gg}.1', dx: ['SLI', 'ID', 'ASD', 'MD', 'TBI']
});

RE('cm-re-01', 'Following multi-step oral directions',
  'Given oral directions containing more than one step in {setting}',
  'complete every step in the order given',
  'accuracy', 90, [4, 5],
  ['complete two-step oral directions',
   'complete three-step oral directions',
   'complete four-step oral directions containing conditional language such as "before" and "unless"']);

RE('cm-re-02', 'Understanding questions and question forms',
  'Given {n} spoken questions of varied form',
  'answer each question in a way that matches the question asked',
  'accuracy', 90, [4, 5],
  ['answer who, what and where questions accurately',
   'answer when, why and how questions accurately',
   'answer questions of all forms, including questions containing negation and conditionals']);

RE('cm-re-03', 'Understanding spoken vocabulary and concepts',
  'Given {n} spoken sentences containing academic and temporal concepts',
  'demonstrate understanding by responding correctly',
  'accuracy', 85, [4, 5],
  ['respond correctly to basic spatial and quantity concepts',
   'respond correctly to temporal and sequence concepts',
   'respond correctly to comparative, conditional and inferential concepts']);

RE('cm-re-04', 'Listening comprehension of spoken passages',
  'Given a spoken passage of {corpus} content',
  'answer literal and inferential questions about what was heard',
  'accuracy', 85, [4, 5],
  ['answer literal questions about a short spoken passage',
   'answer literal questions about a full spoken passage',
   'answer literal and inferential questions and summarize the passage'],
  { std: 'IL ELA SL.{gg}.2' });

RE('cm-re-05', 'Requesting clarification when a message is unclear',
  'Given a spoken direction or explanation containing missing or unclear information',
  'ask a specific question to obtain the missing information',
  'opportunities', 85, [4, 5],
  ['indicate that a message was not understood',
   'ask a general clarifying question such as "can you repeat that?"',
   'ask a specific question naming exactly what information is missing'],
  { fade: 'behavior', pool: 'co-pragmatics',
    note: 'A student who says "I get it" rather than asking is the one who fails the task later — count specific clarifying questions, not nods.' });

RE('cm-re-06', 'Understanding figurative and indirect language',
  'Given {nshort} spoken statements containing idioms, sarcasm or indirect requests',
  'state what the speaker actually means',
  'accuracy', 80, [4, 5],
  ['state the meaning of common spoken idioms',
   'state the meaning of an indirect request',
   'state the intended meaning of sarcasm, hints and indirect requests in context'],
  { dx: ['ASD', 'SLI', 'TBI'], pool: 'co-pragmatics' });

// ---- expressive language ----------------------------------------------------------
const EX = section({
  domain: 'Communication', sub: 'Expressive Language', pool: 'co-expressive',
  std: 'IL ELA SL.{gg}.4', dx: ['SLI', 'ID', 'ASD', 'MD', 'TBI']
});

EX('cm-ex-01', 'Producing grammatically complete sentences',
  'Given a picture, prompt or question in {setting}',
  'respond in grammatically complete sentences',
  'rubric', 3, [3, 4],
  ['respond in a complete simple sentence',
   'respond in complete sentences with correct verb tense and agreement',
   'respond in complete compound and complex sentences with correct grammar']);

EX('cm-ex-02', 'Using specific vocabulary rather than nonspecific words',
  'Given a language sample elicited in {setting}',
  'use specific nouns and verbs rather than nonspecific words such as "thing" and "stuff"',
  'rubric', 3, [3, 4],
  ['name the specific word when given a choice of two',
   'use a specific word when an adult signals that a word was nonspecific',
   'use specific vocabulary throughout a language sample without adult signalling']);

EX('cm-ex-03', 'Describing and explaining with sufficient detail',
  'Given an object, process or event to describe',
  'produce a description a listener who was not present could follow',
  'rubric', 3, [3, 4],
  ['name the topic and give one detail',
   'give three relevant details in a logical order',
   'give a complete description a naive listener could act on without asking questions']);

EX('cm-ex-04', 'Retelling and narrating events in sequence',
  'Given an experience, story or process to retell',
  'retell it with the events in order and the necessary background information',
  'rubric', 3, [3, 4],
  ['retell three events in the correct order',
   'retell a full sequence with a beginning, middle and end',
   'retell a full sequence including who, where and why, in order, without prompting']);

EX('cm-ex-05', 'Word retrieval and fluent formulation',
  'Given a naming or explanation task',
  'produce the target word or use a working strategy when the word does not come',
  'accuracy', 85, [4, 5],
  ['produce the target word when given a phonemic or semantic cue',
   'use a described-around strategy when a word does not come',
   'produce the target word or an effective substitute without adult cueing'],
  { dx: ['SLI', 'TBI', 'SLD'] });

EX('cm-ex-06', 'Presenting information to a group',
  'Given a prepared topic and an audience of peers',
  'present the information audibly, in order, and at an appropriate pace',
  'rubric', 3, [3, 4],
  ['present prepared information reading from notes',
   'present with appropriate volume and pace using notes as a reference',
   'present audibly and clearly with eye contact, appropriate pace and minimal reliance on notes'],
  { std: 'IL ELA SL.{gg}.4', bands: ['6-8', '9-12'] });

EX('cm-ex-07', 'Adjusting language for the listener and setting',
  'Given communication situations that differ in formality',
  'adjust vocabulary, tone and formality to fit the listener and setting',
  'rubric', 3, [3, 4],
  ['state whether a situation calls for formal or casual language',
   'use formal language in a formal situation when reminded',
   'adjust language to the listener and setting without a reminder'],
  { std: 'IL ELA SL.{gg}.6', fade: 'behavior' });

// ---- pragmatic / social communication --------------------------------------------------
const PR = section({
  domain: 'Communication', sub: 'Pragmatic Language', pool: 'co-pragmatics',
  std: 'IL ELA SL.{gg}.1', dx: ['ASD', 'SLI', 'ED', 'TBI'], fade: 'behavior'
});

PR('cm-pr-01', 'Initiating and maintaining a conversation',
  'Given an unstructured social opportunity with {peer}',
  'initiate a conversation and maintain it across at least three exchanges',
  'opportunities', 80, [4, 5],
  ['initiate a greeting or opening comment',
   'initiate and maintain two conversational exchanges',
   'initiate and maintain four or more exchanges on a topic the partner chose']);

PR('cm-pr-02', 'Turn-taking and not interrupting',
  'Given a group discussion in {setting}',
  'wait for a pause before speaking and allow others to finish',
  'opportunities', 85, [4, 5],
  ['wait for a signal before speaking',
   'wait for a natural pause before speaking',
   'take conversational turns without interrupting across a full discussion']);

PR('cm-pr-03', 'Staying on topic and making relevant contributions',
  'Given a group discussion on a set topic',
  'make contributions that connect to what the previous speaker said',
  'opportunities', 85, [4, 5],
  ['make a contribution related to the general topic',
   'make a contribution that connects to the previous speaker',
   'make relevant contributions and signal explicitly when changing the topic']);

PR('cm-pr-04', 'Reading and responding to nonverbal cues',
  'Given social situations containing facial expression, tone and body language cues',
  'state what the cue signals and respond appropriately',
  'accuracy', 80, [4, 5],
  ['identify the emotion shown by a facial expression',
   'state what a tone of voice or posture signals',
   'state what a combination of cues signals and choose an appropriate response'],
  { fade: 'academic' });

PR('cm-pr-05', 'Greetings, requests and closings with unfamiliar adults',
  'Given an interaction with an unfamiliar adult in {life}',
  'greet, state the purpose and close the interaction appropriately',
  'opportunities', 85, [4, 5],
  ['use an appropriate greeting',
   'greet and state the purpose of the interaction',
   'greet, state the purpose, respond to the answer and close appropriately']);

PR('cm-pr-06', 'Repairing a communication breakdown',
  'Given an interaction in which the listener did not understand',
  'recognise the breakdown and repair it by rephrasing or adding information',
  'opportunities', 80, [4, 5],
  ['repeat the message when the listener signals confusion',
   'rephrase the message using different words',
   'recognise the breakdown without a signal and repair it by adding the missing information']);

PR('cm-pr-07', 'Disagreeing and negotiating respectfully',
  'Given a disagreement with {peer} about a task or decision',
  'state the disagreement respectfully and propose an alternative',
  'opportunities', 80, [4, 5],
  ['state disagreement without raised voice or walking away',
   'state the disagreement and the reason for it',
   'state the disagreement, give the reason and propose a workable alternative']);

// ---- articulation & intelligibility ---------------------------------------------------------
const AR = section({
  domain: 'Communication', sub: 'Articulation & Intelligibility', pool: 'co-articulation',
  std: 'IL ELA SL.{gg}.6', dx: ['SLI', 'MD', 'ID', 'HI'], fade: 'behavior'
});

AR('cm-ar-01', 'Producing target sounds at the word level',
  'Given {n} words containing the target sound in all positions',
  'produce the target sound correctly in each word',
  'accuracy', 90, [4, 5],
  ['produce the target sound in the initial position of words',
   'produce the target sound in initial and final positions',
   'produce the target sound in all positions, including in blends']);

AR('cm-ar-02', 'Producing target sounds at the sentence level',
  'Given {n} sentences loaded with the target sound',
  'produce the target sound correctly throughout each sentence',
  'accuracy', 90, [4, 5],
  ['produce the target sound correctly in a carrier phrase',
   'produce the target sound correctly in a modelled sentence',
   'produce the target sound correctly in original sentences']);

AR('cm-ar-03', 'Carrying over target sounds into conversation',
  'Given a three-minute conversational sample in {setting}',
  'produce the target sound correctly throughout the sample',
  'accuracy', 85, [4, 5],
  ['produce the target sound correctly in structured conversation with cueing',
   'produce the target sound correctly in structured conversation without cueing',
   'produce the target sound correctly in spontaneous conversation outside the therapy setting'],
  { note: 'Carryover is where articulation goals actually succeed or fail — collect this sample in a classroom or a job site, never only in the therapy room.' });

AR('cm-ar-04', 'Overall speech intelligibility to an unfamiliar listener',
  'Given a conversational sample rated by a listener unfamiliar with the student',
  'produce speech the unfamiliar listener understands without asking for repetition',
  'accuracy', 90, [3, 4],
  ['produce speech a familiar listener understands in a known context',
   'produce speech an unfamiliar listener understands in a known context',
   'produce speech an unfamiliar listener understands on an unknown topic']);

AR('cm-ar-05', 'Self-monitoring and self-correcting speech productions',
  'Given a speaking task containing the target sound',
  'identify and self-correct errors on the target sound',
  'opportunities', 85, [4, 5],
  ['identify an error when an adult signals it',
   'self-correct an error after an adult signal',
   'identify and self-correct errors without any adult signal']);

// ---- speech fluency ---------------------------------------------------------------------------
const SF = section({
  domain: 'Communication', sub: 'Speech Fluency', pool: 'co-fluency',
  std: 'IL ELA SL.{gg}.6', dx: ['SLI'], fade: 'behavior', bands: ['6-8', '9-12']
});

SF('cm-sf-01', 'Using fluency-enhancing strategies in structured speech',
  'Given a structured speaking task',
  'use taught fluency strategies to speak with reduced disfluency',
  'disfluency', 5, [3, 4],
  ['name and demonstrate the taught fluency strategies on request',
   'use fluency strategies during reading aloud',
   'use fluency strategies during structured conversation']);

SF('cm-sf-02', 'Maintaining fluency in conversation',
  'Given a five-minute conversational sample in {setting}',
  'speak with disfluencies below the target rate',
  'disfluency', 5, [3, 4],
  ['speak with reduced disfluency in a one-to-one conversation',
   'speak with reduced disfluency in a small group',
   'speak with disfluency below the target rate in classroom conversation']);

SF('cm-sf-03', 'Speaking in situations of higher communicative pressure',
  'Given a speaking situation with time pressure or an unfamiliar listener',
  'use fluency strategies to participate rather than avoid the situation',
  'opportunities', 85, [3, 4],
  ['participate in a higher-pressure situation with adult support present',
   'participate using a chosen fluency strategy',
   'participate in unfamiliar higher-pressure situations without avoiding them'],
  { note: 'Avoidance is the outcome that matters most in adolescence — a student who is technically fluent but stops speaking in class has not met this goal.' });

SF('cm-sf-04', 'Self-advocacy about a fluency difference',
  'Given a situation in which a listener reacts to a disfluency',
  'respond with a prepared statement explaining what the listener can do',
  'opportunities', 80, [3, 4],
  ['state a prepared explanation when rehearsed with an adult',
   'state the explanation in a familiar setting',
   'state the explanation to an unfamiliar listener in a real situation']);

// ---- voice ---------------------------------------------------------------------------------------
const VC = section({
  domain: 'Communication', sub: 'Voice', pool: 'co-voice',
  std: 'IL ELA SL.{gg}.6', dx: ['SLI', 'MD'], fade: 'behavior', bands: ['6-8', '9-12']
});

VC('cm-vc-01', 'Using appropriate vocal volume for the setting',
  'Given speaking situations that differ in required volume',
  'speak at a volume appropriate to the setting',
  'opportunities', 85, [4, 5],
  ['adjust volume when an adult gives a signal',
   'adjust volume when given a visual reminder',
   'use appropriate volume across settings without a reminder']);

VC('cm-vc-02', 'Applying vocal hygiene strategies',
  'Given a full school day',
  'apply the taught vocal hygiene strategies',
  'opportunities', 85, [4, 5],
  ['name the vocal hygiene strategies on request',
   'apply the strategies when reminded',
   'apply the strategies independently across the school day']);

VC('cm-vc-03', 'Producing speech with an easy vocal quality',
  'Given a rated speaking sample',
  'produce speech rated as having an easy, non-strained vocal quality',
  'rubric', 3, [3, 4],
  ['produce easy vocal quality in sustained vowels',
   'produce easy vocal quality at the sentence level',
   'produce easy vocal quality in conversational speech']);

// ---- AAC -------------------------------------------------------------------------------------------
const AC = section({
  domain: 'Communication', sub: 'AAC Use', pool: 'co-aac',
  std: 'IL ELA SL.{gg}.1', dx: ['MD', 'ID', 'ASD', 'SLI'], fade: 'behavior'
});

AC('cm-ac-01', 'Using an AAC system to make requests',
  'Given a communication opportunity requiring a request in {setting}',
  'use the AAC system to make the request',
  'opportunities', 85, [4, 5],
  ['use the system to request with a partner-provided model',
   'use the system to request with a gestural prompt only',
   'use the system to request independently across settings and partners']);

AC('cm-ac-02', 'Using an AAC system for a range of communicative functions',
  'Given communication opportunities across the school day',
  'use the AAC system to request, comment, protest and ask questions',
  'opportunities', 80, [4, 5],
  ['use the system to request and to protest',
   'use the system to request, protest and comment',
   'use the system for all four functions across settings and partners'],
  { note: 'Requesting alone is a vending machine, not communication — a system used only to request predicts abandonment.' });

AC('cm-ac-03', 'Navigating an AAC system to locate vocabulary',
  'Given a target message requiring more than one page or category',
  'navigate the system to locate the vocabulary and produce the message',
  'accuracy', 85, [4, 5],
  ['locate vocabulary on the home page',
   'navigate one level to locate vocabulary in a category',
   'navigate multiple levels to locate vocabulary and return to the home page']);

AC('cm-ac-04', 'Combining symbols or words into longer messages',
  'Given a communication opportunity requiring more than one word',
  'combine symbols or words into a message of the target length',
  'accuracy', 85, [4, 5],
  ['produce two-symbol combinations',
   'produce three-symbol combinations',
   'produce four-or-more-symbol messages with appropriate word order']);

AC('cm-ac-05', 'Repairing communication breakdowns using AAC',
  'Given a partner who does not understand the AAC message',
  'repair the message by repeating, rephrasing or adding information',
  'opportunities', 80, [4, 5],
  ['repeat the message when the partner signals confusion',
   'add a symbol or word to clarify the message',
   'repair the breakdown independently by rephrasing or adding information']);

AC('cm-ac-06', 'Managing and maintaining the AAC device',
  'Given the student\'s own AAC device across a school day',
  'keep the device charged, present and available at every activity',
  'opportunities', 90, [4, 5],
  ['bring the device to activities when reminded by an adult',
   'bring the device when prompted by a visual schedule',
   'keep the device charged, present and available independently all day'],
  { bands: ['9-12', '18-22'] });

RE('cm-re-07', 'Listening for specific information',
  'Given a spoken announcement, briefing or set of instructions',
  'identify and record the specific information requested',
  'accuracy', 90, [4, 5],
  ['identify one requested piece of information',
   'identify and record two requested pieces of information',
   'identify and record all requested details, including times, names and numbers']);

EX('cm-ex-08', 'Answering questions with the right amount of information',
  'Given questions requiring answers of different lengths',
  'answer with enough information to be useful and no more',
  'rubric', 3, [3, 4],
  ['answer the question that was asked',
   'answer with the necessary detail',
   'answer with complete and relevant information without going off topic']);

PR('cm-pr-08', 'Communicating appropriately in digital messages',
  'Given a message to send to a teacher, employer or peer',
  'write a message with tone and content appropriate to the recipient',
  'opportunities', 85, [4, 5],
  ['send a message with an appropriate greeting',
   'send a message with appropriate tone for the recipient',
   'send messages appropriate in tone, content and timing across all recipient types']);

module.exports = collect(RE, EX, PR, AR, SF, VC, AC);
