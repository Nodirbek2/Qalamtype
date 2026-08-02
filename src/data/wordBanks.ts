import { Language, Difficulty, TestMode } from '../types';

import uzEasy from './uz_easy.json';
import uzMedium from './uz_medium.json';
import uzHard from './uz_hard.json';

import ruEasy from './ru_easy.json';
import ruMedium from './ru_medium.json';
import ruHard from './ru_hard.json';

import enEasy from './en_easy.json';
import enMedium from './en_medium.json';
import enHard from './en_hard.json';

import uzLiterature from './uz_literature.json';

export { uzLiterature };

export interface WordBankSource {
  words?: string[];
  sentences?: string[];
}

export const WORD_BANKS: Record<Language, Record<Difficulty, WordBankSource>> = {
  uzbek: {
    easy: uzEasy,
    medium: uzMedium,
    hard: uzHard,
  },
  russian: {
    easy: ruEasy,
    medium: ruMedium,
    hard: ruHard,
  },
  english: {
    easy: enEasy,
    medium: enMedium,
    hard: enHard,
  },
};

/**
 * Randomly select items from an array without repeating until pool is exhausted.
 */
function getRandomItems<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  const result: T[] = [];
  let pool = [...arr].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    if (pool.length === 0) {
      pool = [...arr].sort(() => Math.random() - 0.5);
    }
    const item = pool.pop();
    if (item !== undefined) {
      result.push(item);
    }
  }

  return result;
}

export function generateTestText(
  mode: TestMode,
  durationOrCount: number,
  difficulty: Difficulty,
  language: Language
): string {
  const bank = WORD_BANKS[language]?.[difficulty] || WORD_BANKS.uzbek.easy;

  if (difficulty === 'easy' && bank.words && bank.words.length > 0) {
    // In easy mode: pick random words from words array
    const targetWordCount =
      mode === 'words'
        ? durationOrCount
        : Math.max(50, Math.ceil((durationOrCount / 60) * 80));

    const selectedWords = getRandomItems(bank.words, targetWordCount);
    return selectedWords.join(' ');
  } else {
    // In medium or hard mode: pick sentences from sentences array until word count is satisfied
    const sentences = bank.sentences && bank.sentences.length > 0
      ? bank.sentences
      : ['qalampir bilan tezlikni oshiring.'];

    const targetWordCount =
      mode === 'words'
        ? durationOrCount
        : Math.max(40, Math.ceil((durationOrCount / 60) * 75));

    let collectedText = '';
    let currentWords = 0;
    let attempts = 0;

    while (currentWords < targetWordCount && attempts < 50) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
      collectedText += (collectedText ? ' ' : '') + randomSentence;
      currentWords = collectedText.split(/\s+/).filter(Boolean).length;
      attempts++;
    }

    if (mode === 'words') {
      const splitWords = collectedText.split(/\s+/).filter(Boolean).slice(0, durationOrCount);
      return splitWords.join(' ');
    }

    return collectedText;
  }
}
