// =============================================================
// Ace Manager — Parent Feedback (case-manager view)
// =============================================================

const aceParentFeedback = {
  makeToken() {
    const arr = new Uint8Array(18);
    crypto.getRandomValues(arr);
    return 'pf-' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  },

  cycleLabel(student) {
    const yr = window.aceUtils.currentSchoolYear ? window.aceUtils.currentSchoolYear() : '';
    let kind = 'Feedback';
    if (student.annual_review_date) kind = 'Annual Review';
    else if (student.reeval_due_date) kind = 'Re-evaluation';
    return `${yr ? yr + ' ' : ''}${kind}`.trim();
  },

  linkURL(token) {
    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
    return `${window.location.origin}${basePath}pages/parent-form.html?t=${token}`;
  },

  async getActiveLink(studentId) {
    const { data } = await window.aceSupabase
      .from('parent_feedback')
      .select('*')
      .eq('student_id', studentId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    return data && data[0] ? data[0] : null;
  },

  async generateLink(student) {
    const user = await window.aceAuth.getUser();
    if (!user) return null;

    // Supersede existing active parent link(s)
    await window.aceSupabase
      .from('parent_feedback')
      .update({ active: false })
      .eq('student_id', student.id)
      .eq('active', true);

    let meetingId = null;
    if (window.aceMeetings) {
      const active = await window.aceMeetings.getActiveMeeting(student.id);
      if (active && (active.state === 'upcoming' || active.state === 'past_not_completed')) {
        meetingId = active.meeting.id;
      }
    }

    const token = this.makeToken();
    const { data, error } = await window.aceSupabase
      .from('parent_feedback')
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

    if (error) {
      if (window.aceToast) window.aceToast.error('Could not generate link');
      return null;
    }
    if (window.aceToast) window.aceToast.success('Parent link generated');
    return data;
  },

  async render(hostEl, student) {
    if (!hostEl) return;
    const esc = window.aceUtils.escapeHtml;
    const link = await this.getActiveLink(student.id);
    const hasResponse = link && link.status === 'completed' && link.payload && link.payload.version;

    const linkSection = link
      ? `
        <div class="tf-link-box">
          <div class="tf-link-label">Parent feedback link · ${esc(link.cycle_label || 'Current cycle')}</div>
          <div class="tf-link-row">
            <input type="text" readonly class="tf-link-input" value="${esc(this.linkURL(link.token))}" id="pfLinkInput" />
            <button class="btn-secondary tf-copy-btn" id="pfCopyBtn">${window.aceIcons.copy(14)} Copy</button>
          </div>
          <div class="tf-link-actions">
            <button class="tf-regen-btn" id="pfRegenBtn">${window.aceIcons.rotateCcw(13)} Regenerate link</button>
            <span class="tf-regen-hint muted">Regenerating deactivates the current link.</span>
          </div>
        </div>
      `
      : `
        <div class="tf-generate">
          <p class="muted">Generate a link to send to ${esc(student.first_name)}'s parent or guardian. They answer five short questions about home, hopes, and concerns.</p>
          <button class="btn-primary" id="pfGenBtn">${window.aceIcons.usersRound(15)} Generate Parent Link</button>
        </div>
      `;

    const responseSection = hasResponse
      ? `
        <div class="pf-response">
          <div class="pf-response-header">
            <span class="tf-status tf-status-received">${window.aceIcons.check(13)} Response received</span>
            ${link.payload.parentName ? `<span class="pf-parent-name">from ${esc(link.payload.parentName)}</span>` : ''}
          </div>
          ${this.responseDetailHTML(link.payload)}
        </div>
      `
      : (link ? `<div class="pf-waiting muted">${window.aceIcons.usersRound(15)} Waiting for parent response…</div>` : '');

    hostEl.innerHTML = `<div class="tf-section">${linkSection}${responseSection}</div>`;

    const genBtn = hostEl.querySelector('#pfGenBtn');
    if (genBtn) genBtn.addEventListener('click', async () => {
      const l = await this.generateLink(student);
      if (l) this.render(hostEl, student);
    });

    const regenBtn = hostEl.querySelector('#pfRegenBtn');
    if (regenBtn) regenBtn.addEventListener('click', async () => {
      const confirmed = await window.aceModal.openModal({
        title: 'Regenerate parent link?',
        message: 'The current link will stop working. Any response already received is kept.',
        confirmLabel: 'Regenerate',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {}
      });
      if (confirmed) {
        const l = await this.generateLink(student);
        if (l) this.render(hostEl, student);
      }
    });

    const copyBtn = hostEl.querySelector('#pfCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      const input = hostEl.querySelector('#pfLinkInput');
      try { await navigator.clipboard.writeText(input.value); if (window.aceToast) window.aceToast.success('Link copied'); }
      catch (e) { input.select(); document.execCommand('copy'); if (window.aceToast) window.aceToast.success('Link copied'); }
    });
  },

  responseDetailHTML(p) {
    const esc = window.aceUtils.escapeHtml;
    const rows = [];
    if (p.hopesGoals) rows.push(['Hopes & goals', p.hopesGoals]);
    if (p.whatsGoingWell) rows.push(['Going well at home', p.whatsGoingWell]);
    if (p.biggestConcerns) rows.push(['Biggest concerns', p.biggestConcerns]);
    if (Array.isArray(p.supportAreas) && p.supportAreas.length) rows.push(['Support areas', p.supportAreas.join(', ')]);
    if (p.anythingElse) rows.push(['Anything else', p.anythingElse]);
    return `
      <dl class="tf-detail-fields pf-detail-fields">
        ${rows.map(([k, v]) => `<div class="tf-detail-pair"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    `;
  }
};

window.aceParentFeedback = aceParentFeedback;
