// =============================================================
// Ace Manager — goal taxonomy: Reading
// =============================================================
// Foundational-skill goals (phonology, decoding, fluency) cite the K-5
// Illinois/CCSS Reading Foundational standard they remediate, marked
// "(foundational)": there is no 6-12 phonics standard, and naming the real
// source standard is what an Illinois compliance monitor expects to see when a
// secondary student is working below grade level.

'use strict';
const { section, collect } = require('./dsl');

// ---- phonological awareness ---------------------------------------------------
const PA = section({
  domain: 'Reading', sub: 'Phonological Awareness', pool: 'ws-phonology',
  std: 'IL ELA RF.5.3 (foundational)', dx: ['SLD', 'SLI', 'ID']
});

PA('rd-pa-01', 'Syllable segmentation in multisyllabic academic words',
  'Given {n} orally presented multisyllabic {corpus} words',
  'state the number of syllables in each word',
  'accuracy', 90, [4, 5],
  ['segment two- and three-syllable words and state the syllable count',
   'segment four-syllable {corpus} words and state the syllable count',
   'segment four- and five-syllable {corpus} words and name the stressed syllable'],
  { gen_opts: { v: 'count' }, pool: 'ws-syllables', note: 'Syllable counting is the entry point to multisyllabic decoding — pair it with an explicit syllable-type routine rather than teaching it as an isolated auditory drill.' });

PA('rd-pa-02', 'Phoneme segmentation of single-syllable words',
  'Given {n} orally presented single-syllable words',
  'say each individual sound in the word in order',
  'accuracy', 90, [4, 5],
  ['segment three-phoneme words into individual sounds',
   'segment four-phoneme words containing a consonant blend',
   'segment four- and five-phoneme words containing blends and digraphs'],
  { gen_opts: { v: 'segment' } });

PA('rd-pa-03', 'Phoneme deletion and substitution',
  'Given an orally presented word and a direction to delete or substitute one sound',
  'state the new word that is formed',
  'accuracy', 85, [4, 5],
  ['delete the initial sound of a word and state the new word',
   'delete a sound from a consonant blend and state the new word',
   'substitute initial, medial or final sounds on request and state the new word'],
  { gen_opts: { v: 'deletesub' } });

PA('rd-pa-04', 'Phoneme blending into whole words',
  'Given a word presented orally one phoneme at a time',
  'blend the sounds and state the whole word',
  'accuracy', 90, [4, 5],
  ['blend three-phoneme words into whole words',
   'blend four-phoneme words containing blends into whole words',
   'blend five- and six-phoneme multisyllabic words into whole words'],
  { gen_opts: { v: 'blend' } });

PA('rd-pa-05', 'Syllable division of written multisyllabic words',
  'Given {n} written multisyllabic {corpus} words',
  'divide each word between syllables and read it aloud',
  'accuracy', 85, [4, 5],
  ['divide VC/CV words between the consonants and read each part',
   'divide V/CV and VC/V words and read the word aloud',
   'divide four- and five-syllable words using all six syllable types and read the word aloud'],
  { gen_opts: { v: 'divide' }, pool: 'ws-syllables' });

PA('rd-pa-06', 'Stress and schwa in multisyllabic words',
  'Given {n} written multisyllabic {corpus} words',
  'identify the stressed syllable and pronounce the unstressed vowel as a schwa',
  'accuracy', 85, [4, 5],
  ['identify the stressed syllable in two-syllable words',
   'identify the stressed syllable in three-syllable words',
   'identify the stressed syllable and produce the schwa in four-syllable words'],
  { gen_opts: { v: 'stress' }, pool: 'ws-syllables', dx: ['SLD', 'SLI'] });

// ---- decoding & word attack ----------------------------------------------------
const DC = section({
  domain: 'Reading', sub: 'Decoding & Word Attack', pool: 'ws-decoding',
  std: 'IL ELA RF.5.3 (foundational)', dx: ['SLD', 'SLI', 'ID', 'OHI']
});

DC('rd-dc-01', 'Reading closed and open syllable words',
  'Given a list of {n} written words containing closed and open syllables',
  'read each word aloud accurately',
  'accuracy', 90, [4, 5],
  ['read one-syllable closed and open syllable words aloud',
   'read two-syllable words combining closed and open syllables',
   'read three- and four-syllable {corpus} words combining closed and open syllables'],
  { gen_opts: { v: 'closedopen' } });

