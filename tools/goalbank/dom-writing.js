// =============================================================
// Ace Manager — goal taxonomy: Written Language
// =============================================================
// Composition goals are scored by an adult against a rubric or in correct word
// sequences, never auto-scored: a machine can check a comma, but the moment a
// goal is about what the student actually wrote, a person has to read it.

'use strict';
const { section, collect } = require('./dsl');

// ---- mechanics & conventions --------------------------------------------------
const ME = section({
  domain: 'Written Language', sub: 'Mechanics & Conventions', pool: 'wr-mechanics',
  std: 'IL ELA L.{gg}.2', dx: ['SLD', 'OHI', 'SLI', 'ID']
});

ME('wl-me-01', 'Capitalization in written work',
  'Given {n} sentences containing capitalization errors',
  'correct every capitalization error',
  'accuracy', 90, [4, 5],
  ['capitalize the first word of a sentence and the pronoun I',
   'capitalize proper nouns, including names, places and days',
   'capitalize titles, proper adjectives and the first word of a quotation']);

ME('wl-me-02', 'End punctuation and sentence boundaries',
  'Given a paragraph written without end punctuation',
  'mark each sentence boundary with the correct end punctuation',
  'accuracy', 90, [4, 5],
  ['place periods at the end of declarative sentences',
   'choose correctly among periods, question marks and exclamation points',
   'mark sentence boundaries in a run-on paragraph and punctuate each one correctly']);

ME('wl-me-03', 'Comma use in sentences',
  'Given {n} sentences requiring commas',
  'insert commas where they are required and omit them where they are not',
  'accuracy', 85, [4, 5],
  ['use commas in a series and in dates and addresses',
   'use commas after introductory elements and before a coordinating conjunction',
   'use commas with nonrestrictive elements and avoid comma splices']);

ME('wl-me-04', 'Apostrophes in contractions and possessives',
  'Given {n} sentences containing apostrophe errors',
  'correct each apostrophe error',
  'accuracy', 90, [4, 5],
  ['form contractions with a correctly placed apostrophe',
   'form singular possessives correctly',
   'distinguish plural, singular possessive and plural possessive forms']);

ME('wl-me-05', 'Quotation marks and dialogue punctuation',
  'Given {nshort} sentences containing direct quotations',
  'punctuate each quotation correctly',
  'accuracy', 85, [4, 5],
  ['place quotation marks around the speaker\'s exact words',
   'punctuate a quotation with a correctly placed comma and end mark',
   'punctuate dialogue with correct paragraphing and interrupted quotations'],
  { bands: ['6-8', '9-12'] });

ME('wl-me-06', 'Homophone accuracy in writing',
  'Given {n} sentences containing commonly confused homophones',
  'select the correct homophone for each sentence',
  'accuracy', 90, [4, 5],
  ['choose correctly between to, too and two',
   'choose correctly among their, there and they\'re and your and you\'re',
   'choose correctly among 20 commonly confused homophone sets in original writing']);

ME('wl-me-07', 'Applying conventions in own extended writing',
  'Given an original paragraph of at least 8 sentences written by the student',
  'produce writing in which capitalization, punctuation and spelling are correct',
  'accuracy', 90, [3, 4],
  ['produce a paragraph with correct capitalization and end punctuation',
   'produce a paragraph with correct capitalization, end punctuation and internal commas',
   'produce an extended piece with all conventions correct after self-editing'],
  { note: 'Conventions accuracy on a worksheet and conventions accuracy in the student\'s own writing are different skills — this goal is the one that shows up in the gradebook.' });

// ---- spelling -------------------------------------------------------------------
const SP = section({
  domain: 'Written Language', sub: 'Spelling', pool: 'ws-spelling',
  std: 'IL ELA L.{gg}.2', dx: ['SLD', 'SLI', 'OHI']
});

SP('wl-sp-01', 'Spelling words with regular vowel patterns',
  'Given {n} dictated words containing taught vowel patterns',
  'spell each word correctly',
  'accuracy', 90, [4, 5],
  ['spell one-syllable closed and open syllable words',
   'spell words with vowel teams and r-controlled vowels',
   'spell multisyllabic words applying all six syllable types']);

