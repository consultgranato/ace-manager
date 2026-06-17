// =============================================================
// Ace Manager — Parent Feedback Form (public, token-based)
// =============================================================

(function () {
  const SUPPORT_AREAS = [
    'Organization and time management','Homework completion','Reading','Writing','Math',
    'Social skills and friendships','Emotional regulation','Self-advocacy',
    'Independence and daily living skills','Communication','Attention and focus','Behavior'
  ];

  const esc = (s) => window.aceUtils.escapeHtml(s);
  let TOKEN = null, LINK = null;

  function getToken() { return new URLSearchParams(window.location.search).get('t'); }

  async function init() {
    const host = document.getElementById('parentFormHost');
    TOKEN = getToken();
    if (!TOKEN) { renderError(host, 'This link is missing its code. Please use the exact link your case manager sent.'); return; }

    const { data, error } = await window.aceSupabase.rpc('get_parent_link_by_token', { p_token: TOKEN });
    if (error) { renderError(host, 'Something went wrong loading this form. Please try again later.'); return; }
    if (!data || data.length === 0) {
      renderError(host, 'This feedback link is no longer active. Please ask the case manager for the current link.');
      return;
    }
    LINK = data[0];
    renderForm(host, LINK.draft_payload || {});
  }

  function renderError(host, msg) {
    host.innerHTML = `<div class="public-form-card public-form-msg">${esc(msg)}</div>`;
  }

  function checkboxGroup(field, options, draft) {
    const checked = (draft && Array.isArray(draft[field])) ? draft[field] : [];
    return `
      <div class="tform-checkgroup" data-field="${field}">
        ${options.map(o => `
          <label class="tform-check">
            <input type="checkbox" value="${esc(o)}" ${checked.includes(o) ? 'checked' : ''} />
            <span>${esc(o)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function renderForm(host, draft) {
    const name = LINK.student_first || 'your child';
    host.innerHTML = `
      <div class="public-form-card">
        <h1 class="public-form-title">Parent &amp; Guardian Feedback</h1>
        <p class="public-form-lead">Your input helps the team build ${esc(name)}'s IEP. There are no wrong answers — share whatever feels important. Everything is optional.</p>

        <div class="tform-field">
          <label class="tform-label">Your name <span class="muted">(optional)</span></label>
          <input type="text" id="pf-parentName" value="${esc(draft.parentName || '')}" />
        </div>

        <div class="tform-field">
          <label class="tform-label">What are your hopes and goals for ${esc(name)} going forward?</label>
          <textarea id="pf-hopesGoals" rows="3">${esc(draft.hopesGoals || '')}</textarea>
        </div>

        <div class="tform-field">
          <label class="tform-label">What's going well at home?</label>
          <textarea id="pf-whatsGoingWell" rows="3">${esc(draft.whatsGoingWell || '')}</textarea>
        </div>

        <div class="tform-field">
          <label class="tform-label">What are your biggest concerns?</label>
          <textarea id="pf-biggestConcerns" rows="3">${esc(draft.biggestConcerns || '')}</textarea>
        </div>

        <div class="tform-field">
          <label class="tform-label">Where do you feel ${esc(name)} needs the most support? <span class="muted">(check any)</span></label>
          ${checkboxGroup('supportAreas', SUPPORT_AREAS, draft)}
        </div>

        <div class="tform-field">
          <label class="tform-label">Anything else you'd like the team to know? <span class="muted">(optional)</span></label>
          <textarea id="pf-anythingElse" rows="3">${esc(draft.anythingElse || '')}</textarea>
        </div>

        <div id="pfFormError" class="error-msg" style="display:none;"></div>
        <button class="btn-primary tform-submit" id="pfSubmit">Submit Feedback</button>
        <div class="tform-saved-hint muted" id="pfSavedHint"></div>
      </div>
    `;

    function collectPayload() {
      const checkVals = (field) => Array.from(
        host.querySelectorAll(`.tform-checkgroup[data-field="${field}"] input:checked`)
      ).map(el => el.value);
      return {
        version: 'PF1',
        parentName: document.getElementById('pf-parentName').value.trim(),
        hopesGoals: document.getElementById('pf-hopesGoals').value.trim(),
        whatsGoingWell: document.getElementById('pf-whatsGoingWell').value.trim(),
        biggestConcerns: document.getElementById('pf-biggestConcerns').value.trim(),
        supportAreas: checkVals('supportAreas'),
        anythingElse: document.getElementById('pf-anythingElse').value.trim()
      };
    }

    let saveTimer = null;
    function scheduleDraftSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        await window.aceSupabase.rpc('save_parent_feedback_draft', { p_token: TOKEN, p_draft: collectPayload() });
        const hint = document.getElementById('pfSavedHint');
        if (hint) { hint.textContent = 'Progress saved'; setTimeout(() => { if (hint) hint.textContent = ''; }, 2000); }
      }, 1200);
    }
    host.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', scheduleDraftSave);
      el.addEventListener('change', scheduleDraftSave);
    });

    document.getElementById('pfSubmit').addEventListener('click', async () => {
      const errEl = document.getElementById('pfFormError');
      errEl.style.display = 'none';
      const payload = collectPayload();
      const hasAny = payload.hopesGoals || payload.whatsGoingWell || payload.biggestConcerns || payload.supportAreas.length || payload.anythingElse;
      if (!hasAny) { errEl.textContent = 'Please answer at least one question before submitting.'; errEl.style.display = 'block'; return; }

      const { data, error } = await window.aceSupabase.rpc('submit_parent_feedback', { p_token: TOKEN, p_payload: payload });
      if (error || data !== true) {
        errEl.textContent = 'This link may no longer be active. Please ask the case manager for the current link.';
        errEl.style.display = 'block';
        return;
      }
      renderThankYou(host, name);
    });
  }

  function renderThankYou(host, name) {
    host.innerHTML = `
      <div class="public-form-card public-form-thankyou">
        <div class="thankyou-icon">${window.aceIcons.check(36)}</div>
        <h1 class="public-form-title">Thank you</h1>
        <p class="public-form-lead">Your feedback for ${esc(name)} has been submitted and shared with the IEP team. You can close this page.</p>
      </div>
    `;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
