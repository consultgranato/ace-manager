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

  // Default follow-up checklist items applied when a meeting is marked complete.
  // All six items are manual per the locked design decision (no auto-check
  // behavior for post-meeting tasks).
  FOLLOWUP_CHECKLIST_DEFAULT: [
    { label: 'Finalize and submit IEP in Embrace', completed: false, auto: false },
    { label: 'Send signed paperwork to parents', completed: false, auto: false },
    { label: 'Notify gen ed teachers of accommodation changes', completed: false, auto: false },
    { label: 'Update student schedule if placement changed', completed: false, auto: false },
    { label: 'Schedule any required follow-up meetings', completed: false, auto: false },
    { label: 'Submit any related forms (ESY, transportation, etc.)', completed: false, auto: false }
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

    // Auto-attach an existing active feedback link that has no meeting yet
    try {
      const { data: orphanLinks } = await window.aceSupabase
        .from('feedback_links')
        .select('id')
        .eq('student_id', student.id)
        .eq('active', true)
        .is('meeting_id', null);
      if (orphanLinks && orphanLinks.length > 0) {
        await window.aceSupabase
          .from('feedback_links')
          .update({ meeting_id: data.id })
          .eq('id', orphanLinks[0].id);
      }
    } catch (e) { /* non-fatal */ }

    return data;
  },

  // Returns the meeting currently relevant for this student, with state info:
  //   { meeting, state: 'upcoming' | 'past_not_completed' | 'completed_followups_pending' }
  // Returns null when no relevant meeting exists.
  async getActiveMeeting(studentId) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Upcoming non-completed meeting (today or future)
    const { data: upcoming } = await window.aceSupabase
      .from('meetings')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', false)
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(1);

    if (upcoming && upcoming.length > 0) {
      return { meeting: upcoming[0], state: 'upcoming' };
    }

    // 2. Past non-completed meeting (overdue for marking complete)
    const { data: overdue } = await window.aceSupabase
      .from('meetings')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', false)
      .lt('scheduled_date', today)
      .order('scheduled_date', { ascending: false })
      .limit(1);

    if (overdue && overdue.length > 0) {
      return { meeting: overdue[0], state: 'past_not_completed' };
    }

    // 3. Recently completed (last 30 days) with incomplete follow-ups
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: completed } = await window.aceSupabase
      .from('meetings')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', true)
      .gte('scheduled_date', thirtyDaysAgoStr)
      .order('scheduled_date', { ascending: false })
      .limit(1);

    if (completed && completed.length > 0) {
      const followups = completed[0].followup_checklist || [];
      const allDone = followups.length > 0 && followups.every(f => f.completed);
      if (!allDone) {
        return { meeting: completed[0], state: 'completed_followups_pending' };
      }
    }

    return null;
  },

  // Same logic as getActiveMeeting, but operates on a pre-fetched array.
  // Used by sidebar and caseload to avoid N+1 queries — they fetch ALL meetings
  // once, group by student, then call this per student.
  computeActiveFromMeetings(meetings) {
    if (!meetings || meetings.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // 1. Upcoming non-completed meeting (today or future)
    const upcoming = meetings
      .filter(m => !m.completed && m.scheduled_date >= today)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    if (upcoming.length > 0) {
      return { meeting: upcoming[0], state: 'upcoming' };
    }

    // 2. Past non-completed meeting (overdue for marking complete)
    const overdue = meetings
      .filter(m => !m.completed && m.scheduled_date < today)
      .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
    if (overdue.length > 0) {
      return { meeting: overdue[0], state: 'past_not_completed' };
    }

    // 3. Recently completed (last 30 days) with incomplete follow-ups
    const completed = meetings
      .filter(m => m.completed && m.scheduled_date >= thirtyDaysAgoStr)
      .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
    if (completed.length > 0) {
      const followups = completed[0].followup_checklist || [];
      const allDone = followups.length > 0 && followups.every(f => f.completed);
      if (!allDone) {
        return { meeting: completed[0], state: 'completed_followups_pending' };
      }
    }

    return null;
  },

  // Kept as alias for any callers that haven't been refactored
  async getUpcomingMeeting(studentId) {
    const active = await this.getActiveMeeting(studentId);
    return active && (active.state === 'upcoming' || active.state === 'past_not_completed')
      ? active.meeting
      : null;
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

  async toggleFollowupItem(meetingId, itemIndex, completed) {
    const { data: meeting, error: fetchErr } = await window.aceSupabase
      .from('meetings')
      .select('followup_checklist')
      .eq('id', meetingId)
      .single();

    if (fetchErr || !meeting) {
      if (window.aceToast) window.aceToast.error('Could not update checklist');
      return false;
    }

    const checklist = (meeting.followup_checklist || []).map((item, i) => {
      if (i !== itemIndex) return item;
      return {
        ...item,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      };
    });

    const { error: updateErr } = await window.aceSupabase
      .from('meetings')
      .update({ followup_checklist: checklist })
      .eq('id', meetingId);

    if (updateErr) {
      if (window.aceToast) window.aceToast.error('Could not save change');
      return false;
    }

    return true;
  },

  async renderMeetingSection(targetEl, student) {
    if (!targetEl) return;

    const active = await this.getActiveMeeting(student.id);

    if (!active) {
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

    const { meeting, state } = active;

    if (state === 'completed_followups_pending') {
      this.renderCompletedMeeting(targetEl, meeting, student);
    } else {
      this.renderScheduledMeeting(targetEl, meeting, student, state);
    }
  },

  // State: 'upcoming' or 'past_not_completed'
  renderScheduledMeeting(targetEl, meeting, student, state) {
    const dateLabel = window.aceUtils.formatLongDate(meeting.scheduled_date);
    const daysUntil = window.aceUtils.daysUntil(meeting.scheduled_date);
    const isPastDue = state === 'past_not_completed';
    const dayLabel = isPastDue
      ? `${Math.abs(daysUntil)} days ago`
      : (daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`);
    const timeLabel = meeting.scheduled_time ? ` at ${this.formatTime(meeting.scheduled_time)}` : '';

    const checklist = meeting.prep_checklist || [];
    const completedCount = checklist.filter(i => i.completed).length;

    const markBtnDisabled = !isPastDue && daysUntil > 0;
    const markBtnClass = isPastDue ? 'btn-primary meeting-mark-btn-prominent' : 'ace-btn-secondary meeting-mark-btn';

    targetEl.innerHTML = `
      <div class="meeting-section">
        ${isPastDue ? `
          <div class="meeting-overdue-banner">
            ${window.aceIcons.calendar(14)} Meeting has passed. Ready to mark complete?
          </div>
        ` : ''}

        <div class="meeting-header">
          <div>
            <div class="meeting-type-pill">${this.meetingTypeLabel(meeting.meeting_type)}</div>
            <div class="meeting-date-line">${dateLabel}${timeLabel} <span class="muted">· ${dayLabel}</span></div>
          </div>
          <button class="${markBtnClass}" id="markCompleteBtn" ${markBtnDisabled ? 'disabled title="Available on or after the meeting date"' : ''}>
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
                  <input type="checkbox" data-index="${i}" ${item.completed ? 'checked' : ''} />
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
    }
  },

  // State: 'completed_followups_pending'
  renderCompletedMeeting(targetEl, meeting, student) {
    const dateLabel = window.aceUtils.formatLongDate(meeting.scheduled_date);
    const checklist = meeting.followup_checklist || [];
    const completedCount = checklist.filter(i => i.completed).length;
    const allDone = completedCount === checklist.length && checklist.length > 0;

    targetEl.innerHTML = `
      <div class="meeting-section">
        <div class="meeting-completed-banner">
          ${window.aceIcons.check(14)} Completed ${dateLabel} · ${this.meetingTypeLabel(meeting.meeting_type)}
        </div>

        <div class="followup-checklist">
          <div class="prep-checklist-header">
            <h4>Post-meeting follow-up</h4>
            <span class="prep-count">${completedCount} of ${checklist.length} done</span>
          </div>
          <ul class="prep-list">
            ${checklist.map((item, i) => `
              <li class="prep-item ${item.completed ? 'completed' : ''}">
                <label>
                  <input type="checkbox" data-index="${i}" ${item.completed ? 'checked' : ''} />
                  <span class="prep-label">${window.aceUtils.escapeHtml(item.label)}</span>
                </label>
              </li>
            `).join('')}
          </ul>
        </div>

        ${allDone ? `
          <div class="followup-done-cta">
            <p class="muted">All follow-up items complete. Ready to schedule the next meeting?</p>
            <button class="btn-primary" id="scheduleNextBtn">
              ${window.aceIcons.calendar(15)} Schedule Next Meeting
            </button>
          </div>
        ` : ''}
      </div>
    `;

    targetEl.querySelectorAll('.prep-list input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', async () => {
        const idx = parseInt(cb.dataset.index, 10);
        const success = await this.toggleFollowupItem(meeting.id, idx, cb.checked);
        if (success) {
          const li = cb.closest('.prep-item');
          if (li) li.classList.toggle('completed', cb.checked);
          const newCount = targetEl.querySelectorAll('.prep-list input:checked').length;
          const countEl = targetEl.querySelector('.prep-count');
          if (countEl) countEl.textContent = `${newCount} of ${checklist.length} done`;

          // If all are now done, re-render to surface the "Schedule Next Meeting" CTA
          if (newCount === checklist.length) {
            this.renderMeetingSection(targetEl, student);
          }
        } else {
          cb.checked = !cb.checked;
        }
      });
    });

    const nextBtn = targetEl.querySelector('#scheduleNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        const result = await this.openScheduleDrawer(student);
        if (result && result.confirmed) {
          this.renderMeetingSection(targetEl, student);
        }
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
