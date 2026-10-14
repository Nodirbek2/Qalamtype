import type { Language } from '../types';
import practiceCorpus from './practiceCorpus.json';
import readingCorpus from './readingCorpus.json';

export interface ReadingEntry {
  kind: string;
  author: string;
  work: string;
  source: string;
  text: string;
  note: string;
}

export const READING_CORPUS: Record<Language, ReadingEntry[]> = readingCorpus;
const languages: Language[] = ['uzbek_latin', 'uzbek_cyrillic', 'russian', 'english'];
export const LITERARY_PASSAGES = Object.fromEntries(languages.map(language => [
  language, READING_CORPUS[language].map(entry => entry.text),
])) as Record<Language, string[]>;

// Keep racing rounds at three complete sentences, with a much wider subject range.
function threeSentences(items: string[]): string[] {
  return items.map((_, index) => [0, 1, 2].map(offset => items[(index + offset) % items.length]).join(' '));
}
export const ARCADE_PASSAGES = Object.fromEntries(languages.map(language => [
  language,
  [...threeSentences(practiceCorpus.practice[language]), ...threeSentences(practiceCorpus.proverbs[language])],
])) as Record<Language, string[]>;

export const SHORT_PASSAGES = Object.fromEntries(languages.map(language => [
  language,
  [...practiceCorpus.practice[language], ...practiceCorpus.proverbs[language], ...LITERARY_PASSAGES[language]],
])) as Record<Language, string[]>;
