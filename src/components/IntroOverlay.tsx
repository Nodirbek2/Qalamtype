import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface IntroOverlayProps {
  introState: 'checking' | 'hero' | 'animating' | 'done';
  onStartAnimation: () => void;
  onCompleteAnimation: () => void;
  onSkip: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  introState,
  onStartAnimation,
  onCompleteAnimation,
  onSkip,
}) => {
  // Timer for 1.2s hold in hero state
  useEffect(() => {
    if (introState !== 'hero') return;

    const timer = setTimeout(() => {
      onStartAnimation();
    }, 1200);

    return () => clearTimeout(timer);
  }, [introState, onStartAnimation]);

  // Timer for 650ms animation duration
  useEffect(() => {
    if (introState !== 'animating') return;

    const timer = setTimeout(() => {
      onCompleteAnimation();
    }, 650);

    return () => clearTimeout(timer);
  }, [introState, onCompleteAnimation]);

  // Skip handler on click or keydown
  useEffect(() => {
    if (introState !== 'hero') return;

    const handleKeyDown = () => {
      onSkip();
    };

    const handleClick = () => {
      onSkip();
    };

    // Delay event listeners slightly so initialization clicks don't immediately trigger skip
    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('click', handleClick);
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [introState, onSkip]);

  if (introState === 'checking' || introState === 'done') {
    return null;
  }

  const isAnimating = introState === 'animating';

  return (
    <motion.div
      key="intro-fullscreen-bg"
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0F0E0D] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
    >
      <div className="flex flex-col items-center text-center px-4 max-w-xl mx-auto">
        {/* Line 2: "qalampir" (Wordmark) */}
        <div className="my-4 flex items-center justify-center min-h-[60px]">
          {introState === 'hero' && (
            <motion.span
              layoutId="logo-wordmark"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block font-mono font-medium text-[48px] sm:text-[60px] text-[#E85D3D] leading-none tracking-tight"
            >
              qalampir
            </motion.span>
          )}
        </div>

        {/* CTA Pill: "Boshlash" */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: isAnimating ? 0 : 1,
            y: isAnimating ? 20 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#4A1B0C] font-mono text-sm font-semibold px-6 py-2 rounded-full transition-colors shadow-lg cursor-pointer"
          >
            Boshlash
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
