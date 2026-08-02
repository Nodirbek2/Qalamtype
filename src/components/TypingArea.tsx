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
  timeLeft: number;
  mode: TestMode;
  duration: Duration;
  wordCount: WordCount;
  difficulty: Difficulty;
  language: Language;
  onRestart: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  liveWpm?: number;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  wordsDisplay,
  currentIndex,
  phase,
  timeLeft,
  mode,
  duration,
  wordCount,
  difficulty,
  language,
  onRestart,
  onKeyDown,
  liveWpm = 0,
}) => {
  const { smoothCaret, t } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 28 });
  const [isFocused, setIsFocused] = useState(true);

  // Global keydown handler when focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If user clicks restart button or inputs into standard form elements, ignore
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'button' || targetTag === 'textarea') {
        return;
      }
      setIsFocused(true);
      onKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onKeyDown]);

  // Update Caret position relative to active character
  useLayoutEffect(() => {
    if (!containerRef.current || !activeCharRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const charRect = activeCharRef.current.getBoundingClientRect();

    setCaretPos({
      top: charRect.top - containerRect.top,
      left: charRect.left - containerRect.left,
      height: charRect.height || 28,
    });
  }, [currentIndex, wordsDisplay]);

  // Handle window resize to adjust caret position
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !activeCharRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const charRect = activeCharRef.current.getBoundingClientRect();
      setCaretPos({
        top: charRect.top - containerRect.top,
        left: charRect.left - containerRect.left,
        height: charRect.height || 28,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {/* Language & Difficulty indicator (e.g., uzbek / easy) */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">language</span>
          <span className="text-[#E85D3D] text-sm font-mono">{language}_{difficulty}</span>
        </div>

        {/* Live metric timer / progress */}
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">wpm</span>
            <span className="text-2xl font-mono text-[#F4A340]">{liveWpm}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#5C574C] font-semibold font-sans">
              {mode === 'time' ? 'time' : 'words'}
            </span>
            <span className="text-2xl font-mono text-[#E85D3D]">
              {mode === 'time' ? `${timeLeft}s` : `${completedWordsCount}/${wordCount}`}
            </span>
          </div>
        </div>
      </div>

      {/* Typing Container */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[160px] p-4 sm:p-6 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] cursor-text overflow-hidden focus:outline-none"
        tabIndex={0}
      >
        {/* Out of focus warning overlay */}
        {!isFocused && (
          <div className="absolute inset-0 bg-[#0F0E0D]/80 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl transition-all">
            <span className="font-sans text-sm text-[#E8E2D8] bg-[#1A1917] px-4 py-2 rounded-lg border border-[rgba(232,226,216,0.12)]">
              {t('typing_focus_prompt')}
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
                {word.chars.map((charObj, cIdx) => {
                  // Determine global character index
                  let prevCharsCount = 0;
                  for (let i = 0; i < wIdx; i++) {
                    prevCharsCount += wordsDisplay[i].chars.length + 1; // +1 for space
                  }
                  const globalCharIdx = prevCharsCount + cIdx;
                  const isActive = globalCharIdx === currentIndex;

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
                      key={`char-${wIdx}-${cIdx}`}
                      ref={isActive ? activeCharRef : null}
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
          <span className="ml-2">to restart test</span>
        </div>
      </div>
    </div>
  );
};
