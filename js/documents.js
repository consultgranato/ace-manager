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

  // navigator.clipboard rejects on a denied permission or a non-secure context,
  // and an unhandled rejection here left the case manager believing a letter had
  // been copied when nothing had. Fall back to selecting the text so ⌘C works.
  async _copy(textarea) {
    try {
      await navigator.clipboard.writeText(textarea.value);
      window.aceToast?.success('Copied to clipboard');
    } catch (e) {
      textarea.focus();
      textarea.select();
      window.aceToast?.error('Copy was blocked — the text is selected, press ⌘C / Ctrl+C');
    }
  },

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
    const [profile, branding, user, year, svc] = await Promise.all([
      window.aceAuth.getProfileCached(),
      window.aceAuth.getBranding(),
      window.aceAuth.getUser(),
      window.aceUtils.currentSchoolYearLabel(),
      // Related services chosen at onboarding (or toggled on the profile). A
      // teacher who knows the student leaves for speech on Tuesdays reads a
      // mid-period exit as a schedule, not as avoidance.
      window.aceSupabase.from('services').select('service_type').eq('student_id', this._student.id)
    ]);
    return {
      s: this._student,
      services: [...new Set(((svc && svc.data) || []).map(r => r.service_type))].sort(),
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
      // Parent-facing and partly auto-generated (probe data flows in), so
      // copying requires an explicit case-manager review confirmation —
      // self-report data especially must not flow through unread.
      return this._showDoc('Quarterly progress report', await this._progressReport(ctx), { requireReview: true });
    }
  },

  async _showDoc(title, text, opts = {}) {
    await window.aceModal.openDrawer({
      title,
      saveLabel: 'Copy to clipboard', cancelLabel: 'Close',
      bodyHTML: `
        <p class="muted" style="font-size:13px;margin:0 0 10px;">Edit freely — Copy takes the current text.</p>
        <textarea id="docText" class="doc-textarea" rows="22">${window.aceUtils.escapeHtml(text)}</textarea>
        ${opts.requireReview ? `
          <label class="doc-attach-row" style="margin-top:10px;">
            <input type="checkbox" id="docReviewed" />
            <span>I have reviewed this report — including any self-reported data — and it is ready for families</span>
          </label>` : ''}`,
      onSave: async (body) => {
        const gate = body.querySelector('#docReviewed');
        if (gate && !gate.checked) {
          window.aceToast?.error('Review the report and check the confirmation first');
          return false;
        }
        await this._copy(body.querySelector('#docText'));
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
  •  These are required. They are part of a legal document, not a list of suggestions.
  •  The full IEP — goals, present levels, and the rest of the accommodations page — is in Embrace. Read it if you have not.
  •  If one of these is not working in your room, tell me before you stop doing it and we will find something that does.
  •  Anything you notice, good or bad: ${ctx.cm}${ctx.email ? ` (${ctx.email})` : ''}.`;
  },

  // One sentence naming the student's related services and BIP, or nothing at
  // all when there are none — an empty "Services: none" line is noise.
  _servicesLine(ctx) {
    const list = ctx.services || [];
    const bip = !!(ctx.s && ctx.s.has_bip);
    if (!list.length && !bip) return '';
    const lines = [];
    if (list.length) {
      lines.push(`${ctx.first} also receives ${this._naturalList(list)} services, so expect some scheduled pull-outs during the week.`);
    }
    if (bip) {
      lines.push(`There is a behavior intervention plan in place. It is in Embrace with the IEP and is worth reading before you need it.`);
    }
    return `\n\n${lines.join(' ')}`;
  },

  _naturalList(arr) {
    const a = (arr || []).filter(Boolean);
    if (a.length <= 1) return a[0] || '';
    if (a.length === 2) return `${a[0]} and ${a[1]}`;
    return `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
  },

  // Case manager → the student's general education teachers.
  //
  // Deliberately plain. The earlier draft had the tells of machine-written
  // prose — a tidy tricolon of bullets, "genuinely", "actually works", a warm
  // sign-off doing no work — and teachers skim past that. This one says who,
  // what, where the IEP lives, and what is being asked, then stops.
  _cmIntroLetter(ctx, attachAccommodations) {
    const reach = ctx.email
      ? `Email is best: ${ctx.email}.`
      : `You can reach me through the ${ctx.school} main office.`;
    const yearPhrase = ctx.year ? ` this year (${ctx.year})` : ' this year';
    const accomm = attachAccommodations ? this._accommodationsText(ctx) : '';
    const services = this._servicesLine(ctx);

    let letter = `Hi,

I'm ${ctx.cm}, the case manager for ${ctx.name}, who is in your class${yearPhrase}.

${ctx.first}'s IEP is in Embrace. If you have not opened it, it is worth ten minutes — the accommodations, goals, and present levels are all there, and it will tell you more about what to expect than this letter can. If you cannot find it or do not have access, tell me and I will sort it out.${services}

Two things I need from you:

1. Use the accommodations. They are required, not suggestions. If one is not working in your room, tell me before you drop it and we will find something that does.
2. Tell me early. If something is going wrong — grades, attendance, behavior, or just a feeling that this is not landing — I would rather hear it in October than in April. Tell me what is going well too; that goes in the IEP, and it is the part families read first.

Before ${ctx.first}'s IEP meeting I will send a short form asking what you are seeing. It takes a few minutes and I do use it.

${reach}

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

I'm ${ctx.cm}, ${ctx.first}'s case manager at ${ctx.school} for ${yearPhrase}. I wanted you to have my name and number before you need them.

What I do: I make sure ${ctx.first}'s accommodations are actually happening in every class, I track progress on the IEP goals and send you updates during the year, and I run the annual review. If something about school is not working, I am the person to call first.

What I will ask of you: before the IEP meeting I will send a short form asking what you are seeing at home — what is going well, what worries you, and what you want for ${ctx.first} after high school. You know things about your child that we do not, and that form is how they get into the plan rather than staying in a conversation.

You do not have to wait for that form, or for a problem. If you have a question about anything, call.

${reach}

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
        await this._copy(body.querySelector('#docText'));
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
      const all = byGoal[g.id] || [];
      const pts = all.filter(e => e.value != null);
      const selfReport = pts.some(e => (e.note || '').startsWith('Probe (self-report)'));
      const probeCount = pts.filter(e => (e.note || '').startsWith('Probe')).length;
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
        if (probeCount) {
          progress += selfReport
            ? ` ${probeCount} of these data point${probeCount === 1 ? ' comes' : 's come'} from student self-report check-ins, which I have reviewed alongside classroom observation.`
            : ` ${probeCount} of these data point${probeCount === 1 ? ' comes' : 's come'} from independent skills check-ins completed by ${ctx.first}.`;
        }
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