SP('wl-sp-02', 'Applying spelling rules for adding suffixes',
  'Given {n} base words and suffixes to add',
  'apply the doubling, drop-e and change-y rules correctly',
  'accuracy', 85, [4, 5],
  ['apply the drop-e rule when adding a vowel suffix',
   'apply the doubling rule to one-syllable base words',
   'apply doubling, drop-e and change-y rules to multisyllabic base words']);

SP('wl-sp-03', 'Spelling high-frequency irregular words',
  'Given {n} dictated high-frequency words with irregular spellings',
  'spell each word correctly',
  'accuracy', 90, [4, 5],
  ['spell the 100 most frequent irregular words',
   'spell the 200 most frequent irregular words',
   'spell the 300 most frequent irregular words correctly in dictated sentences']);

SP('wl-sp-04', 'Spelling content-area and technical vocabulary',
  'Given {nshort} dictated technical terms from a current {course} unit',
  'spell each term correctly',
  'accuracy', 85, [4, 5],
  ['spell unit terms with a word bank available',
   'spell unit terms from dictation',
   'spell unit terms correctly within original written work']);

SP('wl-sp-05', 'Using morphology to spell derived words',
  'Given {nshort} base words and a target derived form',
  'spell the derived form correctly using known prefixes and suffixes',
  'accuracy', 85, [4, 5],
  ['spell base word plus prefix correctly',
   'spell base word plus derivational suffix correctly',
   'spell multi-morphemic words containing both a prefix and a suffix'],
  { std: 'IL ELA L.{gg}.4b' });

SP('wl-sp-06', 'Using spelling supports and proofreading strategies',
  'Given an original piece of writing and access to a spell-checker or word list',
  'locate and correct misspelled words using the available support',
  'accuracy', 85, [4, 5],
  ['identify words flagged by a spell-checker and choose the correct replacement',
   'locate misspellings a spell-checker does not flag, such as homophones',
   'proofread an original piece and correct all misspellings using available supports'],
  { note: 'A student who cannot spell but can proofread with tools is functionally literate at work; teach both lines at once rather than waiting for the first to finish.' });

// ---- grammar & usage --------------------------------------------------------------
const US = section({
  domain: 'Written Language', sub: 'Grammar & Usage', pool: 'wr-usage',
  std: 'IL ELA L.{gg}.1', dx: ['SLD', 'SLI', 'ID', 'OHI']
});

US('wl-us-01', 'Subject-verb agreement',
  'Given {n} sentences containing subject-verb agreement errors',
  'correct each agreement error',
  'accuracy', 90, [4, 5],
  ['correct agreement with simple singular and plural subjects',
   'correct agreement when a phrase separates the subject and verb',
   'correct agreement with compound, collective and indefinite-pronoun subjects']);

US('wl-us-02', 'Consistent and correct verb tense',
  'Given a paragraph containing verb tense errors',
  'correct each verb so the tense is accurate and consistent',
  'accuracy', 85, [4, 5],
  ['use regular past tense verbs correctly',
   'use common irregular past tense verbs correctly',
   'maintain consistent tense across a paragraph and shift tense only when meaning requires it']);

US('wl-us-03', 'Pronoun case and clear antecedents',
  'Given {n} sentences containing pronoun errors',
  'correct each pronoun so its case and antecedent are clear',
  'accuracy', 85, [4, 5],
  ['choose the correct subject or object pronoun',
   'match a pronoun to its antecedent in number and person',
   'revise sentences with ambiguous or missing antecedents']);

US('wl-us-04', 'Using modifiers correctly',
  'Given {n} sentences containing adjective and adverb errors',
  'correct each modifier error',
  'accuracy', 85, [4, 5],
  ['choose between an adjective and an adverb form',
   'use comparative and superlative forms correctly',
   'relocate misplaced and dangling modifiers so the meaning is clear'],
  { bands: ['6-8', '9-12'] });

