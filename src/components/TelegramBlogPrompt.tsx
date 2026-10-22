import React, { useEffect, useRef, useState } from 'react';
import { Send, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { canShowTelegramPrompt, localDay, TELEGRAM_PROMPT_KEY } from '../lib/telegramPrompt';

const copy = {
  uzbek_latin: { title: 'Yozish orasida blogimga ham bir qarang', description: 'Fikrlarim va loyihalarim haqida Telegram’da yozib boraman.', visit: 'Telegram blogga o‘tish', later: 'Keyinroq', close: 'Yopish' },
  uzbek_cyrillic: { title: 'Ёзиш орасида блогимга ҳам бир қаранг', description: 'Фикрларим ва лойиҳаларим ҳақида Telegram’да ёзиб бораман.', visit: 'Telegram блогга ўтиш', later: 'Кейинроқ', close: 'Ёпиш' },
  russian: { title: 'Загляните в мой Telegram-блог', description: 'Делюсь мыслями и рассказываю о своих проектах.', visit: 'Открыть Telegram-блог', later: 'Позже', close: 'Закрыть' },
  english: { title: 'Take a typing break with my blog', description: 'I share my thoughts and projects on Telegram.', visit: 'Visit my Telegram blog', later: 'Maybe later', close: 'Close' },
};

let dismissedThisDay: string | null = null;
function lastDismissedDay() {
  try { return localStorage.getItem(TELEGRAM_PROMPT_KEY) || dismissedThisDay; }
  catch { return dismissedThisDay; }
}

export function TelegramBlogPrompt() {
  const { currentUser, loading } = useAuth();
  const { siteLanguage } = useSettings();
  const text = copy[siteLanguage] || copy.uzbek_latin;
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const visible = ready && !loading && !currentUser;

  const dismiss = () => {
    dismissedThisDay = localDay();
    try { localStorage.setItem(TELEGRAM_PROMPT_KEY, dismissedThisDay); } catch { /* Session fallback above. */ }
    setReady(false);
  };

  useEffect(() => {
    if (loading || currentUser || !canShowTelegramPrompt(false, lastDismissedDay())) return;
    const timer = window.setTimeout(() => {
      if (canShowTelegramPrompt(false, lastDismissedDay())) setReady(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [loading, currentUser]);

  useEffect(() => {
    const node = dialog.current;
    if (visible && node && !node.open) node.showModal();
    if (!visible && node?.open) node.close();
    const onStorage = (event: StorageEvent) => {
      if (event.key === TELEGRAM_PROMPT_KEY && event.newValue === localDay()) setReady(false);
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      if (node?.open) node.close();
    };
  }, [visible]);

  return <dialog ref={dialog} aria-labelledby="telegram-blog-title" aria-describedby="telegram-blog-description"
    onCancel={(event) => { event.preventDefault(); dismiss(); }}
    onKeyDown={(event) => event.stopPropagation()}
    onClick={(event) => { if (event.target === event.currentTarget) dismiss(); }}
    className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#63D9DA]/20 bg-[#171E2B] p-0 text-[#F0F3FA] shadow-2xl backdrop:bg-[#0D111A]/80 backdrop:backdrop-blur-sm">
    <div className="relative p-6 sm:p-8 text-center">
      <button type="button" aria-label={text.close} onClick={dismiss} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[#A6B1C5] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#63D9DA]"><X size={20}/></button>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#63D9DA]/10 text-[#63D9DA]"><Send size={30} aria-hidden="true"/></div>
      <p className="mb-2 text-xs font-mono tracking-wider text-[#63D9DA]">@Nodzeniki</p>
      <h2 id="telegram-blog-title" className="text-2xl font-semibold leading-tight">{text.title}</h2>
      <p id="telegram-blog-description" className="mt-3 text-sm leading-relaxed text-[#A6B1C5]">{text.description}</p>
      <a href="https://t.me/Nodzeniki" target="_blank" rel="noopener noreferrer" onClick={dismiss} className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#63D9DA] px-4 py-3 text-sm font-semibold text-[#0D111A] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63D9DA]">{text.visit}<ArrowUpRight size={18} aria-hidden="true"/></a>
      <button type="button" onClick={dismiss} className="mt-2 min-h-11 rounded-lg px-5 text-sm text-[#A6B1C5] hover:text-white focus-visible:outline-2 focus-visible:outline-[#63D9DA]">{text.later}</button>
    </div>
  </dialog>;
}