DC('rd-dc-02', 'Reading vowel teams and diphthongs',
  'Given a list of {n} written words containing vowel teams and diphthongs',
  'read each word aloud accurately',
  'accuracy', 90, [4, 5],
  ['read words containing the most common vowel teams (ai, ea, oa, ee)',
   'read words containing variant vowel teams and diphthongs (ou, ow, oi, oy, au, aw)',
   'read multisyllabic {corpus} words containing vowel teams and diphthongs'],
  { gen_opts: { v: 'vowelteam' } });

DC('rd-dc-03', 'Reading r-controlled vowel patterns',
  'Given a list of {n} written words containing r-controlled vowels',
  'read each word aloud accurately',
  'accuracy', 90, [4, 5],
  ['read words containing ar and or',
   'read words containing er, ir and ur',
   'read multisyllabic {corpus} words containing r-controlled vowels in any position'],
  { gen_opts: { v: 'rcontrolled' } });

DC('rd-dc-04', 'Reading consonant blends and digraphs in longer words',
  'Given a list of {n} written words containing consonant blends and digraphs',
  'read each word aloud accurately',
  'accuracy', 90, [4, 5],
  ['read one-syllable words with initial and final blends',
   'read words with three-letter blends and consonant digraphs',
   'read multisyllabic {corpus} words with blends and digraphs in any position'],
  { gen_opts: { v: 'blends' } });

DC('rd-dc-05', 'Reading silent-e and vowel-consonant-e words',
  'Given a list of {n} written words contrasting closed and vowel-consonant-e patterns',
  'read each word aloud accurately',
  'accuracy', 90, [4, 5],
  ['read vowel-consonant-e words aloud',
   'read minimal pairs contrasting closed and vowel-consonant-e syllables (hop/hope)',
   'read multisyllabic words containing a vowel-consonant-e syllable'],
  { gen_opts: { v: 'vce' } });

DC('rd-dc-06', 'Applying a chunking strategy to unfamiliar multisyllabic words',
  'Given {nshort} unfamiliar multisyllabic {corpus} words in isolation',
  'chunk each word into syllables, read the parts, and blend them into the whole word',
  'accuracy', 85, [4, 5],
  ['name the chunking steps and apply them to a three-syllable word with adult prompting',
   'chunk and read three-syllable {corpus} words',
   'chunk and read four- and five-syllable {corpus} words within 5 seconds each'],
  { gen_opts: { v: 'chunking' }, note: 'The point is the strategy, not the word list — score whether the student chunks before guessing, because guessing from first letters is the habit this replaces.' });

DC('rd-dc-07', 'Reading high-frequency irregular words',
  'Given a list of {n} high-frequency words with irregular spellings',
  'read each word aloud automatically within 3 seconds',
  'accuracy', 95, [4, 5],
  ['read the 100 most frequent irregular words aloud',
   'read the 200 most frequent irregular words aloud',
   'read the 300 most frequent irregular words aloud within 3 seconds each'],
  { gen_opts: { v: 'irregular' } });

DC('rd-dc-08', 'Decoding technical vocabulary from content-area text',
  'Given {nshort} technical terms drawn from current {course} material',
  'decode and pronounce each term accurately',
  'accuracy', 85, [4, 5],
  ['decode two- and three-syllable technical terms from the current unit',
   'decode four-syllable technical terms using known roots and affixes',
   'decode unfamiliar technical terms of any length using syllable division and morphology'],
  { gen_opts: { v: 'technical' }, note: 'Draw the word list from the courses the student is actually enrolled in — decoding practice on unrelated words does not transfer to the class where reading is breaking down.' });

// ---- morphology & word study ------------------------------------------------------
const MO = section({
  domain: 'Reading', sub: 'Morphology & Word Study', pool: 'ws-morphology',
  std: 'IL ELA L.{gg}.4b', dx: ['SLD', 'SLI', 'OHI']
});

