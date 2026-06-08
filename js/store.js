// =============================================================
// Ace Manager — In-Memory Store
// =============================================================
// Simple pub/sub store for caching the currently-active student
// and other transient session state across components.
//
// Usage:
//   aceStore.set('currentStudent', studentObj)
//   const s = aceStore.get('currentStudent')
//   const unsub = aceStore.subscribe('currentStudent', (newVal) => {...})
//   unsub() // to stop listening
// =============================================================

const aceStore = {

  _state: {},
  _subscribers: {},

  set(key, value) {
    this._state[key] = value;
    this._notify(key, value);
  },

  get(key) {
    return this._state[key];
  },

  update(key, patch) {
    const current = this._state[key] || {};
    const updated = { ...current, ...patch };
    this._state[key] = updated;
    this._notify(key, updated);
  },

  clear(key) {
    delete this._state[key];
    this._notify(key, null);
  },

  subscribe(key, callback) {
    if (!this._subscribers[key]) this._subscribers[key] = [];
    this._subscribers[key].push(callback);
    return () => {
      this._subscribers[key] = (this._subscribers[key] || []).filter(cb => cb !== callback);
    };
  },

  _notify(key, value) {
    (this._subscribers[key] || []).forEach(cb => {
      try { cb(value); } catch(e) { console.error('Store subscriber error:', e); }
    });
  }
};

window.aceStore = aceStore;
