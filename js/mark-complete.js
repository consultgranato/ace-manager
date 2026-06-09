// =============================================================
// Ace Manager — Mark Meeting Complete Module
// =============================================================

const aceMarkComplete = {

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

        const { error } = await window.aceSupabase
          .from('meetings')
          .update({
            completed: true,
            followup_checklist: followups
          })
          .eq('id', meeting.id);

        if (error) throw error;
      }
    });

    if (confirmed && window.aceToast) {
      window.aceToast.success('Meeting marked complete');
    }

    return confirmed;
  }
};

window.aceMarkComplete = aceMarkComplete;
