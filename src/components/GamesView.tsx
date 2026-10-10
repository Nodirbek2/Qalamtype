import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swords, Flag, Users, Bot, RotateCcw, Wifi, WifiOff, Trophy, Zap } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { authText } from '../data/authI18n';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

import { normalize, correctPrefix, initialBattle, battleReducer } from '../lib/arcadeRules';
import { gameText, GameKey } from '../data/gameI18n';
import { useArcadeRecords } from '../hooks/useArcadeRecords';
import { supabase } from '../lib/supabase';

type GameMode = 'race' | 'boss';
type RacePhase = 'ready' | 'matching' | 'countdown' | 'racing' | 'finished';
type Player = { id: string; name: string; progress: number; wpm: number; isBot?: boolean; finishedAt?: number };
type PresencePlayer = { id: string; name: string; joinedAt: number };
type StartPayload = { text: string; startsAt: number; roomId: string };


const PASSAGES = {
  uzbek_latin: ["Bog‘ ustida rangli varrak uchmoqda. Bolalar daryo bo‘yidagi yo‘lakdan yugurib o‘tishdi. Iliq kun quvonchli xotiralarga boy bo‘ldi.", "Kutubxona ertalab ochiladi. Men uzoq sayyoralar haqida kitob tanladim. Har bir sahifa menga yangi bilim berdi.", "Tongda shahar ko'chalari quyosh nuriga to'ldi. Biz yangi yo'llarni kashf etish uchun sayohatga chiqdik. Oldinda bizni go'zal manzaralar kutmoqda.", "Tog'lar orasidan keng yo'l o'tadi. Yengil shamol daraxt barglarini asta silkitadi. Har bir burilish bizni yangi manzilga yaqinlashtiradi."],
  uzbek_cyrillic: ["Боғ устида рангли варрак учмоқда. Болалар дарё бўйидаги йўлакдан югуриб ўтишди. Илиқ кун қувончли хотираларга бой бўлди.", "Кутубхона эрталаб очилади. Мен узоқ сайёралар ҳақида китоб танладим. Ҳар бир саҳифа менга янги билим берди.", "Тонгда шаҳар кўчалари қуёш нурига тўлди. Биз янги йўлларни кашф этиш учун саёҳатга чиқдик. Олдинда бизни гўзал манзаралар кутмоқда."],
  english: ["A bright kite rises above the park. Children run along the path beside the river. The warm afternoon is full of laughter.", "The library opens early in the morning. I choose a book about distant planets. Each page reveals something new about the universe.", "The sun rises over the quiet city. We follow the winding road toward the mountains. Every turn brings us closer to a new adventure.", "The lights turn green and the engines roar. Keep your eyes on the road and find your rhythm. A steady pace will take you to the finish."],
  russian: ["Над парком взлетает яркий воздушный змей. Дети бегут по дорожке вдоль реки. Тёплый день наполнен смехом.", "Библиотека открывается рано утром. Я выбираю книгу о далёких планетах. Каждая страница открывает что-то новое.", "Солнце поднимается над тихим городом. Мы едем по извилистой дороге к горам. Каждый поворот приближает нас к новому приключению."],
};
function RaceCar({ color, number }: { color: string; number: number }) {
  return <svg viewBox="0 0 160 66" aria-hidden="true" style={{width:'100%',filter:'drop-shadow(0 9px 5px #0009)'}}>
    <ellipse cx="79" cy="56" rx="68" ry="5" fill="#0007" />
    <path d="M10 40 L22 27 L48 23 L66 8 Q92 3 112 23 L140 29 L154 42 L151 51 L10 51 Z" fill={color} stroke="#ffffff55" strokeWidth="1.5"/>
    <path d="M54 23 L70 12 L87 11 L88 24 Z M93 11 L105 16 L113 25 L95 24 Z" fill="#112c3c" stroke="#91d9e8"/>
    <path d="M20 32 L140 34 M51 28 L119 29" stroke="#ffffff88" strokeWidth="2"/>
    <path d="M6 27 H30 V31 H9 Z" fill="#17212a"/><path d="M138 36 L152 40 L150 44 L137 42 Z" fill="#fff8c9"/>
    <path d="M15 36 H24 V42 H12" fill="#ff4545"/>
    <rect x="72" y="31" width="25" height="15" rx="3" fill="#fff"/><text x="84" y="42" textAnchor="middle" fill="#111" fontSize="11" fontWeight="900">{number}</text>
    {[37,125].map(x=><g key={x}><circle cx={x} cy="49" r="13" fill="#101015" stroke="#343440" strokeWidth="3"/><circle cx={x} cy="49" r="8" fill="#94a3b8"/><circle cx={x} cy="49" r="4" fill="#252530"/><path d={'M'+(x-6)+' 49h12 M'+x+' 43v12'} stroke="#e2e8f0" strokeWidth="2"/></g>)}
  </svg>;
}

