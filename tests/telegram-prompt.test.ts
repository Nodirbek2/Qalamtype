import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canShowTelegramPrompt, localDay } from '../src/lib/telegramPrompt';

test('everyone sees the invitation once per local calendar day', () => {
  const shown = new Date(2026, 11, 31, 23, 59);
  assert.equal(canShowTelegramPrompt(null, shown), true);
  assert.equal(canShowTelegramPrompt(localDay(shown), shown), false);
  assert.equal(canShowTelegramPrompt(localDay(shown), new Date(2027, 0, 1, 0, 1)), true);
});