US('wl-us-05', 'Parallel structure in sentences',
  'Given {nshort} sentences containing faulty parallel structure',
  'revise each sentence so the elements are parallel',
  'accuracy', 85, [4, 5],
  ['identify the list or paired elements in a sentence',
   'revise a list so all items share the same form',
   'revise paired and correlative constructions so both parts are parallel'],
  { bands: ['9-12', '18-22'] });

US('wl-us-06', 'Using a range of sentence types',
  'Given a writing prompt',
  'write a paragraph containing simple, compound and complex sentences',
  'accuracy', 85, [3, 4],
  ['write correct simple sentences',
   'write correct compound sentences using a coordinating conjunction',
   'write a paragraph containing at least one simple, one compound and one complex sentence']);

// ---- sentence construction -----------------------------------------------------------
const SE = section({
  domain: 'Written Language', sub: 'Sentence Construction', pool: 'wr-sentence',
  std: 'IL ELA L.{gg}.1', dx: ['SLD', 'SLI', 'ID', 'OHI']
});

SE('wl-se-01', 'Writing complete sentences',
  'Given {n} sentence fragments and run-ons',
  'rewrite each as a complete, correctly punctuated sentence',
  'accuracy', 90, [4, 5],
  ['identify whether a group of words is a complete sentence',
   'rewrite fragments as complete sentences',
   'rewrite fragments and run-ons as complete, correctly punctuated sentences']);

SE('wl-se-02', 'Combining sentences to reduce choppiness',
  'Given {nshort} pairs of short related sentences',
  'combine each pair into one clear sentence',
  'accuracy', 85, [4, 5],
  ['combine two sentences with a coordinating conjunction',
   'combine two sentences with a subordinating conjunction',
   'combine three related sentences into one clear sentence without changing meaning'],
  { std: 'IL ELA W.{gg}.4' });

SE('wl-se-03', 'Expanding sentences with detail',
  'Given {nshort} simple sentences',
  'expand each sentence by adding detail that answers when, where, why or how',
  'accuracy', 85, [4, 5],
  ['add one detail phrase to a simple sentence',
   'add two detail phrases answering different questions',
   'expand a sentence with detail and correct punctuation for the added elements']);

SE('wl-se-04', 'Varying sentence beginnings',
  'Given a paragraph in which most sentences begin the same way',
  'revise the paragraph so sentence beginnings vary',
  'accuracy', 85, [3, 4],
  ['identify sentences that begin the same way',
   'revise two sentences to begin with a different word or phrase',
   'revise a paragraph so no more than two sentences begin with the same word'],
  { std: 'IL ELA W.{gg}.4' });

SE('wl-se-05', 'Writing topic sentences',
  'Given a set of supporting details',
  'write a topic sentence that states the main idea the details support',
  'accuracy', 85, [3, 4],
  ['choose the best topic sentence from three options',
   'write a topic sentence for a set of given details',
   'write a topic sentence that both states the main idea and previews the details'],
  { std: 'IL ELA W.{gg}.2a' });

SE('wl-se-06', 'Using transition words and phrases',
  'Given a paragraph written without transitions',
  'insert transition words that show the relationship between ideas',
  'accuracy', 85, [4, 5],
  ['insert sequence transitions such as first, next and finally',
   'insert cause, contrast and example transitions',
   'insert transitions that accurately match the logical relationship in each case'],
  { std: 'IL ELA W.{gg}.2c' });

// ---- paragraph & composition -----------------------------------------------------------
const PG = section({
  domain: 'Written Language', sub: 'Paragraph & Composition', pool: 'wr-paragraph',
  std: 'IL ELA W.{gg}.2', dx: ['SLD', 'OHI', 'SLI', 'ASD'], fade: 'academic'
});

PG('wl-pg-01', 'Writing a complete informative paragraph',
  'Given a topic and a graphic organizer',
  'write a paragraph with a topic sentence, at least three supporting details and a closing sentence',
  'rubric', 3, [3, 4],
  ['write a topic sentence and two supporting details',
   'write a topic sentence, three supporting details and a closing sentence',
   'write a complete paragraph in which every detail supports the topic sentence']);

