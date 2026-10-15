import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORD_BANKS, GENERAL_VOCABULARY, generateTestText } from '../src/data/wordBanks';
import type { Language } from '../src/types';

test('easy vocabulary stays short, lowercase and varied in every language', () => {
  for (const language of Object.keys(WORD_BANKS) as Language[]) {
    const words = WORD_BANKS[language].easy.words!;
    assert.ok(words.length >= 250, language);
    assert.equal(new Set(words).size, words.length);
    assert.ok(words.every(word => word.length <= 6 && word === word.toLowerCase() && !/\s/.test(word)), language);
    const text = generateTestText('words', 100, 'easy', language).split(' ');
    assert.equal(text.length, 100);
    assert.equal(new Set(text).size, 100);
    assert.ok(text.every(word => words.includes(word)));
    assert.ok(GENERAL_VOCABULARY[language].some(word => word.length > 8), language);
  }
});
