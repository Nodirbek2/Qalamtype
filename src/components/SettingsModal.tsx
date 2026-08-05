import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { TypingSound } from '../lib/soundSynthesizer';
import { CaretSpeed, Language } from '../types';
import { X, Volume2, MousePointer, Globe, Keyboard, Play } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
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
  } = useSettings();

  if (!isOpen) return null;

  const soundOptions: Array<{ id: TypingSound; labelKey: string }> = [
    { id: 'mute', labelKey: 'settings_sound_mute' },
    { id: 'click', labelKey: 'settings_sound_click' },
    { id: 'typewriter', labelKey: 'settings_sound_typewriter' },
    { id: 'mechanical', labelKey: 'settings_sound_mechanical' },
    { id: 'soft_pop', labelKey: 'settings_sound_soft_pop' },
    { id: 'beep', labelKey: 'settings_sound_beep' },
    { id: 'clack', labelKey: 'settings_sound_clack' },
  ];

  const caretOptions: Array<{ id: CaretSpeed; labelKey: string }> = [
    { id: 'off', labelKey: 'settings_caret_off' },
    { id: 'slow', labelKey: 'settings_caret_slow' },
    { id: 'medium', labelKey: 'settings_caret_medium' },
    { id: 'fast', labelKey: 'settings_caret_fast' },
  ];

  // Uzbek listed FIRST in all language selectors
  const languageOptions: Array<{ id: Language; labelKey: string; flag: string }> = [
    { id: 'uzbek_latin', labelKey: 'lang_uzbek_latin', flag: 'UZ' },
    { id: 'uzbek_cyrillic', labelKey: 'lang_uzbek_cyrillic', flag: 'UZ' },
    { id: 'russian', labelKey: 'lang_russian', flag: 'RU' },
    { id: 'english', labelKey: 'lang_english', flag: 'EN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#1A1917] border border-[rgba(232,226,216,0.12)] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(232,226,216,0.08)] bg-[#0F0E0D]/50">
          <div>
            <h2 className="text-lg font-medium text-[#E8E2D8] tracking-tight">
              {t('settings_title')}
            </h2>
            <p className="text-xs font-mono text-[#9A9488]">
              {t('settings_subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.06)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-mono text-xs">
          {/* 1. Typing Sound Setting */}
          <div className="space-y-2">
            <label className="text-[#E8E2D8] font-medium flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#E85D3D]" />
              <span>{t('settings_typing_sound')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {soundOptions.map((opt) => {
                const active = typingSound === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypingSound(opt.id)}
                    className={`px-3 py-2 rounded-lg text-left border flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F0E0D] border-[#E85D3D] text-[#E85D3D] font-semibold'
                        : 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.08)] text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]/80'
                    }`}
                  >
                    <span className="truncate">{t(opt.labelKey as any)}</span>
                    {opt.id !== 'mute' && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          testSound(opt.id);
                        }}
                        className="p-1 hover:text-[#E85D3D] transition-colors cursor-pointer"
                        title="Preview sound"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Smooth Caret Speed Setting */}
          <div className="space-y-2">
            <label className="text-[#E8E2D8] font-medium flex items-center space-x-2">
              <MousePointer className="w-4 h-4 text-[#F4A340]" />
              <span>{t('settings_smooth_caret')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {caretOptions.map((opt) => {
                const active = smoothCaret === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSmoothCaret(opt.id)}
                    className={`px-3 py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F0E0D] border-[#F4A340] text-[#F4A340] font-semibold'
                        : 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.08)] text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]/80'
                    }`}
                  >
                    {t(opt.labelKey as any)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Site Language Setting (Uzbek listed first) */}
          <div className="space-y-2">
            <label className="text-[#E8E2D8] font-medium flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#6FA85C]" />
              <span>{t('settings_site_language')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((opt) => {
                const active = siteLanguage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSiteLanguage(opt.id)}
                    className={`px-3 py-2 rounded-lg border flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F0E0D] border-[#6FA85C] text-[#6FA85C] font-semibold'
                        : 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.08)] text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]/80'
                    }`}
                  >
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(232,226,216,0.1)]">
                      {opt.flag}
                    </span>
                    <span>{t(opt.labelKey as any)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Typing Language Setting (Uzbek listed first) */}
          <div className="space-y-2">
            <label className="text-[#E8E2D8] font-medium flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-[#E85D3D]" />
              <span>{t('settings_typing_language')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((opt) => {
                const active = typingLanguage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypingLanguage(opt.id)}
                    className={`px-3 py-2 rounded-lg border flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F0E0D] border-[#E85D3D] text-[#E85D3D] font-semibold'
                        : 'bg-[#0F0E0D]/40 border-[rgba(232,226,216,0.08)] text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[#0F0E0D]/80'
                    }`}
                  >
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(232,226,216,0.1)]">
                      {opt.flag}
                    </span>
                    <span>{t(opt.labelKey as any)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(232,226,216,0.08)] bg-[#0F0E0D]/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono font-semibold text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t('settings_close')}
          </button>
        </div>
      </div>
    </div>
  );
};
