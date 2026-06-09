// =============================================================
// Ace Manager — Global Sidebar
// =============================================================

const aceSidebar = {

  async render(targetEl) {
    if (!targetEl) return;

    const profile = await window.aceAuth.getProfile();
    const fullName = profile?.full_name || 'Case Manager';
    const schoolName = profile?.school_name || '';

    const path = window.location.pathname;
    const isHome = path.endsWith('index.html') || path.endsWith('/ace-manager/') || path.endsWith('/ace-manager');
    const isCaseload = path.endsWith('caseload.html');
    const isSettings = path.endsWith('settings.html');

    targetEl.innerHTML = `
      <aside class="ace-sidebar" id="aceSidebar">
        <div class="sidebar-brand">
          <img src="${this.basePath()}assets/vikings-logo.jpg" alt="Niles North Vikings" class="brand-logo" />
          <div class="brand-text">
            <div class="brand-name">ACE MANAGER</div>
            <div class="brand-school">${this.escapeHtml(schoolName)}</div>
            <div class="brand-user">${this.escapeHtml(fullName)}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a href="${this.basePath()}index.html" class="nav-item ${isHome ? 'active' : ''}">
            <span class="nav-icon">${window.aceIcons.home(17)}</span>
            <span class="nav-label">Home</span>
          </a>
          <a href="${this.basePath()}pages/caseload.html" class="nav-item ${isCaseload ? 'active' : ''}">
            <span class="nav-icon">${window.aceIcons.users(17)}</span>
            <span class="nav-label">My Caseload</span>
          </a>
        </nav>

        <div class="sidebar-section-title">Students</div>
        <div class="sidebar-students" id="sidebarStudents">
          <div class="sidebar-empty">No students yet. Click <strong>+ New Student</strong> to add one.</div>
        </div>

        <button class="sidebar-add-btn" id="sidebarAddStudent">
          ${window.aceIcons.plus(15)} New Student
        </button>

        <div class="sidebar-footer">
          <a href="${this.basePath()}pages/settings.html" class="nav-item ${isSettings ? 'active' : ''}">
            <span class="nav-icon">${window.aceIcons.settings(17)}</span>
            <span class="nav-label">Settings</span>
          </a>
          <button class="sidebar-logout" id="sidebarLogout">
            <span class="nav-icon">${window.aceIcons.logOut(15)}</span>
            Sign Out
          </button>
        </div>
      </aside>

      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">${window.aceIcons.menu(18)}</button>
    `;

    this.attachListeners();
    this.loadStudents();
  },

  attachListeners() {
    const logoutBtn = document.getElementById('sidebarLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.aceAuth.signOut();
        window.aceRouter.toLogin();
      });
    }

    const addBtn = document.getElementById('sidebarAddStudent');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.location.href = this.basePath() + 'pages/add-student.html';
      });
    }

    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const sidebar = document.getElementById('aceSidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }

    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('aceSidebar');
      const toggle = document.getElementById('sidebarToggle');
      if (!sidebar || !toggle) return;
      if (window.innerWidth > 900) return;
      if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
      sidebar.classList.remove('open');
    });
  },

  async loadStudents() {
    const container = document.getElementById('sidebarStudents');
    if (!container) return;

    const { data: students, error } = await window.aceSupabase
      .from('students')
      .select('id, first_name, last_initial, grade, annual_review_date, reeval_due_date')
      .eq('archived', false)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Failed to load students:', error);
      container.innerHTML = '<div class="sidebar-empty">Could not load students.</div>';
      return;
    }

    if (!students || students.length === 0) {
      container.innerHTML = '<div class="sidebar-empty">No students yet. Click <strong>+ New Student</strong> to add one.</div>';
      return;
    }

    // Bulk fetch all meetings for these students in one query
    const studentIds = students.map(s => s.id);
    let meetingsByStudent = {};
    if (window.aceMeetings && studentIds.length > 0) {
      const { data: meetings } = await window.aceSupabase
        .from('meetings')
        .select('*')
        .in('student_id', studentIds);
      (meetings || []).forEach(m => {
        if (!meetingsByStudent[m.student_id]) meetingsByStudent[m.student_id] = [];
        meetingsByStudent[m.student_id].push(m);
      });
    }

    container.innerHTML = students.map(s => {
      let dotClass = 'dot-gray';
      if (window.aceStatus && window.aceMeetings) {
        const active = window.aceMeetings.computeActiveFromMeetings(meetingsByStudent[s.id] || []);
        const state = window.aceStatus.fullState(s, active);
        dotClass = `dot-${state.dot}`;
      } else {
        dotClass = this.computeStatusDot(s);
      }
      return `
        <a href="${this.basePath()}pages/student-profile.html?id=${s.id}" class="sidebar-student">
          <span class="status-dot ${dotClass}"></span>
          <span class="student-name">${this.escapeHtml(s.first_name)} ${this.escapeHtml(s.last_initial)}.</span>
          <span class="student-grade">${this.escapeHtml(s.grade)}</span>
        </a>
      `;
    }).join('');
  },

  computeStatusDot(student) {
    const today = new Date();
    const dates = [student.annual_review_date, student.reeval_due_date]
      .filter(d => d)
      .map(d => new Date(d));

    if (dates.length === 0) return 'dot-green';

    const soonest = dates.reduce((min, d) => d < min ? d : min);
    const daysUntil = Math.floor((soonest - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'dot-red';
    if (daysUntil <= 7) return 'dot-red';
    if (daysUntil <= 30) return 'dot-yellow';
    return 'dot-green';
  },

  basePath() {
    const path = window.location.pathname;
    if (path.includes('/ace-manager/')) return '/ace-manager/';
    return '/';
  },

  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.aceSidebar = aceSidebar;
