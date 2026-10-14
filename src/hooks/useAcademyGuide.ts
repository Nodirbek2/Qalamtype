import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'qalamtype_academy_guide_dismissed_v1';
let dismissedThisSession = false;

/** A skipped or completed guide stays dismissed on this browser; replay is always available. */
export function useAcademyGuide() {
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    try {
      if (!dismissedThisSession && window.localStorage.getItem(STORAGE_KEY) !== '1') setGuideOpen(true);
    } catch {
      if (!dismissedThisSession) setGuideOpen(true);
    }
  }, []);
  const dismissGuide = useCallback(() => {
    dismissedThisSession = true;
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch { /* Browsers may disable storage. */ }
    setGuideOpen(false);
  }, []);
  const replayGuide = useCallback(() => setGuideOpen(true), []);
  return { guideOpen, dismissGuide, replayGuide };
}
