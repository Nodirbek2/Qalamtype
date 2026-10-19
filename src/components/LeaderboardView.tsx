import { interfaceText } from '../data/interfaceCopy';
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
import { LeaderboardFilter } from './LeaderboardFilter';
import './leaderboardFilters.css';

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

    const locale = siteLanguage === 'uzbek_latin' ? 'uz-UZ' : siteLanguage === 'russian' ? 'ru-RU' : 'en-US';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[rgba(240,243,250,0.08)]">
        <div>
          <div className="flex items-center space-x-2 text-[#D6F36B] font-mono text-xs mb-1">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>{t('lb_title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#F0F3FA] tracking-tight">
            {t('nav_leaderboard')}
          </h1>
          <p className="text-xs text-[#A6B1C5] font-mono mt-1">
            {t('lb_subtitle')}
          </p>
        </div>
      </div>

      {/* Primary Filters Control Bar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Time Range Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#171E2B] p-1.5 rounded-xl border border-[rgba(240,243,250,0.08)]">
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
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-sans font-medium transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#0D111A] text-[#D6F36B] border border-[rgba(240,243,250,0.12)] shadow-xs'
                      : 'text-[#A6B1C5] hover:text-[#F0F3FA] hover:bg-[rgba(240,243,250,0.04)]'
                  }`}
                >
                  {labels[tr]}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#748199] font-mono px-3 hidden md:block">
            {results.length} {t('lb_runs_loaded')}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LeaderboardFilter<LanguageFilter>
            label={t('lb_filter_language')} value={filters.language} icon={<Globe size={17}/>}
            onChange={language => setFilters(f => ({ ...f, language }))}
            options={[
              { value: 'all', label: t('lb_all_languages') },
              { value: 'uzbek_latin', label: t('lang_uzbek_latin') },
              { value: 'uzbek_cyrillic', label: t('lang_uzbek_cyrillic') },
              { value: 'russian', label: t('lang_russian') },
              { value: 'english', label: t('lang_english') },
            ]}/>
          <LeaderboardFilter<ModeFilter>
            label={t('lb_filter_mode')} value={filters.modeFilter} icon={<Zap size={17}/>}
            onChange={modeFilter => setFilters(f => ({ ...f, modeFilter }))}
            options={[
              { value: 'all', label: t('lb_all_modes_durations') },
              { value: 'time', label: t('lb_time_mode'), group: t('mode_time') },
              ...([15, 30, 60, 120] as const).map(n => ({ value: `time_${n}` as ModeFilter, label: `${n}s`, group: t('mode_time') })),
              { value: 'words', label: t('lb_words_mode'), group: t('mode_words') },
              ...([10, 25, 50, 100] as const).map(n => ({ value: `words_${n}` as ModeFilter, label: `${n} ${t('mode_words')}`, group: t('mode_words') })),
            ]}/>
          <LeaderboardFilter<DifficultyFilter>
            label={t('lb_filter_difficulty')} value={filters.difficulty} icon={<Filter size={17}/>}
            onChange={difficulty => setFilters(f => ({ ...f, difficulty }))}
            options={[
              { value: 'all', label: t('lb_all_difficulties') },
              { value: 'easy', label: t('diff_easy') },
              { value: 'medium', label: t('diff_medium') },
              { value: 'hard', label: t('diff_hard') },
            ]}/>
        </div>
      </div>

      {/* Database Schema Notice Banner when table missing */}
      {isTableMissing && (
        <div className="bg-[#171E2B] border border-[#63D9DA]/30 rounded-xl p-4 font-mono text-xs text-[#F0F3FA] space-y-3 shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-[#63D9DA]">
              <Database className="w-4 h-4 text-[#D6F36B] shrink-0" />
              <span className="font-medium text-xs">
                {t('lb_notice_title')}
              </span>
            </div>
            <button
              onClick={copySql}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D6F36B] hover:bg-[#d44e30] text-[#F0F3FA] rounded font-medium transition-colors text-xs shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              <span>{copied ? t('lb_notice_copied') : t('lb_notice_copy')}</span>
            </button>
          </div>
          <p className="text-[#A6B1C5] text-[11px] leading-relaxed">
            {t('lb_notice_desc')}
          </p>
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="bg-[#171E2B] rounded-xl border border-[rgba(240,243,250,0.08)] overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#A6B1C5] space-y-3 font-mono text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#D6F36B]" />
            <span>{t('lb_loading')}</span>
          </div>
        ) : error && !isTableMissing ? (
          <div className="py-16 text-center text-[#D64545] font-mono text-xs">
            {interfaceText(siteLanguage, 'loadFailed')}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-mono text-[#F0F3FA]">{t('lb_empty')}</p>
            <p className="text-xs text-[#A6B1C5] font-mono">
              {t('lb_empty_sub')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[rgba(240,243,250,0.08)] bg-[#0D111A]/60 text-[#A6B1C5] text-[11px]">
                  <th className="py-3 px-4 font-normal w-14 text-center">#</th>
                  <th className="py-3 px-4 font-normal">{t('lb_user')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('results_wpm')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('results_acc')}</th>
                  <th className="py-3 px-4 font-normal">{t('mode_time')} / {t('lb_all_modes')}</th>
                  <th className="py-3 px-4 font-normal text-right">{t('lb_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(240,243,250,0.05)]">
                {results.map((row, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;
                  const isCurrentUser = currentUser && row.uid === currentUser.id;

                  let rowBorderClass = '';
                  let rankColorClass = 'text-[#A6B1C5]';

                  if (isTop1) {
                    rowBorderClass = 'border-l-4 border-l-[#D6F36B] bg-[#D6F36B]/5';
                    rankColorClass = 'text-[#D6F36B] font-bold text-sm';
                  } else if (isTop2) {
                    rowBorderClass = 'border-l-4 border-l-[#63D9DA] bg-[#63D9DA]/5';
                    rankColorClass = 'text-[#63D9DA] font-bold text-sm';
                  } else if (isTop3) {
                    rowBorderClass = 'border-l-4 border-l-[#63D9DA]/60 bg-[#63D9DA]/3';
                    rankColorClass = 'text-[#63D9DA]/90 font-bold';
                  }

                  const langText = t(`lang_${row.typingLanguage}` as any) || row.typingLanguage;
                  const diffText = t(`diff_${row.difficulty}` as any) || row.difficulty;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-[rgba(240,243,250,0.03)] transition-colors ${rowBorderClass} ${
                        isCurrentUser ? 'bg-[#D6F36B]/10' : ''
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
                            <div className="w-6 h-6 rounded-full bg-[#171E2B] border border-[rgba(240,243,250,0.12)] text-[#D6F36B] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                              {row.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#F0F3FA] hover:text-[#D6F36B] transition-colors">
                              @{row.username}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D6F36B]/20 text-[#D6F36B] border border-[#D6F36B]/30">
                                {t('lb_you')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WPM */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-semibold text-[#63D9DA]">
                          {row.wpm}
                        </span>
                        <span className="text-[10px] text-[#748199] ml-1">wpm</span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-[#F0F3FA]">{row.accuracy}%</span>
                      </td>

                      {/* Mode details */}
                      <td className="py-3.5 px-4 text-[#A6B1C5]">
                        <span className="capitalize">{langText}</span>
                        <span className="text-[#748199] mx-1">•</span>
                        <span>{row.mode === 'time' ? `${row.modeValue}s` : `${row.modeValue} ${t('mode_words')}`}</span>
                        <span className="text-[#748199] mx-1">•</span>
                        <span className="text-[10px] text-[#748199]">{diffText}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#748199]">
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