const BOT_NAMES = ['Azizbek', 'Madina', 'Jasur', 'Shahnoza', 'Bekzod', 'Malika', 'Sardor', 'Nilufar', 'Diyor', 'Zuhra', 'Oybek', 'Sevara'];
const clientId = () => { try{return crypto.randomUUID()}catch{return Math.random().toString(36).slice(2)} };
const CLIENT_ID = clientId();
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function WordBoss({language, difficulty, onResult, onBusy}: {language:keyof typeof PASSAGES; difficulty: 'easy'|'medium'|'hard'; onResult: ReturnType<typeof useArcadeRecords>['save']; onBusy:(busy:boolean)=>void}) {
  const {siteLanguage}=useSettings();
  const g = (key:GameKey,vars:Record<string,string|number>={})=>gameText(siteLanguage,key,vars);
  const interval={easy:12000,medium:8000,hard:6000}[difficulty];
  const saved=useRef(false);
  const [battle,dispatch]=React.useReducer(battleReducer,initialBattle);
  const [words,setWords]=useState<string[]>([]);
  const [input,setInput]=useState('');
  const entry=useRef<HTMLInputElement>(null);
  const wave=Math.min(2,Math.floor(battle.hits/6));
  const names=[g('boss1'),g('boss2'),g('boss3')];
  const hp=battle.status==='won'?0:100-(battle.hits%6)/6*100;
  const remaining=Math.max(0,interval/1000-((battle.now-battle.started)/1000)%(interval/1000));
  const active=battle.status==='playing' && !battle.paused;
  useEffect(()=>{if(!active)return; const id=window.setInterval(()=>dispatch({type:'tick',now:Date.now()}),100);return()=>window.clearInterval(id)},[active]);
  useEffect(()=>{if(active)entry.current?.focus()},[active]);
  useEffect(()=>{onBusy(battle.status==='playing');return()=>onBusy(false)},[battle.status,onBusy]);
  useEffect(()=>{
    if(battle.status!=='won' && battle.status!=='lost')return;
    if(saved.current)return;
    saved.current=true;onResult({kind:'boss',won:battle.status==='won',combo:battle.best});
  },[battle.status,battle.best,onResult]);
  useEffect(()=>{const hide=()=>{if(document.hidden)dispatch({type:'pause',now:Date.now()})};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[]);
  const start=()=>{
    saved.current=false;
    const bank=PASSAGES[language]||PASSAGES.uzbek_latin;
    const pool=bank[Math.floor(Math.random()*bank.length)].replace(/[.,!?]/g,'').split(/\s+/).filter(Boolean);
    const offset=Math.floor(Math.random()*pool.length);
    setWords(Array.from({length:18},(_,i)=>pool[(offset+i)%pool.length]));setInput('');dispatch({type:'start',now:Date.now(),interval});
  };
  const attack=(value:string)=>{
    if(!active || !value.trim())return;
    if(normalize(value.trim()).toLocaleLowerCase()===normalize(words[battle.hits]).toLocaleLowerCase()) {dispatch({type:'hit',now:Date.now()});setInput('')}
    else dispatch({type:'miss',now:Date.now()});
  };
  const seconds=Math.round(((battle.ended||battle.now)-battle.started)/1000);
  return <div className="wb-shell">
    <style>{`
      .wb-shell{background:#101021;border:1px solid #52416d;border-radius:22px;padding:22px;color:#eee8ff}.wb-top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font:12px monospace;color:#c6b7e3}.wb-top b{color:#bfa0ff}.wb-meter{height:9px;background:#ffffff12;border-radius:8px;overflow:hidden;margin:8px 0 16px}.wb-meter i{display:block;height:100%;background:linear-gradient(90deg,#e95588,#b079ef);transition:width .35s}.wb-arena{height:270px;border-radius:16px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 70% 25%,#493365,transparent 60%),linear-gradient(#141327,#252035);border-bottom:7px solid #554661}
      .wb-moon{position:absolute;top:22px;right:22%;width:65px;height:65px;border-radius:50%;background:#dccbfa;box-shadow:0 0 70px #bc82fa77}.wb-floor{position:absolute;bottom:0;width:100%;height:50px;background:repeating-linear-gradient(100deg,#342f43 0 40px,#494050 41px 44px);transform:perspective(90px) rotateX(25deg)}
      .wb-hero{position:absolute;left:8%;bottom:25px;width:85px;filter:drop-shadow(0 0 18px #64dddc88)}.wb-monster{position:absolute;right:7%;bottom:20px;width:155px;filter:drop-shadow(0 0 20px #b964d466);animation:wb-float 2s ease-in-out infinite alternate}.wb-monster.wb-defeated{transform:rotate(18deg) scale(.7);opacity:.25;animation:none;transition:all .7s}
      .wb-bolt{position:absolute;left:20%;bottom:85px;width:60px;height:12px;background:#caffff;box-shadow:0 0 30px #67f9ff;border-radius:50%;animation:wb-bolt .5s ease-out forwards}.wb-bolt.wb-enemy{left:auto;right:20%;background:#ff8aa6;box-shadow:0 0 30px #ff4266;animation:wb-enemy .5s ease-out forwards}.wb-damage{position:absolute;right:16%;top:60px;font:bold 23px monospace;color:#ffdeb0;animation:wb-number .7s forwards}.wb-shield{position:absolute;left:5%;bottom:18px;width:115px;height:130px;border:3px solid #76f3d6;border-radius:50%;animation:wb-number .7s forwards}.wb-instructions{font-size:13px;color:#bcb2ca;line-height:1.7;margin:16px 0}.wb-entry{width:100%;background:#090b16;border:1px solid #72618f;border-radius:12px;padding:14px;color:white;outline:none}.wb-entry:focus{border-color:#a994ff;box-shadow:0 0 0 3px #a994ff22}.wb-word{text-align:center;font:bold 30px monospace;letter-spacing:1px;margin:16px 0 8px;color:#e5daff;overflow-wrap:anywhere}.wb-button{border:0;border-radius:12px;background:#b59aff;color:#18102c;padding:12px 24px;font-weight:bold;cursor:pointer}.wb-stats{display:flex;flex-wrap:wrap;gap:18px;font:12px monospace;color:#cfc1e8;margin-top:16px}.wb-result{text-align:center;padding:22px 8px}.wb-result h2{font-size:25px;font-weight:bold;margin-bottom:8px}
      @keyframes wb-float{to{transform:translateY(-7px)}}@keyframes wb-bolt{to{left:78%;opacity:0;transform:scale(1.8)}}@keyframes wb-enemy{to{right:78%;opacity:0;transform:scale(1.8)}}@keyframes wb-number{to{transform:translateY(-32px);opacity:0}}
      @media(max-width:500px){.wb-shell{padding:14px}.wb-arena{height:235px}.wb-monster{width:125px;right:4%}.wb-hero{left:4%;width:70px}.wb-top{font-size:10px}.wb-word{font-size:25px}}
      @media(prefers-reduced-motion:reduce){.wb-monster,.wb-bolt,.wb-damage,.wb-shield{animation:none}.wb-meter i{transition:none}}
    `}</style>
    <div className="wb-top"><span>{g('boss')} · {g('stage',{wave:wave+1})}</span><b>{names[wave]}</b></div>
    <div className="wb-meter" role="progressbar" aria-label={g('bossHealth')} aria-valuenow={Math.round(hp)} aria-valuemin={0} aria-valuemax={100}><i style={{width:hp+'%'}}/></div>
    <div className="wb-arena" aria-label={g('arena')}>
      <div className="wb-moon"/><div className="wb-floor"/>
      <svg className="wb-hero" viewBox="0 0 100 155" aria-label={g('wizard')} role="img"><path d="M15 145L36 67H65L88 145Z" fill="#3aa9ad"/><path d="M36 70L50 140L65 70" fill="#123c68"/><circle cx="51" cy="49" r="19" fill="#f3c6a0"/><path d="M15 40L55 0L75 40Z" fill="#56cfcc"/><path d="M12 41H88" stroke="#b6fff0" strokeWidth="6"/><path d="M67 85L86 75" stroke="#f3c6a0" strokeWidth="10"/><path d="M88 130V33" stroke="#b49d67" strokeWidth="5"/><circle cx="88" cy="25" r="10" fill="#9fffff"/></svg>
      <svg className={'wb-monster '+(battle.status==='won'?'wb-defeated':'')} viewBox="0 0 180 190" aria-label={names[wave]} role="img"><path d="M35 65L9 8L65 40M115 40L170 8L147 70" fill="#dcc4a4"/><path d="M25 80Q15 35 90 30Q165 35 158 83L172 165L126 151L110 185L80 159L44 181L36 145L8 157Z" fill={['#7855a7','#547d9f','#ae4678'][wave]}/><path d="M38 81L72 91L60 105L34 93M140 81L104 91L118 105L146 93" fill="#ffdf7a"/><path d="M57 128L90 146L126 126" fill="none" stroke="#29122e" strokeWidth="10"/><path d="M68 128L73 145L85 135M102 134L114 144L118 125" fill="#fff0cf"/></svg>
      {battle.serial>0 && battle.effect!=='miss' && <React.Fragment key={battle.serial}><div className={'wb-bolt '+(battle.effect==='hurt'?'wb-enemy':'')}/>{battle.effect!=='hurt' && <div className="wb-damage">{battle.effect==='shield'?g('shield'):g('hit')}</div>}{battle.effect==='shield' && <div className="wb-shield"/>}</React.Fragment>}
    </div>
    <div className="wb-top" style={{marginTop:16}}><span>{g('yourHealth')} · {battle.health}/100</span><span>{active?g('nextAttack',{seconds:remaining.toFixed(1)}):g('bossInfo')}</span></div>
    <div className="wb-meter" role="progressbar" aria-label={g('yourHealth')} aria-valuenow={battle.health} aria-valuemin={0} aria-valuemax={100}><i style={{width:battle.health+'%',background:'#52cbb3'}}/></div>
    {battle.status==='ready' ? <div className="wb-result"><h2>{g('fightWords')}</h2><p className="wb-instructions">{g('bossRules',{interval:interval/1000})}</p><button className="wb-button" onClick={start}>{g('startBattle')}</button></div> : battle.paused ? <div className="wb-result" role="status"><h2>{g('paused')}</h2><button className="wb-button" onClick={()=>dispatch({type:'resume',now:Date.now()})}>{g('resume')}</button></div> : active ? <>
      <button className="wb-button" onClick={()=>dispatch({type:'pause',now:Date.now()})}>{g('pause')}</button>
      <div className="wb-word">{words[battle.hits]}</div><p style={{textAlign:'center',fontSize:12,color:'#b3a5c7',marginBottom:12}}>{g('attackHint')}</p>
      <p role="status" aria-live="polite" style={{minHeight:20,color:'#f6b5b5'}}>{battle.effect==='miss'?g('wrongWord'):''}</p>
      <form onSubmit={e=>{e.preventDefault();attack(input)}}><input ref={entry} className="wb-entry" value={input} aria-label={g('attackInput')} onChange={e=>{const value=e.target.value;if(/\s$/.test(value)){setInput(value.trim());attack(value)}else setInput(value)}} onPaste={e=>e.preventDefault()} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}/><button className="wb-button" type="submit" style={{marginTop:12}}>{g('attack')}</button></form>
      <div className="wb-stats"><span>{g('hits',{hits:battle.hits})}</span><span>{g('combo',{combo:battle.combo})}</span><span>{g('time',{seconds})}</span></div>
    </> : <div className="wb-result" role="status"><h2>{battle.status==='won'?g('wonBattle'):g('lostBattle')}</h2><p className="wb-instructions">{g('battleResult',{hits:battle.hits,best:battle.best,mistakes:battle.mistakes,seconds})}</p><button className="wb-button" onClick={start}>{g('again')}</button></div>}
  </div>;
}

