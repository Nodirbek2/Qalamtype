import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swords, Flag, Users, Bot, RotateCcw, Wifi, WifiOff, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

import { supabase } from '../lib/supabase';

type GameMode = 'race' | 'boss';
type RacePhase = 'ready' | 'matching' | 'countdown' | 'racing' | 'finished';
type Player = { id: string; name: string; progress: number; wpm: number; isBot?: boolean; finishedAt?: number };
type PresencePlayer = { id: string; name: string; joinedAt: number };
type StartPayload = { text: string; startsAt: number; roomId: string };


const PASSAGES = {
  uzbek_latin: ["Tongda shahar ko'chalari quyosh nuriga to'ldi. Biz yangi yo'llarni kashf etish uchun sayohatga chiqdik. Oldinda bizni go'zal manzaralar kutmoqda.", "Tog'lar orasidan keng yo'l o'tadi. Yengil shamol daraxt barglarini asta silkitadi. Har bir burilish bizni yangi manzilga yaqinlashtiradi."],
  uzbek_cyrillic: ["Тонгда шаҳар кўчалари қуёш нурига тўлди. Биз янги йўлларни кашф этиш учун саёҳатга чиқдик. Олдинда бизни гўзал манзаралар кутмоқда."],
  english: ["The sun rises over the quiet city. We follow the winding road toward the mountains. Every turn brings us closer to a new adventure.", "The lights turn green and the engines roar. Keep your eyes on the road and find your rhythm. A steady pace will take you to the finish."],
  russian: ["Солнце поднимается над тихим городом. Мы едем по извилистой дороге к горам. Каждый поворот приближает нас к новому приключению."],
};
const normalize = (text: string) => text.replace(/[’ʻʼ`‘]/g, "'");
function correctPrefix(value: string, target: string) {
  let i = 0;
  while (i < value.length && normalize(value[i]) === normalize(target[i] || '')) i++;
  return i;
}
function RaceCar({ color, number }: { color: string; number: number }) {
  return <svg viewBox="0 0 160 66" role="img" aria-label="Sports racing car" style={{width:'100%',filter:'drop-shadow(0 9px 5px #0009)'}}>
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
const clientId = () => {
  try {
    const key = 'qalamtype_game_client';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
    return value;
  } catch {
    return Math.random().toString(36).slice(2);
  }
};
const CLIENT_ID = clientId();
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

type Battle = { status: 'ready' | 'playing' | 'won' | 'lost'; hits: number; health: number; combo: number; best: number; mistakes: number; strikes: number; started: number; ended: number; now: number; effect: 'hit' | 'hurt' | 'shield' | ''; serial: number };
const initialBattle: Battle = {status:'ready',hits:0,health:100,combo:0,best:0,mistakes:0,strikes:0,started:0,ended:0,now:0,effect:'',serial:0};
function battleReducer(s: Battle, a: {type:'start'|'hit'|'miss'|'tick'; now:number}): Battle {
  if(a.type==='start') return {...initialBattle,status:'playing',started:a.now,now:a.now};
  if(s.status!=='playing') return s;
  // Resolve elapsed attacks before accepting a key, even after a background-tab delay.
  const strikes=Math.floor((a.now-s.started)/8000);
  const health=Math.max(0,s.health-Math.max(0,strikes-s.strikes)*15);
  let next: Battle={...s,now:a.now,strikes,health};
  if(strikes>s.strikes) next={...next,effect:'hurt',serial:s.serial+1};
  if(!health) return {...next,status:'lost',ended:a.now};
  if(a.type==='hit') {
    const hits=s.hits+1, combo=s.combo+1, shield=combo%3===0;
    return {...next,hits,combo,best:Math.max(s.best,combo),health:Math.min(100,health+(shield?5:0)),effect:shield?'shield':'hit',serial:s.serial+1,status:hits>=18?'won':'playing',ended:hits>=18?a.now:0};
  }
  if(a.type==='miss') return {...next,combo:0,mistakes:s.mistakes+1,effect:'hurt',serial:s.serial+1};
  return next;
}
function WordBoss({language}: {language:keyof typeof PASSAGES}) {
  const [battle,dispatch]=React.useReducer(battleReducer,initialBattle);
  const [words,setWords]=useState<string[]>([]);
  const [input,setInput]=useState('');
  const entry=useRef<HTMLInputElement>(null);
  const wave=Math.min(2,Math.floor(battle.hits/6));
  const names=['SIYOH SOYASI','TEMIR QALAM','SO‘ZLAR AJDARI'];
  const hp=battle.status==='won'?0:100-(battle.hits%6)/6*100;
  const remaining=Math.max(0,8-((battle.now-battle.started)/1000)%8);
  const active=battle.status==='playing';
  useEffect(()=>{if(!active)return; const id=window.setInterval(()=>dispatch({type:'tick',now:Date.now()}),100);return()=>window.clearInterval(id)},[active]);
  useEffect(()=>{if(active)entry.current?.focus()},[active]);
  const start=()=>{
    const bank=PASSAGES[language]||PASSAGES.uzbek_latin;
    const pool=bank[Math.floor(Math.random()*bank.length)].replace(/[.,!?]/g,'').split(/\s+/).filter(Boolean);
    const offset=Math.floor(Math.random()*pool.length);
    setWords(Array.from({length:18},(_,i)=>pool[(offset+i)%pool.length]));setInput('');dispatch({type:'start',now:Date.now()});
  };
  const attack=(value:string)=>{
    if(!active || !value.trim())return;
    if(normalize(value.trim()).toLocaleLowerCase()===normalize(words[battle.hits]).toLocaleLowerCase()) {dispatch({type:'hit',now:Date.now()});setInput('')}
    else dispatch({type:'miss',now:Date.now()});
  };
  const seconds=Math.round(((battle.ended||battle.now)-battle.started)/1000);
  return <div className="wb-shell">
    <style>{`
      .wb-shell{background:#101021;border:1px solid #52416d;border-radius:22px;padding:22px;color:#eee8ff}.wb-top{display:flex;justify-content:space-between;gap:12px;font:12px monospace;color:#c6b7e3}.wb-top b{color:#bfa0ff}.wb-meter{height:9px;background:#ffffff12;border-radius:8px;overflow:hidden;margin:8px 0 16px}.wb-meter i{display:block;height:100%;background:linear-gradient(90deg,#e95588,#b079ef);transition:width .35s}.wb-arena{height:270px;border-radius:16px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 70% 25%,#493365,transparent 60%),linear-gradient(#141327,#252035);border-bottom:7px solid #554661}
      .wb-moon{position:absolute;top:22px;right:22%;width:65px;height:65px;border-radius:50%;background:#dccbfa;box-shadow:0 0 70px #bc82fa77}.wb-floor{position:absolute;bottom:0;width:100%;height:50px;background:repeating-linear-gradient(100deg,#342f43 0 40px,#494050 41px 44px);transform:perspective(90px) rotateX(25deg)}
      .wb-hero{position:absolute;left:8%;bottom:25px;width:85px;filter:drop-shadow(0 0 18px #64dddc88)}.wb-monster{position:absolute;right:7%;bottom:20px;width:155px;filter:drop-shadow(0 0 20px #b964d466);animation:wb-float 2s ease-in-out infinite alternate}.wb-monster.wb-defeated{transform:rotate(18deg) scale(.7);opacity:.25;animation:none;transition:all .7s}
      .wb-bolt{position:absolute;left:20%;bottom:85px;width:60px;height:12px;background:#caffff;box-shadow:0 0 30px #67f9ff;border-radius:50%;animation:wb-bolt .5s ease-out forwards}.wb-bolt.wb-enemy{left:auto;right:20%;background:#ff8aa6;box-shadow:0 0 30px #ff4266;animation:wb-enemy .5s ease-out forwards}.wb-damage{position:absolute;right:16%;top:60px;font:bold 23px monospace;color:#ffdeb0;animation:wb-number .7s forwards}.wb-shield{position:absolute;left:5%;bottom:18px;width:115px;height:130px;border:3px solid #76f3d6;border-radius:50%;animation:wb-number .7s forwards}.wb-instructions{font-size:13px;color:#bcb2ca;line-height:1.7;margin:16px 0}.wb-entry{width:100%;background:#090b16;border:1px solid #72618f;border-radius:12px;padding:14px;color:white;outline:none}.wb-entry:focus{border-color:#a994ff;box-shadow:0 0 0 3px #a994ff22}.wb-word{text-align:center;font:bold 30px monospace;letter-spacing:1px;margin:16px 0 8px;color:#e5daff;overflow-wrap:anywhere}.wb-button{border:0;border-radius:12px;background:#b59aff;color:#18102c;padding:12px 24px;font-weight:bold;cursor:pointer}.wb-stats{display:flex;flex-wrap:wrap;gap:18px;font:12px monospace;color:#cfc1e8;margin-top:16px}.wb-result{text-align:center;padding:22px 8px}.wb-result h2{font-size:25px;font-weight:bold;margin-bottom:8px}
      @keyframes wb-float{to{transform:translateY(-7px)}}@keyframes wb-bolt{to{left:78%;opacity:0;transform:scale(1.8)}}@keyframes wb-enemy{to{right:78%;opacity:0;transform:scale(1.8)}}@keyframes wb-number{to{transform:translateY(-32px);opacity:0}}
      @media(max-width:500px){.wb-shell{padding:14px}.wb-arena{height:235px}.wb-monster{width:125px;right:4%}.wb-hero{left:4%;width:70px}.wb-top{font-size:10px}.wb-word{font-size:25px}}
      @media(prefers-reduced-motion:reduce){.wb-monster,.wb-bolt,.wb-damage,.wb-shield{animation:none}.wb-meter i{transition:none}}
    `}</style>
    <div className="wb-top"><span>WORD BOSS · {wave+1}/3 BOSQICH</span><b>{names[wave]}</b></div>
    <div className="wb-meter" role="progressbar" aria-label="Boss joni" aria-valuenow={Math.round(hp)} aria-valuemin={0} aria-valuemax={100}><i style={{width:hp+'%'}}/></div>
    <div className="wb-arena" aria-label="Sehrgar va boss jang maydoni">
      <div className="wb-moon"/><div className="wb-floor"/>
      <svg className="wb-hero" viewBox="0 0 100 155" aria-label="Sehrgar" role="img"><path d="M15 145L36 67H65L88 145Z" fill="#3aa9ad"/><path d="M36 70L50 140L65 70" fill="#123c68"/><circle cx="51" cy="49" r="19" fill="#f3c6a0"/><path d="M15 40L55 0L75 40Z" fill="#56cfcc"/><path d="M12 41H88" stroke="#b6fff0" strokeWidth="6"/><path d="M67 85L86 75" stroke="#f3c6a0" strokeWidth="10"/><path d="M88 130V33" stroke="#b49d67" strokeWidth="5"/><circle cx="88" cy="25" r="10" fill="#9fffff"/></svg>
      <svg className={'wb-monster '+(battle.status==='won'?'wb-defeated':'')} viewBox="0 0 180 190" aria-label={names[wave]} role="img"><path d="M35 65L9 8L65 40M115 40L170 8L147 70" fill="#dcc4a4"/><path d="M25 80Q15 35 90 30Q165 35 158 83L172 165L126 151L110 185L80 159L44 181L36 145L8 157Z" fill={['#7855a7','#547d9f','#ae4678'][wave]}/><path d="M38 81L72 91L60 105L34 93M140 81L104 91L118 105L146 93" fill="#ffdf7a"/><path d="M57 128L90 146L126 126" fill="none" stroke="#29122e" strokeWidth="10"/><path d="M68 128L73 145L85 135M102 134L114 144L118 125" fill="#fff0cf"/></svg>
      {battle.serial>0 && <React.Fragment key={battle.serial}><div className={'wb-bolt '+(battle.effect==='hurt'?'wb-enemy':'')}/>{battle.effect!=='hurt' && <div className="wb-damage">−17 HP</div>}{battle.effect==='shield' && <div className="wb-shield"/>}</React.Fragment>}
    </div>
    <div className="wb-top" style={{marginTop:16}}><span>SIZNING JONINGIZ · {battle.health}/100</span><span>{active?'Boss hujumi: '+remaining.toFixed(1)+' s':'18 so‘z · 3 boss'}</span></div>
    <div className="wb-meter" role="progressbar" aria-label="Sizning joningiz" aria-valuenow={battle.health} aria-valuemin={0} aria-valuemax={100}><i style={{width:battle.health+'%',background:'#52cbb3'}}/></div>
    {battle.status==='ready' ? <div className="wb-result"><h2>So‘z bilan jang qiling</h2><p className="wb-instructions">So‘zni yozing va Space yoki Enter bosing — sehrli zarba uchadi. Har 6 ta so‘zdan keyin yangi boss keladi. Boss har 8 soniyada 15 jon oladi. Ketma-ket 3 ta to‘g‘ri zarba sizga 5 jon qaytaradi. Xato javob komboni uzadi.</p><button className="wb-button" onClick={start}>Jangni boshlash</button></div> : active ? <>
      <div className="wb-word">{words[battle.hits]}</div><p style={{textAlign:'center',fontSize:12,color:'#b3a5c7',marginBottom:12}}>So‘zni yozing · Space / Enter = hujum</p>
      <form onSubmit={e=>{e.preventDefault();attack(input)}}><input ref={entry} className="wb-entry" value={input} aria-label="Hujum so‘zini yozing" onChange={e=>{const value=e.target.value;if(/\s$/.test(value))attack(value);else setInput(value)}} onPaste={e=>e.preventDefault()} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}/><button className="wb-button" type="submit" style={{marginTop:12}}>Hujum qilish</button></form>
      <div className="wb-stats"><span>Zarba {battle.hits}/18</span><span>Kombo ×{battle.combo}</span><span>Vaqt {seconds}s</span></div>
    </> : <div className="wb-result" role="status"><h2>{battle.status==='won'?'G‘alaba! Barcha bosslar yengildi.':'Jang tugadi. Yana urinib ko‘ring!'}</h2><p className="wb-instructions">{battle.hits}/18 zarba · eng yaxshi kombo ×{battle.best} · {battle.mistakes} xato · {seconds} soniya</p><button className="wb-button" onClick={start}>Qayta o‘ynash</button></div>}
  </div>;
}

export const GamesView: React.FC = () => {
  const { userProfile } = useAuth();
  const { typingLanguage } = useSettings();
  const [bossSession, setBossSession] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('race');
  const [phase, setPhase] = useState<RacePhase>('ready');
  const [online, setOnline] = useState(false);
  const [raceText, setRaceText] = useState('');
  const [typed, setTyped] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');
  const lobbyRef = useRef<any>(null);
  const raceRef = useRef<any>(null);
  const startedAtRef = useRef(0);
  const botTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const playerName = userProfile?.username || 'Mehmon';
  const wordCount = useMemo(() => raceText.trim() ? raceText.trim().split(/\s+/).length : 0, [raceText]);
  const typedWords = useMemo(() => typed.trim().split(/\s+/).filter(Boolean).length, [typed]);
  const validChars = correctPrefix(typed, raceText);
  const progress = raceText ? clamp(validChars / raceText.length * 100) : 0;
  const wpm = startedAtRef.current && typed.length
    ? Math.round((validChars / 5) / (Math.max(1, Date.now() - startedAtRef.current) / 60000))
    : 0;

  const liveStatsRef = useRef({ progress, wpm });
  liveStatsRef.current = { progress, wpm };

  const clearTimers = useCallback(() => {
    [botTimerRef, startTimerRef, matchTimerRef].forEach((ref) => {
      if (ref.current !== null) window.clearInterval(ref.current);
      ref.current = null;
    });
  }, []);

  const cleanupChannels = useCallback(async () => {
    clearTimers();
    const channels = [raceRef.current, lobbyRef.current].filter(Boolean);
    raceRef.current = null;
    lobbyRef.current = null;
    await Promise.all(channels.map((channel) => supabase.removeChannel(channel).catch(() => undefined)));
  }, [clearTimers]);

  useEffect(() => () => { void cleanupChannels(); }, [cleanupChannels]);

  const makeText = useCallback(() => { const bank = PASSAGES[typingLanguage] || PASSAGES.uzbek_latin; return bank[Math.floor(Math.random() * bank.length)]; }, [typingLanguage]);

  const finishRound = useCallback((finishTime = Date.now(), finalWpm = wpm) => {
    setPhase('finished');
    setPlayers((current) => current.map((player) =>
      player.id === CLIENT_ID ? { ...player, progress: 100, wpm: finalWpm, finishedAt: finishTime } : player
    ));
    if (raceRef.current && online) {
      raceRef.current.send({ type: 'broadcast', event: 'race-finish', payload: { id: CLIENT_ID, progress: 100, wpm: finalWpm, finishedAt: finishTime } });
    }
  }, [online, wpm]);

  const beginCountdown = useCallback((text: string, participants: Player[], startAt = Date.now() + 4000) => {
    startedAtRef.current = 0;
    setRaceText(text);
    setTyped('');
    setPlayers(participants);
    setPhase('countdown');
    setMessage('');
    clearTimers();
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((startAt - Date.now()) / 1000));
      setCountdown(seconds);
      if (seconds <= 0) {
        clearTimers();
        startedAtRef.current = Date.now();
        setPhase('racing');
      }
    };
    tick();
    startTimerRef.current = window.setInterval(tick, 150);
  }, [clearTimers]);

  const startSolo = useCallback((mode: GameMode = gameMode) => {
    void cleanupChannels();
    setOnline(false);
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
    await cleanupChannels();
    setOnline(true);
    setPhase('matching');
    setTyped('');
    setMessage('Looking for a racer…');
    const lobby = supabase.channel('qalamtype-race-lobby-v1', {
      config: { presence: { key: CLIENT_ID }, broadcast: { self: false } },
    });
    lobbyRef.current = lobby;
    const joinedAt = Date.now();
    const settlePresence = () => {
      if (raceRef.current) return;
      const state = lobby.presenceState<PresencePlayer>();
      const everyone = Object.values(state).flat().filter((entry) => entry && entry.id && entry.id !== CLIENT_ID) as PresencePlayer[];
      const unique = new Map(everyone.map((entry) => [entry.id, entry]));
      const queue = [{ id: CLIENT_ID, name: playerName, joinedAt }, ...unique.values()]
        .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
      const myIndex = queue.findIndex((entry) => entry.id === CLIENT_ID);
      const pairStart = Math.floor(myIndex / 2) * 2;
      const pair = queue.slice(pairStart, pairStart + 2);
      if (pair.length < 2 || !pair.some((entry) => entry.id === CLIENT_ID)) return;
      const opponent = pair.find((entry) => entry.id !== CLIENT_ID)!;
      const ids = pair.map((entry) => entry.id).sort();
      const roomId = ids.join('-');
      setMessage('Racer found! Get ready…');
      void lobby.untrack();
      if (matchTimerRef.current !== null) window.clearInterval(matchTimerRef.current);
      const race = supabase.channel('qalamtype-race-' + roomId, {
        config: { broadcast: { self: false } },
      });
      raceRef.current = race;
      race.on('broadcast', { event: 'race-start' }, ({ payload }: { payload: StartPayload }) => {
        if (!payload?.text || payload.roomId !== roomId) return;
        beginCountdown(payload.text, [
          { id: CLIENT_ID, name: playerName, progress: 0, wpm: 0 },
          { id: opponent.id, name: opponent.name, progress: 0, wpm: 0 },
          { id: 'bot-fill-1', name: BOT_NAMES[7], progress: 0, wpm: 0, isBot: true },
          { id: 'bot-fill-2', name: BOT_NAMES[8], progress: 0, wpm: 0, isBot: true },
        ], payload.startsAt);
      });
      race.on('broadcast', { event: 'race-progress' }, ({ payload }: { payload: Player }) => {
        setPlayers((current) => current.map((player) => player.id === payload.id ? { ...player, progress: payload.progress, wpm: payload.wpm } : player));
      });
      race.on('broadcast', { event: 'race-finish' }, ({ payload }: { payload: Player }) => {
        setPlayers((current) => current.map((player) => player.id === payload.id ? { ...player, progress: 100, wpm: payload.wpm, finishedAt: payload.finishedAt } : player));
      });
      race.subscribe((status: string) => {
        if (status !== 'SUBSCRIBED') return;
        const host = ids[0] === CLIENT_ID;
        if (!host) return;
        const payload = { text: makeText(), startsAt: Date.now() + 6500, roomId };
        beginCountdown(payload.text, [
          { id: CLIENT_ID, name: playerName, progress: 0, wpm: 0 },
          { id: opponent.id, name: opponent.name, progress: 0, wpm: 0 },
          { id: 'bot-fill-1', name: BOT_NAMES[7], progress: 0, wpm: 0, isBot: true },
          { id: 'bot-fill-2', name: BOT_NAMES[8], progress: 0, wpm: 0, isBot: true },
        ], payload.startsAt);
        let repeats = 0;
        const announce = window.setInterval(() => {
          race.send({ type: 'broadcast', event: 'race-start', payload });
          repeats += 1;
          if (repeats >= 5) window.clearInterval(announce);
        }, 350);
      });
    };

    lobby.on('presence', { event: 'sync' }, settlePresence);
    lobby.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        void lobby.track({ id: CLIENT_ID, name: playerName, joinedAt });
      }
    });
    matchTimerRef.current = window.setInterval(() => {
      const state = lobby.presenceState<PresencePlayer>();
      const other = Object.values(state).flat().some((entry) => entry?.id && entry.id !== CLIENT_ID);
      if (!other) {
        if (matchTimerRef.current !== null) window.clearInterval(matchTimerRef.current);
        matchTimerRef.current = null;
        void cleanupChannels();
        setOnline(false);
        setMessage('No racers online yet — filling the track with Uzbek bots.');
        const text = makeText();
        const selected = [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, 3);
        beginCountdown(text, [
          { id: CLIENT_ID, name: playerName, progress: 0, wpm: 0 },
          ...selected.map((name, i) => ({ id: 'bot-' + i, name, progress: 0, wpm: 0, isBot: true })),
        ]);
      }
    }, 7000);
  }, [beginCountdown, cleanupChannels, makeText, playerName]);

  useEffect(() => {
    if (phase !== 'racing') return;
    const progressTimer = window.setInterval(() => {
      if (raceRef.current && online) {
        const stats = liveStatsRef.current;
        raceRef.current.send({ type: 'broadcast', event: 'race-progress', payload: { id: CLIENT_ID, name: playerName, ...stats } });
      }
    }, 300);
    const botTimer = window.setInterval(() => {
      setPlayers((current) => current.map((player) => {
        if (!player.isBot || player.progress >= 100) return player;
        const botWpm = player.wpm || Math.round(38 + Math.random() * 35);
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
  }, [phase, online, playerName, raceText.length]);

  const onType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.slice(0, raceText.length);
    setTyped(value);
    const valid = correctPrefix(value, raceText);
    const speed = Math.round((valid / 5) / (Math.max(1000, Date.now() - startedAtRef.current) / 60000));
    setPlayers(current => current.map(player => player.id === CLIENT_ID ? { ...player, progress: valid / raceText.length * 100, wpm: speed } : player));
    if (valid === raceText.length) finishRound(Date.now(), speed);
  };

  const reset = useCallback(() => {
    void cleanupChannels();
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
          <div className="flex items-center gap-2 text-[#E85D3D] font-mono text-xs uppercase tracking-[0.2em] mb-2"><Zap className="w-4 h-4" /> Qalamtype Arcade</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E8E2D8]">{gameMode === 'boss' ? 'Word Boss · So‘zlar jangi' : 'Type. Race. Win.'}</h1>
          <p className="text-sm text-[#9A9488] mt-2">Practice your speed in a race or defeat the word boss.</p>
        </div>
        <button onClick={reset} className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-[#9A9488] hover:text-white"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { reset(); setGameMode('race'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'race' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Flag className="w-4 h-4 text-[#E85D3D]" /> Sprint race</div><p className="text-xs text-[#9A9488] mt-1">Race through three sentences. Accuracy is your accelerator.</p>
        </button>
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { reset(); setGameMode('boss'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'boss' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Swords className="w-4 h-4 text-[#E85D3D]" /> Word boss</div><p className="text-xs text-[#9A9488] mt-1">3 boss · sehrli zarbalar · kombo va himoya</p>
        </button>
      </div>

      {gameMode === 'boss' ? <WordBoss key={bossSession + typingLanguage} language={typingLanguage}/> : phase === 'ready' || phase === 'matching' ? (
        <div className="rounded-3xl border border-white/10 bg-[#1A1917] p-6 sm:p-10 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E85D3D]/10 flex items-center justify-center text-[#E85D3D]">{gameMode === 'race' ? <Flag /> : <Swords />}</div>
          <h2 className="text-xl font-bold">{phase === 'matching' ? 'Finding racers…' : gameMode === 'race' ? 'Ready for a typing race?' : 'Challenge the word boss?'}</h2>
          <p className="text-sm text-[#9A9488] mt-2">{phase === 'matching' ? message : '3 sentences · animated cars · a flying finish'}</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button disabled={phase === 'matching'} onClick={() => startSolo(gameMode)} className="inline-flex justify-center items-center gap-2 rounded-xl bg-[#E85D3D] px-5 py-3 font-bold text-[#0F0E0D] disabled:opacity-50"><Bot className="w-4 h-4" /> Solo vs bots</button>
            {gameMode === 'race' && <button disabled={phase === 'matching'} onClick={() => void startOnline()} className="inline-flex justify-center items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-bold hover:border-[#E85D3D] disabled:opacity-50"><Users className="w-4 h-4" /> Quick online race</button>}
          </div>
          {phase === 'matching' && <button className="mt-4 text-xs text-[#9A9488] underline" onClick={reset}>Cancel search</button>}
          {message && phase !== 'matching' && <p className="mt-4 text-xs text-[#9A9488]">{message}</p>}
        </div>
      ) : (
        <>
          {phase === 'finished' && <div className="mb-4 rounded-2xl border border-[#E85D3D]/30 bg-[#E85D3D]/10 p-4 flex items-center gap-3"><Trophy className="text-[#E85D3D]" /><div><b>{rank === 1 ? 'You won the race!' : `You finished #${rank}`}</b><p className="text-xs text-[#9A9488]">{players.find(p=>p.id===CLIENT_ID)?.wpm || 0} WPM · {typedWords} words typed</p></div></div>}
          <div className="rounded-3xl border border-white/10 bg-[#1A1917] p-4 sm:p-7">
            {phase === 'countdown' && <div className="mb-5 text-center text-5xl font-black text-[#E85D3D] animate-pulse">{countdown || 'GO'}</div>}
            <div className="race-world" data-running={phase === 'racing'}>
              <div className="race-sky"><span>QALAM GRAND PRIX</span><b>{phase === 'finished' ? 'CHEQUERED FLAG' : phase === 'countdown' ? 'ENGINES READY' : 'CITY CIRCUIT'}</b><div className="race-sun" /></div>
              <div className="race-stands">{Array.from({length:35},(_,i)=><i key={i} style={{opacity:0.3+(i%4)*0.2}} />)}</div>
              <div className="race-road">
                <div className="race-finish" />
                {(players.length ? players : [{id:CLIENT_ID,name:playerName,progress:0,wpm:0},...BOT_NAMES.slice(0,3).map((name,i)=>({id:'demo'+i,name,progress:0,wpm:0,isBot:true}))]).map((player,i)=><div className="race-lane" key={player.id}>
                  <div className="race-name">{player.id === CLIENT_ID ? 'YOU' : player.name} <small>{player.isBot ? 'BOT' : ''} · {player.wpm} WPM</small></div>
                  <div className="race-car-space"><div className="race-car" style={{left:clamp(player.progress)+'%'}}><RaceCar color={['#f97345','#38bdf8','#a78bfa','#facc15'][i%4]} number={i+1}/>{phase === 'racing' && player.wpm>0 && <span className="race-exhaust"/>}</div></div>
                </div>)}
              </div>
              <div className="race-curb" />
            </div>
            {phase !== 'finished' && <div className="rounded-xl bg-black/25 p-4 sm:p-6 mb-4 font-mono text-lg sm:text-xl leading-9 break-words select-none">{raceText.split('').map((char, i) => <span key={i} className={i < typed.length ? (normalize(typed[i]) === normalize(char) ? 'text-[#6FA85C]' : 'text-[#D64545] underline') : i === typed.length ? 'text-[#E8E2D8] border-l-2 border-[#E85D3D]' : 'text-[#5C574C]'}>{char}</span>)}</div>}
            {phase === 'racing' && <input autoFocus value={typed} onChange={onType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onPaste={(event) => event.preventDefault()} placeholder="Start typing the text above…" className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 font-mono text-sm outline-none focus:border-[#E85D3D]" aria-label="Type the race text" />}
            {phase === 'countdown' && <p className="text-center text-xs text-[#9A9488]">Get ready…</p>}
            <div className="mt-4 flex justify-between text-xs text-[#9A9488]"><span>{Math.round(progress)}% complete</span><span>{typedWords}/{wordCount} words · {wpm} WPM {online ? '· online' : '· solo'}</span></div>
            {phase === 'finished' && <button onClick={reset} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E85D3D] px-4 py-2 font-bold text-[#0F0E0D]"><RotateCcw className="w-4 h-4" /> Play again</button>}
            {online && <p className="mt-3 flex items-center gap-1 text-[11px] text-[#9A9488]"><Wifi className="w-3 h-3" /> Matched players sync live. {players.some((player) => player.isBot) ? 'Bots fill the remaining lanes.' : ''}</p>}
          </div>
        </>
      )}
      {gameMode === 'race' && <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#5C574C]"><WifiOff className="w-3 h-3" /> Type accurately to accelerate. Correct red letters to keep moving. Bots fill empty lanes.</p>}
    </section>
  );
};


