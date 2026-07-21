// =============================================================
// Ace Manager — Related Services & Minutes card (student profile)
// =============================================================
// The service schedule (type, provider, minutes/week) plus a delivery log.
// Missed sessions are tracked against makeups: the card surfaces an amber
// "N sessions to make up" count (missed minus makeup) — the compensatory-
// services number a due-process review asks for.

const aceServices = {

  SERVICE_TYPES: [
    'Resource / Academic Support', 'Speech-Language', 'Social Work / Counseling',
    'Occupational Therapy', 'Physical Therapy', 'Vision', 'Hearing',
    'Adaptive PE', 'Transportation', 'Other'
  ],

  async render(host, student) {
    if (!host) return;
    this._host = host; this._student = student;

    const [{ data: services, error }, logsResp] = await Promise.all([
      window.aceSupabase.from('services').select('*')
        .eq('student_id', student.id).order('created_at', { ascending: true }),
      window.aceSupabase.from('service_logs').select('*, services!inner(student_id)')
        .eq('services.student_id', student.id).order('log_date', { ascending: false })
    ]);
    if (error) { console.error('Services load failed:', error); host.innerHTML = '<p class="muted">Could not load services.</p>'; return; }

    this._services = services || [];
    this._logs = logsResp.data || [];
    this._paint();
  },

  _paint() {
    const host = this._host;
    const esc = window.aceUtils.escapeHtml;
    const logsByService = {};
    this._logs.forEach(l => (logsByService[l.service_id] = logsByService[l.service_id] || []).push(l));

    const missed = this._logs.filter(l => l.status === 'missed').length;
    const makeups = this._logs.filter(l => l.status === 'makeup').length;
    const owed = Math.max(0, missed - makeups);

    host.innerHTML = `
      ${this._services.length === 0 ? '<p class="muted" style="font-size:13px;margin:0 0 10px;">No services on file.</p>' : ''}
      ${owed > 0 ? `<div class="svc-owed">${window.aceIcons.calendar(13)} ${owed} missed session${owed === 1 ? '' : 's'} to make up</div>` : ''}
      ${this._services.map(s => {
        const logs = logsByService[s.id] || [];
        const last = logs[0];
        return `
          <div class="svc-row" data-id="${s.id}">
            <div class="svc-info">
              <div class="svc-name">${esc(s.service_type)}${s.provider ? ` <span class="muted">· ${esc(s.provider)}</span>` : ''}</div>
              <div class="svc-meta muted">${s.minutes_per_week} min/week${s.frequency ? ` · ${esc(s.frequency)}` : ''}${s.location ? ` · ${esc(s.location)}` : ''}</div>
              ${last ? `<div class="svc-meta muted">Last: ${window.aceUtils.formatShortDate(last.log_date)} — ${last.status}${last.minutes ? `, ${last.minutes} min` : ''}</div>` : ''}
            </div>
            <div class="svc-actions">
              <button class="goal-mini-btn" data-svc-action="log" data-id="${s.id}">${window.aceIcons.plus(12)} Log</button>
              <button class="goal-mini-btn" data-svc-action="edit" data-id="${s.id}">Edit</button>
              <button class="goal-mini-btn goal-mini-danger" data-svc-action="delete" data-id="${s.id}">Delete</button>
            </div>
          </div>`;
      }).join('')}
      <button class="card-action" id="svcAddBtn">${window.aceIcons.plus(14)} Add Service</button>
    `;

    host.querySelector('#svcAddBtn').addEventListener('click', () => this._openForm(null));
    host.querySelectorAll('[data-svc-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const svc = this._services.find(s => s.id === btn.dataset.id);
        const a = btn.dataset.svcAction;
        if (a === 'edit') this._openForm(svc);
        else if (a === 'log') this._openLog(svc);
        else if (a === 'delete') this._delete(svc);
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
        <label class="iep-label">Provider <span class="goalb-hint">optional</span></label>
        <input type="text" id="svcProvider" value="${esc(s.provider || '')}" placeholder="Name or role" />
        <label class="iep-label">Minutes per week</label>
        <input type="number" id="svcMinutes" min="0" max="3000" value="${s.minutes_per_week ?? ''}" placeholder="60" />
        <label class="iep-label">Frequency <span class="goalb-hint">optional</span></label>
        <input type="text" id="svcFrequency" value="${esc(s.frequency || '')}" placeholder="2× 30 min sessions" />
        <label class="iep-label">Location <span class="goalb-hint">optional</span></label>
        <input type="text" id="svcLocation" value="${esc(s.location || '')}" placeholder="Resource room" />
        <div id="svcError" class="hard-delete-error"></div>`,
      onSave: async (body) => {
        const errEl = body.querySelector('#svcError');
        const minutes = Number(body.querySelector('#svcMinutes').value);
        if (!minutes && minutes !== 0) { errEl.textContent = 'Minutes per week is required.'; return false; }
        const row = {
          student_id: this._student.id,
          service_type: body.querySelector('#svcType').value,
          provider: body.querySelector('#svcProvider').value.trim(),
          minutes_per_week: minutes,
          frequency: body.querySelector('#svcFrequency').value.trim(),
          location: body.querySelector('#svcLocation').value.trim()
        };
        const resp = existing
          ? await window.aceSupabase.from('services').update(row).eq('id', existing.id)
          : await window.aceSupabase.from('services').insert(row);
        if (resp.error) { errEl.textContent = resp.error.message; return false; }
        return true;
      }
    });
    if (r && r.confirmed) await this.render(this._host, this._student);
  },

  async _openLog(svc) {
    if (!svc) return;
    const esc = window.aceUtils.escapeHtml;
    const r = await window.aceModal.openDrawer({
      title: `Log session — ${svc.service_type}`,
      saveLabel: 'Log session',
      bodyHTML: `
        <label class="iep-label">Date</label>
        <input type="date" id="slDate" value="${window.aceUtils.todayISO()}" />
        <label class="iep-label">Status</label>
        <select id="slStatus">
          <option value="delivered">Delivered</option>
          <option value="missed">Missed</option>
          <option value="makeup">Make-up session</option>
        </select>
        <label class="iep-label">Minutes</label>
        <input type="number" id="slMinutes" min="0" max="600" value="${Math.round((svc.minutes_per_week || 0) / 2) || ''}" />
        <label class="iep-label">Note <span class="goalb-hint">optional</span></label>
        <input type="text" id="slNote" placeholder="Student absent / assembly / covered goal 2" />
        <div id="slError" class="hard-delete-error"></div>`,
      afterRender: (body) => {
        // A missed session has no delivered minutes; zero it to keep totals honest.
        const status = body.querySelector('#slStatus');
        const mins = body.querySelector('#slMinutes');
        status.addEventListener('change', () => {
          if (status.value === 'missed') { mins.value = 0; mins.disabled = true; }
          else { mins.disabled = false; }
        });
      },
      onSave: async (body) => {
        const errEl = body.querySelector('#slError');
        const date = body.querySelector('#slDate').value;
        if (!date) { errEl.textContent = 'Date is required.'; return false; }
        const { error } = await window.aceSupabase.from('service_logs').insert({
          service_id: svc.id,
          log_date: date,
          status: body.querySelector('#slStatus').value,
          minutes: Number(body.querySelector('#slMinutes').value) || 0,
          note: body.querySelector('#slNote').value.trim()
        });
        if (error) { errEl.textContent = error.message; return false; }
        return true;
      }
    });
    if (r && r.confirmed) { window.aceToast?.success('Session logged'); await this.render(this._host, this._student); }
  },

  async _delete(svc) {
    if (!svc) return;
    const ok = await window.aceModal.openModal({
      title: `Remove ${svc.service_type}?`,
      message: 'The service and its delivery log will be removed. This cannot be undone.',
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
