import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  subscribeToUserResults,
  uploadAvatarImage,
  LeaderboardResult,
} from '../lib/resultsService';
import {
  User,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Activity,
  Target,
  FileCheck,
  Clock,
  Globe,
  Zap,
  Save,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AccountView: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { t } = useSettings();

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results & Stats states
  const [userResults, setUserResults] = useState<LeaderboardResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  // Populate form fields from userProfile
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
    }
  }, [userProfile]);

  // Subscribe to user's results in Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    const unsubscribe = subscribeToUserResults(
      currentUser.uid,
      (data) => {
        setUserResults(data);
        setLoadingResults(false);
      },
      (err) => {
        console.error('Failed to load user stats:', err);
        setLoadingResults(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Save profile changes (first name, last name)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!firstName.trim()) {
      setProfileError('first name cannot be empty');
      return;
    }
    if (!lastName.trim()) {
      setProfileError('last name cannot be empty');
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError('failed to save profile: ' + (err.message || ''));
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle avatar image selection and upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('file size must be less than 5MB');
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const downloadUrl = await uploadAvatarImage(currentUser.uid, file);
      await updateUserProfile({ photoURL: downloadUrl });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setAvatarError('failed to upload image: ' + (err.message || ''));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="w-full max-w-md mx-auto py-20 px-4 text-center font-sans">
        <div className="p-8 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.12)] space-y-4">
          <User className="w-12 h-12 text-[#E85D3D] mx-auto" />
          <h2 className="text-xl font-medium text-[#E8E2D8]">{t('acc_login_required')}</h2>
          <p className="text-xs text-[#9A9488] font-mono">
            {t('acc_login_desc')}
          </p>
        </div>
      </div>
    );
  }

  // Derived statistics
  const totalTests = userResults.length;
  const bestWpm = totalTests > 0 ? Math.max(...userResults.map((r) => r.wpm)) : 0;
  const avgWpm =
    totalTests > 0
      ? Math.round(userResults.reduce((acc, r) => acc + r.wpm, 0) / totalTests)
      : 0;
  const avgAccuracy =
    totalTests > 0
      ? Math.round((userResults.reduce((acc, r) => acc + r.accuracy, 0) / totalTests) * 10) / 10
      : 0;

  // Calculate total time spent typing in seconds
  const totalTimeSeconds = userResults.reduce((acc, r) => {
    if (r.mode === 'time') return acc + (r.modeValue || 30);
    const approxSec = r.wpm > 0 ? Math.round(((r.modeValue || 25) / (r.wpm / 5)) * 60) : 30;
    return acc + Math.min(approxSec, 300);
  }, 0);

  const formatTotalTime = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const hours = (mins / 60).toFixed(1);
    if (mins < 60) return `${mins}m`;
    return `${hours}h`;
  };

  // Last 50 tests for WPM / Accuracy over time chart
  const recent50Results = userResults.slice(-50);
  const lineChartData = recent50Results.map((r, i) => {
    const d = new Date(r.date);
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return {
      index: i + 1,
      date: dateLabel,
      wpm: r.wpm,
      rawWpm: r.rawWpm,
      accuracy: r.accuracy,
      mode: r.mode === 'time' ? `${r.modeValue}s` : `${r.modeValue}w`,
      language: t(`lang_${r.typingLanguage}` as any) || r.typingLanguage,
    };
  });

  // Language Breakdown Data
  const languagesList: Array<{ lang: 'uzbek' | 'russian' | 'english'; labelKey: string }> = [
    { lang: 'uzbek', labelKey: 'lang_uzbek' },
    { lang: 'russian', labelKey: 'lang_russian' },
    { lang: 'english', labelKey: 'lang_english' },
  ];

  const languageStats = languagesList.map(({ lang, labelKey }) => {
    const langRuns = userResults.filter((r) => r.typingLanguage === lang);
    const count = langRuns.length;
    const avg =
      count > 0 ? Math.round(langRuns.reduce((acc, r) => acc + r.wpm, 0) / count) : 0;
    const max = count > 0 ? Math.max(...langRuns.map((r) => r.wpm)) : 0;
    return { lang, label: t(labelKey as any), count, avg, max };
  });

  // Difficulty Breakdown Data
  const difficultiesList: Array<{ diff: 'easy' | 'medium' | 'hard'; labelKey: string }> = [
    { diff: 'easy', labelKey: 'diff_easy' },
    { diff: 'medium', labelKey: 'diff_medium' },
    { diff: 'hard', labelKey: 'diff_hard' },
  ];

  const difficultyStats = difficultiesList.map(({ diff, labelKey }) => {
    const diffRuns = userResults.filter((r) => r.difficulty === diff);
    const count = diffRuns.length;
    const avg =
      count > 0 ? Math.round(diffRuns.reduce((acc, r) => acc + r.wpm, 0) / count) : 0;
    const max = count > 0 ? Math.max(...diffRuns.map((r) => r.wpm)) : 0;
    return { diff, label: t(labelKey as any), count, avg, max };
  });

  // Initials for fallback avatar
  const initials =
    (userProfile.firstName?.[0] || '') + (userProfile.lastName?.[0] || '') ||
    userProfile.username?.[0]?.toUpperCase() ||
    'U';

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 font-sans animate-fade-in select-none space-y-8">
      {/* Page Header */}
      <div className="border-b border-[rgba(232,226,216,0.08)] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#E8E2D8] tracking-tight">
            {t('acc_title')}
          </h1>
          <p className="text-xs text-[#9A9488] font-mono mt-1">
            {t('acc_subtitle')}
          </p>
        </div>
      </div>

      {/* Top Section: Profile Card & Edit Form */}
      <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Avatar & Photo Upload Section */}
          <div className="flex flex-col items-center space-y-3 shrink-0 mx-auto lg:mx-0">
            <div className="relative group">
              {/* Circular Avatar */}
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.username}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-2 border-[rgba(232,226,216,0.12)] shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#0F0E0D] border-2 border-[rgba(232,226,216,0.12)] text-[#E85D3D] flex items-center justify-center font-mono font-bold text-3xl shadow-md">
                  {initials}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#E8E2D8] cursor-pointer"
                title={t('acc_change_photo')}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#E85D3D]" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1 text-[#E85D3D]" />
                    <span className="text-[10px] font-mono">upload</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            {/* Change Photo Link */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs font-mono text-[#E85D3D] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{uploadingAvatar ? t('acc_saving') : t('acc_change_photo')}</span>
            </button>

            {avatarError && (
              <p className="text-[11px] font-mono text-[#D64545] max-w-xs text-center">
                {avatarError}
              </p>
            )}
          </div>

          {/* Editable Form Fields */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-[#E8E2D8]">{t('acc_personal_info')}</h2>
                <span className="text-[11px] text-[#9A9488] font-mono">
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </span>
              </div>

              {profileError && (
                <div className="p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg flex items-center space-x-2 text-xs text-[#D64545] font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-[#6FA85C]/10 border border-[#6FA85C]/30 rounded-lg flex items-center space-x-2 text-xs text-[#6FA85C] font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('acc_saved')}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                    {t('acc_first_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3.5 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                  />
                </div>

                {/* Surname / Last Name */}
                <div>
                  <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                    {t('acc_last_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3.5 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username (Read-only) */}
                <div>
                  <label className="block text-xs text-[#9A9488] mb-1 font-mono flex items-center justify-between">
                    <span>{t('acc_username')}</span>
                    <span className="text-[10px] text-[#5C574C] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`@${userProfile.username}`}
                    className="w-full bg-[#0F0E0D]/60 border border-[rgba(232,226,216,0.06)] rounded-lg px-3.5 py-2 text-sm text-[#9A9488] font-mono cursor-not-allowed select-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                    {t('acc_email')}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userProfile.email}
                    className="w-full bg-[#0F0E0D]/60 border border-[rgba(232,226,216,0.06)] rounded-lg px-3.5 py-2 text-sm text-[#9A9488] font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F0E0D]" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('acc_save_changes')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dashboard Section Title */}
      <div className="pt-2">
        <h2 className="text-xl font-medium text-[#E8E2D8] tracking-tight mb-1">
          {t('acc_stats_title')}
        </h2>
        <p className="text-xs text-[#9A9488] font-mono">
          {t('acc_stats_subtitle')}
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Best WPM */}
        <div className="bg-[#1A1917] rounded-xl p-4 border border-[rgba(232,226,216,0.08)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#E85D3D]">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9488]">best</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F4A340]">
              {bestWpm}
            </div>
            <div className="text-[11px] font-mono text-[#9A9488] mt-0.5">{t('acc_best_wpm')}</div>
          </div>
        </div>

        {/* Avg WPM */}
        <div className="bg-[#1A1917] rounded-xl p-4 border border-[rgba(232,226,216,0.08)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#F4A340]">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9488]">avg</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E2D8]">
              {avgWpm}
            </div>
            <div className="text-[11px] font-mono text-[#9A9488] mt-0.5">{t('acc_avg_wpm')}</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#1A1917] rounded-xl p-4 border border-[rgba(232,226,216,0.08)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#6FA85C]">
            <Target className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9488]">acc</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#6FA85C]">
              {avgAccuracy}%
            </div>
            <div className="text-[11px] font-mono text-[#9A9488] mt-0.5">{t('acc_avg_acc')}</div>
          </div>
        </div>

        {/* Tests Completed */}
        <div className="bg-[#1A1917] rounded-xl p-4 border border-[rgba(232,226,216,0.08)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#E8E2D8]">
            <FileCheck className="w-4 h-4 text-[#9A9488]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9488]">runs</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E2D8]">
              {totalTests}
            </div>
            <div className="text-[11px] font-mono text-[#9A9488] mt-0.5">{t('acc_tests_completed')}</div>
          </div>
        </div>

        {/* Time Typing */}
        <div className="bg-[#1A1917] rounded-xl p-4 border border-[rgba(232,226,216,0.08)] flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#9A9488]">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9488]">time</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E8E2D8]">
              {formatTotalTime(totalTimeSeconds)}
            </div>
            <div className="text-[11px] font-mono text-[#9A9488] mt-0.5">{t('acc_typing_time')}</div>
          </div>
        </div>
      </div>

      {/* Main Improvement Chart: WPM & Accuracy over time (Last 50 tests) */}
      <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-medium text-[#E8E2D8]">{t('acc_progress_title')}</h3>
          </div>

          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E85D3D]" />
              <span className="text-[#E8E2D8]">wpm</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6FA85C]" />
              <span className="text-[#9A9488]">accuracy %</span>
            </div>
          </div>
        </div>

        {loadingResults ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#9A9488] font-mono text-xs space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#E85D3D]" />
            <span>{t('lb_loading')}</span>
          </div>
        ) : lineChartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Activity className="w-8 h-8 text-[#5C574C]" />
            <p className="text-xs font-mono text-[#E8E2D8]">{t('lb_empty')}</p>
          </div>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,226,216,0.05)" />
                <XAxis
                  dataKey="index"
                  stroke="#9A9488"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(232,226,216,0.1)' }}
                />
                <YAxis
                  yAxisId="wpm"
                  stroke="#F4A340"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(232,226,216,0.1)' }}
                  domain={[0, 'auto']}
                />
                <YAxis
                  yAxisId="acc"
                  orientation="right"
                  stroke="#6FA85C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(232,226,216,0.1)' }}
                  domain={[0, 100]}
                  hide
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F0E0D',
                    borderColor: 'rgba(232,226,216,0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#E8E2D8',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'wpm') return [`${value} WPM`, 'WPM'];
                    if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `Test #${label} (${data.date}) • ${data.language}`;
                    }
                    return `Test #${label}`;
                  }}
                />
                <Line
                  yAxisId="wpm"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#E85D3D"
                  strokeWidth={2}
                  dot={{ fill: '#E85D3D', r: 3 }}
                  activeDot={{ r: 5, fill: '#F4A340' }}
                />
                <Line
                  yAxisId="acc"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#6FA85C"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Secondary Section: Breakdown by Language & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Typing Language */}
        <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#E85D3D]" />
                <h3 className="text-base font-medium text-[#E8E2D8]">{t('acc_by_language')}</h3>
              </div>
              <span className="text-[11px] font-mono text-[#9A9488]">avg wpm</span>
            </div>

            <div className="space-y-3">
              {languageStats.map((item) => (
                <div key={item.lang} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#E8E2D8] font-medium">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#9A9488] text-[10px]">
                        {item.count} test
                      </span>
                      <span className="text-[#F4A340] font-bold">{item.avg} wpm</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#0F0E0D] h-2 rounded-full overflow-hidden border border-[rgba(232,226,216,0.06)]">
                    <div
                      className="bg-[#E85D3D] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (item.avg / (bestWpm || 100)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown by Difficulty */}
        <div className="bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.08)] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#F4A340]" />
                <h3 className="text-base font-medium text-[#E8E2D8]">{t('acc_by_difficulty')}</h3>
              </div>
              <span className="text-[11px] font-mono text-[#9A9488]">avg wpm</span>
            </div>

            <div className="space-y-3">
              {difficultyStats.map((item) => (
                <div key={item.diff} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#E8E2D8] font-medium capitalize">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#9A9488] text-[10px]">
                        {item.count} test
                      </span>
                      <span className="text-[#F4A340] font-bold">{item.avg} wpm</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#0F0E0D] h-2 rounded-full overflow-hidden border border-[rgba(232,226,216,0.06)]">
                    <div
                      className="bg-[#F4A340] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (item.avg / (bestWpm || 100)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
