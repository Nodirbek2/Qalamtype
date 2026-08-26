import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { WordDisplayInfo } from '../hooks/useTypingEngine';
import { Caret } from './Caret';
import { TestMode, Duration, WordCount, Difficulty, Language, FONT_FAMILIES } from '../types';
import { RotateCcw, Keyboard as KeyboardIcon, Play, RefreshCw } from 'lucide-react';
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

  const [isFocused, setIsFocused] = useState(true);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  const handledInputTimeRef = useRef<number>(0);
  const isComposingRef = useRef<boolean>(false);

  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, height: 28, visible: true });

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = '  ';
    }
  };

  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused]);

  // Keep typing area in view when mobile visual viewport shrinks (e.g. keyboard opens)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleVvResize = () => {
      if (isFocused && containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    vv.addEventListener('resize', handleVvResize);
    return () => vv.removeEventListener('resize', handleVvResize);
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

  // Global keydown listener (for physical keyboard typing outside direct input focus)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If event originated directly from typing input, ignore to avoid double execution
      if (e.target === inputRef.current) {
        return;
      }

      const target = e.target as HTMLElement;
      const targetTag = target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'button' || targetTag === 'textarea' || targetTag === 'select') {
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

      handledInputTimeRef.current = Date.now();
      onKeyDown(e);
      if (inputRef.current) {
        inputRef.current.value = '  ';
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onKeyDown, isPaused, onResume]);

  // Mobile virtual keyboard beforeinput handler (iOS Safari, Android Chrome standard API)
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    if (!nativeEvent) return;

    const inputType = nativeEvent.inputType;
    const data = nativeEvent.data;

    if (inputType === 'insertText' || inputType === 'insertCompositionText') {
      e.preventDefault();
      handledInputTimeRef.current = Date.now();
      if (data) {
        for (const char of data) {
          onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
        }
      }
      if (inputRef.current) {
        inputRef.current.value = '  ';
      }
    } else if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      e.preventDefault();
      handledInputTimeRef.current = Date.now();
      onKeyDown({ key: 'Backspace', preventDefault: () => {} } as KeyboardEvent);
      if (inputRef.current) {
        inputRef.current.value = '  ';
      }
    } else if (inputType === 'deleteWordBackward') {
      e.preventDefault();
      handledInputTimeRef.current = Date.now();
      onKeyDown({ key: 'Backspace', ctrlKey: true, preventDefault: () => {} } as KeyboardEvent);
      if (inputRef.current) {
        inputRef.current.value = '  ';
      }
    } else if (inputType === 'insertLineBreak') {
      e.preventDefault();
      handledInputTimeRef.current = Date.now();
      onKeyDown({ key: ' ', preventDefault: () => {} } as KeyboardEvent);
      if (inputRef.current) {
        inputRef.current.value = '  ';
      }
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const data = e.data;
    if (data) {
      handledInputTimeRef.current = Date.now();
      for (const char of data) {
        onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '  ';
    }
  };

  // Fallback onChange handler for devices/browsers where beforeinput is not fully supported
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // If handled by beforeinput or keydown in the last 50ms, just reset DOM value
    if (Date.now() - handledInputTimeRef.current < 50) {
      if (e.target.value !== '  ') {
        e.target.value = '  ';
      }
      return;
    }

    if (isComposingRef.current) return;

    if (val.length < 2) {
      handledInputTimeRef.current = Date.now();
      const count = 2 - val.length;
      for (let i = 0; i < count; i++) {
        onKeyDown({ key: 'Backspace', preventDefault: () => {} } as KeyboardEvent);
      }
    } else if (val.length > 2) {
      handledInputTimeRef.current = Date.now();
      const added = val.startsWith('  ') ? val.slice(2) : (val.replace(/ /g, '') || val.slice(2));
      for (const char of added) {
        onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
      }
    } else if (val !== '  ') {
      handledInputTimeRef.current = Date.now();
      const clean = val.replace(/ /g, '');
      for (const char of clean) {
        onKeyDown({ key: char, preventDefault: () => {} } as KeyboardEvent);
      }
    }

    e.target.value = '  ';
  };

  // Standard KeyDown handler (Works on physical keyboards and Desktop)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key && key !== 'Unidentified' && e.keyCode !== 229) {
      if (key === ' ' || key === 'Backspace' || key === 'Escape' || key === 'Tab' || key.length === 1) {
        handledInputTimeRef.current = Date.now();
        e.preventDefault();
        e.stopPropagation();
        onKeyDown(e.nativeEvent);
        if (inputRef.current) {
          inputRef.current.value = '  ';
        }
      }
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

      // Handle container scrolling for desktop and mobile viewport heights
      const relTop = targetRect.top - containerRect.top;
      if (relTop + height > container.clientHeight - 25) {
        container.scrollTop += (relTop + height) - (container.clientHeight - 25);
      } else if (relTop < 15) {
        container.scrollTop = Math.max(0, container.scrollTop + relTop - 15);
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
        if (relTop + height > container.clientHeight - 25) {
          container.scrollTop += (relTop + height) - (container.clientHeight - 25);
        } else if (relTop < 15) {
          container.scrollTop = Math.max(0, container.scrollTop + relTop - 15);
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
      className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-3 sm:py-8 select-none touch-manipulation"
      onClick={() => setIsFocused(true)}
    >
      {/* Top Info Bar directly above typing box */}
      <div className="w-full flex items-center justify-between mb-2 sm:mb-4 px-2 font-mono text-xs flex-wrap gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
            {t('typing_language_label')}
          </span>
          <span className="text-[#E85D3D] text-xs sm:text-sm font-mono truncate max-w-[180px] sm:max-w-none">
            {t(`lang_${language}` as any)} / {t(`diff_${difficulty}` as any)}
          </span>
        </div>

        {/* Live Timer or Word Progress indicator */}
        <div className="flex items-center gap-2">
          {mode === 'time' ? (
            <span className="text-sm sm:text-base font-bold text-[#F4A340] font-mono bg-[#1A1917] px-2.5 py-1 rounded-lg border border-[rgba(232,226,216,0.08)]">
              {timeLeft}s
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-[#F4A340] font-mono bg-[#1A1917] px-2.5 py-1 rounded-lg border border-[rgba(232,226,216,0.08)]">
              {completedWordsCount}/{wordCount}
            </span>
          )}
        </div>
      </div>

      {/* Typing Container with touch-action */}
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full min-h-[140px] sm:min-h-[170px] max-h-[220px] sm:max-h-[260px] p-3.5 sm:p-6 md:p-8 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] cursor-text overflow-y-auto focus:outline-none scrollbar-none touch-manipulation"
      >
        {/* Invisible Input for Mobile & Desktop Typing */}
        <input
          ref={inputRef}
          type="text"
          defaultValue="  "
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBeforeInput={handleBeforeInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onBlur={() => setIsFocused(false)}
          onFocus={() => {
            setIsFocused(true);
            if (inputRef.current) {
              inputRef.current.value = '  ';
            }
          }}
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          style={{ fontSize: '16px' }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-text z-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
          data-typing-input="true"
        />

        {/* Focus Loss Overlay */}
        {(isPaused || !isFocused) && (
          <div
            className="absolute inset-0 bg-[#0F0E0D]/40 z-20 flex items-center justify-center rounded-xl transition-all cursor-pointer pointer-events-auto p-3 backdrop-blur-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              focusInput();
              if (isPaused && onResume) {
                onResume();
              }
            }}
          >
            <div className="flex items-center space-x-2 font-sans text-xs sm:text-sm text-[#E85D3D] bg-[#1A1917] px-4 py-2.5 rounded-xl border border-[#E85D3D]/40 shadow-xl text-center max-w-full">
              <KeyboardIcon className="w-4 h-4 shrink-0 animate-pulse text-[#E85D3D]" />
              <span className="font-medium">
                {isPaused ? t('typing_paused_prompt') : t('typing_focus_prompt')}
              </span>
            </div>
          </div>
        )}

        {/* Text Display Box */}
        <div 
          ref={textRef}
          style={{ fontFamily: FONT_FAMILIES[typingFont] }}
          className="relative flex flex-wrap gap-x-0 text-base sm:text-xl md:text-2xl leading-relaxed tracking-wide text-left break-words max-w-full"
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

      {/* Controls Bar: Responsive for Mobile touch and Desktop keyboard */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-5 sm:mt-8 w-full justify-center">
        {/* Mobile-Friendly Big Touch Restart Button */}
        <button
          type="button"
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onClick={(e) => {
            e.preventDefault();
            onRestart();
            focusInput();
          }}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1A1917] sm:bg-transparent hover:bg-[#1A1917] border border-[rgba(232,226,216,0.1)] sm:border-transparent text-[#E8E2D8] sm:text-[#9A9488] hover:text-[#E85D3D] transition-all flex items-center justify-center space-x-2 group cursor-pointer active:scale-95 touch-manipulation shadow-sm sm:shadow-none"
          title="qayta boshlash"
        >
          <RotateCcw className="w-4 h-4 text-[#E85D3D] sm:text-inherit transition-transform group-hover:-rotate-90 duration-200" />
          <span className="sm:hidden text-xs font-mono font-medium">Qayta boshlash</span>
        </button>

        {/* Desktop Keyboard Shortcut Prompt */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px] text-[#5C574C] uppercase tracking-[0.2em] px-4 py-2 rounded-lg border border-[rgba(232,226,216,0.05)] bg-[#141312] select-none">
          <span className="bg-[#1A1917] px-1.5 py-0.5 rounded border border-[#5C574C] text-[#9A9488]">tab</span>
          <span>+</span>
          <span className="bg-[#1A1917] px-1.5 py-0.5 rounded border border-[#5C574C] text-[#9A9488]">enter</span>
          <span className="ml-2">{t('typing_restart_hint')}</span>
        </div>
      </div>
    </div>
  );
};

