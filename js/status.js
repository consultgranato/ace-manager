// =============================================================
// Ace Manager — Student Status Calculations
// =============================================================
// Single source of truth for "what's the status of this student"
// across the entire app. Used by sidebar dots, profile header,
// homepage Needs Attention, calendar urgency, and section cards.
//
// Returns: {
//   dot:       'green' | 'amber' | 'red' | 'gray'
//   urgency:   'clear' | 'approaching' | 'critical' | 'overdue' | 'none'
//   pillLabel: human-readable status string for badges
//   reasons:   array of { text, urgency } describing what needs attention
// }
// =============================================================

const aceStatus = {

  forStudent(student) {
    if (!student) return { dot: 'gray', urgency: 'none', pillLabel: '', reasons: [] };

    const reasons = [];

    if (student.annual_review_date) {
      const days = window.aceUtils.daysUntil(student.annual_review_date);
      const urgency = window.aceUtils.urgency(student.annual_review_date);
      if (days !== null) {
        if (days < 0) {
          reasons.push({ text: `Annual overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        } else if (days === 0) {
          reasons.push({ text: 'Annual due today', urgency: 'critical' });
        } else if (urgency === 'critical') {
          reasons.push({ text: `Annual due in ${days} days`, urgency: 'critical' });
        } else if (urgency === 'approaching') {
          reasons.push({ text: `Annual due in ${days} days`, urgency: 'approaching' });
        }
      }
    }

    if (student.reeval_due_date) {
      const days = window.aceUtils.daysUntil(student.reeval_due_date);
      const urgency = window.aceUtils.urgency(student.reeval_due_date);
      if (days !== null) {
        if (days < 0) {
          reasons.push({ text: `Re-eval overdue by ${Math.abs(days)} days`, urgency: 'overdue' });
        } else if (days === 0) {
          reasons.push({ text: 'Re-eval due today', urgency: 'critical' });
        } else if (urgency === 'critical') {
          reasons.push({ text: `Re-eval due in ${days} days`, urgency: 'critical' });
        } else if (urgency === 'approaching') {
          reasons.push({ text: `Re-eval due in ${days} days`, urgency: 'approaching' });
        }
      }
    }

    const order = { overdue: 4, critical: 3, approaching: 2, clear: 1, none: 0 };
    let topUrgency = 'clear';
    reasons.forEach(r => {
      if ((order[r.urgency] || 0) > (order[topUrgency] || 0)) {
        topUrgency = r.urgency;
      }
    });

    const dotMap = {
      overdue: 'red',
      critical: 'red',
      approaching: 'amber',
      clear: 'green',
      none: 'gray'
    };

    const pillLabel = reasons.length > 0 ? reasons[0].text : 'On track';

    return {
      dot: dotMap[topUrgency] || 'gray',
      urgency: topUrgency,
      pillLabel,
      reasons
    };
  }
};

window.aceStatus = aceStatus;
