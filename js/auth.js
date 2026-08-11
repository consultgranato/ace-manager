// =============================================================
// Ace Manager — Authentication Module
// =============================================================

const aceAuth = {

  // joinCode (optional) rides in user metadata; the holding screen redeems it
  // via join_org_with_code on the first authenticated load (Phase 5.4c).
  async signUp(email, password, fullName, schoolName, joinCode) {
    const { data, error } = await window.aceSupabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          school_name: schoolName,
          join_code: (joinCode || '').trim() || null
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

  // Currently unreachable: pages/reset-password.html no longer offers the
  // self-serve request form, because the project has no custom SMTP and
  // Supabase's built-in sender only delivers to members of the Supabase
  // project. Kept intact — wiring that form back up is the whole change once
  // SMTP exists. Do NOT call this from new code until then: it resolves
  // without error and delivers nothing.
  async resetPassword(email) {
    // Derive the path the same way aceRouter does instead of hardcoding the
    // GitHub Pages sub-path, so reset links also work on a custom domain or
    // when running the app locally.
    const basePath = (window.aceRouter && window.aceRouter.basePath())
      || (window.location.pathname.includes('/ace-manager/') ? '/ace-manager/' : '/');
    const redirectUrl = window.location.origin + basePath + 'pages/reset-password.html';
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
    let org = null;
    try {
      org = await this.getOrg();
      if (org && org.branding && typeof org.branding === 'object') branding = org.branding;
    } catch (e) { /* fall through to defaults */ }
    return {
      // An org that never filled in branding falls back to its OWN identity
      // before the product default — never to another district's name.
      school_name: branding.school_name || (org && (org.school_name || org.name)) || defaults.school_name || '',
      logo_url: branding.logo_url || defaults.logo_url || '',
      accent: branding.accent || defaults.accent || ''
    };
  },

  // The accent an org has actually chosen for itself, or null.
  //
  // Deliberately NOT getBranding().accent: that one falls back to the product
  // default so the sidebar always has something to render. This is the colour
  // gate, and a gate that falls back isn't a gate. It returns a value only when
  // the signed-in user is an assigned member of an org (profile.org_id set, org
  // row readable under RLS) AND that org row carries its own accent. So Niles
  // North's purple reaches the page only for a confirmed Niles North case
  // manager; a pending signup, a public form, or an org that never picked a
  // colour all stay on the neutral grey the stylesheet already painted.
  async getOrgAccent() {
    try {
      const org = await this.getOrg();
      const accent = org && org.branding && org.branding.accent;
      // Anything that isn't a plain hex is ignored rather than written into a
      // custom property, where a junk value would silently break the whole ramp.
      return (typeof accent === 'string' && /^#[0-9a-f]{6}$/i.test(accent.trim()))
        ? accent.trim()
        : null;
    } catch (e) {
      return null;
    }
  },

  onAuthChange(callback) {
    return window.aceSupabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

window.aceAuth = aceAuth;
