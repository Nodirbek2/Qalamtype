import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  const { t } = useSettings();

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 py-6 mt-auto border-t border-[rgba(232,226,216,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C574C] font-mono select-none">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[11px]">
        <span className="text-[#9A9488] font-medium">qalampir</span>
        <a 
          href="https://t.me/Nodirbek_B" 
          target="_blank"
          rel="noopener noreferrer" 
          className="hover:text-[#9A9488] transition-colors"
        >
          {t('footer_contact')}
        </a>
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="hover:text-[#9A9488] transition-colors cursor-pointer"
        >
          {t('footer_privacy')}
        </button>
        <a 
          href="https://t.me/Nodzeniki" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-3 py-0.5 text-[10px] border border-[#5C574C]/30 hover:border-[#E85D3D] rounded-full text-[#5C574C] hover:text-[#E85D3D] transition-all duration-150 cursor-pointer flex items-center tracking-wider"
        >
          {t('footer_join_blog')}
        </a>
      </div>

      <div className="flex items-center space-x-6 text-[11px]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#6FA85C] inline-block animate-pulse"></span>
          <span>v1.0.4-beta</span>
        </div>
      </div>
    </footer>
  );
};
