import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenAbout?: () => void;
  onOpenBlog?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenAbout, onOpenBlog }) => {
  const { t } = useSettings();

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 py-6 mt-auto border-t border-[rgba(240,243,250,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#748199] font-mono select-none">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[11px]">
        <span className="text-[#A6B1C5] font-medium">qalamtype</span>
        <button
          type="button"
          onClick={onOpenBlog}
          className="hover:text-[#A6B1C5] transition-colors cursor-pointer"
        >
          {t('nav_blog')}
        </button>
        <a 
          href="https://t.me/Nodirbek_B" 
          target="_blank"
          rel="noopener noreferrer" 
          className="hover:text-[#A6B1C5] transition-colors"
        >
          {t('footer_contact')}
        </a>
        <button
          type="button"
          onClick={onOpenAbout}
          className="hover:text-[#A6B1C5] transition-colors cursor-pointer"
        >
          {t('footer_about')}
        </button>
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="hover:text-[#A6B1C5] transition-colors cursor-pointer"
        >
          {t('footer_privacy')}
        </button>
        <a 
          href="https://t.me/Nodzeniki" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-3 py-0.5 text-[10px] border border-[#748199]/30 hover:border-[#D6F36B] rounded-full text-[#748199] hover:text-[#D6F36B] transition-all duration-150 cursor-pointer flex items-center tracking-wider"
        >
          {t('footer_join_blog')}
        </a>
      </div>

      <div className="flex items-center space-x-6 text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#71D9AF] inline-block animate-pulse"></span>
          <span>v1.0.4-beta</span>
        </div>
      </div>
    </footer>
  );
};
