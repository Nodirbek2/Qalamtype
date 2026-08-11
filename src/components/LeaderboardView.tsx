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
import { Trophy, Filter, Globe, Zap, Loader2, Database, Copy, Check } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, siteLanguage } = useSettings();

  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeRange: 'all',
    language: 'all',
    modeFilter: 'all',
    difficulty: 'all',
  });

  const [results, setResults] = useState<LeaderboardResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsTableMissing(false);

    const unsubscribe = subscribeToLeaderboard(
      filters,
      (data) => {
        setResults(data);
        setLoading(false);
      },
      (err) => {
        const msg = err.message || '';
        if (
          msg.includes('SUPABASE_TABLE_NOT_FOUND') ||
          msg.includes('Could not find the table') ||
          msg.includes('schema cache') ||
          msg.includes('does not exist')
        ) {
          setIsTableMissing(true);
          setError('supabase "results" table missing');
        } else {
          setError(msg || 'failed to load leaderboard data');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  const copySql = () => {
    const sql = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  photo_url text,
  wpm numeric NOT NULL,
  raw_wpm numeric NOT NULL,
  accuracy numeric NOT NULL,
  mode text NOT NULL,
  mode_value integer NOT NULL,
  difficulty text NOT NULL,
  typing_language text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles reading" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Public profiles reading" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public results reading" ON public.results;
DROP POLICY IF EXISTS "Users insert own result" ON public.results;

CREATE POLICY "Public results reading" ON public.results FOR SELECT USING (true);
CREATE POLICY "Users insert own result" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t('lb_just_now');
    if (diffMins < 60) return `${diffMins} ${t('lb_ago_mins')}`;
    if (diffHours < 24) return `${diffHours} ${t('lb_ago_hours')}`;
    if (diffDays < 7) return `${diffDays} ${t('lb_ago_days')}`;

    const locale = siteLanguage === 'uzbek' ? 'uz-UZ' : siteLanguage === 'russian' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, {
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
            <span>{t('lb_title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#E8E2D8] tracking-tight">
            {t('nav_leaderboard')}
          </h1>
          <p className="text-xs text-[#9A9488] font-mono mt-1">
            {t('lb_subtitle')}
          </p>
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
            {results.length} {t('lb_runs_loaded')}
          </div>
        </div>

        {/* Dropdown Filters: Language, Mode, Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Language Filter */}
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
                {t('lb_all_languages')}
              </option>
              <option value="uzbek" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('lang_uzbek')}
              </option>
              <option value="russian" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('lang_russian')}
              </option>
              <option value="english" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('lang_english')}
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
                {t('lb_all_modes_durations')}
              </option>
              <option value="time" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('lb_time_mode')}
              </option>
              <option value="time_15" className="bg-[#1A1917] text-[#E8E2D8]">
                15s
              </option>
              <option value="time_30" className="bg-[#1A1917] text-[#E8E2D8]">
                30s
              </option>
              <option value="time_60" className="bg-[#1A1917] text-[#E8E2D8]">
                60s
              </option>
              <option value="time_120" className="bg-[#1A1917] text-[#E8E2D8]">
                120s
              </option>
              <option value="words" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('lb_words_mode')}
              </option>
              <option value="words_10" className="bg-[#1A1917] text-[#E8E2D8]">
                10 {t('mode_words')}
              </option>
              <option value="words_25" className="bg-[#1A1917] text-[#E8E2D8]">
                25 {t('mode_words')}
              </option>
              <option value="words_50" className="bg-[#1A1917] text-[#E8E2D8]">
                50 {t('mode_words')}
              </option>
              <option value="words_100" className="bg-[#1A1917] text-[#E8E2D8]">
                100 {t('mode_words')}
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
                {t('lb_all_difficulties')}
              </option>
              <option value="easy" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('diff_easy')}
              </option>
              <option value="medium" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('diff_medium')}
              </option>
              <option value="hard" className="bg-[#1A1917] text-[#E8E2D8]">
                {t('diff_hard')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Schema Notice Banner when table missing */}
      {isTableMissing && (
        <div className="bg-[#1A1917] border border-[#F4A340]/30 rounded-xl p-4 font-mono text-xs text-[#E8E2D8] space-y-3 shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-[#F4A340]">
              <Database className="w-4 h-4 text-[#E85D3D] shrink-0" />
              <span className="font-medium text-xs">
                {t('lb_notice_title')}
              </span>
            </div>
            <button
              onClick={copySql}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E85D3D] hover:bg-[#d44e30] text-[#E8E2D8] rounded font-medium transition-colors text-xs shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              <span>{copied ? t('lb_notice_copied') : t('lb_notice_copy')}</span>
            </button>
          </div>
          <p className="text-[#9A9488] text-[11px] leading-relaxed">
            {t('lb_notice_desc')}
          </p>
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#9A9488] space-y-3 font-mono text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#E85D3D]" />
            <span>{t('lb_loading')}</span>
          </div>
        ) : error && !isTableMissing ? (
          <div className="py-16 text-center text-[#D64545] font-mono text-xs">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-mono text-[#E8E2D8]">{t('lb_empty')}</p>
            <p className="text-xs text-[#9A9488] font-mono">
              {t('lb_empty_sub')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[rgba(232,226,216,0.08)] bg-[#0F0E0D]/60 text-[#9A9488] text-[11px]">
                  <th className="py-3 px-4 font-normal w-14 text-center">#</th>
                  <th className="py-3 px-4 font-normal">{t('lb_user')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('results_wpm')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('results_acc')}</th>
                  <th className="py-3 px-4 font-normal">{t('mode_time')} / {t('lb_all_modes')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('lb_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(232,226,216,0.05)]">
                {results.map((row, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;
                  const isCurrentUser = currentUser && row.uid === currentUser.uid;

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

                  const langText = t(`lang_${row.typingLanguage}` as any) || row.typingLanguage;
                  const diffText = t(`diff_${row.difficulty}` as any) || row.difficulty;

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
                                {t('lb_you')}
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
                        <span className="capitalize">{langText}</span>
                        <span className="text-[#5C574C] mx-1">•</span>
                        <span>{row.mode === 'time' ? `${row.modeValue}s` : `${row.modeValue} ${t('mode_words')}`}</span>
                        <span className="text-[#5C574C] mx-1">•</span>
                        <span className="text-[10px] text-[#5C574C]">{diffText}</span>
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
