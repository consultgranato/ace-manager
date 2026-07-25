// =============================================================
// Ace Manager — Toast Notifications
// =============================================================
// Usage:
//   aceToast.success('Student added')
//   aceToast.error('Could not save')
//   aceToast.info('Link copied to clipboard')
// =============================================================

const aceToast = {

  _hostId: 'aceToastHost',
  _maxStack: 3,
  _duration: 3000,

  _ensureHost() {
    let host = document.getElementById(this._hostId);
    if (!host) {
      host = document.createElement('div');
      host.id = this._hostId;
      host.className = 'ace-toast-host';
      // Announce to screen readers — confirmations like "Meeting scheduled" and
      // failures like "Could not save" were previously visual-only.
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'false');
      document.body.appendChild(host);
    }
    return host;
  },

  _show(message, type) {
    const host = this._ensureHost();

    const existing = host.querySelectorAll('.ace-toast');
    if (existing.length >= this._maxStack) {
      existing[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `ace-toast ace-toast-${type}`;
    // Errors interrupt; success/info wait their turn.
    if (type === 'error') toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
      <span class="ace-toast-icon">${this._iconFor(type)}</span>
      <span class="ace-toast-msg">${this._esc(message)}</span>
      <button type="button" class="ace-toast-close" aria-label="Dismiss">${window.aceIcons ? window.aceIcons.x(12) : '×'}</button>
    `;
    host.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('open'));

    const dismiss = () => {
      clearTimeout(timer);
      toast.classList.remove('open');
      setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector('.ace-toast-close').addEventListener('click', dismiss);

    // Errors linger — a "could not save" that vanishes in 3s is easy to miss.
    const timer = setTimeout(dismiss, type === 'error' ? 6000 : this._duration);
  },

  success(message) { this._show(message, 'success'); },
  error(message)   { this._show(message, 'error'); },
  info(message)    { this._show(message, 'info'); },

  _iconFor(type) {
    return {
      success: window.aceIcons.check(13),
      error:   window.aceIcons.x(13),
      info:    window.aceIcons.fileText(13)
    }[type] || '';
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

window.aceToast = aceToast;
