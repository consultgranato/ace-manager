// =============================================================
// Ace Manager — Goals & Progress Monitoring (student profile)
// =============================================================
// Lists annual and postsecondary goals and — the part that matters — turns each
// one into a live progress-monitoring record rather than a paragraph nobody
// revisits until the annual review.
//
// For every active annual goal the card shows:
//
//   · a BENCHMARK RAIL — three rungs, each lit by the most recent probe's
//     per-benchmark score, so "he is stuck on benchmark 2" is visible at a
//     glance instead of being buried inside an overall percentage
//   · a TREND CHART with the criterion target AND an aimline from the baseline
//     to the target over 36 instructional weeks
//   · a DECISION RULE, the standard CBM four-point rule: four consecutive
//     points below the aimline means change the instruction, four above means
//     the goal is too easy. This is the judgement a case manager is supposed to
//     make each cycle and the one most likely to be skipped
//   · a PHASE-AWARE PROBE CYCLE — the item mix shifts across the year, so
//     earlier benchmarks keep being sampled and skill decay shows up
//
// Probes come in three kinds. Academic and self-report probes go to the student
// as a link and score themselves server-side. Observation probes are scored by
// the case manager here, in the app, against the goal's own benchmarks — which
// is what makes fluency, articulation, motor and job-task goals monitorable at
// all.
//
// Suggestions close the loop from present levels to goals: chips derive from
// the SAME live signals the PLAAFP engine reads. A chip only PREFILLS the
// builder — nothing is ever auto-created.

