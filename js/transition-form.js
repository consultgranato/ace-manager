// =============================================================
// Ace Manager — Transition Assessment Form (public, student-facing)
// =============================================================
// EXACT-STRING CONTRACT: option strings below are matched verbatim by
// the IEP Builder synthesis engine. Do not alter wording or punctuation.
// =============================================================

(function () {
  const OPTS = {
    postSecondaryGoal: ['4-year college','2-year or community college','Trade or technical school','Military','Start working right away','Still exploring my options'],
    studentStrengths: ['Being a good friend','Talking and communicating with others','Working hard','Being creative','Helping others','Being organized','Solving problems','Being reliable','Staying positive','Being athletic'],
    outsideInterests: ['Sports','Music','Art','Gaming','Volunteering','A job','Clubs','Religious or community activities','Spending time with family or friends'],
    learningStyles: ['Hands-on practice','Seeing examples or demonstrations','Listening to explanations','Reading on my own','Working in groups','Working by myself','Using technology'],
    schoolChallenges: ['Staying organized','Focusing in class','Keeping up with the pace of class','Reading','Writing','Math','Taking tests','Asking for help','Managing my time'],
    disabilityAwareness: ['Yes — I understand it well','Somewhat — I know a little','Not really — I\'m not sure','No — I don\'t know much about it'],
    selfAdvocacyActions: ['Asking a teacher for help','Telling someone what accommodations I need','Emailing a teacher with a question','Asking for extra time','Talking to my case manager','Setting up a meeting myself','None of these yet'],
    independentLiving: ['Living with family','Living on my own','Living with a roommate','Living in a college dorm','I\'m not sure yet'],
    dailyLivingSkills: ['Cook simple meals','Do laundry','Manage money or a budget','Use public transportation','Schedule my own appointments','Take medications on my own','Shop for groceries','Clean and take care of a space'],
    dailyLivingGrowth: ['Cooking','Doing laundry','Managing money','Using transportation','Scheduling appointments','Managing medications','Grocery shopping','Cleaning and home care'],
    communityActivities: ['A part-time job','Volunteering','A club or sports team','A religious or community group','An internship or work program','Nothing currently'],
    outsideAgencies: ['DRS (Division of Rehabilitation Services)','A mental health provider','A community support agency','None that I know of']
  };

  const esc = (s) => window.aceUtils.escapeHtml(s);
  let TOKEN = null, LINK = null;

  function getToken() { return new URLSearchParams(window.location.search).get('t'); }

  async function init() {
    const host = document.getElementById('transitionFormHost');
    TOKEN = getToken();
    if (!TOKEN) { msg(host, 'This link is missing its code. Please use the exact link your case manager sent.'); return; }
    const { data, error } = await window.aceSupabase.rpc('get_ta_by_token', { p_token: TOKEN });
    if (error) { msg(host, 'Something went wrong loading this assessment. Please try again later.'); return; }
    if (!data || data.length === 0) { msg(host, 'This assessment link is no longer active. Please ask your case manager for a new one.'); return; }
    LINK = data[0];
    renderForm(host, LINK.draft_payload || {});
  }

  function msg(host, m) { host.innerHTML = `<div class="public-form-card public-form-msg">${esc(m)}</div>`; }

  function checks(field, draft) {
    const checked = (draft && Array.isArray(draft[field])) ? draft[field] : [];
    return `<div class="tform-checkgroup" data-field="${field}">
      ${OPTS[field].map(o => `<label class="tform-check"><input type="checkbox" value="${esc(o)}" ${checked.includes(o)?'checked':''} /><span>${esc(o)}</span></label>`).join('')}
    </div>`;
  }
  function radios(field, draft) {
    const v = draft ? draft[field] : '';
    return `<div class="tform-radiogroup" data-field="${field}">
      ${OPTS[field].map(o => `<label class="tform-radio"><input type="radio" name="${field}" value="${esc(o)}" ${v===o?'checked':''} /><span>${esc(o)}</span></label>`).join('')}
    </div>`;
  }
  function scale(field, draft, lowLabel, highLabel) {
    const v = draft ? draft[field] : null;
    return `<div class="ta-scale" data-field="${field}">
      <div class="ta-scale-row">
        ${[1,2,3,4,5].map(n => `<button type="button" class="ta-scale-dot ${v===n?'selected':''}" data-val="${n}">${n}</button>`).join('')}
      </div>
      <div class="ta-scale-labels"><span>${esc(lowLabel)}</span><span>${esc(highLabel)}</span></div>
    </div>`;
  }

  function renderForm(host, draft) {
    const name = LINK.student_first || 'you';
    host.innerHTML = `
      <div class="public-form-card">
        <h1 class="public-form-title">Your Transition Assessment</h1>
        <p class="public-form-lead">Hi ${esc(name)}! This is about <strong>you</strong> — your strengths, your goals, and what you want for your future. There are no wrong answers. Answer honestly, skip anything you want, and your case manager will use this to help plan with you.</p>

        <div class="ta-group"><div class="ta-group-title">Your future</div>
          <div class="tform-field"><label class="tform-label">After high school, I'm thinking about…</label>${radios('postSecondaryGoal', draft)}</div>
          <div class="tform-field"><label class="tform-label">What kind of job or career interests you?</label><textarea id="ta-careerInterest" rows="2">${esc(draft.careerInterest||'')}</textarea></div>
          <div class="tform-field"><label class="tform-label">How clear is your plan for after high school?</label>${scale('postSecondaryReadiness', draft, 'No idea yet', 'Very clear')}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">Your strengths &amp; interests</div>
          <div class="tform-field"><label class="tform-label">What are you good at? <span class="muted">(check any)</span></label>${checks('studentStrengths', draft)}</div>
          <div class="tform-field"><label class="tform-label">What do you do outside of school? <span class="muted">(check any)</span></label>${checks('outsideInterests', draft)}</div>
          <div class="tform-field"><label class="tform-label">How do you learn best? <span class="muted">(check any)</span></label>${checks('learningStyles', draft)}</div>
          <div class="tform-field"><label class="tform-label">What's hardest about school for you? <span class="muted">(check any)</span></label>${checks('schoolChallenges', draft)}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">School &amp; you</div>
          <div class="tform-field"><label class="tform-label">How do you feel about school overall?</label>${scale('schoolSentiment', draft, 'Not great', 'Really good')}</div>
          <div class="tform-field"><label class="tform-label">Do you understand how your disability affects your learning?</label>${radios('disabilityAwareness', draft)}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">Speaking up for yourself</div>
          <div class="tform-field"><label class="tform-label">How comfortable are you asking for help when you need it?</label>${scale('selfAdvocacyComfort', draft, 'Not comfortable', 'Very comfortable')}</div>
          <div class="tform-field"><label class="tform-label">Which of these have you done? <span class="muted">(check any)</span></label>${checks('selfAdvocacyActions', draft)}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">Life after school</div>
          <div class="tform-field"><label class="tform-label">After high school, I think I'll be…</label>${radios('independentLiving', draft)}</div>
          <div class="tform-field"><label class="tform-label">Which of these can you do on your own already? <span class="muted">(check any)</span></label>${checks('dailyLivingSkills', draft)}</div>
          <div class="tform-field"><label class="tform-label">Which of these would you like more help with? <span class="muted">(check any)</span></label>${checks('dailyLivingGrowth', draft)}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">Community &amp; connections</div>
          <div class="tform-field"><label class="tform-label">Are you part of any of these right now? <span class="muted">(check any)</span></label>${checks('communityActivities', draft)}</div>
          <div class="tform-field"><label class="tform-label">Do you work with any agencies outside of school? <span class="muted">(check any)</span></label>${checks('outsideAgencies', draft)}</div>
        </div>

        <div class="ta-group"><div class="ta-group-title">Your voice</div>
          <div class="tform-field"><label class="tform-label">Anything else you want your team to know? This is your space.</label><textarea id="ta-studentVoice" rows="4">${esc(draft.studentVoice||'')}</textarea></div>
        </div>

        <div id="taFormError" class="error-msg" style="display:none;"></div>
        <button class="btn-primary tform-submit" id="taSubmit">Submit My Assessment</button>
        <div class="tform-saved-hint muted" id="taSavedHint"></div>
      </div>
    `;

    // Scale button handlers
    host.querySelectorAll('.ta-scale').forEach(sc => {
      sc.querySelectorAll('.ta-scale-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          sc.querySelectorAll('.ta-scale-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          sc.dataset.value = dot.dataset.val;
          scheduleDraftSave();
        });
      });
    });

    function scaleVal(field) {
      const sc = host.querySelector(`.ta-scale[data-field="${field}"]`);
      return sc && sc.dataset.value ? parseInt(sc.dataset.value, 10) : null;
    }
    function radioVal(field) {
      const el = host.querySelector(`input[name="${field}"]:checked`);
      return el ? el.value : '';
    }
    function checkVals(field) {
      return Array.from(host.querySelectorAll(`.tform-checkgroup[data-field="${field}"] input:checked`)).map(el => el.value);
    }

    function computeReadiness(p) {
      const scales = [p.postSecondaryReadiness, p.selfAdvocacyComfort, p.schoolSentiment].filter(n => typeof n === 'number');
      if (!scales.length) return 0;
      const avg = scales.reduce((a, b) => a + b, 0) / scales.length;
      return Math.round((avg / 5) * 100);
    }

    function collectPayload() {
      const p = {
        version: 'TA1',
        studentFirstName: LINK.student_first || '',
        grade: LINK.student_grade || '',
        assessmentDate: new Date().toISOString().split('T')[0],
        postSecondaryGoal: radioVal('postSecondaryGoal'),
        careerInterest: document.getElementById('ta-careerInterest').value.trim(),
        postSecondaryReadiness: scaleVal('postSecondaryReadiness'),
        studentStrengths: checkVals('studentStrengths'),
        outsideInterests: checkVals('outsideInterests'),
        learningStyles: checkVals('learningStyles'),
        schoolChallenges: checkVals('schoolChallenges'),
        schoolSentiment: scaleVal('schoolSentiment'),
        disabilityAwareness: radioVal('disabilityAwareness'),
        selfAdvocacyComfort: scaleVal('selfAdvocacyComfort'),
        selfAdvocacyActions: checkVals('selfAdvocacyActions'),
        independentLiving: radioVal('independentLiving'),
        dailyLivingSkills: checkVals('dailyLivingSkills'),
        dailyLivingGrowth: checkVals('dailyLivingGrowth'),
        communityActivities: checkVals('communityActivities'),
        outsideAgencies: checkVals('outsideAgencies'),
        studentVoice: document.getElementById('ta-studentVoice').value.trim()
      };
      p.overallReadinessScore = computeReadiness(p);
      return p;
    }

    let saveTimer = null;
    function scheduleDraftSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        await window.aceSupabase.rpc('save_ta_draft', { p_token: TOKEN, p_draft: collectPayload() });
        const hint = document.getElementById('taSavedHint');
        if (hint) { hint.textContent = 'Progress saved — you can come back to this link anytime'; setTimeout(() => { if (hint) hint.textContent = ''; }, 2500); }
      }, 1200);
    }
    host.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', scheduleDraftSave);
      el.addEventListener('change', scheduleDraftSave);
    });

    document.getElementById('taSubmit').addEventListener('click', async () => {
      const errEl = document.getElementById('taFormError');
      errEl.style.display = 'none';
      const payload = collectPayload();
      const answered = payload.postSecondaryGoal || payload.careerInterest || payload.studentStrengths.length || payload.studentVoice;
      if (!answered) { errEl.textContent = 'Please answer at least a few questions before submitting.'; errEl.style.display = 'block'; return; }
      const { data, error } = await window.aceSupabase.rpc('submit_ta', { p_token: TOKEN, p_payload: payload });
      if (error || data !== true) { errEl.textContent = 'This link may no longer be active. Please ask your case manager for a new one.'; errEl.style.display = 'block'; return; }
      renderThankYou(host, name);
    });
  }

  function renderThankYou(host, name) {
    host.innerHTML = `
      <div class="public-form-card public-form-thankyou">
        <div class="thankyou-icon">${window.aceIcons.check(36)}</div>
        <h1 class="public-form-title">Thanks, ${esc(name)}!</h1>
        <p class="public-form-lead">You're done. Your answers have been shared with your case manager and will help plan for your future. You can close this page.</p>
      </div>
    `;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
