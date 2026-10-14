import React, { useEffect, useRef, useState } from 'react';
import { PlayCircle, X } from 'lucide-react';
import type { Language } from '../types';

export const academyGuideLabels: Record<Language, { title: string; description: string; skip: string; error: string; retry: string }> = {
  uzbek_latin: { title: 'Qanday to‘g‘ri yozish qo‘llanmasi', description: 'Barmoqlar joylashuvi va akademiyada mashq qilish · 5:22', skip: 'O‘tkazib yuborish', error: 'Video yuklanmadi. Qayta urinishingiz yoki darslarni boshlashingiz mumkin.', retry: 'Qayta urinish' },
  uzbek_cyrillic: { title: 'Қандай тўғри ёзиш қўлланмаси', description: 'Бармоқлар жойлашуви ва академияда машқ қилиш · 5:22', skip: 'Ўтказиб юбориш', error: 'Видео юкланмади. Қайта урининг ёки дарсларни бошланг.', retry: 'Қайта уриниш' },
  russian: { title: 'Как правильно печатать', description: 'Положение пальцев и занятия в академии · 5:22 · На узбекском', skip: 'Пропустить', error: 'Видео не загрузилось. Попробуйте ещё раз или переходите к урокам.', retry: 'Повторить' },
  english: { title: 'How to type correctly', description: 'Finger placement and academy practice · 5:22 · In Uzbek', skip: 'Skip video', error: 'The video could not load. Try again or continue to the lessons.', retry: 'Try again' },
};

export function AcademyGuideModal({ language, onDismiss }: { language: Language; onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const labels = academyGuideLabels[language];
  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      video?.pause();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog ref={dialogRef} className="academy-guide-dialog" aria-labelledby="academy-guide-title" aria-describedby="academy-guide-description"
      onCancel={event => { event.preventDefault(); onDismiss(); }}>
      <header className="academy-guide-heading">
        <div><h2 id="academy-guide-title"><PlayCircle size={22} aria-hidden="true" />{labels.title}</h2><p id="academy-guide-description">{labels.description}</p></div>
        <button type="button" className="academy-guide-close" aria-label={labels.skip} onClick={onDismiss}><X size={20} /></button>
      </header>
      <div className="academy-guide-player">
        <video ref={videoRef} controls playsInline preload="metadata" poster="/videos/academy-typing-guide-poster.jpg"
          aria-label={labels.title} onEnded={onDismiss} onError={() => setFailed(true)}>
          <source src="/videos/academy-typing-guide-v1.mp4" type="video/mp4" />
        </video>
        <button type="button" autoFocus className="academy-guide-skip" onClick={onDismiss}>{labels.skip} <span aria-hidden="true">→</span></button>
      </div>
      {failed && <div className="academy-guide-error" role="alert"><p>{labels.error}</p><button type="button" onClick={() => { setFailed(false); videoRef.current?.load(); }}>{labels.retry}</button></div>}
    </dialog>
  );
}
