// =============================================================
// Ace Manager — goal taxonomy: Self-Advocacy
// =============================================================
// Illinois requires the student to be invited to the IEP meeting from age 14 1/2
// and requires transfer-of-rights notice at 17. These goals are what make that
// invitation mean something: a student who can describe their own disability,
// name their accommodations and ask for them is the difference between an IEP
// that ends at graduation and a person who can get what they need afterward.

'use strict';
const { section, collect } = require('./dsl');

// ---- requesting accommodations ---------------------------------------------------
const AC = section({
  domain: 'Self-Advocacy', sub: 'Requesting Accommodations', pool: 'sa-accommodations',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID', 'SLI', 'MD'], fade: 'behavior'
});

AC('sa-ac-01', 'Naming own accommodations',
  'Given a request to describe the supports listed in the student\'s IEP',
  'name each accommodation and what it does',
  'accuracy', 90, [3, 4],
  ['name two accommodations from the IEP',
   'name every accommodation in the IEP',
   'name every accommodation, what it does and which class each matters most in'],
  { fade: 'academic' });

AC('sa-ac-02', 'Requesting an accommodation from a teacher',
  'Given a class situation in which an accommodation is needed',
  'request the accommodation directly from the teacher',
  'opportunities', 85, [4, 5],
  ['request the accommodation with the case manager present',
   'request the accommodation after a reminder',
   'request the accommodation directly and independently when it is needed']);

AC('sa-ac-03', 'Explaining why an accommodation is needed',
  'Given a request to justify an accommodation',
  'explain what the accommodation does and why it is needed',
  'rubric', 3, [3, 4],
  ['state what the accommodation is',
   'state what the accommodation does',
   'state what it does, why it is needed and what happens without it'],
  { pool: 'co-expressive' });

AC('sa-ac-04', 'Requesting accommodations in a postsecondary or work setting',
  'Given a college disability services office or an employer',
  'request accommodations through the correct process with the required documentation',
  'steps', 85, [3, 4],
  ['state who to contact to request accommodations',
   'complete a request with adult support',
   'complete the full request process independently, including documentation'],
  { bands: ['9-12', '18-22'], pool: 'vo-jobtask', fade: 'functional',
    note: 'Postsecondary accommodations are student-initiated and documentation-gated — nobody will offer them. Practise the request before the student needs it.' });

AC('sa-ac-05', 'Responding when an accommodation is refused or not provided',
  'Given a situation in which an accommodation was not provided',
  'state the problem to the right person and follow up',
  'opportunities', 80, [3, 4],
  ['tell the case manager that the accommodation was not provided',
   'state the problem to the teacher directly',
   'state the problem, request a solution and follow up if it is not resolved'],
  { bands: ['9-12', '18-22'] });

