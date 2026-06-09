// =============================================================
// Ace Manager — Archive Student Module
// =============================================================

const aceArchiveStudent = {

  async confirm(student) {
    if (!student) return false;

    const name = `${student.first_name} ${student.last_initial}.`;
    const confirmed = await window.aceModal.openModal({
      title: `Archive ${name}?`,
      message: `${name} will move to your archive and disappear from your active caseload. You can restore them anytime from the Caseload page.`,
      confirmLabel: 'Archive Student',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await window.aceSupabase
          .from('students')
          .update({ archived: true })
          .eq('id', student.id);
        if (error) throw error;
      }
    });

    if (confirmed) {
      if (window.aceToast) window.aceToast.success(`${name} archived`);
      setTimeout(() => {
        const basePath = window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/';
        window.location.href = basePath + 'pages/caseload.html';
      }, 800);
    }

    return confirmed;
  },

  async restore(student) {
    if (!student) return false;
    const { error } = await window.aceSupabase
      .from('students')
      .update({ archived: false })
      .eq('id', student.id);
    if (error) {
      if (window.aceToast) window.aceToast.error('Could not restore student');
      return false;
    }
    if (window.aceToast) window.aceToast.success(`${student.first_name} ${student.last_initial}. restored`);
    return true;
  }
};

window.aceArchiveStudent = aceArchiveStudent;