MO('rd-mo-01', 'Using common prefixes to determine word meaning',
  'Given {n} words containing common prefixes',
  'state the meaning of the prefix and the meaning of the whole word',
  'accuracy', 85, [4, 5],
  ['state the meaning of the prefixes un-, re-, pre- and dis-',
   'state the meaning of 10 common prefixes and apply them to known base words',
   'use prefix meaning to determine the meaning of unfamiliar {corpus} words'],
  { gen_opts: { v: 'prefix' } });

MO('rd-mo-02', 'Using suffixes and inflectional endings',
  'Given {n} words containing suffixes and inflectional endings',
  'state how the suffix changes the meaning or part of speech of the base word',
  'accuracy', 85, [4, 5],
  ['identify the base word and the inflectional ending (-s, -ed, -ing)',
   'state how derivational suffixes (-ful, -less, -ness, -ly) change meaning',
   'state how a suffix changes the part of speech of an unfamiliar {corpus} word'],
  { gen_opts: { v: 'suffix' } });

MO('rd-mo-03', 'Using Greek and Latin roots',
  'Given {n} {corpus} words built on Greek and Latin roots',
  'state the meaning of the root and use it to define the whole word',
  'accuracy', 85, [4, 5],
  ['state the meaning of 10 high-utility roots (port, dict, struct, spect, scrib)',
   'state the meaning of 20 high-utility roots and define words built on them',
   'use root meaning to define unfamiliar {corpus} words encountered in text'],
  { gen_opts: { v: 'root' }, note: 'High-utility roots pay off across science and social studies at the same time; teach the root families the student\'s current courses actually use.' });

MO('rd-mo-04', 'Changing a word\'s part of speech through derivation',
  'Given a base word and a target part of speech',
  'produce the correct derived form and use it in a sentence',
  'accuracy', 85, [4, 5],
  ['produce the noun form of a given verb (decide/decision)',
   'produce noun, verb and adjective forms of a given base word',
   'produce the correct derived form and use it correctly in a written sentence'],
  { gen_opts: { v: 'derivation' } });

MO('rd-mo-05', 'Analyzing multi-morphemic words',
  'Given {nshort} multi-morphemic {corpus} words',
  'break each word into prefix, root and suffix and state its meaning',
  'accuracy', 85, [4, 5],
  ['separate a two-part word into base and affix',
   'separate a three-part word into prefix, root and suffix',
   'separate and define four-part {corpus} words and state the whole-word meaning'],
  { gen_opts: { v: 'multimorph' } });

MO('rd-mo-06', 'Inferring unknown word meaning from morphology in context',
  'Given {text} containing unfamiliar words built from known morphemes',
  'use word parts and surrounding context to state a working definition of each word',
  'accuracy', 80, [4, 5],
  ['state a working definition using word parts when the affix is highlighted',
   'state a working definition using word parts and the sentence around the word',
   'state a working definition and confirm or revise it using the rest of the paragraph'],
  { gen_opts: { v: 'infer' }, std: 'IL ELA L.{gg}.4' });

MO('rd-mo-07', 'Interpreting abbreviations and acronyms in content text',
  'Given {nshort} abbreviations and acronyms drawn from {text}',
  'state what each abbreviation stands for and what it means in context',
  'accuracy', 85, [4, 5],
  ['state the meaning of common academic and measurement abbreviations',
   'state the meaning of course-specific acronyms from the current unit',
   'state the meaning of unfamiliar acronyms using the text\'s first-use definition'],
  { gen_opts: { v: 'abbrev' }, std: 'IL ELA L.{gg}.4', dx: ['SLD', 'ID', 'OHI'] });

// ---- fluency ------------------------------------------------------------------------
const FL = section({
  domain: 'Reading', sub: 'Fluency', pool: 'rd-fluency',
  std: 'IL ELA RF.5.4 (foundational)', dx: ['SLD', 'OHI', 'SLI']
});

FL('rd-fl-01', 'Oral reading rate in content-area text',
  'Given {passage}',
  'read the passage aloud for one minute',
  'wcpm', { '6-8': 130, '9-12': 150, '18-22': 140 }, [3, 4],
  ['read aloud at a rate that shows growth over the baseline median',
   'read aloud approaching the target rate with 95% word accuracy',
   'read aloud at the target rate with 97% word accuracy'],
  { note: 'Graph words correct per minute, never words read: a student who speeds up by guessing will show a rising line while comprehension falls.' });

