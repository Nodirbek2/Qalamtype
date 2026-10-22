import React, { useEffect, useRef, useState } from 'react';
import { Send, X, ArrowUpRight } from 'lucide-react';
import './telegramGlass.css';
import { useSettings } from '../context/SettingsContext';
import { canShowTelegramPrompt, localDay, TELEGRAM_PROMPT_KEY } from '../lib/telegramPrompt';

const copy = {
  uzbek_latin: { title: 'Yozish orasida blogimga ham bir qarang', description: 'Fikrlarim va loyihalarim haqida Telegram’da yozib boraman.', visit: 'Telegram blogga o‘tish', later: 'Keyinroq', close: 'Yopish' },
  uzbek_cyrillic: { title: 'Ёзиш орасида блогимга ҳам бир қаранг', description: 'Фикрларим ва лойиҳаларим ҳақида Telegram’да ёзиб бораман.', visit: 'Telegram блогга ўтиш', later: 'Кейинроқ', close: 'Ёпиш' },
  russian: { title: 'Загляните в мой Telegram-блог', description: 'Делюсь мыслями и рассказываю о своих проектах.', visit: 'Открыть Telegram-блог', later: 'Позже', close: 'Закрыть' },
  english: { title: 'Take a typing break with my blog', description: 'I share my thoughts and projects on Telegram.', visit: 'Visit my Telegram blog', later: 'Maybe later', close: 'Close' },
};

let shownThisDay: string | null = null;
function lastShownDay() {
  try { return localStorage.getItem(TELEGRAM_PROMPT_KEY) || shownThisDay; }
  catch { return shownThisDay; }
}

export function TelegramBlogPrompt() {
  const { siteLanguage } = useSettings();
  const text = copy[siteLanguage] || copy.uzbek_latin;
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const visible = ready;

  const dismiss = () => setReady(false);

  useEffect(() => {
    if (!canShowTelegramPrompt(lastShownDay())) return;
    const timer = window.setTimeout(() => {
      if (canShowTelegramPrompt(lastShownDay())) setReady(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const node = dialog.current;
    if (visible && node && !node.open) {
      if (!canShowTelegramPrompt(lastShownDay())) {
        setReady(false);
        return;
      }
      node.showModal();
      // Count an actual display, even if the visitor leaves without closing it.
      shownThisDay = localDay();
      try { localStorage.setItem(TELEGRAM_PROMPT_KEY, shownThisDay); } catch { /* Session fallback above. */ }
    }
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
    className="telegram-glass">
    <div className="telegram-glass-content">
      <button type="button" aria-label={text.close} onClick={dismiss} className="telegram-glass-close"><X size={19}/></button>
      <div className="telegram-glass-icon"><Send size={32} strokeWidth={1.6} aria-hidden="true"/></div>
      <p className="telegram-glass-handle">@Nodzeniki</p>
      <h2 id="telegram-blog-title">{text.title}</h2>
      <p id="telegram-blog-description" className="telegram-glass-description">{text.description}</p>
      <a href="https://t.me/Nodzeniki" target="_blank" rel="noopener noreferrer" onClick={dismiss} className="telegram-glass-visit">{text.visit}<ArrowUpRight size={18} aria-hidden="true"/></a>
      <button type="button" onClick={dismiss} className="telegram-glass-later">{text.later}</button>
    </div>
  </dialog>;
}
