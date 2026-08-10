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
}

export interface WordDisplayInfo {
  wordIndex: number;
  originalWord: string;
  chars: CharDisplayInfo[];
  hasError: boolean;
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
  const [typedChars, setTypedChars] = useState<string[]>([]);
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

  const typedCharsRef = useRef<string[]>([]);
  useEffect(() => {
    typedCharsRef.current = typedChars;
  }, [typedChars]);

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

  // Helper to cleanly capture a WPM timeline snapshot for a given timestamp
  const recordSnapshot = useCallback((now: number) => {
    if (!startTimeRef.current) return;
    const elapsedMs = Math.max(
      0,
      now - startTimeRef.current - pausedTotalRef.current
    );
    const elapsedSec = Math.floor(elapsedMs / 1000);

    if (elapsedSec > 0) {
      const minutes = elapsedMs / 60000;
      let currentCorrect = 0;
      const target = targetTextRef.current;
      const typed = typedCharsRef.current;
      const minLen = Math.min(target.length, typed.length);
      for (let i = 0; i < minLen; i++) {
        if (typed[i] === target[i]) currentCorrect++;
      }
      const currentWpm = minutes > 0 ? Math.round((currentCorrect / 5) / minutes) : 0;
      const currentRawWpm = minutes > 0 ? Math.round((totalTypedCountRef.current / 5) / minutes) : 0;

      // Ensure no duplicate second snapshot is recorded
      if (!snapshotsRef.current.some((s) => s.second === elapsedSec)) {
        snapshotsRef.current.push({
          second: elapsedSec,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          errors: errorCountRef.current,
        });
      }
    }
  }, []);

