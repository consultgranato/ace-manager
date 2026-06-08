// =============================================================
// Ace Manager — Homepage Assembly
// =============================================================

const aceHomepage = {

  async render() {
    await this.renderGreeting();
    await this.renderCalendar();
    await this.renderNeedsAttention();
    await this.renderRecentActivity();
  },

  async renderGreeting() {
    const greetingEl = document.getElementById('homeGreeting');
    const subtitleEl = document.getElementById('homeSubtitle');
    if (!greetingEl) return;

    const profile = await window.aceAuth.getProfile();
    const firstName = (profile?.full_name || 'there').split(' ')[0];
    const hour = new Date().getHours();
    let timeWord = 'morning';
    if (hour >= 12 && hour < 17) timeWord = 'afternoon';
    else if (hour >= 17) timeWord = 'evening';

    greetingEl.textContent = `Good ${timeWord}, ${firstName}.`;

    if (subtitleEl) {
      const today = window.aceUtils.formatLongDate(new Date());
      const sy = window.aceUtils.currentSchoolYear();
      subtitleEl.textContent = `${today}  ·  ${sy} school year`;
    }
  },

  async renderCalendar() {
    const calHost = document.getElementById('calendarHost');
    if (!calHost) return;
    await window.aceCalendar.render(calHost);
  },

  async renderNeedsAttention() {
    const container = document.getElementById('needsAttention');
    if (!container) return;

    const { data: students, error } = await window.aceSupabase
      .from('students')
      .select('id, first_name, last_initial, grade, annual_review_date, reeval_due_date')
      .eq('archived', false);

    if (error) {
      container.innerHTML = '<div class="empty-state">Could not load students.</div>';
      return;
    }

    if (!students || students.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${window.aceIcons.usersRound(28)}</div>
          <div><strong>You're all set up</strong></div>
          <div class="muted" style="margin-top:6px;">Add your first student to get started.</div>
        </div>
      `;
      return;
    }

    const flagged = students.filter(s => {
      const u1 = window.aceUtils.urgency(s.annual_review_date);
      const u2 = window.aceUtils.urgency(s.reeval_due_date);
      return ['critical', 'approaching', 'overdue'].includes(u1) ||
             ['critical', 'approaching', 'overdue'].includes(u2);
    });

    if (flagged.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${window.aceIcons.check(28)}</div>
          <div><strong>You're all caught up — nice work.</strong></div>
        </div>
      `;
      return;
    }

    flagged.sort((a, b) => {
      const aMin = Math.min(
        window.aceUtils.daysUntil(a.annual_review_date) ?? 9999,
        window.aceUtils.daysUntil(a.reeval_due_date) ?? 9999
      );
      const bMin = Math.min(
        window.aceUtils.daysUntil(b.annual_review_date) ?? 9999,
        window.aceUtils.daysUntil(b.reeval_due_date) ?? 9999
      );
      return aMin - bMin;
    });

    container.innerHTML = flagged.map(s => this.needsAttentionCard(s)).join('');
  },

  needsAttentionCard(s) {
    const annualDays = window.aceUtils.daysUntil(s.annual_review_date);
    const reevalDays = window.aceUtils.daysUntil(s.reeval_due_date);

    const reasons = [];
    if (s.annual_review_date && annualDays !== null && annualDays <= 30) {
      const urgency = window.aceUtils.urgency(s.annual_review_date);
      reasons.push({
        text: annualDays < 0
          ? `Annual review overdue by ${Math.abs(annualDays)} days`
          : `Annual review in ${annualDays} days`,
        urgency
      });
    }
    if (s.reeval_due_date && reevalDays !== null && reevalDays <= 30) {
      const urgency = window.aceUtils.urgency(s.reeval_due_date);
      reasons.push({
        text: reevalDays < 0
          ? `Re-eval overdue by ${Math.abs(reevalDays)} days`
          : `Re-eval in ${reevalDays} days`,
        urgency
      });
    }

    const topUrgency = reasons.find(r => r.urgency === 'overdue' || r.urgency === 'critical')?.urgency
                       || reasons[0]?.urgency || 'approaching';

    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';

    return `
      <a href="${basePath}pages/student-profile.html?id=${s.id}" class="attention-card attention-${topUrgency}">
        <div class="attention-name">${window.aceUtils.escapeHtml(s.first_name)} ${window.aceUtils.escapeHtml(s.last_initial)}.</div>
        <div class="attention-meta">${window.aceUtils.escapeHtml(s.grade)}</div>
        <ul class="attention-reasons">
          ${reasons.map(r => `<li class="reason-${r.urgency}">${window.aceUtils.escapeHtml(r.text)}</li>`).join('')}
        </ul>
        <div class="attention-action">Open profile</div>
      </a>
    `;
  },

  async renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state-small">
        <div class="muted">Recent activity will appear here once you start using the app.</div>
      </div>
    `;
  }
};

window.aceHomepage = aceHomepage;
