import React from 'react';
import { ArrowUpRight, Gamepad2, GraduationCap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const copy = {
  english: ['FIND YOUR FLOW', 'Small practice.', 'Big progress.', 'A little focus every day. Build speed, find your rhythm, and make every keystroke count.', 'Play your way', 'Race your way to faster, more accurate typing.', 'Start racing', 'Build your skills', 'Learn step by step. Grow with every lesson.', 'Open academy', 'YOUR DAILY TYPING STUDIO', 'Choose a mode. Start typing.'],
  uzbek_latin: ['O‘Z RITMINGIZNI TOPING', 'Kichik mashq.', 'Katta natija.', 'Har kuni ozgina diqqat. Tezlikni oshiring, ritmingizni toping va har bir tugmani ishonch bilan bosing.', 'O‘ynab o‘rganing', 'Yozing, poyga qiling va o‘z garajingizni yarating.', 'Poygani ochish', 'Mahoratingizni oshiring', 'Bosqichma-bosqich o‘rganing. Har darsda o‘sing.', 'Akademiyani ochish', 'KUNDALIK YOZISH STUDIYANGIZ', 'Rejimni tanlang. Yozishni boshlang.'],
  uzbek_cyrillic: ['ЎЗ РИТМИНГИЗНИ ТОПИНГ', 'Кичик машқ.', 'Катта натижа.', 'Ҳар куни озгина диққат. Тезликни оширинг ва ҳар бир тугмани ишонч билан босинг.', 'Ўйнаб ўрганинг', 'Ёзинг, пойга қилинг ва ўз гаражингизни яратинг.', 'Пойгани очиш', 'Маҳоратингизни оширинг', 'Босқичма-босқич ўрганинг. Ҳар дарсда ўсинг.', 'Академияни очиш', 'КУНДАЛИК ЁЗИШ СТУДИЯНГИЗ', 'Режимни танланг. Ёзишни бошланг.'],
  russian: ['НАЙДИТЕ СВОЙ РИТМ', 'Маленькая практика.', 'Большой прогресс.', 'Немного внимания каждый день. Развивайте скорость и уверенность с каждым нажатием.', 'Учитесь играя', 'Печатайте, соревнуйтесь и соберите свой гараж.', 'Начать гонку', 'Развивайте навыки', 'Учитесь шаг за шагом. Растите с каждым уроком.', 'Открыть академию', 'ВАША СТУДИЯ ПЕЧАТИ', 'Выберите режим. Начните печатать.'],
};
export function HomeExperience({onGames,onAcademy}: {onGames:()=>void;onAcademy:()=>void}) {
  const {siteLanguage}=useSettings(); const c=copy[siteLanguage];
  return <div className="home-experience test-chrome">
    <div className="studio-label"><span className="eyebrow">{c[10]}</span><span>{c[11]}</span></div>
    <div className="discovery-grid">
      <button onClick={onGames} className="discovery-card discovery-game"><img src="/images/sprint-race.webp" alt="" loading="lazy"/><div><Gamepad2 size={20}/><h2>{c[4]}</h2><p>{c[5]}</p><span>{c[6]} <ArrowUpRight size={16}/></span></div></button>
      <button onClick={onAcademy} className="discovery-card"><div className="lesson-art" aria-hidden="true"><span>F</span><span>J</span><i>01 → 02 → 03</i></div><div><GraduationCap size={20}/><h2>{c[7]}</h2><p>{c[8]}</p><span>{c[9]} <ArrowUpRight size={16}/></span></div></button>
    </div>
  </div>;
}
