// =============================================================
// Ace Manager — curated probe items
// =============================================================
// The items no generator can honestly produce: inference from a real passage,
// a judgement call about a co-worker, knowing what a 504 plan is. Everything
// arithmetical or patterned is generated instead (js/probe-engine.js), because
// generated items give equivalent alternate forms every cycle and these cannot.
//
// Every item carries a TIER (1-3) matching the benchmark it measures, so one
// probe reports a score per benchmark as well as an overall score. Tier 1 items
// are the entry rung of the skill; tier 3 items are the goal itself.
//
// Item types:
//   mc     — one correct answer
//   sj     — situational judgement: one best answer, optional partial-credit answers
//   scale  — student self-rating, 1-5
//   rubric — adult scores one row of a 4-point rubric (observation probes)
//
// Band tokens ({setting}, {peer}, {work}…) are resolved at probe generation
// against the goal's grade band, so one authored item serves all three.

'use strict';

const POOL_ITEMS = {};
let seq = 0;

function items(pool, byTier) {
  const list = POOL_ITEMS[pool] = POOL_ITEMS[pool] || [];
  for (const tier of [1, 2, 3]) {
    for (const row of (byTier[tier] || [])) {
      const [type, prompt, ...rest] = row;
      const id = `${pool}-${tier}-${String(++seq).padStart(3, '0')}`;
      if (type === 'mc') list.push({ id, tier: Number(tier), type: 'mc', prompt, choices: rest[0], answer: rest[1] });
      else if (type === 'sj') list.push({ id, tier: Number(tier), type: 'sj', prompt, choices: rest[0], best: rest[1], partial: rest[2] || [] });
      else if (type === 'scale') list.push({ id, tier: Number(tier), type: 'scale', prompt, scale_low: rest[0] || 'Never', scale_high: rest[1] || 'Always' });
      else if (type === 'rubric') list.push({ id, tier: Number(tier), type: 'rubric', prompt, levels: rest[0] });
      else throw new Error(`${pool}: unknown item type ${type}`);
    }
  }
}

// ============================================================================
// READING
// ============================================================================

items('rd-vocab', {
  1: [
    ['mc', 'Read the sentence: "The drought was so severe that the crops withered." What does severe mean here?', ['very bad', 'very short', 'very wet', 'very new'], 0],
    ['mc', 'Read the sentence: "She was reluctant to speak, but finally raised her hand." What does reluctant mean?', ['unwilling', 'excited', 'loud', 'confused'], 0],
    ['mc', 'Which word means the opposite of "expand"?', ['shrink', 'grow', 'stretch', 'widen'], 0]
  ],
  2: [
    ['mc', 'Read: "The evidence was inconclusive, so the researchers repeated the experiment." What does inconclusive mean?', ['not giving a clear answer', 'completely wrong', 'very expensive', 'finished early'], 0],
    ['mc', 'Read: "He gave a plausible explanation, though no one could prove it." What does plausible mean?', ['believable', 'dishonest', 'complicated', 'unnecessary'], 0],
    ['mc', 'In "The bank was steep and covered in weeds," what does bank mean?', ['the side of a river', 'a place that holds money', 'to rely on something', 'a row of switches'], 0]
  ],
  3: [
    ['mc', 'Read: "Although the policy was ostensibly about safety, its real effect was to limit access." What does ostensibly mean?', ['apparently, but perhaps not really', 'obviously and certainly', 'unfortunately', 'legally required'], 0],
    ['mc', 'Rank these from least to most intense: warm, scalding, hot. Which order is correct?', ['warm, hot, scalding', 'scalding, hot, warm', 'hot, warm, scalding', 'warm, scalding, hot'], 0],
    ['mc', 'Read: "The two accounts are analogous, though not identical." What does analogous mean?', ['similar in an important way', 'exactly the same', 'completely opposite', 'written down'], 0]
  ]
});

items('rd-literal', {
  1: [
    ['mc', 'Passage: "Marta left the house at 7:15. She caught the 7:30 bus and arrived at work at 8:05." What time did Marta catch the bus?', ['7:30', '7:15', '8:05', '7:45'], 0],
    ['mc', 'Passage: "The recycling center accepts glass, aluminum and paper. It does not accept plastic bags or electronics." Which item is accepted?', ['aluminum', 'plastic bags', 'electronics', 'batteries'], 0],
    ['mc', 'Passage: "First, unplug the machine. Next, remove the filter. Finally, rinse the filter under cold water." What is the second step?', ['remove the filter', 'unplug the machine', 'rinse the filter', 'dry the filter'], 0]
  ],
  2: [
    ['mc', 'Passage: "Sea otters eat sea urchins. Sea urchins eat kelp. Where otter populations fell, urchins multiplied and kelp forests disappeared." What happened to kelp forests when otters declined?', ['They disappeared', 'They grew larger', 'They stayed the same', 'They moved north'], 0],
    ['mc', 'Passage: "The library extended its hours in September. Attendance rose 30 percent that fall, mostly among students needing evening study space." What is the stated main idea?', ['Extending library hours increased attendance', 'Students dislike studying at home', 'The library is short of funding', 'September is the busiest month'], 0],
    ['mc', 'Passage: "Because the shipment was delayed, the store could not stock shelves before the sale, and customers left without buying." What was the cause of the store being unable to stock shelves?', ['The shipment was delayed', 'Customers left', 'The sale was cancelled', 'The shelves were broken'], 0]
  ],
  3: [
    ['mc', 'Passage: "The city added protected bike lanes on three streets in 2024. Cycling trips on those streets rose 46 percent, while collisions involving cyclists fell by a third. Costs ran 12 percent over budget." Which statement is supported by the passage?', ['Cycling rose and collisions fell on those streets', 'The project came in under budget', 'Cycling fell after the lanes were added', 'The city removed the bike lanes'], 0],
    ['mc', 'Which is the best objective summary of that passage?', ['Protected bike lanes on three streets increased cycling and reduced collisions, at a cost over budget', 'Bike lanes are a waste of money', 'The city should build more bike lanes everywhere', 'Cyclists are safer than drivers'], 0],
    ['mc', 'Passage: "Apply the primer and wait four hours. Do not sand until the primer is fully dry. Once dry, sand lightly, then apply the topcoat." When may you sand?', ['After the primer is fully dry', 'Immediately after priming', 'Before applying primer', 'After the topcoat'], 0]
  ]
});

items('rd-inferential', {
  1: [
    ['mc', 'Passage: "Devon checked his pocket twice, then turned back toward the cafeteria, walking faster." What can you infer?', ['He thinks he lost something', 'He is going to lunch', 'He forgot his homework was due', 'He is meeting a friend'], 0],
    ['mc', 'Passage: "The floor was wet and a yellow cone stood by the door." What most likely happened?', ['Someone recently cleaned the floor', 'It rained inside', 'The building is closed', 'A pipe burst'], 0],
    ['mc', 'Passage: "Ana read the letter, sat down slowly, and did not answer when her sister spoke." How does Ana most likely feel?', ['Upset', 'Excited', 'Bored', 'Amused'], 0]
  ],
  2: [
    ['mc', 'Passage: "The manager posted the new schedule Friday. By Monday, three employees had asked to switch shifts and one had quit." What can you infer about the schedule?', ['Employees were unhappy with it', 'It gave everyone their preferred shifts', 'It was posted too early', 'It was the same as the old one'], 0],
    ['mc', 'Passage: "Every article the writer cites supports one side. No opposing studies appear, though several exist." What is the author\'s likely purpose?', ['To persuade rather than inform', 'To entertain the reader', 'To summarize all research fairly', 'To teach a scientific method'], 0],
    ['mc', 'Passage: "Ivan practised the presentation six times, but his hands shook when he stood up." Which inference is best supported?', ['Preparation did not remove his nervousness', 'He did not prepare', 'He was unwell', 'He disliked the topic'], 0]
  ],
  3: [
    ['mc', 'Passage: "The report notes that graduation rates rose after the program began. It does not mention that the district also changed its graduation requirements that year." What does this omission suggest?', ['The reported gain may have another explanation', 'The program definitely caused the gain', 'Graduation rates actually fell', 'The requirements were made harder'], 0],
    ['mc', 'Two texts describe the same factory closing. One calls it "a necessary restructuring," the other "a gutting of the town." What does this difference reveal?', ['Each author has a different point of view', 'One author has the facts wrong', 'The closing happened twice', 'Neither author was present'], 0],
    ['mc', 'Passage: "Sales rose in every quarter the company advertised heavily, and in two quarters it did not." What conclusion is best supported?', ['Advertising is not the only factor in sales', 'Advertising always increases sales', 'Advertising has no effect', 'Sales fell overall'], 0]
  ]
});

