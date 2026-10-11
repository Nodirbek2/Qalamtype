import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAuthRedirectUrl, getCanonicalNavigationTarget } from '../src/lib/authRedirect';

test('production OAuth and email callbacks use the public domain, including Vercel aliases', () => {
  for (const origin of ['https://www.qalamtype.uz', 'https://qalamtype.uz', 'https://qalamtype-ke6s.vercel.app', 'https://qalamtype-k91x.vercel.app']) {
    assert.equal(getAuthRedirectUrl(origin), 'https://www.qalamtype.uz/');
  }
  assert.equal(getAuthRedirectUrl('http://localhost:3000'), 'http://localhost:3000/');
  assert.equal(getAuthRedirectUrl('http://127.0.0.1:3000'), 'http://127.0.0.1:3000/');
});

test('fallback production hosts redirect every callback path while preview deployments stay independent', () => {
  const {redirects} = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.deepEqual([...new Set(redirects.map((rule: any) => rule.has[0].value))].sort(), ['qalamtype-k91x.vercel.app','qalamtype-ke6s.vercel.app'].sort());
  for (const rule of redirects) {
    assert.ok(['/', '/:path*'].includes(rule.source));
    assert.equal(rule.destination, rule.source === '/' ? 'https://www.qalamtype.uz/' : 'https://www.qalamtype.uz/:path*');
    assert.equal(rule.has[0].type, 'host');
  }
});

test('canonical navigation preserves callback fragments, query and path before initializing auth', () => {
  const fragment = '#access_token=test-token&refresh_token=test-refresh&type=signup';
  assert.equal(getCanonicalNavigationTarget('https://qalamtype-ke6s.vercel.app/'+fragment), 'https://www.qalamtype.uz/'+fragment);
  assert.equal(getCanonicalNavigationTarget('https://qalamtype-ke6s.vercel.app/account?from=login#'), 'https://www.qalamtype.uz/account?from=login#');
  assert.equal(getCanonicalNavigationTarget('https://www.qalamtype.uz/account'), null);
  assert.equal(getCanonicalNavigationTarget('http://localhost:3000'), null);
  assert.equal(getCanonicalNavigationTarget('https://preview-example.vercel.app/'), null);
  const entry = readFileSync('src/main.tsx', 'utf8');
  assert.ok(entry.includes("void import('./bootstrap')"));
  assert.ok(!entry.includes("import { AuthProvider }"));
});
