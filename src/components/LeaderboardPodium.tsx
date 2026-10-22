import React from 'react';
import { Crown } from 'lucide-react';
import type { LeaderboardResult } from '../lib/resultsService';
import { UserAvatar } from './UserAvatar';
import { useSettings } from '../context/SettingsContext';
import { avatarText } from '../data/avatarI18n';
import './leaderboardPodium.css';

export function LeaderboardPodium({ results }: { results: LeaderboardResult[] }) {
  const { t, siteLanguage } = useSettings();
  if (!results.length) return null;
  return <section aria-label={t('lb_title')} className="qt-podium">
    {results.slice(0, 3).map((row, index) => <article key={row.uid} className={`qt-podium-card qt-podium-rank-${index + 1}`}>
      <div className="qt-podium-person">
        {index === 0 && <Crown className="qt-podium-crown" size={28} aria-hidden="true"/>}
        <div className="qt-podium-portrait"><UserAvatar uid={row.uid} name={row.username} photoURL={row.photoURL} className="qt-podium-avatar"/><span className="qt-podium-medal">{index + 1}</span></div>
        <h2 title={row.username}>@{row.username}</h2>
        <p><strong>{row.wpm}</strong><span>WPM</span></p>
        <small>{row.accuracy}% {avatarText(siteLanguage).accuracy}</small>
      </div>
      <div className="qt-podium-step" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></div>
    </article>)}
  </section>;
}