items('rd-structure', {
  1: [
    ['mc', 'A text is organized as: "First… Next… Then… Finally…". What structure is it?', ['Sequence', 'Compare and contrast', 'Problem and solution', 'Cause and effect'], 0],
    ['mc', 'Where would you look first to find which section of an article covers a topic?', ['The headings', 'The last paragraph', 'The author\'s name', 'The page number'], 0],
    ['mc', 'A text says: "Unlike gas engines, electric motors have few moving parts." What structure does this signal?', ['Compare and contrast', 'Sequence', 'Description', 'Chronology'], 0]
  ],
  2: [
    ['mc', 'A caption under a chart says "Figure 2: Costs by year, 2019-2025." What does the caption tell you?', ['What the chart shows and the years covered', 'The author\'s opinion of the costs', 'How the data were collected', 'Whether the costs were reasonable'], 0],
    ['mc', 'A text describes a flooding problem, then three proposed fixes. What structure is it?', ['Problem and solution', 'Sequence', 'Compare and contrast', 'Description'], 0],
    ['mc', 'An author writes "critics claim" before one position and "experts confirm" before another. What does this word choice reveal?', ['The author favours the second position', 'The author is neutral', 'Both positions are equally supported', 'The author is quoting directly'], 0]
  ],
  3: [
    ['mc', 'An argument states a claim, gives two examples, then dismisses the opposing view without evidence. What is the weakness?', ['The counterclaim is not actually addressed', 'The claim is unclear', 'There are too many examples', 'The structure is chronological'], 0],
    ['mc', 'Which source is most likely to be reliable for current medical guidance?', ['A 2026 article from a national health agency', 'A 2011 blog post', 'An anonymous forum thread', 'An advertisement for a supplement'], 0],
    ['mc', 'A writer places the strongest evidence in the final section rather than the first. What effect does this structure most likely have?', ['It builds toward the conclusion', 'It hides the claim', 'It shortens the argument', 'It makes the text chronological'], 0]
  ]
});

items('rd-functional', {
  1: [
    ['mc', 'A sign reads "CAUTION — WET FLOOR." What should you do?', ['Walk carefully or go around', 'Run past quickly', 'Ignore it', 'Move the sign'], 0],
    ['mc', 'A bus schedule shows departures at 7:10, 7:40 and 8:10. You arrive at 7:45. When is the next bus?', ['8:10', '7:40', '7:10', '8:40'], 0],
    ['mc', 'A food label reads "Best by 03/12/26." What does that date tell you?', ['When the food is no longer at its best', 'When it was made', 'How much it costs', 'How many servings it has'], 0]
  ],
  2: [
    ['mc', 'A medication label reads "Take one tablet every 8 hours. Do not exceed 3 tablets in 24 hours." You took one at 7am. When is the next dose?', ['3pm', '11am', '7pm', 'Immediately'], 0],
    ['mc', 'A job application asks for "Employment history, most recent first." What do you list first?', ['Your most recent job', 'Your first job ever', 'Your preferred job', 'Your references'], 0],
    ['mc', 'A label shows a skull-and-crossbones symbol. What does it mean?', ['The contents are poisonous', 'The contents are flammable', 'The contents are recyclable', 'The contents are fragile'], 0]
  ],
  3: [
    ['mc', 'A lease says: "Rent is due on the 1st. A late fee of $50 applies after the 5th." You pay on the 6th. What do you owe?', ['Rent plus a $50 late fee', 'Rent only', 'A $50 fee only', 'Nothing extra'], 0],
    ['mc', 'A utility bill lists "Amount due $118.42, Due date 04/18, Previous balance $0.00." What must you pay by April 18?', ['$118.42', '$0.00', '$118.42 plus a deposit', 'Half of $118.42'], 0],
    ['mc', 'An email says: "Please confirm your shift by Thursday or it will be reassigned." What action is required?', ['Reply confirming before Thursday', 'Show up Thursday', 'Do nothing', 'Call after Thursday'], 0]
  ]
});

// ============================================================================
// WRITTEN LANGUAGE
// ============================================================================

items('wr-research', {
  1: [
    ['mc', 'Which is the most reliable source for a research paper on climate?', ['A peer-reviewed scientific journal', 'A social media post', 'An anonymous wiki edit', 'A product advertisement'], 0],
    ['mc', 'What information do you need to record to cite a source?', ['Author, title, publisher and date', 'Only the website name', 'Only the author', 'Only the date you read it'], 0],
    ['mc', 'What does it mean to paraphrase?', ['Restate the idea in your own words', 'Copy the sentence exactly', 'Summarize the whole book', 'Quote with quotation marks'], 0]
  ],
  2: [
    ['mc', 'You copy two sentences from a source into your paper without quotation marks but list the source at the end. What is this?', ['Plagiarism', 'Correct citation', 'Paraphrasing', 'Summarizing'], 0],
    ['mc', 'Which search would best find information on the effect of sleep on teenage memory?', ['"sleep AND memory AND adolescents"', '"sleep"', '"teenagers"', '"school"'], 0],
    ['mc', 'Where does an in-text citation go?', ['Immediately after the quoted or paraphrased material', 'At the end of the paper only', 'In the title', 'In a footnote only'], 0]
  ],
  3: [
    ['mc', 'A source is written by an industry group that funds the study it reports. What should you do?', ['Use it but note the potential conflict of interest', 'Discard all industry sources automatically', 'Cite it as neutral', 'Use it without checking'], 0],
    ['mc', 'Two credible sources disagree on a fact. What is the best response in your paper?', ['Report the disagreement and evaluate the evidence for each', 'Pick the one you like', 'Leave the fact out', 'Report only the more recent one'], 0],
    ['mc', 'Which sentence integrates evidence most effectively?', ['As Chen notes, "attendance rose sharply" once transport was free (2025).', '"Attendance rose sharply." (Chen)', 'Attendance rose sharply.', 'Chen 2025.'], 0]
  ]
});

// ============================================================================
// COMMUNICATION
// ============================================================================

items('co-receptive', {
  1: [
    ['mc', 'You hear: "Before you hand in the sheet, write your name at the top." What do you do first?', ['Write your name', 'Hand in the sheet', 'Ask a question', 'Turn the sheet over'], 0],
    ['mc', 'You hear: "Put the folders on the shelf, then wipe the table." What is the second task?', ['Wipe the table', 'Put the folders away', 'Both at once', 'Neither'], 0],
    ['mc', 'You hear: "Who left this here?" What kind of answer is expected?', ['A person', 'A place', 'A time', 'A reason'], 0]
  ],
  2: [
    ['mc', 'You hear: "Unless it rains, we will meet outside." When do you meet inside?', ['If it rains', 'If it does not rain', 'Always', 'Never'], 0],
    ['mc', 'You hear: "Take the forms to the office after you finish, but before lunch." When do you go?', ['After finishing and before lunch', 'Right now', 'After lunch', 'Tomorrow'], 0],
    ['mc', 'You hear: "Why did the machine stop?" What kind of answer is expected?', ['A reason', 'A place', 'A person', 'A number'], 0]
  ],
  3: [
    ['mc', 'You hear: "Everyone except the second group should start now." Who waits?', ['The second group', 'Everyone', 'The first group', 'Nobody'], 0],
    ['mc', 'A supervisor says: "It would be great if these were done by three." What is actually being asked?', ['Finish them by three', 'Nothing, it is only a comment', 'Finish them whenever', 'Ask someone else'], 0],
    ['mc', 'Someone says "Nice job locking up last night" in a flat tone after you forgot to lock up. What do they mean?', ['They are pointing out that you forgot', 'They are genuinely thanking you', 'They are asking a question', 'They are talking to someone else'], 0]
  ]
});

