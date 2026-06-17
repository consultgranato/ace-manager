// =============================================================
// Ace Manager — Course Selector (reusable mountable component)
// =============================================================
// Usage:
//   const inst = window.aceCourseSelector.mount(hostEl, initialCourses);
//   inst.getCourses();  // → array of course objects
//   inst.setCourses(arr); // replace selection
// Each course: { name, code, department, is_academic, grade, teacher_name, teacher_email }
// =============================================================

const aceCourseSelector = {
  mount(containerEl, initialCourses = []) {
    if (!containerEl) return null;
    const selected = (initialCourses || []).map(c => ({ ...c }));
    const esc = window.aceUtils.escapeHtml;

    containerEl.innerHTML = `
      <div class="course-selector">
        <div class="course-search-wrap">
          <input type="text" class="course-search-input" placeholder="Search and add a class…" autocomplete="off" />
          <div class="course-dropdown" style="display:none;"></div>
        </div>
        <div class="course-empty-hint muted">No classes added yet. Search above to add the student's courses.</div>
        <div class="course-selected-list"></div>
      </div>
    `;

    const searchInput = containerEl.querySelector('.course-search-input');
    const dropdown = containerEl.querySelector('.course-dropdown');
    const listEl = containerEl.querySelector('.course-selected-list');
    const emptyHint = containerEl.querySelector('.course-empty-hint');

    function isDuplicate(course) {
      return selected.some(c =>
        (course.code && c.code === course.code) ||
        (!course.code && c.name === course.name)
      );
    }

    function renderDropdown(searchText) {
      const q = (searchText || '').trim().toLowerCase();
      if (q.length < 1) { dropdown.style.display = 'none'; return; }
      const matches = window.aceCourseCatalog
        .filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)))
        .filter(c => !isDuplicate(c));

      if (matches.length === 0) {
        dropdown.innerHTML = '<div class="course-dropdown-empty">No matching classes</div>';
        dropdown.style.display = 'block';
        return;
      }
      const groups = {};
      matches.slice(0, 60).forEach(c => {
        if (!groups[c.department]) groups[c.department] = [];
        groups[c.department].push(c);
      });
      let html = '';
      Object.keys(groups).forEach(dept => {
        html += `<div class="course-dropdown-group">${esc(dept)}</div>`;
        groups[dept].forEach(c => {
          const codeStr = c.code ? ` <span class="course-opt-code">${esc(c.code)}</span>` : '';
          html += `<div class="course-dropdown-item" data-name="${esc(c.name)}" data-code="${esc(c.code || '')}">${esc(c.name)}${codeStr}</div>`;
        });
      });
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    }

    function addCourse(name, code) {
      const cat = code
        ? window.aceCourseCatalogHelpers.findByCode(code)
        : window.aceCourseCatalogHelpers.findByName(name);
      if (!cat || isDuplicate(cat)) return;
      selected.push({
        name: cat.name, code: cat.code, department: cat.department,
        is_academic: cat.is_academic, grade: '', teacher_name: '', teacher_email: ''
      });
      searchInput.value = '';
      dropdown.style.display = 'none';
      renderSelected();
    }

    function removeCourse(idx) {
      selected.splice(idx, 1);
      renderSelected();
    }

    function renderSelected() {
      if (selected.length === 0) {
        listEl.innerHTML = '';
        emptyHint.style.display = 'block';
        return;
      }
      emptyHint.style.display = 'none';
      listEl.innerHTML = selected.map((c, i) => {
        const acPill = c.is_academic
          ? '<span class="course-pill course-pill-academic">Academic</span>'
          : '<span class="course-pill course-pill-nonacademic">Non-academic</span>';
        const codeStr = c.code ? ` <span class="course-card-code">${esc(c.code)}</span>` : '';
        const gradeOpts = ['', 'A', 'B', 'C', 'D', 'F'].map(g =>
          `<option value="${g}" ${c.grade === g ? 'selected' : ''}>${g || '—'}</option>`).join('');
        return `
          <div class="course-card" data-idx="${i}">
            <div class="course-card-header">
              <div class="course-card-title">${esc(c.name)}${codeStr} ${acPill}</div>
              <button type="button" class="course-card-remove" data-idx="${i}" aria-label="Remove class">${window.aceIcons.x(15)}</button>
            </div>
            <div class="course-card-fields">
              <label class="course-card-field course-card-grade">
                <span>Grade</span>
                <select data-idx="${i}" data-field="grade">${gradeOpts}</select>
              </label>
              <label class="course-card-field">
                <span>Teacher</span>
                <input type="text" data-idx="${i}" data-field="teacher_name" value="${esc(c.teacher_name || '')}" placeholder="Last name" />
              </label>
              <label class="course-card-field">
                <span>Email</span>
                <input type="email" data-idx="${i}" data-field="teacher_email" value="${esc(c.teacher_email || '')}" placeholder="teacher@d219.org" />
              </label>
            </div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.course-card-remove').forEach(btn => {
        btn.addEventListener('click', () => removeCourse(parseInt(btn.dataset.idx, 10)));
      });
      listEl.querySelectorAll('[data-field]').forEach(el => {
        el.addEventListener('input', () => {
          const idx = parseInt(el.dataset.idx, 10);
          const field = el.dataset.field;
          if (selected[idx]) selected[idx][field] = el.value;
        });
      });
    }

    searchInput.addEventListener('input', () => renderDropdown(searchInput.value));
    searchInput.addEventListener('focus', () => { if (searchInput.value) renderDropdown(searchInput.value); });
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.course-dropdown-item');
      if (!item) return;
      addCourse(item.dataset.name, item.dataset.code || null);
    });
    document.addEventListener('click', (e) => {
      if (!containerEl.contains(e.target)) dropdown.style.display = 'none';
    });

    renderSelected();

    return {
      getCourses() { return selected.map(c => ({ ...c })); },
      setCourses(courses) {
        selected.length = 0;
        (courses || []).forEach(c => selected.push({ ...c }));
        renderSelected();
      }
    };
  }
};

window.aceCourseSelector = aceCourseSelector;
