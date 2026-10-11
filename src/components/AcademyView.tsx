import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { ACADEMY_TIERS } from '../data/academyData';
import { AcademyLesson, Language, LessonProgress } from '../types';
import { academyAccuracy, academyCopy, calculateTierStars, lessonUnlocked, starGoals } from '../lib/academyLearning';
import { KeyboardCoach } from './KeyboardCoach';
export { calculateTierStars } from '../lib/academyLearning';
import { TypingArea } from './TypingArea';
import { AuthModal } from './AuthModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  GraduationCap,
  Lock,
  Unlock,
  Star,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  ArrowRight,
  Globe,
  Trophy,
  Sparkles,
  AlertCircle,
  Award,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { t, typingSound, setTypingLanguage, siteLanguage } = useSettings();

  const c = academyCopy[siteLanguage];
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Selected language for Academy lessons
  const [academyLang, setAcademyLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qalampir_academy_lang');
      if (saved === 'uzbek_latin' || saved === 'uzbek_cyrillic' || saved === 'russian' || saved === 'english') {
        return saved;
      }
    }
    return userProfile?.preferredTypingLanguage || 'uzbek_latin';
  });

  const handleLanguageChange = (lang: Language) => {
    setAcademyLang(lang);
    setTypingLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qalampir_academy_lang', lang);
    }
  };

  // Active Lesson State (null = Skill Map view)
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);

  // Progress State: Record<lessonId, LessonProgress>
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});

  // Fetch / load progress from LocalStorage + Supabase
  useEffect(() => {
    let active = true;
    setProgressMap({});
    setActiveLesson(null);
    if (!currentUser) return;

    const loadProgress = async () => {
      const storageKey = `qalampir_academy_progress_${currentUser.id}_${academyLang}`;
      let initialMap: Record<string, LessonProgress> = {};

      // Local storage fallback
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          initialMap = JSON.parse(saved);
          if (active) setProgressMap(initialMap);
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }

      // Fetch from Supabase
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('academy_progress')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('language', academyLang);

          if (!error && data && data.length > 0) {
            const mergedMap: Record<string, LessonProgress> = { ...initialMap };
            data.forEach((row: any) => {
              const existing = mergedMap[row.lesson_id];
              const stars = row.stars || 0;
              mergedMap[row.lesson_id] = {
                completed: stars > 0 || (existing ? existing.completed : false),
                stars: Math.max(stars, existing?.stars || 0),
                bestWpm: Math.max(row.best_wpm || 0, existing?.bestWpm || 0),
                bestAccuracy: Math.max(row.best_accuracy || 0, existing?.bestAccuracy || 0),
              };
            });
            if (!active) return;
            setProgressMap(mergedMap);
            localStorage.setItem(storageKey, JSON.stringify(mergedMap));
          }
        } catch (err) {
          console.warn('Supabase progress fetch warning:', err);
        }
      }
    };

    loadProgress();
    return () => { active = false; };
  }, [currentUser, academyLang]);

  // Function to save progress to LocalStorage and Supabase
  const saveLessonProgress = useCallback(
    async (lesson: AcademyLesson, wpm: number, accuracy: number): Promise<{ stars: number; isNewRecord: boolean }> => {
      const stars = calculateTierStars(lesson.tierNumber, wpm, accuracy);

      const existing = progressMap[lesson.id];
      const updatedStars = Math.max(existing?.stars || 0, stars);
      const updatedWpm = Math.max(existing?.bestWpm || 0, wpm);
      const updatedAccuracy = Math.max(existing?.bestAccuracy || 0, accuracy);
      const isNewRecord = stars > 0 && (wpm > (existing?.bestWpm || 0) || stars > (existing?.stars || 0));
      const nextMap = {
        ...progressMap,
        [lesson.id]: {
          completed: updatedStars > 0 || Boolean(existing?.completed),
          stars: updatedStars,
          bestWpm: updatedWpm,
          bestAccuracy: updatedAccuracy,
        },
      };
      setProgressMap(nextMap);
      try {
        if (currentUser) localStorage.setItem(`qalampir_academy_progress_${currentUser.id}_${academyLang}`, JSON.stringify(nextMap));
      } catch (error) {
        console.warn('Academy local storage unavailable:', error);
      }

      // Upsert to Supabase table `academy_progress`
      if (isSupabaseConfigured && currentUser && stars > 0) {
        try {
          const { error } = await supabase.from('academy_progress').upsert(
            {
              user_id: currentUser.id,
              lesson_id: lesson.id,
              tier: lesson.tierNumber,
              language: academyLang,
              stars: updatedStars,
              best_wpm: updatedWpm,
              best_accuracy: updatedAccuracy,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,lesson_id,language' }
          );

          if (error) {
            console.warn('Supabase academy_progress upsert warning:', error.message);
          }
        } catch (err) {
          console.warn('Supabase upsert error:', err);
        }
      }

      return { stars, isNewRecord };
    },
    [currentUser, academyLang, progressMap]
  );

  const isLessonUnlocked = useCallback(
    (lesson: AcademyLesson) => lessonUnlocked(lesson, ACADEMY_TIERS.flatMap(t => t.lessons), progressMap),
    [progressMap]
  );

  // Active Lesson Drill View
  if (activeLesson) {
    return (
      <ActiveLessonRunner
        key={`${academyLang}:${activeLesson.id}`}
        lesson={activeLesson}
        language={academyLang}
        typingSound={typingSound}
        onBack={() => setActiveLesson(null)}
        onSaveProgress={saveLessonProgress}
        progressMap={progressMap}
        onNextLesson={(nextLesson) => setActiveLesson(nextLesson)}
      />
    );
  }

  // Calculate Overall Progress
  const allLessons = ACADEMY_TIERS.flatMap((t) => t.lessons);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => (progressMap[l.id]?.stars || 0) > 0).length;
  const totalStarsEarned = allLessons.reduce((sum, l) => sum + (progressMap[l.id]?.stars || 0), 0);
  const maxPossibleStars = totalLessonsCount * 3;
  const suggested = allLessons.find(l => isLessonUnlocked(l) && !progressMap[l.id]?.completed) || allLessons[0];
  const progressPercent = Math.round((completedLessonsCount / totalLessonsCount) * 100);

  const languagesList: Array<{ id: Language; labelKey: string }> = [
    { id: 'uzbek_latin', labelKey: 'lang_uzbek_latin' },
    { id: 'uzbek_cyrillic', labelKey: 'lang_uzbek_cyrillic' },
    { id: 'russian', labelKey: 'lang_russian' },
    { id: 'english', labelKey: 'lang_english' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-4 font-sans animate-fade-in select-none space-y-8">
      <section className="academy-intro">
        <span className="academy-eyebrow">QALAMTYPE / ACADEMY</span>
        <h2>{c[0]}</h2><p>{c[1]}</p>
        <button className="academy-start" type="button" onClick={() => setActiveLesson(suggested)}>{completedLessonsCount ? c[2] : c[3]} <ArrowRight size={18}/></button>
        <p className="academy-tip mt-4">{c[31]}</p>
      </section>
      {!currentUser && <div className="academy-guest"><div>{c[4]}<small>{c[5]}</small></div><button onClick={() => setAuthModalOpen(true)}>{t('nav_login')}</button></div>}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {/* Header & Language Picker */}
      <div className="bg-[#171E2B] rounded-2xl border border-[rgba(240,243,250,0.08)] p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(240,243,250,0.08)] pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#D6F36B]/10 border border-[#D6F36B]/20 text-[#D6F36B]">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-[#F0F3FA] tracking-tight">
                Qalamtype · {t('nav_academy')}
              </h1>
              <p className="text-xs text-[#A6B1C5] font-mono mt-0.5">
                {t('academy_subtitle')}
              </p>
            </div>
          </div>

          {/* Progress Stats Summary Pill */}
          <div className="flex items-center space-x-4 bg-[#0D111A] border border-[rgba(240,243,250,0.1)] rounded-xl px-4 py-2.5 font-mono text-xs">
            <div className="flex items-center space-x-1.5 text-[#63D9DA]">
              <Star className="w-4 h-4 fill-[#63D9DA]" />
              <span className="font-bold">{totalStarsEarned}</span>
              <span className="text-[#A6B1C5] text-[10px]">/{maxPossibleStars}</span>
            </div>
            <div className="h-4 w-px bg-[rgba(240,243,250,0.1)]" />
            <div className="flex items-center space-x-1.5 text-[#71D9AF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Language Selection Switcher */}
        <div className="space-y-2">
          <label className="text-xs text-[#A6B1C5] font-mono flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#D6F36B]" />
            <span>{t('academy_select_language')}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {languagesList.map((lang) => {
              const active = academyLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer text-center ${
                    active
                      ? 'bg-[#0D111A] border-[#D6F36B] text-[#D6F36B] font-semibold shadow-sm'
                      : 'bg-[#0D111A]/40 border-[rgba(240,243,250,0.08)] text-[#A6B1C5] hover:text-[#F0F3FA] hover:bg-[#0D111A]/80'
                  }`}
                >
                  {t(lang.labelKey as any)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Tree Progression Map */}
      <div className="space-y-8">
        {ACADEMY_TIERS.map((tier, tierIndex) => {
          const tierLessons = tier.lessons;
          const tierCompletedCount = tierLessons.filter((l) => (progressMap[l.id]?.stars || 0) > 0).length;
          const isTierUnlocked = tierLessons.some((l) => isLessonUnlocked(l));

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border transition-all ${
                isTierUnlocked
                  ? 'bg-[#171E2B] border-[rgba(240,243,250,0.08)] shadow-lg'
                  : 'bg-[#171E2B]/50 border-[rgba(240,243,250,0.04)] opacity-70'
              }`}
            >
              {/* Tier Header */}
              <div className="p-5 sm:p-6 border-b border-[rgba(240,243,250,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D6F36B]/15 text-[#D6F36B] text-[11px] font-mono font-semibold">
                      {tierIndex + 1}
                    </span>
                    <h2 className="text-lg font-medium text-[#F0F3FA]">
                      {tier.name[academyLang]}
                    </h2>
                  </div>
                  <p className="text-xs text-[#A6B1C5] font-mono mt-1">
                    {tier.description[academyLang]}
                  </p>
                </div>

                <div className="text-xs font-mono text-[#A6B1C5] shrink-0">
                  {tierCompletedCount} / {tierLessons.length} · {c[6]}
                </div>
              </div>

              {/* Tier Lesson Nodes Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierLessons.map((lesson) => {
                  const unlocked = isLessonUnlocked(lesson);
                  const progress = progressMap[lesson.id];
                  const stars = progress?.stars || 0;
                  const completed = stars > 0;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && setActiveLesson(lesson)}
                      className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between space-y-3 ${
                        !unlocked
                          ? 'bg-[#0D111A]/40 border-[rgba(240,243,250,0.04)] text-[#748199] cursor-not-allowed'
                          : completed
                          ? 'bg-[#0D111A] border-[rgba(240,243,250,0.12)] hover:border-[#63D9DA] cursor-pointer shadow-sm'
                          : 'bg-[#0D111A] border-[#D6F36B]/50 hover:border-[#D6F36B] text-[#F0F3FA] cursor-pointer ring-1 ring-[#D6F36B]/20 shadow-md'
                      }`}
                    >
                      {/* Top Status & Icons */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#A6B1C5]">
                          {tierIndex + 1}.{lesson.lessonNumber} · {c[6]}
                        </span>

                        {!unlocked ? (
                          <Lock className="w-4 h-4 text-[#748199]" />
                        ) : completed ? (
                          /* Star Rating Display */
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3].map((starNum) => (
                              <Star
                                key={starNum}
                                className={`w-3.5 h-3.5 ${
                                  starNum <= stars
                                    ? 'fill-[#63D9DA] text-[#63D9DA]'
                                    : 'text-[#748199]'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D6F36B]/20 text-[#D6F36B] font-bold">
                            {t('academy_unlocked')}
                          </span>
                        )}
                      </div>

                      {/* Lesson Title */}
                      <div>
                        <h3 className="text-sm font-medium text-[#F0F3FA] line-clamp-2">
                          {lesson.title[academyLang]}
                        </h3>
                      </div>

                      {/* Bottom Stats Badge if completed */}
                      {completed && progress && (
                        <div className="pt-1 border-t border-[rgba(240,243,250,0.06)] flex items-center justify-between text-[10px] font-mono text-[#A6B1C5]">
                          <span>WPM: <strong className="text-[#63D9DA]">{progress.bestWpm}</strong></span>
                          <span>Aniqlik: <strong className="text-[#71D9AF]">{progress.bestAccuracy}%</strong></span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subcomponent: Active Lesson Typing Runner
interface ActiveLessonRunnerProps {
  lesson: AcademyLesson;
  language: Language;
  typingSound: any;
  onBack: () => void;
  onSaveProgress: (lesson: AcademyLesson, wpm: number, accuracy: number) => Promise<{ stars: number; isNewRecord: boolean }>;
  progressMap: Record<string, LessonProgress>;
  onNextLesson: (lesson: AcademyLesson) => void;
}

const ActiveLessonRunner: React.FC<ActiveLessonRunnerProps> = ({
  lesson,
  language,
  typingSound,
  onBack,
  onSaveProgress,
  progressMap,
  onNextLesson,
}) => {
  const { t, siteLanguage } = useSettings();
  const c = academyCopy[siteLanguage];
  const [practiceText, setPracticeText] = useState<string | null>(null);
  const mistakes = useRef<Record<string, number>>({});
  const goals = starGoals(lesson.tierNumber);
  const lessonText = lesson.content[language] || lesson.content.uzbek_latin;

  const {
    wordsDisplay,
    currentIndex,
    phase,
    isPaused,
    timeLeft,
    result,
    getLiveStats,
    resetTest,
    pauseTest,
    resumeTest,
    handleKeyDown,
  } = useTypingEngine({
    mode: 'words',
    duration: 60,
    wordCount: 100,
    difficulty: 'easy',
    language,
    typingSound,
    customText: practiceText || lessonText,
  });

  const starsEarned = result && !practiceText ? calculateTierStars(lesson.tierNumber, result.wpm, academyAccuracy(result)) : 0;
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [processed, setProcessed] = useState<boolean>(false);

  useEffect(() => {
    if (phase === 'idle') {
      mistakes.current = {};
      setProcessed(false);
      setIsNewRecord(false);
    }
  }, [lesson.id, phase]);

  useEffect(() => {
    if (phase === 'completed' && result && !processed) {
      setProcessed(true);
      if (practiceText) return;
      const previous = progressMap[lesson.id];
      setIsNewRecord(starsEarned > 0 && (result.wpm > (previous?.bestWpm || 0) || starsEarned > (previous?.stars || 0)));
      void onSaveProgress(lesson, result.wpm, academyAccuracy(result));
    }
  }, [phase, result, processed, lesson, onSaveProgress, practiceText, progressMap, starsEarned]);

  // Find next lesson
  const allLessons = ACADEMY_TIERS.flatMap((t) => t.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIdx !== -1 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const liveStats = getLiveStats();
  const cursor = wordsDisplay.flatMap(w => w.chars).find(ch => ch.isCurrent || ch.isCurrentRight);
  const nextChar = cursor?.isCurrentRight ? 'Backspace' : cursor?.char || ' ';
  const handleLessonKey = (e: KeyboardEvent) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing && e.key !== ' ' && nextChar !== 'Backspace') {
      const normalized = e.key.replace(/[‘’ʻʼ]/g, "'");
      if (normalized !== nextChar.replace(/[‘’ʻʼ]/g, "'")) mistakes.current[nextChar] = (mistakes.current[nextChar] || 0) + 1;
    }
    handleKeyDown(e);
  };
  const weakKeys = Object.entries(mistakes.current).sort((a,b) => b[1] - a[1]).slice(0,5).map(([key]) => key);
  const startPractice = () => setPracticeText(weakKeys.map(k => `${k} ${k} ${k}${k} ${k}${k}`).join(' '));

  return (
    <div className="academy-runner w-full max-w-4xl mx-auto py-2 px-4 font-sans animate-fade-in space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(240,243,250,0.08)] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono text-[#A6B1C5] hover:text-[#F0F3FA] bg-[#171E2B] border border-[rgba(240,243,250,0.1)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('academy_back_to_map')}</span>
        </button>

        <div className="text-center sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6F36B]">
            {ACADEMY_TIERS.findIndex(tier => tier.number === lesson.tierNumber) + 1} / {lesson.lessonNumber} · {c[6]}
          </span>
          <h2 className="text-base font-medium text-[#F0F3FA]">
            {lesson.title[language]}
          </h2>
        </div>
      </div>

      {/* Lesson Complete / Results View */}
      {phase === 'completed' && result ? (
        <div className="bg-[#171E2B] rounded-2xl border border-[rgba(240,243,250,0.12)] p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in max-w-xl mx-auto">
          {/* New Record Banner if applicable */}
          {isNewRecord && (
            <div className="inline-flex items-center space-x-1.5 bg-[#63D9DA]/15 text-[#63D9DA] border border-[#63D9DA]/30 px-3 py-1 rounded-full text-xs font-mono font-bold animate-bounce-slow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('academy_new_record')}</span>
            </div>
          )}

          <div className="space-y-2">
            <div
              className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
                starsEarned > 0 || practiceText
                  ? 'bg-[#D6F36B]/10 border-[#D6F36B]/30 text-[#D6F36B]'
                  : 'bg-[#0D111A] border-red-500/30 text-red-400'
              }`}
            >
              {starsEarned > 0 || practiceText ? (
                <Award className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-xl font-medium text-[#F0F3FA]">
              {practiceText ? c[30] : starsEarned > 0 ? t('academy_lesson_completed') : t('academy_stars_zero')}
            </h3>

            {!practiceText && starsEarned === 0 && (
              <p className="text-xs text-red-400 font-mono">
                {c[27]}
              </p>
            )}

            <p className="text-xs text-[#A6B1C5] font-mono">
              {lesson.title[language]}
            </p>
          </div>

          {/* Animated Star Rating Display */}
          {!practiceText && <div className="flex items-center justify-center space-x-3 py-2">
            {[1, 2, 3].map((starNum) => (
              <div
                key={starNum}
                className={`transition-all duration-500 ${
                  starNum <= starsEarned
                    ? 'scale-125 text-[#63D9DA]'
                    : 'scale-100 text-[#323437]'
                }`}
              >
                <Star
                  className={`w-10 h-10 ${
                    starNum <= starsEarned
                      ? 'fill-[#63D9DA] text-[#63D9DA] drop-shadow-[0_0_8px_rgba(244,163,64,0.5)]'
                      : 'text-[#748199]'
                  }`}
                />
              </div>
            ))}
          </div>

          }
          {/* Results Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0D111A] p-3 rounded-xl border border-[rgba(240,243,250,0.08)]">
              <span className="text-[10px] font-mono text-[#A6B1C5] uppercase block">WPM</span>
              <span className="text-2xl font-mono font-bold text-[#63D9DA]">
                {result.wpm}
              </span>
            </div>

            <div className="bg-[#0D111A] p-3 rounded-xl border border-[rgba(240,243,250,0.08)]">
              <span className="text-[10px] font-mono text-[#A6B1C5] uppercase block">Aniqlik</span>
              <span className={`text-2xl font-mono font-bold ${result.accuracy >= 75 ? 'text-[#71D9AF]' : 'text-red-400'}`}>
                {academyAccuracy(result)}%
              </span>
            </div>

            <div className="bg-[#0D111A] p-3 rounded-xl border border-[rgba(240,243,250,0.08)]">
              <span className="text-[10px] font-mono text-[#A6B1C5] uppercase block">Vaqt</span>
              <span className="text-2xl font-mono font-bold text-[#F0F3FA]">
                {result.timeSec}s
              </span>
            </div>
          </div>

          <p className="academy-tip">{practiceText ? c[30] : starsEarned >= 2 ? c[25] : c[26]}</p>
          {!practiceText && weakKeys.length > 0 && <div className="academy-guest"><div>{c[29]}<small>{weakKeys.join(' · ')}</small></div><button type="button" onClick={startPractice}>{c[28]}</button></div>}
          {practiceText && <button type="button" className="academy-start" onClick={() => setPracticeText(null)}>{t('academy_retry_lesson')}</button>}
          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetTest}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0D111A] hover:bg-[#0D111A]/80 border border-[rgba(240,243,250,0.12)] text-[#F0F3FA] font-mono text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('academy_retry_lesson')}</span>
            </button>

            {!practiceText && starsEarned > 0 && nextLesson && (
              <button
                type="button"
                onClick={() => onNextLesson(nextLesson)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#D6F36B] hover:bg-[#D6F36B]/90 text-[#0D111A] font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
              >
                <span>{t('academy_next_lesson')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Typing Engine Area */
        <div className="space-y-4">
          <div className="academy-lesson-shell">
          <p className="academy-tip">{practiceText ? c[29] : c[27]}</p>
          {!practiceText && <div className="academy-goals">
            <span><b>★</b>{c[7]} ≥ {goals.pass}%</span>
            <span><b>★★</b>{c[7]} ≥ {goals.two}%</span>
            <span><b>★★★</b>{c[7]} ≥ {goals.three}% · {goals.beginner ? c[23] : `${goals.speed} WPM`}</span>
          </div>
          }
          {!practiceText && !goals.beginner && <p className="academy-tip">{c[24]}</p>}
          <div className="flex justify-between text-xs text-[#A6B1C5]"><span>{Math.round(liveStats.progress)}%</span><span>{c[7]} {Math.round(liveStats.accuracy)}% · {liveStats.wpm} WPM</span></div>
          <div className="academy-progress-track"><div style={{width: `${Math.min(100, liveStats.progress)}%`}} /></div>
          <TypingArea
            wordsDisplay={wordsDisplay}
            currentIndex={currentIndex}
            phase={phase}
            isPaused={isPaused}
            timeLeft={timeLeft}
            mode="words"
            duration={60}
            wordCount={(practiceText || lessonText).trim().split(/\s+/).length}
            difficulty="easy"
            language={language}
            onRestart={resetTest}
            onPause={pauseTest}
            onResume={resumeTest}
            onKeyDown={handleLessonKey}
            liveWpm={liveStats.wpm}
          />
          </div>
          <KeyboardCoach nextChar={nextChar} language={language} uiLanguage={siteLanguage} />
        </div>
      )}
    </div>
  );
};
