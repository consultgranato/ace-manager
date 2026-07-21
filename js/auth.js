// =============================================================
// Ace Manager — Authentication Module
// =============================================================

const aceAuth = {

  async signUp(email, password, fullName, schoolName) {
    const { data, error } = await window.aceSupabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          school_name: schoolName
        }
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await window.aceSupabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    return { data, error };
  },

  async resetPassword(email) {
    const redirectUrl = window.location.origin + '/ace-manager/pages/reset-password.html';
    const { data, error } = await window.aceSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { data, error };
  },

  async updatePassword(newPassword) {
    const { data, error } = await window.aceSupabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  },

  async signOut() {
    this._orgPromise = null;
    this._profilePromise = null;
    const { error } = await window.aceSupabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session } } = await window.aceSupabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await window.aceSupabase.auth.getUser();
    return user;
  },

  async getProfile() {
    const user = await this.getUser();
    if (!user) return null;
    const { data, error } = await window.aceSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    return data;
  },

  // Cached profile for the current page load — role/org gating (sidebar, Team
  // page, hard-delete visibility, the unassigned holding screen) all read this,
  // so we fetch the row once. Cleared on signOut.
  _profilePromise: null,

  getProfileCached() {
    if (!this._profilePromise) this._profilePromise = this.getProfile();
    return this._profilePromise;
  },

  async isOrgAdmin() {
    const p = await this.getProfileCached();
    return !!p && p.role === 'org_admin';
  },

  async updateProfile(updates) {
    const user = await this.getUser();
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await window.aceSupabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    return { data, error };
  },

  // ---- Organization (Phase 4a.2) ------------------------------
  // The org row carries everything that is district-specific: the non-school-day
  // calendar and branding (school name, logo, accent). Fetched once per page load
  // and shared — every caller awaits the same promise, so concurrent callers
  // (sidebar, settings, meetings countback) never trigger a second request.

  _orgPromise: null,

  getOrg() {
    if (!this._orgPromise) this._orgPromise = this._fetchOrg();
    return this._orgPromise;
  },

  async _fetchOrg() {
    const profile = await this.getProfile();
    if (!profile || !profile.org_id) return null;
    const { data, error } = await window.aceSupabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single();
    if (error) {
      console.error('Organization fetch error:', error);
      return null;
    }
    return data;
  },

  // Update the current user's org. RLS permits this for org_admin only; a
  // non-admin gets an error back, which callers surface rather than swallow.
  async updateOrg(updates) {
    const org = await this.getOrg();
    if (!org) return { error: { message: 'No organization for this account' } };
    const { data, error } = await window.aceSupabase
      .from('organizations')
      .update(updates)
      .eq('id', org.id)
      .select()
      .single();
    if (!error && data) this._orgPromise = Promise.resolve(data);
    return { data, error };
  },

  // Branding with per-field fallback to ACE_DEFAULT_BRANDING, so a missing org
  // row or a half-populated branding object still renders the current look.
  async getBranding() {
    const defaults = window.ACE_DEFAULT_BRANDING || {};
    let branding = {};
    try {
      const org = await this.getOrg();
      if (org && org.branding && typeof org.branding === 'object') branding = org.branding;
    } catch (e) { /* fall through to defaults */ }
    return {
      school_name: branding.school_name || defaults.school_name || '',
      logo_url: branding.logo_url || defaults.logo_url || '',
      accent: branding.accent || defaults.accent || ''
    };
  },

  onAuthChange(callback) {
    return window.aceSupabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

window.aceAuth = aceAuth;
