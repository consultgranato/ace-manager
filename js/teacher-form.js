// =============================================================
// Ace Manager — Teacher Feedback Form (public, token-based)
// =============================================================
// No auth. Loads via ?t=token. Picker → name → TF1 form → submit.
// Emits the exact TF1 payload shape the narrative engine consumes.
// =============================================================

(function () {
  const TF1 = {
    overallPerformance: ['Significantly below expectations','Below expectations','Approaching expectations','Meeting expectations','Exceeding expectations'],
    workCompletion: ['Rarely completes work (less than 50%)','Sometimes completes work (50–70%)','Usually completes work (70–85%)','Consistently completes work (85%+)'],
    participationLevel: ['Rarely participates — needs significant prompting','Sometimes participates — inconsistent','Usually participates — occasional prompting needed','Consistently participates — self-directed'],
    engagementLevel: ['Rarely engaged — frequently off-task','Sometimes engaged — inconsistent attention','Usually engaged — occasional redirection','Consistently engaged — focused and on-task'],
    independenceLevel: ['Requires near-constant adult support','Requires frequent check-ins and prompting','Works independently with occasional support','Fully independent in this setting'],
    peerInteractions: ['Significant difficulty with peer interactions','Some difficulty — inconsistent peer interactions','Generally appropriate peer interactions','Consistently appropriate — positive peer interactions'],
    effectiveStrategies: ['Visual supports','Hands-on activities','Chunking tasks into smaller steps','Frequent check-ins','Preferential seating','Extended time','Movement breaks','Small group instruction','One-on-one support','Written instructions','Verbal reminders','Positive reinforcement'],
    functionalStrengths: ['Self-advocates when needed','Works well with peers','Follows classroom routines','Accepts feedback well','Stays organized','Manages time well','Persists through challenges','Asks for help appropriately'],
    participationStrengths: ['Asks clarifying questions','Volunteers answers','Engages in discussions','Completes warm-ups','Takes notes independently'],
    academicBarriers: ['Reading comprehension','Written expression','Math reasoning','Processing speed','Attention/focus','Organization','Memory/retention','Vocabulary','Note-taking','Test-taking']
  };

  const SETTINGS = [
    { value: 'gen_ed', label: 'General Education' },
    { value: 'co_taught', label: 'Co-Taught' },
    { value: 'sped_resource', label: 'Special Education / Resource' }
  ];

  const esc = (s) => window.aceUtils.escapeHtml(s);
  let TOKEN = null, LINK = null, CHOSEN_COURSE = null;

  function getToken() {
    return new URLSearchParams(window.location.search).get('t');
  }

  async function init() {
    const host = document.getElementById('teacherFormHost');
    TOKEN = getToken();
    if (!TOKEN) { renderError(host, 'This link is missing its code. Please use the exact link your case manager sent.'); return; }

    const { data, error } = await window.aceSupabase.rpc('get_feedback_link_by_token', { p_token: TOKEN });
    if (error) { renderError(host, 'Something went wrong loading this form. Please try again later.'); return; }
    if (!data || data.length === 0) {
      renderError(host, 'This feedback link is no longer active. Please ask your case manager for the current link.');
      return;
    }
    LINK = data[0];
    renderPicker(host);
  }

  function renderError(host, msg) {
    host.innerHTML = `<div class="public-form-card public-form-msg">${esc(msg)}</div>`;
  }

  function renderPicker(host) {
    const courses = LINK.courses || [];
    if (courses.length === 0) {
      renderError(host, 'No classes are set up for feedback on this student yet. Please check with the case manager.');
      return;
    }
    host.innerHTML = `
      <div class="public-form-card">
        <h1 class="public-form-title">Feedback for ${esc(LINK.student_first)}</h1>
        <p class="public-form-lead">Thanks for taking a few minutes. First, which class do you teach ${esc(LINK.student_first)} in?</p>
        <div class="picker-list">
          ${courses.map((c, i) => `
            <button class="picker-item" data-idx="${i}">
              <span>${esc(c.name)}</span>
              ${window.aceIcons.chevronRight(16)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    host.querySelectorAll('.picker-item').forEach(btn => {
      btn.addEventListener('click', () => {
        CHOSEN_COURSE = courses[parseInt(btn.dataset.idx, 10)];
        renderForm(host);
      });
    });
  }

  function checkboxGroup(field, options) {
    return `
      <div class="tform-checkgroup" data-field="${field}">
        ${options.map(o => `
          <label class="tform-check">
            <input type="checkbox" value="${esc(o)}" />
            <span>${esc(o)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function radioGroup(field, options) {
    return `
      <div class="tform-radiogroup" data-field="${field}">
        ${options.map(o => `
          <label class="tform-radio">
            <input type="radio" name="${field}" value="${esc(o)}" />
            <span>${esc(o)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function renderForm(host) {
    host.innerHTML = `
      <div class="public-form-card">
        <button class="tform-back" id="tformBack">${window.aceIcons.arrowLeft(15)} Choose a different class</button>
        <h1 class="public-form-title">${esc(CHOSEN_COURSE.name)}</h1>
        <p class="public-form-lead">Feedback for ${esc(LINK.student_first)}. Your answers help build their IEP present levels.</p>

        <div class="tform-field">
          <label class="tform-label">Your name <span class="req">*</span></label>
          <input type="text" id="tf-teacherName" placeholder="e.g., Ms. Behling" />
        </div>

        <div class="tform-field">
          <label class="tform-label">Class setting <span class="req">*</span></label>
          ${radioGroup('settingType', SETTINGS.map(s => s.label))}
        </div>

        <div class="tform-field">
          <label class="tform-label">Overall performance in your class</label>
          ${radioGroup('overallPerformance', TF1.overallPerformance)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Work completion</label>
          ${radioGroup('workCompletion', TF1.workCompletion)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Participation</label>
          ${radioGroup('participationLevel', TF1.participationLevel)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Engagement</label>
          ${radioGroup('engagementLevel', TF1.engagementLevel)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Independence</label>
          ${radioGroup('independenceLevel', TF1.independenceLevel)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Peer interactions</label>
          ${radioGroup('peerInteractions', TF1.peerInteractions)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Strategies you've found effective <span class="muted">(check any)</span></label>
          ${checkboxGroup('effectiveStrategies', TF1.effectiveStrategies)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Functional strengths you've observed <span class="muted">(check any)</span></label>
          ${checkboxGroup('functionalStrengths', TF1.functionalStrengths)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Participation strengths <span class="muted">(check any)</span></label>
          ${checkboxGroup('participationStrengths', TF1.participationStrengths)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Academic barriers you've noticed <span class="muted">(check any)</span></label>
          ${checkboxGroup('academicBarriers', TF1.academicBarriers)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Greatest strength <span class="muted">(optional)</span></label>
          <textarea id="tf-greatestStrength" rows="2" placeholder="In a sentence or two…"></textarea>
        </div>

        <div class="tform-field">
          <label class="tform-label">Primary concern <span class="muted">(optional)</span></label>
          <textarea id="tf-primaryConcern" rows="2" placeholder="In a sentence or two…"></textarea>
        </div>

        <div class="tform-field">
          <label class="tform-label">Anything else <span class="muted">(optional)</span></label>
          <textarea id="tf-additionalNotes" rows="2" placeholder="Optional"></textarea>
        </div>

        <div id="tformError" class="error-msg" style="display:none;"></div>

        <button class="btn-primary tform-submit" id="tformSubmit">Submit Feedback</button>
        <div class="tform-saved-hint muted" id="tformSavedHint"></div>
      </div>
    `;

    document.getElementById('tformBack').addEventListener('click', () => renderPicker(host));

    function settingValue(label) {
      const m = SETTINGS.find(s => s.label === label);
      return m ? m.value : label;
    }

    function collectPayload() {
      const radioVal = (field) => {
        const el = host.querySelector(`input[name="${field}"]:checked`);
        return el ? el.value : '';
      };
      const checkVals = (field) => Array.from(
        host.querySelectorAll(`.tform-checkgroup[data-field="${field}"] input:checked`)
      ).map(el => el.value);

      return {
        version: 'TF1',
        teacherName: document.getElementById('tf-teacherName').value.trim(),
        courseName: CHOSEN_COURSE.name,
        settingType: settingValue(radioVal('settingType')),
        overallPerformance: radioVal('overallPerformance'),
        workCompletion: radioVal('workCompletion'),
        participationLevel: radioVal('participationLevel'),
        engagementLevel: radioVal('engagementLevel'),
        independenceLevel: radioVal('independenceLevel'),
        peerInteractions: radioVal('peerInteractions'),
        effectiveStrategies: checkVals('effectiveStrategies'),
        functionalStrengths: checkVals('functionalStrengths'),
        participationStrengths: checkVals('participationStrengths'),
        academicBarriers: checkVals('academicBarriers'),
        greatestStrength: document.getElementById('tf-greatestStrength').value.trim(),
        primaryConcern: document.getElementById('tf-primaryConcern').value.trim(),
        additionalNotes: document.getElementById('tf-additionalNotes').value.trim()
      };
    }

    let saveTimer = null;
    function scheduleDraftSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const payload = collectPayload();
        if (!payload.teacherName) return;
        await window.aceSupabase.rpc('save_teacher_feedback_draft', {
          p_token: TOKEN,
          p_course_name: CHOSEN_COURSE.name,
          p_teacher_name: payload.teacherName,
          p_draft: payload
        });
        const hint = document.getElementById('tformSavedHint');
        if (hint) { hint.textContent = 'Progress saved'; setTimeout(() => { if (hint) hint.textContent = ''; }, 2000); }
      }, 1200);
    }
    host.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', scheduleDraftSave);
      el.addEventListener('change', scheduleDraftSave);
    });

    document.getElementById('tformSubmit').addEventListener('click', async () => {
      const errEl = document.getElementById('tformError');
      errEl.style.display = 'none';
      const payload = collectPayload();
      if (!payload.teacherName) { errEl.textContent = 'Please enter your name.'; errEl.style.display = 'block'; return; }
      if (!payload.settingType) { errEl.textContent = 'Please choose the class setting.'; errEl.style.display = 'block'; return; }

      const { data, error } = await window.aceSupabase.rpc('submit_teacher_feedback', {
        p_token: TOKEN,
        p_course_name: CHOSEN_COURSE.name,
        p_teacher_name: payload.teacherName,
        p_payload: payload
      });
      if (error || data !== true) {
        errEl.textContent = 'This link may no longer be active. Please ask your case manager for the current link.';
        errEl.style.display = 'block';
        return;
      }
      renderThankYou(host);
    });
  }

  function renderThankYou(host) {
    host.innerHTML = `
      <div class="public-form-card public-form-thankyou">
        <div class="thankyou-icon">${window.aceIcons.check(36)}</div>
        <h1 class="public-form-title">Thank you</h1>
        <p class="public-form-lead">Your feedback for ${esc(LINK.student_first)} in ${esc(CHOSEN_COURSE.name)} has been submitted. You can close this page.</p>
        <button class="btn-secondary" id="tformAnother">Submit feedback for another class</button>
      </div>
    `;
    document.getElementById('tformAnother').addEventListener('click', () => renderPicker(host));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
