// =============================================================
// Ace Manager — Mark Meeting Complete Module
// =============================================================

const aceMarkComplete = {

  // Phase 3.12a — given the meeting being completed and the student's CURRENT
  // (pre-advancement) due dates, return:
  //   meetingSnapshot — prior_* values to store on the meeting for 3.12b revert
  //   studentUpdate   — the advanced due date(s) to write on the student
  // Dates are anchored to the meeting's held date (scheduled_date). Amendment
  // and Transition Planning advance nothing (both objects come back empty).
  computeDueDateAdvancement(meeting, student) {
    const anchor = meeting.scheduled_date;
    const add = (n) => window.aceUtils.addYearsISO(anchor, n);
    const meetingSnapshot = {};
    const studentUpdate = {};

    switch (meeting.meeting_type) {
      case 'annual':
        meetingSnapshot.prior_annual_review_date = student.annual_review_date || null;
        studentUpdate.annual_review_date = add(1);
        break;
      case 'reeval':   // a re-eval is also an annual review
      case 'initial':  // initial eligibility sets the first annual + reeval cycle
        meetingSnapshot.prior_annual_review_date = student.annual_review_date || null;
        meetingSnapshot.prior_reeval_due_date = student.reeval_due_date || null;
        studentUpdate.annual_review_date = add(1);
        studentUpdate.reeval_due_date = add(3);
        break;
      // 'amendment' and 'transition' — no due-date change, no snapshot.
    }

    return { meetingSnapshot, studentUpdate };
  },

  async confirm(meeting, student) {
    if (!meeting || !student) return false;

    const dateLabel = window.aceUtils.formatLongDate(meeting.scheduled_date);
    const typeLabel = window.aceMeetings.meetingTypeLabel(meeting.meeting_type);

    const confirmed = await window.aceModal.openModal({
      title: 'Mark meeting as complete?',
      message: `Mark ${student.first_name} ${student.last_initial}.'s ${typeLabel} on ${dateLabel} as complete? A 6-item follow-up checklist will auto-generate.`,
      confirmLabel: 'Mark Complete',
      cancelLabel: 'Cancel',
      variant: 'default',
      onConfirm: async () => {
        const followups = window.aceMeetings.FOLLOWUP_CHECKLIST_DEFAULT.map(item => ({
          label: item.label,
          completed: false,
          completed_at: null
        }));

        // 3.12a — advance due date(s) by meeting type, anchored to the held
        // date. Snapshot the pre-advancement values onto the meeting (same
        // update that sets completed) so a completed meeting always carries its
        // priors for 3.12b revert; then write the advanced dates to the student.
        const { meetingSnapshot, studentUpdate } = this.computeDueDateAdvancement(meeting, student);

        const { error } = await window.aceSupabase
          .from('meetings')
          .update({
            completed: true,
            followup_checklist: followups,
            ...meetingSnapshot
          })
          .eq('id', meeting.id);

        if (error) throw error;

        if (Object.keys(studentUpdate).length > 0) {
          const { error: studentErr } = await window.aceSupabase
            .from('students')
            .update(studentUpdate)
            .eq('id', student.id);

          if (studentErr) throw studentErr;

          // Reflect locally so the immediate post-complete re-render (header,
          // fullState / Needs Attention) uses the advanced dates without a reload.
          Object.assign(student, studentUpdate);
        }
      }
    });

    if (confirmed && window.aceToast) {
      window.aceToast.success('Meeting marked complete');
    }

    return confirmed;
  }
};

window.aceMarkComplete = aceMarkComplete;
