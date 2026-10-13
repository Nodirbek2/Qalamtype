import {BOMB_PASSAGES} from '../data/bombPassages';
import {WORD_BANKS} from '../data/wordBanks';
import {normalize} from './arcadeRules';
import type {Difficulty,Language} from '../types';
export const BOMB_SPEEDS:Record<Difficulty,readonly [number,number]>={easy:[10,15],medium:[35,50],hard:[60,90]};
export function createBombRound(language:Language,difficulty:Difficulty,random=Math.random,recent:string[]=[]){
 const words=[...new Set(WORD_BANKS[language].easy.words||[])].filter(word=>word.length<=8);
 const pool=difficulty==='easy'?words.map((_,i)=>[0,11,29,47].map(offset=>words[(i+offset)%words.length]).join(' ')):BOMB_PASSAGES[language];
 let options=pool.filter(line=>!recent.some(old=>old===line||old.startsWith(line+' ')));
 if(options.length<3)options=[...pool];
 const lines:string[]=[];
 while(lines.length<3){const index=Math.min(options.length-1,Math.max(0,Math.floor(random()*options.length)));let line=options.splice(index,1)[0];if(difficulty==='hard'){const code=100+Math.floor(Math.max(0,Math.min(.999999,random()))*900);line+=` [#${code}] ${17+code%72}% · ${code%24}:${String(code%60).padStart(2,'0')}`;}lines.push(line);}
 const [low,high]=BOMB_SPEEDS[difficulty];const targetWpm=low+Math.floor(Math.max(0,Math.min(.999999,random()))*(high-low+1));const chars=lines.reduce((n,line)=>n+line.length,0);const seconds=Math.ceil(chars/5/targetWpm*60);return {lines,targetWpm,seconds,chars};
}
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
