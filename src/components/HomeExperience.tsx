import React from 'react';
import { ArrowUpRight, Gamepad2, GraduationCap, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const copy = {
  english: ['FIND YOUR FLOW', 'Small practice.', 'Big progress.', 'A little focus every day. Build speed, find your rhythm, and make every keystroke count.', 'Play your way', 'Turn practice into a race or a magical battle.', 'Explore games', 'Build your skills', 'Learn step by step. Grow with every lesson.', 'Open academy', 'YOUR DAILY TYPING STUDIO', 'Choose a mode. Start typing.'],
  uzbek_latin: ['O‘Z RITMINGIZNI TOPING', 'Kichik mashq.', 'Katta natija.', 'Har kuni ozgina diqqat. Tezlikni oshiring, ritmingizni toping va har bir tugmani ishonch bilan bosing.', 'O‘ynab o‘rganing', 'Mashqni poyga yoki sehrli jangga aylantiring.', 'O‘yinlarni ochish', 'Mahoratingizni oshiring', 'Bosqichma-bosqich o‘rganing. Har darsda o‘sing.', 'Akademiyani ochish', 'KUNDALIK YOZISH STUDIYANGIZ', 'Rejimni tanlang. Yozishni boshlang.'],
  uzbek_cyrillic: ['ЎЗ РИТМИНГИЗНИ ТОПИНГ', 'Кичик машқ.', 'Катта натижа.', 'Ҳар куни озгина диққат. Тезликни оширинг ва ҳар бир тугмани ишонч билан босинг.', 'Ўйнаб ўрганинг', 'Машқни пойга ёки сеҳрли жангга айлантиринг.', 'Ўйинларни очиш', 'Маҳоратингизни оширинг', 'Босқичма-босқич ўрганинг. Ҳар дарсда ўсинг.', 'Академияни очиш', 'КУНДАЛИК ЁЗИШ СТУДИЯНГИЗ', 'Режимни танланг. Ёзишни бошланг.'],
  russian: ['НАЙДИТЕ СВОЙ РИТМ', 'Маленькая практика.', 'Большой прогресс.', 'Немного внимания каждый день. Развивайте скорость и уверенность с каждым нажатием.', 'Учитесь играя', 'Превратите тренировку в гонку или магическую битву.', 'Открыть игры', 'Развивайте навыки', 'Учитесь шаг за шагом. Растите с каждым уроком.', 'Открыть академию', 'ВАША СТУДИЯ ПЕЧАТИ', 'Выберите режим. Начните печатать.'],
};
export function HomeExperience({onGames,onAcademy}: {onGames:()=>void;onAcademy:()=>void}) {
  const {siteLanguage}=useSettings(); const c=copy[siteLanguage]; const pills=siteLanguage==='english'?['4 languages','15–120s','100% free']:siteLanguage==='russian'?['4 языка','15–120с','Бесплатно']:siteLanguage==='uzbek_cyrillic'?['4 тил','15–120с','Бепул']:['4 til','15–120s','Bepul'];
  return <div className="home-experience test-chrome">
    <section className="home-hero">
      <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/>{c[0]}</div><h1>{c[1]}<br/><span>{c[2]}</span></h1><p>{c[3]}</p><div className="hero-pills">{pills.map(label=><span key={label}>{label}</span>)}</div></div>
      <div className="keyboard-art" aria-hidden="true"><div className="keyboard-orbit"/><span className="floating-label">qalamtype studio</span><div className="keyboard-board">{['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((row,i)=><div className="key-row" key={row}>{row.split('').map((key,j)=><span key={key} className={(i+j)%5===0?'lit-key':''}>{key}</span>)}</div>)}<div className="key-row"><span className="space-key">qalamtype</span></div></div><span className="floating-speed">⌁ <b>⌨  ↑</b></span></div>
    </section>
    <div className="studio-label"><span className="eyebrow">{c[10]}</span><span>{c[11]}</span></div>
    <div className="discovery-grid">
      <button onClick={onGames} className="discovery-card discovery-game"><img src="/images/sprint-race.webp" alt="" loading="lazy"/><div><Gamepad2 size={20}/><h2>{c[4]}</h2><p>{c[5]}</p><span>{c[6]} <ArrowUpRight size={16}/></span></div></button>
      <button onClick={onAcademy} className="discovery-card"><div className="lesson-art" aria-hidden="true"><span>F</span><span>J</span><i>01 → 02 → 03</i></div><div><GraduationCap size={20}/><h2>{c[7]}</h2><p>{c[8]}</p><span>{c[9]} <ArrowUpRight size={16}/></span></div></button>
    </div>
  </div>;
}