PG('wl-pg-02', 'Writing a multi-paragraph informative text',
  'Given a topic, sources and a planning organizer',
  'write a multi-paragraph informative text with an introduction, body paragraphs and a conclusion',
  'rubric', 3, [3, 4],
  ['produce a completed plan naming the introduction, body points and conclusion',
   'write an introduction and two body paragraphs from the plan',
   'write a complete multi-paragraph text with an introduction, three body paragraphs and a conclusion']);

PG('wl-pg-03', 'Writing an argument with claim and evidence',
  'Given a debatable prompt and two sources',
  'write an argument that states a claim, supports it with evidence and addresses a counterclaim',
  'rubric', 3, [3, 4],
  ['state a clear claim in response to a prompt',
   'support a claim with two pieces of evidence from the sources',
   'write an argument with a claim, supporting evidence, and a response to one counterclaim'],
  { std: 'IL ELA W.{gg}.1', bands: ['9-12', '18-22'] });

PG('wl-pg-04', 'Writing a narrative with sequence and detail',
  'Given a narrative prompt and a sequence organizer',
  'write a narrative with a clear sequence of events, descriptive detail and a conclusion',
  'rubric', 3, [3, 4],
  ['write events in the correct order',
   'write a narrative with a beginning, middle and end plus sensory detail',
   'write a narrative with clear sequence, descriptive detail, dialogue and a resolved ending'],
  { std: 'IL ELA W.{gg}.3', bands: ['6-8', '9-12'] });

PG('wl-pg-05', 'Written expression fluency',
  'Given a writing prompt and three minutes',
  'write continuously, producing correct word sequences',
  'cws', { '6-8': 45, '9-12': 55, '18-22': 50 }, [3, 4],
  ['write continuously for three minutes without stopping',
   'write continuously producing correct word sequences above the baseline median',
   'write continuously producing correct word sequences at the target rate'],
  { note: 'Correct word sequences is the CBM writing metric — it catches the student who writes a lot of unusable text and the one who writes two perfect sentences, and total words written catches neither.' });

PG('wl-pg-06', 'Organizing writing with a plan before drafting',
  'Given a writing prompt and a choice of planning tools',
  'produce a written plan and then draft from it without departing from the plan',
  'rubric', 3, [3, 4],
  ['complete a provided graphic organizer before drafting',
   'choose and complete an appropriate planning tool before drafting',
   'produce a plan independently and write a draft that follows it'],
  { std: 'IL ELA W.{gg}.5' });

PG('wl-pg-07', 'Writing a summary of a source text',
  'Given a source text and a summary frame',
  'write a summary that states the source\'s main points in the student\'s own words',
  'rubric', 3, [3, 4],
  ['state the source\'s topic and main point in one sentence',
   'write a summary covering the main points using the frame',
   'write an accurate summary without a frame and with no copied phrasing'],
  { std: 'IL ELA W.{gg}.9' });

PG('wl-pg-08', 'Writing an on-demand timed response',
  'Given an on-demand prompt and a fixed time limit',
  'plan, draft and finish a complete response within the time allowed',
  'rubric', 3, [3, 4],
  ['produce a plan and a partial draft within the time limit',
   'produce a complete draft within the time limit',
   'produce a complete, edited response within the time limit'],
  { bands: ['9-12', '18-22'],
    note: 'Timed writing is a separate skill from writing; a student who writes well untimed and freezes on a test needs this goal, not more instruction in paragraphs.' });

// ---- editing & revision ---------------------------------------------------------------------
const ED = section({
  domain: 'Written Language', sub: 'Editing & Revision', pool: 'wr-editing',
  std: 'IL ELA W.{gg}.5', dx: ['SLD', 'OHI', 'ASD', 'SLI']
});

ED('wl-ed-01', 'Editing for conventions using a checklist',
  'Given a draft containing convention errors and an editing checklist',
  'find and correct the errors using the checklist',
  'accuracy', 85, [4, 5],
  ['find and correct capitalization and end punctuation errors',
   'find and correct capitalization, punctuation and spelling errors',
   'find and correct all convention errors in an unfamiliar draft using the checklist']);

