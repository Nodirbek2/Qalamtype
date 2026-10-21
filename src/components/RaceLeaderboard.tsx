import React, {useCallback, useEffect, useState} from 'react';
import {Trophy, RotateCcw} from 'lucide-react';
import {supabase} from '../lib/supabase';
import {CARS} from '../lib/raceCareer';
import type {Language} from '../types';
export const raceCopy:Record<Language,string[]>={
 uzbek_latin:['Katta ekran','Kichik ekran','Eng ko‘p yozganlar · Top 10','Barcha tillar · jami tugatilgan poygalardagi so‘zlar','O‘yinchi','So‘zlar','Poygalar','Hali natijalar yo‘q. Birinchi poygangizni tugating!','Reytingni yuklab bo‘lmadi. Qayta urinib ko‘ring.','Yangilash','Yuklanmoqda…','Natijangiz reytingga saqlanmadi. Qayta saqlash','Reyting yangi tugatilgan poygalardan hisoblanadi.'],
 uzbek_cyrillic:['Катта экран','Кичик экран','Энг кўп ёзганлар · Top 10','Барча тиллар · тугатилган пойгалардаги сўзлар','Ўйинчи','Сўзлар','Пойгалар','Ҳали натижалар йўқ. Биринчи пойгангизни тугатинг!','Рейтингни юклаб бўлмади. Қайта урининг.','Янгилаш','Юкланмоқда…','Натижа сақланмади. Қайта сақлаш','Рейтинг янги тугатилган пойгалардан ҳисобланади.'],
 russian:['Большой экран','Маленький экран','Больше всего слов · Топ 10','Все языки · слова в завершённых гонках','Игрок','Слова','Гонки','Результатов пока нет. Завершите первую гонку!','Не удалось загрузить рейтинг. Попробуйте снова.','Обновить','Загрузка…','Результат не сохранён. Повторить','Рейтинг учитывает новые завершённые гонки.'],
 english:['Large screen','Small screen','Most words typed · Top 10','All languages · words in completed races','Player','Words','Races','No results yet. Finish your first race!','Could not load rankings. Please try again.','Refresh','Loading…','Score not saved. Retry saving','Rankings count newly completed races.'],
};
type Row={user_id:string;username:string;total_words?:number;races:number;best_wpm:number};
const profileCopy:Record<Language,string[]>={
 uzbek_latin:['Poygachi statistikasi','Mashina','Reyting · kuboklar','Eng yuqori tezlik','Ma’lumot topilmadi'],
 uzbek_cyrillic:['Пойгачи статистикаси','Машина','Рейтинг · кубоклар','Энг юқори тезлик','Маълумот топилмади'],
 russian:['Статистика гонщика','Автомобиль','Рейтинг · кубки','Лучшая скорость','Нет данных'],
 english:['Driver statistics','Car','Rating · trophies','Best speed','No data available'],
};
type DriverStats={equipped:string;trophies:number;words?:number};
export function DriverProfile({row,rank,language}:{row:Row;rank:number;language:Language}) {
 const [stats,setStats]=useState<DriverStats|null>(null);
 const [state,setState]=useState('loading');
 useEffect(()=>{let cancelled=false;setState('loading');setStats(null);
  void (async()=>{try{const {data,error}=await supabase.from('race_careers').select('equipped,trophies,words').eq('user_id',row.user_id).maybeSingle();if(cancelled)return;setStats(data);setState(error?'error':'ready')}catch{if(!cancelled)setState('error')}})();
  return()=>{cancelled=true};
 },[row.user_id]);
 const c=raceCopy[language],p=profileCopy[language],car=CARS.find(car=>car.id===stats?.equipped);
 return <section className="race-driver-profile" id={`driver-${row.user_id}`} aria-label={p[0]}>
  <div className="race-driver-garage">{car?<><img src={`/images/race-cars-v3/${car.id}.webp`} alt={car.name}/><strong>{car.name}</strong></>:<p role="status">{state==='loading'?c[10]:state==='error'?c[8]:p[4]}</p>}</div>
  <div className="race-driver-details"><h3>{row.username||c[4]}</h3><p>{p[0]} · #{rank}</p><dl>
   <div><dt>{p[2]}</dt><dd>{stats?Number(stats.trophies).toLocaleString():'—'}</dd></div>
   <div><dt>{c[5]}</dt><dd>{row.total_words!=null?Number(row.total_words).toLocaleString():stats?.words!=null?Number(stats.words).toLocaleString():'—'}</dd></div>
   <div><dt>{c[6]}</dt><dd>{row.races}</dd></div>
   <div><dt>{p[3]}</dt><dd>{row.best_wpm} <small>WPM</small></dd></div>
  </dl></div>
 </section>;
}
export function RaceLeaderboard({language,userId,revision}: {language:Language;userId?:string;revision:number}) {
 const [selected,setSelected]=useState<string|null>(null);
 const c=raceCopy[language]; const [rows,setRows]=useState<Row[]>([]);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const load=useCallback(async()=>{setStatus('loading');const {data,error}=await supabase.from('race_leaderboard').select('user_id,username,total_words,races,best_wpm').order('total_words',{ascending:false}).order('races',{ascending:false}).order('user_id').limit(10);if(error){setStatus('error');return}setRows(data||[]);setStatus('ready')},[]);
 useEffect(()=>{void load()},[load,revision]);
 return <aside className="race-top-ten" aria-label={c[2]}><div className="race-top-heading"><div><h2><Trophy size={20}/> {c[2]}</h2><p>{c[3]}</p></div><button type="button" aria-label={c[9]} onClick={()=>void load()} disabled={status==='loading'}><RotateCcw size={16}/></button></div>
 {status==='loading'?<p role="status">{c[10]}</p>:status==='error'?<p role="alert">{c[8]}</p>:!rows.length?<p>{c[7]}</p>:<div className="race-top-scroll"><table><thead><tr><th>#</th><th>{c[4]}</th><th>{c[5]}</th><th>{c[6]}</th><th>WPM</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.user_id} className={row.user_id===userId?'race-top-self':''}><td><span className={`race-rank-badge race-rank-${index+1}`}>{index+1}</span></td><td><button type="button" className="race-driver-link" aria-expanded={selected===row.user_id} aria-controls={`driver-${row.user_id}`} onClick={()=>setSelected(selected===row.user_id?null:row.user_id)}>{row.username||c[4]}<span aria-hidden="true"> ↗</span></button></td><td>{Number(row.total_words).toLocaleString()}</td><td>{row.races}</td><td>{row.best_wpm}</td></tr>)}</tbody></table></div>}{selected&&rows.some(row=>row.user_id===selected)?<DriverProfile key={selected} row={rows.find(row=>row.user_id===selected)!} rank={rows.findIndex(row=>row.user_id===selected)+1} language={language}/>:null}<p className="race-top-note">{c[12]}</p></aside>;
}
