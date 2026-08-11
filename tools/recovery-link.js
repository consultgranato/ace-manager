#!/usr/bin/env node
// =============================================================
// Ace Manager — mint a password-recovery link for one user
// =============================================================
//   node tools/recovery-link.js someone@d219.org
//
// Why this exists: pages/reset-password.html no longer offers a self-serve
// reset, because the project has no custom SMTP and Supabase's built-in sender
// only delivers to members of the Supabase project. The page tells the case
// manager to ask an administrator for a link — this is how the administrator
// produces one. Send the printed URL over Slack, Teams, or a normal email from
// your own mailbox.
//
// The person still chooses their own password: the link lands on the
// set-password form and nobody but them ever types or sees it. That is the
// point — it beats an admin setting a password and reading it out.
//
// No new secret is stored on disk. The service-role key is fetched at runtime
// using the SUPABASE_ACCESS_TOKEN already in .env (gitignored) and lives only
// in memory for the length of this process.
//
// !! The printed URL is a bearer credential — anyone holding it can set that
// account's password until it expires (see mailer_otp_exp, currently 1 hour).
// Send it to the person directly. Do not paste it into a shared channel, a
// ticket, or a commit.
// =============================================================

const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'npihodfemfpmhhooqtyl';
const REDIRECT_TO = 'https://acemanager.app/pages/reset-password.html';

function loadAccessToken() {
  // Deliberately parsed here rather than assuming the caller exported it, so the
  // script works from a bare shell the same way the deploy steps do.
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    fail('No .env found at repo root. It must contain SUPABASE_ACCESS_TOKEN.');
  }
  const line = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith('SUPABASE_ACCESS_TOKEN='));
  if (!line) fail('SUPABASE_ACCESS_TOKEN is not set in .env');
  return line
    .slice(line.indexOf('=') + 1)
    .trim()
    .replace(/^["']|["']$/g, '')
    // The stored token contains a backslash-escaped character (sbp\_...).
    // `set -a; . ./.env` strips those escapes, so curl from a shell works and
    // this script silently got a 401 with a token one byte too long. Unescape
    // the same way the shell does rather than depending on how it was written.
    .replace(/\\(.)/g, '$1');
}

function fail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

async function main() {
  const email = (process.argv[2] || '').trim();
  if (!email || !email.includes('@')) {
    fail('Usage: node tools/recovery-link.js <email>');
  }

  const accessToken = loadAccessToken();

  // 1. Fetch the service-role key. reveal=true returns the actual secret, which
  //    the admin endpoint below requires — the management token cannot call it.
  const keysRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!keysRes.ok) {
    fail(`Could not read project API keys (HTTP ${keysRes.status}). Is SUPABASE_ACCESS_TOKEN still valid?`);
  }
  const keys = await keysRes.json();
  const serviceRole = keys.find((k) => k.name === 'service_role');
  if (!serviceRole || !serviceRole.api_key) fail('No service_role key returned for this project.');

  // 2. Mint the link. generate_link does NOT change the password and does not
  //    notify the user — it only produces a token. Nothing happens to the
  //    account unless the person actually opens the link.
  const genRes = await fetch(`https://${PROJECT_REF}.supabase.co/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceRole.api_key,
      Authorization: `Bearer ${serviceRole.api_key}`,
      'Content-Type': 'application/json'
    },
    // redirect_to is top-level here. Nested under `options` it is silently
    // ignored and the link falls back to the project's site_url — which drops
    // the path, landing the user on the homepage instead of the set-password
    // form. Verify the printed link still ends in /pages/reset-password.html
    // if this ever stops working.
    body: JSON.stringify({ type: 'recovery', email, redirect_to: REDIRECT_TO })
  });

  const body = await genRes.json();
  if (!genRes.ok) {
    const msg = body.msg || body.message || body.error_description || JSON.stringify(body);
    if (genRes.status === 422 || /not found/i.test(msg)) {
      fail(`No account exists for ${email}. They need to sign up first at\n    https://acemanager.app/pages/signup.html`);
    }
    fail(`Supabase refused the request (HTTP ${genRes.status}): ${msg}`);
  }

  const link = body.action_link || (body.properties && body.properties.action_link);
  if (!link) fail(`No action_link in the response: ${JSON.stringify(body)}`);

  console.log(`\n  Recovery link for ${email}\n`);
  console.log(`  ${link}\n`);
  console.log('  Send this to them directly. It expires in about an hour, is single-use,');
  console.log('  and lets them set their own password — you never see it.\n');
}

main().catch((e) => fail(e.message));