FL('rd-fl-02', 'Oral reading accuracy in grade-level text',
  'Given {passage}',
  'read the passage aloud with at least 97% word accuracy',
  'accuracy', 97, [3, 4],
  ['read aloud with 92% word accuracy',
   'read aloud with 95% word accuracy',
   'read aloud with 97% word accuracy and self-correct meaning-changing errors']);

FL('rd-fl-03', 'Prosody and expression in oral reading',
  'Given {passage} previewed once',
  'read the passage aloud with appropriate phrasing, expression and attention to punctuation',
  'rubric', 3.5, [3, 4],
  ['read in phrases of three or more words rather than word by word',
   'read with attention to end punctuation and pause at commas',
   'read with phrasing, stress and intonation that match the meaning of the text'],
  { note: 'Score with a four-point prosody rubric (phrasing, smoothness, pace, expression) — rate alone hides the student who reads fast and flat.' });

FL('rd-fl-04', 'Fluency in functional and workplace text',
  'Given a functional text such as a work order, safety notice or set of written directions',
  'read the text aloud accurately at a rate that supports acting on it',
  'accuracy', 95, [3, 4],
  ['read familiar functional text aloud with 90% accuracy',
   'read unfamiliar functional text aloud with 93% accuracy',
   'read unfamiliar functional text aloud with 95% accuracy and state the required action'],
  { bands: ['9-12', '18-22'], dx: ['SLD', 'ID', 'OHI', 'MD'] });

FL('rd-fl-05', 'Self-correction of meaning-changing errors',
  'Given {passage}',
  'self-correct oral reading errors that change the meaning of the sentence',
  'opportunities', 80, [3, 4],
  ['stop and reread when a sentence does not make sense, when prompted by an adult',
   'self-correct meaning-changing errors within the same sentence',
   'self-correct meaning-changing errors without any adult signal']);

FL('rd-fl-06', 'Phrase-cued reading of complex sentences',
  'Given {nshort} complex sentences from {text} marked into meaningful phrases',
  'read each sentence aloud in phrase units rather than word by word',
  'accuracy', 90, [3, 4],
  ['read pre-marked phrase-cued sentences in phrase units',
   'mark the phrase boundaries in a sentence and then read it in phrase units',
   'read unmarked complex sentences in phrase units on the first attempt']);

FL('rd-fl-07', 'Silent reading rate with comprehension check',
  'Given {passage} read silently',
  'read the passage silently and then answer literal comprehension questions about it',
  'accuracy', 80, [3, 4],
  ['answer literal questions after silently reading a paragraph',
   'answer literal questions after silently reading a full passage',
   'answer literal and sequencing questions after silently reading a full passage at a rate near the oral reading rate'],
  { pool: 'rd-literal', std: 'IL ELA RI.{gg}.1',
    note: 'Silent reading rate is only meaningful next to a comprehension check — otherwise the student who turns pages quickly looks like the student who reads.' });

// ---- vocabulary ------------------------------------------------------------------------
const VO = section({
  domain: 'Reading', sub: 'Vocabulary', pool: 'rd-vocab',
  std: 'IL ELA L.{gg}.4', dx: ['SLD', 'SLI', 'OHI', 'ID']
});

VO('rd-vo-01', 'Using context clues to determine word meaning',
  'Given {text} containing unfamiliar words with usable context clues',
  'state the meaning of each unfamiliar word and name the context clue that supports it',
  'accuracy', 80, [4, 5],
  ['state word meaning when a definition or restatement clue appears in the same sentence',
   'state word meaning from example, synonym and antonym clues',
   'state word meaning from inference clues spanning more than one sentence and name the clue used']);

VO('rd-vo-02', 'Academic (Tier 2) vocabulary across content areas',
  'Given {n} high-utility academic words used across {course} texts',
  'state the meaning of each word and use it correctly in a sentence',
  'accuracy', 85, [4, 5],
  ['match 20 academic words to their meanings',
   'state the meaning of 40 academic words in context',
   'use academic words correctly in original written sentences'],
  { std: 'IL ELA L.{gg}.6',
    note: 'Tier 2 words (analyze, contrast, justify, sufficient) are what test and assignment directions are written in — they unlock more classes per word taught than technical vocabulary does.' });

