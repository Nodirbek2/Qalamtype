import { Language, Difficulty, TestMode } from '../types';

import uzEasy from './uz_easy.json';
import uzMedium from './uz_medium.json';
import uzHard from './uz_hard.json';

import uzCyrillicEasy from './uz_cyrillic_easy.json';
import uzCyrillicMedium from './uz_cyrillic_medium.json';
import uzCyrillicHard from './uz_cyrillic_hard.json';

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
  uzbek_latin: {
    easy: uzEasy,
    medium: uzMedium,
    hard: uzHard,
  },
  uzbek_cyrillic: {
    easy: uzCyrillicEasy,
    medium: uzCyrillicMedium,
    hard: uzCyrillicHard,
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
 * Randomly select items from an array using Fisher-Yates shuffle without immediate repeats.
 */
function getRandomItems<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  const result: T[] = [];

  const shuffle = (array: T[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let pool = shuffle(arr);

  for (let i = 0; i < count; i++) {
    if (pool.length === 0) {
      pool = shuffle(arr);
      // Ensure the first item of new pool doesn't match the last item chosen
      if (result.length > 0 && pool.length > 1 && pool[pool.length - 1] === result[result.length - 1]) {
        const swapIdx = Math.floor(Math.random() * (pool.length - 1));
        [pool[pool.length - 1], pool[swapIdx]] = [pool[swapIdx], pool[pool.length - 1]];
      }
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
  const bank = WORD_BANKS[language]?.[difficulty] || WORD_BANKS.uzbek_latin.easy;

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

    const selectedSentences = getRandomItems(sentences, Math.max(10, Math.ceil(targetWordCount / 5)));
    let collectedText = selectedSentences.join(' ');

    if (mode === 'words') {
      const splitWords = collectedText.split(/\s+/).filter(Boolean).slice(0, durationOrCount);
      return splitWords.join(' ');
    }

    return collectedText;
  }
}