items('co-pragmatics', {
  1: [
    ['sj', 'A classmate is talking about a movie you have not seen. What is the best way to join in?', ['Ask a question about the movie', 'Change the subject to something you know', 'Say you are not interested', 'Wait silently until they finish'], 0, [3]],
    ['sj', 'Someone is mid-sentence and you remember something important. What do you do?', ['Wait for a pause, then speak', 'Interrupt immediately', 'Say it louder than they are talking', 'Walk away and come back'], 0, [3]],
    ['mc', 'A person crosses their arms, looks away and gives short answers. What are they most likely feeling?', ['Uncomfortable or annoyed', 'Excited', 'Confused about the topic', 'Very interested'], 0]
  ],
  2: [
    ['sj', 'You tell a story and the other person says "Wait, who is Sam?" What is the best response?', ['Explain who Sam is, then continue', 'Keep telling the story', 'Start the whole story again', 'Say "never mind"'], 0, [2]],
    ['sj', 'In a group project, a peer keeps taking over your part. What is the strongest move?', ['Say privately that you want to do your assigned part, and propose how to split it', 'Let them do everything', 'Complain to the group loudly', 'Stop attending group meetings'], 0, [2]],
    ['mc', 'A teacher says "I hear what you\'re saying, but…" What does that signal?', ['They are about to disagree', 'They agree completely', 'They did not hear you', 'They are ending the conversation'], 0]
  ],
  3: [
    ['sj', 'A co-worker says "It must be nice to leave early every day" while smiling. What are they most likely communicating?', ['Irritation about your schedule', 'Genuine happiness for you', 'A request to leave early too', 'A joke about the weather'], 0, [2]],
    ['sj', 'You realise mid-conversation that the other person has misunderstood you. What is best?', ['Stop and rephrase what you meant', 'Repeat the same words louder', 'Keep going and hope it clears up', 'End the conversation'], 0, [1]],
    ['sj', 'You disagree with a decision in a meeting at {work}. What is the strongest approach?', ['State your concern with a reason and propose an alternative', 'Say nothing and complain afterward', 'Say the decision is wrong', 'Walk out of the meeting'], 0, [3]]
  ]
});

// ============================================================================
// BEHAVIOR & SOCIAL/EMOTIONAL
// ============================================================================

items('be-conflict', {
  1: [
    ['sj', 'A classmate bumps your desk and your work falls. What is the best first move?', ['Say calmly that it knocked your work over', 'Push their desk back', 'Yell at them', 'Report it without saying anything to them'], 0, [3]],
    ['sj', 'Someone takes the last chair you were walking toward. What is best?', ['Find another seat', 'Tell them to move', 'Stand and complain', 'Take the chair anyway'], 0, [2]],
    ['mc', 'What is the first step of the conflict resolution routine?', ['Stop and calm down before speaking', 'Explain who is at fault', 'Get a teacher', 'Walk away permanently'], 0]
  ],
  2: [
    ['sj', 'A peer makes a joke about you in front of others. What is the strongest response?', ['Ignore it and speak to them privately later', 'Make a joke back about them', 'Yell at them in front of everyone', 'Push them'], 0, [3]],
    ['sj', 'You and a peer both believe you are right about a group task. What works best?', ['Ask what evidence each of you has and check it', 'Insist you are right', 'Do it your way without telling them', 'Refuse to participate'], 0, [2]],
    ['sj', 'Someone keeps provoking you in the hallway. What is best?', ['Move away and tell a staff member', 'Provoke them back', 'Stay and argue', 'Wait for them after school'], 0, [3]]
  ],
  3: [
    ['sj', 'After a conflict, you realise you contributed to it. What is the strongest move?', ['Acknowledge your part and offer a specific repair', 'Say the other person started it', 'Say nothing and avoid them', 'Apologise without saying what for'], 0, [3]],
    ['sj', 'A conflict at {work} involves a co-worker and a customer. What is best?', ['Follow the site procedure and get a supervisor', 'Take a side', 'Handle it yourself without telling anyone', 'Leave the area'], 0, [3]],
    ['sj', 'You are angry and know you will say something you regret. What is best?', ['Ask for a short break, then return to the conversation', 'Say it anyway', 'Walk out and not return', 'Stay silent and hold it in'], 0, [2]]
  ]
});

items('se-peer', {
  1: [
    ['sj', 'A group of peers is playing a game you know. How do you join?', ['Ask if you can join at the next round', 'Take a turn without asking', 'Stand nearby and wait', 'Tell them they are playing wrong'], 0, [2]],
    ['sj', 'A peer gives you a compliment. What is the best response?', ['Say thank you', 'Say it was nothing at all', 'Say nothing', 'Compliment them back immediately'], 0, [3]],
    ['mc', 'What is a sign that someone wants to end a conversation?', ['They step back and glance away repeatedly', 'They ask a follow-up question', 'They turn toward you', 'They laugh at your joke'], 0]
  ],
  2: [
    ['sj', 'A group member is not doing their part. What is the strongest first step?', ['Ask them directly what part they can do and by when', 'Do their part yourself', 'Report them to the teacher immediately', 'Say nothing and hand in incomplete work'], 0, [2]],
    ['sj', 'A friend cancels plans twice in a row. What is best?', ['Ask if everything is okay and suggest another time', 'Stop talking to them', 'Cancel on them next time', 'Post about it online'], 0, [2]],
    ['sj', 'You are asked to give feedback on a peer\'s work that has real problems. What is best?', ['Name one strength and one specific thing to change', 'Say it is fine', 'List everything wrong with it', 'Refuse to comment'], 0, [3]]
  ],
  3: [
    ['sj', 'Peers pressure you to skip class. What is the strongest response?', ['Say no, give a short reason and leave for class', 'Go along to avoid conflict', 'Argue with them about it', 'Say nothing and follow them'], 0, [2]],
    ['sj', 'A friend asks you to lie for them to a supervisor. What is best?', ['Say you will not lie, but offer to support them in telling the truth', 'Lie to protect the friendship', 'Report them immediately without telling them', 'Avoid the supervisor'], 0, [2]],
    ['sj', 'You realise a group you spend time with is getting you into trouble. What is best?', ['Reduce time with them and build other connections', 'Stay and hope it changes', 'Confront them all at once', 'Stop going to school'], 0, [2]]
  ]
});

