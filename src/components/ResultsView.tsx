import React, { useState, useEffect } from 'react';
import { TestResult, Difficulty, Language, TestMode } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToLeaderboard,
  LeaderboardResult,
  LeaderboardFilters,
  ModeFilter,
} from '../lib/resultsService';
import { RotateCcw, ArrowRight, Trophy, Share2, Check, Loader2 } from 'lucide-react';
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
  onViewLeaderboard,
  onNextTest,
  onRestart,
}) => {
  const { t } = useSettings();
  const { currentUser, userProfile } = useAuth();

  const [copied, setCopied] = useState(false);
  const [lbDifficulty, setLbDifficulty] = useState<Difficulty>(result.difficulty || 'easy');
  const [lbTimeRange, setLbTimeRange] = useState<'week' | 'month'>('week');
  const [lbData, setLbData] = useState<LeaderboardResult[]>([]);
  const [lbLoading, setLbLoading] = useState<boolean>(true);

  // Keyboard shortcut for Enter or Esc
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

  // Subscribe to real-time leaderboard data with filters matching the completed test
  useEffect(() => {
    setLbLoading(true);

    let modeFilterVal: ModeFilter = 'all';
    if (result.mode === 'time') {
      const dur = result.duration || 30;
      modeFilterVal = `time_${dur}` as ModeFilter;
    } else if (result.mode === 'words') {
      const wc = result.wordCount || 25;
      modeFilterVal = `words_${wc}` as ModeFilter;
    }

    const filters: LeaderboardFilters = {
      timeRange: lbTimeRange,
      language: result.language,
      modeFilter: modeFilterVal,
      difficulty: lbDifficulty,
    };

    const unsubscribe = subscribeToLeaderboard(
      filters,
      (data) => {
        setLbData(data);
        setLbLoading(false);
      },
      () => {
        setLbLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [result.mode, result.duration, result.wordCount, result.language, lbDifficulty, lbTimeRange]);

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

  // Handle sharing test result to clipboard
  const handleShare = () => {
    const text = `QalampirType: ${wpm} WPM | ${accuracy}% aniqlik | ${
      result.mode === 'time' ? `${result.duration}s` : `${result.wordCount} so'z`
    } | ${diffText} | ${langText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process leaderboard top 5 and current user row
  const top5 = lbData.slice(0, 5);

  // Find user index in leaderboard data
  const userRankIndex = currentUser
    ? lbData.findIndex((r) => r.uid === currentUser.uid)
    : lbData.findIndex((r) => r.wpm === wpm && r.accuracy === accuracy);

  const isUserInTop5 = userRankIndex >= 0 && userRankIndex < 5;

  const currentUserRow: LeaderboardResult = (userRankIndex >= 0 ? lbData[userRankIndex] : null) || {
    id: 'current_run',
    uid: currentUser ? currentUser.uid : 'guest',
    username: userProfile?.username || 'mehmon',
    photoURL: userProfile?.photoURL || '',
    wpm,
    rawWpm,
    accuracy,
    mode: result.mode,
    modeValue: result.mode === 'time' ? (result.duration || 30) : (result.wordCount || 25),
    difficulty: result.difficulty,
    typingLanguage: result.language,
    date: new Date(),
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-3 font-sans select-none animate-fade-in">
      {/* 3-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Column 1: Left (~25% width -> lg:col-span-3) */}
        <div className="lg:col-span-3 bg-[#1A1917] p-3.5 sm:p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between gap-3">
          {/* Top: WPM Main Metric */}
          <div>
            <span className="text-[11px] font-mono text-[#9A9488] uppercase tracking-wider">
              {t('results_wpm')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-[#F4A340] leading-none">
                {wpm}
              </span>
              <span className="text-xs font-mono text-[#9A9488]">wpm</span>
            </div>
            {/* Mode / Duration / Difficulty Subtitle */}
            <p className="text-[11px] font-mono text-[#5C574C] mt-2 capitalize flex items-center gap-1 flex-wrap">
              <span>{result.mode === 'time' ? `${result.duration}s` : `${result.wordCount} ${t('mode_words')}`}</span>
              <span>•</span>
              <span>{diffText}</span>
              <span>•</span>
              <span>{langText}</span>
            </p>
          </div>

          {/* Bottom: Accuracy Secondary Metric */}
          <div className="pt-2 border-t border-[rgba(232,226,216,0.06)]">
            <span className="text-[11px] font-mono text-[#9A9488] uppercase tracking-wider">
              {t('results_acc')}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-[#E8E2D8] leading-none">
                {accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Center (~45% width -> lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#1A1917] p-3.5 sm:p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#9A9488] font-medium">
              {t('results_speed_progression')}
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E85D3D]" />
                <span className="text-[#9A9488]">wpm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F4A340]" />
                <span className="text-[#9A9488]">raw</span>
              </div>
            </div>
          </div>

          <div className="h-44 sm:h-52 lg:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(232,226,216,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="second"
                  stroke="#5C574C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  unit="s"
                />
                <YAxis
                  stroke="#5C574C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0E0D',
                    borderColor: 'rgba(232,226,216,0.12)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  itemStyle={{ color: '#E8E2D8' }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="#E85D3D"
                  strokeWidth={2}
                  dot={{ fill: '#E85D3D', r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="rawWpm"
                  stroke="#F4A340"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3: Right (~30% width -> lg:col-span-4) Leaderboard Panel */}
        <div className="lg:col-span-4 bg-[#1A1917] p-3.5 sm:p-4 rounded-xl border border-[rgba(232,226,216,0.08)] flex flex-col justify-between gap-2">
          <div>
            {/* Header + Time Range Filter Pills */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-1.5 text-[#E85D3D] font-mono text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>Eng kuchlilar</span>
              </div>

              {/* Time range pills: hafta / oy */}
              <div className="flex items-center space-x-1 bg-[#0F0E0D] p-0.5 rounded-lg border border-[rgba(232,226,216,0.08)]">
                {(['week', 'month'] as const).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setLbTimeRange(tr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      lbTimeRange === tr
                        ? 'bg-[#1A1917] text-[#E85D3D] font-medium'
                        : 'text-[#9A9488] hover:text-[#E8E2D8]'
                    }`}
                  >
                    {tr === 'week' ? (t('filter_week') || 'Hafta') : (t('filter_month') || 'Oy')}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter Pills: oson / o'rta / qiyin */}
            <div className="flex items-center space-x-1 mb-2 bg-[#0F0E0D] p-1 rounded-lg border border-[rgba(232,226,216,0.06)]">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setLbDifficulty(diff)}
                  className={`flex-1 text-center py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    lbDifficulty === diff
                      ? 'bg-[#E85D3D] text-[#0F0E0D] font-semibold'
                      : 'text-[#9A9488] hover:text-[#E8E2D8]'
                  }`}
                >
                  {diff === 'easy' ? 'Oson' : diff === 'medium' ? "O'rta" : 'Qiyin'}
                </button>
              ))}
            </div>

            {/* Top 5 Ranked List */}
            <div className="space-y-1 my-1">
              {lbLoading ? (
                <div className="py-6 flex items-center justify-center text-[#9A9488] font-mono text-xs space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E85D3D]" />
                  <span>Yuklanmoqda...</span>
                </div>
              ) : top5.length === 0 ? (
                <div className="py-4 text-center text-[11px] font-mono text-[#9A9488]">
                  Hali natijalar yo'q
                </div>
              ) : (
                top5.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;
                  const isCurrUser = currentUser && row.uid === currentUser.uid;

                  let rowStyle = 'bg-[#0F0E0D]/40 text-[#9A9488]';
                  if (isTop1) {
                    rowStyle = 'bg-[#E85D3D]/10 border-l-2 border-l-[#E85D3D] text-[#E85D3D]';
                  } else if (isTop2) {
                    rowStyle = 'bg-[#F4A340]/10 border-l-2 border-l-[#F4A340] text-[#F4A340]';
                  } else if (isTop3) {
                    rowStyle = 'bg-[#F4A340]/5 border-l-2 border-l-[#F4A340]/60 text-[#F4A340]/90';
                  }

                  return (
                    <div
                      key={row.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${rowStyle} ${
                        isCurrUser ? 'ring-1 ring-[#E85D3D]/40' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-4 font-bold text-center shrink-0">{rank}</span>
                        {row.photoURL ? (
                          <img
                            src={row.photoURL}
                            alt={row.username}
                            referrerPolicy="no-referrer"
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#1A1917] border border-[rgba(232,226,216,0.12)] text-[#E85D3D] flex items-center justify-center font-bold text-[8px] shrink-0">
                            {row.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-[#E8E2D8] text-[11px]">@{row.username}</span>
                        {isCurrUser && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-[#E85D3D]/20 text-[#E85D3D] font-bold border border-[#E85D3D]/30 shrink-0">
                            SIZ
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#F4A340] text-[11px] shrink-0 ml-2">
                        {row.wpm} <span className="text-[9px] text-[#5C574C]">wpm</span>
                      </span>
                    </div>
                  );
                })
              )}

              {/* User row if NOT in top 5 */}
              {!isUserInTop5 && (
                <>
                  <div className="border-t border-[rgba(232,226,216,0.08)] my-1.5" />
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#E85D3D]/10 border-l-2 border-l-[#E85D3D] text-[#E8E2D8] shadow-sm">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-4 font-bold text-center text-[#9A9488] shrink-0">
                        {userRankIndex >= 0 ? userRankIndex + 1 : '-'}
                      </span>
                      {currentUserRow.photoURL ? (
                        <img
                          src={currentUserRow.photoURL}
                          alt={currentUserRow.username}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#E85D3D] text-[#0F0E0D] flex items-center justify-center font-bold text-[8px] shrink-0">
                          {currentUserRow.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate text-[#E8E2D8] text-[11px]">
                        @{currentUserRow.username}
                      </span>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-[#E85D3D] text-[#0F0E0D] font-bold shrink-0">
                        SIZ
                      </span>
                    </div>
                    <span className="font-bold text-[#F4A340] text-[11px] shrink-0 ml-2">
                      {currentUserRow.wpm} <span className="text-[9px] text-[#5C574C]">wpm</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom link to full leaderboard */}
          <div className="pt-1 border-t border-[rgba(232,226,216,0.06)] flex justify-end">
            {onViewLeaderboard && (
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="text-[11px] font-mono text-[#E85D3D] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>Barchasini ko'rish</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compact Row of 4 Secondary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Raw WPM */}
        <div className="bg-[#1A1917] px-3 py-2.5 rounded-xl border border-[rgba(232,226,216,0.08)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9A9488]">{t('results_raw')}</span>
          <span className="text-base font-mono font-bold text-[#9A9488]">{rawWpm}</span>
        </div>

        {/* Character Breakdown */}
        <div className="bg-[#1A1917] px-3 py-2.5 rounded-xl border border-[rgba(232,226,216,0.08)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9A9488]">{t('results_chars')}</span>
          <div className="font-mono text-xs flex items-center space-x-1">
            <span className="text-[#6FA85C] font-semibold">{correctChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#D64545] font-semibold">{incorrectChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#F4A340] font-semibold">{extraChars}</span>
            <span className="text-[#5C574C]">/</span>
            <span className="text-[#9A9488]">{missedChars}</span>
          </div>
        </div>

        {/* Consistency */}
        <div className="bg-[#1A1917] px-3 py-2.5 rounded-xl border border-[rgba(232,226,216,0.08)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9A9488]">{t('results_consistency')}</span>
          <span className="text-base font-mono font-bold text-[#9A9488]">{consistency}%</span>
        </div>

        {/* Time */}
        <div className="bg-[#1A1917] px-3 py-2.5 rounded-xl border border-[rgba(232,226,216,0.08)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9A9488]">{t('results_time')}</span>
          <span className="text-base font-mono font-bold text-[#E8E2D8]">{timeSec}s</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="w-full sm:w-auto px-5 py-2 bg-[#1A1917] text-[#9A9488] hover:text-[#E8E2D8] font-mono text-xs font-semibold rounded-lg border border-[rgba(232,226,216,0.08)] hover:border-[rgba(232,226,216,0.2)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#6FA85C]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
        </button>

        <button
          type="button"
          onClick={onNextTest}
          className="w-full sm:w-auto px-6 py-2 bg-[#E85D3D] text-[#0F0E0D] font-mono text-xs font-semibold rounded-lg hover:bg-[#E85D3D]/90 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm group"
        >
          <span>{t('results_next_test') || 'Keyingi test'}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-5 py-2 bg-[#1A1917] text-[#9A9488] hover:text-[#E8E2D8] font-mono text-xs font-medium rounded-lg border border-[rgba(232,226,216,0.08)] hover:border-[rgba(232,226,216,0.2)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('results_restart') || 'Qaytadan'}</span>
        </button>
      </div>

      <div className="text-center font-mono text-[11px] text-[#5C574C]">
        {t('results_press_hint')}
      </div>
    </div>
  );
};