export const GamesView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [signupOpen,setSignupOpen]=useState(false);
  const closeSignup=useCallback(()=>setSignupOpen(false),[]);
  const { typingLanguage, setTypingLanguage, siteLanguage } = useSettings();
  const g = (key: GameKey, vars: Record<string,string|number> = {}) => gameText(siteLanguage,key,vars);
  const [difficulty,setDifficulty]=useState<'easy'|'medium'|'hard'>('medium');
  const [bossBusy,setBossBusy]=useState(false);
  const {records,save}=useArcadeRecords(typingLanguage+'.'+difficulty, currentUser?.id);
  const [paused,setPaused]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [timedOut,setTimedOut]=useState(false);
  const [accuracy,setAccuracy]=useState(100);
  const pausedRef=useRef(false);
  const pausedAt=useRef(0);
  const finishedRef=useRef(false);
  const attempts=useRef({total:0,wrong:0});
  const generation=useRef(0);
  const playerState=useRef<Player[]>([]);
  const [bossSession, setBossSession] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('race');
  const [phase, setPhase] = useState<RacePhase>('ready');
  const [online, setOnline] = useState(false);
  const [raceText, setRaceText] = useState('');
  const [typed, setTyped] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState<GameKey | ''>('');
  const lobbyRef = useRef<any>(null);
  const raceRef = useRef<any>(null);
  const startedAtRef = useRef(0);
  const botTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const handshakeTimerRef=useRef<number|null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const playerName = userProfile?.username || 'Mehmon';
  playerState.current=players;
  const wordCount = useMemo(() => raceText.trim() ? raceText.trim().split(/\s+/).length : 0, [raceText]);
  const typedWords = useMemo(() => typed.trim().split(/\s+/).filter(Boolean).length, [typed]);
  const validChars = correctPrefix(typed, raceText);
  const progress = raceText ? clamp(validChars / raceText.length * 100) : 0;
  const wpm = startedAtRef.current && typed.length
    ? Math.round((validChars / 5) / (Math.max(1, (pausedRef.current ? pausedAt.current : Date.now()) - startedAtRef.current) / 60000))
    : 0;

  const liveStatsRef = useRef({ progress, wpm });
  liveStatsRef.current = { progress, wpm };

  const clearTimers = useCallback(() => {
    [botTimerRef, startTimerRef, matchTimerRef, handshakeTimerRef].forEach((ref) => {
      if (ref.current !== null) window.clearInterval(ref.current);
      ref.current = null;
    });
  }, []);

  const cleanupChannels = useCallback(async () => {
    generation.current+=1;
    clearTimers();
    const channels = [raceRef.current, lobbyRef.current].filter(Boolean);
    raceRef.current = null;
    lobbyRef.current = null;
    await Promise.all(channels.map((channel) => supabase.removeChannel(channel).catch(() => undefined)));
  }, [clearTimers]);

  useEffect(() => () => { void cleanupChannels(); }, [cleanupChannels]);

  const makeText = useCallback(() => { const bank = PASSAGES[typingLanguage] || PASSAGES.uzbek_latin; return bank[Math.floor(Math.random() * bank.length)]; }, [typingLanguage]);

  const finishRound = useCallback((finishTime = Date.now(), finalWpm = wpm) => {
    if(finishedRef.current)return;
    finishedRef.current=true;
    setElapsed(Math.max(0,(finishTime-startedAtRef.current)/1000));
    save({kind:'race',won:!playerState.current.some(p=>p.id!==CLIENT_ID && p.finishedAt && p.finishedAt<=finishTime),wpm:finalWpm});
    setPhase('finished');
    setPlayers((current) => current.map((player) =>
      player.id === CLIENT_ID ? { ...player, progress: 100, wpm: finalWpm, finishedAt: finishTime } : player
    ));
    if (raceRef.current && online) {
      raceRef.current.send({ type: 'broadcast', event: 'race-finish', payload: { id: CLIENT_ID, progress: 100, wpm: finalWpm, finishedAt: finishTime } });
    }
  }, [online, wpm, save]);

  const beginCountdown = useCallback((text: string, participants: Player[], startAt = Date.now() + 4000) => {
    finishedRef.current=false;
    pausedRef.current=false;setPaused(false);setElapsed(0);setTimedOut(false);setAccuracy(100);
    attempts.current={total:0,wrong:0};
    startedAtRef.current = 0;
    setRaceText(text);
    setTyped('');
    setPlayers(participants);
    setPhase('countdown');
    clearTimers();
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((startAt - Date.now()) / 1000));
      setCountdown(seconds);
      if (seconds <= 0) {
        clearTimers();
        startedAtRef.current = startAt;
        setPhase('racing');
      }
    };
    startTimerRef.current = window.setInterval(tick, 150);
    tick();
  }, [clearTimers]);

  const startSolo = useCallback((mode: GameMode = gameMode) => {
    void cleanupChannels();
    setOnline(false);setMessage('');
    setGameMode(mode);
    const text = makeText();
    const botStart = Math.floor(Math.random() * (BOT_NAMES.length - 2));
    const bots = BOT_NAMES.slice(botStart, botStart + 3);
    const opponents = bots.slice(0, 3).map((name, i) => ({
      id: 'bot-' + i, name, progress: 0, wpm: 0, isBot: true,
    }));
    beginCountdown(text, [{ id: CLIENT_ID, name: playerName, progress: 0, wpm: 0 }, ...opponents]);
  }, [beginCountdown, cleanupChannels, gameMode, makeText, playerName]);

  const startOnline = useCallback(async () => {
    setPhase('matching');
    const cleaning=cleanupChannels();
    const token=generation.current;
    await cleaning;
    if(generation.current!==token)return;
    const valid=()=>generation.current===token;
    setOnline(true);setPhase('matching');setTyped('');setMessage('searching');
    const lobby=supabase.channel(`qalamtype-race-lobby-v2:${typingLanguage}:${difficulty}`,{config:{presence:{key:CLIENT_ID},broadcast:{self:false}}});
    lobbyRef.current=lobby;
    const me={id:CLIENT_ID,name:playerName,joinedAt:Date.now()};
    let pending: {peer:PresencePlayer;roomId:string;host:boolean}|null=null;
    let started=false;
    let startPayload:StartPayload|null=null;
    let guestReady=false;
    let roomSubscribed=false;
    const fallback=(reason:GameKey='fallback')=>{
      if(!valid() || started)return;
      void cleanupChannels();setOnline(false);
      beginCountdown(makeText(),[{id:CLIENT_ID,name:playerName,progress:0,wpm:0},...BOT_NAMES.slice(0,3).map((name,i)=>({id:'bot-'+i,name,progress:0,wpm:0,isBot:true}))]);
      setMessage(reason);
    };
    const acceptStart=(payload:StartPayload)=>{
      if(!valid() || !pending || payload.roomId!==pending.roomId || typeof payload.text!=='string' || !payload.text.length || payload.text.length>1500 || !Number.isFinite(payload.startsAt) || Math.abs(payload.startsAt-Date.now())>15000)return;
      if(started)return;
      started=true;
      void lobby.untrack();
      beginCountdown(payload.text,[{id:CLIENT_ID,name:playerName,progress:0,wpm:0},{id:pending.peer.id,name:pending.peer.name,progress:0,wpm:0},{id:'bot-fill-1',name:BOT_NAMES[7],progress:0,wpm:0,isBot:true},{id:'bot-fill-2',name:BOT_NAMES[8],progress:0,wpm:0,isBot:true}],payload.startsAt);
    };
    const joinRoom=()=>{
      if(!pending || raceRef.current || !valid())return;
      const match=pending;
      setMessage('found');
      const race=supabase.channel('qalamtype-race-v2-'+match.roomId,{config:{broadcast:{self:false}}});
      raceRef.current=race;
      const send=(event:string,payload:unknown)=>{if(valid())void race.send({type:'broadcast',event,payload})};
      race.on('broadcast',{event:'ready'},({payload})=>{
        if(!valid() || !match.host || payload?.id!==match.peer.id)return;
        guestReady=true;
      });
      race.on('broadcast',{event:'race-start'},({payload})=>{
        if(match.host || !valid() || payload?.roomId!==match.roomId)return;
        send('start-ack',{id:CLIENT_ID,roomId:match.roomId});acceptStart(payload);
      });
      race.on('broadcast',{event:'start-ack'},({payload})=>{
        if(match.host && payload?.id===match.peer.id && payload?.roomId===match.roomId && startPayload)acceptStart(startPayload);
      });
      const receiveProgress=(payload:any,finish=false)=>{
        if(!valid() || !started || payload?.id!==match.peer.id || !Number.isFinite(payload.wpm) || !Number.isFinite(payload.progress))return;
        setPlayers(current=>current.map(p=>p.id===match.peer.id?{...p,progress:finish?100:clamp(payload.progress),wpm:clamp(payload.wpm,0,500),finishedAt:finish?Date.now():p.finishedAt}:p));
      };
      race.on('broadcast',{event:'race-progress'},({payload})=>receiveProgress(payload));
      race.on('broadcast',{event:'race-finish'},({payload})=>receiveProgress(payload,true));
      race.subscribe(status=>{
        if(!valid())return;
        if(status==='SUBSCRIBED'){roomSubscribed=true;if(!match.host)send('ready',{id:CLIENT_ID})}
        if(status==='CHANNEL_ERROR' || status==='TIMED_OUT')fallback('connectionFallback');
      });
    };
    const queue=()=>{
      const entries=Object.values(lobby.presenceState<PresencePlayer>()).flat().filter(p=>typeof p.id==='string' && typeof p.name==='string' && Number.isFinite(p.joinedAt));
      return [...new Map(entries.map(p=>[p.id,p])).values()].sort((a,b)=>a.joinedAt-b.joinedAt||a.id.localeCompare(b.id));
    };
    const offer=()=>{
      if(!valid() || started || pending)return;
      const people=queue(), index=people.findIndex(p=>p.id===CLIENT_ID);
      if(index<0 || index%2 || !people[index+1])return;
      pending={peer:people[index+1],roomId:CLIENT_ID+'-'+Date.now(),host:true};
    };
    lobby.on('presence',{event:'sync'},offer);
    lobby.on('broadcast',{event:'offer'},({payload})=>{
      if(!valid() || pending || payload?.to!==CLIENT_ID || typeof payload.roomId!=='string' || payload.roomId.length>160)return;
      const peer=queue().find(p=>p.id===payload.from);
      if(!peer)return;
      pending={peer,roomId:payload.roomId,host:false};joinRoom();
      void lobby.send({type:'broadcast',event:'accept',payload:{from:CLIENT_ID,to:peer.id,roomId:pending.roomId}});
    });
    lobby.on('broadcast',{event:'accept'},({payload})=>{
      if(!valid() || !pending?.host || payload?.from!==pending.peer.id || payload?.to!==CLIENT_ID || payload?.roomId!==pending.roomId)return;
      joinRoom();
    });
    lobby.subscribe(status=>{
      if(!valid())return;
      if(status==='SUBSCRIBED')void lobby.track(me);
      if(status==='CHANNEL_ERROR' || status==='TIMED_OUT')fallback('connectionFallback');
    });
    handshakeTimerRef.current=window.setInterval(()=>{
      if(!valid() || started)return;
      offer();
      if(!pending)return;
      if(!raceRef.current && pending.host)void lobby.send({type:'broadcast',event:'offer',payload:{from:CLIENT_ID,to:pending.peer.id,roomId:pending.roomId}});
      if(raceRef.current && !pending.host){
        void lobby.send({type:'broadcast',event:'accept',payload:{from:CLIENT_ID,to:pending.peer.id,roomId:pending.roomId}});
        if(roomSubscribed)void raceRef.current.send({type:'broadcast',event:'ready',payload:{id:CLIENT_ID}});
      }
      if(raceRef.current && pending.host && guestReady && roomSubscribed){
        if(!startPayload)startPayload={text:makeText(),startsAt:Date.now()+5000,roomId:pending.roomId};
        void raceRef.current.send({type:'broadcast',event:'race-start',payload:startPayload});
      }
    },400);
    // A missing acknowledgement or a stalled connection must never strand a player.
    matchTimerRef.current=window.setTimeout(()=>fallback(),12000);
  },[beginCountdown,cleanupChannels,makeText,playerName,typingLanguage,difficulty]);

  const pauseRace=useCallback(()=>{
    if(online || phase!=='racing' || pausedRef.current)return;
    pausedRef.current=true;pausedAt.current=Date.now();setPaused(true);
  },[online,phase]);
  const resumeRace=()=>{if(!pausedRef.current)return;startedAtRef.current+=Date.now()-pausedAt.current;pausedRef.current=false;setPaused(false)};
  useEffect(()=>{const hide=()=>{if(document.hidden)pauseRace()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[pauseRace]);
  useEffect(()=>{
    if(phase!=='racing')return;
    const id=window.setInterval(()=>{
      if(pausedRef.current || finishedRef.current)return;
      const seconds=(Date.now()-startedAtRef.current)/1000;setElapsed(seconds);
      if(seconds>=120){finishedRef.current=true;setTimedOut(true);setPhase('finished')}
    },100);
    return()=>window.clearInterval(id);
  },[phase]);
  useEffect(() => {
    if (phase !== 'racing') return;
    const progressTimer = window.setInterval(() => {
      if (raceRef.current && online) {
        const stats = liveStatsRef.current;
        raceRef.current.send({ type: 'broadcast', event: 'race-progress', payload: { id: CLIENT_ID, name: playerName, ...stats } });
      }
    }, 300);
    const botTimer = window.setInterval(() => {
      if(pausedRef.current)return;
      setPlayers((current) => current.map((player) => {
        if (!player.isBot || player.progress >= 100) return player;
        const seed=Array.from(player.id+raceText).reduce((v,c)=>v+c.charCodeAt(0),0);
        const range={easy:[25,40],medium:[40,60],hard:[65,85]}[difficulty];
        const botWpm = player.wpm || range[0]+seed%(range[1]-range[0]+1);
        const advance = raceText.length ? (botWpm * 5 * 0.42 / 60 / raceText.length) * 100 : 0;
        return { ...player, progress: Math.min(100, player.progress + advance), wpm: botWpm, finishedAt: player.progress + advance >= 100 ? Date.now() : undefined };
      }));
    }, 420);
    botTimerRef.current = botTimer;
    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(botTimer);
      botTimerRef.current = null;
    };
  }, [phase, online, playerName, raceText, difficulty]);

  const onType = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(pausedRef.current || finishedRef.current || phase!=='racing')return;
    const value = event.target.value.slice(0, raceText.length);
    let shared=0;while(shared<typed.length && shared<value.length && value[shared]===typed[shared])shared++;
    for(let i=shared;i<value.length;i++){attempts.current.total++;if(normalize(value[i])!==normalize(raceText[i]))attempts.current.wrong++}
    setAccuracy(attempts.current.total?Math.round(100*(1-attempts.current.wrong/attempts.current.total)):100);
    setTyped(value);
    const valid = correctPrefix(value, raceText);
    const speed = Math.round((valid / 5) / (Math.max(1000, (pausedRef.current ? pausedAt.current : Date.now()) - startedAtRef.current) / 60000));
    setPlayers(current => current.map(player => player.id === CLIENT_ID ? { ...player, progress: valid / raceText.length * 100, wpm: speed } : player));
    if (valid === raceText.length) finishRound(Date.now(), speed);
  };

  const reset = useCallback(() => {
    void cleanupChannels();
    pausedRef.current=false;setPaused(false);setElapsed(0);setTimedOut(false);
    setBossSession(n=>n+1);
    setPhase('ready');
    setOnline(false);
    setTyped('');
    setRaceText('');
    setPlayers([]);
    setMessage('');
    setCountdown(0);
  }, [cleanupChannels]);

  const leaderboard = [...players].sort((a, b) => a.finishedAt && b.finishedAt ? a.finishedAt - b.finishedAt : b.progress - a.progress);
  const rank = leaderboard.findIndex((player) => player.id === CLIENT_ID) + 1;

  return (
    <section className="w-full max-w-5xl mx-auto py-5 sm:py-10">
      <style>{`
        .race-world{overflow:hidden;border-radius:18px;border:1px solid #405061;margin-bottom:24px;background:#152434}
        .race-sky{height:94px;position:relative;padding:20px;background:linear-gradient(135deg,#0b2540,#245979 65%,#e79570);overflow:hidden;display:flex;flex-direction:column;gap:8px;font:10px monospace;letter-spacing:3px;color:#d2ecff}
        .race-sky b{font:italic 900 22px sans-serif;letter-spacing:1px;z-index:1;color:white}
        .race-sun{position:absolute;right:12%;top:18px;width:60px;height:60px;border-radius:50%;background:#ffdda0;box-shadow:0 0 70px #ffc57a88}
        .race-stands{display:flex;gap:10px;height:22px;padding:5px;background:#15202e;border-bottom:4px solid #718096;overflow:hidden}.race-stands i{min-width:13px;border-radius:50%;background:#acbace}
        .race-road{position:relative;background:repeating-linear-gradient(5deg,#252c34 0px,#252c34 3px,#29313a 4px,#29313a 5px)}
        .race-lane{height:96px;position:relative;border-bottom:2px dashed #ffffff40;margin:0 18px}.race-lane:last-child{border:0}
        .race-name{position:absolute;top:7px;left:0;font:11px monospace;color:#fff;z-index:2;text-shadow:0 2px 3px black}.race-name small{color:#b6c7d7;font-size:9px}
        .race-car-space{position:absolute;left:0;right:100px;top:29px}.race-car{position:absolute;width:100px;transition:left .35s cubic-bezier(.2,.65,.3,1);will-change:left;z-index:3}
        .race-finish{position:absolute;right:25px;width:14px;top:0;bottom:0;background:repeating-conic-gradient(#fff 0% 25%,#111 0% 50%) 0 0/14px 14px;opacity:.85;z-index:1}
        .race-curb{height:13px;background:repeating-linear-gradient(90deg,#e65341 0 30px,#e9e9df 30px 60px)}
        .race-exhaust{position:absolute;width:26px;height:8px;left:-15px;top:30px;background:linear-gradient(90deg,transparent,#ffd76a);border-radius:50%;animation:exhaust .18s infinite alternate}
        [data-running=true] .race-car svg{animation:engine .15s infinite alternate}
        @keyframes engine{to{transform:translateY(-.7px)}}@keyframes exhaust{to{transform:scaleX(1.6);opacity:.4}}
        @media(prefers-reduced-motion:reduce){.race-car{transition:none}[data-running=true] .race-car svg,.race-exhaust{animation:none}}
        @media(max-width:500px){.race-lane{height:87px;margin:0 10px}.race-car{width:80px}.race-car-space{right:80px}.race-sky b{font-size:18px}}
      `}</style>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-[#E85D3D] font-mono text-xs uppercase tracking-[0.2em] mb-2"><Zap className="w-4 h-4" /> {g('arcade')}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E8E2D8]">{gameMode === 'boss' ? g('bossTitle') : g('raceTitle')}</h1>
          <p className="text-sm text-[#9A9488] mt-2">{g('subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-5 rounded-2xl border border-white/10 bg-[#1A1917] p-4">
        <label className="flex flex-col gap-2 text-xs text-[#b7afa1]">{g('difficulty')}<select aria-label={g('difficulty')} disabled={bossBusy || (phase!=='ready' && phase!=='finished')} value={difficulty} onChange={e=>{reset();setDifficulty(e.target.value as typeof difficulty)}} className="bg-[#25231f] rounded-lg px-3 py-2 text-[#E8E2D8]">{(['easy','medium','hard'] as const).map(v=><option key={v} value={v}>{g(v)}</option>)}</select></label>
        <label className="flex flex-col gap-2 text-xs text-[#b7afa1]">{g('language')}<select aria-label={g('language')} disabled={bossBusy || (phase!=='ready' && phase!=='finished')} value={typingLanguage} onChange={e=>{reset();setTypingLanguage(e.target.value as typeof typingLanguage)}} className="bg-[#25231f] rounded-lg px-3 py-2 text-[#E8E2D8]">{(['uzbek_latin','uzbek_cyrillic','russian','english'] as const).map(v=><option key={v} value={v}>{g(v)}</option>)}</select></label>
        {currentUser ? (<div className="flex-1 text-xs min-w-48"><b>{g('record')}</b><div className="flex flex-wrap gap-4 mt-2 text-[#e8c186]"><span>{g('bestRace')}: {records.bestWpm} WPM</span><span>{g('wins')}: {records.wins+records.bossWins}</span><span>{g('bestCombo')}: ×{records.bestCombo}</span></div><p className="text-[#9A9488] mt-2">{g('localRecord')}</p></div>) : <div className="flex-1 text-sm"><p className="text-[#9A9488] mb-2">{authText(siteLanguage,"guestResults")}</p><button onClick={()=>setSignupOpen(true)} className="rounded-xl bg-[#E85D3D] px-4 py-3 font-semibold text-[#0F0E0D]">{authText(siteLanguage,"saveResults")}</button></div>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { reset(); setGameMode('race'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'race' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Flag className="w-4 h-4 text-[#E85D3D]" /> {g('race')}</div><p className="text-xs text-[#9A9488] mt-1">{g('raceDesc')}</p>
        </button>
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { reset(); setGameMode('boss'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'boss' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Swords className="w-4 h-4 text-[#E85D3D]" /> {g('boss')}</div><p className="text-xs text-[#9A9488] mt-1">{g('bossDesc')}</p>
        </button>
      </div>

      {gameMode === 'boss' ? <WordBoss key={bossSession + typingLanguage} language={typingLanguage} difficulty={difficulty} onResult={save} onBusy={setBossBusy}/> : phase === 'ready' || phase === 'matching' ? (
        <div className="rounded-3xl border border-white/10 bg-[#1A1917] p-6 sm:p-10 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E85D3D]/10 flex items-center justify-center text-[#E85D3D]">{gameMode === 'race' ? <Flag /> : <Swords />}</div>
          <h2 className="text-xl font-bold">{g(phase === 'matching' ? 'searching' : 'ready')}</h2>
          <p className="text-sm text-[#9A9488] mt-2">{phase === 'matching' ? g(message || 'searching') : g('raceInfo')+' · '+g('roundLimit')}</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button disabled={phase === 'matching'} onClick={() => startSolo(gameMode)} className="inline-flex justify-center items-center gap-2 rounded-xl bg-[#E85D3D] px-5 py-3 font-bold text-[#0F0E0D] disabled:opacity-50"><Bot className="w-4 h-4" /> {g('solo')}</button>
            {gameMode === 'race' && <button disabled={phase === 'matching'} onClick={() => void startOnline()} className="inline-flex justify-center items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-bold hover:border-[#E85D3D] disabled:opacity-50"><Users className="w-4 h-4" /> {g('quick')}</button>}
          </div>
          {phase === 'matching' && <button className="mt-4 text-xs text-[#9A9488] underline" onClick={reset}>{g('cancel')}</button>}
          {message && phase !== 'matching' && <p className="mt-4 text-xs text-[#9A9488]">{message && g(message)}</p>}
        </div>
      ) : (
        <>
          {phase === 'finished' && <div className="mb-4 rounded-2xl border border-[#E85D3D]/30 bg-[#E85D3D]/10 p-4 flex items-center gap-3"><Trophy className="text-[#E85D3D]" /><div><b>{timedOut ? g('dnf') : rank === 1 ? g('winner') : g('placed',{rank})}</b><p className="text-xs text-[#9A9488]">{players.find(p=>p.id===CLIENT_ID)?.wpm || 0} {g('wpm')} · {g('wordsTyped',{count:typedWords})}</p></div></div>}
          <div className="rounded-3xl border border-white/10 bg-[#1A1917] p-4 sm:p-7">
            {message && <p role="status" className="text-xs text-[#c7bbaa] mb-3">{g(message)}</p>}
            {phase === 'countdown' && <div className="mb-5 text-center text-5xl font-black text-[#E85D3D] animate-pulse">{g('countdown',{count:countdown})}</div>}
            <div className="race-world" data-running={phase === 'racing' && !paused}>
              <div className="race-sky"><span>{g('grandPrix')}</span><b>{g(phase === 'finished' ? 'finish' : phase === 'countdown' ? 'engines' : 'circuit')}</b><div className="race-sun" /></div>
              <div className="race-stands">{Array.from({length:35},(_,i)=><i key={i} style={{opacity:0.3+(i%4)*0.2}} />)}</div>
              <div className="race-road">
                <div className="race-finish" />
                {(players.length ? players : [{id:CLIENT_ID,name:playerName,progress:0,wpm:0},...BOT_NAMES.slice(0,3).map((name,i)=>({id:'demo'+i,name,progress:0,wpm:0,isBot:true}))]).map((player,i)=><div className="race-lane" key={player.id}>
                  <div className="race-name">{player.id === CLIENT_ID ? g('you') : player.name} <small>{player.isBot ? g('bot') : ''} · {player.wpm} {g('wpm')}</small></div>
                  <div className="race-car-space"><div className="race-car" style={{left:clamp(player.progress)+'%'}}><RaceCar color={['#f97345','#38bdf8','#a78bfa','#facc15'][i%4]} number={i+1}/>{phase === 'racing' && !paused && player.wpm>0 && <span className="race-exhaust"/>}</div></div>
                </div>)}
              </div>
              <div className="race-curb" />
            </div>
            {phase !== 'finished' && <div className="rounded-xl bg-black/25 p-4 sm:p-6 mb-4 font-mono text-lg sm:text-xl leading-9 break-words select-none">{raceText.split('').map((char, i) => <span key={i} className={i < typed.length ? (normalize(typed[i]) === normalize(char) ? 'text-[#6FA85C]' : 'text-[#D64545] underline') : i === typed.length ? 'text-[#E8E2D8] border-l-2 border-[#E85D3D]' : 'text-[#5C574C]'}>{char}</span>)}</div>}
            {phase === 'racing' && !paused && <input autoFocus value={typed} onChange={onType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onPaste={(event) => event.preventDefault()} placeholder={g('placeholder')} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 font-mono text-sm outline-none focus:border-[#E85D3D]" aria-label={g('raceInput')} />}
            {phase==='racing' && !online && <div className="mt-4"><button className="rounded-lg border border-white/20 px-4 py-2" onClick={paused?resumeRace:pauseRace}>{g(paused?'resume':'pause')}</button><p className="text-xs text-[#9A9488] mt-2" role="status">{g(paused?'paused':'pauseHint')}</p></div>}
            {(phase==='racing' || phase==='finished') && <div className="flex flex-wrap gap-5 mt-4 text-sm font-mono"><span>{g('accuracy')}: {accuracy}%</span><span>{g('elapsed')}: {g('seconds',{value:Math.floor(elapsed)})}</span></div>}
            {phase === 'countdown' && <p className="text-center text-xs text-[#9A9488]">{g('getReady')}</p>}
            <div className="mt-4 flex justify-between text-xs text-[#9A9488]"><span>{g('complete',{value:Math.round(progress)})}</span><span>{phase==='finished'?(players.find(p=>p.id===CLIENT_ID)?.wpm||0):wpm} {g('wpm')} · {g(online ? 'online' : 'soloLabel')}</span></div>
            {phase === 'finished' && <button onClick={reset} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E85D3D] px-4 py-2 font-bold text-[#0F0E0D]"><RotateCcw className="w-4 h-4" /> {g('again')}</button>}
            {online && <p className="mt-3 flex items-center gap-1 text-[11px] text-[#9A9488]"><Wifi className="w-3 h-3" /> {g('live')}</p>}
          </div>
        </>
      )}
      {gameMode === 'race' && <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#5C574C]"><WifiOff className="w-3 h-3" /> {g('rules')}</p>}
      <AuthModal isOpen={signupOpen} initialMode="signup" onClose={closeSignup} />
    </section>
  );
};




