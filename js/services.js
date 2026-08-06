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

    // Lead with what this student actually receives. This card is in the
    // Reference section, and a reference should answer the question on the way
    // in — "speech and social work, plus a BIP" — rather than making the case
    // manager read a grid of fifteen options to work it out. Selections made
    // during onboarding land here, so this is where they show up.
    const chosen = this._selectedTypes().slice().sort();
    const bip = !!this._student.has_bip;
    const summary = (chosen.length || bip)
      ? `<div class="svc-summary">
           <span class="svc-summary-label">Receives</span>
           <span class="svc-summary-list">${chosen.map(t => `<span class="svc-summary-item">${esc(t)}</span>`).join('')}
           ${bip ? '<span class="svc-summary-item svc-summary-bip">Behavior Intervention Plan</span>' : ''}</span>
         </div>`
      : `<div class="svc-summary svc-summary-empty muted">No related services recorded${bip ? ' (a BIP is in place)' : ''}. Select any below.</div>`;

    host.innerHTML = `
      ${summary}
      <p class="muted svc-hint">Click to toggle. Reference only — minutes, frequency and provider schedules stay in Embrace.</p>
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

    // Toggling a chip repaints this card. Flush any note the case manager has
    // typed but not yet auto-saved first — the repaint reads the note back from
    // the student row, so unsaved text used to disappear on the next chip click.
    host.querySelectorAll('.svc-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        await this._flushNote();
        this._toggle(chip.dataset.type);
      });
    });

    // Debounced auto-save for the note — same pattern as profile quick notes.
    const note = host.querySelector('#svcNote');
    const status = host.querySelector('#svcNoteStatus');
    this._noteEl = note;
    note.addEventListener('input', () => {
      clearTimeout(this._noteTimer);
      this._noteTimer = setTimeout(() => this._saveNote(note.value), 900);
    });
    note.addEventListener('blur', () => this._flushNote());
  },

  // Persist the current note text now, cancelling any pending debounce.
  async _flushNote() {
    clearTimeout(this._noteTimer);
    this._noteTimer = null;
    const el = this._noteEl;
    if (!el) return;
    const value = el.value;
    if (value === (this._student.related_services_note || '')) return;
    await this._saveNote(value);
  },

  async _saveNote(value) {
    const status = this._host && this._host.querySelector('#svcNoteStatus');
    const { error } = await window.aceSupabase.from('students')
      .update({ related_services_note: value }).eq('id', this._student.id);
    if (error) {
      if (status) status.textContent = 'Could not save note';
      window.aceToast?.error('Could not save the services note');
      return;
    }
    this._student.related_services_note = value;
    if (status) {
      status.textContent = 'Saved';
      setTimeout(() => { if (status.textContent === 'Saved') status.textContent = ''; }, 2000);
    }
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
