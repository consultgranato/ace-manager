// =============================================================
// Ace Manager — Progress Probe Form (public, student-facing)
// =============================================================
// Loads a generated probe by token (answer keys never reach the browser —
// get_probe_by_token strips them) and submits responses to submit_probe,
// which scores server-side and logs the data point. Single-use link.

(function () {
  const esc = (s) => window.aceUtils.escapeHtml(s);
  let TOKEN = null, PROBE = null;

  async function init() {
    const host = document.getElementById('probeFormHost');
    TOKEN = new URLSearchParams(window.location.search).get('t');
    if (!TOKEN) { msg(host, 'This link is missing its code. Please use the exact link your case manager sent.'); return; }
    const { data, error } = await window.aceSupabase.rpc('get_probe_by_token', { p_token: TOKEN });
    if (error) { msg(host, 'Something went wrong loading this check-in. Please try again later.'); return; }
    if (!data || data.length === 0) { msg(host, 'This link is no longer active — you may have already submitted it. Ask your case manager for a new one if needed.'); return; }
    PROBE = data[0];
    render(host);
  }

  function msg(host, m) { host.innerHTML = `<div class="public-form-card public-form-msg">${esc(m)}</div>`; }

  function itemHTML(item, idx) {
    const n = idx + 1;
    if (item.type === 'mc' || item.type === 'sj') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="${esc(item.type)}">
          <div class="probe-item-prompt"><span class="probe-item-num">${n}.</span> ${esc(item.prompt)}</div>
          <div class="tform-radiogroup">
            ${item.choices.map((c, i) => `
              <label class="tform-radio"><input type="radio" name="probe-${esc(item.id)}" value="${i}" /><span>${esc(c)}</span></label>`).join('')}
          </div>
        </div>`;
    }
    if (item.type === 'numeric') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="numeric">
          <div class="probe-item-prompt"><span class="probe-item-num">${n}.</span> ${esc(item.prompt)}</div>
          <input type="number" step="any" class="probe-num-input" inputmode="decimal" placeholder="Your answer" />
        </div>`;
    }
    if (item.type === 'scale') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="scale">
          <div class="probe-item-prompt"><span class="probe-item-num">${n}.</span> ${esc(item.prompt)}</div>
          <div class="ta-scale">
            <div class="ta-scale-row">
              ${[1,2,3,4,5].map(v => `<button type="button" class="ta-scale-dot" data-val="${v}">${v}</button>`).join('')}
            </div>
            <div class="ta-scale-labels"><span>${esc(item.scale_low || 'Never')}</span><span>${esc(item.scale_high || 'Always')}</span></div>
          </div>
        </div>`;
    }
    return '';
  }

  function render(host) {
    const name = PROBE.student_first || 'there';
    const isSelfReport = PROBE.kind === 'self_report';
    const items = PROBE.items || [];

    host.innerHTML = `
      <div class="public-form-card">
        <h1 class="public-form-title">Quick Check-In</h1>
        <p class="public-form-lead">Hi ${esc(name)}! This is a short check-in from your case manager — ${items.length} questions, a few minutes. ${isSelfReport
          ? 'There are no right or wrong answers; answer honestly about how things have actually been going.'
          : 'Do your best on your own — this shows your case manager what to work on with you, so no pressure and no grade.'}</p>
        ${items.map(itemHTML).join('')}
        <div id="probeFormError" class="error-msg" style="display:none;"></div>
        <button class="btn-primary tform-submit" id="probeSubmit">Submit</button>
      </div>
    `;

    host.querySelectorAll('.ta-scale').forEach(sc => {
      sc.querySelectorAll('.ta-scale-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          sc.querySelectorAll('.ta-scale-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          sc.dataset.value = dot.dataset.val;
        });
      });
    });

    document.getElementById('probeSubmit').addEventListener('click', async () => {
      const errEl = document.getElementById('probeFormError');
      errEl.style.display = 'none';

      const responses = {};
      let unanswered = 0;
      host.querySelectorAll('.probe-item').forEach(el => {
        const id = el.dataset.item;
        const type = el.dataset.type;
        if (type === 'mc' || type === 'sj') {
          const sel = el.querySelector('input:checked');
          if (sel) responses[id] = Number(sel.value); else unanswered++;
        } else if (type === 'numeric') {
          const v = el.querySelector('.probe-num-input').value.trim();
          if (v !== '' && !isNaN(Number(v))) responses[id] = Number(v); else unanswered++;
        } else if (type === 'scale') {
          const sc = el.querySelector('.ta-scale');
          if (sc.dataset.value) responses[id] = Number(sc.dataset.value); else unanswered++;
        }
      });

      if (unanswered > 0) {
        errEl.textContent = `Please answer every question — ${unanswered} left to go.`;
        errEl.style.display = 'block';
        return;
      }

      const btn = document.getElementById('probeSubmit');
      btn.disabled = true;
      const { data, error } = await window.aceSupabase.rpc('submit_probe', { p_token: TOKEN, p_responses: responses });
      if (error || data === null) {
        btn.disabled = false;
        errEl.textContent = 'This link may no longer be active. Please ask your case manager for a new one.';
        errEl.style.display = 'block';
        return;
      }
      host.innerHTML = `
        <div class="public-form-card public-form-thankyou">
          <div class="thankyou-icon">${window.aceIcons.check(36)}</div>
          <h1 class="public-form-title">Nice work, ${esc(name)}!</h1>
          <p class="public-form-lead">Your check-in went straight to your case manager. You can close this page.</p>
        </div>`;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
