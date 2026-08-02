export type TestMode = 'time' | 'words';
export type Duration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'uzbek' | 'russian' | 'english';
export type CaretSpeed = 'off' | 'slow' | 'medium' | 'fast';

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
