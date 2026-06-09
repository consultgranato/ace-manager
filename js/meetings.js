// =============================================================
// Ace Manager — Meetings Module
// =============================================================
// Handles: scheduling new meetings, displaying meetings on profile,
// generating prep checklists, refreshing on changes.
// =============================================================

const aceMeetings = {

  // Default prep checklist items applied when a meeting is created.
  // The `auto` flag indicates items that will be auto-checked when
  // the corresponding action is taken elsewhere in the app (Phase 3+).
  PREP_CHECKLIST_DEFAULT: [
    { label: 'Send teacher feedback links', completed: false, auto: true },
    { label: 'Send parent feedback survey', completed: false, auto: true },
    { label: 'Administer transition assessment', completed: false, auto: true },
    { label: 'Generate IEP draft from latest data', completed: false, auto: true },
    { label: 'Print or compile materials for the meeting', completed: false, auto: false }
  ],

  async openScheduleDrawer(student) {
    const today = new Date().toISOString().split('T')[0];
    const bodyHTML = `
      <form id="scheduleMeetingForm" class="student-form" style="gap:14px;">
        <div class="form-row">
          <label>
            <span class="label-text">Meeting Type <span class="required">*</span></span>
            <select id="meetingType" required>
              <option value="" disabled selected>Select type…</option>
              <option value="annual">Annual Review</option>
              <option value="reeval">Re-evaluation</option>
              <option value="initial">Initial Eligibility</option>
              <option value="amendment">Amendment</option>
              <option value="transition">Transition Planning</option>
            </select>
          </label>
        </div>

        <div class="form-row two-col">
          <label>
            <span class="label-text">Date <span class="required">*</span></span>
            <input type="date" id="meetingDate" required min="${today}" />
          </label>
          <label>
            <span class="label-text">Time <span class="optional">(optional)</span></span>
            <input type="time" id="meetingTime" />
          </label>
        </div>

        <div class="form-row">
          <label>
            <span class="label-text">Attendees <span class="optional">(optional)</span></span>
            <input type="text" id="meetingAttendees" placeholder="e.g., parent, gen ed teacher, SLP, psych" />
            <span class="field-hint">Anyone besides you who will be at the meeting.</span>
          </label>
        </div>

        <div class="form-row">
          <label>
            <span class="label-text">Notes <span class="optional">(optional)</span></span>
            <textarea id="meetingNotes" rows="3" placeholder="Quick context before the meeting — agenda, things to remember, etc."></textarea>
          </label>
        </div>

        <div class="meeting-preview muted">
          <strong>Pre-meeting prep checklist</strong> will auto-generate with these items:
          <ul style="margin:6px 0 0; padding-left:18px;">
            ${this.PREP_CHECKLIST_DEFAULT.map(item =>
              `<li>${window.aceUtils.escapeHtml(item.label)}${item.auto ? ' <em style="color:var(--purple-primary);">(auto)</em>' : ''}</li>`
            ).join('')}
          </ul>
        </div>

        <div id="scheduleErrorMsg" class="error-msg" style="display:none;"></div>
      </form>
    `;

    const result = await window.aceModal.openDrawer({
      title: `Schedule Meeting for ${student.first_name} ${student.last_initial}.`,
      bodyHTML,
      saveLabel: 'Schedule Meeting',
      cancelLabel: 'Cancel',
      onSave: async (drawerBody) => {
        return await this.handleScheduleSave(drawerBody, student);
      }
    });

    return result;
  },

  async handleScheduleSave(drawerBody, student) {
    const errEl = drawerBody.querySelector('#scheduleErrorMsg');
    errEl.style.display = 'none';

    const meetingType = drawerBody.querySelector('#meetingType').value;
    const meetingDate = drawerBody.querySelector('#meetingDate').value;
    const meetingTime = drawerBody.querySelector('#meetingTime').value || null;
    const attendees = drawerBody.querySelector('#meetingAttendees').value.trim();
    const notes = drawerBody.querySelector('#meetingNotes').value.trim();

    if (!meetingType || !meetingDate) {
      errEl.textContent = 'Meeting type and date are required.';
      errEl.style.display = 'block';
      return false;
    }

    const prepChecklist = this.PREP_CHECKLIST_DEFAULT.map(item => ({
      label: item.label,
      completed: false,
      completed_at: null,
      auto: item.auto
    }));

    const { data, error } = await window.aceSupabase
      .from('meetings')
      .insert({
        student_id: student.id,
        meeting_type: meetingType,
        scheduled_date: meetingDate,
        scheduled_time: meetingTime,
        attendees: attendees,
        meeting_notes: notes,
        completed: false,
        prep_checklist: prepChecklist,
        followup_checklist: []
      })
      .select()
      .single();

    if (error) {
      errEl.textContent = 'Could not schedule meeting: ' + error.message;
      errEl.style.display = 'block';
      return false;
    }

    if (window.aceToast) window.aceToast.success('Meeting scheduled');
    return data;
  },

  async getUpcomingMeeting(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await window.aceSupabase
      .from('meetings')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', false)
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(1);

    if (error) {
      console.error('getUpcomingMeeting error:', error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  },

  async togglePrepItem(meetingId, itemIndex, completed) {
    const { data: meeting, error: fetchErr } = await window.aceSupabase
      .from('meetings')
      .select('prep_checklist')
      .eq('id', meetingId)
      .single();

    if (fetchErr || !meeting) {
      if (window.aceToast) window.aceToast.error('Could not update checklist');
      return false;
    }

    const checklist = (meeting.prep_checklist || []).map((item, i) => {
      if (i !== itemIndex) return item;
      return {
        ...item,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      };
    });

    const { error: updateErr } = await window.aceSupabase
      .from('meetings')
      .update({ prep_checklist: checklist })
      .eq('id', meetingId);

    if (updateErr) {
      if (window.aceToast) window.aceToast.error('Could not save change');
      return false;
    }

    return true;
  },

  async renderMeetingSection(targetEl, student) {
    if (!targetEl) return;

    const meeting = await this.getUpcomingMeeting(student.id);

    if (!meeting) {
      targetEl.innerHTML = `
        <div class="meeting-empty">
          <p class="muted">No meeting scheduled.</p>
          <button class="btn-primary" id="scheduleMeetingBtn">
            ${window.aceIcons.calendar(15)} Schedule Meeting
          </button>
        </div>
      `;
      const btn = targetEl.querySelector('#scheduleMeetingBtn');
      if (btn) {
        btn.addEventListener('click', async () => {
          const result = await this.openScheduleDrawer(student);
          if (result && result.confirmed) {
            this.renderMeetingSection(targetEl, student);
          }
        });
      }
      return;
    }

    const dateLabel = window.aceUtils.formatLongDate(meeting.scheduled_date);
    const daysUntil = window.aceUtils.daysUntil(meeting.scheduled_date);
    const dayLabel = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
    const timeLabel = meeting.scheduled_time ? ` at ${this.formatTime(meeting.scheduled_time)}` : '';

    const checklist = meeting.prep_checklist || [];
    const completedCount = checklist.filter(i => i.completed).length;

    targetEl.innerHTML = `
      <div class="meeting-section">
        <div class="meeting-header">
          <div>
            <div class="meeting-type-pill">${this.meetingTypeLabel(meeting.meeting_type)}</div>
            <div class="meeting-date-line">${dateLabel}${timeLabel} <span class="muted">· ${dayLabel}</span></div>
          </div>
          <button class="ace-btn-secondary meeting-mark-btn" id="markCompleteBtn" ${daysUntil > 0 ? 'disabled title="Available on or after the meeting date"' : ''}>
            ${window.aceIcons.check(14)} Mark Complete
          </button>
        </div>

        ${meeting.attendees ? `<div class="meeting-attendees"><strong>Attendees:</strong> ${window.aceUtils.escapeHtml(meeting.attendees)}</div>` : ''}
        ${meeting.meeting_notes ? `<div class="meeting-notes-display">${window.aceUtils.escapeHtml(meeting.meeting_notes)}</div>` : ''}

        <div class="prep-checklist">
          <div class="prep-checklist-header">
            <h4>Pre-meeting prep</h4>
            <span class="prep-count">${completedCount} of ${checklist.length} done</span>
          </div>
          <ul class="prep-list">
            ${checklist.map((item, i) => `
              <li class="prep-item ${item.completed ? 'completed' : ''}">
                <label>
                  <input type="checkbox" data-index="${i}" ${item.completed ? 'checked' : ''} ${item.auto && !item.completed ? 'data-auto="true"' : ''} />
                  <span class="prep-label">${window.aceUtils.escapeHtml(item.label)}</span>
                  ${item.auto ? `<span class="prep-auto-badge">auto</span>` : ''}
                </label>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    targetEl.querySelectorAll('.prep-list input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', async () => {
        const idx = parseInt(cb.dataset.index, 10);
        const success = await this.togglePrepItem(meeting.id, idx, cb.checked);
        if (success) {
          const li = cb.closest('.prep-item');
          if (li) li.classList.toggle('completed', cb.checked);
          const newCount = targetEl.querySelectorAll('.prep-list input:checked').length;
          const countEl = targetEl.querySelector('.prep-count');
          if (countEl) countEl.textContent = `${newCount} of ${checklist.length} done`;
        } else {
          cb.checked = !cb.checked;
        }
      });
    });

    const markBtn = targetEl.querySelector('#markCompleteBtn');
    if (markBtn && window.aceMarkComplete) {
      markBtn.addEventListener('click', async () => {
        const completed = await window.aceMarkComplete.confirm(meeting, student);
        if (completed) {
          this.renderMeetingSection(targetEl, student);
        }
      });
    } else if (markBtn) {
      markBtn.addEventListener('click', () => {
        if (window.aceToast) window.aceToast.info('Mark Complete will be available after Phase 2.4 deploys.');
      });
    }
  },

  meetingTypeLabel(type) {
    return {
      annual: 'Annual Review',
      reeval: 'Re-evaluation',
      initial: 'Initial Eligibility',
      amendment: 'Amendment',
      transition: 'Transition Planning'
    }[type] || type;
  },

  formatTime(t) {
    if (!t) return '';
    const [hh, mm] = t.split(':').map(s => parseInt(s, 10));
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
  }
};

window.aceMeetings = aceMeetings;
