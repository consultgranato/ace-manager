// =============================================================
// Ace Manager — Simple Router & Auth Guard
// =============================================================

const aceRouter = {

  isProtectedPage() {
    const path = window.location.pathname;
    const publicPages = ['login.html', 'signup.html', 'reset-password.html'];
    return !publicPages.some(p => path.endsWith(p));
  },

  toLogin() {
    window.location.href = this.basePath() + 'pages/login.html';
  },

  toSignup() {
    window.location.href = this.basePath() + 'pages/signup.html';
  },

  toHome() {
    window.location.href = this.basePath() + 'index.html';
  },

  basePath() {
    const path = window.location.pathname;
    if (path.includes('/ace-manager/')) {
      return '/ace-manager/';
    }
    return '/';
  },

  async guardPage() {
    const session = await window.aceAuth.getSession();
    const isProtected = this.isProtectedPage();

    if (isProtected && !session) {
      this.toLogin();
      return false;
    }

    if (!isProtected && session) {
      this.toHome();
      return false;
    }

    return true;
  }
};

window.aceRouter = aceRouter;
