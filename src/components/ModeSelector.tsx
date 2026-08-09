import React from 'react';
import { TestMode, Duration, WordCount, Difficulty, Language } from '../types';
import { Clock, AlignLeft, Globe, Zap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface ModeSelectorProps {
  mode: TestMode;
  duration: Duration;
  wordCount: WordCount;
  difficulty: Difficulty;
  language: Language;
  onModeChange: (mode: TestMode) => void;
  onDurationChange: (duration: Duration) => void;
  onWordCountChange: (count: WordCount) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  duration,
  wordCount,
  difficulty,
  language,
  onModeChange,
  onDurationChange,
  onWordCountChange,
  onDifficultyChange,
  onLanguageChange,
  disabled = false,
}) => {
  const { t } = useSettings();
  const durations: Duration[] = [15, 30, 60, 120];
  const wordCounts: WordCount[] = [10, 25, 50, 100];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  // Uzbek listed first
  const languages: { id: Language; labelKey: string }[] = [
    { id: 'uzbek_latin', labelKey: 'lang_uzbek_latin' },
    { id: 'uzbek_cyrillic', labelKey: 'lang_uzbek_cyrillic' },
    { id: 'russian', labelKey: 'lang_russian' },
    { id: 'english', labelKey: 'lang_english' },
  ];

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-[#1A1917] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[rgba(232,226,216,0.08)] text-xs font-sans transition-opacity select-none opacity-100 max-w-full"
    >
      {/* Test Mode Toggle */}
      <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => onModeChange('time')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 ${
            mode === 'time'
              ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
              : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('mode_time')}</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('words')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 ${
            mode === 'words'
              ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
              : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>{t('mode_words')}</span>
        </button>
      </div>

      <div className="w-[1px] h-4 bg-[rgba(232,226,216,0.12)] hidden sm:block" />

      {/* Mode Sub-options (Time durations or Word counts) */}
      <div className="flex items-center flex-wrap justify-center gap-1">
        {mode === 'time'
          ? durations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDurationChange(d)}
                className={`px-2 py-1 rounded-md font-mono transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 ${
                  duration === d
                    ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
                    : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
                }`}
              >
                <span>{d}s</span>
              </button>
            ))
          : wordCounts.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onWordCountChange(w)}
                className={`px-2 py-1 rounded-md font-mono transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 ${
                  wordCount === w
                    ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
                    : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
                }`}
              >
                <span>{w}</span>
              </button>
            ))}
      </div>

      <div className="w-[1px] h-4 bg-[rgba(232,226,216,0.12)] hidden sm:block" />

      {/* Difficulty selection */}
      <div className="flex items-center flex-wrap justify-center gap-1">
        <Zap className="w-3.5 h-3.5 text-[#5C574C] ml-1 mr-0.5 shrink-0" />
        {difficulties.map((diff) => {
          const diffKey = diff === 'easy' ? 'diff_easy' : diff === 'medium' ? 'diff_medium' : 'diff_hard';
          return (
            <button
              key={diff}
              type="button"
              onClick={() => onDifficultyChange(diff)}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 ${
                difficulty === diff
                  ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
                  : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
              }`}
            >
              <span>{t(diffKey as any)}</span>
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-4 bg-[rgba(232,226,216,0.12)] hidden sm:block" />

      {/* Language Selector (Uzbek listed first and selected by default) */}
      <div className="flex items-center flex-wrap justify-center gap-1 max-w-full">
        <Globe className="w-3.5 h-3.5 text-[#5C574C] ml-1 mr-0.5 shrink-0" />
        {languages.map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => onLanguageChange(lang.id)}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E85D3D] active:scale-95 whitespace-nowrap ${
              language === lang.id
                ? 'text-[#E85D3D] font-medium bg-[rgba(232,93,61,0.12)] border border-[rgba(232,93,61,0.2)]'
                : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]'
            }`}
          >
            <span>{t(lang.labelKey as any)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
