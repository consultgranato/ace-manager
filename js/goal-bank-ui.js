// =============================================================
// Ace Manager — Goal Bank browser (Phase 5.3a)
// =============================================================
// Browse/search/filter the offline goal bank (data/goal-bank.js) and pick an
// entry, which PREFILLS the goal builder — the bank suggests, the case
// manager decides. Filters: text search, domain, grade band; entries tagged
// for the student's disability sort first with a "fits profile" badge, but
// nothing is auto-selected. "Write my own" exits to the empty builder.
//
// open(student, {domain, search}) resolves with the chosen bank entry,
// the string 'custom' (write my own), or null (dismissed).

const aceGoalBankUI = {

  // 'Specific Learning Disability (SLD)' → 'SLD' etc., matching the
  // disability_relevance codes carried by bank entries.
  _disabilityCode(student) {
    const d = (student && student.primary_disability) || '';
    if (d.includes('SLD') || d.includes('Specific Learning')) return 'SLD';
    if (d.includes('Autism')) return 'ASD';
    if (d.includes('OHI') || d.includes('Other Health')) return 'OHI';
    if (d.includes('Intellectual')) return 'ID';
    if (d.includes('Emotional')) return 'ED';
    if (d.includes('Speech')) return 'SLI';
    if (d.includes('Multiple')) return 'MD';
    return null;
  },

  _bank() {
    return (window.ACE_GOAL_BANK && Array.isArray(window.ACE_GOAL_BANK.goals))
      ? window.ACE_GOAL_BANK.goals : [];
  },

  // Assemble the display sentence the same way the builder will, so what the
  // case manager previews is what they get.
  _preview(entry, student) {
    const c = entry.criterion || {};
    const metric = (window.aceGoalBuilder.METRICS.find(m => m.id === c.metric) || {}).label || '';
    return window.aceGoalBuilder.assemble({
      goal_type: 'annual',
      condition: entry.condition,
      behavior: entry.behavior,
      criterion: { ...c, metric_label: metric },
      measurement_method: entry.measurement_method
    }, student);
  },

  open(student, opts = {}) {
    const esc = window.aceUtils.escapeHtml;
    const goals = this._bank();
    const code = this._disabilityCode(student);
    const domains = [...new Set(goals.map(g => g.domain))];
    const bands = [...new Set(goals.map(g => g.grade_band))].sort();

    let resolved = null;   // entry object or 'custom'

    return new Promise(async (resolve) => {
      if (!goals.length) { resolve('custom'); return; }

      await window.aceModal.openDrawer({
        title: 'Goal bank',
        saveLabel: 'Write my own', cancelLabel: 'Cancel',
        bodyHTML: `
          <div class="gbank">
            <p class="muted" style="font-size:13px;margin:0 0 10px;">
              ${goals.length} measurable goals. Picking one pre-fills the builder — everything stays editable.
              ${code ? `Goals tagged for ${esc(code)} are listed first.` : ''}
            </p>
            <div class="gbank-filters">
              <input type="text" id="gbankSearch" class="iep-text iep-text-sm" placeholder="Search goals…" autocomplete="off" value="${esc(opts.search || '')}" />
              <select id="gbankDomain" class="iep-select iep-select-sm">
                <option value="">All domains</option>
                ${domains.map(d => `<option ${opts.domain === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
              <select id="gbankBand" class="iep-select iep-select-sm">
                <option value="">All grades</option>
                ${bands.map(b => `<option>${esc(b)}</option>`).join('')}
              </select>
            </div>
            <div class="gbank-count muted" id="gbankCount"></div>
            <div class="gbank-list" id="gbankList"></div>
          </div>`,
        afterRender: (body) => {
          const list = body.querySelector('#gbankList');
          const count = body.querySelector('#gbankCount');
          const search = body.querySelector('#gbankSearch');
          const domainSel = body.querySelector('#gbankDomain');
          const bandSel = body.querySelector('#gbankBand');

          const paint = () => {
            const q = search.value.trim().toLowerCase();
            const dom = domainSel.value;
            const band = bandSel.value;
            let rows = goals.filter(g =>
              (!dom || g.domain === dom) &&
              (!band || g.grade_band === band) &&
              (!q || `${g.domain} ${g.subskill} ${g.condition} ${g.behavior}`.toLowerCase().includes(q)));
            // Fits-profile entries first (stable within groups).
            if (code) {
              rows = rows.filter(g => (g.disability_relevance || []).includes(code))
                .concat(rows.filter(g => !(g.disability_relevance || []).includes(code)));
            }
            count.textContent = `${rows.length} goal${rows.length === 1 ? '' : 's'}`;
            const shown = rows.slice(0, 60);
            list.innerHTML = shown.map((g, i) => `
              <button type="button" class="gbank-row" data-id="${esc(g.id)}">
                <div class="gbank-row-tags">
                  <span class="goal-domain-chip">${esc(g.domain)}</span>
                  <span class="gbank-subskill">${esc(g.subskill)}</span>
                  <span class="gbank-band muted">${esc(g.grade_band)}</span>
                  ${code && (g.disability_relevance || []).includes(code) ? '<span class="gbank-fit">fits profile</span>' : ''}
                  ${g.probe_pool ? '<span class="gbank-probe">auto-probes</span>' : ''}
                </div>
                <div class="gbank-row-text">${esc(this._preview(g, student))}</div>
              </button>`).join('')
              + (rows.length > shown.length ? `<div class="muted" style="font-size:12.5px;padding:8px 2px;">Showing 60 of ${rows.length} — narrow the search to see the rest.</div>` : '');

            list.querySelectorAll('.gbank-row').forEach(btn => {
              btn.addEventListener('click', () => {
                resolved = goals.find(g => g.id === btn.dataset.id) || null;
                // Close the drawer through its cancel path; we resolve below.
                btn.closest('.ace-drawer-wrap').querySelector('[data-action="cancel"]').click();
              });
            });
          };

          [search, domainSel, bandSel].forEach(el => {
            el.addEventListener('input', paint);
            el.addEventListener('change', paint);
          });
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