items('se-emotion', {
  1: [
    ['mc', 'Someone has clenched fists, a tight jaw and a raised voice. What emotion is most likely?', ['Anger', 'Sadness', 'Boredom', 'Surprise'], 0],
    ['mc', 'Your heart is racing, your hands are sweaty and your thoughts are speeding up. What emotion is this most likely?', ['Anxiety', 'Calm', 'Tiredness', 'Hunger'], 0],
    ['mc', 'On a 1-5 scale where 5 is the most intense, where would "slightly annoyed" go?', ['2', '5', '4', '1'], 0]
  ],
  2: [
    ['mc', 'Someone is smiling but their shoulders are slumped and their voice is flat. What should you consider?', ['They may not feel as fine as they look', 'They are definitely happy', 'They are angry', 'They did not hear you'], 0],
    ['mc', 'Which is the earliest signal that you are getting frustrated?', ['A physical change like tension or heat', 'Raising your voice', 'Walking out', 'Slamming something'], 0],
    ['mc', 'You feel a 4 out of 5 on the anger scale. Which strategy fits that level?', ['Leave the situation and use a calming routine', 'Ignore it and keep working', 'Talk it through in detail right now', 'Nothing is needed'], 0]
  ],
  3: [
    ['mc', 'A message reads: "Fine. Do whatever." What emotion is most likely behind it?', ['Frustration', 'Enthusiasm', 'Gratitude', 'Confusion'], 0],
    ['mc', 'You feel angry, but underneath you also feel embarrassed. Why does naming both matter?', ['Different feelings need different responses', 'It does not matter', 'Anger is the only real feeling', 'Naming feelings makes them stronger'], 0],
    ['mc', 'A short text reply of "k" from a friend most likely means what?', ['It is ambiguous and could mean several things', 'They are definitely angry with you', 'They are definitely happy', 'They did not read it'], 0]
  ]
});

items('se-perspective', {
  1: [
    ['mc', 'A classmate is chosen last for a team. How do they most likely feel?', ['Left out', 'Proud', 'Amused', 'Relieved'], 0],
    ['mc', 'You take the last of a shared snack without asking. How might others feel?', ['Annoyed', 'Grateful', 'Impressed', 'Nothing at all'], 0],
    ['mc', 'Two people want the same shift. What is true?', ['They both want something and only one can have it', 'One of them is wrong', 'Neither really wants it', 'They should both quit'], 0]
  ],
  2: [
    ['mc', 'Your friend cancels plans at the last minute. What is a second possible explanation besides "they do not care"?', ['Something urgent came up', 'They never liked you', 'They are lying', 'They forgot you exist'], 0],
    ['mc', 'A teacher gives you a lower grade than you expected without an explanation. What is a reasonable first assumption?', ['There may be a reason you have not heard yet', 'They are targeting you', 'The grade is a mistake for sure', 'The class is unfair'], 0],
    ['mc', 'You interrupt someone repeatedly in a meeting. What effect is this most likely to have?', ['They feel dismissed and stop contributing', 'They appreciate your energy', 'Nothing changes', 'They interrupt you back and it is fine'], 0]
  ],
  3: [
    ['mc', 'A co-worker does not greet you one morning. Which explanation should you consider FIRST?', ['They may be preoccupied or having a bad day', 'They dislike you', 'They want you fired', 'They are being rude on purpose'], 0],
    ['mc', 'You and a supervisor disagree about how a task should be done. What perspective is worth considering?', ['They may know constraints you cannot see', 'They are always right', 'They are trying to make it harder', 'Their opinion does not matter'], 0],
    ['mc', 'Why does generating more than one explanation for someone\'s behaviour matter?', ['The first explanation is often wrong and escalates conflict', 'It takes longer', 'It makes you agree with everyone', 'It avoids all conflict'], 0]
  ]
});

// ============================================================================
// EXECUTIVE FUNCTIONING
// ============================================================================

items('ef-planning', {
  1: [
    ['mc', 'You have a test tomorrow and a project due next week. What do you work on first?', ['The test', 'The project', 'Neither', 'Both at the same time'], 0],
    ['mc', 'What is the first step in planning a multi-step task?', ['List the steps', 'Start the hardest part', 'Set a deadline', 'Ask for an extension'], 0],
    ['mc', 'Which task list is in a workable order for making a sandwich?', ['Get bread, add filling, close sandwich', 'Close sandwich, get bread, add filling', 'Add filling, close sandwich, get bread', 'Close sandwich, add filling, get bread'], 0]
  ],
  2: [
    ['mc', 'You have: an essay due Friday, a quiz Wednesday and a form due today. What order?', ['Form, quiz, essay', 'Essay, quiz, form', 'Quiz, essay, form', 'Essay, form, quiz'], 0],
    ['mc', 'A project is due in 10 days. When should you plan the first work session?', ['Within the first two or three days', 'The night before it is due', 'Day 9', 'Whenever you feel like it'], 0],
    ['mc', 'You planned to study at 6pm but have a shift until 8pm. What is the best adjustment?', ['Move the study block to a time you are actually free', 'Skip studying', 'Study at 6pm anyway', 'Quit the shift'], 0]
  ],
  3: [
    ['mc', 'Your plan depends on a library computer that may be unavailable. What should the plan include?', ['A backup option and when to switch to it', 'Nothing, it will probably be free', 'A complaint to the library', 'A later deadline'], 0],
    ['mc', 'Halfway through a plan, you are behind schedule. What is the strongest response?', ['Identify which step is slow and adjust the remaining schedule', 'Keep going at the same pace', 'Abandon the plan', 'Ask for an extension immediately'], 0],
    ['mc', 'You have three deadlines in one week plus a work shift. What should you do first?', ['Map all commitments onto a calendar before deciding order', 'Start with the easiest task', 'Start with the first thing you remember', 'Ask to drop one'], 0]
  ]
});

items('ef-memory', {
  1: [
    ['mc', 'A teacher gives you three instructions at once. What is the most reliable strategy?', ['Write them down as they are given', 'Repeat them silently once', 'Trust you will remember', 'Ask a friend afterward'], 0],
    ['mc', 'You need to remember a phone number for 30 seconds. What strategy helps most?', ['Repeat it out loud', 'Think about something else', 'Write it tomorrow', 'Guess it later'], 0],
    ['mc', 'What does "chunking" mean as a memory strategy?', ['Grouping information into smaller sets', 'Reading it many times', 'Saying it louder', 'Writing it in cursive'], 0]
  ],
  2: [
    ['mc', 'You keep forgetting to bring a form home. What is the best support?', ['A reminder alarm plus putting the form in your bag immediately', 'Trying harder to remember', 'Asking a friend to remind you', 'Waiting until you remember'], 0],
    ['mc', 'You are given a locker combination, a room number and a time. What is the best move?', ['Write all three down immediately', 'Memorise the room number only', 'Remember the time only', 'Ask again later'], 0],
    ['mc', 'You lose track of a task halfway through. What support would help most?', ['A written checklist you can look back at', 'A longer deadline', 'A quieter room', 'A different task'], 0]
  ],
  3: [
    ['mc', 'Which is the strongest sign that a memory strategy is working?', ['You complete tasks without needing a repeat of the instructions', 'You feel more confident', 'You write more notes', 'You finish faster'], 0],
    ['mc', 'You are asked to do a 5-step task in a noisy setting. What is the best plan?', ['Write the steps and check them off as you go', 'Rely on memory and work faster', 'Do the steps in any order', 'Wait until the noise stops'], 0],
    ['mc', 'Why is using a checklist better than trying harder to remember?', ['It removes the load rather than increasing effort', 'It is faster to write', 'It impresses teachers', 'It is required by the IEP'], 0]
  ]
});

// ============================================================================
// INDEPENDENT LIVING
// ============================================================================