  // Initialize test text when configuration changes
  const resetTest = useCallback(() => {
    const text = customText
      ? customText
      : generateTestText(
          mode,
          mode === 'time' ? duration : wordCount,
          difficulty,
          language
        );
    setTargetText(text);
    setTypedChars([]);
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

  // Calculate stats helper using up-to-date refs
  const calculateFinalStats = useCallback(
    (endTime: number): TestResult => {
      recordSnapshot(endTime);

      const startTime = startTimeRef.current || endTime;
      const currentPaused =
        pausedTotalRef.current +
        (pauseStartRef.current ? endTime - pauseStartRef.current : 0);
      const timeSec = Math.max(0.1, (endTime - startTime - currentPaused) / 1000);
      const minutes = timeSec / 60;

      const target = targetTextRef.current;
      const typed = typedCharsRef.current;

      let correctChars = 0;
      let incorrectChars = 0;
      let extraChars = 0;

      const minLen = Math.min(target.length, typed.length);
      for (let i = 0; i < minLen; i++) {
        if (typed[i] === target[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }

      if (typed.length > target.length) {
        extraChars = typed.length - target.length;
      }

      const missedChars = Math.max(0, target.length - typed.length);
      const totalTyped = totalTypedCountRef.current || typed.length;

      const wpm = Math.round((correctChars / 5) / minutes);
      const rawWpm = Math.round((totalTyped / 5) / minutes);
      const accuracy = totalTyped > 0 ? Math.min(100, Math.round((correctChars / totalTyped) * 1000) / 10) : 100;

      // Consistency calculation based on WPM variance in snapshots
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
    [mode, duration, wordCount, difficulty, language, recordSnapshot]
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

  // Handle timer tick for time mode & snapshot collection
  useEffect(() => {
    if (phase === 'running') {
      const interval = window.setInterval(() => {
        if (pauseStartRef.current) {
          return; // Skip tick while paused
        }
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

  // Key press handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent shortcut keys like Ctrl+R or F5 from being blocked
      if (e.ctrlKey || e.altKey || e.metaKey) {
        if (e.key === 'Backspace') {
          // Allow Ctrl+Backspace / Option+Backspace to delete previous word
          e.preventDefault();
          if (phase === 'completed') return;
          setTypedChars((prev) => {
            if (prev.length === 0) return prev;
            let lastIdx = prev.length - 1;
            // Trim trailing spaces
            while (lastIdx >= 0 && prev[lastIdx] === ' ') {
              lastIdx--;
            }
            // Trim word
            while (lastIdx >= 0 && prev[lastIdx] !== ' ') {
              lastIdx--;
            }
            return prev.slice(0, lastIdx + 1);
          });
        }
        return;
      }

      if (e.key === 'Tab' || e.key === 'Escape') {
        return; // Handled at page / button level for restart
      }

      if (phase === 'completed') return;

      // Automatically resume if test was paused
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
        setTypedChars((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }

      if (e.key.length === 1) {
        // Character key pressed
        e.preventDefault();

        const currentTypedLen = typedCharsRef.current.length;
        const target = targetTextRef.current;
        const expectedChar = target[currentTypedLen];
        const isSpace = e.key === ' ';
        const isError = expectedChar !== undefined && e.key !== expectedChar;

        playTypingSound(typingSound, isSpace, isError);

        // Start test on first key press
        if (phase === 'idle') {
          setPhase('running');
          startTimeRef.current = Date.now();
        }

        totalTypedCountRef.current += 1;
        const inputChar = e.key;

        setTypedChars((prev) => {
          if (expectedChar && inputChar !== expectedChar) {
            errorCountRef.current += 1;
          }
          const updated = [...prev, inputChar];

          // Check if test reached the end in words or character mode
          if (updated.length >= target.length) {
            setTimeout(() => finishTest(), 10);
          }

          return updated;
        });
      }
    },
    [phase, isPaused, typingSound, finishTest]
  );

  // Group characters into word structures cleanly using useMemo to optimize fast typing
  const wordsDisplay = useMemo((): WordDisplayInfo[] => {
    if (!targetText) return [];

    const rawWords = targetText.split(' ');
    let globalCharOffset = 0;
    const resultWords: WordDisplayInfo[] = [];

    for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
      const origWord = rawWords[wIdx];
      const charsInfo: CharDisplayInfo[] = [];
      let wordHasError = false;

      // Characters of the target word
      for (let cIdx = 0; cIdx < origWord.length; cIdx++) {
        const charIdx = globalCharOffset + cIdx;
        const targetChar = origWord[cIdx];
        const userTyped = typedChars[charIdx];

        let status: 'untouched' | 'correct' | 'incorrect' | 'extra' = 'untouched';
        if (userTyped !== undefined) {
          if (userTyped === targetChar) {
            status = 'correct';
          } else {
            status = 'incorrect';
            wordHasError = true;
          }
        }

        charsInfo.push({
          char: targetChar,
          status,
          globalIndex: charIdx,
        });
      }

      // Check for extra typed characters before space or end of word
      const wordEndOffset = globalCharOffset + origWord.length;
      let extraTypedIdx = wordEndOffset;

      while (
        extraTypedIdx < typedChars.length &&
        typedChars[extraTypedIdx] !== ' ' &&
        (wIdx === rawWords.length - 1 || extraTypedIdx < wordEndOffset + 10)
      ) {
        if (extraTypedIdx >= targetText.length || targetText[extraTypedIdx] === ' ') {
          charsInfo.push({
            char: typedChars[extraTypedIdx],
            status: 'extra',
            globalIndex: extraTypedIdx,
          });
          wordHasError = true;
          extraTypedIdx++;
        } else {
          break;
        }
      }

      resultWords.push({
        wordIndex: wIdx,
        originalWord: origWord,
        chars: charsInfo,
        hasError: wordHasError,
      });

      // Account for space after word
      globalCharOffset = Math.max(wordEndOffset + 1, extraTypedIdx + 1);
    }

    return resultWords;
  }, [targetText, typedChars]);

  // Current live WPM stats
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

    let correct = 0;
    const target = targetTextRef.current;
    const typed = typedCharsRef.current;
    const minLen = Math.min(target.length, typed.length);
    for (let i = 0; i < minLen; i++) {
      if (typed[i] === target[i]) correct++;
    }

    const wpm = Math.round((correct / 5) / elapsedMinutes);
    const rawWpm = Math.round((totalTypedCountRef.current / 5) / elapsedMinutes);
    const accuracy =
      totalTypedCountRef.current > 0
        ? Math.round((correct / totalTypedCountRef.current) * 100)
        : 100;

    let progress = 0;
    if (mode === 'time') {
      const elapsedSec = Math.floor(elapsedMs / 1000);
      progress = Math.min(100, Math.round((elapsedSec / duration) * 100));
    } else {
      progress = Math.min(100, Math.round((typed.length / target.length) * 100));
    }

    return { wpm, rawWpm, accuracy, progress };
  }, [phase, mode, duration]);

  return {
    targetText,
    typedChars,
    currentIndex: typedChars.length,
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

