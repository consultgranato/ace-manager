// =============================================================
// Ace Manager — Transition Assessment (case-manager view)
// =============================================================

const aceTransition = {
  makeToken() {
    const arr = new Uint8Array(18);
    crypto.getRandomValues(arr);
    return 'ta-' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  cycleLabel(student) {
    const yr = window.aceUtils.currentSchoolYear ? window.aceUtils.currentSchoolYear() : '';
    return `${yr ? yr + ' ' : ''}Transition`.trim();
  },

  linkURL(token) {
    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
    return `${window.location.origin}${basePath}pages/transition-form.html?t=${token}`;
  },

  // Get the most recent assessment for the student (active or the latest completed)
  async getLatest(studentId) {
    const { data } = await window.aceSupabase
      .from('transition_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1);
    return data && data[0] ? data[0] : null;
  },

  async generateLink(student) {
    const user = await window.aceAuth.getUser();
    if (!user) return null;

    // Supersede any existing active, non-completed assessment
    await window.aceSupabase
      .from('transition_assessments')
      .update({ active: false })
      .eq('student_id', student.id)
      .eq('active', true)
      .neq('status', 'completed');

    let meetingId = null;
    if (window.aceMeetings) {
      const active = await window.aceMeetings.getActiveMeeting(student.id);
      if (active && (active.state === 'upcoming' || active.state === 'past_not_completed')) {
        meetingId = active.meeting.id;
      }
    }

    const token = this.makeToken();
    const { data, error } = await window.aceSupabase
      .from('transition_assessments')
      .insert({
        student_id: student.id,
        case_manager_id: user.id,
        meeting_id: meetingId,
        token,
        cycle_label: this.cycleLabel(student),
        active: true,
        status: 'pending'
      })
      .select()
      .single();

    if (error) { if (window.aceToast) window.aceToast.error('Could not generate link'); return null; }
    if (window.aceToast) window.aceToast.success('Assessment link generated');
    return data;
  },

  async render(hostEl, student) {
    if (!hostEl) return;
    const esc = window.aceUtils.escapeHtml;
    const latest = await this.getLatest(student.id);

    const isCompleted = latest && latest.status === 'completed' && latest.payload && latest.payload.version;
    const isPending = latest && latest.active && latest.status !== 'completed';

    let html = '<div class="tf-section">';

    if (isPending) {
      html += `
        <div class="tf-link-box">
          <div class="tf-link-label">Student assessment link · ${esc(latest.cycle_label || 'Current cycle')}</div>
          <div class="tf-link-row">
            <input type="text" readonly class="tf-link-input" value="${esc(this.linkURL(latest.token))}" id="taLinkInput" />
            <button class="btn-secondary tf-copy-btn" id="taCopyBtn">${window.aceIcons.copy(14)} Copy</button>
          </div>
          <div class="tf-link-actions">
            <button class="tf-regen-btn" id="taRegenBtn">${window.aceIcons.rotateCcw(13)} Regenerate link</button>
            <span class="tf-regen-hint muted">Single-use. Regenerating deactivates the current link.</span>
          </div>
        </div>
        <div class="pf-waiting muted">${window.aceIcons.compass(15)} Waiting for ${esc(student.first_name)} to complete the assessment…</div>
      `;
    } else if (isCompleted) {
      html += `
        <div class="ta-completed-banner">${window.aceIcons.check(14)} Completed ${latest.completed_at ? esc(window.aceUtils.formatShortDate(latest.completed_at.split('T')[0])) : ''}</div>
        ${this.resultHTML(latest.payload)}
        <div class="tf-link-actions" style="margin-top:14px;">
          <button class="tf-regen-btn" id="taNewBtn">${window.aceIcons.rotateCcw(13)} Start a new assessment</button>
          <span class="tf-regen-hint muted">Creates a fresh single-use link for the student.</span>
        </div>
      `;
    } else {
      html += `
        <div class="tf-generate">
          <p class="muted">Generate a link for ${esc(student.first_name)} to complete their transition self-assessment. Send it directly to the student — their answers flow back here automatically.</p>
          <button class="btn-primary" id="taGenBtn">${window.aceIcons.compass(15)} Generate Assessment Link</button>
        </div>
      `;
    }
    html += '</div>';
    hostEl.innerHTML = html;

    const genBtn = hostEl.querySelector('#taGenBtn');
    if (genBtn) genBtn.addEventListener('click', async () => {
      const l = await this.generateLink(student);
      if (l) this.render(hostEl, student);
    });

    const newBtn = hostEl.querySelector('#taNewBtn');
    if (newBtn) newBtn.addEventListener('click', async () => {
      const confirmed = await window.aceModal.openModal({
        title: 'Start a new assessment?',
        message: `This creates a fresh link for ${esc(student.first_name)}. The completed assessment above is kept for your records.`,
        confirmLabel: 'Generate New Link', cancelLabel: 'Cancel', variant: 'default', onConfirm: async () => {}
      });
      if (confirmed) { const l = await this.generateLink(student); if (l) this.render(hostEl, student); }
    });

    const regenBtn = hostEl.querySelector('#taRegenBtn');
    if (regenBtn) regenBtn.addEventListener('click', async () => {
      const confirmed = await window.aceModal.openModal({
        title: 'Regenerate assessment link?',
        message: 'The current link will stop working. If the student already started, their progress will not carry over.',
        confirmLabel: 'Regenerate', cancelLabel: 'Cancel', variant: 'default', onConfirm: async () => {}
      });
      if (confirmed) { const l = await this.generateLink(student); if (l) this.render(hostEl, student); }
    });

    const copyBtn = hostEl.querySelector('#taCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      const input = hostEl.querySelector('#taLinkInput');
      try { await navigator.clipboard.writeText(input.value); if (window.aceToast) window.aceToast.success('Link copied'); }
      catch (e) { input.select(); document.execCommand('copy'); if (window.aceToast) window.aceToast.success('Link copied'); }
    });
  },

  resultHTML(p) {
    const esc = window.aceUtils.escapeHtml;
    const rows = [];
    if (p.postSecondaryGoal) rows.push(['Post-secondary goal', p.postSecondaryGoal]);
    if (p.careerInterest) rows.push(['Career interest', p.careerInterest]);
    if (typeof p.overallReadinessScore === 'number') rows.push(['Overall readiness', p.overallReadinessScore + '%']);
    if (Array.isArray(p.studentStrengths) && p.studentStrengths.length) rows.push(['Strengths', p.studentStrengths.join(', ')]);
    if (Array.isArray(p.learningStyles) && p.learningStyles.length) rows.push(['Learns best by', p.learningStyles.join(', ')]);
    if (Array.isArray(p.schoolChallenges) && p.schoolChallenges.length) rows.push(['Challenges', p.schoolChallenges.join(', ')]);
    if (p.independentLiving) rows.push(['Independent living', p.independentLiving]);
    if (Array.isArray(p.selfAdvocacyActions) && p.selfAdvocacyActions.length) rows.push(['Self-advocacy', p.selfAdvocacyActions.join(', ')]);
    if (Array.isArray(p.outsideAgencies) && p.outsideAgencies.length) rows.push(['Outside agencies', p.outsideAgencies.join(', ')]);
    if (p.studentVoice) rows.push(['In their words', p.studentVoice]);
    return `<dl class="tf-detail-fields">${rows.map(([k,v]) => `<div class="tf-detail-pair"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  }
};

window.aceTransition = aceTransition;
