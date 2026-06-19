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

  // -------------------------------------------------------------
  // Phase 3.12b — edit / delete meetings + due-date recompute.
  //
  // Due dates are a derived function of the student's COMPLETED meetings: each
  // completed meeting of a driving type contributes a candidate (held date +
  // offset); the clock = the latest candidate. When a completed meeting is
  // deleted or edited, the affected clock(s) are recomputed from the REMAINING
  // completed meetings, falling back to that meeting's prior_* snapshot (the
  // pre-advancement baseline from 3.12a) when a clock loses its last driver.
  // -------------------------------------------------------------

  // Completed meeting types that drive each clock.
  ANNUAL_DRIVERS: ['annual', 'reeval', 'initial'],
  REEVAL_DRIVERS: ['reeval', 'initial'],

  _clocksDriven(type) {
    return {
      annual: this.ANNUAL_DRIVERS.includes(type),
      reeval: this.REEVAL_DRIVERS.includes(type)
    };
  },

  // Pure: latest advanced date per clock over a set of completed meetings,
  // falling back to the provided baseline when a clock has no driver. ISO
  // YYYY-MM-DD strings compare lexicographically == chronologically.
  _computeClocks(completedSet, fallback) {
    const latest = (drivers, offset) => {
      let best = null;
      for (const m of completedSet) {
        if (!drivers.includes(m.meeting_type)) continue;
        const cand = window.aceUtils.addYearsISO(m.scheduled_date, offset);
        if (cand && (best === null || cand > best)) best = cand;
      }
      return best;
    };
    const a = latest(this.ANNUAL_DRIVERS, 1);
    const r = latest(this.REEVAL_DRIVERS, 3);
    return {
      annual_review_date: a !== null ? a : (fallback.annual != null ? fallback.annual : null),
      reeval_due_date:    r !== null ? r : (fallback.reeval != null ? fallback.reeval : null)
    };
  },

  async _completedMeetings(studentId) {
    const { data } = await window.aceSupabase
      .from('meetings')
      .select('id, meeting_type, scheduled_date')
      .eq('student_id', studentId)
      .eq('completed', true);
    return data || [];
  },

  // Shared recompute. Recompute the due date(s) `affecting` drives, from the
  // student's REMAINING completed meetings (excluding excludeMeetingId), falling
  // back to affecting.prior_* when a clock loses its last driver. Returns a
  // partial students update containing only the affected clock(s).
  async recomputeDueDates(studentId, affecting, excludeMeetingId) {
    const remaining = (await this._completedMeetings(studentId))
      .filter(m => m.id !== excludeMeetingId);
    const fallback = {
      annual: affecting.prior_annual_review_date != null ? affecting.prior_annual_review_date : null,
      reeval: affecting.prior_reeval_due_date != null ? affecting.prior_reeval_due_date : null
    };
    const clocks = this._computeClocks(remaining, fallback);
    const driven = this._clocksDriven(affecting.meeting_type);
    const update = {};
    if (driven.annual) update.annual_review_date = clocks.annual_review_date;
    if (driven.reeval) update.reeval_due_date = clocks.reeval_due_date;
    return update;
  },

  // Edit drawer — pre-filled, works for scheduled AND completed meetings.
  async openEditDrawer(meeting, student) {
    const esc = window.aceUtils.escapeHtml;
    const typeOpts = [
      ['annual', 'Annual Review'], ['reeval', 'Re-evaluation'], ['initial', 'Initial Eligibility'],
      ['amendment', 'Amendment'], ['transition', 'Transition Planning']
    ].map(([v, l]) => `<option value="${v}" ${meeting.meeting_type === v ? 'selected' : ''}>${l}</option>`).join('');

    const bodyHTML = `
      <form id="editMeetingForm" class="student-form" style="gap:14px;">
        <div class="form-row">
          <label>
            <span class="label-text">Meeting Type <span class="required">*</span></span>
            <select id="editMeetingType" required>${typeOpts}</select>
          </label>
        </div>
        <div class="form-row two-col">
          <label>
            <span class="label-text">Date <span class="required">*</span></span>
            <input type="date" id="editMeetingDate" required value="${esc(meeting.scheduled_date || '')}" />
          </label>
          <label>
            <span class="label-text">Time <span class="optional">(optional)</span></span>
            <input type="time" id="editMeetingTime" value="${esc(meeting.scheduled_time || '')}" />
          </label>
        </div>
        <div class="form-row">
          <label>
            <span class="label-text">Attendees <span class="optional">(optional)</span></span>
            <input type="text" id="editMeetingAttendees" value="${esc(meeting.attendees || '')}" />
          </label>
        </div>
        <div class="form-row">
          <label>
            <span class="label-text">Notes <span class="optional">(optional)</span></span>
            <textarea id="editMeetingNotes" rows="3">${esc(meeting.meeting_notes || '')}</textarea>
          </label>
        </div>
        ${meeting.completed ? `<div class="meeting-preview muted">This meeting is completed. Changing its type or date will recompute the student's due dates.</div>` : ''}
        <div id="editMeetingErrorMsg" class="error-msg" style="display:none;"></div>
      </form>
    `;

    return await window.aceModal.openDrawer({
      title: 'Edit Meeting',
      bodyHTML,
      saveLabel: 'Save Changes',
      cancelLabel: 'Cancel',
      onSave: async (drawerBody) => await this.handleEditSave(drawerBody, meeting, student)
    });
  },

  async handleEditSave(drawerBody, meeting, student) {
    const errEl = drawerBody.querySelector('#editMeetingErrorMsg');
    errEl.style.display = 'none';

    const newType = drawerBody.querySelector('#editMeetingType').value;
    const newDate = drawerBody.querySelector('#editMeetingDate').value;
    const newTime = drawerBody.querySelector('#editMeetingTime').value || null;
    const attendees = drawerBody.querySelector('#editMeetingAttendees').value.trim();
    const notes = drawerBody.querySelector('#editMeetingNotes').value.trim();

    if (!newType || !newDate) {
      errEl.textContent = 'Meeting type and date are required.';
      errEl.style.display = 'block';
      return false;
    }

    const fields = {
      meeting_type: newType,
      scheduled_date: newDate,
      scheduled_time: newTime,
      attendees,
      meeting_notes: notes
    };

    const typeChanged = newType !== meeting.meeting_type;
    const dateChanged = newDate !== meeting.scheduled_date;
    let studentUpdate = null;

    // Only a completed meeting whose type/date changed shifts due dates.
    if (meeting.completed && (typeChanged || dateChanged)) {
      const remaining = (await this._completedMeetings(student.id)).filter(m => m.id !== meeting.id);
      const origFallback = {
        annual: meeting.prior_annual_review_date != null ? meeting.prior_annual_review_date : null,
        reeval: meeting.prior_reeval_due_date != null ? meeting.prior_reeval_due_date : null
      };
      const oldDriven = this._clocksDriven(meeting.meeting_type);
      const newDriven = this._clocksDriven(newType);

      // Refresh this meeting's prior_* = the baseline WITHOUT it (what a later
      // delete would restore), only for clock(s) the new type drives.
      const without = this._computeClocks(remaining, origFallback);
      fields.prior_annual_review_date = newDriven.annual ? without.annual_review_date : null;
      fields.prior_reeval_due_date    = newDriven.reeval ? without.reeval_due_date    : null;

      // Student dates = recompute INCLUDING this meeting's new values, for every
      // clock affected by the change (union of old + new driven clocks). A clock
      // the new type no longer drives reverts via the remaining set / baseline.
      const withNew = remaining.concat([{ id: meeting.id, meeting_type: newType, scheduled_date: newDate }]);
      const withC = this._computeClocks(withNew, origFallback);
      studentUpdate = {};
      if (oldDriven.annual || newDriven.annual) studentUpdate.annual_review_date = withC.annual_review_date;
      if (oldDriven.reeval || newDriven.reeval) studentUpdate.reeval_due_date = withC.reeval_due_date;
    }

    const { error } = await window.aceSupabase.from('meetings').update(fields).eq('id', meeting.id);
    if (error) {
      errEl.textContent = 'Could not save changes: ' + error.message;
      errEl.style.display = 'block';
      return false;
    }

    if (studentUpdate && Object.keys(studentUpdate).length) {
      const { error: sErr } = await window.aceSupabase.from('students').update(studentUpdate).eq('id', student.id);
      if (sErr) {
        errEl.textContent = 'Saved the meeting, but updating due dates failed: ' + sErr.message;
        errEl.style.display = 'block';
        return false;
      }
      Object.assign(student, studentUpdate);   // keep in-memory student (and profile header) consistent
    }

    if (window.aceToast) window.aceToast.success('Meeting updated');
    return { dueDatesChanged: !!(studentUpdate && Object.keys(studentUpdate).length) };
  },

  // Delete with confirmation. A completed meeting reverts the due date(s) it
  // advanced BEFORE the row is removed, so a due date is never left advanced
  // into the future with no meeting backing it.
  async confirmDelete(meeting, student) {
    return await window.aceModal.openModal({
      title: 'Delete this meeting?',
      message: "Delete this meeting? This can't be undone.",
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        if (meeting.completed) {
          const studentUpdate = await this.recomputeDueDates(student.id, meeting, meeting.id);
          if (Object.keys(studentUpdate).length) {
            const { error: sErr } = await window.aceSupabase
              .from('students').update(studentUpdate).eq('id', student.id);
            if (sErr) throw sErr;
            Object.assign(student, studentUpdate);
          }
        }
        const { error } = await window.aceSupabase.from('meetings').delete().eq('id', meeting.id);
        if (error) throw error;
      }
    });
  },

  // Re-render the meeting card after an edit/delete, and (when due dates moved)
  // re-derive the profile header deadline and sidebar dot so every fullState
  // surface stays consistent. Caseload / Home re-derive on next navigation.
  _afterMeetingMutation(targetEl, student, dueDatesChanged) {
    this.renderMeetingSection(targetEl, student);
    // Any add/edit/delete/complete changes the active-meeting state, which the
    // sidebar dot derives via fullState — always re-render it.
    const sb = document.getElementById('sidebarHost');
    if (sb && window.aceSidebar && typeof window.aceSidebar.render === 'function') {
      window.aceSidebar.render(sb);
    }
    // The profile header shows the next deadline — refresh only when a due date moved.
    if (dueDatesChanged && window.aceProfile && typeof window.aceProfile.renderHeader === 'function') {
      window.aceProfile.renderHeader();
    }
  },

  // Edit/Delete action buttons shared by the scheduled and completed cards.
  _meetingActionsHTML() {
    const btn = (id, icon, color, label) =>
      `<button type="button" id="${id}" title="${label}" aria-label="${label}" ` +
      `style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;` +
      `border:1px solid var(--border);border-radius:6px;background:#fff;color:${color};cursor:pointer;">${icon}</button>`;
    return `<div class="meeting-actions" style="display:flex;gap:6px;">
      ${btn('editMeetingBtn', window.aceIcons.edit(15), 'var(--text-muted)', 'Edit meeting')}
      ${btn('deleteMeetingBtn', window.aceIcons.trash2(15), 'var(--critical)', 'Delete meeting')}
    </div>`;
  },

  _wireMeetingActions(targetEl, meeting, student) {
    const editBtn = targetEl.querySelector('#editMeetingBtn');
    if (editBtn) {
      editBtn.addEventListener('click', async () => {
        const res = await this.openEditDrawer(meeting, student);
        if (res && res.confirmed) {
          this._afterMeetingMutation(targetEl, student, !!(res.result && res.result.dueDatesChanged));
        }
      });
    }
    const delBtn = targetEl.querySelector('#deleteMeetingBtn');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        const ok = await this.confirmDelete(meeting, student);
        if (ok) {
          if (window.aceToast) window.aceToast.success('Meeting deleted');
          this._afterMeetingMutation(targetEl, student, !!meeting.completed);
        }
      });
    }
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

  // -------------------------------------------------------------
  // Phase 3.11b — auto-check prep items from tool completions.
  //
  // The prep checklist (meetings.prep_checklist) is the single source of
  // truth read by aceStatus.fullState (sidebar dots, caseload pills, Needs
  // Attention). Auto-checks persist HERE so every surface stays consistent —
  // no parallel state path.
  //
  // Auto-check is ONE-TIME: an item gets a sticky `auto_checked` stamp the
  // first time its data condition is met. After that the case manager owns
  // the box — a manual uncheck is respected and never re-checked.
  // -------------------------------------------------------------

  // Read the data-backed conditions for the three DNA prep items, using the
  // same paths the feedback cards / 3.8d panel use.
  async computeAutoConditions(student) {
    const out = { teacher: false, parent: false, transition: false, draft: false };
    if (!student || !student.id) return out;

    // Teacher feedback — checked only when ALL expected academic-course TF1s
    // are received (received === expected). A single partial receipt does not
    // check it. With no academic courses there is nothing expected → stays manual.
    const academicCourses = (student.courses || []).filter(c => c.is_academic);
    if (academicCourses.length > 0) {
      const { data: links } = await window.aceSupabase
        .from('feedback_links')
        .select('id').eq('student_id', student.id).eq('active', true)
        .order('created_at', { ascending: false }).limit(1);
      if (links && links[0]) {
        const { data: fb } = await window.aceSupabase
          .from('teacher_feedback')
          .select('course_name').eq('link_id', links[0].id).eq('status', 'completed');
        const got = new Set((fb || []).map(r => r.course_name));
        out.teacher = academicCourses.every(c => got.has(c.name));
      }
    }

    // Parent input — a completed PF1 on the active parent link.
    const { data: pf } = await window.aceSupabase
      .from('parent_feedback')
      .select('status,payload').eq('student_id', student.id).eq('active', true)
      .eq('status', 'completed').limit(1);
    out.parent = !!(pf && pf[0] && pf[0].payload && pf[0].payload.version);

    // Transition assessment — a completed TA1 on file.
    const { data: ta } = await window.aceSupabase
      .from('transition_assessments')
      .select('status,payload').eq('student_id', student.id).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(1);
    out.transition = !!(ta && ta[0] && ta[0].payload && ta[0].payload.version);

    // IEP draft — a durable marker stamped on the student record when the
    // present-levels narrative is generated (or a section copied) in the
    // builder. Re-derived here so item #4 auto-checks through the same path
    // as the three above, instead of relying on an in-session event.
    const { data: stu } = await window.aceSupabase
      .from('students')
      .select('iep_draft_generated_at').eq('id', student.id).limit(1);
    out.draft = !!(stu && stu[0] && stu[0].iep_draft_generated_at);

    return out;
  },

  // Maps a default prep item label to its auto-condition key.
  PREP_AUTO_CONDITION: {
    'Send teacher feedback links': 'teacher',
    'Send parent feedback survey': 'parent',
    'Administer transition assessment': 'transition',
    'Generate IEP draft from latest data': 'draft'
  },

  // Fetch the active meeting, apply any DNA-driven auto-checks (one-time),
  // persist if anything changed, and return the (possibly updated) active
  // meeting object so the caller can render from it. Returns null/active in the
  // same shape as getActiveMeeting so it can replace that call directly.
  async applyAutoChecks(student) {
    if (!student || !student.id) return null;
    const active = await this.getActiveMeeting(student.id);
    if (!active) return null;
    // Prep checklist only exists for these two states; leave others untouched.
    if (active.state !== 'upcoming' && active.state !== 'past_not_completed') return active;

    const meeting = active.meeting;
    const checklist = meeting.prep_checklist || [];
    if (!checklist.length) return active;

    try {
      const conditions = await this.computeAutoConditions(student);
      let changed = false;
      const next = checklist.map(item => {
        const key = this.PREP_AUTO_CONDITION[item.label];
        if (!key || !item.auto) return item;
        if (conditions[key] && !item.completed && !item.auto_checked) {
          changed = true;
          return { ...item, completed: true, completed_at: new Date().toISOString(), auto_checked: true };
        }
        return item;
      });
      if (changed) {
        const { error } = await window.aceSupabase
          .from('meetings').update({ prep_checklist: next }).eq('id', meeting.id);
        if (!error) meeting.prep_checklist = next; // reflect for immediate render
      }
    } catch (e) {
      // Non-fatal — fall back to rendering the existing checklist.
    }
    return active;
  },

  // Durable marker for prep item #4 ("Generate IEP draft from latest data").
  // The IEP builder stamps students.iep_draft_generated_at when the narrative
  // is generated or a section copied; computeAutoConditions reads it and
  // applyAutoChecks performs the one-time check — no separate event path.
  async markDraftGenerated(studentId) {
    if (!studentId) return;
    try {
      const { error } = await window.aceSupabase
        .from('students')
        .update({ iep_draft_generated_at: new Date().toISOString() })
        .eq('id', studentId);
      // Do not swallow — a silent RLS/network failure here is exactly why the
      // marker previously never persisted and item #4 never auto-checked.
      if (error) {
        console.error('markDraftGenerated: failed to persist iep_draft_generated_at', error);
      }
    } catch (e) {
      console.error('markDraftGenerated: unexpected error persisting iep_draft_generated_at', e);
    }
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

    // 3.11b — apply data-driven auto-checks first, then render from the
    // (possibly updated) active meeting. Falls through to the same shape as
    // getActiveMeeting, so the rest of this method is unchanged.
    const active = await this.applyAutoChecks(student);

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
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="${markBtnClass}" id="markCompleteBtn" ${markBtnDisabled ? 'disabled title="Available on or after the meeting date"' : ''}>
              ${window.aceIcons.check(14)} Mark Complete
            </button>
            ${this._meetingActionsHTML()}
          </div>
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
          // Completion may have advanced due dates (3.12a) — refresh header/sidebar too.
          this._afterMeetingMutation(targetEl, student, true);
        }
      });
    }

    this._wireMeetingActions(targetEl, meeting, student);
  },

  // State: 'completed_followups_pending'
  renderCompletedMeeting(targetEl, meeting, student) {
    const dateLabel = window.aceUtils.formatLongDate(meeting.scheduled_date);
    const checklist = meeting.followup_checklist || [];
    const completedCount = checklist.filter(i => i.completed).length;
    const allDone = completedCount === checklist.length && checklist.length > 0;

    targetEl.innerHTML = `
      <div class="meeting-section">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div class="meeting-completed-banner" style="margin:0;">
            ${window.aceIcons.check(14)} Completed ${dateLabel} · ${this.meetingTypeLabel(meeting.meeting_type)}
          </div>
          ${this._meetingActionsHTML()}
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

    this._wireMeetingActions(targetEl, meeting, student);
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
