// =============================================================
// Ace Manager — Student Status Calculations
// =============================================================
// Single source of truth for "what's the status of this student"
// across the entire app. Meeting-aware in Phase 2.6+.
//
// forStudent(student) — deadline-only status (used by sidebar dots,
//   caseload cards, profile header)
//
// fullState(student, meeting) — full meeting-aware status object
//   for the homepage Needs Attention zone:
//   {
//     stateKind: 'no_meeting' | 'meeting_upcoming' | 'meeting_passed' | 'followups_pending' | 'clear',
//     dot: 'green' | 'amber' | 'red' | 'gray' | 'purple',
//     urgency: 'clear' | 'approaching' | 'critical' | 'overdue' | 'none',
//     headline: short string for the attention card
//     subline: optional secondary string
//     needsAttention: boolean — whether to surface on Needs Attention
//   }
// =============================================================

const aceStatus = {

  // Legacy deadline-only computation (unchanged behavior)
  forStudent(student) {
    if (!student) return { dot: 'gray', urgency: 'none', pillLabel: '', reasons: [] };

    const reasons = [];

    if (student.annual_review_date) {
      const days = window.aceUtils.daysUntil(student.annual_review_date);
      const urgency = window.aceUtils.urgency(student.annual_review_date);
      if (days !== null) {
        if (days < 0) reasons.push({ text: `Annual overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        else if (days === 0) reasons.push({ text: 'Annual due today', urgency: 'critical' });
        else if (urgency === 'critical') reasons.push({ text: `Annual due in ${days} days`, urgency: 'critical' });
        else if (urgency === 'approaching') reasons.push({ text: `Annual due in ${days} days`, urgency: 'approaching' });
      }
    }

    if (student.reeval_due_date) {
      const days = window.aceUtils.daysUntil(student.reeval_due_date);
      const urgency = window.aceUtils.urgency(student.reeval_due_date);
      if (days !== null) {
        if (days < 0) reasons.push({ text: `Re-eval overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        else if (days === 0) reasons.push({ text: 'Re-eval due today', urgency: 'critical' });
        else if (urgency === 'critical') reasons.push({ text: `Re-eval due in ${days} days`, urgency: 'critical' });
        else if (urgency === 'approaching') reasons.push({ text: `Re-eval due in ${days} days`, urgency: 'approaching' });
      }
    }

    const order = { overdue: 4, critical: 3, approaching: 2, clear: 1, none: 0 };
    let topUrgency = 'clear';
    reasons.forEach(r => {
      if ((order[r.urgency] || 0) > (order[topUrgency] || 0)) topUrgency = r.urgency;
    });

    const dotMap = { overdue: 'red', critical: 'red', approaching: 'amber', clear: 'green', none: 'gray' };
    const pillLabel = reasons.length > 0 ? reasons[0].text : 'On track';

    return { dot: dotMap[topUrgency] || 'gray', urgency: topUrgency, pillLabel, reasons };
  },

  // Phase 2.6 — full meeting-aware state for Needs Attention zone
  // `meetingActive` is the result of aceMeetings.getActiveMeeting(studentId)
  // or null. Shape: { meeting, state: 'upcoming' | 'past_not_completed' | 'completed_followups_pending' }
  fullState(student, meetingActive) {
    if (!student) {
      return { stateKind: 'clear', dot: 'gray', urgency: 'none', headline: '', subline: '', needsAttention: false };
    }

    // No active meeting at all — fall back to deadline urgency
    if (!meetingActive) {
      const base = this.forStudent(student);
      const top = base.reasons[0];
      if (!top) {
        return { stateKind: 'clear', dot: 'green', urgency: 'clear', headline: 'On track', subline: '', needsAttention: false };
      }
      const onlyApproachingOrWorse = ['approaching', 'critical', 'overdue'].includes(top.urgency);
      return {
        stateKind: 'no_meeting',
        dot: base.dot,
        urgency: base.urgency,
        headline: top.text,
        subline: 'No meeting scheduled — coordinate with secretary',
        needsAttention: onlyApproachingOrWorse
      };
    }

    const m = meetingActive.meeting;
    const state = meetingActive.state;

    if (state === 'upcoming') {
      const days = window.aceUtils.daysUntil(m.scheduled_date);
      const dateStr = window.aceUtils.formatShortDate(m.scheduled_date);
      const typeLabel = window.aceMeetings?.meetingTypeLabel(m.meeting_type) || m.meeting_type;

      const prep = m.prep_checklist || [];
      const prepDone = prep.filter(i => i.completed).length;
      const prepTotal = prep.length;
      const prepPending = prepTotal - prepDone;

      const headline = `${typeLabel} on ${dateStr}${days <= 1 ? '' : ` · in ${days} days`}${days === 0 ? ' · today' : days === 1 ? ' · tomorrow' : ''}`;
      const subline = prepPending === 0
        ? 'All prep complete — ready to go'
        : `${prepPending} of ${prepTotal} prep ${prepPending === 1 ? 'item' : 'items'} pending`;

      // Only flag on attention if meeting is within 14 days OR prep items pending
      const needsAttention = days <= 14 || prepPending > 0;

      // Urgency for the dot/border:
      let urgency = 'approaching';
      let dot = 'purple';
      if (days <= 2) { urgency = 'critical'; dot = 'red'; }
      else if (days <= 7) { urgency = 'approaching'; dot = 'amber'; }

      return { stateKind: 'meeting_upcoming', dot, urgency, headline, subline, needsAttention };
    }

    if (state === 'past_not_completed') {
      const days = Math.abs(window.aceUtils.daysUntil(m.scheduled_date));
      const dateStr = window.aceUtils.formatShortDate(m.scheduled_date);
      const typeLabel = window.aceMeetings?.meetingTypeLabel(m.meeting_type) || m.meeting_type;

      return {
        stateKind: 'meeting_passed',
        dot: 'red',
        urgency: 'overdue',
        headline: `${typeLabel} on ${dateStr} — needs to be marked complete`,
        subline: `Meeting was ${days} day${days === 1 ? '' : 's'} ago`,
        needsAttention: true
      };
    }

    if (state === 'completed_followups_pending') {
      const days = Math.abs(window.aceUtils.daysUntil(m.scheduled_date));
      const dateStr = window.aceUtils.formatShortDate(m.scheduled_date);

      const followups = m.followup_checklist || [];
      const fDone = followups.filter(i => i.completed).length;
      const fTotal = followups.length;

      // Only flag on attention if follow-ups have been pending 7+ days
      const overdueFollowups = days >= 7;

      return {
        stateKind: 'followups_pending',
        dot: overdueFollowups ? 'amber' : 'purple',
        urgency: overdueFollowups ? 'approaching' : 'clear',
        headline: `Follow-up pending since ${dateStr}`,
        subline: `${fDone} of ${fTotal} follow-up items complete`,
        needsAttention: overdueFollowups
      };
    }

    return { stateKind: 'clear', dot: 'green', urgency: 'clear', headline: 'On track', subline: '', needsAttention: false };
  }
};

window.aceStatus = aceStatus;
