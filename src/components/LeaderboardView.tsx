import React, { useState, useEffect } from 'react';
import {
  subscribeToLeaderboard,
  LeaderboardResult,
  LeaderboardFilters,
  TimeRangeFilter,
  LanguageFilter,
  ModeFilter,
  DifficultyFilter,
} from '../lib/resultsService';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Trophy, Filter, Globe, Zap, Loader2, Calendar, RefreshCw } from 'lucide-react';
import { Language, Difficulty } from '../types';

export const LeaderboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useSettings();

  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeRange: 'all',
    language: 'all',
    modeFilter: 'all',
    difficulty: 'all',
  });

  const [results, setResults] = useState<LeaderboardResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToLeaderboard(
      filters,
      (data) => {
        setResults(data);
        setLoading(false);
      },
      (err) => {
        setError('failed to load leaderboard data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 font-sans animate-fade-in select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[rgba(232,226,216,0.08)]">
        <div>
          <div className="flex items-center space-x-2 text-[#E85D3D] font-mono text-xs mb-1">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>{t('leaderboard_global_rankings')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#E8E2D8] tracking-tight">
            {t('nav_leaderboard')}
          </h1>
          <p className="text-xs text-[#9A9488] font-mono mt-1">
            {t('leaderboard_subtitle')}
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#1A1917] border border-[rgba(232,226,216,0.1)] text-[11px] font-mono text-[#6FA85C]">
          <span className="w-2 h-2 rounded-full bg-[#6FA85C] animate-pulse" />
          <span>{t('leaderboard_live_sync')}</span>
        </div>
      </div>

      {/* Primary Filters Control Bar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Time Range Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#1A1917] p-1.5 rounded-xl border border-[rgba(232,226,216,0.08)]">
          <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['today', 'week', 'month', 'all'] as TimeRangeFilter[]).map((tr) => {
              const labels: Record<TimeRangeFilter, string> = {
                today: t('filter_today'),
                week: t('filter_week'),
                month: t('filter_month'),
                all: t('filter_all'),
              };
              const active = filters.timeRange === tr;
              return (
                <button
                  key={tr}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, timeRange: tr }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#0F0E0D] text-[#E85D3D] border border-[rgba(232,226,216,0.12)] shadow-xs'
                      : 'text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.04)]'
                  }`}
                >
                  {labels[tr]}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#5C574C] font-mono px-3 hidden md:block">
            {results.length} runs loaded
          </div>
        </div>

        {/* Dropdown Filters: Language, Mode, Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Language Filter (Uzbek listed FIRST as requested) */}
          <div className="flex items-center space-x-2 bg-[#1A1917] px-3 py-2 rounded-lg border border-[rgba(232,226,216,0.08)]">
            <Globe className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
            <select
              value={filters.language}
              onChange={(e) =>
                setFilters((f) => ({ ...f, language: e.target.value as LanguageFilter }))
              }
              className="bg-transparent text-xs font-mono text-[#E8E2D8] w-full focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1A1917] text-[#E8E2D8]">
                all languages
              </option>
              <option value="uzbek" className="bg-[#1A1917] text-[#E8E2D8]">
                uzbek (UZ)
              </option>
              <option value="russian" className="bg-[#1A1917] text-[#E8E2D8]">
                russian (RU)
              </option>
              <option value="english" className="bg-[#1A1917] text-[#E8E2D8]">
                english (EN)
              </option>
            </select>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center space-x-2 bg-[#1A1917] px-3 py-2 rounded-lg border border-[rgba(232,226,216,0.08)]">
            <Zap className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
            <select
              value={filters.modeFilter}
              onChange={(e) =>
                setFilters((f) => ({ ...f, modeFilter: e.target.value as ModeFilter }))
              }
              className="bg-transparent text-xs font-mono text-[#E8E2D8] w-full focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1A1917] text-[#E8E2D8]">
                all modes & durations
              </option>
              <option value="time" className="bg-[#1A1917] text-[#E8E2D8]">
                time mode (any)
              </option>
              <option value="time_15" className="bg-[#1A1917] text-[#E8E2D8]">
                time 15s
              </option>
              <option value="time_30" className="bg-[#1A1917] text-[#E8E2D8]">
                time 30s
              </option>
              <option value="time_60" className="bg-[#1A1917] text-[#E8E2D8]">
                time 60s
              </option>
              <option value="time_120" className="bg-[#1A1917] text-[#E8E2D8]">
                time 120s
              </option>
              <option value="words" className="bg-[#1A1917] text-[#E8E2D8]">
                words mode (any)
              </option>
              <option value="words_10" className="bg-[#1A1917] text-[#E8E2D8]">
                words 10
              </option>
              <option value="words_25" className="bg-[#1A1917] text-[#E8E2D8]">
                words 25
              </option>
              <option value="words_50" className="bg-[#1A1917] text-[#E8E2D8]">
                words 50
              </option>
              <option value="words_100" className="bg-[#1A1917] text-[#E8E2D8]">
                words 100
              </option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2 bg-[#1A1917] px-3 py-2 rounded-lg border border-[rgba(232,226,216,0.08)]">
            <Filter className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((f) => ({ ...f, difficulty: e.target.value as DifficultyFilter }))
              }
              className="bg-transparent text-xs font-mono text-[#E8E2D8] w-full focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1A1917] text-[#E8E2D8]">
                all difficulties
              </option>
              <option value="easy" className="bg-[#1A1917] text-[#E8E2D8]">
                easy
              </option>
              <option value="medium" className="bg-[#1A1917] text-[#E8E2D8]">
                medium
              </option>
              <option value="hard" className="bg-[#1A1917] text-[#E8E2D8]">
                hard
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#9A9488] space-y-3 font-mono text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#E85D3D]" />
            <span>fetching live rankings...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-[#D64545] font-mono text-xs">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-mono text-[#E8E2D8]">no results recorded for this filter yet</p>
            <p className="text-xs text-[#9A9488] font-mono">
              be the first to complete a test in this category to claim #1 rank!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[rgba(232,226,216,0.08)] bg-[#0F0E0D]/60 text-[#9A9488] text-[11px]">
                  <th className="py-3 px-4 font-normal w-14 text-center">#</th>
                  <th className="py-3 px-4 font-normal">user</th>
                  <th className="py-3 px-4 font-normal text-right">wpm</th>
                  <th className="py-3 px-4 font-normal text-right">accuracy</th>
                  <th className="py-3 px-4 font-normal">mode</th>
                  <th className="py-3 px-4 font-normal text-right">date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(232,226,216,0.05)]">
                {results.map((row, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;
                  const isCurrentUser = currentUser && row.uid === currentUser.uid;

                  // Top 3 rows get subtle accent border & accent rank styling
                  let rowBorderClass = '';
                  let rankColorClass = 'text-[#9A9488]';

                  if (isTop1) {
                    rowBorderClass = 'border-l-4 border-l-[#E85D3D] bg-[#E85D3D]/5';
                    rankColorClass = 'text-[#E85D3D] font-bold text-sm';
                  } else if (isTop2) {
                    rowBorderClass = 'border-l-4 border-l-[#F4A340] bg-[#F4A340]/5';
                    rankColorClass = 'text-[#F4A340] font-bold text-sm';
                  } else if (isTop3) {
                    rowBorderClass = 'border-l-4 border-l-[#F4A340]/60 bg-[#F4A340]/3';
                    rankColorClass = 'text-[#F4A340]/90 font-bold';
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-[rgba(232,226,216,0.03)] transition-colors ${rowBorderClass} ${
                        isCurrentUser ? 'bg-[#E85D3D]/10' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className={`py-3.5 px-4 text-center ${rankColorClass}`}>
                        {rank}
                      </td>

                      {/* User Avatar + Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          {row.photoURL ? (
                            <img
                              src={row.photoURL}
                              alt={row.username}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#1A1917] border border-[rgba(232,226,216,0.12)] text-[#E85D3D] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                              {row.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#E8E2D8] hover:text-[#E85D3D] transition-colors">
                              @{row.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E85D3D]/20 text-[#E85D3D] border border-[#E85D3D]/30">
                                you
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WPM */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-semibold text-[#F4A340]">
                          {row.wpm}
                        </span>
                        <span className="text-[10px] text-[#5C574C] ml-1">wpm</span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-[#E8E2D8]">{row.accuracy}%</span>
                      </td>

                      {/* Mode details */}
                      <td className="py-3.5 px-4 text-[#9A9488]">
                        <span className="capitalize">{row.typingLanguage}</span>
                        <span className="text-[#5C574C] mx-1">•</span>
                        <span>{row.mode === 'time' ? `${row.modeValue}s` : `${row.modeValue}w`}</span>
                        <span className="text-[#5C574C] mx-1">•</span>
                        <span className="text-[10px] text-[#5C574C]">{row.difficulty}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#5C574C]">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
