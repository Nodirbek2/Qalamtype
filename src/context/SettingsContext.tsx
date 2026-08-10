import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, CaretSpeed, TypingFont } from '../types';
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
  typingFont: TypingFont;
  setTypingFont: (font: TypingFont) => void;
  t: (key: TranslationKey) => string;
  testSound: (sound: TypingSound) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LS_TYPING_SOUND = 'qalampir_typing_sound';
const LS_SMOOTH_CARET = 'qalampir_smooth_caret';
const LS_SITE_LANG = 'qalampir_site_language';
const LS_TYPING_LANG = 'qalampir_typing_language';
const LS_TYPING_FONT = 'qalampir_typing_font';

export function sanitizeLanguage(lang: any): Language {
  if (lang === 'uzbek_cyrillic' || lang === 'uzbek_cyr' || lang === 'cyrillic') return 'uzbek_cyrillic';
  if (lang === 'uzbek_latin' || lang === 'uzbek' || lang === 'uz' || lang === 'latin') return 'uzbek_latin';
  if (lang === 'russian' || lang === 'ru') return 'russian';
  if (lang === 'english' || lang === 'en') return 'english';
  return 'uzbek_latin';
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();

  const [typingSound, setTypingSoundState] = useState<TypingSound>(() => {
    return (localStorage.getItem(LS_TYPING_SOUND) as TypingSound) || 'click';
  });

  const [smoothCaret, setSmoothCaretState] = useState<CaretSpeed>(() => {
    return (localStorage.getItem(LS_SMOOTH_CARET) as CaretSpeed) || 'medium';
  });

  const [siteLanguage, setSiteLanguageState] = useState<Language>(() => {
    return sanitizeLanguage(localStorage.getItem(LS_SITE_LANG));
  });

  const [typingLanguage, setTypingLanguageState] = useState<Language>(() => {
    return sanitizeLanguage(localStorage.getItem(LS_TYPING_LANG));
  });

  const [typingFont, setTypingFontState] = useState<TypingFont>(() => {
    return (localStorage.getItem(LS_TYPING_FONT) as TypingFont) || 'jetbrains_mono';
  });

  // Sync settings with userProfile if logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.preferredSiteLanguage) {
        const cleanSiteLang = sanitizeLanguage(userProfile.preferredSiteLanguage);
        setSiteLanguageState(cleanSiteLang);
        localStorage.setItem(LS_SITE_LANG, cleanSiteLang);
      }
      if (userProfile.preferredTypingLanguage) {
        const cleanTypingLang = sanitizeLanguage(userProfile.preferredTypingLanguage);
        setTypingLanguageState(cleanTypingLang);
        localStorage.setItem(LS_TYPING_LANG, cleanTypingLang);
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
      const cleanLang = sanitizeLanguage(lang);
      setSiteLanguageState(cleanLang);
      localStorage.setItem(LS_SITE_LANG, cleanLang);
      if (userProfile) {
        updateUserProfile({ preferredSiteLanguage: cleanLang }).catch(() => {});
      }
    },
    [userProfile, updateUserProfile]
  );

  const setTypingLanguage = useCallback(
    (lang: Language) => {
      const cleanLang = sanitizeLanguage(lang);
      setTypingLanguageState(cleanLang);
      localStorage.setItem(LS_TYPING_LANG, cleanLang);
      if (userProfile) {
        updateUserProfile({ preferredTypingLanguage: cleanLang }).catch(() => {});
      }
    },
    [userProfile, updateUserProfile]
  );

  const setTypingFont = useCallback((font: TypingFont) => {
    setTypingFontState(font);
    localStorage.setItem(LS_TYPING_FONT, font);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const activeLang = sanitizeLanguage(siteLanguage);
      const langDict = translations[activeLang] || translations.uzbek_latin;
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
        typingFont,
        setTypingFont,
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
