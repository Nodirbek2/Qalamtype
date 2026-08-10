import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { WordDisplayInfo } from '../hooks/useTypingEngine';
import { Caret } from './Caret';
import { TestMode, Duration, WordCount, Difficulty, Language, FONT_FAMILIES } from '../types';
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
  const { smoothCaret, typingFont, t } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  const [inputValue, setInputValue] = useState(' ');
  const [isFocused, setIsFocused] = useState(true);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const handledKeyDownRef = useRef<boolean>(false);

  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, height: 28, visible: true });

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused]);

  // Pause test if mouse moves significantly (threshold 100px)
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
      if (dist > 100) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        if (onPause) {
          onPause();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase, isPaused, onPause]);

  // Global keydown listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If event originated directly from typing input, ignore to avoid double execution
      if (e.target === inputRef.current) {
        return;
      }

      const target = e.target as HTMLElement;
      const targetTag = target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'button' || targetTag === 'textarea') {
        return;
      }

      setIsFocused(true);
      focusInput();

      if (isPaused && onResume) {
        onResume();
      }

      if (e.key === ' ' || e.key === 'Backspace' || e.key.length === 1) {
        e.preventDefault();
      }

      onKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onKeyDown, isPaused, onResume]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handledKeyDownRef.current) {
      handledKeyDownRef.current = false;
      setInputValue(' ');
      return;
    }

    const val = e.target.value;
    if (val.length < 1) {
      onKeyDown({ key: 'Backspace', preventDefault: () => {} } as KeyboardEvent);
    } else if (val.length > 1) {
      const typedText = val.substring(1);
      for (const char of typedText) {
        onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
      }
    }
    setInputValue(' ');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === ' ' || key === 'Backspace' || key === 'Escape' || key === 'Tab' || key.length === 1) {
      handledKeyDownRef.current = true;
      e.preventDefault();
      e.stopPropagation();
      onKeyDown(e.nativeEvent);
    }
  };

  // Compute caret position based on DOM elements relative to text container
  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const container = containerRef.current;
    const textContainer = textRef.current;
    const containerRect = container.getBoundingClientRect();
    const textRect = textContainer.getBoundingClientRect();

    // 1. Find active target element matching current index or query DOM
    let targetEl = activeCharRef.current;
    if (!targetEl || targetEl.getAttribute('data-char-idx') !== String(currentIndex)) {
      targetEl = container.querySelector<HTMLSpanElement>(`[data-char-idx="${currentIndex}"]`);
    }

    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const isRight = targetEl.getAttribute('data-caret-pos') === 'right';
      const x = (isRight ? targetRect.right : targetRect.left) - textRect.left;
      const y = targetRect.top - textRect.top;
      const height = targetRect.height || 28;

      setCaretPos({
        x,
        y,
        height,
        visible: true,
      });

      // Handle container scrolling
      const relTop = targetRect.top - containerRect.top;
      if (relTop + height > container.clientHeight - 20) {
        container.scrollTop += (relTop + height) - (container.clientHeight - 20);
      } else if (relTop < 10) {
        container.scrollTop = Math.max(0, container.scrollTop + relTop - 10);
      }
      return;
    }

    // 2. Fallback to previous element (currentIndex - 1) right edge
    if (currentIndex > 0) {
      const prevEl = container.querySelector<HTMLSpanElement>(`[data-char-idx="${currentIndex - 1}"]`);
      if (prevEl) {
        const prevRect = prevEl.getBoundingClientRect();
        const x = prevRect.right - textRect.left;
        const y = prevRect.top - textRect.top;
        const height = prevRect.height || 28;

        setCaretPos({
          x,
          y,
          height,
          visible: true,
        });

        const relTop = prevRect.top - containerRect.top;
        if (relTop + height > container.clientHeight - 20) {
          container.scrollTop += (relTop + height) - (container.clientHeight - 20);
        } else if (relTop < 10) {
          container.scrollTop = Math.max(0, container.scrollTop + relTop - 10);
        }
        return;
      }
    }

    // 3. Fallback: Maintain previous valid caret position
    setCaretPos((prev) => ({ ...prev, visible: true }));
  }, [currentIndex, wordsDisplay, typingFont]);

  // Window resize handler to recalculate caret position
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !textRef.current) return;
      const container = containerRef.current;
      const textContainer = textRef.current;
      const textRect = textContainer.getBoundingClientRect();

      let el = container.querySelector<HTMLSpanElement>(`[data-char-idx="${currentIndex}"]`);
      if (el) {
        const targetRect = el.getBoundingClientRect();
        const isRight = el.getAttribute('data-caret-pos') === 'right';
        setCaretPos({
          x: (isRight ? targetRect.right : targetRect.left) - textRect.left,
          y: targetRect.top - textRect.top,
          height: targetRect.height || 28,
          visible: true,
        });
      } else if (currentIndex > 0) {
        const prevEl = container.querySelector<HTMLSpanElement>(`[data-char-idx="${currentIndex - 1}"]`);
        if (prevEl) {
          const prevRect = prevEl.getBoundingClientRect();
          setCaretPos({
            x: prevRect.right - textRect.left,
            y: prevRect.top - textRect.top,
            height: prevRect.height || 28,
            visible: true,
          });
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  const completedWordsCount = wordsDisplay.filter(
    (w) => !w.isCurrentWord && w.chars.every((c) => c.status !== 'untouched') && w.chars.length > 0
  ).length;

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 sm:py-12 select-none"
      onClick={() => setIsFocused(true)}
    >
      {/* Top Info Bar directly above typing box */}
      <div className="w-full flex items-center justify-between mb-3 sm:mb-4 px-2 font-mono text-xs flex-wrap gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
            {t('typing_language_label')}
          </span>
          <span className="text-[#E85D3D] text-xs sm:text-sm font-mono truncate max-w-[150px] sm:max-w-none">
            {t(`lang_${language}` as any)} / {t(`diff_${difficulty}` as any)}
          </span>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">wpm</span>
            <span className="text-lg sm:text-xl font-mono text-[#F4A340]">{liveWpm}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
              {mode === 'time' ? 'time' : 'words'}
            </span>
            <span className="text-lg sm:text-xl font-mono text-[#E85D3D]">
              {mode === 'time' ? `${timeLeft}s` : `${completedWordsCount}/${wordCount}`}
            </span>
          </div>
        </div>
      </div>

      {/* Typing Container */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full min-h-[140px] sm:min-h-[160px] max-h-[220px] p-3 sm:p-6 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] cursor-text overflow-y-auto focus:outline-none scrollbar-none"
      >
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

        {(isPaused || !isFocused) && (
          <div
            className="absolute inset-0 bg-[#0F0E0D]/20 z-20 flex items-center justify-center rounded-xl transition-all cursor-pointer pointer-events-auto p-2"
            onClick={(e) => {
              e.stopPropagation();
              focusInput();
              if (isPaused && onResume) {
                onResume();
              }
            }}
          >
            <span className="font-sans text-xs sm:text-sm text-[#E85D3D] bg-[#1A1917]/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[rgba(232,93,61,0.35)] shadow-xl animate-pulse text-center max-w-full">
              {isPaused ? t('typing_paused_prompt') : t('typing_focus_prompt')}
            </span>
          </div>
        )}

        {/* Text Display Box */}
        <div 
          ref={textRef}
          style={{ fontFamily: FONT_FAMILIES[typingFont] }}
          className="relative flex flex-wrap gap-x-0 text-lg sm:text-2xl leading-relaxed tracking-wide text-left break-words max-w-full"
        >
          {/* Smooth Floating Caret */}
          <Caret
            x={caretPos.x}
            y={caretPos.y}
            height={caretPos.height}
            speed={smoothCaret}
            isIdle={phase === 'idle'}
            visible={caretPos.visible}
          />

          {wordsDisplay.map((word, wIdx) => {
            return (
              <span key={`word-${wIdx}`} className="inline-flex flex-wrap relative my-0.5">
                {word.chars.map((charObj) => {
                  let colorClass = 'text-[#5C574C]';
                  let bgClass = '';

                  if (charObj.status === 'correct') {
                    colorClass = 'text-[#E8E2D8]';
                  } else if (charObj.status === 'incorrect') {
                    colorClass = 'text-[#D64545] underline decoration-[#D64545] decoration-2';
                    bgClass = 'bg-[#D64545]/15 rounded-sm';
                  } else if (charObj.status === 'extra') {
                    colorClass = 'text-[#D64545]/80 line-through';
                    bgClass = 'bg-[#D64545]/20 rounded-sm';
                  }

                  const isTargetChar = charObj.isCurrent || charObj.isCurrentRight;
                  const caretPosSide = charObj.isCurrentRight ? 'right' : 'left';
                  const displayChar = charObj.isSpace ? '\u00A0' : charObj.char;

                  return (
                    <span
                      key={`char-${charObj.globalIndex}`}
                      ref={isTargetChar ? activeCharRef : null}
                      data-char-idx={charObj.globalIndex}
                      data-caret-pos={caretPosSide}
                      className={`relative px-[0.5px] transition-colors duration-75 ${colorClass} ${bgClass}`}
                    >
                      {displayChar}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          type="button"
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onClick={(e) => {
            e.preventDefault();
            onRestart();
            focusInput();
          }}
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