items('il-navigation', {
  1: [
    ['mc', 'A bus route map shows Route 22 stopping at Main and 5th. You need to reach Main and 5th. Which route?', ['Route 22', 'Any route', 'Route 5', 'None'], 0],
    ['mc', 'A building directory lists "Records — Room 210." What floor is Room 210 most likely on?', ['The second floor', 'The first floor', 'The tenth floor', 'The basement'], 0],
    ['mc', 'Your bus leaves at 8:15 and takes 25 minutes. What time do you arrive?', ['8:40', '8:25', '8:30', '9:15'], 0]
  ],
  2: [
    ['mc', 'You must arrive by 9:00 and the trip takes 35 minutes. What is the latest you should leave?', ['8:25', '8:45', '9:00', '8:55'], 0],
    ['mc', 'Your route requires a transfer with a 6-minute window. What is the biggest risk?', ['A delay on the first leg makes you miss the transfer', 'The second bus is too fast', 'The fare will change', 'The stop will move'], 0],
    ['mc', 'The bus you planned to take does not come. What is the best first step?', ['Check the app or schedule for the next option', 'Wait indefinitely', 'Walk the whole way without checking', 'Go home'], 0]
  ],
  3: [
    ['mc', 'You are at an unfamiliar stop, your phone is at 3 percent and the next bus is in 40 minutes. What is best?', ['Note the stop and route numbers now, then contact someone', 'Wait and use the phone for entertainment', 'Start walking in any direction', 'Turn the phone off entirely'], 0],
    ['mc', 'You realise you boarded a bus going the wrong direction. What is best?', ['Get off at the next stop and check the return route', 'Ride to the end of the line', 'Ask another passenger to fix it', 'Stay on and hope it loops'], 0],
    ['mc', 'You have a 10:00 appointment across town and one transfer. When should you plan to leave?', ['Early enough to absorb a missed transfer', 'Exactly the trip time before 10:00', 'Five minutes before', 'After 10:00'], 0]
  ]
});

items('il-safety', {
  1: [
    ['mc', 'When should you call 911?', ['When there is an immediate threat to life or safety', 'When you are bored', 'When you have a question', 'When a store is closed'], 0],
    ['mc', 'A stranger online asks for your home address. What do you do?', ['Do not give it and tell a trusted adult', 'Give it if they seem nice', 'Give a nearby address', 'Ask them for theirs first'], 0],
    ['mc', 'The smoke alarm sounds. What do you do first?', ['Leave the building', 'Look for the source', 'Open the windows', 'Call a friend'], 0]
  ],
  2: [
    ['mc', 'A text says you won a prize and must send a fee to claim it. What is this?', ['A scam', 'A legitimate contest', 'A bank notice', 'A delivery update'], 0],
    ['mc', 'Someone insists you decide right now or lose the offer. What does urgency usually signal?', ['A pressure tactic worth stepping away from', 'A genuinely good deal', 'A legal requirement', 'A discount'], 0],
    ['mc', 'A person offers you a ride and says not to tell anyone. What is the warning sign?', ['The request for secrecy', 'The offer of a ride', 'The time of day', 'The type of car'], 0]
  ],
  3: [
    ['mc', 'A caller says they are from your bank and asks for your full account number and PIN. What do you do?', ['Hang up and call the bank using the number on your card', 'Give the information', 'Give only the PIN', 'Ask them to call back'], 0],
    ['mc', 'A supervisor at work repeatedly comments on your body. You tell someone and nothing changes. What next?', ['Report it to a higher level or an outside agency and keep a record', 'Stop reporting it', 'Quit without telling anyone', 'Confront them alone'], 0],
    ['mc', 'A loan offers "no credit check, money today" at very high interest. What is the risk?', ['The total cost can far exceed the amount borrowed', 'There is no risk', 'It builds credit fast', 'It is always illegal'], 0]
  ]
});

items('il-health', {
  1: [
    ['mc', 'A label says "Take with food." What does that mean?', ['Eat something when you take it', 'Take it instead of food', 'Take it only at meals in restaurants', 'Take it with water only'], 0],
    ['mc', 'Which is a reason to see a doctor rather than treat something yourself?', ['A fever that lasts several days', 'A single sneeze', 'Feeling tired after exercise', 'A small paper cut'], 0],
    ['mc', 'How often should you wash your hands when preparing food?', ['Before starting and after handling raw meat', 'Once at the end', 'Only if they look dirty', 'Not necessary'], 0]
  ],
  2: [
    ['mc', 'You missed a dose of a daily medication and it is nearly time for the next one. What is generally advised?', ['Skip the missed dose and take the next one on schedule', 'Take both at once', 'Take a triple dose', 'Stop the medication'], 0],
    ['mc', 'A nutrition label shows 250 calories per serving and 2 servings per container. You eat the whole container. How many calories?', ['500', '250', '125', '750'], 0],
    ['mc', 'Which symptom needs emergency care rather than a clinic visit?', ['Chest pain with shortness of breath', 'A mild cough', 'A sore knee', 'A headache after a long day'], 0]
  ],
  3: [
    ['mc', 'At an appointment, what is the most useful thing to bring?', ['A list of symptoms, when they started, and current medications', 'Nothing', 'Only your insurance card', 'A friend to speak for you'], 0],
    ['mc', 'A doctor explains a plan you do not understand. What is the best response?', ['Ask them to explain it again in plain language', 'Nod and look it up later', 'Say nothing', 'Ask a different doctor'], 0],
    ['mc', 'Your prescription is running out and refills need 3 days. When should you request one?', ['At least 3 days before you run out', 'On the day you run out', 'After you run out', 'Only at the next appointment'], 0]
  ]
});

items('il-tech', {
  1: [
    ['mc', 'What makes a password stronger?', ['Length and a mix of character types', 'Using your name', 'Using 1234', 'Using the same one everywhere'], 0],
    ['mc', 'You get an email from an unknown sender with an attachment. What do you do?', ['Do not open it', 'Open it to see what it is', 'Forward it to friends', 'Reply asking who they are'], 0],
    ['mc', 'Where should you save a school assignment so you can find it later?', ['In a named folder for that course', 'On the desktop with a random name', 'In the downloads folder', 'Nowhere, keep it open'], 0]
  ],
  2: [
    ['mc', 'What does two-factor authentication add?', ['A second check beyond your password', 'A longer password', 'A faster login', 'A backup email'], 0],
    ['mc', 'An online form asks for your Social Security number to enter a giveaway. What do you do?', ['Do not enter it', 'Enter it to win', 'Enter a fake one', 'Ask a friend to enter theirs'], 0],
    ['mc', 'You need to reply to an employer with a document. What should you check before sending?', ['That the attachment is actually attached and correct', 'The font colour', 'The time of day', 'Nothing'], 0]
  ],
  3: [
    ['mc', 'A search returns a result from a site selling the product it describes. What should you consider?', ['The source has an interest in the conclusion', 'It must be accurate', 'It is a government source', 'It is peer reviewed'], 0],
    ['mc', 'Your device will not connect to wifi. What is a reasonable troubleshooting sequence?', ['Check airplane mode, forget and rejoin the network, restart', 'Buy a new device', 'Wait a week', 'Ask to change schools'], 0],
    ['mc', 'You need a screen reader on a device that is not yours. What is the best step?', ['Find the accessibility settings and enable it yourself', 'Do without it', 'Ask someone to read everything aloud', 'Use a different task'], 0]
  ]
});

// ============================================================================
// SELF-ADVOCACY
// ============================================================================

items('sa-accommodations', {
  1: [
    ['mc', 'What is an accommodation?', ['A change in how you access learning, not in what you learn', 'A lower standard for you', 'Extra homework', 'A different diploma'], 0],
    ['sj', 'You have extended time but the teacher collects the test at the bell. What do you do?', ['Tell the teacher you have extended time on your IEP', 'Hand it in incomplete', 'Say nothing and take a lower grade', 'Complain to a friend'], 0, [3]],
    ['mc', 'Who should know about your classroom accommodations?', ['Your teachers and your case manager', 'Only your parents', 'Nobody', 'Only your friends'], 0]
  ],
  2: [
    ['sj', 'A teacher says "you don\'t seem like you need that." What is the strongest response?', ['Explain what the accommodation does for you and ask your case manager to follow up', 'Stop using it', 'Argue in front of the class', 'Skip the class'], 0, [3]],
    ['mc', 'Why does explaining WHY you need an accommodation help?', ['It makes the request understandable and harder to dismiss', 'It is legally required of you', 'It shortens the conversation', 'It removes the need for an IEP'], 0],
    ['sj', 'You need to use a text-to-speech tool but the room is quiet. What is best?', ['Ask about headphones or a separate space', 'Skip the tool', 'Use it out loud anyway', 'Leave the room without asking'], 0, [2]]
  ],
  3: [
    ['mc', 'In college, who is responsible for requesting accommodations?', ['The student', 'The college automatically', 'The high school', 'The parents'], 0],
    ['mc', 'What do you usually need to provide to get college accommodations?', ['Documentation of your disability', 'A copy of your transcript only', 'Nothing', 'A letter from a friend'], 0],
    ['sj', 'An employer asks why you need a schedule adjustment. What is the strongest response?', ['State the functional need and the adjustment, without over-disclosing medical detail', 'Explain your full diagnosis history', 'Say it is none of their business', 'Withdraw the request'], 0, [2]]
  ]
});

