// =============================================================
// Ace Manager — Related Services card (student profile)
// =============================================================
// Reference only, deliberately minimal: which related services does this
// student receive? A chip per service type — click to toggle on or off —
// plus one optional note. No minutes, no frequency, no provider; the system
// of record for service delivery stays elsewhere. Each selected type is one
// row in `services` (service_type only); the note lives on the student row.

const aceServices = {

  SERVICE_TYPES: [
    'Speech-Language',
    'Occupational Therapy',
    'Physical Therapy',
    'Social Work',
    'Counseling',
    'School Psychologist',
    'Nursing / Health',
    'Vision Services',
    'Hearing / Audiology',
    'Orientation & Mobility',
    'Assistive Technology',
    'Behavioral Support (BCBA)',
    'Adaptive PE',
    'Transportation',
    'Interpreting Services'
  ],

  async render(host, student) {
    if (!host) return;
    this._host = host; this._student = student;

    const { data, error } = await window.aceSupabase.from('services').select('*')
      .eq('student_id', student.id);

    if (error) {
      console.error('Services load failed:', error);
      host.innerHTML = '<p class="muted">Could not load services.</p>';
      return;
    }

    // One chip per distinct type; rowsByType lets toggle-off delete any
    // duplicate rows left over from the pre-simplification card.
    this._rowsByType = {};
    (data || []).forEach(r => {
      (this._rowsByType[r.service_type] = this._rowsByType[r.service_type] || []).push(r);
    });
    this._paint();
  },

  _selectedTypes() {
    return Object.keys(this._rowsByType);
  },

  _paint() {
    const host = this._host;
    const esc = window.aceUtils.escapeHtml;
    const selected = new Set(this._selectedTypes());

    // Legacy rows may carry a type no longer on the standard list (e.g.
    // "Resource / Academic Support") — keep showing them so nothing silently
    // disappears; they can be toggled off like any other.
    const legacy = this._selectedTypes().filter(t => !this.SERVICE_TYPES.includes(t));
    const all = this.SERVICE_TYPES.concat(legacy);

    host.innerHTML = `
      <p class="muted svc-hint">Which related services does this student receive? Click to toggle. Reference only.</p>
      <div class="svc-chipgrid">
        ${all.map(t => `
          <button type="button" class="svc-chip ${selected.has(t) ? 'selected' : ''}" data-type="${esc(t)}">
            ${selected.has(t) ? window.aceIcons.check(12) + ' ' : ''}${esc(t)}
          </button>`).join('')}
      </div>
      <label class="iep-label svc-note-label">Note <span class="goalb-hint">optional — providers, context, anything worth remembering</span></label>
      <textarea id="svcNote" class="svc-note" rows="2"
        placeholder="Speech twice a week with Ms. Alvarez; OT is consult-only.">${esc(this._student.related_services_note || '')}</textarea>
      <div class="svc-note-status muted" id="svcNoteStatus"></div>
    `;

    host.querySelectorAll('.svc-chip').forEach(chip => {
      chip.addEventListener('click', () => this._toggle(chip.dataset.type));
    });

    // Debounced auto-save for the note — same pattern as profile quick notes.
    const note = host.querySelector('#svcNote');
    const status = host.querySelector('#svcNoteStatus');
    let timer = null;
    note.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const value = note.value;
        const { error } = await window.aceSupabase.from('students')
          .update({ related_services_note: value }).eq('id', this._student.id);
        if (error) { status.textContent = 'Could not save note'; return; }
        this._student.related_services_note = value;
        status.textContent = 'Saved';
        setTimeout(() => { if (status.textContent === 'Saved') status.textContent = ''; }, 2000);
      }, 900);
    });
  },

  async _toggle(type) {
    const rows = this._rowsByType[type];
    if (rows && rows.length) {
      const { error } = await window.aceSupabase.from('services').delete()
        .in('id', rows.map(r => r.id));
      if (error) { window.aceToast?.error('Could not update services'); return; }
      delete this._rowsByType[type];
    } else {
      const { data, error } = await window.aceSupabase.from('services')
        .insert({ student_id: this._student.id, service_type: type })
        .select().single();
      if (error) { window.aceToast?.error('Could not update services'); return; }
      this._rowsByType[type] = [data];
    }
    this._paint();
  }
};

window.aceServices = aceServices;
