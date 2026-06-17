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
            console.error('Drawer save error:', e);
            saveBtn.disabled = false;
            saveBtn.textContent = saveLabel;
          }
        } else {
          close({ confirmed: true });
        }
      });

      this._installKeyHandler(() => {
        if (onCancel) onCancel();
        close({ confirmed: false });
      });

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
            console.error('Modal confirm error:', e);
            confirmBtn.disabled = false;
          }
        } else {
          close(true);
        }
      });

      this._installKeyHandler(() => close(false));
      this._activeEl = wrapper;
    });
  },

  _installKeyHandler(onEscape) {
    this._removeKeyHandler();
    this._keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
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