ED('wl-ed-02', 'Revising for clarity and word choice',
  'Given a draft containing vague or repeated word choices',
  'revise the draft to replace vague words with precise ones',
  'accuracy', 85, [4, 5],
  ['identify vague or repeated words in a draft',
   'replace vague words with more precise alternatives',
   'revise a draft for precision and explain why each change improves it'],
  { std: 'IL ELA L.{gg}.3' });

ED('wl-ed-03', 'Revising for organization',
  'Given a draft whose paragraphs are out of order or off topic',
  'reorder and remove content so the draft follows a logical organization',
  'accuracy', 85, [3, 4],
  ['identify the sentence in a paragraph that does not belong',
   'reorder the sentences of a paragraph into logical order',
   'reorder paragraphs and delete off-topic content across a full draft']);

ED('wl-ed-04', 'Responding to teacher and peer feedback',
  'Given a returned draft with written feedback',
  'make a revision addressing each feedback comment',
  'opportunities', 90, [3, 4],
  ['restate what a feedback comment is asking for',
   'make a revision addressing each surface-level comment',
   'make revisions addressing every comment, including comments about content'],
  { note: 'Track whether the revision actually addresses the comment; students who retype a draft unchanged still hand in a "revised" copy.' });

ED('wl-ed-05', 'Self-editing before submission',
  'Given a finished draft and the student\'s own editing routine',
  'complete the editing routine before submitting the work',
  'opportunities', 90, [4, 5],
  ['complete an editing routine when reminded by an adult',
   'complete an editing routine when prompted by a written checklist',
   'complete the editing routine independently before every submission'],
  { fade: 'behavior', pool: 'wr-editing' });

// ---- research & citation --------------------------------------------------------------------
const RS = section({
  domain: 'Written Language', sub: 'Research & Citation', pool: 'wr-research',
  std: 'IL ELA W.{gg}.8', dx: ['SLD', 'OHI', 'ASD'], bands: ['9-12', '18-22']
});

RS('wl-rs-01', 'Locating relevant sources for a research question',
  'Given a research question and access to a school database or search engine',
  'locate sources that directly address the question',
  'accuracy', 85, [3, 4],
  ['locate one source on the general topic',
   'locate three sources that address the research question',
   'locate three relevant sources and explain how each relates to the question']);

RS('wl-rs-02', 'Taking notes from a source without plagiarizing',
  'Given a source text and a note-taking template',
  'record notes in the student\'s own words with the source recorded',
  'accuracy', 85, [3, 4],
  ['record notes on a template with the source noted',
   'record notes in own words rather than copied phrases',
   'record paraphrased notes with a correctly recorded source for every note'],
  { std: 'IL ELA W.{gg}.8' });

RS('wl-rs-03', 'Citing sources in a required format',
  'Given source information and a citation format guide',
  'produce a correctly formatted citation for each source',
  'accuracy', 85, [3, 4],
  ['produce a citation with the format guide and a completed template',
   'produce a citation from source information using the format guide',
   'produce correctly formatted citations for print and digital sources without a template']);

RS('wl-rs-04', 'Integrating evidence into writing',
  'Given research notes and a draft',
  'integrate quoted or paraphrased evidence into the draft with an in-text citation',
  'accuracy', 85, [3, 4],
  ['insert a quotation with quotation marks and a citation',
   'insert a paraphrase with a citation',
   'integrate quoted and paraphrased evidence smoothly with correct citations throughout'],
  { std: 'IL ELA W.{gg}.9' });

RS('wl-rs-05', 'Distinguishing reliable from unreliable sources',
  'Given {nshort} sources of varying reliability on one topic',
  'rate each source and state the evidence for the rating',
  'accuracy', 85, [3, 4],
  ['state the author and publication date of a source',
   'sort sources into more and less reliable with a reason for each',
   'rate reliability using author, date, purpose and evidence and justify each rating']);

// ---- functional & workplace writing ---------------------------------------------------------------
const FW = section({
  domain: 'Written Language', sub: 'Functional Writing', pool: 'wr-functional',
  std: 'IL ELA W.{gg}.4', dx: ['ID', 'SLD', 'ASD', 'MD', 'OHI'], fade: 'functional'
});

