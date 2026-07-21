// =============================================================
// Ace Manager — Team (org admin: provision & manage case managers)
// =============================================================
// All authority is enforced in the SECURITY DEFINER RPCs (assign/remove/list);
// this page is admin-only UI on top of them. A case manager who reaches it sees
// a no-access message, and every action still passes through the guarded RPCs.

const aceTeam = {

  async render() {
    const host = document.getElementById('teamHost');
    if (!host) return;

    const profile = await window.aceAuth.getProfileCached();
    this._selfId = profile?.id || null;
    const isAdmin = profile?.role === 'org_admin';

    if (!isAdmin) {
      host.innerHTML = `
        <div class="settings-page">
          <header class="settings-header"><h1>Team</h1></header>
          <div class="settings-card">
            <p class="muted" style="margin:0;">Team management is available to organization admins only.</p>
          </div>
        </div>`;
      return;
    }

    host.innerHTML = `
      <div class="settings-page">
        <header class="settings-header">
          <h1>Team</h1>
          <p class="muted">Add case managers to your organization and manage who has access.</p>
        </header>

        <section class="settings-section">
          <h2 class="settings-section-title">Add a case manager</h2>
          <div class="settings-card">
            <p class="muted settings-note" style="margin-top:0;">
              The person must have already created an Ace Manager account. Enter the email
              they signed up with; they'll get access the next time they sign in.
            </p>
            <div class="team-add-row">
              <input type="email" id="teamAddEmail" placeholder="name@school.org" autocomplete="off" />
              <button class="btn-primary" id="teamAddBtn" type="button">${window.aceIcons.plus(14)} Add</button>
            </div>
            <div id="teamAddStatus" class="team-status muted"></div>
          </div>
        </section>

        <section class="settings-section">
          <h2 class="settings-section-title">Members</h2>
          <div id="teamList" class="settings-card-list">
            <div class="muted">Loading team…</div>
          </div>
        </section>
      </div>
    `;

    const addBtn = document.getElementById('teamAddBtn');
    const input = document.getElementById('teamAddEmail');
    if (addBtn) addBtn.addEventListener('click', () => this.addMember());
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addMember(); });

    await this.loadTeam();
  },

  async loadTeam() {
    const list = document.getElementById('teamList');
    if (!list) return;

    const { data, error } = await window.aceSupabase.rpc('list_my_org_team');
    if (error) {
      console.error('list_my_org_team failed:', error);
      list.innerHTML = '<div class="muted">Could not load the team.</div>';
      return;
    }
    if (!data || data.length === 0) {
      list.innerHTML = '<div class="muted">No members yet.</div>';
      return;
    }

    const esc = window.aceUtils.escapeHtml;
    list.innerHTML = data.map(m => {
      const isSelf = m.user_id === this._selfId;
      const roleLabel = m.role === 'org_admin' ? 'Admin' : 'Case manager';
      const name = (m.full_name && m.full_name.trim()) ? m.full_name : '(name not set)';
      return `
        <div class="team-row" data-id="${esc(m.user_id)}">
          <div class="team-info">
            <div class="team-name">${esc(name)}${isSelf ? ' <span class="team-you">you</span>' : ''}</div>
            <div class="team-meta muted">${esc(m.email)} · ${esc(roleLabel)}</div>
          </div>
          ${isSelf
            ? ''
            : `<button class="btn-secondary team-remove-btn" data-id="${esc(m.user_id)}" data-name="${esc(name)}">${window.aceIcons.x(14)} Remove</button>`}
        </div>`;
    }).join('');

    list.querySelectorAll('.team-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeMember(btn.dataset.id, btn.dataset.name));
    });
  },

  async addMember() {
    const input = document.getElementById('teamAddEmail');
    const btn = document.getElementById('teamAddBtn');
    const status = document.getElementById('teamAddStatus');
    const email = (input?.value || '').trim();

    status.className = 'team-status muted';
    if (!email) { status.textContent = 'Enter an email address.'; return; }

    if (btn) btn.disabled = true;
    status.textContent = 'Adding…';

    const { data, error } = await window.aceSupabase.rpc('assign_user_to_my_org', { target_email: email });
    if (btn) btn.disabled = false;

    if (error) {
      console.error('assign_user_to_my_org failed:', error);
      status.className = 'team-status team-status-error';
      status.textContent = error.message || 'Could not add that user.';
      return;
    }

    if (data && data.success) {
      status.className = 'team-status team-status-ok';
      status.textContent = data.message || 'Member added.';
      if (input) input.value = '';
      if (window.aceToast) window.aceToast.success('Member added');
      await this.loadTeam();
    } else {
      status.className = 'team-status team-status-error';
      status.textContent = (data && data.message) || 'Could not add that user.';
    }
  },

  async removeMember(userId, name) {
    if (!userId) return;
    const confirmed = await window.aceModal.openModal({
      title: `Remove ${name}?`,
      message: `${name} will lose access to your organization's students and data. Their account and any records they created remain, and you can add them back later.`,
      confirmLabel: 'Remove member',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        const { data, error } = await window.aceSupabase.rpc('remove_user_from_my_org', { target_user_id: userId });
        if (error) throw error;
        if (!data || !data.success) throw new Error((data && data.message) || 'Could not remove member');
      }
    });
    if (confirmed) {
      if (window.aceToast) window.aceToast.success('Member removed');
      await this.loadTeam();
    }
  }
};

window.aceTeam = aceTeam;
