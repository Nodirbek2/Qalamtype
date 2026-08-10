import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  TestMode,
  Duration,
  WordCount,
  Difficulty,
  Language,
  TestResult,
  TimeSnapshot,
} from '../types';
import { generateTestText } from '../data/wordBanks';
import { TypingSound, playTypingSound } from '../lib/soundSynthesizer';

export interface UseTypingEngineOptions {
  mode: TestMode;
  duration: Duration;
  wordCount: WordCount;
  difficulty: Difficulty;
  language: Language;
  typingSound?: TypingSound;
  customText?: string;
}

export interface CharDisplayInfo {
  char: string;
  status: 'untouched' | 'correct' | 'incorrect' | 'extra';
  globalIndex: number;
  isCurrent?: boolean;
  isCurrentRight?: boolean;
  isSpace?: boolean;
}

export interface WordDisplayInfo {
  wordIndex: number;
  originalWord: string;
  typedWord: string;
  chars: CharDisplayInfo[];
  hasError: boolean;
  isCurrentWord: boolean;
}

export function useTypingEngine({
  mode,
  duration,
  wordCount,
  difficulty,
  language,
  typingSound = 'click',
  customText,
}: UseTypingEngineOptions) {
  const [targetText, setTargetText] = useState<string>('');
  const [typedWords, setTypedWords] = useState<string[]>(['']);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'completed'>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [result, setResult] = useState<TestResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const pausedTotalRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const snapshotsRef = useRef<TimeSnapshot[]>([]);
  const totalTypedCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  const typedWordsRef = useRef<string[]>(typedWords);
  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  const currentWordIndexRef = useRef<number>(currentWordIndex);
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  const targetTextRef = useRef<string>('');
  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  const pauseTest = useCallback(() => {
    if (phase === 'running' && !isPaused) {
      pauseStartRef.current = Date.now();
      setIsPaused(true);
    }
  }, [phase, isPaused]);

  const resumeTest = useCallback(() => {
    if (isPaused) {
      if (pauseStartRef.current) {
        pausedTotalRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      setIsPaused(false);
    }
  }, [isPaused]);

  // Derive wordsDisplay structure word-by-word
  const wordsDisplay = useMemo((): WordDisplayInfo[] => {
    if (!targetText) return [];

    const rawWords = targetText.split(' ');
    let globalIndexCounter = 0;

    return rawWords.map((origWord, wIdx) => {
      const typedWord = typedWords[wIdx] ?? '';
      const isCurrentWord = wIdx === currentWordIndex;
      const isCompletedWord = wIdx < currentWordIndex;
      const charsInfo: CharDisplayInfo[] = [];
      let wordHasError = false;

      const maxLen = Math.max(origWord.length, typedWord.length);

      for (let cIdx = 0; cIdx < maxLen; cIdx++) {
        const targetChar = origWord[cIdx];
        const typedChar = typedWord[cIdx];
        const gIdx = globalIndexCounter++;

        let status: CharDisplayInfo['status'] = 'untouched';
        let isCurrent = false;
        let isCurrentRight = false;

        if (cIdx < origWord.length) {
          if (typedChar !== undefined) {
            if (typedChar === targetChar) {
              status = 'correct';
            } else {
              status = 'incorrect';
              wordHasError = true;
            }
          } else {
            if (isCompletedWord) {
              status = 'incorrect';
              wordHasError = true;
            } else {
              status = 'untouched';
            }
          }

          if (isCurrentWord) {
            if (cIdx === typedWord.length) {
              isCurrent = true;
            } else if (cIdx === origWord.length - 1 && typedWord.length === origWord.length) {
              isCurrentRight = false;
            }
          }
        } else {
          // Extra character typed beyond target word length
          status = 'extra';
          wordHasError = true;
          if (isCurrentWord && cIdx === typedWord.length - 1) {
            isCurrentRight = true;
          }
        }

        charsInfo.push({
          char: targetChar || typedChar,
          status,
          globalIndex: gIdx,
          isCurrent,
          isCurrentRight,
        });
      }

      // Explicitly include space character between words with exact globalIndex
      if (wIdx < rawWords.length - 1) {
        const spaceGIdx = globalIndexCounter++;
        let spaceStatus: CharDisplayInfo['status'] = 'untouched';
        let spaceIsCurrent = false;

        if (isCompletedWord) {
          spaceStatus = 'correct';
        } else if (isCurrentWord) {
          if (typedWord.length >= origWord.length) {
            spaceIsCurrent = true;
          }
        }

        charsInfo.push({
          char: ' ',
          status: spaceStatus,
          globalIndex: spaceGIdx,
          isCurrent: spaceIsCurrent,
          isSpace: true,
        });
      }

      return {
        wordIndex: wIdx,
        originalWord: origWord,
        typedWord,
        chars: charsInfo,
        hasError: wordHasError,
        isCurrentWord,
      };
    });
  }, [targetText, typedWords, currentWordIndex]);

  // Compute stats from wordsDisplay
  const computeStatsFromWords = useCallback((words: WordDisplayInfo[]) => {
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    words.forEach((w) => {
      w.chars.forEach((c) => {
        if (c.status === 'correct') {
          correctChars++;
        } else if (c.status === 'incorrect') {
          if (w.wordIndex < currentWordIndexRef.current) {
            missedChars++;
          } else {
            incorrectChars++;
          }
        } else if (c.status === 'extra') {
          extraChars++;
        }
      });
    });

    return { correctChars, incorrectChars, extraChars, missedChars };
  }, []);

  // Record WPM snapshot
  const recordSnapshot = useCallback((now: number) => {
    if (!startTimeRef.current) return;
    const elapsedMs = Math.max(
      0,
      now - startTimeRef.current - pausedTotalRef.current
    );
    const elapsedSec = Math.floor(elapsedMs / 1000);

    if (elapsedSec > 0) {
      const minutes = elapsedMs / 60000;
      const { correctChars } = computeStatsFromWords(wordsDisplay);
      const currentWpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
      const currentRawWpm = minutes > 0 ? Math.round((totalTypedCountRef.current / 5) / minutes) : 0;

      if (!snapshotsRef.current.some((s) => s.second === elapsedSec)) {
        snapshotsRef.current.push({
          second: elapsedSec,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          errors: errorCountRef.current,
        });
      }
    }
  }, [wordsDisplay, computeStatsFromWords]);

  // Reset test
  const resetTest = useCallback(() => {
    const text = customText
      ? customText
      : generateTestText(
          mode,
          mode === 'time' ? 100 : wordCount,
          difficulty,
          language
        );
    setTargetText(text);
    setTypedWords(['']);
    setCurrentWordIndex(0);
    setPhase('idle');
    setIsPaused(false);
    setTimeLeft(mode === 'time' ? duration : 0);
    setResult(null);
    startTimeRef.current = null;
    pauseStartRef.current = null;
    pausedTotalRef.current = 0;
    snapshotsRef.current = [];
    totalTypedCountRef.current = 0;
    errorCountRef.current = 0;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [mode, duration, wordCount, difficulty, language, customText]);

  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Calculate final stats on test completion
  const calculateFinalStats = useCallback(
    (endTime: number): TestResult => {
      recordSnapshot(endTime);

      const startTime = startTimeRef.current || endTime;
      const currentPaused =
        pausedTotalRef.current +
        (pauseStartRef.current ? endTime - pauseStartRef.current : 0);
      const timeSec = Math.max(0.1, (endTime - startTime - currentPaused) / 1000);
      const minutes = timeSec / 60;

      const { correctChars, incorrectChars, extraChars, missedChars } =
        computeStatsFromWords(wordsDisplay);

      const totalTyped = totalTypedCountRef.current || correctChars;

      const wpm = Math.max(0, Math.round((correctChars / 5) / minutes));
      const rawWpm = Math.max(0, Math.round((totalTyped / 5) / minutes));
      const accuracy =
        totalTyped > 0
          ? Math.min(100, Math.max(0, Math.round((correctChars / totalTyped) * 1000) / 10))
          : 100;

      let consistency = 100;
      const history = [...snapshotsRef.current];
      if (history.length > 1) {
        const wpms = history.map((s) => s.wpm);
        const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        if (mean > 0) {
          const variance =
            wpms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            wpms.length;
          const stdDev = Math.sqrt(variance);
          const cv = stdDev / mean;
          consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
        }
      }

      return {
        wpm: isNaN(wpm) ? 0 : wpm,
        rawWpm: isNaN(rawWpm) ? 0 : rawWpm,
        accuracy: isNaN(accuracy) ? 0 : accuracy,
        consistency: isNaN(consistency) ? 100 : consistency,
        correctChars,
        incorrectChars,
        extraChars,
        missedChars,
        totalTyped,
        timeSec: Math.round(timeSec * 10) / 10,
        mode,
        duration: mode === 'time' ? duration : undefined,
        wordCount: mode === 'words' ? wordCount : undefined,
        difficulty,
        language,
        history,
      };
    },
    [mode, duration, wordCount, difficulty, language, recordSnapshot, wordsDisplay, computeStatsFromWords]
  );

  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const now = Date.now();
    setPhase('completed');
    setIsPaused(false);
    const finalResult = calculateFinalStats(now);
    setResult(finalResult);
  }, [calculateFinalStats]);

  // Timer interval
  useEffect(() => {
    if (phase === 'running') {
      const interval = window.setInterval(() => {
        if (pauseStartRef.current) return;

        const now = Date.now();
        recordSnapshot(now);

        if (mode === 'time') {
          const elapsedMs = Math.max(
            0,
            now - (startTimeRef.current || now) - pausedTotalRef.current
          );
          const elapsedSec = Math.floor(elapsedMs / 1000);
          const remaining = Math.max(0, duration - elapsedSec);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            finishTest();
          }
        }
      }, 100);

      timerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [phase, mode, duration, finishTest, recordSnapshot]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase === 'completed') return;

      // Handle Ctrl+Backspace / Alt+Backspace
      if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        playTypingSound(typingSound, false, false);
        setTypedWords((prev) => {
          const copy = [...prev];
          const currIdx = currentWordIndexRef.current;
          if (copy[currIdx] && copy[currIdx].length > 0) {
            copy[currIdx] = '';
          } else if (currIdx > 0) {
            setCurrentWordIndex(currIdx - 1);
            copy[currIdx - 1] = '';
          }
          return copy;
        });
        return;
      }

      if (e.key === 'Tab' || e.key === 'Escape') return;

      if (isPaused) {
        if (pauseStartRef.current) {
          pausedTotalRef.current += Date.now() - pauseStartRef.current;
          pauseStartRef.current = null;
        }
        setIsPaused(false);
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        playTypingSound(typingSound, false, false);
        setTypedWords((prev) => {
          const copy = [...prev];
          const currIdx = currentWordIndexRef.current;
          const currentWordTyped = copy[currIdx] || '';

          if (currentWordTyped.length > 0) {
            copy[currIdx] = currentWordTyped.slice(0, -1);
          } else if (currIdx > 0) {
            setCurrentWordIndex(currIdx - 1);
          }
          return copy;
        });
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();

        if (phase === 'idle') {
          setPhase('running');
          startTimeRef.current = Date.now();
        }

        const inputChar = e.key;
        totalTypedCountRef.current += 1;

        if (inputChar === ' ') {
          // Spacebar pressed: complete current word and move to next
          const rawWords = targetTextRef.current.split(' ');
          const currIdx = currentWordIndexRef.current;

          playTypingSound(typingSound, true, false);

          const nextIdx = currIdx + 1;
          setCurrentWordIndex(nextIdx);

          setTypedWords((prev) => {
            const copy = [...prev];
            if (copy[nextIdx] === undefined) {
              copy[nextIdx] = '';
            }
            return copy;
          });

          // Check if dynamic text expansion needed for time mode
          if (mode === 'time') {
            if (nextIdx >= rawWords.length - 20) {
              const moreText = ' ' + generateTestText('time', 30, difficulty, language);
              setTargetText((t) => t + moreText);
            }
          } else if (mode === 'words') {
            if (nextIdx >= wordCount) {
              setTimeout(() => finishTest(), 10);
            }
          } else if (nextIdx >= rawWords.length) {
            setTimeout(() => finishTest(), 10);
          }

          return;
        }

        // Regular character typed
        const currIdx = currentWordIndexRef.current;
        const rawWords = targetTextRef.current.split(' ');
        const targetWord = rawWords[currIdx] || '';
        const currentTyped = typedWordsRef.current[currIdx] || '';
        const expectedChar = targetWord[currentTyped.length];
        const isError = expectedChar !== undefined && inputChar !== expectedChar;

        playTypingSound(typingSound, false, isError);
        if (isError) errorCountRef.current += 1;

        setTypedWords((prev) => {
          const copy = [...prev];
          copy[currIdx] = (copy[currIdx] || '') + inputChar;

          // Word mode completion check if on last word and reached full word length
          if (mode === 'words' && currIdx === wordCount - 1) {
            if (copy[currIdx].length >= targetWord.length) {
              setTimeout(() => finishTest(), 10);
            }
          }

          return copy;
        });
      }
    },
    [phase, isPaused, typingSound, mode, wordCount, difficulty, language, finishTest]
  );

  // Live stats getter
  const getLiveStats = useCallback(() => {
    if (phase === 'idle' || !startTimeRef.current) {
      return { wpm: 0, rawWpm: 0, accuracy: 100, progress: 0 };
    }
    const now = pauseStartRef.current || Date.now();
    const elapsedMs = Math.max(
      0,
      now - startTimeRef.current - pausedTotalRef.current
    );
    const elapsedMinutes = elapsedMs / 60000;
    if (elapsedMinutes <= 0) return { wpm: 0, rawWpm: 0, accuracy: 100, progress: 0 };

    const { correctChars } = computeStatsFromWords(wordsDisplay);
    const wpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
    const rawWpm = Math.max(0, Math.round((totalTypedCountRef.current / 5) / elapsedMinutes));
    const accuracy =
      totalTypedCountRef.current > 0
        ? Math.min(100, Math.max(0, Math.round((correctChars / totalTypedCountRef.current) * 100)))
        : 100;

    let progress = 0;
    if (mode === 'time') {
      const elapsedSec = Math.floor(elapsedMs / 1000);
      progress = Math.min(100, Math.round((elapsedSec / duration) * 100));
    } else {
      progress = Math.min(100, Math.round((currentWordIndex / wordCount) * 100));
    }

    return { wpm, rawWpm, accuracy, progress };
  }, [phase, mode, duration, wordCount, currentWordIndex, wordsDisplay, computeStatsFromWords]);

  // Derived overall typed character count
  const currentIndex = useMemo(() => {
    return typedWords.reduce((acc, w) => acc + w.length, 0) + currentWordIndex;
  }, [typedWords, currentWordIndex]);

  return {
    targetText,
    typedChars: typedWords.join(' ').split(''),
    currentIndex,
    phase,
    isPaused,
    timeLeft,
    result,
    wordsDisplay,
    getLiveStats,
    resetTest,
    pauseTest,
    resumeTest,
    handleKeyDown,
    finishTest,
  };
}
