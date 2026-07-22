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
      { id: 'accomm',      label: 'Accommodations one-pager',    hint: 'for gen-ed teachers' },
      { id: 'cm-intro',    label: 'Intro letter to teachers',    hint: 'introduce yourself · can attach accommodations' },
      { id: 'parent-intro',label: 'Intro letter to family',      hint: 'start-of-year hello' },
      { id: 'progress',    label: 'Quarterly progress report',   hint: 'from goal data' }
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
    const [profile, branding, user, year] = await Promise.all([
      window.aceAuth.getProfileCached(),
      window.aceAuth.getBranding(),
      window.aceAuth.getUser(),
      window.aceUtils.currentSchoolYearLabel()
    ]);
    return {
      s: this._student,
      name: `${this._student.first_name} ${this._student.last_initial}.`,
      first: this._student.first_name,
      cm: (profile && profile.full_name) || 'Case Manager',
      email: (user && user.email) || '',
      school: branding.school_name || 'our school',
      year,
      today: window.aceUtils.formatLongDate(window.aceUtils.todayISO())
    };
  },

  async _open(docId) {
    if (docId === 'accomm') return this._openAccommodations();
    if (docId === 'cm-intro') return this._openCmIntro();
    const ctx = await this._context();
    if (docId === 'parent-intro') {
      return this._showDoc('Intro letter to family', this._parentIntroLetter(ctx));
    }
    if (docId === 'progress') {
      return this._showDoc('Quarterly progress report', await this._progressReport(ctx));
    }
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

  // Shared body for the accommodations one-pager, used standalone and as the
  // appendix to the teacher intro letter. Returns '' when there is nothing on
  // file — callers omit the section rather than print a placeholder.
  _accommodationsText(ctx) {
    const list = Array.isArray(ctx.s.accommodations) ? ctx.s.accommodations.filter(Boolean) : [];
    if (!list.length) return '';
    return `CLASSROOM ACCOMMODATIONS — ${ctx.name}

Prepared ${ctx.today} by ${ctx.cm} (case manager) · ${ctx.school}
For teachers of ${ctx.first} — Grade ${ctx.s.grade}

${ctx.first} has an IEP. The accommodations below are REQUIRED in all classes:

${list.map(a => `  •  ${a}`).join('\n')}

Notes for teachers:
  •  Accommodations are not optional supports — they are part of the IEP and legally required.
  •  If an accommodation isn't working in your class, don't drop it — contact me and we'll problem-solve.
  •  Questions, concerns, or anything you're noticing (good or bad): ${ctx.cm}${ctx.email ? ` (${ctx.email})` : ''}.`;
  },

  // Case manager → the student's general education teachers. Warm, brief,
  // professional. Can carry the accommodations one-pager as an appendix so it
  // goes out as one piece (see _openCmIntro).
  _cmIntroLetter(ctx, attachAccommodations) {
    const reach = ctx.email
      ? `The fastest way to reach me is email: ${ctx.email}.`
      : `You can reach me through the ${ctx.school} main office.`;
    const yearPhrase = ctx.year ? ` this school year (${ctx.year})` : ' this school year';
    const accomm = attachAccommodations ? this._accommodationsText(ctx) : '';

    let letter = `Hello,

My name is ${ctx.cm}, and I'm the special education case manager for ${ctx.name}, who is in one of your classes${yearPhrase}. I wanted to introduce myself so you know who to come to with anything related to ${ctx.first}'s learning plan.

As ${ctx.first}'s case manager, I coordinate the IEP: I monitor progress, keep accommodations current, and make sure the plan actually works in your classroom. Here's what you can expect from me during the year:

  •  Short feedback requests before IEP meetings — a few minutes of your observations, which genuinely shape the plan.
  •  Updates whenever ${ctx.first}'s accommodations or supports change.
  •  Invitations to IEP meetings when your perspective is needed.

In return, please don't wait for a formal request to flag something. If you're seeing anything — academic, behavioral, or just a gut feeling that something is off — I'd rather hear about it early. Good news is welcome too; it goes straight into the strengths section of the IEP.

${reach}

Thank you for everything you do for ${ctx.first}. I'm looking forward to working with you.

${ctx.cm}
Case Manager, ${ctx.school}`;

    if (accomm) {
      letter += `

————————————————————————————————————————

${accomm}`;
    }
    return letter;
  },

  // Case manager → the student's family. Rebuilt for Phase 5.1b: warm,
  // plain-language, and parent-ready — sentences with no data behind them are
  // omitted entirely.
  _parentIntroLetter(ctx) {
    const yearPhrase = ctx.year ? `the ${ctx.year} school year` : 'this school year';
    const reach = ctx.email
      ? `The easiest way to reach me is email: ${ctx.email}. I check it throughout the school day and will get back to you within one school day.`
      : `You can reach me anytime through the ${ctx.school} main office.`;

    return `Dear ${ctx.first}'s family,

My name is ${ctx.cm}, and I'm delighted to be ${ctx.first}'s case manager at ${ctx.school} for ${yearPhrase}. I wanted to reach out early so you know who I am and how to find me.

As ${ctx.first}'s case manager, I'm your main point of contact for everything related to the IEP. My job is to:

  •  Make sure ${ctx.first}'s accommodations and services are in place in every class.
  •  Track progress on IEP goals and share updates with you throughout the year.
  •  Coordinate ${ctx.first}'s annual review and any other IEP meetings, and prepare with you and ${ctx.first} beforehand.
  •  Be the person you call first with a question or concern — big or small.

You know ${ctx.first} better than anyone, and the plan works best when we build it together. If anything comes up at home — something that's working, something that isn't, or a question about anything school-related — please don't hesitate to reach out.

${reach}

I'm looking forward to a great year with ${ctx.first}.

Warmly,

${ctx.cm}
Case Manager, ${ctx.school}`;
  },

  // Drawer for the teacher intro letter: an attach toggle regenerates the text
  // with or without the accommodations appendix, so sending both as one piece
  // is a single checkbox — no copy-paste assembly.
  async _openCmIntro() {
    const ctx = await this._context();
    const hasAccomm = Array.isArray(ctx.s.accommodations) && ctx.s.accommodations.filter(Boolean).length > 0;
    const esc = window.aceUtils.escapeHtml;

    await window.aceModal.openDrawer({
      title: 'Intro letter to teachers',
      saveLabel: 'Copy to clipboard', cancelLabel: 'Close',
      bodyHTML: `
        <label class="doc-attach-row ${hasAccomm ? '' : 'doc-attach-disabled'}">
          <input type="checkbox" id="docAttachAccomm" ${hasAccomm ? 'checked' : 'disabled'} />
          <span>Attach ${esc(ctx.first)}'s accommodations one-pager${hasAccomm ? '' : ' <span class="muted">(none on file yet)</span>'}</span>
        </label>
        <p class="muted" style="font-size:13px;margin:0 0 10px;">Edit freely — Copy takes the current text. Toggling the attachment regenerates the letter.</p>
        <textarea id="docText" class="doc-textarea" rows="22">${esc(this._cmIntroLetter(ctx, hasAccomm))}</textarea>`,
      afterRender: (body) => {
        const box = body.querySelector('#docAttachAccomm');
        if (!box || box.disabled) return;
        box.addEventListener('change', () => {
          body.querySelector('#docText').value = this._cmIntroLetter(ctx, box.checked);
        });
      },
      onSave: async (body) => {
        await navigator.clipboard.writeText(body.querySelector('#docText').value);
        window.aceToast?.success('Copied to clipboard');
        return false;   // keep the drawer open so repeated copies work
      }
    });
  },

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
      const text = this._accommodationsText(ctx);
      if (!text) {
        window.aceToast?.error('Add at least one accommodation first');
        return;
      }
      await this._showDoc('Accommodations one-pager', text);
    }
  }
};

window.aceDocuments = aceDocuments;
