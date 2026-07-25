// =============================================================
// Ace Manager — Modal & Drawer System
// =============================================================
// Provides two patterns:
//  - openDrawer({ title, bodyHTML, onSave, saveLabel, cancelLabel })
//    Right-slide panel for forms (Edit Student, Schedule Meeting)
//  - openModal({ title, message, onConfirm, confirmLabel, cancelLabel, variant })
//    Centered confirmation modal (Archive, Mark Complete, Delete)
//
// Both auto-create their host elements on first use.
// Both support: backdrop click to dismiss, Esc to dismiss, focus management.
// =============================================================

const aceModal = {

  _hostId: 'aceModalHost',
  _activeEl: null,
  _keyHandler: null,
  _restoreFocusTo: null,

  _FOCUSABLE: 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',

  // Move focus into the panel (first real field, else the first control) and
  // remember where it came from so it can be handed back on close. The header
  // comment has promised focus management since day one; this implements it.
  _takeFocus(panel) {
    this._restoreFocusTo = document.activeElement;
    const items = panel.querySelectorAll(this._FOCUSABLE);
    const preferred = panel.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
    const target = preferred || items[0];
    if (target) { try { target.focus(); } catch (e) { /* non-fatal */ } }
  },

  _giveBackFocus() {
    const el = this._restoreFocusTo;
    this._restoreFocusTo = null;
    if (el && typeof el.focus === 'function' && document.contains(el)) {
      try { el.focus(); } catch (e) { /* non-fatal */ }
    }
  },

  // Keep Tab inside the open panel — otherwise keyboard focus walks off into the
  // page behind the backdrop, which is unreachable by pointer.
  _trapTab(panel, e) {
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(this._FOCUSABLE)]
      .filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  },

  _ensureHost() {
    let host = document.getElementById(this._hostId);
    if (!host) {
      host = document.createElement('div');
      host.id = this._hostId;
      document.body.appendChild(host);
    }
    return host;
  },

  openDrawer({ title, bodyHTML, saveLabel = 'Save', cancelLabel = 'Cancel', onSave, onCancel, afterRender }) {
    return new Promise((resolve) => {
      const host = this._ensureHost();
      const id = 'drawer-' + Date.now();

      const wrapper = document.createElement('div');
      wrapper.className = 'ace-drawer-wrap';
      wrapper.dataset.id = id;
      wrapper.innerHTML = `
        <div class="ace-drawer-backdrop"></div>
        <div class="ace-drawer" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
          <div class="ace-drawer-header">
            <h2 id="${id}-title">${this._esc(title)}</h2>
            <button class="ace-drawer-close" aria-label="Close">×</button>
          </div>
          <div class="ace-drawer-body">
            ${bodyHTML || ''}
          </div>
          <div class="ace-drawer-footer">
            <button class="ace-btn-secondary" data-action="cancel">${this._esc(cancelLabel)}</button>
            <button class="ace-btn-primary" data-action="save">${this._esc(saveLabel)}</button>
          </div>
        </div>
      `;
      host.appendChild(wrapper);

      if (typeof afterRender === 'function') {
        afterRender(wrapper.querySelector('.ace-drawer-body'));
      }

      requestAnimationFrame(() => wrapper.classList.add('open'));

      const close = (result) => {
        wrapper.classList.remove('open');
        setTimeout(() => {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
          this._removeKeyHandler();
          this._giveBackFocus();
          resolve(result);
        }, 250);
      };

      wrapper.querySelector('.ace-drawer-close').addEventListener('click', () => {
        if (onCancel) onCancel();
        close({ confirmed: false });
      });

      wrapper.querySelector('.ace-drawer-backdrop').addEventListener('click', () => {
        if (onCancel) onCancel();
        close({ confirmed: false });
      });

      wrapper.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        if (onCancel) onCancel();
        close({ confirmed: false });
      });

      wrapper.querySelector('[data-action="save"]').addEventListener('click', async () => {
        if (onSave) {
          const saveBtn = wrapper.querySelector('[data-action="save"]');
          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving…';
          try {
            const result = await onSave(wrapper.querySelector('.ace-drawer-body'));
            if (result === false) {
              saveBtn.disabled = false;
              saveBtn.textContent = saveLabel;
              return;
            }
            close({ confirmed: true, result });
          } catch (e) {
            // Surface it — a thrown save used to only reach the console, so the
            // button just came back to life with no explanation.
            console.error('Drawer save error:', e);
            if (window.aceToast) window.aceToast.error(e && e.message ? e.message : 'Could not save');
            saveBtn.disabled = false;
            saveBtn.textContent = saveLabel;
          }
        } else {
          close({ confirmed: true });
        }
      });

      const panel = wrapper.querySelector('.ace-drawer');
      this._installKeyHandler(() => {
        if (onCancel) onCancel();
        close({ confirmed: false });
      }, panel);
      this._takeFocus(panel);

      this._activeEl = wrapper;
    });
  },

  openModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, variant = 'default' }) {
    return new Promise((resolve) => {
      const host = this._ensureHost();
      const id = 'modal-' + Date.now();

      const wrapper = document.createElement('div');
      wrapper.className = 'ace-modal-wrap';
      wrapper.dataset.id = id;
      wrapper.innerHTML = `
        <div class="ace-modal-backdrop"></div>
        <div class="ace-modal ace-modal-${this._esc(variant)}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
          <h3 id="${id}-title">${this._esc(title)}</h3>
          <p class="ace-modal-message">${this._esc(message)}</p>
          <div class="ace-modal-actions">
            <button class="ace-btn-secondary" data-action="cancel">${this._esc(cancelLabel)}</button>
            <button class="ace-btn-${variant === 'danger' ? 'danger' : 'primary'}" data-action="confirm">${this._esc(confirmLabel)}</button>
          </div>
        </div>
      `;
      host.appendChild(wrapper);

      requestAnimationFrame(() => wrapper.classList.add('open'));

      const close = (confirmed) => {
        wrapper.classList.remove('open');
        setTimeout(() => {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
          this._removeKeyHandler();
          this._giveBackFocus();
          resolve(confirmed);
        }, 200);
      };

      wrapper.querySelector('.ace-modal-backdrop').addEventListener('click', () => close(false));
      wrapper.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false));
      wrapper.querySelector('[data-action="confirm"]').addEventListener('click', async () => {
        if (onConfirm) {
          const confirmBtn = wrapper.querySelector('[data-action="confirm"]');
          confirmBtn.disabled = true;
          try {
            await onConfirm();
            close(true);
          } catch (e) {
            // A failed archive / delete / purge used to look like a no-op: the
            // button simply re-enabled with the reason hidden in the console.
            console.error('Modal confirm error:', e);
            if (window.aceToast) window.aceToast.error(e && e.message ? e.message : 'That action could not be completed');
            confirmBtn.disabled = false;
          }
        } else {
          close(true);
        }
      });

      const panel = wrapper.querySelector('.ace-modal');
      this._installKeyHandler(() => close(false), panel);
      this._takeFocus(panel);
      this._activeEl = wrapper;
    });
  },

  _installKeyHandler(onEscape, panel) {
    this._removeKeyHandler();
    this._keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }
      if (panel) this._trapTab(panel, e);
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  _removeKeyHandler() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
};

window.aceModal = aceModal;
