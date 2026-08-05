export type TestMode = 'time' | 'words';
export type Duration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'uzbek_latin' | 'uzbek_cyrillic' | 'russian' | 'english';
export type CaretSpeed = 'off' | 'slow' | 'medium' | 'fast';
export type TypingFont = 'jetbrains_mono' | 'roboto_mono' | 'fira_code' | 'source_code_pro' | 'courier_prime';

export const FONT_FAMILIES: Record<TypingFont, string> = {
  jetbrains_mono: "'JetBrains Mono', monospace",
  roboto_mono: "'Roboto Mono', monospace",
  fira_code: "'Fira Code', monospace",
  source_code_pro: "'Source Code Pro', monospace",
  courier_prime: "'Courier Prime', monospace",
};

export const CARET_SPEED_MS: Record<CaretSpeed, number> = {
  off: 0,
  slow: 150,
  medium: 90,
  fast: 50,
};

export interface CharacterState {
  char: string;
  userChar?: string;
  status: 'correct' | 'incorrect' | 'extra' | 'untouched';
}

export interface WordState {
  original: string;
  chars: CharacterState[];
  isExtra?: boolean;
}

export interface TimeSnapshot {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalTyped: number;
  timeSec: number;
  mode: TestMode;
  duration?: Duration;
  wordCount?: WordCount;
  difficulty: Difficulty;
  language: Language;
  history: TimeSnapshot[];
}

export interface UserProfile {
  uid: string;
  username: string;
  usernameLower: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  createdAt: string;
  preferredSiteLanguage: Language;
  preferredTypingLanguage: Language;
  isProfileComplete?: boolean;
}

export interface AcademyLesson {
  id: string; // e.g. 't1_l1'
  tierNumber: number;
  lessonNumber: number;
  title: Record<Language, string>;
  content: Record<Language, string>;
}

export interface AcademyTier {
  id: string; // e.g. 'tier_1'
  number: number;
  name: Record<Language, string>;
  description: Record<Language, string>;
  lessons: AcademyLesson[];
}

export interface LessonProgress {
  completed: boolean;
  stars: number; // 0..3
  bestWpm: number;
  bestAccuracy: number;
}