VO('rd-vo-03', 'Domain-specific (Tier 3) vocabulary',
  'Given {nshort} technical terms from a current {course} unit',
  'state the meaning of each term and use it accurately when explaining the concept',
  'accuracy', 85, [4, 5],
  ['match unit terms to their definitions',
   'state unit term meanings without a word bank',
   'use unit terms accurately in an explanation of the concept'],
  { std: 'IL ELA L.{gg}.6' });

VO('rd-vo-04', 'Multiple-meaning words in context',
  'Given {nshort} multiple-meaning words presented in {corpus} sentences',
  'state which meaning applies in each sentence and justify it from the sentence',
  'accuracy', 85, [4, 5],
  ['choose the correct meaning of a multiple-meaning word from two options',
   'state the correct meaning of a multiple-meaning word in a content-area sentence',
   'state the correct meaning and explain the sentence evidence that rules out the other meaning']);

VO('rd-vo-05', 'Figurative language and idioms',
  'Given {nshort} examples of figurative language drawn from {lit}',
  'state the literal and intended meaning of each expression',
  'accuracy', 80, [4, 5],
  ['identify whether an expression is literal or figurative',
   'state the intended meaning of common idioms and similes',
   'state the intended meaning of metaphors and idioms in unfamiliar text and explain the comparison'],
  { std: 'IL ELA L.{gg}.5a' });

VO('rd-vo-06', 'Synonyms, antonyms and shades of meaning',
  'Given {nshort} target words and a set of related words',
  'identify synonyms and antonyms and rank related words by intensity',
  'accuracy', 85, [4, 5],
  ['identify a synonym and an antonym for a target word',
   'choose the word with the closest meaning for a given sentence',
   'rank three related words by intensity and justify the ranking'],
  { std: 'IL ELA L.{gg}.5b' });

VO('rd-vo-07', 'Using reference tools to confirm word meaning',
  'Given {nshort} unfamiliar words and access to a dictionary, glossary or digital reference',
  'locate each word and state the definition that fits the context',
  'accuracy', 85, [4, 5],
  ['locate a word in a glossary or digital dictionary',
   'choose the correct entry when a word has more than one definition',
   'locate the word, choose the contextually correct definition and state its part of speech'],
  { std: 'IL ELA L.{gg}.4c' });

VO('rd-vo-08', 'Word relationships and analogies',
  'Given {nshort} word analogies drawn from {corpus} vocabulary',
  'complete each analogy and state the relationship it is built on',
  'accuracy', 80, [4, 5],
  ['complete synonym and antonym analogies',
   'complete part-to-whole and category analogies',
   'complete analogies of any type and name the relationship'],
  { std: 'IL ELA L.{gg}.5b', dx: ['SLD', 'OHI'] });

// ---- literal comprehension ---------------------------------------------------------------
const LC = section({
  domain: 'Reading', sub: 'Literal Comprehension', pool: 'rd-literal',
  std: 'IL ELA RI.{gg}.1', dx: ['SLD', 'SLI', 'OHI', 'ID', 'ASD']
});

LC('rd-lc-01', 'Answering literal questions about a text',
  'Given {text} and literal comprehension questions',
  'answer each question correctly using information stated in the text',
  'accuracy', 85, [4, 5],
  ['answer who, what and where questions about a paragraph',
   'answer literal questions about a full passage',
   'answer literal questions about a full passage and point to the sentence that answers each one']);

LC('rd-lc-02', 'Sequencing events and steps',
  'Given {text} describing a process or sequence of events',
  'place the events or steps in the order stated in the text',
  'accuracy', 85, [4, 5],
  ['order four events from a short passage',
   'order six events from a full passage',
   'order the steps of a process and name the signal words that establish the order'],
  { std: 'IL ELA RI.{gg}.3' });

LC('rd-lc-03', 'Identifying the stated main idea and supporting details',
  'Given {text} with an explicitly stated main idea',
  'state the main idea and list the details that support it',
  'accuracy', 85, [4, 5],
  ['identify the stated main idea of a paragraph',
   'identify the stated main idea of a passage and two supporting details',
   'identify the stated main idea and distinguish supporting details from unrelated details'],
  { std: 'IL ELA RI.{gg}.2' });