AC('sa-ac-06', 'Declining an accommodation that is not helping',
  'Given an accommodation that is not working for the student',
  'state why it is not helping and propose an alternative',
  'rubric', 3, [3, 4],
  ['state that the accommodation is not helping',
   'state why it is not helping',
   'state why it is not helping and propose a specific alternative'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

// ---- disability awareness -----------------------------------------------------------
const DA = section({
  domain: 'Self-Advocacy', sub: 'Disability Awareness', pool: 'sa-awareness',
  std: 'IL SEL 1A', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID', 'SLI', 'MD'], fade: 'academic'
});

DA('sa-da-01', 'Describing own learning strengths and needs',
  'Given a reflection prompt or a conversation with an adult',
  'describe personal learning strengths and areas of difficulty with examples',
  'rubric', 3, [3, 4],
  ['name one strength and one area of difficulty',
   'describe strengths and difficulties with an example of each',
   'describe strengths and difficulties, with examples and the strategies that help'],
  { pool: 'co-expressive' });

DA('sa-da-02', 'Describing own disability accurately',
  'Given a request to explain the student\'s disability to another person',
  'describe the disability in accurate, non-deficit language',
  'rubric', 3, [3, 4],
  ['name the disability category',
   'describe how the disability affects learning',
   'describe the disability, its effect on learning and what supports address it'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

DA('sa-da-03', 'Knowing which strategies work for the student',
  'Given a learning task and a set of possible strategies',
  'select the strategy that works best for the student and state why',
  'accuracy', 85, [4, 5],
  ['name two strategies that help',
   'select an effective strategy for a given task',
   'select an effective strategy, use it and state why it fits the task']);

DA('sa-da-04', 'Understanding disability rights',
  'Given questions about IDEA, Section 504 and the ADA',
  'state which law applies in each setting and what it guarantees',
  'accuracy', 85, [3, 4],
  ['state that students with disabilities have legal rights to support',
   'state which law applies in school and which applies at work or college',
   'state what each law guarantees and what the student must do to invoke it'],
  { bands: ['9-12', '18-22'] });

DA('sa-da-05', 'Understanding the transfer of rights at 18',
  'Given information about the transfer of educational rights at age 18',
  'state what changes at 18 and what decisions the student will make',
  'accuracy', 85, [3, 4],
  ['state that rights transfer at age 18',
   'state which decisions become the student\'s at 18',
   'state what transfers, what the options are for shared decision-making, and where to get advice'],
  { bands: ['9-12', '18-22'],
    note: 'Illinois requires notice of the transfer of rights at 17 — a student who first hears about it in the meeting where it happens has not been prepared.' });

DA('sa-da-06', 'Disclosing a disability appropriately by setting',
  'Given school, work and social settings',
  'decide whether to disclose, to whom, and what to say',
  'accuracy', 85, [3, 4],
  ['state that disclosure is the student\'s choice',
   'state who needs to know in a given setting',
   'decide whether to disclose in each setting and state what to say and what to withhold'],
  { bands: ['9-12', '18-22'] });

// ---- help-seeking ------------------------------------------------------------------------
const HK = section({
  domain: 'Self-Advocacy', sub: 'Help-Seeking', pool: 'sa-helpseeking',
  std: 'IL SEL 1C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID', 'SLI'], fade: 'selfreport'
});

HK('sa-hk-01', 'Asking for help when stuck',
  'Given a task the student cannot complete alone',
  'ask for help before the work period ends',
  'opportunities', 85, [4, 5],
  ['signal for help when an adult checks in',
   'ask for help within the work period',
   'ask for help within five minutes of getting stuck']);

HK('sa-hk-02', 'Asking a specific question',
  'Given a point of confusion in an assignment',
  'ask a question that names exactly what is not understood',
  'accuracy', 85, [4, 5],
  ['ask a general question such as "can you help me?"',
   'name the part of the task that is confusing',
   'ask a specific question naming exactly what is not understood and what was already tried'],
  { fade: 'academic',
    note: '"I don\'t get it" gets a re-explanation of everything; a specific question gets the twenty seconds the student actually needed.' });

HK('sa-hk-03', 'Identifying the right person to ask',
  'Given {nshort} problems of different types',
  'name the correct person to approach for each',
  'accuracy', 90, [4, 5],
  ['name the case manager as a source of help',
   'name the correct person for academic and schedule problems',
   'name the correct person for academic, health, schedule, social and safety problems'],
  { fade: 'academic' });

HK('sa-hk-04', 'Using office hours, tutoring and support services',
  'Given available academic support services',
  'access the support service without adult arrangement',
  'opportunities', 85, [3, 4],
  ['attend a support session arranged by an adult',
   'arrange a support session with a reminder',
   'identify the need, arrange and attend a support session independently'],
  { bands: ['9-12', '18-22'] });

HK('sa-hk-05', 'Asking for help before a deadline rather than after',
  'Given an assignment the student will not finish on time',
  'notify the teacher and request support before the due date',
  'opportunities', 80, [3, 4],
  ['notify the teacher after the deadline has passed',
   'notify the teacher on the day the work is due',
   'notify the teacher and request support before the due date']);

// ---- IEP participation ------------------------------------------------------------------------
const IP = section({
  domain: 'Self-Advocacy', sub: 'IEP Participation', pool: 'sa-iep',
  std: 'IL SEL 3C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID', 'SLI', 'MD'],
  fade: 'academic', bands: ['6-8', '9-12', '18-22']
});

IP('sa-ip-01', 'Preparing for the IEP meeting',
  'Given a student IEP preparation form',
  'complete the form stating strengths, needs, goals and requests before the meeting',
  'accuracy', 85, [3, 4],
  ['complete the strengths and needs sections with support',
   'complete the full preparation form with support',
   'complete the full preparation form independently before the meeting']);

IP('sa-ip-02', 'Attending and participating in the IEP meeting',
  'Given the student\'s own IEP meeting',
  'attend and contribute to the discussion of goals and services',
  'opportunities', 85, [3, 4],
  ['attend the meeting',
   'attend and answer questions when asked directly',
   'attend, present prepared input and respond to the team\'s discussion']);

IP('sa-ip-03', 'Presenting parts of the student\'s own IEP',
  'Given a prepared section of the IEP to present',
  'present the section to the team',
  'rubric', 3, [3, 4],
  ['read a prepared statement to the team',
   'present strengths and interests from prepared notes',
   'present strengths, needs, goals and requested supports and answer follow-up questions'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

IP('sa-ip-04', 'Stating postsecondary goals in the meeting',
  'Given the transition portion of the IEP meeting',
  'state postsecondary goals for education, employment and independent living',
  'rubric', 3, [3, 4],
  ['state one postsecondary goal',
   'state postsecondary goals for education and employment',
   'state goals in all three transition areas and the steps needed to reach them'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

IP('sa-ip-05', 'Knowing what is in the student\'s own IEP',
  'Given questions about the student\'s current IEP',
  'state the goals, services and accommodations it contains',
  'accuracy', 85, [3, 4],
  ['state how many goals are in the IEP and what areas they cover',
   'state each goal area and the services received',
   'state goals, services, accommodations and the date of the next review']);

IP('sa-ip-06', 'Disagreeing with the team respectfully',
  'Given a proposal in the IEP meeting the student does not agree with',
  'state the disagreement and propose an alternative',
  'rubric', 3, [3, 4],
  ['state that the student does not agree',
   'state the disagreement and the reason',
   'state the disagreement, the reason and a specific alternative proposal'],
  { pool: 'co-expressive', bands: ['9-12', '18-22'] });

// ---- self-determination ---------------------------------------------------------------------------
const SD = section({
  domain: 'Self-Advocacy', sub: 'Self-Determination', pool: 'sa-determination',
  std: 'IL SEL 3C', dx: ['SLD', 'OHI', 'ASD', 'ED', 'ID', 'MD'], fade: 'selfreport'
});

SD('sa-sd-01', 'Setting a personal goal and tracking it',
  'Given a goal-setting template',
  'set a specific personal goal and track progress on a set schedule',
  'opportunities', 85, [3, 4],
  ['set a personal goal with adult support',
   'set a specific, measurable goal independently',
   'set the goal, track progress on schedule and adjust the plan based on the data']);

SD('sa-sd-02', 'Making informed choices',
  'Given a decision with real consequences',
  'state the options and their consequences, then choose',
  'accuracy', 85, [3, 4],
  ['state two options for a decision',
   'state the options and one consequence of each',
   'state the options, consequences and the reason for the final choice'],
  { fade: 'academic' });

SD('sa-sd-03', 'Advocating for a preference or change',
  'Given a situation the student wants changed',
  'state the request to the right person with a reason and a proposed solution',
  'rubric', 3, [3, 4],
  ['state the preference to a familiar adult',
   'state the request with a reason',
   'state the request, the reason and a proposed solution to the correct person'],
  { pool: 'co-expressive' });

SD('sa-sd-04', 'Taking responsibility for a commitment',
  'Given a commitment the student has made',
  'follow through on the commitment or renegotiate it in advance',
  'opportunities', 85, [3, 4],
  ['follow through when reminded',
   'follow through on most commitments without a reminder',
   'follow through on every commitment or renegotiate it before the deadline']);

SD('sa-sd-05', 'Evaluating own performance honestly',
  'Given completed work and a rubric or standard',
  'evaluate the work against the standard and identify what to change',
  'accuracy', 85, [3, 4],
  ['state whether the work met the standard',
   'identify which parts met the standard and which did not',
   'evaluate the work accurately and state a specific change for next time'],
  { fade: 'academic' });

SD('sa-sd-06', 'Identifying and using a personal support network',
  'Given a list of the people and agencies who support the student',
  'name each support, what they help with and how to contact them',
  'accuracy', 90, [3, 4],
  ['name three people who support the student',
   'name each support and what they help with',
   'name each support, what they help with and how to contact them without assistance'],
  { fade: 'academic', bands: ['9-12', '18-22'] });

AC('sa-ac-07', 'Using accommodations consistently once they are in place',
  'Given an accommodation that has already been arranged',
  'use the accommodation in the situations it was intended for',
  'opportunities', 85, [4, 5],
  ['use the accommodation when an adult sets it up',
   'use the accommodation after a reminder',
   'use the accommodation in every situation it applies to, without a reminder'],
  { note: 'Refusing an accommodation to avoid standing out is common in high school; if the data show low uptake, the problem is social, not procedural.' });

DA('sa-da-07', 'Explaining what helps and what does not to a new teacher',
  'Given a new teacher, term or setting',
  'explain the supports that work and the ones that do not',
  'rubric', 3, [3, 4],
  ['state one support that helps',
   'state the supports that help and one that does not',
   'explain what helps, what does not, and what the teacher can do differently'],
  { pool: 'co-expressive' });

HK('sa-hk-06', 'Following up when a request goes unanswered',
  'Given a request for help that has received no response',
  'follow up through an appropriate channel within a reasonable time',
  'opportunities', 80, [3, 4],
  ['state that the request went unanswered',
   'follow up once with adult support',
   'follow up independently through an appropriate channel and escalate if still unanswered']);

module.exports = collect(AC, DA, HK, IP, SD);
