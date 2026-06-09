// =============================================================
// Ace Manager — Homepage Assembly
// =============================================================

const aceHomepage = {

  async render() {
    await this.renderGreeting();
    await this.renderCalendar();
    await this.renderNeedsAttention();
    await this.renderRecentMeetings();
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

    // Load all active students
    const { data: students, error } = await window.aceSupabase
      .from('students')
      .select('*')
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

    // For each student, get their meeting state + status
    const enriched = await Promise.all(students.map(async (s) => {
      const meetingActive = window.aceMeetings ? await window.aceMeetings.getActiveMeeting(s.id) : null;
      const state = window.aceStatus.fullState(s, meetingActive);
      return { student: s, meetingActive, state };
    }));

    // Filter to only students that need attention
    const flagged = enriched.filter(e => e.state.needsAttention);

    if (flagged.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${window.aceIcons.check(28)}</div>
          <div><strong>You're all caught up — nice work.</strong></div>
        </div>
      `;
      return;
    }

    // Sort by urgency (most urgent first)
    const urgencyOrder = { overdue: 4, critical: 3, approaching: 2, clear: 1, none: 0 };
    flagged.sort((a, b) => (urgencyOrder[b.state.urgency] || 0) - (urgencyOrder[a.state.urgency] || 0));

    container.innerHTML = flagged.map(({ student, state }) => this.attentionCardHTML(student, state)).join('');
  },

  attentionCardHTML(s, state) {
    const esc = window.aceUtils.escapeHtml;
    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';

    // Map state.urgency to the existing attention-{urgency} CSS class
    const urgencyClass = state.urgency === 'overdue' || state.urgency === 'critical'
      ? 'attention-critical'
      : state.urgency === 'approaching'
        ? 'attention-approaching'
        : 'attention-clear';

    // Add a state-kind class so we can style the meeting-related cards distinctly
    const stateClass = `attention-${state.stateKind.replace('_', '-')}`;

    return `
      <a href="${basePath}pages/student-profile.html?id=${s.id}" class="attention-card ${urgencyClass} ${stateClass}">
        <div class="attention-name">${esc(s.first_name)} ${esc(s.last_initial)}.</div>
        <div class="attention-meta">${esc(s.grade)}</div>
        <div class="attention-headline">${esc(state.headline)}</div>
        ${state.subline ? `<div class="attention-subline">${esc(state.subline)}</div>` : ''}
        <div class="attention-action">Open profile</div>
      </a>
    `;
  },

  async renderRecentMeetings() {
    const container = document.getElementById('recentMeetings');
    if (!container) return;

    // Past 21 days of completed meetings
    const twentyOneDaysAgo = new Date();
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
    const cutoffStr = twentyOneDaysAgo.toISOString().split('T')[0];

    const { data: meetings, error } = await window.aceSupabase
      .from('meetings')
      .select('*, students(id, first_name, last_initial, archived)')
      .eq('completed', true)
      .gte('scheduled_date', cutoffStr)
      .order('scheduled_date', { ascending: false });

    if (error) {
      container.innerHTML = '<div class="muted">Could not load recent meetings.</div>';
      return;
    }

    // Filter out meetings for archived students
    const active = (meetings || []).filter(m => m.students && !m.students.archived);

    if (active.length === 0) {
      // Don't show empty state for this zone — it's optional context
      container.innerHTML = '';
      const wrap = container.closest('.home-section');
      if (wrap) wrap.style.display = 'none';
      return;
    }

    // Show the section
    const wrap = container.closest('.home-section');
    if (wrap) wrap.style.display = '';

    container.innerHTML = active.map(m => this.recentMeetingHTML(m)).join('');

    // Wire up expand/collapse + checkbox handling
    container.querySelectorAll('.recent-meeting').forEach(card => {
      const toggle = card.querySelector('.recent-toggle');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          card.classList.toggle('expanded');
        });
      }

      card.querySelectorAll('.recent-followup-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', async (e) => {
          e.stopPropagation();
          const meetingId = card.dataset.meetingId;
          const idx = parseInt(cb.dataset.index, 10);
          if (!window.aceMeetings) return;
          const ok = await window.aceMeetings.toggleFollowupItem(meetingId, idx, cb.checked);
          if (!ok) {
            cb.checked = !cb.checked;
            return;
          }
          const li = cb.closest('.recent-followup-item');
          if (li) li.classList.toggle('completed', cb.checked);
          const countEl = card.querySelector('.recent-followup-count');
          const checkedCount = card.querySelectorAll('.recent-followup-item input:checked').length;
          const total = card.querySelectorAll('.recent-followup-item').length;
          if (countEl) countEl.textContent = `${checkedCount} of ${total} done`;
          if (checkedCount === total) card.classList.add('all-done');
          else card.classList.remove('all-done');
        });
      });
    });
  },

  recentMeetingHTML(meeting) {
    const esc = window.aceUtils.escapeHtml;
    const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
    const student = meeting.students;
    const dateStr = window.aceUtils.formatShortDate(meeting.scheduled_date);
    const typeLabel = window.aceMeetings?.meetingTypeLabel(meeting.meeting_type) || meeting.meeting_type;
    const followups = meeting.followup_checklist || [];
    const done = followups.filter(i => i.completed).length;
    const total = followups.length;
    const allDone = total > 0 && done === total;

    const followupsHTML = followups.map((item, i) => `
      <li class="recent-followup-item ${item.completed ? 'completed' : ''}">
        <label>
          <input type="checkbox" data-index="${i}" ${item.completed ? 'checked' : ''} />
          <span>${esc(item.label)}</span>
        </label>
      </li>
    `).join('');

    return `
      <div class="recent-meeting ${allDone ? 'all-done' : ''}" data-meeting-id="${meeting.id}">
        <div class="recent-meeting-header">
          <div class="recent-meeting-info">
            <a href="${basePath}pages/student-profile.html?id=${student.id}" class="recent-meeting-name">
              ${esc(student.first_name)} ${esc(student.last_initial)}.
            </a>
            <div class="recent-meeting-meta">
              <span class="recent-meeting-type">${esc(typeLabel)}</span>
              <span class="dot-sep">·</span>
              <span>${esc(dateStr)}</span>
            </div>
          </div>
          <button class="recent-toggle" aria-label="Toggle follow-up checklist">
            <span class="recent-followup-count">${done} of ${total} done</span>
            <span class="recent-chevron">${window.aceIcons.chevronRight(14)}</span>
          </button>
        </div>
        <ul class="recent-followup-list">
          ${followupsHTML}
        </ul>
      </div>
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