LC('rd-lc-04', 'Locating text evidence to answer a question',
  'Given {text} and a set of questions',
  'quote or cite the sentence from the text that answers each question',
  'accuracy', 85, [4, 5],
  ['locate the answer sentence when the question uses the same wording as the text',
   'locate the answer sentence when the question paraphrases the text',
   'locate and quote the answer sentence for questions drawn from anywhere in the passage']);

LC('rd-lc-05', 'Objective summary of a passage',
  'Given {text}',
  'write an objective summary that states the main points without personal opinion',
  'rubric', 3, [3, 4],
  ['state the topic and one main point of a passage orally',
   'write a summary that includes the main idea and two key details',
   'write an objective summary that covers the main points in order and includes no opinion'],
  { std: 'IL ELA RI.{gg}.2', pool: 'rd-written' });

LC('rd-lc-06', 'Following multi-step written directions',
  'Given a set of written multi-step directions in {life}',
  'complete each step in the stated order without additional adult explanation',
  'steps', 90, [4, 5],
  ['complete three-step written directions',
   'complete five-step written directions',
   'complete written directions of six or more steps, including conditional steps'],
  { std: 'IL ELA RI.{gg}.3', fade: 'functional', pool: 'rd-directions' });

LC('rd-lc-07', 'Identifying stated cause and effect',
  'Given {text} containing stated causal relationships',
  'identify the cause and the effect in each relationship',
  'accuracy', 85, [4, 5],
  ['identify cause and effect when signal words are present',
   'identify cause and effect when no signal word is present',
   'identify multiple causes or multiple effects within one passage'],
  { std: 'IL ELA RI.{gg}.3' });

LC('rd-lc-08', 'Paraphrasing a paragraph in own words',
  'Given a paragraph from {text}',
  'restate the paragraph accurately in own words without copying phrases from the text',
  'rubric', 3, [3, 4],
  ['restate a single sentence in own words',
   'restate a paragraph in own words retaining the main point',
   'restate a paragraph accurately in own words with no copied phrasing'],
  { std: 'IL ELA RI.{gg}.2', pool: 'rd-written' });

// ---- inferential comprehension --------------------------------------------------------------
const IC = section({
  domain: 'Reading', sub: 'Inferential Comprehension', pool: 'rd-inferential',
  std: 'IL ELA RI.{gg}.1', dx: ['SLD', 'ASD', 'SLI', 'OHI']
});

IC('rd-ic-01', 'Drawing inferences supported by text evidence',
  'Given {text} and inferential questions',
  'answer each question and cite the textual evidence that supports the inference',
  'accuracy', 80, [4, 5],
  ['answer an inferential question when given two possible answers to choose between',
   'answer an inferential question and point to supporting evidence',
   'answer inferential questions and quote the evidence that rules out the alternative']);

IC('rd-ic-02', 'Determining the central idea across a whole text',
  'Given {text} whose central idea is not directly stated',
  'state the central idea and trace how it develops across the text',
  'accuracy', 80, [4, 5],
  ['state the topic of the text and the main point of each section',
   'state the central idea of the whole text',
   'state the central idea and explain how two sections develop it'],
  { std: 'IL ELA RI.{gg}.2' });

IC('rd-ic-03', 'Determining author\'s purpose and point of view',
  'Given {text}',
  'state the author\'s purpose and the evidence in the text that reveals it',
  'accuracy', 80, [4, 5],
  ['classify an author\'s purpose as to inform, persuade or entertain',
   'state the author\'s point of view on the topic',
   'state the author\'s purpose and point of view and cite the language that reveals each'],
  { std: 'IL ELA RI.{gg}.6' });

IC('rd-ic-04', 'Making and confirming predictions',
  'Given {text} read in sections',
  'make a prediction based on text evidence and confirm or revise it after reading on',
  'accuracy', 80, [4, 5],
  ['make a prediction and name one clue it is based on',
   'make a prediction and state whether the next section confirmed it',
   'make a prediction, confirm or revise it, and explain what evidence changed it']);

IC('rd-ic-05', 'Inferring character motivation and perspective',
  'Given {lit}',
  'explain why a character acts as they do and cite the evidence for that motivation',
  'accuracy', 80, [4, 5],
  ['identify what a character does and how the character feels',
   'state a reason for a character\'s action supported by the text',
   'explain a character\'s motivation and how it changes across the text'],
  { std: 'IL ELA RL.{gg}.3' });