items('sa-awareness', {
  1: [
    ['mc', 'What is an IEP?', ['A legal plan describing your goals and supports', 'A report card', 'A class schedule', 'A behaviour contract'], 0],
    ['mc', 'Which is an example of a learning strength?', ['Understanding ideas better when you see them drawn', 'Forgetting instructions', 'Struggling with reading', 'Missing deadlines'], 0],
    ['mc', 'Who is on your IEP team?', ['You, your parents, teachers and the case manager', 'Only the principal', 'Only your parents', 'Only teachers'], 0]
  ],
  2: [
    ['mc', 'Which law covers special education services in school?', ['IDEA', 'The ADA only', 'The Fair Labor Standards Act', 'FERPA'], 0],
    ['mc', 'Which law covers accommodations at work?', ['The ADA', 'IDEA', 'ESSA', 'None'], 0],
    ['mc', 'Which statement describes a disability in non-deficit language?', ['I process written text more slowly, so I use audio versions', 'I am bad at reading', 'I cannot read', 'Reading is not for me'], 0]
  ],
  3: [
    ['mc', 'At what age do educational rights typically transfer to the student in Illinois?', ['18', '16', '21', '14'], 0],
    ['mc', 'What changes when educational rights transfer to you?', ['You make the educational decisions your parents previously made', 'Your IEP ends', 'You leave school', 'Nothing changes'], 0],
    ['mc', 'When is disclosing a disability to an employer generally required?', ['Only when you are requesting an accommodation', 'On every application', 'Never under any circumstances', 'During the first interview'], 0]
  ]
});

items('sa-iep', {
  1: [
    ['mc', 'What happens at an IEP meeting?', ['The team reviews progress and sets goals and services', 'You take a test', 'You get your schedule', 'You choose electives'], 0],
    ['mc', 'How often must an IEP be reviewed?', ['At least once a year', 'Every four years', 'Only when you ask', 'Every month'], 0],
    ['mc', 'What is a present levels statement?', ['A description of what you can do now', 'A list of your grades', 'Your attendance record', 'Your class rank'], 0]
  ],
  2: [
    ['mc', 'What makes a goal measurable?', ['It states a condition, an observable behaviour and a criterion', 'It sounds ambitious', 'It is written by a teacher', 'It has a deadline'], 0],
    ['mc', 'What are transition services?', ['Activities to prepare you for life after high school', 'Bus services', 'Changing classes', 'Summer school'], 0],
    ['mc', 'Why should you attend your own IEP meeting?', ['You know what helps you and can say so', 'Attendance is graded', 'It gets you out of class', 'It is required by law at every age'], 0]
  ],
  3: [
    ['mc', 'You disagree with a proposed service reduction. What is the strongest step in the meeting?', ['State your disagreement, give a reason and propose an alternative', 'Say nothing and sign', 'Refuse to attend', 'Leave the meeting'], 0],
    ['mc', 'What are the three transition goal areas in an Illinois IEP?', ['Education/training, employment and independent living', 'Reading, math and behaviour', 'Home, school and community', 'Short, medium and long term'], 0],
    ['mc', 'How can you tell whether you are making progress on a goal?', ['Look at the progress monitoring data against the target', 'Ask how you feel about it', 'Check your grades only', 'Wait for the annual review'], 0]
  ]
});

// ============================================================================
// VOCATIONAL
// ============================================================================

items('vo-jobseeking', {
  1: [
    ['mc', 'What should you bring to a job interview?', ['Identification, references and a copy of your resume', 'Nothing', 'A friend', 'Your report card'], 0],
    ['mc', 'A posting says "Must be available weekends." You cannot work weekends. What should you do?', ['Look for a different posting', 'Apply and hope they change it', 'Apply and say you can work weekends', 'Apply without reading further'], 0],
    ['mc', 'What goes at the top of a resume?', ['Your name and contact information', 'Your hobbies', 'Your references', 'Your salary expectation'], 0]
  ],
  2: [
    ['sj', 'An interviewer asks "What is your greatest weakness?" What is the strongest answer?', ['Name a real one and what you do about it', 'Say you have none', 'Name something unrelated to work', 'Say you work too hard'], 0, [3]],
    ['mc', 'What is the purpose of a cover letter?', ['To connect your experience to that specific job', 'To repeat your resume', 'To list your references', 'To state your salary'], 0],
    ['sj', 'You have not heard back a week after an interview. What is best?', ['Send a brief polite follow-up', 'Call every day', 'Assume you did not get it', 'Show up at the workplace'], 0, [2]]
  ],
  3: [
    ['sj', 'An application asks about a gap in your work history. What is the strongest approach?', ['State it briefly and truthfully, then describe what you did during it', 'Leave it blank', 'Give false dates', 'Explain in great personal detail'], 0, [1]],
    ['mc', 'Who is an appropriate professional reference?', ['A former supervisor or teacher who knows your work', 'A close family member', 'A friend from school', 'Anyone with a phone'], 0],
    ['mc', 'What documents do you typically need on your first day of work?', ['Photo ID and proof of work eligibility', 'A resume only', 'Your IEP', 'A school transcript'], 0]
  ]
});

items('vo-workplace', {
  1: [
    ['sj', 'You will be 15 minutes late to your shift. What do you do?', ['Call your supervisor before the shift starts', 'Arrive and say nothing', 'Text a co-worker only', 'Skip the shift'], 0, [2]],
    ['sj', 'A supervisor tells you your work needs to be redone. What is best?', ['Say okay, ask what to change and redo it', 'Explain why it was fine', 'Redo it silently while upset', 'Ask a co-worker to do it'], 0, [2]],
    ['mc', 'Your break is 15 minutes. When should you return?', ['At 15 minutes or sooner', 'When you feel ready', 'After 20 minutes', 'When someone comes to find you'], 0]
  ],
  2: [
    ['sj', 'You finish your assigned task and the supervisor is busy. What is best?', ['Check the task list and start the next task', 'Stand and wait', 'Look at your phone', 'Leave early'], 0, [1]],
    ['sj', 'A customer is rude to you. What is the strongest response?', ['Stay calm, help if you can, and get a supervisor if it escalates', 'Respond in kind', 'Walk away without a word', 'Argue until they stop'], 0, [2]],
    ['sj', 'You are sick and cannot work your shift. What do you do?', ['Notify the supervisor through the required channel as early as possible', 'Text a co-worker to cover', 'Post about it online', 'Just do not show up'], 0, [1]]
  ],
  3: [
    ['sj', 'You notice a co-worker taking supplies home. What is best?', ['Follow the site\'s reporting procedure', 'Confront them yourself', 'Take some too', 'Say nothing ever'], 0, [1]],
    ['sj', 'You made an error that will affect the next shift. What is best?', ['Report it immediately with what happened and what is needed', 'Fix it quietly and say nothing', 'Wait to see if anyone notices', 'Blame the equipment'], 0, [1]],
    ['sj', 'A supervisor gives you feedback you think is unfair. What is the strongest response?', ['Acknowledge it, then ask for a time to discuss it calmly', 'Argue on the spot', 'Ignore it', 'Complain to co-workers'], 0, [2]]
  ]
});

