import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { WordDisplayInfo } from '../hooks/useTypingEngine';
import { Caret } from './Caret';
import { TestMode, Duration, WordCount, Difficulty, Language } from '../types';
import { RotateCcw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface TypingAreaProps {
  wordsDisplay: WordDisplayInfo[];
  currentIndex: number;
  phase: 'idle' | 'running' | 'completed';
  isPaused?: boolean;
  timeLeft: number;
  mode: TestMode;
  duration: Duration;
  wordCount: WordCount;
  difficulty: Difficulty;
  language: Language;
  onRestart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  liveWpm?: number;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  wordsDisplay,
  currentIndex,
  phase,
  isPaused = false,
  timeLeft,
  mode,
  duration,
  wordCount,
  difficulty,
  language,
  onRestart,
  onPause,
  onResume,
  onKeyDown,
  liveWpm = 0,
}) => {
  const { smoothCaret, t } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(' ');
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 28 });
  const [isFocused, setIsFocused] = useState(true);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keep input focused when isFocused is true
  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused]);

  // Pause test if mouse moves while writing
  useEffect(() => {
    if (phase !== 'running' || isPaused) {
      lastMousePosRef.current = null;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!lastMousePosRef.current) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dist = Math.hypot(
        e.clientX - lastMousePosRef.current.x,
        e.clientY - lastMousePosRef.current.y
      );
      if (dist > 8) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        if (onPause) {
          onPause();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase, isPaused, onPause]);

  // Global keydown handler when focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If user clicks restart button or inputs into standard form elements, ignore
      const target = e.target as HTMLElement;
      const targetTag = target?.tagName?.toLowerCase();
      // Allow if it is our own typing input
      if (targetTag === 'input' && !target.hasAttribute('data-typing-input')) {
        return;
      }
      if (targetTag === 'button' || targetTag === 'textarea') {
        return;
      }
      setIsFocused(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (isPaused && onResume) {
        onResume();
      }
      onKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onKeyDown, isPaused, onResume]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < 1) {
      // Backspace pressed on mobile (value became empty)
      onKeyDown({ key: 'Backspace', preventDefault: () => {} } as KeyboardEvent);
    } else if (val.length > 1) {
      // One or more characters typed (including swipes / auto-completes)
      const typedText = val.substring(1);
      for (const char of typedText) {
        onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
      }
    }
    setInputValue(' ');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    // Intercept Backspace, Tab, Escape or standard characters for desktop typing.
    // Calling stopPropagation avoids double-firing from the global keydown listener.
    if (key === 'Backspace' || key === 'Escape' || key === 'Tab' || key.length === 1) {
      e.stopPropagation();
      onKeyDown(e.nativeEvent);
    }
  };

  // Update Caret position relative to current typing index
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Look for exact character element matching currentIndex
    const targetEl = containerRef.current.querySelector<HTMLElement>(
      `[data-char-idx="${currentIndex}"]`
    );

    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect();
      setCaretPos({
        top: targetRect.top - containerRect.top,
        left: targetRect.left - containerRect.left,
        height: targetRect.height || 28,
      });
      return;
    }

    // If target element doesn't exist (e.g. space between words or end of test),
    // position caret immediately after the previous character element (currentIndex - 1)
    if (currentIndex > 0) {
      const prevEl = containerRef.current.querySelector<HTMLElement>(
        `[data-char-idx="${currentIndex - 1}"]`
      );
      if (prevEl) {
        const prevRect = prevEl.getBoundingClientRect();
        setCaretPos({
          top: prevRect.top - containerRect.top,
          left: prevRect.right - containerRect.left,
          height: prevRect.height || 28,
        });
        return;
      }
    }

    // Fallback if no elements found yet (e.g. initial render before text populates)
    const firstEl = containerRef.current.querySelector<HTMLElement>(
      `[data-char-idx="0"]`
    );
    if (firstEl) {
      const firstRect = firstEl.getBoundingClientRect();
      setCaretPos({
        top: firstRect.top - containerRect.top,
        left: firstRect.left - containerRect.left,
        height: firstRect.height || 28,
      });
    }
  }, [currentIndex, wordsDisplay]);

  // Handle window resize to adjust caret position
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      const targetEl = containerRef.current.querySelector<HTMLElement>(
        `[data-char-idx="${currentIndex}"]`
      );

      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        setCaretPos({
          top: targetRect.top - containerRect.top,
          left: targetRect.left - containerRect.left,
          height: targetRect.height || 28,
        });
        return;
      }

      if (currentIndex > 0) {
        const prevEl = containerRef.current.querySelector<HTMLElement>(
          `[data-char-idx="${currentIndex - 1}"]`
        );
        if (prevEl) {
          const prevRect = prevEl.getBoundingClientRect();
          setCaretPos({
            top: prevRect.top - containerRect.top,
            left: prevRect.right - containerRect.left,
            height: prevRect.height || 28,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  // Compute total typed word progress for words mode
  const completedWordsCount = wordsDisplay.filter(
    (w) => w.chars.every((c) => c.status !== 'untouched') && w.chars.length > 0
  ).length;

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 sm:py-12 select-none"
      onClick={() => setIsFocused(true)}
    >
      {/* Top Info Bar directly above typing box */}
      <div className="w-full flex items-center justify-between mb-4 px-2 font-mono text-xs">
        {/* Language & Difficulty indicator (e.g., o'zbekcha / oson) */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
            {t('typing_language_label')}
          </span>
          <span className="text-[#E85D3D] text-sm font-mono">
            {t(`lang_${language}` as any)} / {t(`diff_${difficulty}` as any)}
          </span>
        </div>

        {/* Live metric timer / progress */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">wpm</span>
            <span className="text-xl font-mono text-[#F4A340]">{liveWpm}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
              {mode === 'time' ? 'time' : 'words'}
            </span>
            <span className="text-xl font-mono text-[#E85D3D]">
              {mode === 'time' ? `${timeLeft}s` : `${completedWordsCount}/${wordCount}`}
            </span>
          </div>
        </div>
      </div>

      {/* Typing Container */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full min-h-[160px] p-4 sm:p-6 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] cursor-text overflow-hidden focus:outline-none"
      >
        {/* Invisible input to capture virtual and physical keyboard inputs */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-text z-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-typing-input="true"
        />

        {/* Out of focus or Paused warning overlay */}
        {(isPaused || !isFocused) && (
          <div
            className="absolute inset-0 bg-[#0F0E0D]/20 z-20 flex items-center justify-center rounded-xl transition-all cursor-pointer pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              focusInput();
              if (isPaused && onResume) {
                onResume();
              }
            }}
          >
            <span className="font-sans text-xs sm:text-sm text-[#E85D3D] bg-[#1A1917]/90 px-4 py-2 rounded-lg border border-[rgba(232,93,61,0.35)] shadow-xl animate-pulse">
              {isPaused ? t('typing_paused_prompt') : t('typing_focus_prompt')}
            </span>
          </div>
        )}

        {/* Caret */}
        <Caret
          top={caretPos.top}
          left={caretPos.left}
          height={caretPos.height}
          speed={smoothCaret}
          isIdle={phase === 'idle'}
        />

        {/* Text Display Box */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-xl sm:text-2xl leading-relaxed tracking-wide text-left break-words">
          {wordsDisplay.map((word, wIdx) => {
            return (
              <span
                key={`word-${wIdx}`}
                className="inline-flex flex-wrap relative my-0.5"
              >
                {word.chars.map((charObj) => {
                  // Character color styling according to design system
                  let colorClass = 'text-[#5C574C]'; // untouched / muted
                  let bgClass = '';

                  if (charObj.status === 'correct') {
                    colorClass = 'text-[#E8E2D8]'; // text primary
                  } else if (charObj.status === 'incorrect') {
                    colorClass = 'text-[#D64545] underline decoration-[#D64545] decoration-2'; // error red
                    bgClass = 'bg-[#D64545]/15 rounded-sm';
                  } else if (charObj.status === 'extra') {
                    colorClass = 'text-[#D64545]/80 line-through'; // extra typed
                    bgClass = 'bg-[#D64545]/20 rounded-sm';
                  }

                  return (
                    <span
                      key={`char-${charObj.globalIndex}`}
                      data-char-idx={charObj.globalIndex}
                      className={`relative px-[0.5px] transition-colors duration-75 ${colorClass} ${bgClass}`}
                    >
                      {charObj.char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Restart action button and keyboard shortcut helper below typing area */}
      <div className="flex items-center gap-4 mt-8">
        <button
          type="button"
          onClick={onRestart}
          className="p-2.5 rounded-lg text-[#9A9488] hover:text-[#E85D3D] hover:bg-[#1A1917] transition-all flex items-center justify-center group"
          title="restart test (tab + enter)"
        >
          <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-90 duration-200" />
        </button>

        <div className="flex items-center space-x-2 text-[10px] text-[#5C574C] uppercase tracking-[0.2em] px-4 py-2 rounded-lg border border-[rgba(232,226,216,0.05)] bg-[#141312] select-none">
          <span className="bg-[#1A1917] px-1.5 py-0.5 rounded border border-[#5C574C] text-[#9A9488]">tab</span>
          <span>+</span>
          <span className="bg-[#1A1917] px-1.5 py-0.5 rounded border border-[#5C574C] text-[#9A9488]">enter</span>
          <span className="ml-2">{t('typing_restart_hint')}</span>
        </div>
      </div>
    </div>
  );
};