const aceGoals = {

  _cache: {},   // studentId -> { goals, entriesByGoal, probesByGoal }

  get M() { return window.aceGoalModel; },

  _fmt(v, unit) { return this.M ? this.M.fmtValue(v, unit) : (v == null ? '—' : String(v)); },

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
    if (error) {
      console.error('Goals load failed:', error);
      this._cache[studentId] = { goals: [], entriesByGoal: {}, probesByGoal: {} };
      return;
    }

    const entriesByGoal = {}, probesByGoal = {};
    if (goals && goals.length) {
      const ids = goals.map(g => g.id);
      const [{ data: entries }, { data: probes }] = await Promise.all([
        window.aceSupabase.from('goal_progress_entries').select('*')
          .in('goal_id', ids).order('entry_date', { ascending: true }),
        window.aceSupabase.from('probes')
          .select('id, goal_id, token, status, active, kind, score, breakdown, phase, created_at, items')
          .in('goal_id', ids).order('created_at', { ascending: true })
      ]);
      (entries || []).forEach(e => { (entriesByGoal[e.goal_id] = entriesByGoal[e.goal_id] || []).push(e); });
      (probes || []).forEach(p => { (probesByGoal[p.goal_id] = probesByGoal[p.goal_id] || []).push(p); });
    }
    this._cache[studentId] = { goals: goals || [], entriesByGoal, probesByGoal };

    // Any goal with a probe pool needs the pool registry to describe itself.
    // Loaded quietly in the background so the card paints immediately.
    if ((goals || []).some(g => g.probe_pool) && !window.ACE_PROBE_BANK) {
      window.aceLazyData.load('probe-bank').then(() => this._paint()).catch(() => {});
    }
  },

  _paint() {
    const host = this._host, student = this._student;
    const { goals, entriesByGoal, probesByGoal } = this._cache[student.id];

    const annual = goals.filter(g => g.goal_type === 'annual');
    const transition = goals.filter(g => g.goal_type === 'transition');

    const section = (label, list) => !list.length ? '' : `
      <div class="goals-group-label muted">${label}</div>
      ${list.map(g => this._goalRowHTML(g, entriesByGoal[g.id] || [], probesByGoal[g.id] || [])).join('')}`;

    host.innerHTML = `
      ${goals.length === 0 ? '<p class="muted" style="font-size:13px;margin:0 0 10px;">No goals yet. Start from the bank of 1,500 measurable goals, or write your own.</p>' : ''}
      ${this._overviewHTML(annual, entriesByGoal, probesByGoal)}
      ${section('Annual goals', annual)}
      ${section('Postsecondary goals', transition)}
      <div id="goalSuggestions"></div>
      <button class="card-action" id="goalAddBtn">${window.aceIcons.plus(14)} New Goal</button>
    `;

    host.querySelector('#goalAddBtn').addEventListener('click', () => this._openFromBank(null));
    host.querySelectorAll('[data-goal-action]').forEach(btn => {
      btn.addEventListener('click', () => this._onAction(btn.dataset.goalAction, btn.dataset.goalId, btn));
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

  // A one-line read on the whole caseload of goals for this student: how many
  // are on track, how many need a decision, how many are waiting on a probe.
  _overviewHTML(annual, entriesByGoal, probesByGoal) {
    const active = annual.filter(g => g.status === 'active');
    if (!active.length) return '';
    let onTrack = 0, needsAttention = 0, noData = 0, dueNow = 0;
    active.forEach(g => {
      const entries = (entriesByGoal[g.id] || []).filter(e => e.value != null);
      const t = this._trend(g, entries);
      if (!entries.length) noData++;
      else if (t.rule === 'below') needsAttention++;
      else onTrack++;
      const st = this._probeStatus(g, probesByGoal[g.id] || []);
      if (st && st.state === 'due') dueNow++;
    });
    const chip = (n, label, cls) => n ? `<span class="goals-ov-chip ${cls}"><strong>${n}</strong> ${label}</span>` : '';
    return `<div class="goals-overview">
      ${chip(onTrack, 'on track', 'ok')}
      ${chip(needsAttention, 'need a decision', 'warn')}
      ${chip(noData, 'awaiting baseline data', 'muted')}
      ${chip(dueNow, 'probe due', 'due')}
    </div>`;
  },

  // ---- probe lifecycle ---------------------------------------------------------
  _pool(g) {
    return (window.ACE_PROBE_BANK && window.ACE_PROBE_BANK.pools && window.ACE_PROBE_BANK.pools[g.probe_pool]) || null;
  },

  _cadenceDays(pool) {
    return pool && pool.frequency === 'weekly' ? 7 : pool && pool.frequency === 'monthly' ? 30 : 14;
  },

  _probeStatus(g, probes) {
    if (g.goal_type === 'transition' || g.status !== 'active') return null;
    const pool = this._pool(g);
    // A goal with no pool is monitored by hand. Say so out loud: an unexplained
    // blank space reads as a broken feature.
    if (!g.probe_pool || !pool) return { state: 'manual' };

    const completed = probes.filter(p => p.status === 'completed');
    const phase = window.aceProbeEngine
      ? window.aceProbeEngine.currentPhase({ probe_pool: g.probe_pool }, completed.length)
      : 1;

    if (pool.kind === 'observation') {
      const last = completed[completed.length - 1];
      if (last) {
        const due = new Date(last.created_at);
        due.setDate(due.getDate() + this._cadenceDays(pool));
        if (due > new Date()) return { state: 'scheduled', due, phase, pool };
      }
      return { state: 'score-now', phase, pool };
    }

    const pending = probes.filter(p => p.status === 'pending' && p.active);
    if (pending.length) return { state: 'waiting', probe: pending[pending.length - 1], phase, pool };
    const last = completed[completed.length - 1];
    if (last) {
      const due = new Date(last.created_at);
      due.setDate(due.getDate() + this._cadenceDays(pool));
      if (due > new Date()) return { state: 'scheduled', due, phase, pool };
    }
    return { state: 'due', phase, pool };
  },

  _probeHTML(g, probes) {
    const st = this._probeStatus(g, probes);
    if (!st) return '';
    const esc = window.aceUtils.escapeHtml;

    if (st.state === 'manual') {
      return `<div class="probe-line probe-manual muted">
        <span>${window.aceIcons.pencilLine(12)} No automated probe on this goal — use <strong>Log data</strong> to chart it.</span>
        <button class="goal-mini-btn" data-goal-action="edit" data-goal-id="${g.id}">Add a monitoring plan</button>
      </div>`;
    }

    const phaseTag = `<span class="probe-phase" title="The item mix shifts across the year so earlier benchmarks keep being sampled">Phase ${st.phase} · benchmark ${st.phase} focus</span>`;
    const srTag = st.pool.kind === 'self_report'
      ? ' <span class="probe-sr-tag" title="Scored from student self-report — review before reporting">self-report</span>' : '';

    if (st.state === 'score-now') {
      return `<div class="probe-line probe-due">
        <span>${window.aceIcons.pencilLine(12)} Observation probe due — you score it ${phaseTag}</span>
        <button class="goal-mini-btn" data-goal-action="observe" data-goal-id="${g.id}">${window.aceIcons.plus(11)} Score now</button>
      </div>`;
    }
    if (st.state === 'waiting') {
      return `
        <div class="probe-box">
          <div class="probe-label">Probe sent — auto-scores into the graph when ${esc(this._student.first_name)} submits${srTag} ${phaseTag}</div>
          <div class="tf-link-row">
            <input type="text" readonly class="tf-link-input" value="${esc(window.aceUtils.shareLinkURL(st.probe.token))}" />
            <button class="btn-secondary tf-copy-btn" data-goal-action="probe-copy" data-goal-id="${g.id}" data-token="${esc(st.probe.token)}">${window.aceIcons.copy(13)} Copy</button>
          </div>
          <button class="goal-mini-btn" data-goal-action="probe-regen" data-goal-id="${g.id}">${window.aceIcons.rotateCcw(11)} Regenerate with fresh items</button>
        </div>`;
    }
    if (st.state === 'scheduled') {
      return `<div class="probe-line muted">${window.aceIcons.check(12)} Probe cycle current — next due ${esc(window.aceUtils.formatShortDate(window.aceUtils.dateToISO(st.due)))}${srTag} ${phaseTag}</div>`;
    }
    return `
      <div class="probe-line probe-due">
        <span>Probe due — a fresh set of items each cycle${srTag} ${phaseTag}</span>
        <button class="goal-mini-btn" data-goal-action="probe-gen" data-goal-id="${g.id}">${window.aceIcons.plus(11)} Generate probe</button>
      </div>`;
  },

  // ---- benchmark rail ----------------------------------------------------------
  // Each rung is lit by the most recent probe that produced a score for that
  // benchmark, compared to that benchmark's own target.
  _benchmarkRailHTML(g, entries) {
    const bms = g.benchmarks || [];
    if (!bms.length) return '';
    const esc = window.aceUtils.escapeHtml;
    const M = this.M;
    const c = g.criterion || {};

    const latestFor = (i) => {
      for (let k = entries.length - 1; k >= 0; k--) {
        const bd = entries[k].breakdown || {};
        if (bd[String(i + 1)] != null) return Number(bd[String(i + 1)]);
      }
      return null;
    };

    return `<div class="goal-bm-rail">
      ${bms.map((b, i) => {
        const bc = Object.assign({ direction: c.direction, unit: '%' }, b.criterion || {});
        const val = latestFor(i);
        // Benchmark scores come from the probe as a percent correct on that
        // tier's items, so they are compared against the benchmark target as a
        // percent even when the goal itself is charted in another unit.
        const target = bc.target;
        let cls = 'none', label = 'no data';
        if (val != null) {
          const met = c.direction === 'decrease' ? val <= target : val >= target;
          const close = val >= target * 0.9;
          cls = met ? 'met' : close ? 'near' : 'low';
          label = val + '%';
        }
        const w = (M.WINDOWS[i] || {});
        return `<div class="goal-bm-rung ${cls}" title="${esc((b.behavior || '') + (target != null ? ' · target ' + target + '%' : ''))}">
          <span class="goal-bm-rung-n">${i + 1}</span>
          <span class="goal-bm-rung-body">
            <span class="goal-bm-rung-win">${esc(w.short || '')}</span>
            <span class="goal-bm-rung-beh">${esc(b.behavior || '')}</span>
          </span>
          <span class="goal-bm-rung-val">${esc(label)}</span>
        </div>`;
      }).join('')}
    </div>`;
  },

  // ---- trend and the four-point decision rule ------------------------------------
  // The aimline runs from the baseline (or the first data point) to the
  // criterion target across 36 instructional weeks. Four consecutive points on
  // one side of it is the standard CBM signal to act.
  _trend(g, valued) {
    const c = g.criterion || {};
    const target = c.target != null ? Number(c.target) : null;
    if (!valued.length || target == null) return { rule: 'none', points: [] };

    const start = new Date(valued[0].entry_date).getTime();
    const end = start + 36 * 7 * 86400000;
    const startVal = Number(valued[0].value);
    const aimAt = (t) => {
      if (end === start) return target;
      const f = Math.max(0, Math.min(1, (t - start) / (end - start)));
      return startVal + (target - startVal) * f;
    };

    const pts = valued.map(e => ({
      t: new Date(e.entry_date).getTime(),
      v: Number(e.value),
      aim: aimAt(new Date(e.entry_date).getTime())
    }));

    // The first point ANCHORS the aimline, so it sits exactly on it by
    // construction and can never count as above or below. Including it would
    // make the four-point rule unable to fire until the fifth cycle and, worse,
    // report "tracking along the aimline" for a student who is flat.
    const last4 = pts.slice(1).slice(-4);
    let rule = 'ok';
    if (last4.length < 4) rule = 'insufficient';
    else {
      const below = last4.every(p => c.direction === 'decrease' ? p.v > p.aim : p.v < p.aim);
      const above = last4.every(p => c.direction === 'decrease' ? p.v < p.aim : p.v > p.aim);
      rule = below ? 'below' : above ? 'above' : 'ok';
    }
    return { rule, points: pts, aimStart: startVal, aimEnd: target, start, end };
  },

  _decisionHTML(g, valued) {
    const t = this._trend(g, valued);
    if (t.rule === 'none' || t.rule === 'insufficient') {
      // Five points, because the first one anchors the aimline and the rule
      // reads the four that follow it.
      const need = 5 - valued.length;
      return valued.length
        ? `<div class="goal-decision muted">${need > 0 ? need + ' more data point' + (need === 1 ? '' : 's') : 'More data'} before the four-point rule applies.</div>`
        : '';
    }
    if (t.rule === 'below') {
      return `<div class="goal-decision warn">${window.aceIcons.alertTriangle ? window.aceIcons.alertTriangle(12) : '!'} Four consecutive points below the aimline — the four-point rule says change something about the instruction, not the goal.</div>`;
    }
    if (t.rule === 'above') {
      return `<div class="goal-decision good">${window.aceIcons.check(12)} Four consecutive points above the aimline — consider raising the goal or moving to the next benchmark.</div>`;
    }
    return `<div class="goal-decision ok">${window.aceIcons.check(12)} Tracking along the aimline — stay the course.</div>`;
  },

  _goalRowHTML(g, entries, probes) {
    const esc = window.aceUtils.escapeHtml;
    const M = this.M;
    const c = g.criterion || {};
    const valued = entries.filter(e => e.value != null);
    const latest = valued.length ? valued[valued.length - 1] : null;
    const met = latest && M.atTarget(latest.value, c);

    let progressLine = '';
    if (g.goal_type !== 'transition') {
      if (latest) {
        progressLine = `Latest: <strong>${esc(this._fmt(latest.value, c.unit))}</strong>
          · target ${esc(this._fmt(c.target, c.unit))}
          ${c.direction === 'decrease' ? '<span class="goal-dir-chip" title="Lower is better on this goal">lower is better</span>' : ''}
          ${met ? '<span class="goal-met-chip">at target</span>' : ''}
          · ${valued.length} data point${valued.length === 1 ? '' : 's'}`;
      } else {
        progressLine = `No data yet · target ${esc(this._fmt(c.target, c.unit))}`;
      }
    }

    return `
      <div class="goal-row ${g.status !== 'active' ? 'goal-row-' + g.status : ''}">
        <div class="goal-row-top">
          <span class="goal-domain-chip">${esc(g.domain)}</span>
          ${g.skill ? `<span class="goal-skill-chip">${esc(g.skill)}</span>` : ''}
          <select class="goal-status-select" data-goal-id="${g.id}">
            <option value="active" ${g.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="met" ${g.status === 'met' ? 'selected' : ''}>Met</option>
            <option value="discontinued" ${g.status === 'discontinued' ? 'selected' : ''}>Discontinued</option>
          </select>
        </div>
        <div class="goal-text">${esc(g.goal_text)}</div>
        ${g.baseline ? `<div class="goal-baseline muted">Baseline: ${esc(g.baseline)}</div>` : ''}
        ${g.goal_type !== 'transition' ? this._benchmarkRailHTML(g, valued) : ''}
        ${progressLine ? `<div class="goal-progress-line muted">${progressLine}</div>` : ''}
        ${valued.length >= 2 ? this._chartSVG(g, valued) : ''}
        ${g.goal_type !== 'transition' ? this._decisionHTML(g, valued) : ''}
        ${this._probeHTML(g, probes || [])}
        <div class="goal-row-actions">
          ${g.goal_type !== 'transition' ? `<button class="goal-mini-btn" data-goal-action="log" data-goal-id="${g.id}">${window.aceIcons.plus(12)} Log data</button>` : ''}
          ${valued.length ? `<button class="goal-mini-btn" data-goal-action="history" data-goal-id="${g.id}">History</button>` : ''}
          <button class="goal-mini-btn" data-goal-action="edit" data-goal-id="${g.id}">Edit</button>
          <button class="goal-mini-btn goal-mini-danger" data-goal-action="delete" data-goal-id="${g.id}">Delete</button>
        </div>
      </div>`;
  },

  // Inline SVG trend chart: data points, connecting line, dashed target line and
  // a dotted aimline from the first point to the target.
  _chartSVG(g, valued) {
    const c = g.criterion || {};
    const W = 300, H = 76, PAD = 8;
    const t = this._trend(g, valued);
    const vals = valued.map(e => Number(e.value));
    const target = c.target != null ? Number(c.target) : null;
    let lo = Math.min(...vals, target ?? Infinity);
    let hi = Math.max(...vals, target ?? -Infinity);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    lo -= pad; hi += pad;

    const x = i => PAD + (W - 2 * PAD) * (valued.length === 1 ? 0.5 : i / (valued.length - 1));
    const y = v => H - PAD - (H - 2 * PAD) * ((v - lo) / (hi - lo));
    const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const dots = vals.map((v, i) => {
      const src = valued[i].source;
      return `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.6" class="${src === 'manual' ? 'goal-chart-dot-manual' : ''}"><title>${window.aceUtils.formatShortDate(valued[i].entry_date)}: ${this._fmt(v, c.unit)}</title></circle>`;
    }).join('');
    const targetLine = target != null
      ? `<line x1="${PAD}" y1="${y(target).toFixed(1)}" x2="${W - PAD}" y2="${y(target).toFixed(1)}" class="goal-chart-target" />`
      : '';
    // The aimline is the honest comparison: not "is it going up" but "is it
    // going up fast enough to arrive by the annual review".
    const aimLine = (t.points.length && target != null)
      ? `<line x1="${x(0).toFixed(1)}" y1="${y(t.aimStart).toFixed(1)}" x2="${(W - PAD)}" y2="${y(target).toFixed(1)}" class="goal-chart-aim" />`
      : '';
    return `<svg class="goal-chart" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" role="img" aria-label="Progress trend with target and aimline">
      ${targetLine}${aimLine}<polyline points="${pts}" class="goal-chart-line" />${dots}</svg>`;
  },

  // ---- bank browse -> builder prefill ---------------------------------------------
  async _openFromBank(filter, fallbackSeed) {
    const student = this._student;
    let seed = fallbackSeed || null;
    if (window.aceGoalBankUI) {
      const pick = await window.aceGoalBankUI.open(student, filter || {});
      if (pick === null) return;                 // dismissed
      if (pick && pick !== 'custom') {
        seed = {
          goal_type: 'annual',
          domain: pick.domain,
          condition: pick.condition,
          behavior: pick.behavior,
          criterion: pick.criterion,
          measurement_method: pick.measurement_method,
          baseline_prompt: pick.baseline_prompt,
          benchmarks: pick.benchmarks,
          bank_id: pick.id,
          il_standard: pick.il_standard,
          probe_pool: pick.probe_pool,
          fade: pick.fade,
          skill: pick.skill,
          grade_band: pick.grade_band,
          teaching_note: pick.teaching_note,
          source_need: (fallbackSeed && fallbackSeed.source_need) || null
        };
      }
    }
    const r = await window.aceGoalBuilder.open(student, null, seed);
    if (r && r.confirmed) await this.render(this._host, student);
  },

  // ---- probe generation --------------------------------------------------------------
  async _generateProbe(g) {
    await window.aceLazyData.banks().catch(() => {});
    const pool = this._pool(g);
    if (!pool || !window.aceProbeEngine) { window.aceToast?.error('No probe pool for this goal'); return; }

    const probes = (this._cache[this._student.id].probesByGoal || {})[g.id] || [];
    const used = [];
    probes.forEach(p => (p.items || []).forEach(it => used.push(it.id)));
    const completed = probes.filter(p => p.status === 'completed').length;

    const built = window.aceProbeEngine.build(this._hydrate(g), { cycleIndex: completed, usedItemIds: used });

    // Supersede any stale pending probe so exactly one link is live per goal.
    await window.aceSupabase.from('probes').update({ active: false })
      .eq('goal_id', g.id).eq('status', 'pending');

    const { error } = await window.aceSupabase.from('probes').insert({
      student_id: this._student.id,
      goal_id: g.id,
      token: window.aceUtils.makeShareToken('pr'),
      pool_key: g.probe_pool,
      kind: built.kind,
      phase: built.phase,
      seed: built.seed,
      timed: built.timed,
      cycle_label: window.aceUtils.todayISO(),
      items: built.items
    });
    if (error) { console.error('Probe create failed:', error); window.aceToast?.error('Could not generate the probe'); return; }
    window.aceToast?.success('Probe generated — copy the link and send it to the student');
    await this.render(this._host, this._student);
  },

  // A saved goal row rendered in the same shape the probe engine expects.
  _hydrate(g) {
    return {
      id: g.id, probe_pool: g.probe_pool, grade_band: g.grade_band || '9-12',
      criterion: g.criterion || {}, benchmarks: g.benchmarks || [],
      probe_plan: g.probe_plan || {}
    };
  },

  // ---- observation probes: scored here, by the case manager ---------------------------
  async _openObservation(g) {
    await window.aceLazyData.banks().catch(() => {});
    const pool = this._pool(g);
    if (!pool || !window.aceProbeEngine) { window.aceToast?.error('No probe pool for this goal'); return; }
    const esc = window.aceUtils.escapeHtml;
    const c = g.criterion || {};
    const probes = (this._cache[this._student.id].probesByGoal || {})[g.id] || [];
    const completed = probes.filter(p => p.status === 'completed').length;
    const built = window.aceProbeEngine.build(this._hydrate(g), { cycleIndex: completed });

    const itemHTML = (it) => {
      if (it.type === 'rubric') {
        return `<div class="obs-item" data-id="${esc(it.id)}" data-type="rubric" data-tier="${it.tier}">
          <div class="obs-item-head"><span class="obs-tier">B${it.tier}</span> ${esc(it.prompt)}</div>
          <div class="obs-rubric">
            ${it.levels.map((lv, i) => `<label class="obs-rubric-opt"><input type="radio" name="obs-${esc(it.id)}" value="${i + 1}" /><span><strong>${i + 1}</strong> ${esc(lv)}</span></label>`).join('')}
          </div>
        </div>`;
      }
      if (it.type === 'value') {
        return `<div class="obs-item obs-item-value" data-id="${esc(it.id)}" data-type="value" data-tier="${it.tier}">
          <div class="obs-item-head">${esc(it.prompt)}</div>
          <div class="obs-value-row">
            <input type="number" step="any" class="obs-value-input" placeholder="${esc(String(c.target ?? ''))}" />
            <span class="obs-value-unit">${esc(it.unit || '')}</span>
          </div>
        </div>`;
      }
      // tally: the default shape — how many opportunities, how many met
      return `<div class="obs-item" data-id="${esc(it.id)}" data-type="tally" data-tier="${it.tier}">
        <div class="obs-item-head"><span class="obs-tier">B${it.tier}</span> ${esc(it.prompt)}</div>
        ${it.hint ? `<div class="obs-item-hint muted">${esc(it.hint)}</div>` : ''}
        <div class="obs-tally-row">
          <label>Correct / independent</label><input type="number" min="0" class="obs-correct" placeholder="0" />
          <label>of opportunities</label><input type="number" min="1" class="obs-opps" placeholder="0" />
        </div>
      </div>`;
    };

    const r = await window.aceModal.openDrawer({
      title: 'Score an observation probe',
      saveLabel: 'Record probe',
      bodyHTML: `
        <p class="muted" style="font-size:13px;margin:0 0 4px;">${esc(g.goal_text)}</p>
        <div class="obs-admin">${esc(pool.administration)}</div>
        <div class="obs-phase muted">Cycle ${completed + 1} · phase ${built.phase} — weighted toward benchmark ${built.phase}</div>
        <label class="iep-label">Date</label>
        <input type="date" id="obsDate" value="${window.aceUtils.todayISO()}" />
        <div class="obs-items">${built.items.map(itemHTML).join('')}</div>
        <label class="iep-label">Note <span class="goalb-hint">optional</span></label>
        <input type="text" id="obsNote" placeholder="Observed during 3rd period independent work" />
        <div id="obsError" class="hard-delete-error"></div>`,
      afterRender: (body) => {
        // Live score preview so the case manager sees the number before saving.
        const preview = document.createElement('div');
        preview.className = 'obs-preview';
        body.querySelector('.obs-items').after(preview);
        const update = () => {
          const { responses } = this._collectObservation(body);
          const scored = window.aceProbeEngine.scoreObservation(built.items, responses);
          preview.innerHTML = scored.score == null ? '<span class="muted">Enter data to see the score.</span>'
            : `Scores as <strong>${this._fmt(scored.score, c.unit)}</strong> · benchmarks ${[1, 2, 3].map(t => scored.breakdown[t] == null ? '—' : scored.breakdown[t] + '%').join(' / ')}`;
        };
        body.querySelectorAll('input').forEach(el => { el.addEventListener('input', update); el.addEventListener('change', update); });
        update();
      },
      onSave: async (body) => {
        const errEl = body.querySelector('#obsError');
        errEl.textContent = '';
        const date = body.querySelector('#obsDate').value;
        if (!date) { errEl.textContent = 'A date is required.'; return false; }
        const { responses, answered } = this._collectObservation(body);
        if (!answered) { errEl.textContent = 'Enter at least one row before recording the probe.'; return false; }
        const scored = window.aceProbeEngine.scoreObservation(built.items, responses);
        if (scored.score == null) { errEl.textContent = 'Those entries do not produce a score — check the opportunity counts.'; return false; }

        const { data: probeRow, error: pErr } = await window.aceSupabase.from('probes').insert({
          student_id: this._student.id,
          goal_id: g.id,
          token: window.aceUtils.makeShareToken('ob'),
          pool_key: g.probe_pool,
          kind: 'observation',
          phase: built.phase,
          seed: built.seed,
          cycle_label: date,
          items: built.items,
          responses,
          score: scored.score,
          breakdown: scored.breakdown,
          status: 'completed',
          completed_at: new Date().toISOString()
        }).select().single();
        if (pErr) { console.error('Observation probe failed:', pErr); errEl.textContent = pErr.message; return false; }

        const { error: eErr } = await window.aceSupabase.from('goal_progress_entries').insert({
          goal_id: g.id, entry_date: date, value: scored.score,
          note: (body.querySelector('#obsNote').value.trim() || 'Observation probe — scored by case manager'),
          breakdown: scored.breakdown, source: 'observation', probe_id: probeRow.id
        });
        if (eErr) { errEl.textContent = eErr.message; return false; }
        return true;
      }
    });
    if (r && r.confirmed) { window.aceToast?.success('Observation probe recorded'); await this.render(this._host, this._student); }
  },

  _collectObservation(body) {
    const responses = {};
    let answered = 0;
    body.querySelectorAll('.obs-item').forEach(el => {
      const id = el.dataset.id;
      if (el.dataset.type === 'rubric') {
        const sel = el.querySelector('input:checked');
        if (sel) { responses[id] = Number(sel.value); answered++; }
      } else if (el.dataset.type === 'value') {
        const v = el.querySelector('.obs-value-input').value.trim();
        if (v !== '') { responses[id] = Number(v); answered++; }
      } else {
        const cr = el.querySelector('.obs-correct').value.trim();
        const op = el.querySelector('.obs-opps').value.trim();
        if (cr !== '' && op !== '' && Number(op) > 0) {
          responses[id] = { correct: Number(cr), opportunities: Number(op) };
          answered++;
        }
      }
    });
    return { responses, answered };
  },

  // ---- actions --------------------------------------------------------------------------
  async _onAction(action, goalId, btn) {
    const student = this._student;
    const g = this._cache[student.id].goals.find(x => x.id === goalId);
    if (!g) return;

    if (action === 'probe-gen') {
      await this._generateProbe(g);

    } else if (action === 'observe') {
      await this._openObservation(g);

    } else if (action === 'probe-copy') {
      const url = window.aceUtils.shareLinkURL(btn.dataset.token);
      try { await navigator.clipboard.writeText(url); window.aceToast?.success('Probe link copied'); }
      catch (e) { window.aceToast?.error('Could not copy — select the link text instead'); }

    } else if (action === 'probe-regen') {
      const ok = await window.aceModal.openModal({
        title: 'Regenerate this probe?',
        message: 'The current link stops working and a fresh set of items is drawn. Any progress the student made on the old link is discarded.',
        confirmLabel: 'Regenerate', variant: 'default', onConfirm: async () => {}
      });
      if (ok) await this._generateProbe(g);

    } else if (action === 'edit') {
      await window.aceLazyData.banks().catch(() => {});
      const r = await window.aceGoalBuilder.open(student, g);
      if (r && r.confirmed) await this.render(this._host, student);

    } else if (action === 'delete') {
      const ok = await window.aceModal.openModal({
        title: 'Delete this goal?',
        message: 'The goal, its benchmarks and every logged data point will be removed. This cannot be undone.',
        confirmLabel: 'Delete goal', variant: 'danger',
        onConfirm: async () => {
          const { error } = await window.aceSupabase.from('iep_goals').delete().eq('id', goalId);
          if (error) throw error;
        }
      });
      if (ok) { window.aceToast?.success('Goal deleted'); await this.render(this._host, student); }

    } else if (action === 'log') {
      await this._logData(g);

    } else if (action === 'history') {
      await this._openHistory(g);
    }
  },

  async _logData(g) {
    const c = g.criterion || {};
    const esc = window.aceUtils.escapeHtml;
    const bms = g.benchmarks || [];
    const r = await window.aceModal.openDrawer({
      title: 'Log a data point',
      saveLabel: 'Log data',
      bodyHTML: `
        <p class="muted" style="font-size:13px;margin:0 0 12px;">${esc(g.goal_text)}</p>
        <label class="iep-label">Date</label>
        <input type="date" id="gpDate" value="${window.aceUtils.todayISO()}" />
        <label class="iep-label">Value ${c.metric_label ? `<span class="goalb-hint">${esc(c.metric_label)} · target ${esc(String(c.target ?? ''))}${c.direction === 'decrease' ? ' or lower' : ''}</span>` : ''}</label>
        <input type="number" id="gpValue" step="any" placeholder="${esc(String(c.target ?? ''))}" />
        ${bms.length ? `
          <label class="iep-label" style="margin-top:14px;">Benchmark scores <span class="goalb-hint">optional — percent correct on each rung, so the rail stays current</span></label>
          <div class="gp-bm-inputs">
            ${bms.map((b, i) => `
              <div class="gp-bm-input">
                <span class="gp-bm-num">${i + 1}</span>
                <span class="gp-bm-beh">${esc(b.behavior || '')}</span>
                <input type="number" min="0" max="100" class="gp-bm-val" data-i="${i + 1}" placeholder="%" />
              </div>`).join('')}
          </div>` : ''}
        <label class="iep-label">Note <span class="goalb-hint">optional</span></label>
        <input type="text" id="gpNote" placeholder="3 of 5 correct on CBM probe" />
        <div id="gpError" class="hard-delete-error"></div>`,
      onSave: async (body) => {
        const date = body.querySelector('#gpDate').value;
        const value = body.querySelector('#gpValue').value;
        const errEl = body.querySelector('#gpError');
        if (!date || value === '') { errEl.textContent = 'Date and value are required.'; return false; }
        const breakdown = {};
        body.querySelectorAll('.gp-bm-val').forEach(inp => {
          if (inp.value.trim() !== '') breakdown[inp.dataset.i] = Number(inp.value);
        });
        const { error } = await window.aceSupabase.from('goal_progress_entries')
          .insert({
            goal_id: g.id, entry_date: date, value: Number(value),
            note: body.querySelector('#gpNote').value.trim(),
            breakdown, source: 'manual'
          });
        if (error) { errEl.textContent = error.message; return false; }
        return true;
      }
    });
    if (r && r.confirmed) { window.aceToast?.success('Data point logged'); await this.render(this._host, this._student); }
  },

  async _openHistory(g) {
    const entries = this._cache[this._student.id].entriesByGoal[g.id] || [];
    const esc = window.aceUtils.escapeHtml;
    const c = g.criterion || {};
    const srcLabel = { probe: 'probe', observation: 'observed', manual: 'entered' };
    await window.aceModal.openDrawer({
      title: 'Data history',
      saveLabel: 'Done', cancelLabel: 'Close',
      bodyHTML: `
        <p class="muted" style="font-size:13px;margin:0 0 12px;">${esc(g.goal_text)}</p>
        ${entries.slice().reverse().map(e => {
          const bd = e.breakdown || {};
          const parts = [1, 2, 3].map(i => bd[i] == null ? '—' : bd[i] + '%');
          const hasBd = [1, 2, 3].some(i => bd[i] != null);
          return `
            <div class="goal-history-row" data-entry-id="${e.id}">
              <span class="goal-history-date">${window.aceUtils.formatShortDate(e.entry_date)}</span>
              <span class="goal-history-value">${esc(this._fmt(e.value, c.unit))}</span>
              <span class="goal-history-src">${esc(srcLabel[e.source] || e.source || '')}</span>
              ${hasBd ? `<span class="goal-history-bd" title="Per-benchmark scores">B: ${esc(parts.join(' / '))}</span>` : '<span class="goal-history-bd"></span>'}
              <span class="goal-history-note muted">${esc(e.note || '')}</span>
              <button class="goal-mini-btn goal-mini-danger goal-history-del" data-entry-id="${e.id}">×</button>
            </div>`;
        }).join('') || '<p class="muted">No entries.</p>'}`,
      afterRender: (body) => {
        body.querySelectorAll('.goal-history-del').forEach(btn => {
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            const { error } = await window.aceSupabase.from('goal_progress_entries').delete().eq('id', btn.dataset.entryId);
            if (error) {
              btn.disabled = false;
              window.aceToast?.error('Could not delete that data point');
              return;
            }
            body.querySelector(`.goal-history-row[data-entry-id="${btn.dataset.entryId}"]`)?.remove();
          });
        });
      }
    });
    await this.render(this._host, this._student);
  },

  // ---- suggestions: derived from live data, prefill-only ----------------------------------
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
            search: 'self-monitoring', need: `Teacher feedback (${tf.course_name}): ${p.engagementLevel}` });
        }
        if (LOW_IND.includes(p.independenceLevel) && !have('Executive Functioning')) {
          chips.push({ label: 'Independent task initiation', domain: 'Executive Functioning',
            search: 'initiation', need: `Teacher feedback (${tf.course_name}): ${p.independenceLevel}` });
        }
        if (NEG_PEER.includes(p.peerInteractions) && !have('Social/Emotional')) {
          chips.push({ label: 'Peer interactions', domain: 'Social/Emotional',
            search: 'peer', need: `Teacher feedback (${tf.course_name}): ${p.peerInteractions}` });
        }
        if (LOW_PERF.includes(p.overallPerformance) && window.COURSE_DOMAIN_MAP) {
          const dom = window.COURSE_DOMAIN_MAP.getDomain({ name: tf.course_name });
          const label = DOMAIN_LABEL[dom];
          if (label && !have(label)) {
            chips.push({ label: `${label} skills`, domain: label,
              need: `Teacher feedback (${tf.course_name}): ${p.overallPerformance}` });
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
            need: `TA1 independent living: ${ta.independentLiving}` });
        }
        if (ta.employmentGoal && !have('Vocational')) {
          chips.push({ label: 'Employment skills', domain: 'Vocational',
            need: `TA1 employment goal: ${ta.employmentGoal}` });
        }
      }

      if (student.has_bip && !have('Behavior')) {
        chips.push({ label: 'Behavior (BIP in place)', domain: 'Behavior', search: 'replacement',
          need: 'Student has an active Behavior Intervention Plan' });
      }
    } catch (e) { console.error('Goal suggestions failed:', e); }

    if (!chips.length) { host.innerHTML = ''; return; }
    const esc = window.aceUtils.escapeHtml;
    const seen = new Set();
    const unique = chips.filter(c => !seen.has(c.label) && seen.add(c.label)).slice(0, 5);

    host.innerHTML = `
      <div class="goals-suggest-label muted">Suggested from data — opens the bank filtered to that need</div>
      <div class="goals-suggest-chips">
        ${unique.map((c, i) => `<button class="goal-suggest-chip" data-idx="${i}" title="${esc(c.need)}">${esc(c.label)}</button>`).join('')}
      </div>`;

    host.querySelectorAll('.goal-suggest-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const c = unique[Number(btn.dataset.idx)];
        const seed = {
          goal_type: c.goal_type || 'annual', domain: c.domain,
          transition_area: c.transition_area, behavior: c.behavior || '', source_need: c.need
        };
        // Transition suggestions go straight to the builder (the bank holds
        // annual goals); annual ones open the bank pre-filtered.
        if (seed.goal_type === 'transition') {
          const r = await window.aceGoalBuilder.open(this._student, null, seed);
          if (r && r.confirmed) await this.render(this._host, this._student);
        } else {
          await this._openFromBank({ domain: c.domain, search: c.search || '' }, seed);
        }
      });
    });
  }
};

window.aceGoals = aceGoals;