IC('rd-ic-06', 'Comparing and contrasting two texts on the same topic',
  'Given two texts on the same topic',
  'state where the texts agree and disagree and cite evidence from both',
  'accuracy', 80, [4, 5],
  ['state one thing both texts say about the topic',
   'state one agreement and one disagreement between the texts',
   'compare the two texts\' claims and evidence and explain which is better supported'],
  { std: 'IL ELA RI.{gg}.9' });

IC('rd-ic-07', 'Distinguishing claims from evidence and opinion',
  'Given an argumentative or persuasive text',
  'identify the author\'s claim and separate supporting evidence from opinion',
  'accuracy', 80, [4, 5],
  ['label individual statements as fact or opinion',
   'identify the author\'s claim in an argumentative text',
   'identify the claim, list the evidence offered, and state which statements are opinion'],
  { std: 'IL ELA RI.{gg}.8' });

IC('rd-ic-08', 'Drawing conclusions across paragraphs',
  'Given {text} where the answer requires combining information from more than one paragraph',
  'state a conclusion and cite the two or more places in the text it is built from',
  'accuracy', 80, [4, 5],
  ['combine information from two adjacent sentences to answer a question',
   'combine information from two paragraphs to answer a question',
   'combine information from separated sections of a text and cite each source']);

// ---- text structure & analysis -----------------------------------------------------------------
const TS = section({
  domain: 'Reading', sub: 'Text Structure & Analysis', pool: 'rd-structure',
  std: 'IL ELA RI.{gg}.5', dx: ['SLD', 'OHI', 'ASD']
});

TS('rd-ts-01', 'Identifying informational text structure',
  'Given {text} organized by a common informational structure',
  'name the text structure and the signal words that identify it',
  'accuracy', 85, [4, 5],
  ['name the structure when given three choices',
   'name the structure and one signal word that supports the choice',
   'name the structure of an unfamiliar text and explain how it organizes the information']);

TS('rd-ts-02', 'Using text features to locate information',
  'Given {text} containing headings, captions, bold terms and graphics',
  'use the text features to locate requested information',
  'accuracy', 90, [4, 5],
  ['use headings to find the section that answers a question',
   'use headings, bold terms and captions to locate information',
   'use text features to locate information in an unfamiliar text within a set time'],
  { std: 'IL ELA RI.{gg}.7' });

TS('rd-ts-03', 'Analyzing an argument and its evidence',
  'Given an argumentative text',
  'identify the claim, trace the supporting reasons, and evaluate whether the evidence is sufficient',
  'rubric', 3, [3, 4],
  ['identify the claim and one supporting reason',
   'identify the claim and all supporting reasons',
   'identify the claim, its reasons, and state which reasons are not adequately supported'],
  { std: 'IL ELA RI.{gg}.8', pool: 'rd-written' });

TS('rd-ts-04', 'Identifying point of view and bias',
  'Given two texts on the same topic written from different viewpoints',
  'state each author\'s viewpoint and identify the word choices that reveal bias',
  'accuracy', 80, [4, 5],
  ['state which side of a topic an author is on',
   'identify loaded or emotional word choices in a text',
   'state each author\'s viewpoint and cite the language that signals bias'],
  { std: 'IL ELA RI.{gg}.6' });

TS('rd-ts-05', 'Interpreting graphics and data displays in text',
  'Given {text} containing a table, chart, graph or diagram',
  'answer questions that require reading the graphic and connecting it to the text',
  'accuracy', 85, [4, 5],
  ['read a value directly off a table or bar graph',
   'compare two values in a graphic and state what the comparison shows',
   'explain how the graphic supports or extends a claim made in the text'],
  { std: 'IL ELA RI.{gg}.7' });

TS('rd-ts-06', 'Evaluating source credibility',
  'Given {nshort} sources on a single topic, including at least one unreliable source',
  'rate each source\'s credibility and state the reason for the rating',
  'accuracy', 80, [4, 5],
  ['state who wrote a source and when it was published',
   'sort sources into more and less credible with a reason for each',
   'rate credibility using author, date, purpose and evidence, and justify the rating'],
  { bands: ['9-12', '18-22'], std: 'IL ELA RI.{gg}.8' });

