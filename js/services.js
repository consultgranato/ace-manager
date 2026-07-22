// =============================================================
// Ace Manager — Related Services card (student profile)
// =============================================================
// A reference list of the related services a student receives: what it is,
// how much, and who delivers it. Reference only — no scheduling, no session
// logging, no compensatory-minutes math. The system of record for service
// delivery stays elsewhere; this is here so a case manager can see a
// student's service picture at a glance while working the profile.

const aceServices = {

  SERVICE_TYPES: [
    'Resource / Academic Support', 'Speech-Language', 'Social Work / Counseling',
    'Occupational Therapy', 'Physical Therapy', 'Vision', 'Hearing',
    'Adaptive PE', 'Transportation', 'Other'
  ],

  async render(host, student) {
    if (!host) return;
    this._host = host; this._student = student;

    const { data, error } = await window.aceSupabase.from('services').select('*')
      .eq('student_id', student.id).order('created_at', { ascending: true });

    if (error) {
      console.error('Services load failed:', error);
      host.innerHTML = '<p class="muted">Could not load services.</p>';
      return;
    }

    this._services = data || [];
    this._paint();
  },

  _paint() {
    const host = this._host;
    const esc = window.aceUtils.escapeHtml;

    const amount = (s) => [
      s.minutes_per_week ? `${s.minutes_per_week} min/week` : '',
      s.frequency ? esc(s.frequency) : ''
    ].filter(Boolean).join(' · ');

    host.innerHTML = `
      ${this._services.length === 0
        ? '<p class="muted" style="font-size:13px;margin:0 0 10px;">No related services recorded.</p>'
        : ''}
      ${this._services.map(s => `
        <div class="svc-row" data-id="${s.id}">
          <div class="svc-info">
            <div class="svc-name">${esc(s.service_type)}${s.provider ? ` <span class="muted">· ${esc(s.provider)}</span>` : ''}</div>
            ${amount(s) ? `<div class="svc-meta muted">${amount(s)}</div>` : ''}
          </div>
          <div class="svc-actions">
            <button class="goal-mini-btn" data-svc-action="edit" data-id="${s.id}">Edit</button>
            <button class="goal-mini-btn goal-mini-danger" data-svc-action="delete" data-id="${s.id}">Remove</button>
          </div>
        </div>`).join('')}
      <button class="card-action" id="svcAddBtn">${window.aceIcons.plus(14)} Add Service</button>
    `;

    host.querySelector('#svcAddBtn').addEventListener('click', () => this._openForm(null));
    host.querySelectorAll('[data-svc-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const svc = this._services.find(s => s.id === btn.dataset.id);
        if (btn.dataset.svcAction === 'edit') this._openForm(svc);
        else this._delete(svc);
      });
    });
  },

  async _openForm(existing) {
    const esc = window.aceUtils.escapeHtml;
    const s = existing || {};
    const r = await window.aceModal.openDrawer({
      title: existing ? 'Edit service' : 'Add service',
      saveLabel: existing ? 'Save' : 'Add service',
      bodyHTML: `
        <label class="iep-label">Service</label>
        <select id="svcType">${this.SERVICE_TYPES.map(t =>
          `<option ${s.service_type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <label class="iep-label">Minutes per week <span class="goalb-hint">optional</span></label>
        <input type="number" id="svcMinutes" min="0" max="3000" value="${s.minutes_per_week ?? ''}" placeholder="60" />
        <label class="iep-label">Frequency <span class="goalb-hint">optional</span></label>
        <input type="text" id="svcFrequency" value="${esc(s.frequency || '')}" placeholder="2× 30 min sessions" />
        <label class="iep-label">Provider <span class="goalb-hint">optional</span></label>
        <input type="text" id="svcProvider" value="${esc(s.provider || '')}" placeholder="Name or role" />
        <div id="svcError" class="hard-delete-error"></div>`,
      onSave: async (body) => {
        const raw = body.querySelector('#svcMinutes').value.trim();
        const row = {
          student_id: this._student.id,
          service_type: body.querySelector('#svcType').value,
          minutes_per_week: raw === '' ? 0 : Number(raw),
          frequency: body.querySelector('#svcFrequency').value.trim(),
          provider: body.querySelector('#svcProvider').value.trim()
        };
        const resp = existing
          ? await window.aceSupabase.from('services').update(row).eq('id', existing.id)
          : await window.aceSupabase.from('services').insert(row);
        if (resp.error) { body.querySelector('#svcError').textContent = resp.error.message; return false; }
        return true;
      }
    });
    if (r && r.confirmed) await this.render(this._host, this._student);
  },

  async _delete(svc) {
    if (!svc) return;
    const ok = await window.aceModal.openModal({
      title: `Remove ${svc.service_type}?`,
      message: 'This removes the service from the student\'s reference list.',
      confirmLabel: 'Remove service', variant: 'danger',
      onConfirm: async () => {
        const { error } = await window.aceSupabase.from('services').delete().eq('id', svc.id);
        if (error) throw error;
      }
    });
    if (ok) { window.aceToast?.success('Service removed'); await this.render(this._host, this._student); }
  }
};

window.aceServices = aceServices;
