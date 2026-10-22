import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canShowTelegramPrompt, localDay } from '../src/lib/telegramPrompt';

test('guests see the prompt again on the next calendar day, including year boundaries', () => {
  const dismissed = new Date(2026, 11, 31, 23, 59);
  assert.equal(canShowTelegramPrompt(false, null, dismissed), true);
  assert.equal(canShowTelegramPrompt(false, localDay(dismissed), dismissed), false);
  assert.equal(canShowTelegramPrompt(false, localDay(dismissed), new Date(2027, 0, 1, 0, 1)), true);
});

test('registered users never see the invitation', () => {
  assert.equal(canShowTelegramPrompt(true, null), false);
  assert.equal(canShowTelegramPrompt(true, '2025-01-01'), false);
});
