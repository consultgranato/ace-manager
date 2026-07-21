// =============================================================
// Ace Manager — Goals & Progress card (student profile)
// =============================================================
// Lists annual + transition goals, logs progress data points against the
// structured criterion, and draws a per-goal trend chart (SVG, no library)
// with the criterion target line.
//
// Suggestions close the loop from present levels → goals: chips are derived
// from the SAME live signals the PLAAFP engine reads (TF1 engagement/
// participation/independence concepts, below-expectations performance by
// course domain, TA1 postsecondary goal + challenges, BIP flag). A chip only
// PREFILLS the builder — nothing is ever auto-created (the barrier-flags /
// strengths-chips pattern).

const aceGoals = {

  _cache: {},   // studentId -> { goals, entriesByGoal }

  async render(host, student) {
    if (!host) return;
    this._student = student;
    this._host = host;
    await this._load(student.id);
    this._paint();
  },

  async _load(studentId) {
    const { data: goals, error } = await window.aceSupabase
      .from('iep_goals')
      .select('*')
      .eq('student_id', studentId)
      .order('goal_type', { ascending: true })
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) { console.error('Goals load failed:', error); this._cache[studentId] = { goals: [], entriesByGoal: {} }; return; }

    const entriesByGoal = {};
    if (goals && goals.length) {
      const { data: entries } = await window.aceSupabase
        .from('goal_progress_entries')
        .select('*')
        .in('goal_id', goals.map(g => g.id))
        .order('entry_date', { ascending: true });
      (entries || []).forEach(e => {
        (entriesByGoal[e.goal_id] = entriesByGoal[e.goal_id] || []).push(e);
      });
    }
    this._cache[studentId] = { goals: goals || [], entriesByGoal };
  },

  _paint() {
    const host = this._host, student = this._student;
    const { goals, entriesByGoal } = this._cache[student.id];
    const esc = window.aceUtils.escapeHtml;

    const annual = goals.filter(g => g.goal_type === 'annual');
    const transition = goals.filter(g => g.goal_type === 'transition');

    const section = (label, list) => !list.length ? '' : `
      <div class="goals-group-label muted">${label}</div>
      ${list.map(g => this._goalRowHTML(g, entriesByGoal[g.id] || [])).join('')}`;

    host.innerHTML = `
      ${goals.length === 0 ? '<p class="muted" style="font-size:13px;margin:0 0 10px;">No goals yet. Add one, or start from a suggestion below.</p>' : ''}
      ${section('Annual goals', annual)}
      ${section('Postsecondary goals', transition)}
      <div id="goalSuggestions"></div>
      <button class="card-action" id="goalAddBtn">${window.aceIcons.plus(14)} New Goal</button>
    `;

    host.querySelector('#goalAddBtn').addEventListener('click', async () => {
      const r = await window.aceGoalBuilder.open(student);
      if (r && r.confirmed) await this.render(host, student);
    });

    host.querySelectorAll('[data-goal-action]').forEach(btn => {
      btn.addEventListener('click', () => this._onAction(btn.dataset.goalAction, btn.dataset.goalId));
    });
    host.querySelectorAll('.goal-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const { error } = await window.aceSupabase.from('iep_goals')
          .update({ status: sel.value, updated_at: new Date().toISOString() })
          .eq('id', sel.dataset.goalId);
        if (error) { window.aceToast?.error('Could not update status'); return; }
        const g = this._cache[student.id].goals.find(x => x.id === sel.dataset.goalId);
        if (g) g.status = sel.value;
        this._paint();
      });
    });

    this._renderSuggestions();
  },

  _goalRowHTML(g, entries) {
    const esc = window.aceUtils.escapeHtml;
    const c = g.criterion || {};
    const valued = entries.filter(e => e.value != null);
    const latest = valued.length ? valued[valued.length - 1] : null;
    const met = latest && c.target != null && Number(latest.value) >= Number(c.target);

    let progressLine = '';
    if (g.goal_type !== 'transition') {
      if (latest) {
        progressLine = `Latest: <strong>${esc(String(latest.value))}${c.unit ? ' ' + esc(c.unit) : ''}</strong>
          · target ${esc(String(c.target ?? '—'))}${c.unit ? ' ' + esc(c.unit) : ''}
          ${met ? '<span class="goal-met-chip">at target</span>' : ''}
          · ${valued.length} data point${valued.length === 1 ? '' : 's'}`;
      } else {
        progressLine = `No data yet · target ${esc(String(c.target ?? '—'))}${c.unit ? ' ' + esc(c.unit) : ''}`;
      }
    }

    return `
      <div class="goal-row ${g.status !== 'active' ? 'goal-row-' + g.status : ''}">
        <div class="goal-row-top">
          <span class="goal-domain-chip">${esc(g.domain)}</span>
          <select class="goal-status-select" data-goal-id="${g.id}">
            <option value="active" ${g.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="met" ${g.status === 'met' ? 'selected' : ''}>Met</option>
            <option value="discontinued" ${g.status === 'discontinued' ? 'selected' : ''}>Discontinued</option>
          </select>
        </div>
        <div class="goal-text">${esc(g.goal_text)}</div>
        ${g.baseline ? `<div class="goal-baseline muted">Baseline: ${esc(g.baseline)}</div>` : ''}
        ${progressLine ? `<div class="goal-progress-line muted">${progressLine}</div>` : ''}
        ${valued.length >= 2 ? this._chartSVG(valued, c) : ''}
        <div class="goal-row-actions">
          ${g.goal_type !== 'transition' ? `<button class="goal-mini-btn" data-goal-action="log" data-goal-id="${g.id}">${window.aceIcons.plus(12)} Log data</button>` : ''}
          ${valued.length ? `<button class="goal-mini-btn" data-goal-action="history" data-goal-id="${g.id}">History</button>` : ''}
          <button class="goal-mini-btn" data-goal-action="edit" data-goal-id="${g.id}">Edit</button>
          <button class="goal-mini-btn goal-mini-danger" data-goal-action="delete" data-goal-id="${g.id}">Delete</button>
        </div>
      </div>`;
  },

  // Inline SVG trend chart: data points, connecting line, dashed target line.
  _chartSVG(valued, c) {
    const W = 240, H = 56, PAD = 6;
    const vals = valued.map(e => Number(e.value));
    const target = c.target != null ? Number(c.target) : null;
    let lo = Math.min(...vals, target ?? Infinity);
    let hi = Math.max(...vals, target ?? -Infinity);
    if (lo === hi) { lo -= 1; hi += 1; }
    const x = i => PAD + (W - 2 * PAD) * (valued.length === 1 ? 0.5 : i / (valued.length - 1));
    const y = v => H - PAD - (H - 2 * PAD) * ((v - lo) / (hi - lo));
    const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const dots = vals.map((v, i) =>
      `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.5" />`).join('');
    const targetLine = target != null
      ? `<line x1="${PAD}" y1="${y(target).toFixed(1)}" x2="${W - PAD}" y2="${y(target).toFixed(1)}" class="goal-chart-target" />`
      : '';
    return `<svg class="goal-chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Progress trend">
      ${targetLine}<polyline points="${pts}" class="goal-chart-line" />${dots}</svg>`;
  },

  async _onAction(action, goalId) {
    const student = this._student;
    const g = this._cache[student.id].goals.find(x => x.id === goalId);
    if (!g) return;

    if (action === 'edit') {
      const r = await window.aceGoalBuilder.open(student, g);
      if (r && r.confirmed) await this.render(this._host, student);

    } else if (action === 'delete') {
      const ok = await window.aceModal.openModal({
        title: 'Delete this goal?',
        message: 'The goal and all of its logged data points will be removed. This cannot be undone.',
        confirmLabel: 'Delete goal', variant: 'danger',
        onConfirm: async () => {
          const { error } = await window.aceSupabase.from('iep_goals').delete().eq('id', goalId);
          if (error) throw error;
        }
      });
      if (ok) { window.aceToast?.success('Goal deleted'); await this.render(this._host, student); }

    } else if (action === 'log') {
      const c = g.criterion || {};
      const esc = window.aceUtils.escapeHtml;
      const r = await window.aceModal.openDrawer({
        title: 'Log a data point',
        saveLabel: 'Log data',
        bodyHTML: `
          <p class="muted" style="font-size:13px;margin:0 0 12px;">${esc(g.goal_text)}</p>
          <label class="iep-label">Date</label>
          <input type="date" id="gpDate" value="${window.aceUtils.todayISO()}" />
          <label class="iep-label">Value ${c.metric_label ? `<span class="goalb-hint">${esc(c.metric_label)} · target ${esc(String(c.target ?? ''))}</span>` : ''}</label>
          <input type="number" id="gpValue" step="any" placeholder="${esc(String(c.target ?? ''))}" />
          <label class="iep-label">Note <span class="goalb-hint">optional</span></label>
          <input type="text" id="gpNote" placeholder="3 of 5 correct on CBM probe" />
          <div id="gpError" class="hard-delete-error"></div>`,
        onSave: async (body) => {
          const date = body.querySelector('#gpDate').value;
          const value = body.querySelector('#gpValue').value;
          const errEl = body.querySelector('#gpError');
          if (!date || value === '') { errEl.textContent = 'Date and value are required.'; return false; }
          const { error } = await window.aceSupabase.from('goal_progress_entries')
            .insert({ goal_id: goalId, entry_date: date, value: Number(value), note: body.querySelector('#gpNote').value.trim() });
          if (error) { errEl.textContent = error.message; return false; }
          return true;
        }
      });
      if (r && r.confirmed) { window.aceToast?.success('Data point logged'); await this.render(this._host, student); }

    } else if (action === 'history') {
      const entries = this._cache[student.id].entriesByGoal[goalId] || [];
      const esc = window.aceUtils.escapeHtml;
      const c = g.criterion || {};
      await window.aceModal.openDrawer({
        title: 'Data history',
        saveLabel: 'Done', cancelLabel: 'Close',
        bodyHTML: `
          <p class="muted" style="font-size:13px;margin:0 0 12px;">${esc(g.goal_text)}</p>
          ${entries.slice().reverse().map(e => `
            <div class="goal-history-row" data-entry-id="${e.id}">
              <span class="goal-history-date">${window.aceUtils.formatShortDate(e.entry_date)}</span>
              <span class="goal-history-value">${e.value != null ? esc(String(e.value)) + (c.unit ? ' ' + esc(c.unit) : '') : '—'}</span>
              <span class="goal-history-note muted">${esc(e.note || '')}</span>
              <button class="goal-mini-btn goal-mini-danger goal-history-del" data-entry-id="${e.id}">×</button>
            </div>`).join('') || '<p class="muted">No entries.</p>'}`,
        afterRender: (body) => {
          body.querySelectorAll('.goal-history-del').forEach(btn => {
            btn.addEventListener('click', async () => {
              const { error } = await window.aceSupabase.from('goal_progress_entries').delete().eq('id', btn.dataset.entryId);
              if (!error) body.querySelector(`.goal-history-row[data-entry-id="${btn.dataset.entryId}"]`)?.remove();
            });
          });
        }
      });
      await this.render(this._host, student);
    }
  },

  // ---- suggestions: derived from live data, prefill-only ----------------
  async _renderSuggestions() {
    const host = this._host.querySelector('#goalSuggestions');
    if (!host) return;
    const student = this._student;
    const existing = this._cache[student.id].goals;
    const chips = [];
    const have = (domain) => existing.some(g => g.domain === domain && g.status === 'active');

    try {
      const [{ data: tfs }, { data: tas }] = await Promise.all([
        window.aceSupabase.from('teacher_feedback').select('payload, course_name')
          .eq('student_id', student.id).eq('status', 'completed'),
        window.aceSupabase.from('transition_assessments').select('payload')
          .eq('student_id', student.id).eq('status', 'completed')
          .order('completed_at', { ascending: false }).limit(1)
      ]);

      const LOW_ENG  = ['Rarely engaged — frequently off-task', 'Sometimes engaged — inconsistent attention'];
      const LOW_IND  = ['Requires near-constant adult support', 'Requires frequent check-ins and prompting'];
      const NEG_PEER = ['Significant difficulty with peer interactions', 'Some difficulty — inconsistent peer interactions'];
      const LOW_PERF = ['Significantly below expectations', 'Below expectations'];
      const DOMAIN_LABEL = { literacy: 'Reading', math: 'Math' };

      (tfs || []).forEach(tf => {
        const p = tf.payload || {};
        if (LOW_ENG.includes(p.engagementLevel) && !have('Executive Functioning')) {
          chips.push({ label: 'Attention / self-monitoring', domain: 'Executive Functioning',
            behavior: 'use a self-monitoring checklist to remain on task',
            need: `Teacher feedback (${tf.course_name}): ${p.engagementLevel}` });
        }
        if (LOW_IND.includes(p.independenceLevel) && !have('Executive Functioning')) {
          chips.push({ label: 'Independent task initiation', domain: 'Executive Functioning',
            behavior: 'begin assigned tasks within 2 minutes with no more than one prompt',
            need: `Teacher feedback (${tf.course_name}): ${p.independenceLevel}` });
        }
        if (NEG_PEER.includes(p.peerInteractions) && !have('Social/Emotional')) {
          chips.push({ label: 'Peer interactions', domain: 'Social/Emotional',
            behavior: 'initiate and maintain an appropriate peer interaction during structured activities',
            need: `Teacher feedback (${tf.course_name}): ${p.peerInteractions}` });
        }
        if (LOW_PERF.includes(p.overallPerformance) && window.COURSE_DOMAIN_MAP) {
          const dom = window.COURSE_DOMAIN_MAP.getDomain({ name: tf.course_name });
          const label = DOMAIN_LABEL[dom];
          if (label && !have(label)) {
            chips.push({ label: `${label} skills`, domain: label,
              behavior: '', need: `Teacher feedback (${tf.course_name}): ${p.overallPerformance}` });
          }
        }
      });

      const ta = tas && tas[0] && tas[0].payload;
      if (ta) {
        const hasTransition = existing.some(g => g.goal_type === 'transition' && g.status === 'active');
        if (ta.postSecondaryGoal && !hasTransition) {
          chips.push({ label: `Postsecondary: ${ta.postSecondaryGoal}`, goal_type: 'transition',
            transition_area: 'education_training', behavior: '',
            need: `TA1 post-secondary goal: ${ta.postSecondaryGoal}` });
        }
        if (ta.independentLiving && !have('Independent Living')) {
          chips.push({ label: 'Independent living', domain: 'Independent Living',
            behavior: '', need: `TA1 independent living: ${ta.independentLiving}` });
        }
      }

      if (student.has_bip && !have('Behavior')) {
        chips.push({ label: 'Behavior (BIP in place)', domain: 'Behavior',
          behavior: '', need: 'Student has an active Behavior Intervention Plan' });
      }
    } catch (e) { console.error('Goal suggestions failed:', e); }

    if (!chips.length) { host.innerHTML = ''; return; }
    const esc = window.aceUtils.escapeHtml;
    const seen = new Set();
    const unique = chips.filter(c => !seen.has(c.label) && seen.add(c.label)).slice(0, 5);

    host.innerHTML = `
      <div class="goals-suggest-label muted">Suggested from data — click to start a goal</div>
      <div class="goals-suggest-chips">
        ${unique.map((c, i) => `<button class="goal-suggest-chip" data-idx="${i}" title="${esc(c.need)}">${esc(c.label)}</button>`).join('')}
      </div>`;

    host.querySelectorAll('.goal-suggest-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const c = unique[Number(btn.dataset.idx)];
        const r = await window.aceGoalBuilder.open(this._student, null, {
          goal_type: c.goal_type || 'annual', domain: c.domain,
          transition_area: c.transition_area, behavior: c.behavior, source_need: c.need
        });
        if (r && r.confirmed) await this.render(this._host, this._student);
      });
    });
  }
};

window.aceGoals = aceGoals;
