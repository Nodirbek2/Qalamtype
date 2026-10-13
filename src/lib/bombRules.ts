import {normalize} from './arcadeRules';
import type {Difficulty,Language} from '../types';
export const BOMB_SPEEDS:Record<Difficulty,readonly [number,number]>={easy:[10,15],medium:[35,50],hard:[60,90]};
const BANK:Record<Language,Record<Difficulty,string[]>>={
 uzbek_latin:{easy:['salom yangi kun','men tez yozaman','osmon moviy rang','kitob bilim beradi','bugun havo yaxshi','biz birga mashq qilamiz'],medium:['Yashil chiroq yondi. Keyingi signalni kuting.','Har bir harfni aniq yozing va ritmni saqlang.','Shoshilmang, diqqatingizni matnga qarating.','Yangi bosqich bizni oldinda kutmoqda.'],hard:['Signal #7: tizim 2026-yil, soat 09:45 da tekshirildi.','Aniqlik, barqarorlik va diqqat — g‘alabaning kaliti!','Xabar: “Keyingi bosqichga o‘ting!” Kod: 48-72.','Natija 98% bo‘lsin; har bir belgi to‘g‘ri yozilsin.']},
 uzbek_cyrillic:{easy:['салом янги кун','мен тез ёзаман','осмон мовий ранг','китоб билим беради','бугун ҳаво яхши','биз бирга машқ қиламиз'],medium:['Яшил чироқ ёнди. Кейинги сигнални кутинг.','Ҳар бир ҳарфни аниқ ёзинг ва ритмни сақланг.','Шошилманг, диққатингизни матнга қаратинг.','Янги босқич бизни олдинда кутмоқда.'],hard:['Сигнал #7: тизим 2026-йил, соат 09:45 да текширилди.','Аниқлик, барқарорлик ва диққат — ғалабанинг калити!','Хабар: «Кейинги босқичга ўтинг!» Код: 48-72.','Натижа 98% бўлсин; ҳар бир белги тўғри ёзилсин.']},
 english:{easy:['hello new day','the sky is blue','we learn to type','a book brings ideas','today is a good day','we practice together'],medium:['The green light is on. Wait for the next signal.','Type every letter carefully and keep a steady rhythm.','Focus on the text and keep your hands relaxed.','A new challenge is waiting just ahead.'],hard:['Signal #7: system checked on 2026-10-13 at 09:45.','Accuracy, consistency and focus are the keys to success!','Message: "Proceed to the next stage!" Code: 48-72.','Aim for 98% accuracy; type every symbol correctly.']},
 russian:{easy:['привет новый день','небо голубого цвета','мы учимся печатать','книга даёт знания','сегодня хорошая погода','мы тренируемся вместе'],medium:['Зелёный свет включён. Ждите следующего сигнала.','Печатайте каждую букву точно и сохраняйте ритм.','Сосредоточьтесь на тексте и расслабьте руки.','Новый этап ждёт нас впереди.'],hard:['Сигнал #7: система проверена 13.10.2026 в 09:45.','Точность, стабильность и внимание — ключи к победе!','Сообщение: «Перейдите дальше!» Код: 48-72.','Цель — 98% точности; вводите каждый символ верно.']}
};
export function createBombRound(language:Language,difficulty:Difficulty,random= Math.random){const options=[...BANK[language][difficulty]];const lines:string[]=[];while(lines.length<3){const index=Math.min(options.length-1,Math.max(0,Math.floor(random()*options.length)));lines.push(options.splice(index,1)[0]);}const [low,high]=BOMB_SPEEDS[difficulty];const targetWpm=low+Math.floor(Math.max(0,Math.min(.999999,random()))*(high-low+1));const chars=lines.reduce((n,line)=>n+line.length,0);const seconds=Math.ceil(chars/5/targetWpm*60);return {lines,targetWpm,seconds,chars};}
export type BombState={phase:'ready'|'playing'|'won'|'lost';lines:string[];index:number;input:string;seconds:number;deadline:number;started:number;ended:number;now:number;mistakes:number;targetWpm:number};
export const initialBomb:BombState={phase:'ready',lines:[],index:0,input:'',seconds:0,deadline:0,started:0,ended:0,now:0,mistakes:0,targetWpm:0};
export type BombAction={type:'start';now:number;round:ReturnType<typeof createBombRound>}|{type:'tick';now:number}|{type:'input';now:number;value:string}|{type:'reset'};
export function bombReducer(s:BombState,a:BombAction):BombState{
 if(a.type==='reset')return initialBomb;
 if(a.type==='start')return {...initialBomb,...a.round,phase:'playing',started:a.now,deadline:a.now+a.round.seconds*1000,now:a.now};
 if(s.phase!=='playing')return s;
 if(a.now>=s.deadline)return {...s,phase:'lost',now:a.now,ended:s.deadline};
 if(a.type==='tick')return {...s,now:a.now};
 const value=a.value.slice(0,s.lines[s.index].length+8);const target=s.lines[s.index];const added=value.length>s.input.length;const mistakes=s.mistakes+(added&&normalize(value[value.length-1])!==normalize(target[value.length-1]||'')?1:0);
 if(normalize(value)===normalize(target)){if(s.index===s.lines.length-1)return {...s,input:value,mistakes,phase:'won',now:a.now,ended:a.now};return {...s,index:s.index+1,input:'',mistakes,now:a.now};}
 return {...s,input:value,mistakes,now:a.now};
}