FW('wl-fw-01', 'Completing forms and applications accurately',
  'Given a blank {doc} and a personal information sheet',
  'complete every required field accurately and legibly',
  'accuracy', 90, [4, 5],
  ['complete identifying information fields accurately',
   'complete history and reference sections accurately',
   'complete an unfamiliar form in full, including checkboxes, dates and signature']);

FW('wl-fw-02', 'Writing a professional email or message',
  'Given a workplace or school scenario requiring a written message',
  'write a message with an appropriate greeting, clear request and closing',
  'rubric', 3, [3, 4],
  ['write a message containing a greeting and a closing',
   'write a message with a greeting, a clear request and a closing',
   'write a message that is appropriately formal, states the request clearly and asks for a specific response'],
  { bands: ['9-12', '18-22'] });

FW('wl-fw-03', 'Writing a resume and cover letter',
  'Given a job posting and the student\'s experience record',
  'produce a resume and cover letter targeted to the posting',
  'rubric', 3, [3, 4],
  ['complete a resume template with accurate personal and school information',
   'produce a resume including work, volunteer and skill sections',
   'produce a resume and a cover letter that reference the specific posting'],
  { bands: ['9-12', '18-22'] });

FW('wl-fw-04', 'Writing to request or report at work',
  'Given a workplace scenario requiring written notice',
  'write a note that states the need, the timeframe and the required follow-up',
  'rubric', 3, [3, 4],
  ['write a note stating the need',
   'write a note stating the need and the timeframe',
   'write a note stating the need, the timeframe and what the student will do next'],
  { bands: ['18-22'] });

FW('wl-fw-05', 'Taking a written message accurately',
  'Given a spoken message containing a name, number and request',
  'record the message in writing with every detail accurate',
  'accuracy', 95, [4, 5],
  ['record the caller\'s name and the reason for the message',
   'record name, number and reason accurately',
   'record a complete message and read it back to confirm accuracy'],
  { bands: ['9-12', '18-22'] });

FW('wl-fw-06', 'Keeping a written schedule, log or record',
  'Given a daily planner, work log or personal record system',
  'record required entries accurately and on time',
  'opportunities', 90, [4, 5],
  ['make required entries when prompted by an adult',
   'make required entries when prompted by an alarm or written cue',
   'make complete and accurate entries independently every day'],
  { fade: 'behavior' });

ME('wl-me-08', 'Punctuating and formatting a list or set of steps',
  'Given information to present as a list or set of steps',
  'format the list with consistent punctuation, capitalization and numbering',
  'accuracy', 90, [4, 5],
  ['produce a list with consistent capitalization',
   'produce a numbered list with consistent punctuation',
   'produce a formatted list or procedure with consistent punctuation, capitalization and numbering']);

SE('wl-se-07', 'Writing a clear thesis or controlling idea',
  'Given a prompt requiring a position or focus',
  'write a thesis statement that states the position and previews the support',
  'accuracy', 85, [3, 4],
  ['choose the best thesis statement from three options',
   'write a thesis statement that states a clear position',
   'write a thesis that states the position and previews the supporting points'],
  { std: 'IL ELA W.{gg}.1a' });

PG('wl-pg-09', 'Writing a comparison of two texts or options',
  'Given two texts, products or options and an organizing structure',
  'write a comparison that addresses the same criteria for both',
  'rubric', 3, [3, 4],
  ['list similarities and differences on an organizer',
   'write a comparison covering two shared criteria',
   'write a comparison covering all criteria for both, with a stated conclusion']);

ED('wl-ed-06', 'Proofreading with text-to-speech',
  'Given a draft and text-to-speech software',
  'listen to the draft and correct the errors the reading reveals',
  'accuracy', 85, [4, 5],
  ['use text-to-speech to hear the draft read aloud',
   'identify errors revealed by the reading',
   'identify and correct every error revealed by the reading, including omitted words'],
  { note: 'Text-to-speech catches the omitted and doubled words a student\'s own eyes reliably skip; it is a proofreading strategy, not only an access tool.' });

module.exports = collect(ME, SP, US, SE, PG, ED, RS, FW);
