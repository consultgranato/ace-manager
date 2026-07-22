// =============================================================
// Ace Manager — Teacher Feedback (case-manager view)
// =============================================================
// Renders into the Teacher Feedback card on the student profile.
// Generates/regenerates the shared link, shows per-course status,
// displays decoded received feedback.
// =============================================================

const aceTeacherFeedback = {

  makeToken() {
    return window.aceUtils.makeShareToken('tf');
  },

  async cycleLabel(student) {
    const yr = await window.aceUtils.currentSchoolYearLabel();
    let kind = 'Feedback';
    if (student.annual_review_date) kind = 'Annual Review';
    else if (student.reeval_due_date) kind = 'Re-evaluation';
    return `${yr ? yr + ' ' : ''}${kind}`.trim();
  },

  linkURL(token) {
    return window.aceUtils.shareLinkURL(token);
  },

  async getActiveLink(studentId) {
    const { data } = await window.aceSupabase
      .from('feedback_links')
      .select('*')
      .eq('student_id', studentId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    return data && data[0] ? data[0] : null;
  },

  async getReceivedFeedback(linkId) {
    if (!linkId) return [];
    const { data } = await window.aceSupabase
      .from('teacher_feedback')
      .select('*')
      .eq('link_id', linkId)
      .eq('status', 'completed')
      .order('course_name', { ascending: true });
    return data || [];
  },

  // Generate (or regenerate, superseding the old) a shared link
  async generateLink(student) {
    const user = await window.aceAuth.getUser();
    if (!user) return null;

    // Supersede any existing active link
    await window.aceSupabase
      .from('feedback_links')
      .update({ active: false })
      .eq('student_id', student.id)
      .eq('active', true);

    // Find an active, non-completed meeting to attach (if any)
    let meetingId = null;
    if (window.aceMeetings) {
      const active = await window.aceMeetings.getActiveMeeting(student.id);
      if (active && (active.state === 'upcoming' || active.state === 'past_not_completed')) {
        meetingId = active.meeting.id;
      }
    }

    const token = this.makeToken();
    const { data, error } = await window.aceSupabase
      .from('feedback_links')
      .insert({
        student_id: student.id,
        case_manager_id: user.id,
        meeting_id: meetingId,
        token,
        cycle_label: await this.cycleLabel(student),
        active: true
      })
      .select()
      .single();

    if (error) {
      if (window.aceToast) window.aceToast.error('Could not generate link');
      return null;
    }
    if (window.aceToast) window.aceToast.success('Feedback link generated');
    return data;
  },

  async render(hostEl, student) {
    if (!hostEl) return;
    const esc = window.aceUtils.escapeHtml;

    const academicCourses = (student.courses || []).filter(c => c.is_academic);

    // No academic courses → guide to add them first
    if (academicCourses.length === 0) {
      hostEl.innerHTML = `
        <div class="tf-empty">
          <p class="muted">No academic classes on this student yet. Add classes (with the academic flag) to collect teacher feedback.</p>
          <button class="btn-secondary" id="tfEditStudentBtn">${window.aceIcons.edit(14)} Edit Student</button>
        </div>
      `;
      const btn = hostEl.querySelector('#tfEditStudentBtn');
      if (btn) btn.addEventListener('click', async () => {
        const result = await window.aceEditStudent.open(student);
        if (result && result.confirmed && result.result) {
          this.render(hostEl, result.result);
        }
      });
      return;
    }

    const link = await this.getActiveLink(student.id);
    const received = link ? await this.getReceivedFeedback(link.id) : [];

    // Build per-course status
    const byCourse = {};
    received.forEach(r => {
      if (!byCourse[r.course_name]) byCourse[r.course_name] = [];
      byCourse[r.course_name].push(r);
    });

    const courseRows = academicCourses.map(c => {
      const subs = byCourse[c.name] || [];
      const statusHTML = subs.length > 0
        ? `<span class="tf-status tf-status-received">${window.aceIcons.check(13)} ${subs.length === 1 ? 'Received' : subs.length + ' received'}</span>`
        : `<span class="tf-status tf-status-waiting">Waiting</span>`;
      return `
        <div class="tf-course-row">
          <div class="tf-course-name">${esc(c.name)}</div>
          ${statusHTML}
        </div>
        ${subs.map(s => this.feedbackDetailHTML(s)).join('')}
      `;
    }).join('');

    const linkSection = link
      ? `
        <div class="tf-link-box">
          <div class="tf-link-label">Shared feedback link · ${esc(link.cycle_label || 'Current cycle')}</div>
          <div class="tf-link-row">
            <input type="text" readonly class="tf-link-input" value="${esc(this.linkURL(link.token))}" id="tfLinkInput" />
            <button class="btn-secondary tf-copy-btn" id="tfCopyBtn">${window.aceIcons.copy(14)} Copy</button>
          </div>
          <div class="tf-link-actions">
            <button class="tf-regen-btn" id="tfRegenBtn">${window.aceIcons.rotateCcw(13)} Regenerate link</button>
            <span class="tf-regen-hint muted">Regenerating deactivates the current link.</span>
          </div>
        </div>
      `
      : `
        <div class="tf-generate">
          <p class="muted">Generate one shared link, then send it to the student's teachers — cc the whole team. Each teacher picks their class and submits.</p>
          <button class="btn-primary" id="tfGenBtn">${window.aceIcons.graduationCap(15)} Generate Feedback Link</button>
        </div>
      `;

    hostEl.innerHTML = `
      <div class="tf-section">
        ${linkSection}
        <div class="tf-courses">
          <div class="tf-courses-header">Academic classes</div>
          ${courseRows}
        </div>
      </div>
    `;

    // Wire actions
    const genBtn = hostEl.querySelector('#tfGenBtn');
    if (genBtn) genBtn.addEventListener('click', async () => {
      const newLink = await this.generateLink(student);
      if (newLink) this.render(hostEl, student);
    });

    const regenBtn = hostEl.querySelector('#tfRegenBtn');
    if (regenBtn) regenBtn.addEventListener('click', async () => {
      const confirmed = await window.aceModal.openModal({
        title: 'Regenerate feedback link?',
        message: 'The current link will stop working. Any teacher who still has it will need the new one. Feedback already received is kept.',
        confirmLabel: 'Regenerate',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {}
      });
      if (confirmed) {
        const newLink = await this.generateLink(student);
        if (newLink) this.render(hostEl, student);
      }
    });

    const copyBtn = hostEl.querySelector('#tfCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      const input = hostEl.querySelector('#tfLinkInput');
      try {
        await navigator.clipboard.writeText(input.value);
        if (window.aceToast) window.aceToast.success('Link copied');
      } catch (e) {
        input.select();
        document.execCommand('copy');
        if (window.aceToast) window.aceToast.success('Link copied');
      }
    });
  },

  // Decode a TF1 payload into a readable block
  feedbackDetailHTML(row) {
    const esc = window.aceUtils.escapeHtml;
    const p = row.payload || {};
    const fields = [];
    if (p.overallPerformance) fields.push(['Overall', p.overallPerformance]);
    if (p.workCompletion) fields.push(['Work completion', p.workCompletion]);
    if (p.participationLevel) fields.push(['Participation', p.participationLevel]);
    if (p.greatestStrength) fields.push(['Strength', p.greatestStrength]);
    if (p.primaryConcern) fields.push(['Concern', p.primaryConcern]);
    if (Array.isArray(p.effectiveStrategies) && p.effectiveStrategies.length)
      fields.push(['Effective strategies', p.effectiveStrategies.join(', ')]);
    if (p.additionalNotes) fields.push(['Notes', p.additionalNotes]);

    return `
      <div class="tf-detail">
        <div class="tf-detail-teacher">${esc(row.teacher_name || 'Teacher')}</div>
        <dl class="tf-detail-fields">
          ${fields.map(([k, v]) => `<div class="tf-detail-pair"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
      </div>
    `;
  }
};

window.aceTeacherFeedback = aceTeacherFeedback;
