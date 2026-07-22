// =============================================================
// Ace Manager — Documents card (student profile)
// =============================================================
// Generates the recurring paperwork as editable text in a drawer with one
// Copy button — the same copy-out workflow as the PLAAFP (the system of
// record stays Embrace; Ace Manager does the drafting). Both templates pull
// live data: student, case manager, org branding, goals + progress entries,
// accommodations.
//
// The accommodations one-pager doubles as the editor for the underlying
// students.accommodations list (chips, saved on generate).

const aceDocuments = {

  async render(host, student) {
    if (!host) return;
    this._host = host; this._student = student;
    const docs = [
      { id: 'accomm',  label: 'Accommodations one-pager',   hint: 'for gen-ed teachers' },
      { id: 'progress',label: 'Quarterly progress report',  hint: 'from goal data' }
    ];
    host.innerHTML = docs.map(d => `
      <button class="doc-row" data-doc="${d.id}">
        <span class="doc-row-label">${d.label}</span>
        <span class="doc-row-hint muted">${d.hint}</span>
      </button>`).join('');
    host.querySelectorAll('.doc-row').forEach(btn => {
      btn.addEventListener('click', () => this._open(btn.dataset.doc));
    });
  },

  async _context() {
    const [profile, branding] = await Promise.all([
      window.aceAuth.getProfileCached(),
      window.aceAuth.getBranding()
    ]);
    return {
      s: this._student,
      name: `${this._student.first_name} ${this._student.last_initial}.`,
      cm: (profile && profile.full_name) || 'Case Manager',
      school: branding.school_name || 'our school',
      today: window.aceUtils.formatLongDate(window.aceUtils.todayISO())
    };
  },

  async _open(docId) {
    if (docId === 'accomm') return this._openAccommodations();
    if (docId !== 'progress') return;
    const ctx = await this._context();
    await this._showDoc('Quarterly progress report', await this._progressReport(ctx));
  },

  async _showDoc(title, text) {
    await window.aceModal.openDrawer({
      title,
      saveLabel: 'Copy to clipboard', cancelLabel: 'Close',
      bodyHTML: `
        <p class="muted" style="font-size:13px;margin:0 0 10px;">Edit freely — Copy takes the current text.</p>
        <textarea id="docText" class="doc-textarea" rows="22">${window.aceUtils.escapeHtml(text)}</textarea>`,
      onSave: async (body) => {
        await navigator.clipboard.writeText(body.querySelector('#docText').value);
        window.aceToast?.success('Copied to clipboard');
        return false;   // keep the drawer open so repeated copies work
      }
    });
  },

  // ---- templates --------------------------------------------------------

  async _progressReport(ctx) {
    const { data: goals } = await window.aceSupabase.from('iep_goals').select('*')
      .eq('student_id', ctx.s.id).order('created_at', { ascending: true });
    if (!goals || !goals.length) return `No IEP goals are on file for ${ctx.name} yet. Add goals in the Goals & Progress card first.`;

    const { data: entries } = await window.aceSupabase.from('goal_progress_entries').select('*')
      .in('goal_id', goals.map(g => g.id)).order('entry_date', { ascending: true });
    const byGoal = {};
    (entries || []).forEach(e => (byGoal[e.goal_id] = byGoal[e.goal_id] || []).push(e));

    const sections = goals.map((g, i) => {
      const c = g.criterion || {};
      const pts = (byGoal[g.id] || []).filter(e => e.value != null);
      let progress;
      if (g.goal_type === 'transition') {
        progress = g.status === 'met' ? 'This postsecondary goal has been met.' : 'Transition activities are ongoing in support of this goal.';
      } else if (!pts.length) {
        progress = 'No progress data has been collected yet this period.';
      } else {
        const first = Number(pts[0].value), last = Number(pts[pts.length - 1].value);
        const unit = c.unit || '';
        const fmt = (v) => unit === '%' ? `${v}%` : unit ? `${v} ${unit}` : `${v}`;
        const target = c.target != null ? fmt(c.target) : 'the criterion';
        const trend = last > first ? 'an increasing trend' : last < first ? 'a decreasing trend' : 'a stable trend';
        const at = c.target != null && last >= Number(c.target);
        progress = `Across ${pts.length} data point${pts.length === 1 ? '' : 's'}, performance moved from ${fmt(first)} to ${fmt(last)}, showing ${trend}. `
          + (g.status === 'met' ? 'This goal has been met.'
             : at ? `${ctx.name.replace(/\.$/, '')}. is currently performing at the goal criterion of ${target}.`
                  : `The goal criterion is ${target}; progress is ${last >= first ? 'being made toward' : 'not yet on track for'} this criterion.`);
      }
      return `GOAL ${i + 1} — ${g.domain}${g.status !== 'active' ? ` (${g.status})` : ''}
${g.goal_text}
${g.baseline ? `Baseline: ${g.baseline}\n` : ''}Progress: ${progress}`;
    });

    return `QUARTERLY PROGRESS REPORT

Student: ${ctx.name}
Reporting date: ${ctx.today}
Case manager: ${ctx.cm}
School: ${ctx.school}

${sections.join('\n\n')}

Measurement methods are listed in each goal. Please contact me with any questions about this report.

${ctx.cm}`;
  },

  // ---- accommodations one-pager (with inline list editor) ----------------

  async _openAccommodations() {
    const esc = window.aceUtils.escapeHtml;
    const student = this._student;
    let accommodations = Array.isArray(student.accommodations) ? [...student.accommodations] : [];

    const listHTML = () => accommodations.map((a, i) =>
      `<span class="accomm-chip">${esc(a)}<button type="button" class="accomm-chip-x" data-idx="${i}">×</button></span>`).join('')
      || '<span class="muted" style="font-size:13px;">None yet — add the student\'s accommodations below.</span>';

    const r = await window.aceModal.openDrawer({
      title: 'Accommodations one-pager',
      saveLabel: 'Generate one-pager',
      bodyHTML: `
        <label class="iep-label">${esc(student.first_name)}'s accommodations</label>
        <div class="accomm-list" id="accommList">${listHTML()}</div>
        <div class="team-add-row" style="margin-top:10px;">
          <input type="text" id="accommInput" placeholder="Extended time (1.5×) on tests" autocomplete="off" />
          <button type="button" class="btn-secondary" id="accommAddBtn">${window.aceIcons.plus(14)} Add</button>
        </div>
        <p class="goalb-hint" style="margin-top:10px;">The list saves to the student record; the one-pager is generated from it.</p>`,
      afterRender: (body) => {
        const list = body.querySelector('#accommList');
        const input = body.querySelector('#accommInput');
        const rewire = () => {
          list.innerHTML = listHTML();
          list.querySelectorAll('.accomm-chip-x').forEach(x => {
            x.addEventListener('click', () => { accommodations.splice(Number(x.dataset.idx), 1); rewire(); });
          });
        };
        const add = () => {
          const v = input.value.trim();
          if (!v) return;
          accommodations.push(v);
          input.value = '';
          rewire();
          input.focus();
        };
        body.querySelector('#accommAddBtn').addEventListener('click', add);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
        rewire();
      },
      onSave: async () => {
        const { error } = await window.aceSupabase.from('students')
          .update({ accommodations }).eq('id', student.id);
        if (error) { window.aceToast?.error('Could not save accommodations'); return false; }
        student.accommodations = accommodations;
        return true;
      }
    });

    if (r && r.confirmed) {
      const ctx = await this._context();
      const list = accommodations.length
        ? accommodations.map(a => `  •  ${a}`).join('\n')
        : '  •  [No accommodations entered]';
      await this._showDoc('Accommodations one-pager', `CLASSROOM ACCOMMODATIONS — ${ctx.name}

Prepared ${ctx.today} by ${ctx.cm} (case manager) · ${ctx.school}
For teachers of ${ctx.name.replace(/\.$/, '')} — Grade ${ctx.s.grade}

${ctx.name.replace(/\.$/, '')} has an IEP. The accommodations below are REQUIRED in all classes:

${list}

Notes for teachers:
  •  Accommodations are not optional supports — they are part of the IEP and legally required.
  •  If an accommodation isn't working in your class, don't drop it — contact me and we'll problem-solve.
  •  Questions, concerns, or anything you're noticing (good or bad): ${ctx.cm}.`);
    }
  }
};

window.aceDocuments = aceDocuments;
