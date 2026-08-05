import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { ACADEMY_TIERS } from '../data/academyData';
import { AcademyLesson, Language, LessonProgress } from '../types';
import { TypingArea } from './TypingArea';
import { AuthModal } from './AuthModal';
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
  Zap,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { t, typingSound, setTypingLanguage } = useSettings();

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

  // Sync academy language selection to settings typing language as well
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

  // Load progress from LocalStorage whenever user or language changes
  useEffect(() => {
    if (!currentUser) return;
    const storageKey = `qalampir_academy_progress_${currentUser.id}_${academyLang}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setProgressMap(JSON.parse(saved));
      } else {
        setProgressMap({});
      }
    } catch (e) {
      console.error('Failed to parse academy progress:', e);
      setProgressMap({});
    }
  }, [currentUser, academyLang]);

  // Function to save progress
  const saveLessonProgress = useCallback(
    (lessonId: string, wpm: number, accuracy: number) => {
      if (!currentUser) return;

      // Calculate stars earned
      let stars = 0;
      if (accuracy >= 85) stars = 1;
      if (accuracy >= 95 && wpm >= 25) stars = 2;
      if (accuracy >= 98 && wpm >= 40) stars = 3;

      setProgressMap((prev) => {
        const existing = prev[lessonId] || { completed: false, stars: 0, bestWpm: 0, bestAccuracy: 0 };
        const updated: LessonProgress = {
          completed: true,
          stars: Math.max(existing.stars, stars),
          bestWpm: Math.max(existing.bestWpm, wpm),
          bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
        };
        const nextMap = { ...prev, [lessonId]: updated };

        const storageKey = `qalampir_academy_progress_${currentUser.id}_${academyLang}`;
        localStorage.setItem(storageKey, JSON.stringify(nextMap));
        return nextMap;
      });
    },
    [currentUser, academyLang]
  );

  // Helper to check if a lesson is unlocked
  const isLessonUnlocked = useCallback(
    (lesson: AcademyLesson): boolean => {
      // Tier 1, Lesson 1 is ALWAYS unlocked
      if (lesson.tierNumber === 1 && lesson.lessonNumber === 1) {
        return true;
      }

      const currentTier = ACADEMY_TIERS.find((t) => t.number === lesson.tierNumber);
      if (!currentTier) return false;

      // Within the same tier: Lesson N is unlocked if Lesson N-1 is completed
      if (lesson.lessonNumber > 1) {
        const prevLesson = currentTier.lessons.find((l) => l.lessonNumber === lesson.lessonNumber - 1);
        if (prevLesson) {
          return Boolean(progressMap[prevLesson.id]?.completed);
        }
      }

      // First lesson of Tier T > 1: Unlocked if ALL lessons in Tier T-1 are completed
      if (lesson.lessonNumber === 1 && lesson.tierNumber > 1) {
        const prevTier = ACADEMY_TIERS.find((t) => t.number === lesson.tierNumber - 1);
        if (prevTier) {
          return prevTier.lessons.every((l) => Boolean(progressMap[l.id]?.completed));
        }
      }

      return false;
    },
    [progressMap]
  );

  // Unauthenticated Gated View
  if (!currentUser || !userProfile) {
    return (
      <div className="w-full max-w-md mx-auto py-20 px-4 text-center font-sans">
        <div className="p-8 bg-[#1A1917] rounded-xl border border-[rgba(232,226,216,0.12)] space-y-5 shadow-2xl">
          <GraduationCap className="w-14 h-14 text-[#E85D3D] mx-auto animate-bounce-slow" />
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[#E8E2D8]">
              {t('academy_login_required')}
            </h2>
            <p className="text-xs text-[#9A9488] font-mono leading-relaxed">
              {t('academy_login_desc')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            {t('nav_login')}
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // Active Lesson Drill Sub-component
  if (activeLesson) {
    return (
      <ActiveLessonRunner
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
  const completedLessonsCount = allLessons.filter((l) => progressMap[l.id]?.completed).length;
  const totalStarsEarned = allLessons.reduce((sum, l) => sum + (progressMap[l.id]?.stars || 0), 0);
  const maxPossibleStars = totalLessonsCount * 3;
  const progressPercent = Math.round((completedLessonsCount / totalLessonsCount) * 100);

  const languagesList: Array<{ id: Language; labelKey: string }> = [
    { id: 'uzbek_latin', labelKey: 'lang_uzbek_latin' },
    { id: 'uzbek_cyrillic', labelKey: 'lang_uzbek_cyrillic' },
    { id: 'russian', labelKey: 'lang_russian' },
    { id: 'english', labelKey: 'lang_english' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-4 font-sans animate-fade-in select-none space-y-8">
      {/* Header & Language Picker */}
      <div className="bg-[#1A1917] rounded-2xl border border-[rgba(232,226,216,0.08)] p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(232,226,216,0.08)] pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#E85D3D]/10 border border-[#E85D3D]/20 text-[#E85D3D]">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-[#E8E2D8] tracking-tight">
                {t('academy_title')}
              </h1>
              <p className="text-xs text-[#9A9488] font-mono mt-0.5">
                {t('academy_subtitle')}
              </p>
            </div>
          </div>

          {/* Progress Stats Summary Pill */}
          <div className="flex items-center space-x-4 bg-[#0F0E0D] border border-[rgba(232,226,216,0.1)] rounded-xl px-4 py-2.5 font-mono text-xs">
            <div className="flex items-center space-x-1.5 text-[#F4A340]">
              <Star className="w-4 h-4 fill-[#F4A340]" />
              <span className="font-bold">{totalStarsEarned}</span>
              <span className="text-[#9A9488] text-[10px]">/{maxPossibleStars}</span>
            </div>
            <div className="h-4 w-px bg-[rgba(232,226,216,0.1)]" />
            <div className="flex items-center space-x-1.5 text-[#6FA85C]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Language Selection Switcher */}
        <div className="space-y-2">
          <label className="text-xs text-[#9A9488] font-mono flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#E85D3D]" />
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
                      ? 'bg-[#0F0E0D] border-[#E85D3D] text-[#E85D3D] font-semibold shadow-sm'
                      : 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.08)] text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]/80'
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
        {ACADEMY_TIERS.map((tier) => {
          const tierLessons = tier.lessons;
          const tierCompletedCount = tierLessons.filter((l) => progressMap[l.id]?.completed).length;
          const isTierUnlocked = tierLessons.some((l) => isLessonUnlocked(l));

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border transition-all ${
                isTierUnlocked
                  ? 'bg-[#1A1917] border-[rgba(232,226,216,0.08)] shadow-lg'
                  : 'bg-[#1A1917]/50 border-[rgba(232,226,216,0.04)] opacity-70'
              }`}
            >
              {/* Tier Header */}
              <div className="p-5 sm:p-6 border-b border-[rgba(232,226,216,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E85D3D]/15 text-[#E85D3D] text-[11px] font-mono font-semibold">
                      {tier.number}-bosqich
                    </span>
                    <h2 className="text-lg font-medium text-[#E8E2D8]">
                      {tier.name[academyLang]}
                    </h2>
                  </div>
                  <p className="text-xs text-[#9A9488] font-mono mt-1">
                    {tier.description[academyLang]}
                  </p>
                </div>

                <div className="text-xs font-mono text-[#9A9488] shrink-0">
                  {tierCompletedCount} / {tierLessons.length} darslar
                </div>
              </div>

              {/* Tier Lesson Nodes Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierLessons.map((lesson) => {
                  const unlocked = isLessonUnlocked(lesson);
                  const progress = progressMap[lesson.id];
                  const completed = Boolean(progress?.completed);
                  const stars = progress?.stars || 0;

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && setActiveLesson(lesson)}
                      className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between space-y-3 ${
                        !unlocked
                          ? 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.04)] text-[#5C574C] cursor-not-allowed'
                          : completed
                          ? 'bg-[#0F0E0D] border-[rgba(232,226,216,0.12)] hover:border-[#F4A340] cursor-pointer shadow-sm'
                          : 'bg-[#0F0E0D] border-[#E85D3D]/50 hover:border-[#E85D3D] text-[#E8E2D8] cursor-pointer ring-1 ring-[#E85D3D]/20 shadow-md'
                      }`}
                    >
                      {/* Top Status & Icons */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#9A9488]">
                          {lesson.tierNumber}.{lesson.lessonNumber}-dars
                        </span>

                        {!unlocked ? (
                          <Lock className="w-4 h-4 text-[#5C574C]" />
                        ) : completed ? (
                          /* Star Rating Display */
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3].map((starNum) => (
                              <Star
                                key={starNum}
                                className={`w-3.5 h-3.5 ${
                                  starNum <= stars
                                    ? 'fill-[#F4A340] text-[#F4A340]'
                                    : 'text-[#5C574C]'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E85D3D]/20 text-[#E85D3D] font-bold">
                            {t('academy_unlocked')}
                          </span>
                        )}
                      </div>

                      {/* Lesson Title */}
                      <div>
                        <h3 className="text-sm font-medium text-[#E8E2D8] line-clamp-2">
                          {lesson.title[academyLang]}
                        </h3>
                      </div>

                      {/* Bottom Stats Badge if completed */}
                      {completed && progress && (
                        <div className="pt-1 border-t border-[rgba(232,226,216,0.06)] flex items-center justify-between text-[10px] font-mono text-[#9A9488]">
                          <span>WPM: <strong className="text-[#F4A340]">{progress.bestWpm}</strong></span>
                          <span>Aniqlik: <strong className="text-[#6FA85C]">{progress.bestAccuracy}%</strong></span>
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
  onSaveProgress: (lessonId: string, wpm: number, accuracy: number) => void;
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
  const { t } = useSettings();
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
    customText: lessonText,
  });

  // Track if current result was saved
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [lesson.id]);

  useEffect(() => {
    if (phase === 'completed' && result && !saved) {
      setSaved(true);
      onSaveProgress(lesson.id, result.wpm, result.accuracy);
    }
  }, [phase, result, saved, lesson.id, onSaveProgress]);

  // Find next lesson
  const allLessons = ACADEMY_TIERS.flatMap((t) => t.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIdx !== -1 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const liveStats = getLiveStats();

  // Calculate stars earned on completion
  let stars = 0;
  if (result) {
    if (result.accuracy >= 85) stars = 1;
    if (result.accuracy >= 95 && result.wpm >= 25) stars = 2;
    if (result.accuracy >= 98 && result.wpm >= 40) stars = 3;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 font-sans animate-fade-in space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(232,226,216,0.08)] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono text-[#9A9488] hover:text-[#E8E2D8] bg-[#1A1917] border border-[rgba(232,226,216,0.1)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('academy_back_to_map')}</span>
        </button>

        <div className="text-center sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#E85D3D]">
            {lesson.tierNumber}-bosqich • {lesson.lessonNumber}-dars
          </span>
          <h2 className="text-base font-medium text-[#E8E2D8]">
            {lesson.title[language]}
          </h2>
        </div>
      </div>

      {/* Lesson Complete View */}
      {phase === 'completed' && result ? (
        <div className="bg-[#1A1917] rounded-2xl border border-[rgba(232,226,216,0.12)] p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in max-w-xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#E85D3D]/10 border border-[#E85D3D]/30 flex items-center justify-center text-[#E85D3D] mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-[#E8E2D8]">
              {t('academy_lesson_completed')}
            </h3>
            <p className="text-xs text-[#9A9488] font-mono">
              {lesson.title[language]}
            </p>
          </div>

          {/* Star Rating display */}
          <div className="flex items-center justify-center space-x-2 py-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-8 h-8 transition-transform duration-300 ${
                  s <= stars
                    ? 'fill-[#F4A340] text-[#F4A340] scale-110'
                    : 'text-[#5C574C]'
                }`}
              />
            ))}
          </div>

          {/* Results Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0F0E0D] p-3 rounded-xl border border-[rgba(232,226,216,0.08)]">
              <span className="text-[10px] font-mono text-[#9A9488] uppercase block">WPM</span>
              <span className="text-2xl font-mono font-bold text-[#F4A340]">
                {result.wpm}
              </span>
            </div>

            <div className="bg-[#0F0E0D] p-3 rounded-xl border border-[rgba(232,226,216,0.08)]">
              <span className="text-[10px] font-mono text-[#9A9488] uppercase block">Aniqlik</span>
              <span className="text-2xl font-mono font-bold text-[#6FA85C]">
                {result.accuracy}%
              </span>
            </div>

            <div className="bg-[#0F0E0D] p-3 rounded-xl border border-[rgba(232,226,216,0.08)]">
              <span className="text-[10px] font-mono text-[#9A9488] uppercase block">Vaqt</span>
              <span className="text-2xl font-mono font-bold text-[#E8E2D8]">
                {result.timeSec}s
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetTest}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F0E0D] hover:bg-[#0F0E0D]/80 border border-[rgba(232,226,216,0.12)] text-[#E8E2D8] font-mono text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('academy_retry_lesson')}</span>
            </button>

            {nextLesson && (
              <button
                type="button"
                onClick={() => onNextLesson(nextLesson)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
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
          <TypingArea
            wordsDisplay={wordsDisplay}
            currentIndex={currentIndex}
            phase={phase}
            isPaused={isPaused}
            timeLeft={timeLeft}
            mode="words"
            duration={60}
            wordCount={100}
            difficulty="easy"
            language={language}
            onRestart={resetTest}
            onPause={pauseTest}
            onResume={resumeTest}
            onKeyDown={handleKeyDown}
            liveWpm={liveStats.wpm}
          />
        </div>
      )}
    </div>
  );
};
