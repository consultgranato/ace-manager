// =============================================================
// Ace Manager — Edit Student Module
// =============================================================
// Provides openEditDrawer(student) — uses the modal system to show
// a right-slide drawer with the student form pre-populated.
// =============================================================

const aceEditStudent = {

  async open(student) {
    if (!student) return;

    const bodyHTML = this.buildFormHTML(student);

    const result = await window.aceModal.openDrawer({
      title: `Edit ${student.first_name} ${student.last_initial}.`,
      bodyHTML,
      saveLabel: 'Save Changes',
      cancelLabel: 'Cancel',
      afterRender: (drawerBody) => {
        const host = drawerBody.querySelector('#editCourseSelectorHost');
        this._courseSelector = window.aceCourseSelector.mount(host, student.courses || []);
      },
      onSave: async (drawerBody) => {
        return await this.handleSave(drawerBody, student);
      }
    });

    return result;
  },

  buildFormHTML(s) {
    const esc = window.aceUtils.escapeHtml;
    const sel = (val, opt) => val === opt ? 'selected' : '';
    return `
      <form id="editStudentForm" class="student-form" style="gap:14px;">
        <div class="form-row two-col">
          <label>
            <span class="label-text">First Name <span class="required">*</span></span>
            <input type="text" id="editFirstName" required value="${esc(s.first_name || '')}" />
          </label>
          <label>
            <span class="label-text">Last Initial <span class="required">*</span></span>
            <input type="text" id="editLastInitial" required maxlength="2" value="${esc(s.last_initial || '')}" />
          </label>
        </div>

        <div class="form-row two-col">
          <label>
            <span class="label-text">Grade <span class="required">*</span></span>
            <select id="editGrade" required>
              <option value="9 (Freshman)" ${sel(s.grade, '9 (Freshman)')}>9 (Freshman)</option>
              <option value="10 (Sophomore)" ${sel(s.grade, '10 (Sophomore)')}>10 (Sophomore)</option>
              <option value="11 (Junior)" ${sel(s.grade, '11 (Junior)')}>11 (Junior)</option>
              <option value="12 (Senior)" ${sel(s.grade, '12 (Senior)')}>12 (Senior)</option>
            </select>
          </label>
          <label>
            <span class="label-text">Placement</span>
            <select id="editPlacementType">
              <option value="" ${sel(s.placement_type, null)}>Select…</option>
              <option value="gen_ed" ${sel(s.placement_type, 'gen_ed')}>General Education</option>
              <option value="co_taught" ${sel(s.placement_type, 'co_taught')}>Co-taught</option>
              <option value="sped_resource" ${sel(s.placement_type, 'sped_resource')}>SpEd / Resource</option>
              <option value="mixed" ${sel(s.placement_type, 'mixed')}>Mixed</option>
            </select>
          </label>
        </div>

        <div class="form-row">
          <label>
            <span class="label-text">Primary Disability <span class="required">*</span></span>
            <select id="editPrimaryDisability" required>
              ${this.disabilityOptionsHTML(s.primary_disability)}
            </select>
          </label>
        </div>

        <div class="form-row">
          <label>
            <span class="label-text">Secondary Disability <span class="optional">(optional)</span></span>
            <select id="editSecondaryDisability">
              <option value="" ${sel(s.secondary_disability, null)}>None</option>
              ${this.disabilityOptionsHTML(s.secondary_disability, true)}
            </select>
          </label>
        </div>

        <div class="form-row two-col">
          <label class="checkbox-label">
            <input type="checkbox" id="editHasBip" ${s.has_bip ? 'checked' : ''} />
            <span class="label-text">BIP in place</span>
          </label>
          <label>
            <span class="label-text">Weekly Service Minutes</span>
            <input type="number" id="editServiceMinutes" min="0" max="9999" value="${s.service_minutes ?? ''}" />
          </label>
        </div>

        <div class="form-row two-col">
          <label>
            <span class="label-text">Annual Review Due</span>
            <input type="date" id="editAnnualReviewDate" value="${esc(s.annual_review_date || '')}" />
          </label>
          <label>
            <span class="label-text">Re-evaluation Due</span>
            <input type="date" id="editReevalDueDate" value="${esc(s.reeval_due_date || '')}" />
          </label>
        </div>

        <div class="form-row two-col">
          <label>
            <span class="label-text">Referral Date <span class="muted">(initial evals only)</span></span>
            <input type="date" id="editReferralDate" value="${esc(s.referral_date || '')}" />
          </label>
          <label>
            <span class="label-text">Consent Signed <span class="muted">(starts 60-school-day clock)</span></span>
            <input type="date" id="editConsentDate" value="${esc(s.consent_date || '')}" />
          </label>
        </div>

        <div class="form-row">
          <label>
            <span class="label-text">Classes</span>
          </label>
          <div id="editCourseSelectorHost"></div>
        </div>

        <div id="editErrorMsg" class="error-msg" style="display:none;"></div>
      </form>
    `;
  },

  disabilityOptionsHTML(currentValue, skipFirst) {
    const options = [
      'Specific Learning Disability (SLD)',
      'Autism Spectrum Disorder',
      'Other Health Impairment (OHI)',
      'Intellectual Disability',
      'Emotional Disability (ED)',
      'Speech or Language Impairment',
      'Multiple Disabilities',
      'Other'
    ];
    const esc = window.aceUtils.escapeHtml;
    const placeholder = skipFirst ? '' : '<option value="" disabled>Select…</option>';
    const opts = options.map(o => `<option value="${esc(o)}" ${currentValue === o ? 'selected' : ''}>${esc(o)}</option>`).join('');
    return placeholder + opts;
  },

  async handleSave(drawerBody, student) {
    const errEl = drawerBody.querySelector('#editErrorMsg');
    errEl.style.display = 'none';

    const firstName = drawerBody.querySelector('#editFirstName').value.trim();
    const lastInitialRaw = drawerBody.querySelector('#editLastInitial').value.trim();
    const lastInitial = lastInitialRaw.replace(/\.$/, '').toUpperCase();
    const grade = drawerBody.querySelector('#editGrade').value;
    const primaryDisability = drawerBody.querySelector('#editPrimaryDisability').value;
    const secondaryDisability = drawerBody.querySelector('#editSecondaryDisability').value || null;
    const placementType = drawerBody.querySelector('#editPlacementType').value || null;
    const hasBip = drawerBody.querySelector('#editHasBip').checked;
    const serviceMinutesRaw = drawerBody.querySelector('#editServiceMinutes').value;
    const serviceMinutes = serviceMinutesRaw ? parseInt(serviceMinutesRaw, 10) : null;
    const annualReviewDate = drawerBody.querySelector('#editAnnualReviewDate').value || null;
    const reevalDueDate = drawerBody.querySelector('#editReevalDueDate').value || null;

    if (!firstName || !lastInitial || !grade || !primaryDisability) {
      errEl.textContent = 'Please fill in all required fields.';
      errEl.style.display = 'block';
      return false;
    }

    const { data, error } = await window.aceSupabase
      .from('students')
      .update({
        first_name: firstName,
        last_initial: lastInitial,
        grade,
        primary_disability: primaryDisability,
        secondary_disability: secondaryDisability,
        placement_type: placementType,
        has_bip: hasBip,
        service_minutes: serviceMinutes,
        annual_review_date: annualReviewDate,
        reeval_due_date: reevalDueDate,
        referral_date: drawerBody.querySelector('#editReferralDate').value || null,
        consent_date: drawerBody.querySelector('#editConsentDate').value || null,
        courses: this._courseSelector ? this._courseSelector.getCourses() : (student.courses || [])
      })
      .eq('id', student.id)
      .select()
      .single();

    if (error) {
      errEl.textContent = 'Could not save: ' + error.message;
      errEl.style.display = 'block';
      return false;
    }

    if (window.aceToast) window.aceToast.success('Changes saved');
    if (window.aceStore) window.aceStore.set('currentStudent', data);

    return data;
  }
};

window.aceEditStudent = aceEditStudent;
