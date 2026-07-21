// =============================================================
// Ace Manager — Hard Delete Student (org admin, irreversible)
// =============================================================
// Distinct from Archive (soft-delete). Admin-only in the UI, but the real
// authority lives in the hard_delete_student() SECURITY DEFINER RPC, which
// verifies the caller is an org_admin and the student is in their org, then
// removes the student and ALL child records in one transaction. The admin must
// type the student's exact name to confirm.

const aceHardDeleteStudent = {

  async confirm(student) {
    if (!student) return false;

    const expected = `${student.first_name} ${student.last_initial}.`;
    const esc = window.aceUtils.escapeHtml;

    const bodyHTML = `
      <div class="hard-delete-body">
        <div class="hard-delete-warning">
          ${window.aceIcons.x(16)}
          <div>
            <strong>This permanently deletes ${esc(expected)} and cannot be undone.</strong>
            <p>All associated records are deleted too — meetings, teacher &amp; parent feedback,
               transition assessments, feedback links, IEP drafts, and progress trackers.
               This is different from <em>Archive</em>, which only hides the student and is reversible.</p>
          </div>
        </div>
        <label class="hard-delete-label" for="hardDeleteInput">
          Type <strong>${esc(expected)}</strong> to confirm:
        </label>
        <input type="text" id="hardDeleteInput" class="hard-delete-input" autocomplete="off" placeholder="${esc(expected)}" />
        <div id="hardDeleteError" class="hard-delete-error"></div>
      </div>
    `;

    const result = await window.aceModal.openDrawer({
      title: 'Permanently delete student',
      bodyHTML,
      saveLabel: 'Permanently delete',
      cancelLabel: 'Cancel',
      afterRender: (body) => {
        const input = body.querySelector('#hardDeleteInput');
        const saveBtn = body.parentElement.querySelector('[data-action="save"]');
        if (saveBtn) { saveBtn.classList.add('ace-btn-danger'); saveBtn.disabled = true; }
        const sync = () => {
          const ok = input.value.trim().toLowerCase() === expected.toLowerCase();
          if (saveBtn) saveBtn.disabled = !ok;
        };
        input.addEventListener('input', sync);
        setTimeout(() => input.focus(), 50);
      },
      onSave: async (body) => {
        const input = body.querySelector('#hardDeleteInput');
        const errEl = body.querySelector('#hardDeleteError');
        errEl.textContent = '';
        if (input.value.trim().toLowerCase() !== expected.toLowerCase()) {
          errEl.textContent = `Please type "${expected}" exactly to confirm.`;
          return false;
        }
        const { data, error } = await window.aceSupabase.rpc('hard_delete_student', { target_student_id: student.id });
        if (error) {
          console.error('hard_delete_student failed:', error);
          errEl.textContent = error.message || 'Could not delete this student.';
          return false;
        }
        if (!data || !data.success) {
          errEl.textContent = (data && data.message) || 'Could not delete this student.';
          return false;
        }
        return true;
      }
    });

    if (result && result.confirmed) {
      if (window.aceToast) window.aceToast.success(`${expected} permanently deleted`);
      setTimeout(() => {
        const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
        window.location.href = basePath + 'pages/caseload.html';
      }, 800);
      return true;
    }
    return false;
  }
};

window.aceHardDeleteStudent = aceHardDeleteStudent;
