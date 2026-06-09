// =============================================================
// Ace Manager — Calendar Widget
// =============================================================

const aceCalendar = {

  state: {
    view: 'month',
    currentDate: new Date(),
    events: []
  },

  async render(targetEl) {
    if (!targetEl) return;
    await this.loadEvents();
    targetEl.innerHTML = this.buildHTML();
    this.attachListeners(targetEl);
  },

  async loadEvents() {
    this.state.events = [];

    // Load students with their deadline dates
    const { data: students, error: stErr } = await window.aceSupabase
      .from('students')
      .select('id, first_name, last_initial, annual_review_date, reeval_due_date')
      .eq('archived', false);

    if (stErr) {
      console.error('Calendar: failed to load students', stErr);
      return;
    }

    // Load all non-completed meetings
    const { data: meetings, error: mtErr } = await window.aceSupabase
      .from('meetings')
      .select('id, scheduled_date, meeting_type, completed, student_id, students(first_name, last_initial)');

    if (mtErr) {
      console.error('Calendar: failed to load meetings', mtErr);
      return;
    }

    // Build a map of student_id -> non-completed meetings for fast lookup
    const meetingsByStudent = {};
    (meetings || []).forEach(m => {
      if (m.completed) return;
      if (!meetingsByStudent[m.student_id]) meetingsByStudent[m.student_id] = [];
      meetingsByStudent[m.student_id].push(m);
    });

    // Apply takeover logic per student
    students?.forEach(s => {
      const studentMeetings = meetingsByStudent[s.id] || [];

      // Annual review deadline — show only if no scheduled meeting on-or-before it
      if (s.annual_review_date) {
        const deadline = new Date(s.annual_review_date);
        const hasCoveringMeeting = studentMeetings.some(m => {
          const md = new Date(m.scheduled_date);
          return md <= deadline;
        });
        if (!hasCoveringMeeting) {
          this.state.events.push({
            date: s.annual_review_date,
            type: 'annual',
            title: `Annual: ${s.first_name} ${s.last_initial}.`,
            studentId: s.id
          });
        }
      }

      // Re-eval deadline — same takeover rule
      if (s.reeval_due_date) {
        const deadline = new Date(s.reeval_due_date);
        const hasCoveringMeeting = studentMeetings.some(m => {
          const md = new Date(m.scheduled_date);
          return md <= deadline;
        });
        if (!hasCoveringMeeting) {
          this.state.events.push({
            date: s.reeval_due_date,
            type: 'reeval',
            title: `Re-eval: ${s.first_name} ${s.last_initial}.`,
            studentId: s.id
          });
        }
      }
    });

    // Add scheduled (non-completed) meetings as their own events
    meetings?.forEach(m => {
      if (m.completed) return;
      const name = m.students ? `${m.students.first_name} ${m.students.last_initial}.` : 'Student';
      this.state.events.push({
        date: m.scheduled_date,
        type: 'meeting',
        title: `${this.capitalizeFirst(m.meeting_type)} meeting: ${name}`,
        studentId: m.student_id
      });
    });
  },

  buildHTML() {
    const headerHTML = this.buildHeaderHTML();
    const bodyHTML = this.state.view === 'month' ? this.buildMonthHTML() : this.buildWeekHTML();
    return `
      <div class="calendar-widget">
        ${headerHTML}
        ${bodyHTML}
        <div class="calendar-legend">
          <span><span class="legend-dot legend-annual"></span> Annual review</span>
          <span><span class="legend-dot legend-reeval"></span> Re-evaluation</span>
          <span><span class="legend-dot legend-meeting"></span> Scheduled meeting</span>
        </div>
      </div>
    `;
  },

  buildHeaderHTML() {
    const d = this.state.currentDate;
    const label = this.state.view === 'month'
      ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : this.weekLabel(d);

    return `
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="cal-nav-btn" data-action="prev" aria-label="Previous">${window.aceIcons.chevronLeft(16)}</button>
          <button class="cal-today-btn" data-action="today">Today</button>
          <button class="cal-nav-btn" data-action="next" aria-label="Next">${window.aceIcons.chevronRight(16)}</button>
        </div>
        <div class="calendar-title">${label}</div>
        <div class="calendar-view-toggle">
          <button class="cal-view-btn ${this.state.view === 'month' ? 'active' : ''}" data-view="month">Month</button>
          <button class="cal-view-btn ${this.state.view === 'week' ? 'active' : ''}" data-view="week">Week</button>
        </div>
      </div>
    `;
  },

  buildMonthHTML() {
    const d = this.state.currentDate;
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="cal-grid">';

    dayNames.forEach(n => {
      html += `<div class="cal-dow">${n}</div>`;
    });

    for (let i = 0; i < startDayOfWeek; i++) {
      html += '<div class="cal-cell cal-blank"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const iso = this.toISO(cellDate);
      const isToday = cellDate.getTime() === today.getTime();
      const events = this.eventsForDate(iso);
      const urgency = this.urgencyForEvents(events);

      let classes = 'cal-cell';
      if (isToday) classes += ' cal-today';
      if (urgency) classes += ' cal-' + urgency;

      const eventDots = events.slice(0, 3).map(e =>
        `<span class="cal-event-dot dot-${e.type}" title="${window.aceUtils.escapeHtml(e.title)}"></span>`
      ).join('');

      const overflow = events.length > 3 ? `<span class="cal-overflow">+${events.length - 3}</span>` : '';

      html += `
        <div class="${classes}" data-date="${iso}">
          <div class="cal-daynum">${day}</div>
          <div class="cal-events">${eventDots}${overflow}</div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  buildWeekHTML() {
    const d = new Date(this.state.currentDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0,0,0,0);

    let html = '<div class="cal-week-grid">';

    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(sunday);
      cellDate.setDate(sunday.getDate() + i);
      const iso = this.toISO(cellDate);
      const isToday = cellDate.getTime() === today.getTime();
      const events = this.eventsForDate(iso);
      const urgency = this.urgencyForEvents(events);

      let classes = 'cal-week-cell';
      if (isToday) classes += ' cal-today';
      if (urgency) classes += ' cal-' + urgency;

      const eventList = events.map(e =>
        `<div class="cal-week-event event-${e.type}">${window.aceUtils.escapeHtml(e.title)}</div>`
      ).join('');

      html += `
        <div class="${classes}" data-date="${iso}">
          <div class="cal-week-header">
            <div class="cal-week-dow">${dayNames[i]}</div>
            <div class="cal-week-daynum">${cellDate.getDate()}</div>
          </div>
          <div class="cal-week-events">${eventList || '<div class="cal-week-empty">—</div>'}</div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  attachListeners(root) {
    root.querySelectorAll('.cal-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.action);
        this.render(root);
      });
    });

    const todayBtn = root.querySelector('.cal-today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.state.currentDate = new Date();
        this.render(root);
      });
    }

    root.querySelectorAll('.cal-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.view = btn.dataset.view;
        this.render(root);
      });
    });

    root.querySelectorAll('.cal-cell[data-date], .cal-week-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.dataset.date;
        const events = this.eventsForDate(date);
        if (events.length === 0) return;

        const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';

        if (events.length === 1) {
          // Single event — navigate directly to that student's profile
          window.location.href = `${basePath}pages/student-profile.html?id=${events[0].studentId}`;
          return;
        }

        // Multiple events on same date — open a small popover
        this.showDayPopover(cell, date, events, basePath);
      });
    });
  },

  navigate(direction) {
    if (this.state.view === 'month') {
      const d = new Date(this.state.currentDate);
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
      this.state.currentDate = d;
    } else {
      const d = new Date(this.state.currentDate);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      this.state.currentDate = d;
    }
  },

  showDayPopover(cell, date, events, basePath) {
    // Remove any existing popover
    document.querySelectorAll('.cal-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'cal-popover';

    const dateLabel = window.aceUtils.formatLongDate(date);
    popover.innerHTML = `
      <div class="cal-popover-header">${dateLabel}</div>
      <div class="cal-popover-list">
        ${events.map(e => `
          <a href="${basePath}pages/student-profile.html?id=${e.studentId}" class="cal-popover-item">
            <span class="cal-popover-dot dot-${e.type}"></span>
            <span class="cal-popover-title">${window.aceUtils.escapeHtml(e.title)}</span>
          </a>
        `).join('')}
      </div>
    `;

    // Position popover near the clicked cell
    document.body.appendChild(popover);
    const rect = cell.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 6;
    let left = rect.left + window.scrollX;
    if (left + popRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popRect.width - 16;
    }
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // Close on outside click
    const closeHandler = (e) => {
      if (!popover.contains(e.target)) {
        popover.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 50);
  },

  eventsForDate(isoDate) {
    return this.state.events.filter(e => e.date === isoDate);
  },

  urgencyForEvents(events) {
    if (events.length === 0) return null;
    const days = events.map(e => window.aceUtils.daysUntil(e.date)).filter(n => n !== null);
    if (days.length === 0) return null;
    const min = Math.min(...days);
    if (min < 0 || min <= 7) return 'critical';
    if (min <= 30) return 'approaching';
    return null;
  },

  toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  weekLabel(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const sameMonth = sunday.getMonth() === saturday.getMonth();
    const start = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = sameMonth
      ? saturday.getDate()
      : saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} – ${end}, ${saturday.getFullYear()}`;
  },

  capitalizeFirst(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
};

window.aceCalendar = aceCalendar;