items('vo-career', {
  1: [
    ['mc', 'What does a career interest inventory tell you?', ['Types of work that match your preferences', 'How much you will earn', 'Whether you will be hired', 'Your grade point average'], 0],
    ['mc', 'Which is a work preference rather than a job title?', ['Working outdoors', 'Electrician', 'Nurse', 'Mechanic'], 0],
    ['mc', 'Where can you find out what training a job requires?', ['A career information site or the job posting', 'A friend\'s guess', 'Social media', 'A movie'], 0]
  ],
  2: [
    ['mc', 'Which is a transferable skill?', ['Showing up on time', 'Knowing one store\'s register system', 'Having a specific locker', 'Owning a car'], 0],
    ['mc', 'A job requires a certificate you do not have. What is a reasonable next step?', ['Find out how long the certificate takes and where to get it', 'Apply anyway and hope', 'Choose a different career entirely', 'Give up on that field'], 0],
    ['mc', 'What does "outlook" mean in career information?', ['Whether jobs in that field are expected to grow', 'The view from the workplace', 'Your chance of promotion', 'The dress code'], 0]
  ],
  3: [
    ['mc', 'Which agency in Illinois helps adults with disabilities find and keep employment?', ['The Division of Rehabilitation Services (DRS)', 'The Department of Motor Vehicles', 'The local library', 'The school district'], 0],
    ['mc', 'Why apply to adult service agencies before leaving high school?', ['Waiting lists mean support may not start immediately', 'It is required for graduation', 'It replaces the IEP', 'It guarantees a job'], 0],
    ['mc', 'You are comparing a two-year certificate and a four-year degree for the same field. What should you compare?', ['Cost, length, entry requirements and what each qualifies you for', 'Only the cost', 'Only the length', 'Only which sounds better'], 0]
  ]
});

items('vo-communication', {
  1: [
    ['sj', 'You do not understand a work instruction. What is best?', ['Ask a specific question before starting', 'Start and hope it is right', 'Ask a co-worker to do it', 'Do nothing'], 0, [2]],
    ['sj', 'You run out of a supply mid-shift. What do you do?', ['Tell the supervisor what ran out and what you need', 'Stop working', 'Use something else without asking', 'Wait until the end of the shift'], 0, [3]],
    ['mc', 'Which greeting is appropriate at work?', ['Good morning, how can I help?', 'Yo', 'What do you want?', 'Nothing at all'], 0]
  ],
  2: [
    ['sj', 'A co-worker and you are assigned one task together. What is best?', ['Agree who does what and check in partway through', 'Do it all yourself', 'Wait for them to lead', 'Do your half and leave'], 0, [3]],
    ['sj', 'You need next Friday off. What is best?', ['Request it through the proper channel with as much notice as possible', 'Tell a co-worker', 'Just do not come in', 'Ask on Friday morning'], 0, [1]],
    ['mc', 'A supervisor sends a group message asking who can cover a shift. What is an appropriate reply?', ['A clear yes or no with your availability', 'No reply', 'A joke', 'A reply to everyone complaining'], 0]
  ],
  3: [
    ['sj', 'A briefing mentions a process change you did not fully catch. What is best?', ['Ask for clarification before the shift, and write down the change', 'Guess and continue', 'Ask a co-worker mid-task', 'Do it the old way'], 0, [2]],
    ['sj', 'You are given feedback in front of customers. What is the strongest response?', ['Acknowledge it briefly and follow up privately if needed', 'Defend yourself immediately', 'Walk away', 'Ignore it entirely'], 0, [3]],
    ['sj', 'Your assigned task conflicts with a safety rule. What do you do?', ['Stop and raise it with a supervisor before continuing', 'Do it as told', 'Do it your own way silently', 'Refuse without explanation'], 0, [3]]
  ]
});

// ============================================================================
// STUDY & TEST SKILLS
// ============================================================================

items('st-testprep', {
  1: [
    ['mc', 'Which is an active study strategy?', ['Testing yourself with questions', 'Rereading the chapter', 'Highlighting everything', 'Copying notes word for word'], 0],
    ['mc', 'When should you start studying for a test in five days?', ['Within the first day or two', 'The night before', 'The morning of', 'After the test'], 0],
    ['mc', 'What should you find out first about an upcoming test?', ['What content it covers and what format it uses', 'Who else is taking it', 'How long the teacher has taught', 'What the room number is'], 0]
  ],
  2: [
    ['mc', 'Why is studying on three separate days better than one long session?', ['Spacing improves retention', 'It takes less total time', 'It is easier to schedule', 'Teachers require it'], 0],
    ['mc', 'You made flashcards and can answer them all. What should you do next?', ['Test yourself without the cards in front of you', 'Make more cards', 'Read them again', 'Stop studying'], 0],
    ['mc', 'Which is the best use of a practice test?', ['Identify what you do not know, then restudy it', 'Confirm you already know everything', 'Memorise the answers', 'Skip the hard parts'], 0]
  ],
  3: [
    ['mc', 'Your practice test shows you know 3 of 5 topics well. How should you spend remaining study time?', ['Mostly on the two weak topics', 'Evenly on all five', 'Mostly on the three strong ones', 'On a different subject'], 0],
    ['mc', 'Rereading feels effective but predicts poor test performance. Why?', ['Familiarity is mistaken for knowing', 'It takes too long', 'It is boring', 'It uses the wrong notes'], 0],
    ['mc', 'A test will be short-answer rather than multiple choice. How should studying change?', ['Practise producing answers from memory, not recognising them', 'Study exactly the same way', 'Only reread notes', 'Memorise the textbook'], 0]
  ]
});

items('st-teststrategy', {
  1: [
    ['mc', 'What should you do before answering the first question on a test?', ['Read the directions', 'Answer as fast as possible', 'Check the clock only', 'Ask a neighbour'], 0],
    ['mc', 'You do not know an answer on a test with no penalty for guessing. What should you do?', ['Eliminate what you can and choose', 'Leave it blank', 'Choose the longest option always', 'Skip the rest of the test'], 0],
    ['mc', 'You have 30 minutes and 30 questions. About how long per question?', ['One minute', 'Three minutes', 'Ten seconds', 'Five minutes'], 0]
  ],
  2: [
    ['mc', 'A question asks you to "compare and contrast." What must your answer include?', ['Both similarities and differences', 'Only similarities', 'Only differences', 'A definition'], 0],
    ['mc', 'You are stuck on question 4 with 20 questions left. What is best?', ['Mark it, move on, and return if time allows', 'Stay until you solve it', 'Guess and stop reading', 'Start over from question 1'], 0],
    ['mc', 'You have 5 minutes left and 3 unanswered questions. What is best?', ['Answer all three quickly rather than perfecting one', 'Perfect one and leave two blank', 'Recheck answered questions', 'Stop working'], 0]
  ],
  3: [
    ['mc', 'A short-answer question has three parts. You answer two well. What will happen?', ['You lose the credit for the missing part', 'You get full credit', 'The question is thrown out', 'You get extra credit'], 0],
    ['mc', 'You finish a test with time remaining. What is the highest-value use of that time?', ['Check for skipped items and reread the directions', 'Hand it in early', 'Change all uncertain answers', 'Rewrite neatly'], 0],
    ['mc', 'Why show your work even when the final answer is wrong?', ['Partial credit is often awarded for correct reasoning', 'It looks neater', 'It takes longer', 'Teachers require it always'], 0]
  ]
});

