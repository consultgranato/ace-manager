#!/usr/bin/env node
// ============================================================
// Ace Manager — cache-busting version bumper (Phase 3.x, infra)
//
// WHY: GitHub Pages + browser caching kept serving stale JS/CSS after a
// deploy, so changes didn't go live without a manual hard refresh. This
// script gives every deploy a fresh ?v= query string so caches invalidate.
//
// RUN THIS ON EVERY DEPLOY, BEFORE COMMITTING:
//     node bump-version.js
//     git add . && git commit && git push origin main
//
// WHAT IT DOES:
//   1. Generates a new BUILD_VERSION (UTC timestamp, YYYYMMDDHHMMSS).
//   2. Writes it into js/config.js  ->  window.BUILD_VERSION = '<version>';
//   3. Refreshes ?v=<BUILD_VERSION> on every LOCAL <script src> and stylesheet
//      <link href> in every root-level *.html and pages/*.html.
//
// The CDN Supabase tag is a full https:// URL, so the local-path regex below
// (js/… or css/… only) never matches it — it is left untouched, as required.
// Idempotent: re-running simply replaces the existing ?v= value.
// ============================================================

const fs = require('fs');
const path = require('path');

// UTC timestamp, e.g. 2026-06-18T14:32:07.000Z -> 20260618143207
const version = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

// 1 + 2. Update the single source of truth in config.js
const configPath = path.join(__dirname, 'js', 'config.js');
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(
  /window\.BUILD_VERSION = '[^']*';/,
  `window.BUILD_VERSION = '${version}';`
);
fs.writeFileSync(configPath, config);

// 3. Refresh ?v= on local js/ and css/ refs across all HTML pages.
const htmlFiles = [
  ...fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(__dirname, f)),
  ...fs.readdirSync(path.join(__dirname, 'pages'))
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(__dirname, 'pages', f)),
];

// Matches  src|href="(../)?(js|css)/<file>.(js|css)"  with an optional existing
// ?v=… suffix that gets replaced. Full-URL CDN refs do not match.
const refRe = /((?:src|href)="(?:\.\.\/)?(?:js|css)\/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const next = html.replace(refRe, `$1?v=${version}"`);
  fs.writeFileSync(file, next);
}

console.log('BUILD_VERSION bumped to ' + version);
