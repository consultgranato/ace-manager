// =============================================================
// Ace Manager — Goal Bank browser
// =============================================================
// Browse 1,500 measurable goals and pick one, which PREFILLS the builder — the
// bank suggests, the case manager decides. Nothing is ever auto-selected and
// nothing is ever auto-saved.
//
// At this size a flat scrolling list stops being usable, so the browser is
// faceted: domain narrows to subskill, grade band and eligibility category
// filter across, and free text searches the skill label, the condition and the
// behavior at once. Entries matching the student's own disability category and
// grade sort first with a badge, because the case manager opening this drawer
// has one specific student in mind.
//
// Each row expands in place to show what actually matters before committing:
// the assembled goal sentence, the three benchmarks with their targets, and how
// the goal would be progress-monitored. Picking a goal you cannot monitor is
// the mistake this view exists to prevent.
//
// open(student, {domain, search}) resolves with the chosen bank entry, the
// string 'custom' (write my own), or null (dismissed).

const aceGoalBankUI = {

  PAGE: 40,

  // 'Specific Learning Disability (SLD)' → 'SLD', matching the codes carried by
  // bank entries.
  _disabilityCode(student) {
    const d = (student && student.primary_disability) || '';
    if (d.includes('SLD') || d.includes('Specific Learning')) return 'SLD';
    if (d.includes('Autism')) return 'ASD';
    if (d.includes('OHI') || d.includes('Other Health')) return 'OHI';
    if (d.includes('Intellectual')) return 'ID';
    if (d.includes('Emotional')) return 'ED';
    if (d.includes('Speech') || d.includes('Language Impair')) return 'SLI';
    if (d.includes('Multiple')) return 'MD';
    if (d.includes('Traumatic') || d.includes('TBI')) return 'TBI';
    if (d.includes('Hearing')) return 'HI';
    return null;
  },

  // The grade band a student most likely sits in, used only to sort — never to
  // filter, because a 10th grader can legitimately work on a 6-8 band skill and
  // hiding those would defeat the point of a bank for below-grade-level work.
  _bandFor(student) {
    const g = String((student && student.grade_level) || '').replace(/[^0-9]/g, '');
    const n = g ? Number(g) : null;
    if (n && n <= 8) return '6-8';
    if (n && n <= 12) return '9-12';
    const age = Number((student && student.age) || 0);
    if (age >= 18) return '18-22';
    return '9-12';
  },

  async open(student, opts = {}) {
    const esc = window.aceUtils.escapeHtml;

    // The bank is loaded on demand; show the drawer only once it is in memory,
    // so the case manager never sees an empty list that fills in a moment later.
    try { await window.aceLazyData.banks(); }
    catch (e) {
      console.error('Goal bank load failed:', e);
      window.aceToast?.error('Could not load the goal bank — opening a blank goal instead');
      return 'custom';
    }

    const M = window.aceGoalModel;
    const goals = M.goals();
    if (!goals.length) return 'custom';

    const code = this._disabilityCode(student);
    const myBand = this._bandFor(student);
    const domains = [...new Set(goals.map(g => g.domain))].sort();

    let resolved = null;
    const state = { domain: opts.domain || '', sub: '', band: '', dx: code || '', q: opts.search || '', shown: this.PAGE };

    return new Promise(async (resolve) => {
      await window.aceModal.openDrawer({
        title: 'Goal bank',
        saveLabel: 'Write my own', cancelLabel: 'Cancel',
        bodyHTML: `
          <div class="gbank">
            <p class="gbank-lead muted">
              ${goals.length.toLocaleString()} measurable goals, each with three benchmarks and a monitoring plan.
              Picking one pre-fills the builder — everything stays editable.
            </p>
            <div class="gbank-filters">
              <input type="text" id="gbankSearch" class="iep-text iep-text-sm" placeholder="Search skills, conditions, behaviors…" autocomplete="off" value="${esc(state.q)}" />
              <select id="gbankDomain" class="iep-select iep-select-sm">
                <option value="">All domains</option>
                ${domains.map(d => `<option ${state.domain === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
              <select id="gbankSub" class="iep-select iep-select-sm"></select>
            </div>
            <div class="gbank-filters gbank-filters-2">
              <select id="gbankBand" class="iep-select iep-select-sm">
                <option value="">All grade bands</option>
                ${M.BANDS.map(b => `<option value="${esc(b)}">${esc(M.BAND_LABEL[b])}</option>`).join('')}
              </select>
              <select id="gbankDx" class="iep-select iep-select-sm">
                <option value="">Any eligibility</option>
                ${['SLD','ASD','OHI','ID','ED','SLI','MD','TBI','HI'].map(d =>
                  `<option value="${d}" ${state.dx === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
              <button type="button" class="goal-mini-btn" id="gbankReset">Clear filters</button>
            </div>
            <div class="gbank-count muted" id="gbankCount"></div>
            <div class="gbank-list" id="gbankList"></div>
            <button type="button" class="btn-secondary gbank-more" id="gbankMore" hidden>Show more</button>
          </div>`,
        afterRender: (body) => {
          const $ = sel => body.querySelector(sel);
          const list = $('#gbankList'), count = $('#gbankCount'), more = $('#gbankMore');
          const search = $('#gbankSearch'), domainSel = $('#gbankDomain'), subSel = $('#gbankSub');
          const bandSel = $('#gbankBand'), dxSel = $('#gbankDx');

          const fillSubs = () => {
            const subs = [...new Set(goals.filter(g => !state.domain || g.domain === state.domain).map(g => g.subskill))].sort();
            subSel.innerHTML = '<option value="">All subskills</option>' +
              subs.map(s => `<option value="${esc(s)}" ${state.sub === s ? 'selected' : ''}>${esc(s)}</option>`).join('');
          };

          const matches = () => {
            const q = state.q.trim().toLowerCase();
            let rows = goals.filter(g =>
              (!state.domain || g.domain === state.domain) &&
              (!state.sub || g.subskill === state.sub) &&
              (!state.band || g.grade_band === state.band) &&
              (!state.dx || g.disability_relevance.indexOf(state.dx) >= 0) &&
              (!q || (g.skill + ' ' + g.domain + ' ' + g.subskill + ' ' + g.condition + ' ' + g.behavior).toLowerCase().includes(q)));
            // Fit-first ordering: the student's own eligibility, then their band.
            const score = g => (code && g.disability_relevance.indexOf(code) >= 0 ? 2 : 0) + (g.grade_band === myBand ? 1 : 0);
            return rows.slice().sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
          };

          const rowHTML = (g) => {
            const fits = code && g.disability_relevance.indexOf(code) >= 0;
            const pool = (window.ACE_PROBE_BANK.pools || {})[g.probe_pool];
            const kind = pool ? pool.kind : null;
            const kindChip = kind === 'observation' ? 'you score it'
              : kind === 'self_report' ? 'student check-in'
              : kind === 'academic' ? 'auto-scored' : '';
            return `
              <div class="gbank-row" data-id="${esc(g.id)}">
                <button type="button" class="gbank-row-main" data-expand="${esc(g.id)}">
                  <div class="gbank-row-tags">
                    <span class="goal-domain-chip">${esc(g.domain)}</span>
                    <span class="gbank-subskill">${esc(g.subskill)}</span>
                    <span class="gbank-band muted">${esc(g.grade_band)}</span>
                    ${fits ? `<span class="gbank-fit">fits ${esc(code)}</span>` : ''}
                    ${g.grade_band === myBand ? '<span class="gbank-fit gbank-fit-band">on grade</span>' : ''}
                    ${kindChip ? `<span class="gbank-probe">${esc(kindChip)}</span>` : ''}
                  </div>
                  <div class="gbank-row-skill">${esc(g.skill)}</div>
                  <div class="gbank-row-text">${esc(g.goal_text.replace(/NAME/g, student.first_name))}</div>
                </button>
                <div class="gbank-detail" hidden>
                  <div class="gbank-detail-label">Benchmarks</div>
                  <ol class="gbank-bm">
                    ${g.benchmarks.map(b => `<li><span class="gbank-bm-win">${esc(b.window)}</span> ${esc(b.text.replace(/NAME/g, student.first_name))}</li>`).join('')}
                  </ol>
                  <div class="gbank-detail-label">Progress monitoring</div>
                  <p class="gbank-detail-p">${pool ? esc(pool.label + ' — ' + pool.administration) : 'No automated probe; log data by hand.'}</p>
                  <div class="gbank-detail-meta">
                    <span>${esc(g.il_standard)}</span>
                    <span>Baseline to collect: ${esc(g.baseline_prompt)}</span>
                  </div>
                  ${g.teaching_note ? `<p class="gbank-note">${esc(g.teaching_note)}</p>` : ''}
                  <button type="button" class="btn-primary gbank-use" data-use="${esc(g.id)}">Use this goal</button>
                </div>
              </div>`;
          };

          const paint = () => {
            const rows = matches();
            count.textContent = `${rows.length.toLocaleString()} goal${rows.length === 1 ? '' : 's'}`;
            const shown = rows.slice(0, state.shown);
            list.innerHTML = shown.length ? shown.map(rowHTML).join('')
              : '<p class="muted" style="padding:14px 2px;">No goals match those filters. Clear one, or write your own.</p>';
            more.hidden = rows.length <= state.shown;
            more.textContent = `Show more (${(rows.length - shown.length).toLocaleString()} left)`;

            list.querySelectorAll('[data-expand]').forEach(btn => {
              btn.addEventListener('click', () => {
                const row = btn.closest('.gbank-row');
                const det = row.querySelector('.gbank-detail');
                const open = !det.hidden;
                list.querySelectorAll('.gbank-detail').forEach(d => { d.hidden = true; });
                list.querySelectorAll('.gbank-row').forEach(r => r.classList.remove('expanded'));
                if (!open) { det.hidden = false; row.classList.add('expanded'); }
              });
            });
            list.querySelectorAll('[data-use]').forEach(btn => {
              btn.addEventListener('click', () => {
                resolved = goals.find(x => x.id === btn.dataset.use) || null;
                btn.closest('.ace-drawer-wrap').querySelector('[data-action="cancel"]').click();
              });
            });
          };

          const onFilter = () => { state.shown = this.PAGE; fillSubs(); paint(); };

          search.addEventListener('input', () => { state.q = search.value; state.shown = this.PAGE; paint(); });
          domainSel.addEventListener('change', () => { state.domain = domainSel.value; state.sub = ''; onFilter(); });
          subSel.addEventListener('change', () => { state.sub = subSel.value; state.shown = this.PAGE; paint(); });
          bandSel.addEventListener('change', () => { state.band = bandSel.value; state.shown = this.PAGE; paint(); });
          dxSel.addEventListener('change', () => { state.dx = dxSel.value; state.shown = this.PAGE; paint(); });
          more.addEventListener('click', () => { state.shown += this.PAGE; paint(); });
          body.querySelector('#gbankReset').addEventListener('click', () => {
            state.domain = ''; state.sub = ''; state.band = ''; state.dx = ''; state.q = '';
            search.value = ''; domainSel.value = ''; bandSel.value = ''; dxSel.value = '';
            onFilter();
          });

          fillSubs();
          paint();
          search.focus();
        },
        onSave: async () => { resolved = 'custom'; return true; }
      });

      resolve(resolved);
    });
  }
};

window.aceGoalBankUI = aceGoalBankUI;
