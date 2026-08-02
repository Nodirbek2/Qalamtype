import React, { useEffect } from 'react';
import { TestResult } from '../types';
import { useSettings } from '../context/SettingsContext';
import { RotateCcw, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ResultsViewProps {
  result: TestResult;
  savedToLeaderboard?: boolean;
  onViewLeaderboard?: () => void;
  onNextTest: () => void;
  onRestart: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  savedToLeaderboard = false,
  onViewLeaderboard,
  onNextTest,
  onRestart,
}) => {
  const { t } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onNextTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextTest]);

  const {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    timeSec,
    mode,
    duration,
    wordCount,
    difficulty,
    language,
    history,
  } = result;

  const chartData =
    history.length > 0
      ? history
      : [
          { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
          { second: Math.round(timeSec), wpm, rawWpm, errors: incorrectChars },
        ];

  const langText = t(`lang_${language}` as any) || language;
  const diffText = t(`diff_${difficulty}` as any) || difficulty;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-6 sm:py-10 animate-fade-in font-sans select-none">
      {/* Primary WPM & Accuracy Highlight Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* WPM Main Metric */}
        <div className="bg-[#1A1917] p-5 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs font-sans text-[#9A9488]">{t('results_wpm')}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-mono font-medium text-[#F4A340]">
              {wpm}
            </span>
            <span className="text-xs font-mono text-[#9A9488]">wpm</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#1A1917] p-5 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs font-sans text-[#9A9488]">{t('results_acc')}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl sm:text-5xl font-mono font-medium text-[#E8E2D8]">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Raw WPM */}
        <div className="bg-[#1A1917] p-5 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs font-sans text-[#9A9488]">{t('results_raw')}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-mono font-medium text-[#9A9488]">
              {rawWpm}
            </span>
          </div>
        </div>

        {/* Consistency */}
        <div className="bg-[#1A1917] p-5 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs font-sans text-[#9A9488]">{t('results_consistency')}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-mono font-medium text-[#9A9488]">
              {consistency}%
            </span>
          </div>
        </div>
      </div>

      {/* WPM Over Time Timeline Chart */}
      <div className="bg-[#1A1917] p-5 rounded-xl border border-[rgba(232,226,216,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-sans text-[#9A9488]">{t('results_speed_progression')}</span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E85D3D]" />
              <span className="text-[#9A9488]">wpm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4A340]" />
              <span className="text-[#9A9488]">raw</span>
            </div>
          </div>
        </div>

        <div className="h-48 sm:h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(232,226,216,0.05)" strokeDasharray="3 3" />
              <XAxis
                dataKey="second"
                stroke="#5C574C"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="s"
              />
              <YAxis
                stroke="#5C574C"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F0E0D',
                  borderColor: 'rgba(232,226,216,0.12)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                itemStyle={{ color: '#E8E2D8' }}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="#E85D3D"
                strokeWidth={2.5}
                dot={{ fill: '#E85D3D', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="rawWpm"
                stroke="#F4A340"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Character Breakdown */}
        <div className="bg-[#1A1917] p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs text-[#9A9488]">{t('results_chars')}</span>
          <div className="font-mono text-sm text-[#E8E2D8] mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[#6FA85C]">{correctChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#D64545]">{incorrectChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#F4A340]">{extraChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#9A9488]">{missedChars}</span>
          </div>
          <span className="text-[11px] text-[#5C574C] mt-1">{t('results_char_sub')}</span>
        </div>

        {/* Test Parameters */}
        <div className="bg-[#1A1917] p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs text-[#9A9488]">{t('lb_all_modes')}</span>
          <div className="font-mono text-sm text-[#E8E2D8] mt-2 capitalize flex items-center gap-2">
            <span className="text-[#E85D3D]">{langText}</span>
            <span className="text-[#5C574C]">•</span>
            <span>{diffText}</span>
            <span className="text-[#5C574C]">•</span>
            <span>{mode === 'time' ? `${duration}s` : `${wordCount} ${t('mode_words')}`}</span>
          </div>
          <span className="text-[11px] text-[#5C574C] mt-1">{t('results_params_sub')}</span>
        </div>

        {/* Time Taken */}
        <div className="bg-[#1A1917] p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <span className="text-xs text-[#9A9488]">{t('results_time')}</span>
          <div className="font-mono text-sm text-[#E8E2D8] mt-2">
            <span>{timeSec}s</span>
          </div>
          <span className="text-[11px] text-[#5C574C] mt-1">{t('results_time_sub')}</span>
        </div>
      </div>

      {/* Leaderboard Status Banner */}
      {savedToLeaderboard ? (
        <div className="bg-[#6FA85C]/10 border border-[#6FA85C]/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-[#6FA85C]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('results_saved_banner')}</span>
          </div>
          {onViewLeaderboard && (
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="text-[#E8E2D8] hover:text-[#E85D3D] underline underline-offset-4 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('results_view_leaderboard')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-xl p-3 flex items-center justify-between text-xs font-mono text-[#9A9488]">
          <span>{t('results_guest_banner')}</span>
          {onViewLeaderboard && (
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="text-[#E85D3D] hover:underline cursor-pointer transition-colors flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t('nav_leaderboard')}</span>
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
        <button
          type="button"
          onClick={onNextTest}
          className="w-full sm:w-auto px-6 py-3 bg-[#E85D3D] text-[#E8E2D8] font-medium text-sm rounded-lg hover:bg-[#E85D3D]/90 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{t('results_next_test')}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-3 bg-[#1A1917] text-[#9A9488] hover:text-[#E8E2D8] font-medium text-sm rounded-lg border border-[rgba(232,226,216,0.08)] hover:border-[rgba(232,226,216,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('results_restart')}</span>
        </button>
      </div>

      <div className="text-center font-mono text-xs text-[#5C574C]">
        {t('results_press_hint')}
      </div>
    </div>
  );
};
