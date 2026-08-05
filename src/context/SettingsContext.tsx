import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, CaretSpeed } from '../types';
import { TypingSound, playTypingSound } from '../lib/soundSynthesizer';
import { translations, TranslationKey } from '../data/translations';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  typingSound: TypingSound;
  setTypingSound: (sound: TypingSound) => void;
  smoothCaret: CaretSpeed;
  setSmoothCaret: (speed: CaretSpeed) => void;
  siteLanguage: Language;
  setSiteLanguage: (lang: Language) => void;
  typingLanguage: Language;
  setTypingLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  testSound: (sound: TypingSound) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LS_TYPING_SOUND = 'qalampir_typing_sound';
const LS_SMOOTH_CARET = 'qalampir_smooth_caret';
const LS_SITE_LANG = 'qalampir_site_language';
const LS_TYPING_LANG = 'qalampir_typing_language';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();

  const [typingSound, setTypingSoundState] = useState<TypingSound>(() => {
    return (localStorage.getItem(LS_TYPING_SOUND) as TypingSound) || 'click';
  });

  const [smoothCaret, setSmoothCaretState] = useState<CaretSpeed>(() => {
    return (localStorage.getItem(LS_SMOOTH_CARET) as CaretSpeed) || 'medium';
  });

  const [siteLanguage, setSiteLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LS_SITE_LANG) as Language) || 'uzbek_latin';
  });

  const [typingLanguage, setTypingLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LS_TYPING_LANG) as Language) || 'uzbek_latin';
  });

  // Sync settings with userProfile if logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.preferredSiteLanguage) {
        setSiteLanguageState(userProfile.preferredSiteLanguage);
        localStorage.setItem(LS_SITE_LANG, userProfile.preferredSiteLanguage);
      }
      if (userProfile.preferredTypingLanguage) {
        setTypingLanguageState(userProfile.preferredTypingLanguage);
        localStorage.setItem(LS_TYPING_LANG, userProfile.preferredTypingLanguage);
      }
    }
  }, [userProfile]);

  const setTypingSound = useCallback(
    (sound: TypingSound) => {
      setTypingSoundState(sound);
      localStorage.setItem(LS_TYPING_SOUND, sound);
      playTypingSound(sound);
    },
    []
  );

  const setSmoothCaret = useCallback((speed: CaretSpeed) => {
    setSmoothCaretState(speed);
    localStorage.setItem(LS_SMOOTH_CARET, speed);
  }, []);

  const setSiteLanguage = useCallback(
    (lang: Language) => {
      setSiteLanguageState(lang);
      localStorage.setItem(LS_SITE_LANG, lang);
      if (userProfile) {
        updateUserProfile({ preferredSiteLanguage: lang }).catch(() => {});
      }
    },
    [userProfile, updateUserProfile]
  );

  const setTypingLanguage = useCallback(
    (lang: Language) => {
      setTypingLanguageState(lang);
      localStorage.setItem(LS_TYPING_LANG, lang);
      if (userProfile) {
        updateUserProfile({ preferredTypingLanguage: lang }).catch(() => {});
      }
    },
    [userProfile, updateUserProfile]
  );

  const t = useCallback(
    (key: TranslationKey): string => {
      const langDict = translations[siteLanguage] || translations.uzbek_latin;
      return langDict[key] || translations.uzbek_latin[key] || key;
    },
    [siteLanguage]
  );

  const testSound = useCallback((sound: TypingSound) => {
    playTypingSound(sound);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        typingSound,
        setTypingSound,
        smoothCaret,
        setSmoothCaret,
        siteLanguage,
        setSiteLanguage,
        typingLanguage,
        setTypingLanguage,
        t,
        testSound,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
