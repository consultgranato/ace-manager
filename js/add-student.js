// =============================================================
// Ace Manager — Add Student Form
// =============================================================

const aceAddStudent = {

  CASELOAD_LIMIT: 15,

  async render() {
    const { count, error: countError } = await window.aceSupabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('archived', false);

    if (countError) {
      console.error('Failed to check caseload count:', countError);
    }

    if (count !== null && count >= this.CASELOAD_LIMIT) {
      this.renderLimitReached(count);
      return;
    }

    this.renderForm(count || 0);
    this.mountCourseSelector();
    this.attachListeners();
  },

  renderForm(currentCount) {
    const host = document.getElementById('addStudentHost');
    if (!host) return;

    host.innerHTML = `
      <div class="add-student-header">
        <a href="${this.basePath()}index.html" class="back-link">← Back to Home</a>
        <h1>Add a Student</h1>
        <p class="muted">You currently have ${currentCount} of ${this.CASELOAD_LIMIT} students on your caseload.</p>
      </div>

      <form id="addStudentForm" class="student-form">

        <fieldset>
          <legend>Identity</legend>
          <div class="form-row two-col">
            <label>
              <span class="label-text">First Name <span class="required">*</span></span>
              <input type="text" id="firstName" required autocomplete="off" />
            </label>
            <label>
              <span class="label-text">Last Initial <span class="required">*</span></span>
              <input type="text" id="lastInitial" required maxlength="2" autocomplete="off" />
              <span class="field-hint">e.g., M or M.</span>
            </label>
          </div>
          <div class="form-row two-col">
            <label>
              <span class="label-text">Grade <span class="required">*</span></span>
              <select id="grade" required>
                <option value="" disabled selected>Select grade…</option>
                <option value="9 (Freshman)">9 (Freshman)</option>
                <option value="10 (Sophomore)">10 (Sophomore)</option>
                <option value="11 (Junior)">11 (Junior)</option>
                <option value="12 (Senior)">12 (Senior)</option>
              </select>
            </label>
            <label>
              <span class="label-text">Placement Type</span>
              <select id="placementType">
                <option value="">Select placement…</option>
                <option value="gen_ed">General Education</option>
                <option value="co_taught">Co-taught</option>
                <option value="sped_resource">Special Education / Resource</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Eligibility</legend>
          <div class="form-row">
            <label>
              <span class="label-text">Primary Disability <span class="required">*</span></span>
              <select id="primaryDisability" required>
                <option value="" disabled selected>Select primary eligibility…</option>
                <option value="Specific Learning Disability (SLD)">Specific Learning Disability (SLD)</option>
                <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                <option value="Other Health Impairment (OHI)">Other Health Impairment (OHI)</option>
                <option value="Intellectual Disability">Intellectual Disability</option>
                <option value="Emotional Disability (ED)">Emotional Disability (ED)</option>
                <option value="Speech or Language Impairment">Speech or Language Impairment</option>
                <option value="Multiple Disabilities">Multiple Disabilities</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <div class="form-row">
            <label>
              <span class="label-text">Secondary Disability <span class="optional">(optional)</span></span>
              <select id="secondaryDisability">
                <option value="">None</option>
                <option value="Specific Learning Disability (SLD)">Specific Learning Disability (SLD)</option>
                <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                <option value="Other Health Impairment (OHI)">Other Health Impairment (OHI)</option>
                <option value="Intellectual Disability">Intellectual Disability</option>
                <option value="Emotional Disability (ED)">Emotional Disability (ED)</option>
                <option value="Speech or Language Impairment">Speech or Language Impairment</option>
                <option value="Multiple Disabilities">Multiple Disabilities</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Classes</legend>
          <p class="field-hint" style="margin: -4px 0 12px;">Add the student's current classes. Teacher feedback links can later be sent for academic classes.</p>
          <div id="courseSelectorHost"></div>
        </fieldset>

        <fieldset>
          <legend>Supports &amp; Services</legend>
          <div class="form-row two-col">
            <label class="checkbox-label">
              <input type="checkbox" id="hasBip" />
              <span class="label-text">Behavior Intervention Plan (BIP) in place</span>
            </label>
            <label>
              <span class="label-text">Weekly Service Minutes <span class="optional">(optional)</span></span>
              <input type="number" id="serviceMinutes" min="0" max="9999" placeholder="e.g., 250" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>IEP Deadlines</legend>
          <div class="form-row two-col">
            <label>
              <span class="label-text">Annual Review Due Date <span class="optional">(optional)</span></span>
              <input type="date" id="annualReviewDate" />
              <span class="field-hint">When the annual IEP must be completed</span>
            </label>
            <label>
              <span class="label-text">Re-evaluation Due Date <span class="optional">(optional)</span></span>
              <input type="date" id="reevalDueDate" />
              <span class="field-hint">When the next 3-year re-eval is due</span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Notes</legend>
          <div class="form-row">
            <label>
              <span class="label-text">Quick Notes <span class="optional">(optional)</span></span>
              <textarea id="notes" rows="3" placeholder="Anything to remember about this student — preferred parent contact method, scheduling notes, etc."></textarea>
            </label>
          </div>
        </fieldset>

        <div id="errorMsg" class="error-msg" style="display:none;"></div>
        <div id="successMsg" class="success-msg" style="display:none;"></div>

        <div class="form-actions">
          <a href="${this.basePath()}index.html" class="btn-secondary">Cancel</a>
          <button type="submit" class="btn-primary" id="submitBtn">Add Student</button>
        </div>
      </form>
    `;
  },

  renderLimitReached(count) {
    const host = document.getElementById('addStudentHost');
    if (!host) return;
    host.innerHTML = `
      <div class="add-student-header">
        <a href="${this.basePath()}index.html" class="back-link">← Back to Home</a>
        <h1>Caseload Limit Reached</h1>
      </div>
      <div class="ace-card">
        <p>You currently have <strong>${count}</strong> active students on your caseload, which is the v1 limit of <strong>${this.CASELOAD_LIMIT}</strong>.</p>
        <p class="muted" style="margin-top:8px;">To add a new student, archive a current student first from their profile (coming in Phase 2), or contact your administrator if your actual caseload exceeds 15 students.</p>
        <a href="${this.basePath()}pages/caseload.html" class="btn-primary" style="display:inline-block;text-decoration:none;margin-top:12px;">View My Caseload</a>
      </div>
    `;
  },

  mountCourseSelector() {
    this.courseSelector = window.aceCourseSelector.mount(
      document.getElementById('courseSelectorHost'),
      []
    );
  },

  attachListeners() {
    const form = document.getElementById('addStudentForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  },

  async handleSubmit() {
    const errorEl = document.getElementById('errorMsg');
    const successEl = document.getElementById('successMsg');
    const submitBtn = document.getElementById('submitBtn');
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    const firstName = document.getElementById('firstName').value.trim();
    const lastInitialRaw = document.getElementById('lastInitial').value.trim();
    const lastInitial = lastInitialRaw.replace(/\.$/, '').toUpperCase();
    const grade = document.getElementById('grade').value;
    const primaryDisability = document.getElementById('primaryDisability').value;
    const secondaryDisability = document.getElementById('secondaryDisability').value || null;
    const placementType = document.getElementById('placementType').value || null;
    const hasBip = document.getElementById('hasBip').checked;
    const serviceMinutesRaw = document.getElementById('serviceMinutes').value;
    const serviceMinutes = serviceMinutesRaw ? parseInt(serviceMinutesRaw, 10) : null;
    const annualReviewDate = document.getElementById('annualReviewDate').value || null;
    const reevalDueDate = document.getElementById('reevalDueDate').value || null;
    const notes = document.getElementById('notes').value.trim();

    if (!firstName || !lastInitial || !grade || !primaryDisability) {
      errorEl.textContent = 'Please fill in all required fields (marked with *).';
      errorEl.style.display = 'block';
      return;
    }

    if (lastInitial.length === 0 || lastInitial.length > 2) {
      errorEl.textContent = 'Last initial must be 1 or 2 letters.';
      errorEl.style.display = 'block';
      return;
    }

    const user = await window.aceAuth.getUser();
    if (!user) {
      errorEl.textContent = 'You are not signed in. Please refresh the page.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding…';

    const { data, error } = await window.aceSupabase
      .from('students')
      .insert({
        user_id: user.id,
        first_name: firstName,
        last_initial: lastInitial,
        grade: grade,
        primary_disability: primaryDisability,
        secondary_disability: secondaryDisability,
        placement_type: placementType,
        has_bip: hasBip,
        service_minutes: serviceMinutes,
        annual_review_date: annualReviewDate,
        reeval_due_date: reevalDueDate,
        notes: notes,
        courses: this.courseSelector ? this.courseSelector.getCourses() : []
      })
      .select()
      .single();

    if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Student';
      errorEl.textContent = 'Could not save student: ' + error.message;
      errorEl.style.display = 'block';
      return;
    }

    successEl.textContent = `✓ ${firstName} ${lastInitial}. added to your caseload. Redirecting…`;
    successEl.style.display = 'block';
    setTimeout(() => {
      window.location.href = `${this.basePath()}pages/student-profile.html?id=${data.id}`;
    }, 700);
  },

  basePath() {
    const path = window.location.pathname;
    if (path.includes('/ace-manager/')) return '/ace-manager/';
    return '/';
  }
};

window.aceAddStudent = aceAddStudent;
