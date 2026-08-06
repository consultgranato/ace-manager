// =============================================================
// Ace Manager — lazy data loader
// =============================================================
// The goal bank and probe bank are large offline data files (a few hundred
// kilobytes together). Loading them in every page's <script> list would tax
// every profile view for the sake of two drawers that most visits never open,
// so they are fetched on demand and cached for the rest of the session.
//
// The path is derived from an already-loaded script tag rather than hardcoded,
// because the app is served from a page directory (/pages/student-profile.html)
// as well as from the root, and a wrong relative path here would surface as an
// empty goal bank rather than as an error.

(function () {
  'use strict';

  const loaded = {};    // name -> Promise

  function basePath() {
    const tag = document.querySelector('script[src*="js/config.js"], script[src*="js/utils.js"]');
    if (tag) {
      const src = tag.getAttribute('src') || '';
      const cut = src.indexOf('js/');
      if (cut >= 0) return src.slice(0, cut);
    }
    return '';
  }

  function load(name) {
    if (loaded[name]) return loaded[name];
    loaded[name] = new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      const v = window.BUILD_VERSION ? '?v=' + window.BUILD_VERSION : '';
      s.src = basePath() + 'data/' + name + '.js' + v;
      s.async = true;
      s.onload = function () { resolve(true); };
      s.onerror = function () {
        // Let a retry be possible: a dropped connection should not permanently
        // poison the cache with a rejected promise.
        delete loaded[name];
        reject(new Error('Could not load ' + name));
      };
      document.head.appendChild(s);
    });
    return loaded[name];
  }

  // Both banks together: the goal bank needs the pool registry from the probe
  // bank to describe a goal's monitoring plan, so they are always loaded as a
  // pair rather than letting a goal render with an unknown probe method.
  function banks() {
    if (window.ACE_GOAL_BANK && window.ACE_PROBE_BANK) return Promise.resolve(true);
    return Promise.all([load('probe-bank'), load('goal-bank')]).then(function () {
      if (window.aceGoalModel) window.aceGoalModel.reset();
      return true;
    });
  }

  window.aceLazyData = { load: load, banks: banks };
})();
