import React, {useCallback, useEffect, useState} from 'react';
import {Trophy, RotateCcw} from 'lucide-react';
import {supabase} from '../lib/supabase';
import type {Language} from '../types';
export const raceCopy:Record<Language,string[]>={
 uzbek_latin:['Katta ekran','Kichik ekran','Eng ko‘p yozganlar · Top 10','Barcha tillar · jami tugatilgan poygalardagi so‘zlar','O‘yinchi','So‘zlar','Poygalar','Hali natijalar yo‘q. Birinchi poygangizni tugating!','Reytingni yuklab bo‘lmadi. Qayta urinib ko‘ring.','Yangilash','Yuklanmoqda…','Natijangiz reytingga saqlanmadi. Qayta saqlash','Reyting yangi tugatilgan poygalardan hisoblanadi.'],
 uzbek_cyrillic:['Катта экран','Кичик экран','Энг кўп ёзганлар · Top 10','Барча тиллар · тугатилган пойгалардаги сўзлар','Ўйинчи','Сўзлар','Пойгалар','Ҳали натижалар йўқ. Биринчи пойгангизни тугатинг!','Рейтингни юклаб бўлмади. Қайта урининг.','Янгилаш','Юкланмоқда…','Натижа сақланмади. Қайта сақлаш','Рейтинг янги тугатилган пойгалардан ҳисобланади.'],
 russian:['Большой экран','Маленький экран','Больше всего слов · Топ 10','Все языки · слова в завершённых гонках','Игрок','Слова','Гонки','Результатов пока нет. Завершите первую гонку!','Не удалось загрузить рейтинг. Попробуйте снова.','Обновить','Загрузка…','Результат не сохранён. Повторить','Рейтинг учитывает новые завершённые гонки.'],
 english:['Large screen','Small screen','Most words typed · Top 10','All languages · words in completed races','Player','Words','Races','No results yet. Finish your first race!','Could not load rankings. Please try again.','Refresh','Loading…','Score not saved. Retry saving','Rankings count newly completed races.'],
};
type Row={user_id:string;username:string;total_words:number;races:number;best_wpm:number};
export function RaceLeaderboard({language,userId,revision}: {language:Language;userId?:string;revision:number}) {
 const c=raceCopy[language]; const [rows,setRows]=useState<Row[]>([]);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const load=useCallback(async()=>{setStatus('loading');const {data,error}=await supabase.from('race_leaderboard').select('user_id,username,total_words,races,best_wpm').order('total_words',{ascending:false}).order('races',{ascending:false}).order('user_id').limit(10);if(error){setStatus('error');return}setRows(data||[]);setStatus('ready')},[]);
 useEffect(()=>{void load()},[load,revision]);
 return <aside className="race-top-ten" aria-label={c[2]}><div className="race-top-heading"><div><h2><Trophy size={20}/> {c[2]}</h2><p>{c[3]}</p></div><button type="button" aria-label={c[9]} onClick={()=>void load()} disabled={status==='loading'}><RotateCcw size={16}/></button></div>
 {status==='loading'?<p role="status">{c[10]}</p>:status==='error'?<p role="alert">{c[8]}</p>:!rows.length?<p>{c[7]}</p>:<div className="race-top-scroll"><table><thead><tr><th>#</th><th>{c[4]}</th><th>{c[5]}</th><th>{c[6]}</th><th>WPM</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.user_id} className={row.user_id===userId?'race-top-self':''}><td>{index+1}</td><td>{row.username||c[4]}</td><td>{Number(row.total_words).toLocaleString()}</td><td>{row.races}</td><td>{row.best_wpm}</td></tr>)}</tbody></table></div>}<p className="race-top-note">{c[12]}</p></aside>;
}
