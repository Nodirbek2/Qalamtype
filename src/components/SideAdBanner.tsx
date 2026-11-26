import React from 'react';
import { useSettings } from '../context/SettingsContext';

const AD_HREF = 'https://r1wbjhb.com/?open=register&p=1065';
const AD_IMAGE_SRC = '/assets/aistudio/DEFLIGHT__1__7c920252.jpeg';

const AD_LABELS = {
  uzbek_latin: 'Reklama',
  uzbek_cyrillic: 'Реклама',
  russian: 'Реклама',
  english: 'Ad',
} as const;

interface SideAdBannerProps {
  side: 'left' | 'right';
  dimmed?: boolean;
}

export const SideAdBanner: React.FC<SideAdBannerProps> = ({ side, dimmed = false }) => {
  const { siteLanguage } = useSettings();
  const label = AD_LABELS[siteLanguage] || 'Reklama';

  return (
    <aside
      aria-label={`${label} (${side})`}
      className={`hidden lg:block self-start shrink-0 sticky top-6 my-6 sm:my-10 z-10 transition-opacity duration-200 ${
        dimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}
    >
      <a
        href={AD_HREF}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block relative w-[124px] xl:w-[152px] 2xl:w-[172px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#171E2B] border border-[rgba(240,243,250,0.14)] shadow-[0_14px_34px_rgba(0,0,0,0.45)] hover:border-[#D6F36B]/60 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.6)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#D6F36B] focus-visible:outline-offset-4"
      >
        <img
          src={AD_IMAGE_SRC}
          alt="1win Aviator — Bonus +600%, Promokod: deflight"
          loading="lazy"
          className="w-full h-full object-cover object-center select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#0D111A]/75 backdrop-blur-sm border border-[rgba(240,243,250,0.15)] text-[9px] font-mono uppercase tracking-wider text-[#A6B1C5] pointer-events-none">
          {label}
        </span>
      </a>
    </aside>
  );
};
