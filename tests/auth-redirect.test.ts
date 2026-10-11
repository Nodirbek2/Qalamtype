import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAuthRedirectUrl } from '../src/lib/authRedirect';

test('production OAuth and email callbacks use the public domain, including Vercel aliases', () => {
  for (const origin of ['https://www.qalamtype.uz', 'https://qalamtype.uz', 'https://qalamtype-ke6s.vercel.app', 'https://qalamtype-k91x.vercel.app']) {
    assert.equal(getAuthRedirectUrl(origin), 'https://www.qalamtype.uz/');
  }
  assert.equal(getAuthRedirectUrl('http://localhost:3000'), 'http://localhost:3000/');
  assert.equal(getAuthRedirectUrl('http://127.0.0.1:3000'), 'http://127.0.0.1:3000/');
});

test('fallback production hosts redirect every callback path while preview deployments stay independent', () => {
  const {redirects} = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(redirects.map((rule: any) => rule.has[0].value).sort(), ['qalamtype-k91x.vercel.app','qalamtype-ke6s.vercel.app'].sort());
  for (const rule of redirects) {
    assert.equal(rule.source, '/:path*');
    assert.equal(rule.destination, 'https://www.qalamtype.uz/:path*');
    assert.equal(rule.has[0].type, 'host');
  }
});
