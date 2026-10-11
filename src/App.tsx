import { applyPageSeo } from './lib/seo';
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { LayoutGroup } from 'motion/react';
import { TestMode, Duration, WordCount, Difficulty, Language, TestResult } from './types';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import { saveTestResult } from './lib/resultsService';
import { Navbar } from './components/Navbar';
import { ModeSelector } from './components/ModeSelector';
import { TypingArea } from './components/TypingArea';
const GamesView = lazy(() => import('./components/GamesView').then(module => ({ default: module.GamesView })));
const ResultsView = lazy(() => import('./components/ResultsView').then(module => ({ default: module.ResultsView })));
const LeaderboardView = lazy(() => import('./components/LeaderboardView').then(module => ({ default: module.LeaderboardView })));
const AccountView = lazy(() => import('./components/AccountView').then(module => ({ default: module.AccountView })));
const AcademyView = lazy(() => import('./components/AcademyView').then(module => ({ default: module.AcademyView })));
const AboutView = lazy(() => import('./components/AboutView').then(module => ({ default: module.AboutView })));
const BlogView = lazy(() => import('./components/BlogView').then(module => ({ default: module.BlogView })));
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Donation, DonationButton } from './components/Donation';
import { HomeExperience } from './components/HomeExperience';
import { PrivacyModal } from './components/PrivacyModal';

export default function App() {
  const { currentUser, userProfile } = useAuth();
  const { typingSound, typingLanguage, setTypingLanguage, siteLanguage } = useSettings();

  // Active View ('test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog' | 'games') with URL path synchronization
  const [activeView, setActiveView] = useState<'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog' | 'games'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/academy') return 'academy';
      if (path === '/leaderboard') return 'leaderboard';
      if (path === '/account') return 'account';
      if (path === '/about') return 'about';
      if (path.startsWith('/blog')) return 'blog';
      if (path === '/games') return 'games';
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

  useEffect(() => { applyPageSeo(window.location.pathname); }, [activeView, blogSlug]);

  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<Duration>(30);
  const [wordCount, setWordCount] = useState<WordCount>(25);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  // Save each completed test once and report confirmed database persistence.
  const savedResultRef = useRef<TestResult | null>(null);
  const [savedToLeaderboard, setSavedToLeaderboard] = useState(false);

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
  const navigateTo = useCallback((view: 'test' | 'academy' | 'leaderboard' | 'account' | 'about' | 'blog' | 'games', slug?: string) => {
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
    if (view === 'games') targetPath = '/games';

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
      } else if (path === '/games') {
        setActiveView('games');
        setBlogSlug(null);
      } else {
        setActiveView('test');
        setBlogSlug(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (phase !== 'completed' || !result || savedResultRef.current === result || (currentUser && !userProfile)) return;
    savedResultRef.current = result;
    setSavedToLeaderboard(false);
    saveTestResult(result, currentUser ? userProfile : null).then((id) => {
      if (savedResultRef.current === result) {
        setSavedToLeaderboard(Boolean(id && !id.startsWith('result_')));
      }
    }).catch((error) => console.error('Failed to save test result:', error));
  }, [phase, result, currentUser, userProfile]);

  // Reset test and navigate back to test view on logo click or next test
  const handleNextTest = useCallback(() => {
    savedResultRef.current = null;
    setSavedToLeaderboard(false);
    resetTest();
    if (activeView !== 'test') {
      navigateTo('test');
    }
  }, [resetTest, activeView, navigateTo]);

  // Global keydown handler for restart shortcuts (Tab or Esc)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (activeView === 'test' && e.key === 'Escape') {
        e.preventDefault();
        handleNextTest();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeView, handleNextTest]);

  const liveStats = getLiveStats();
  const typingFocus = activeView === 'test' && phase === 'running' && !isPaused && !isSettingsOpen && !isPrivacyOpen && !isDonationOpen;

  return (
    <LayoutGroup id="app-intro-group">
      <div data-typing-focus={typingFocus ? "true" : "false"} className="min-h-screen bg-[#0D111A] text-[#F0F3FA] flex flex-col font-sans selection:bg-[#D6F36B] selection:text-[#0D111A] relative overflow-x-hidden w-full max-w-full">
        <style>{`
          .test-chrome { transition: opacity 180ms ease; }
          [data-typing-focus="true"] .test-chrome { opacity: 0; visibility: hidden; pointer-events: none; }
          [data-typing-focus="true"], [data-typing-focus="true"] * { cursor: none !important; }
          @media (prefers-reduced-motion: reduce) { .test-chrome { transition: none; } }
        `}</style>
        {/* Top Navbar */}
        <div className="test-chrome" aria-hidden={typingFocus}>
        <Navbar
          onLogoClick={handleNextTest}
          activeView={activeView}
          onNavigate={navigateTo}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showWordmark={true}
          isIntroDone={true}
        >
        </Navbar>
        </div>

        {/* Main Container */}
        <main className="site-main flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-10 max-w-6xl w-full mx-auto overflow-x-hidden">
          {activeView === 'test' && phase !== 'completed' && <HomeExperience onGames={() => navigateTo('games')} onAcademy={() => navigateTo('academy')} />}
          {activeView === 'test' && phase !== 'completed' && <div className="test-chrome">
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
          </div>}
          <Suspense fallback={<div className="py-12 text-center text-[#A6B1C5]" role="status">Qalamtype…</div>}>
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
          ) : activeView === 'games' ? (
            <GamesView />
          ) : phase === 'completed' && result ? (
            <ResultsView
              result={result}
              savedToLeaderboard={savedToLeaderboard}
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
          </Suspense>
        </main>

        <div className="test-chrome" aria-hidden={typingFocus}>
          <DonationButton onClick={() => setIsDonationOpen(true)} />
        </div>
        {isDonationOpen && <Donation onClose={() => setIsDonationOpen(false)} />}

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
        <div className="test-chrome" aria-hidden={typingFocus}>
        <Footer
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenAbout={() => navigateTo('about')}
          onOpenBlog={() => navigateTo('blog')}
        />
        </div>
      </div>
    </LayoutGroup>
  );
}