TS('rd-ts-07', 'Analyzing how structure contributes to meaning',
  'Given {text} with a deliberate organizational choice',
  'explain how the author\'s structural choice shapes the reader\'s understanding',
  'rubric', 3, [3, 4],
  ['state where a section begins and ends and what it covers',
   'explain what one section contributes to the whole text',
   'explain how the order of sections shapes the argument or account'],
  { bands: ['9-12', '18-22'], pool: 'rd-written' });

// ---- functional & survival reading -------------------------------------------------------------------
const FR = section({
  domain: 'Reading', sub: 'Functional Reading', pool: 'rd-functional',
  std: 'IL ELA RI.{gg}.7', dx: ['ID', 'SLD', 'ASD', 'MD', 'OHI'], fade: 'functional'
});

FR('rd-fr-01', 'Reading and acting on safety signs and warning labels',
  'Given safety signs, warning labels and hazard symbols found in {life}',
  'state what each sign requires and what action to take',
  'accuracy', 95, [4, 5],
  ['identify common safety signs by name',
   'state the required action for common safety signs',
   'state the required action for unfamiliar warning labels, including chemical hazard symbols'],
  { note: 'Hold safety goals to a higher criterion than academic ones — 80% accuracy on hazard labels is not a passing score in a workplace.' });

FR('rd-fr-02', 'Reading and completing an employment or program application',
  'Given a blank {doc} and the student\'s personal information sheet',
  'read each field and enter the correct information in the correct place',
  'accuracy', 90, [4, 5],
  ['complete name, address and contact fields',
   'complete education and employment history sections',
   'complete an unfamiliar application in full, including checkbox and signature fields'],
  { bands: ['9-12', '18-22'] });

FR('rd-fr-03', 'Reading schedules and timetables',
  'Given a bus, work or class schedule',
  'locate the requested time and state what to do and when',
  'accuracy', 90, [4, 5],
  ['locate a specific time on a familiar schedule',
   'locate a departure or shift time and state how long until it starts',
   'use an unfamiliar schedule to plan arrival time, including a transfer or a change of day']);

FR('rd-fr-04', 'Reading food labels and recipes',
  'Given food packaging labels and a written recipe',
  'locate the requested information and state what it means for the task',
  'accuracy', 90, [4, 5],
  ['locate serving size, calories and expiration date on a label',
   'locate allergen and ingredient information and state whether a food is safe to eat',
   'follow a written recipe, including measurements and sequence, from label to finished step']);

FR('rd-fr-05', 'Reading health and medication instructions',
  'Given a prescription label, over-the-counter package or appointment notice',
  'state the dose, timing, warnings and required action',
  'accuracy', 95, [4, 5],
  ['locate the dose and timing on a medication label',
   'state the warnings and side effects listed on a label',
   'state dose, timing, warnings and what to do if a dose is missed'],
  { bands: ['9-12', '18-22'] });

FR('rd-fr-06', 'Reading a lease, contract or utility bill',
  'Given a lease, service contract or utility bill',
  'locate the amount due, the due date and the terms that carry a penalty',
  'accuracy', 90, [4, 5],
  ['locate the amount due and due date on a bill',
   'state what a late fee is and when it applies',
   'state the key terms of a contract, including how to end it and what it costs to break it'],
  { bands: ['18-22'] });

FR('rd-fr-07', 'Reading and navigating digital text',
  'Given an email, text message thread or website relevant to {life}',
  'locate the requested information and state the action it asks for',
  'accuracy', 90, [4, 5],
  ['locate the sender, subject and date of an email',
   'state what action an email or message is asking for and by when',
   'navigate an unfamiliar website to locate specific information within a set time']);

VO('rd-vo-09', 'Learning and retaining new vocabulary independently',
  'Given unfamiliar words encountered in {course} reading',
  'record each word, determine its meaning and use it correctly a week later',
  'accuracy', 80, [4, 5],
  ['record unfamiliar words encountered while reading',
   'record each word with a working definition',
   'record, define and correctly use previously recorded words one week later'],
  { std: 'IL ELA L.{gg}.6',
    note: 'Retention a week later is the criterion worth measuring — same-day recall after a word list tells you nothing about whether the word was learned.' });

module.exports = collect(PA, DC, MO, FL, VO, LC, IC, TS, FR);
