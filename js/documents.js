// =============================================================
// Ace Manager — Documents card (student profile)
// =============================================================
// Generates the recurring paperwork as editable text in a drawer with one
// Copy button — the same copy-out workflow as the PLAAFP (the system of
// record stays Embrace; Ace Manager does the drafting). Every template pulls
// live data: student, case manager, org branding, next meeting, goals +
// progress entries, services, accommodations.
//
// The accommodations one-pager doubles as the editor for the underlying
// students.accommodations list (chips, saved on generate).

const aceDocuments = {

  async render(host, student) {
    if (!host) return;
    this._host = host; this._student = student;
    const docs = [
      { id: 'intro',   label: 'Parent introduction letter', hint: 'start-of-year hello from the case manager' },
      { id: 'notice',  label: 'Meeting notice',             hint: '10-day parent notification for the next meeting' },
      { id: 'accomm',  label: 'Accommodations one-pager',   hint: 'for gen-ed teachers' },
      { id: 'progress',label: 'Quarterly progress report',  hint: 'from goal data' },
      { id: 'pwn',     label: 'Prior Written Notice',       hint: 'template with student data filled in' }
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
    const [profile, branding, meetingsResp] = await Promise.all([
      window.aceAuth.getProfileCached(),
      window.aceAuth.getBranding(),
      window.aceSupabase.from('meetings').select('*')
        .eq('student_id', this._student.id).eq('completed', false)
        .gte('scheduled_date', window.aceUtils.todayISO())
        .order('scheduled_date', { ascending: true }).limit(1)
    ]);
    return {
      s: this._student,
      name: `${this._student.first_name} ${this._student.last_initial}.`,
      cm: (profile && profile.full_name) || 'Case Manager',
      school: branding.school_name || 'our school',
      nextMeeting: (meetingsResp.data && meetingsResp.data[0]) || null,
      today: window.aceUtils.formatLongDate(window.aceUtils.todayISO())
    };
  },

  async _open(docId) {
    if (docId === 'accomm') return this._openAccommodations();
    const ctx = await this._context();
    let title = '', text = '';

    if (docId === 'intro') {
      title = 'Parent introduction letter';
      text = this._introLetter(ctx);
    } else if (docId === 'notice') {
      title = 'Meeting notice';
      if (!ctx.nextMeeting) {
        window.aceToast?.error('No upcoming meeting is scheduled');
        return;
      }
      text = this._meetingNotice(ctx);
    } else if (docId === 'progress') {
      title = 'Quarterly progress report';
      text = await this._progressReport(ctx);
    } else if (docId === 'pwn') {
      title = 'Prior Written Notice';
      text = this._pwn(ctx);
    }

    await this._showDoc(title, text);
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

  _introLetter(ctx) {
    return `Dear Parent/Guardian,

My name is ${ctx.cm}, and I am pleased to be ${ctx.name.replace(/\.$/, '')}'s case manager at ${ctx.school} for the ${window.aceUtils.currentSchoolYear()} school year.

As case manager, I coordinate your student's IEP services, monitor progress toward IEP goals, and serve as your main point of contact with the school. Please reach out any time with questions or concerns about your student's program, schedule, or progress — I'm glad to help.

Over the coming weeks I will be gathering input from your student's teachers as we prepare for this year's annual review. You will receive a link to share your own perspective as well; your input is an important part of the IEP.

I look forward to partnering with you this year.

Sincerely,
${ctx.cm}
${ctx.school}`;
  },

  _meetingNotice(ctx) {
    const m = ctx.nextMeeting;
    const when = window.aceUtils.formatLongDate(m.scheduled_date) + (m.scheduled_time ? ` at ${m.scheduled_time}` : '');
    return `NOTIFICATION OF CONFERENCE

Date of notice: ${ctx.today}
Student: ${ctx.name}
Meeting type: ${m.meeting_type}

Dear Parent/Guardian,

You are invited to attend an IEP meeting for ${ctx.name.replace(/\.$/, '')} scheduled for ${when} at ${ctx.school}.

The purpose of this meeting is: ${m.meeting_type}.

The following people are expected to attend: ${m.attendees || '[list team members]'}.

You have the right to bring anyone with knowledge or special expertise about your student. If you cannot attend at this time, or if you need an interpreter or other accommodation, please contact me and we will make arrangements.

This notice is being provided at least 10 days before the meeting. Enclosed you will find a copy of your procedural safeguards; please contact me with any questions about your rights.

Sincerely,
${ctx.cm}
${ctx.school}`;
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

  _pwn(ctx) {
    return `PRIOR WRITTEN NOTICE

Date: ${ctx.today}
Student: ${ctx.name}
School: ${ctx.school}
Case manager: ${ctx.cm}

1. Action proposed or refused by the district:
[Describe the action the district proposes or refuses to initiate/change — e.g., evaluation, eligibility, placement, or provision of FAPE.]

2. Explanation of why the district proposes or refuses the action:
[State the reasons.]

3. Description of each evaluation procedure, assessment, record, or report used as a basis for this decision:
[List data sources — e.g., teacher input, progress monitoring data, evaluations.]

4. Other options considered and why they were rejected:
[List options and reasons.]

5. Other factors relevant to the decision:
[Note any.]

Your rights: As the parent/guardian of a student with a disability, you are protected by procedural safeguards under the IDEA. A copy of the Illinois procedural safeguards is available from the school at any time and is enclosed with this notice. If you have questions, or if you disagree with this decision, please contact me — you also have the right to pursue mediation or a due process hearing.

${ctx.cm}
${ctx.school}`;
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
