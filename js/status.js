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

  // -----------------------------------------------------------
  // Phase 3.17 — ONE urgency scale shared by every surface
  // (sidebar dots, caseload pills/rows, profile due chip, Needs Attention),
  // so the same event renders the same color everywhere. This is color
  // OUTPUT only — it does not change which items are flagged (needsAttention)
  // or any deadline math.
  //   overdue (< 0):       red
  //   soon (0–30):         amber
  //   approaching (31–60): purple / muted  (NOT amber — "soon" is reserved)
  //   comfortable (> 60):  green
  // -----------------------------------------------------------
  urgencyLevel(days) {
    if (days === null || days === undefined || isNaN(days)) return 'none';
    if (days < 0) return 'overdue';
    if (days <= 30) return 'soon';
    if (days <= 60) return 'approaching';
    return 'comfortable';
  },

  // level → visual tokens. dot is the single value fullState sets; every other
  // surface derives its color from the dot so they can never disagree (2.8.1).
  URGENCY_VISUAL: {
    overdue:     { dot: 'red',    pill: 'ace-pill-critical', attention: 'attention-critical',    order: 5 },
    soon:        { dot: 'amber',  pill: 'ace-pill-warning',  attention: 'attention-approaching', order: 4 },
    approaching: { dot: 'purple', pill: 'ace-pill-purple',   attention: 'attention-clear',       order: 3 },
    comfortable: { dot: 'green',  pill: 'ace-pill-success',  attention: 'attention-clear',       order: 2 },
    none:        { dot: 'gray',   pill: 'ace-pill-neutral',  attention: 'attention-clear',       order: 1 }
  },

  visualForDays(days) {
    return this.URGENCY_VISUAL[this.urgencyLevel(days)] || this.URGENCY_VISUAL.none;
  },

  // Resolve the visual tokens from a dot color, so pill / attention border /
  // sort order always agree with whatever dot fullState chose.
  _visualByDot(dot) {
    for (const k in this.URGENCY_VISUAL) {
      if (this.URGENCY_VISUAL[k].dot === dot) return this.URGENCY_VISUAL[k];
    }
    return this.URGENCY_VISUAL.none;
  },
  pillClassForDot(dot) { return this._visualByDot(dot).pill; },
  attentionClassForDot(dot) { return this._visualByDot(dot).attention; },
  dotOrder(dot) { return this._visualByDot(dot).order; },

  // Soonest due-date days for a student (annual / reeval), or null.
  soonestDueDays(student) {
    const ds = [student.annual_review_date, student.reeval_due_date]
      .filter(Boolean)
      .map(d => window.aceUtils.daysUntil(d))
      .filter(d => d !== null);
    return ds.length ? Math.min(...ds) : null;
  },

  // Legacy deadline-only computation (unchanged behavior)
  forStudent(student) {
    if (!student) return { dot: 'gray', urgency: 'none', pillLabel: '', reasons: [] };

    const reasons = [];

    if (student.annual_review_date) {
      const days = window.aceUtils.daysUntil(student.annual_review_date);
      const urgency = window.aceUtils.urgency(student.annual_review_date);
      if (days !== null) {
        if (days < 0) reasons.push({ text: `Annual Review overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        else if (days === 0) reasons.push({ text: 'Annual Review Due today', urgency: 'critical' });
        else if (urgency === 'critical') reasons.push({ text: `Annual Review Due in ${days} days`, urgency: 'critical' });
        else if (urgency === 'approaching') reasons.push({ text: `Annual Review Due in ${days} days`, urgency: 'approaching' });
      }
    }

    if (student.reeval_due_date) {
      const days = window.aceUtils.daysUntil(student.reeval_due_date);
      const urgency = window.aceUtils.urgency(student.reeval_due_date);
      if (days !== null) {
        if (days < 0) reasons.push({ text: `Re-eval overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        else if (days === 0) reasons.push({ text: 'Re-eval Due today', urgency: 'critical' });
        else if (urgency === 'critical') reasons.push({ text: `Re-eval Due in ${days} days`, urgency: 'critical' });
        else if (urgency === 'approaching') reasons.push({ text: `Re-eval Due in ${days} days`, urgency: 'approaching' });
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
      return { stateKind: 'clear', dot: 'gray', urgency: 'none', headline: '', subline: '', pillLabel: '', needsAttention: false };
    }

    // No active meeting at all — fall back to deadline urgency
    if (!meetingActive) {
      const base = this.forStudent(student);
      const top = base.reasons[0];
      if (!top) {
        // No urgent reason — still color the dot from the shared scale so a
        // 31–60-day due date reads the same (purple) here as on the profile
        // chip, while far-out/none stays green/gray. Not flagged for attention.
        return { stateKind: 'clear', dot: this.visualForDays(this.soonestDueDays(student)).dot, urgency: 'clear', headline: 'On track', subline: '', pillLabel: 'On track', needsAttention: false };
      }
      const onlyApproachingOrWorse = ['approaching', 'critical', 'overdue'].includes(top.urgency);
      return {
        stateKind: 'no_meeting',
        dot: this.visualForDays(this.soonestDueDays(student)).dot,
        urgency: base.urgency,
        headline: top.text,
        subline: 'No meeting scheduled — coordinate with secretary',
        pillLabel: top.text,
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

      // Color from the shared scale so a far-future meeting is never amber
      // ("soon") and matches the dot/pill on every other surface.
      const urgency = this.urgencyLevel(days);
      const dot = this.visualForDays(days).dot;

      // Compact pill label
      let pillLabel;
      if (days === 0) pillLabel = 'Meeting today';
      else if (days === 1) pillLabel = 'Meeting tomorrow';
      else if (days < 0) pillLabel = 'Meeting passed';
      else pillLabel = `Meeting in ${days} days`;

      return { stateKind: 'meeting_upcoming', dot, urgency, headline, subline, pillLabel, needsAttention };
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
        pillLabel: 'Mark meeting complete',
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
        pillLabel: overdueFollowups ? 'Follow-up overdue' : 'Follow-up pending',
        needsAttention: overdueFollowups
      };
    }

    return { stateKind: 'clear', dot: 'green', urgency: 'clear', headline: 'On track', subline: '', pillLabel: 'On track', needsAttention: false };
  }
};

window.aceStatus = aceStatus;