items('st-directions', {
  1: [
    ['mc', 'Directions say: "Answer questions 1-5. Skip question 6." What do you do with question 6?', ['Leave it blank', 'Answer it', 'Answer it for extra credit', 'Cross it out and answer 7'], 0],
    ['mc', 'Directions say "Use complete sentences." What does that require?', ['Each answer has a subject and a verb', 'Answers are long', 'Answers are in bullet points', 'Answers are one word'], 0],
    ['mc', 'What does the task verb "list" require?', ['Name the items, without explanation', 'Explain each item fully', 'Compare the items', 'Argue for one item'], 0]
  ],
  2: [
    ['mc', 'What does the task verb "explain" require that "list" does not?', ['Reasons or how something works', 'More items', 'Shorter answers', 'A drawing'], 0],
    ['mc', 'A rubric awards points for "evidence from the text." What must your answer include?', ['A specific quotation or detail from the reading', 'Your opinion', 'A summary of the whole text', 'A title'], 0],
    ['mc', 'Directions say "Choose two of the four prompts." How many do you answer?', ['Two', 'Four', 'One', 'All of them'], 0]
  ],
  3: [
    ['mc', 'What does the task verb "justify" require?', ['State a position and give reasons and evidence for it', 'Describe the topic', 'List the facts', 'Summarize the reading'], 0],
    ['mc', 'Directions say: "If you selected option A, complete section 3. Otherwise skip to section 4." You chose B. What next?', ['Go to section 4', 'Complete section 3', 'Complete both', 'Stop'], 0],
    ['mc', 'You do not understand one requirement in a long set of directions. What is best?', ['Identify the specific requirement and ask about that part', 'Ask the teacher to re-explain everything', 'Guess at the whole assignment', 'Skip the assignment'], 0]
  ]
});

// ============================================================================
// SELF-REPORT ANCHOR ITEMS
// Benchmark-derived items carry most self-report probes; these add a stable
// domain-level anchor at each tier so the check-in is not purely a restatement
// of the goal back to the student.
// ============================================================================

const SELF_REPORT = {
  'be-regulation': [
    'I noticed I was getting upset before it became a problem.',
    'I used a calming strategy instead of reacting.',
    'I came back to what I was doing after getting upset.'
  ],
  'be-directions': [
    'I did what an adult asked the first time.',
    'I followed directions even when I did not want to.',
    'I followed directions given to the whole class without needing them repeated to me.'
  ],
  'be-expectations': [
    'I stayed in my assigned area during class.',
    'I waited to be called on before speaking.',
    'I followed the class expectations even when others did not.'
  ],
  'se-coping': [
    'I noticed when I was stressed or upset.',
    'I used a strategy from my plan when I was upset.',
    'The strategy I used actually helped.'
  ],
  'se-frustration': [
    'I kept working on something hard instead of stopping.',
    'I asked for help instead of giving up.',
    'I stayed with a task even when I got it wrong the first time.'
  ],
  'se-resilience': [
    'I could name something I am good at.',
    'I said something encouraging to myself after a setback.',
    'I kept going after something did not work out.'
  ],
  'ef-initiation': [
    'I started my work without being told twice.',
    'I started even when I was not sure how.',
    'I got back to work quickly after an interruption.'
  ],
  'ef-organization': [
    'My papers and files were where they belonged.',
    'I wrote down my assignments and due dates.',
    'I could find what I needed without searching for it.'
  ],
  'ef-time': [
    'I knew roughly how long my work would take.',
    'I finished things before they were due.',
    'I planned my week so nothing was left to the last night.'
  ],
  'ef-monitoring': [
    'I noticed when I was off task.',
    'My rating of my own work matched what my teacher thought.',
    'I changed what I was doing when it was not working.'
  ],
  'sa-helpseeking': [
    'I asked for help when I was stuck.',
    'I asked a specific question instead of saying "I do not get it".',
    'I asked for help before the deadline, not after.'
  ],
  'sa-determination': [
    'I set a goal for myself.',
    'I made a choice and stuck with it.',
    'I followed through on something I said I would do.'
  ],
  'st-study': [
    'I studied at the time I planned to.',
    'I set up a place to study without distractions.',
    'I reviewed material more than once before the test.'
  ]
};

for (const [pool, prompts] of Object.entries(SELF_REPORT)) {
  items(pool, {
    1: [['scale', prompts[0], 'Never', 'Every time']],
    2: [['scale', prompts[1], 'Never', 'Every time']],
    3: [['scale', prompts[2], 'Never', 'Every time']]
  });
}

// ============================================================================
// OBSERVATION RUBRICS
// Where the thing being measured is the quality of a product or a performance,
// a four-point rubric row is a truer measure than a tally of opportunities.
// Pools not listed here fall back to benchmark-derived tallies at run time.
// ============================================================================

const RUBRICS = {
  'rd-fluency': [
    [1, 'Phrasing', ['Word by word', 'Two-word phrases', 'Three- and four-word phrases', 'Meaningful phrases throughout']],
    [2, 'Accuracy and self-correction', ['Frequent uncorrected errors', 'Some errors, few corrected', 'Most meaning-changing errors self-corrected', 'Errors rare and self-corrected immediately']],
    [3, 'Expression and pace', ['Flat, no expression', 'Some expression, uneven pace', 'Expression matches meaning most of the time', 'Expression and pace consistently match the meaning']]
  ],
  'rd-written': [
    [1, 'Accuracy to the text', ['Not based on the text', 'Partly accurate', 'Accurate with minor gaps', 'Fully accurate to the text']],
    [2, 'Completeness', ['One point covered', 'Some main points covered', 'Most main points covered', 'All main points covered in order']],
    [3, 'Own words and objectivity', ['Copied from the text', 'Mostly copied phrasing', 'Mostly own words, some opinion', 'Own words throughout, no opinion']]
  ],
  'wr-paragraph': [
    [1, 'Topic sentence and focus', ['No topic sentence', 'Topic sentence unclear', 'Clear topic sentence', 'Clear topic sentence that all details support']],
    [2, 'Development and detail', ['One detail or fewer', 'Two relevant details', 'Three relevant details', 'Three or more developed, relevant details']],
    [3, 'Organization and conventions', ['No clear order, frequent errors', 'Some order, several errors', 'Clear order, minor errors', 'Clear order with transitions, conventions correct']]
  ],
  'wr-functional': [
    [1, 'Completeness of required fields', ['Most fields blank', 'Some fields complete', 'Nearly all fields complete', 'Every required field complete']],
    [2, 'Accuracy of information', ['Frequent inaccuracies', 'Some inaccuracies', 'Minor inaccuracies', 'All information accurate']],
    [3, 'Tone and appropriateness for the audience', ['Inappropriate for the audience', 'Inconsistent tone', 'Mostly appropriate tone', 'Consistently appropriate and professional']]
  ],
  'co-expressive': [
    [1, 'Grammar and sentence structure', ['Mostly incomplete utterances', 'Simple sentences with errors', 'Complete sentences, occasional errors', 'Varied, grammatically complete sentences']],
    [2, 'Vocabulary specificity', ['Mostly nonspecific words', 'Some specific vocabulary', 'Mostly specific vocabulary', 'Precise vocabulary throughout']],
    [3, 'Clarity to an unfamiliar listener', ['Listener cannot follow', 'Listener follows with many questions', 'Listener follows with one or two questions', 'Listener follows with no questions']]
  ],
  'st-notes': [
    [1, 'Capture of main points', ['Few main points recorded', 'Some main points recorded', 'Most main points recorded', 'All main points recorded']],
    [2, 'Supporting detail', ['No supporting detail', 'Occasional detail', 'Detail for most main points', 'Detail for every main point']],
    [3, 'Usability for study', ['Not usable for study', 'Partly usable', 'Usable with effort', 'Organized and immediately usable for study']]
  ]
};

for (const [pool, rows] of Object.entries(RUBRICS)) {
  const byTier = { 1: [], 2: [], 3: [] };
  for (const [tier, label, levels] of rows) byTier[tier].push(['rubric', label, levels]);
  items(pool, byTier);
}

module.exports = { POOL_ITEMS };
