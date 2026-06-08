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

  onAuthChange(callback) {
    return window.aceSupabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

window.aceAuth = aceAuth;
