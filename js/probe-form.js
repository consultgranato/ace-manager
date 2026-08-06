// =============================================================
// Ace Manager — Progress Probe Form (public, student-facing)
// =============================================================
// Loads a generated probe by token and submits responses to submit_probe, which
// scores server-side and logs the data point. Answer keys never reach this page:
// get_probe_by_token strips them.
//
// Three things this form has to get right for the data to mean anything:
//
//   · TIMED PROBES really run a clock. A one-minute math CBM measured without a
//     clock is not a CBM, and the rate it reports would be fiction. The timer
//     starts on the first interaction rather than on load, so a slow connection
//     does not eat the student's minute, and elapsed time is sent with the
//     submission so the server computes the true rate.
//   · PARTIAL WORK COUNTS on a timed probe. Requiring every item would punish a
//     student for the thing the probe is measuring, so timed probes submit
//     whatever is done when time is up.
//   · THE PAGE STAYS CALM. This is a check-in, not a test — the student sees
//     progress, not a score, and never a right/wrong marker.

(function () {
  const esc = (s) => window.aceUtils.escapeHtml(s);
  let TOKEN = null, PROBE = null, TIMER = null, STARTED = null, DEADLINE = null, REMAINING = null, SUBMITTED = false;

  // "1 minute" / "2 minutes" / "45 seconds" — a probe configured below a minute
  // should not be described as "0.8 minutes".
  function durationWords(secs) {
    if (secs < 60) return secs + ' seconds';
    const m = secs / 60;
    return (Number.isInteger(m) ? m : Math.round(m * 10) / 10) + (m === 1 ? ' minute' : ' minutes');
  }

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
    const head = `<div class="probe-item-prompt"><span class="probe-item-num">${n}.</span> ${esc(item.prompt).replace(/\n/g, '<br>')}</div>`;

    if (item.type === 'mc' || item.type === 'sj') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="${esc(item.type)}">
          ${head}
          <div class="tform-radiogroup">
            ${item.choices.map((c, i) => `
              <label class="tform-radio"><input type="radio" name="probe-${esc(item.id)}" value="${i}" /><span>${esc(c)}</span></label>`).join('')}
          </div>
        </div>`;
    }
    if (item.type === 'numeric') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="numeric">
          ${head}
          <input type="number" step="any" class="probe-num-input" inputmode="decimal" placeholder="Your answer" />
        </div>`;
    }
    if (item.type === 'text') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="text">
          ${head}
          <input type="text" class="probe-text-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" />
        </div>`;
    }
    if (item.type === 'scale') {
      return `
        <div class="probe-item" data-item="${esc(item.id)}" data-type="scale">
          ${head}
          <div class="ta-scale">
            <div class="ta-scale-row">
              ${[1, 2, 3, 4, 5].map(v => `<button type="button" class="ta-scale-dot" data-val="${v}">${v}</button>`).join('')}
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
    const timed = PROBE.timed || null;

    const lead = isSelfReport
      ? 'There are no right or wrong answers — answer honestly about how things have actually been going.'
      : timed
        ? `This one is timed: you get ${durationWords(timed.seconds)} once you start. Answer as many as you can — finishing every question is not the point.`
        : 'Do your best on your own. This shows your case manager what to work on with you — no grade, no pressure.';

    host.innerHTML = `
      <div class="public-form-card">
        <h1 class="public-form-title">Quick Check-In</h1>
        <p class="public-form-lead">Hi ${esc(name)}! ${items.length} question${items.length === 1 ? '' : 's'}, a few minutes. ${esc(lead)}</p>

        ${timed ? `
          <div class="probe-timer" id="probeTimer">
            <div class="probe-timer-face"><span id="probeClock">${fmtClock(timed.seconds)}</span></div>
            <button class="btn-primary" id="probeStart">Start the timer</button>
            <p class="probe-timer-hint">The clock does not start until you press the button.</p>
          </div>` : ''}

        <div class="probe-progress" id="probeProgress" ${timed ? 'hidden' : ''}>
          <div class="probe-progress-bar"><div class="probe-progress-fill" id="probeFill"></div></div>
          <span class="probe-progress-text" id="probeCount">0 of ${items.length} answered</span>
        </div>

        <div class="probe-items" id="probeItems" ${timed ? 'hidden' : ''}>
          ${items.map(itemHTML).join('')}
        </div>

        <div id="probeFormError" class="error-msg" style="display:none;"></div>
        <button class="btn-primary tform-submit" id="probeSubmit" ${timed ? 'hidden' : ''}>Submit</button>
      </div>
    `;

    host.querySelectorAll('.ta-scale').forEach(sc => {
      sc.querySelectorAll('.ta-scale-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          sc.querySelectorAll('.ta-scale-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          sc.dataset.value = dot.dataset.val;
          updateProgress(host, items.length);
        });
      });
    });
    host.querySelectorAll('input').forEach(el => {
      el.addEventListener('input', () => updateProgress(host, items.length));
      el.addEventListener('change', () => updateProgress(host, items.length));
    });

    if (timed) {
      document.getElementById('probeStart').addEventListener('click', () => startTimer(host, timed, items.length));
    }
    document.getElementById('probeSubmit').addEventListener('click', () => submit(host, false));
  }

  function fmtClock(s) {
    const m = Math.floor(s / 60), r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }

  function startTimer(host, timed, total) {
    STARTED = Date.now();
    DEADLINE = STARTED + timed.seconds * 1000;
    REMAINING = timed.seconds;
    document.getElementById('probeStart').remove();
    document.querySelector('.probe-timer-hint').textContent = 'Answer as many as you can before the clock runs out.';
    document.getElementById('probeItems').hidden = false;
    document.getElementById('probeProgress').hidden = false;
    document.getElementById('probeSubmit').hidden = false;
    document.getElementById('probeSubmit').textContent = 'I\'m done';
    updateProgress(host, total);

    // Browsers throttle timers in a hidden tab, which would quietly hand a
    // student extra time on a timed probe. The deadline is wall-clock, and the
    // page re-checks it whenever it is hidden or shown, so switching tabs ends
    // the probe rather than pausing it.
    const checkDeadline = () => {
      if (!SUBMITTED && DEADLINE && Date.now() >= DEADLINE) {
        if (TIMER) { clearInterval(TIMER); TIMER = null; }
        submit(host, true);
      }
    };
    document.addEventListener('visibilitychange', checkDeadline);
    window.addEventListener('focus', checkDeadline);
    window.addEventListener('pageshow', checkDeadline);

    TIMER = setInterval(() => {
      REMAINING = Math.max(0, timed.seconds - Math.round((Date.now() - STARTED) / 1000));
      const clock = document.getElementById('probeClock');
      if (clock) clock.textContent = fmtClock(REMAINING);
      const face = document.querySelector('.probe-timer-face');
      if (face) face.classList.toggle('low', REMAINING <= 10);
      if (REMAINING <= 0) {
        clearInterval(TIMER); TIMER = null;
        // Time is up: submit whatever is done. A timed probe measures how much
        // gets done in the time, so an unfinished sheet is the measurement.
        submit(host, true);
      }
    }, 250);
  }

  function collect(host) {
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
      } else if (type === 'text') {
        const v = el.querySelector('.probe-text-input').value.trim();
        if (v !== '') responses[id] = v; else unanswered++;
      } else if (type === 'scale') {
        const sc = el.querySelector('.ta-scale');
        if (sc.dataset.value) responses[id] = Number(sc.dataset.value); else unanswered++;
      }
    });
    return { responses, unanswered };
  }

  function updateProgress(host, total) {
    const { unanswered } = collect(host);
    const done = total - unanswered;
    const fill = document.getElementById('probeFill');
    const count = document.getElementById('probeCount');
    if (fill) fill.style.width = (total ? (done / total * 100) : 0) + '%';
    if (count) count.textContent = `${done} of ${total} answered`;
  }

  async function submit(host, auto) {
    if (SUBMITTED) return;
    const errEl = document.getElementById('probeFormError');
    errEl.style.display = 'none';
    const { responses, unanswered } = collect(host);

    // Untimed probes still require completion — a blank answer there is a
    // skipped question, not a measurement of speed.
    if (!PROBE.timed && unanswered > 0 && !auto) {
      errEl.textContent = `Please answer every question — ${unanswered} left to go.`;
      errEl.style.display = 'block';
      return;
    }
    if (PROBE.timed && !auto && unanswered === (PROBE.items || []).length) {
      errEl.textContent = 'Answer at least one question before finishing.';
      errEl.style.display = 'block';
      return;
    }

    SUBMITTED = true;
    if (TIMER) { clearInterval(TIMER); TIMER = null; }
    const btn = document.getElementById('probeSubmit');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    const elapsed = STARTED ? Math.max(1, Math.round((Date.now() - STARTED) / 1000)) : null;
    const { data, error } = await window.aceSupabase.rpc('submit_probe', {
      p_token: TOKEN, p_responses: responses, p_elapsed_seconds: elapsed
    });
    if (error || data === null) {
      SUBMITTED = false;
      if (btn) { btn.disabled = false; btn.textContent = 'Submit'; }
      errEl.textContent = 'This link may no longer be active. Please ask your case manager for a new one.';
      errEl.style.display = 'block';
      return;
    }

    const name = PROBE.student_first || 'there';
    host.innerHTML = `
      <div class="public-form-card public-form-thankyou">
        <div class="thankyou-icon">${window.aceIcons.check(36)}</div>
        <h1 class="public-form-title">Nice work, ${esc(name)}!</h1>
        <p class="public-form-lead">${auto ? 'Time is up — everything you finished was sent to your case manager.' : 'Your check-in went straight to your case manager.'} You can close this page.</p>
      </div>`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
