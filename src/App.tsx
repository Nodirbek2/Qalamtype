import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGroup } from 'motion/react';
import { TestMode, Duration, WordCount, Difficulty, Language } from './types';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import { saveTestResult } from './lib/resultsService';
import { Navbar } from './components/Navbar';
import { ModeSelector } from './components/ModeSelector';
import { TypingArea } from './components/TypingArea';
import { ResultsView } from './components/ResultsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AccountView } from './components/AccountView';
import { AcademyView } from './components/AcademyView';
import { AboutView } from './components/AboutView';
import { BlogView } from './components/BlogView';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { IntroOverlay } from './components/IntroOverlay';
import { PrivacyModal } from './components/PrivacyModal';

export default function App() {
  const { currentUser, userProfile } = useAuth();
  const { typingSound, typingLanguage, setTypingLanguage, siteLanguage } = useSettings();

  // Intro animation state
  const [introState, setIntroState] = useState<'checking' | 'hero' | 'animating' | 'done'>('checking');

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAlreadyShown = sessionStorage.getItem('qalampir_intro_shown');

    if (isReducedMotion || isAlreadyShown) {
      setIntroState('done');
    } else {
      sessionStorage.setItem('qalampir_intro_shown', 'true');
      setIntroState('hero');
    }
  }, []);

  // Active View ('test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog') with URL path synchronization
  const [activeView, setActiveView] = useState<'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/academy') return 'academy';
      if (path === '/leaderboard') return 'leaderboard';
      if (path === '/account') return 'account';
      if (path === '/about') return 'about';
      if (path.startsWith('/blog')) return 'blog';
    }
    return 'test';
  });

  const [blogSlug, setBlogSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        return path.replace('/blog/', '');
      }
    }
    return null;
  });

  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<Duration>(30);
  const [wordCount, setWordCount] = useState<WordCount>(25);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Track if current test result has been saved to Firestore
  const [savedResultKey, setSavedResultKey] = useState<string | null>(null);

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
    mode,
    duration,
    wordCount,
    difficulty,
    language: typingLanguage,
    typingSound,
  });

  // Handle URL history push and popstate
  const navigateTo = useCallback((view: 'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog', slug?: string) => {
    setActiveView(view);
    if (view === 'blog') {
      setBlogSlug(slug || null);
    } else {
      setBlogSlug(null);
    }

    let targetPath = '/';
    if (view === 'academy') targetPath = '/academy';
    if (view === 'leaderboard') targetPath = '/leaderboard';
    if (view === 'account') targetPath = '/account';
    if (view === 'about') targetPath = '/about';
    if (view === 'blog') {
      targetPath = slug ? `/blog/${slug}` : '/blog';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/academy') {
        setActiveView('academy');
        setBlogSlug(null);
      } else if (path === '/leaderboard') {
        setActiveView('leaderboard');
        setBlogSlug(null);
      } else if (path === '/account') {
        setActiveView('account');
        setBlogSlug(null);
      } else if (path === '/about') {
        setActiveView('about');
        setBlogSlug(null);
      } else if (path.startsWith('/blog')) {
        setActiveView('blog');
        const slug = path.startsWith('/blog/') ? path.replace('/blog/', '') : null;
        setBlogSlug(slug);
      } else {
        setActiveView('test');
        setBlogSlug(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save result automatically on test completion (for logged in users and guests)
  useEffect(() => {
    if (phase === 'completed' && result) {
      // Unique key for current result based on WPM, accuracy, and timestamp
      const resultKey = `${result.wpm}_${result.rawWpm}_${result.accuracy}_${result.timeSec}`;

      if (savedResultKey !== resultKey) {
        setSavedResultKey(resultKey);
        saveTestResult(result, userProfile || null).catch((err) => {
          console.error('Failed to save test result:', err);
        });
      }
    }
  }, [phase, result, userProfile, savedResultKey]);

  // Reset test and navigate back to test view on logo click or next test
  const handleNextTest = useCallback(() => {
    setSavedResultKey(null);
    resetTest();
    if (activeView !== 'test') {
      navigateTo('test');
    }
  }, [resetTest, activeView, navigateTo]);

  // Global keydown handler for restart shortcuts (Tab or Esc)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleNextTest();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [handleNextTest]);

  const handleStartAnimation = useCallback(() => {
    setIntroState('animating');
  }, []);

  const handleCompleteAnimation = useCallback(() => {
    setIntroState('done');
  }, []);

  const handleSkipIntro = useCallback(() => {
    setIntroState((prev) => {
      if (prev === 'hero') return 'animating';
      return prev;
    });
  }, []);

  const liveStats = getLiveStats();

  return (
    <LayoutGroup id="app-intro-group">
      <div className="min-h-screen bg-[#0F0E0D] text-[#E8E2D8] flex flex-col font-sans selection:bg-[#E85D3D] selection:text-[#0F0E0D] relative overflow-x-hidden w-full max-w-full">
        {/* Intro Fullscreen Overlay */}
        {introState !== 'done' && introState !== 'checking' && (
          <IntroOverlay
            introState={introState}
            onStartAnimation={handleStartAnimation}
            onCompleteAnimation={handleCompleteAnimation}
            onSkip={handleSkipIntro}
          />
        )}

        {/* Subtle Focus Ring Overlay */}
        <div className="fixed inset-0 pointer-events-none border border-[#E85D3D] opacity-10 z-40"></div>

        {/* Top Navbar */}
        <Navbar
          onLogoClick={handleNextTest}
          activeView={activeView}
          onNavigate={navigateTo}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showWordmark={introState !== 'hero'}
          isIntroDone={introState === 'done'}
        >
          <ModeSelector
            mode={mode}
            duration={duration}
            wordCount={wordCount}
            difficulty={difficulty}
            language={typingLanguage}
            onModeChange={setMode}
            onDurationChange={setDuration}
            onWordCountChange={setWordCount}
            onDifficultyChange={setDifficulty}
            onLanguageChange={setTypingLanguage}
          />
        </Navbar>

        {/* Main Container */}
        <main className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-4 sm:py-8 max-w-6xl w-full mx-auto overflow-x-hidden">
          {activeView === 'account' ? (
            <AccountView />
          ) : activeView === 'academy' ? (
            <AcademyView />
          ) : activeView === 'leaderboard' ? (
            <LeaderboardView />
          ) : activeView === 'about' ? (
            <AboutView
              onStartTest={() => navigateTo('test')}
              onGoAcademy={() => navigateTo('academy')}
              onGoLeaderboard={() => navigateTo('leaderboard')}
            />
          ) : activeView === 'blog' ? (
            <BlogView
              currentSlug={blogSlug}
              onNavigateBlog={(slug) => navigateTo('blog', slug)}
              onNavigateHome={() => navigateTo('test')}
            />
          ) : phase === 'completed' && result ? (
            <ResultsView
              result={result}
              savedToLeaderboard={Boolean(savedResultKey && currentUser)}
              onViewLeaderboard={() => navigateTo('leaderboard')}
              onNextTest={handleNextTest}
              onRestart={handleNextTest}
            />
          ) : (
            <TypingArea
              wordsDisplay={wordsDisplay}
              currentIndex={currentIndex}
              phase={phase}
              isPaused={isPaused}
              timeLeft={timeLeft}
              mode={mode}
              duration={duration}
              wordCount={wordCount}
              difficulty={difficulty}
              language={typingLanguage}
              onRestart={handleNextTest}
              onPause={pauseTest}
              onResume={resumeTest}
              onKeyDown={handleKeyDown}
              liveWpm={liveStats.wpm}
            />
          )}
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Privacy Policy Modal */}
        <PrivacyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
          defaultLanguage={siteLanguage}
        />

        {/* Footer */}
        <Footer
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenAbout={() => navigateTo('about')}
          onOpenBlog={() => navigateTo('blog')}
        />
      </div>
    </LayoutGroup>
  );
}

