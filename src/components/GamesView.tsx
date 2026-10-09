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

export const GamesView: React.FC = () => {
  const { userProfile } = useAuth();
  const { typingLanguage } = useSettings();
  const [gameMode, setGameMode] = useState<GameMode>('race');
  const [phase, setPhase] = useState<RacePhase>('ready');
  const [online, setOnline] = useState(false);
  const [raceText, setRaceText] = useState('');
  const [typed, setTyped] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');
  const [bossHealth, setBossHealth] = useState(100);
  const lobbyRef = useRef<any>(null);
  const raceRef = useRef<any>(null);
  const startedAtRef = useRef(0);
  const botTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const playerName = userProfile?.username || 'Mehmon';
  const wordCount = useMemo(() => raceText.trim() ? raceText.trim().split(/\s+/).length : 0, [raceText]);
  const typedWords = useMemo(() => typed.trim().split(/\s+/).filter(Boolean).length, [typed]);
  const correctWords = useMemo(() => {
    if (!raceText) return 0;
    const target = raceText.split(/\s+/);
    const entered = typed.trim().split(/\s+/).filter(Boolean);
    return entered.reduce((sum, word, i) => sum + (word === target[i] ? 1 : 0), 0);
  }, [raceText, typed]);
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
    setBossHealth(100);
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

  useEffect(() => {
    if (gameMode !== 'boss' || phase !== 'racing' || !wordCount) return;
    setBossHealth(clamp(100 - (correctWords / wordCount) * 100));

  }, [bossHealth, correctWords, finishRound, gameMode, phase, wordCount]);

  const onType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.slice(0, raceText.length);
    setTyped(value);
    if (gameMode === 'boss' && wordCount) {
      const target = raceText.split(/\s+/);
      const entered = value.trim().split(/\s+/).filter(Boolean);
      const hits = entered.reduce((sum, word, i) => sum + (word === target[i] ? 1 : 0), 0);
      setBossHealth(clamp(100 - hits / wordCount * 100));
    }
    const valid = correctPrefix(value, raceText);
    const speed = Math.round((valid / 5) / (Math.max(1000, Date.now() - startedAtRef.current) / 60000));
    setPlayers(current => current.map(player => player.id === CLIENT_ID ? { ...player, progress: valid / raceText.length * 100, wpm: speed } : player));
    if (valid === raceText.length) finishRound(Date.now(), speed);
  };

  const reset = useCallback(() => {
    void cleanupChannels();
    setPhase('ready');
    setOnline(false);
    setTyped('');
    setRaceText('');
    setPlayers([]);
    setMessage('');
    setBossHealth(100);
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
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E8E2D8]">Type. Race. Win.</h1>
          <p className="text-sm text-[#9A9488] mt-2">Practice your speed in a race or defeat the word boss.</p>
        </div>
        <button onClick={reset} className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-[#9A9488] hover:text-white"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { setGameMode('race'); if (phase === 'ready' || phase === 'finished') setMessage('Race mode selected'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'race' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Flag className="w-4 h-4 text-[#E85D3D]" /> Sprint race</div><p className="text-xs text-[#9A9488] mt-1">Race through three sentences. Accuracy is your accelerator.</p>
        </button>
        <button disabled={phase !== 'ready' && phase !== 'finished'} onClick={() => { setGameMode('boss'); if (phase === 'ready' || phase === 'finished') setMessage('Word boss selected'); }} className={`rounded-2xl p-4 text-left border transition-colors ${gameMode === 'boss' ? 'border-[#E85D3D]/60 bg-[#E85D3D]/10' : 'border-white/10 bg-[#1A1917]'}`}>
          <div className="flex items-center gap-2 font-bold"><Swords className="w-4 h-4 text-[#E85D3D]" /> Word boss</div><p className="text-xs text-[#9A9488] mt-1">Every correctly typed word damages the boss.</p>
        </button>
      </div>

      {phase === 'ready' || phase === 'matching' ? (
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
          {phase === 'finished' && <div className="mb-4 rounded-2xl border border-[#E85D3D]/30 bg-[#E85D3D]/10 p-4 flex items-center gap-3"><Trophy className="text-[#E85D3D]" /><div><b>{rank === 1 ? 'You won the race!' : gameMode === 'boss' ? 'Boss defeated!' : `You finished #${rank}`}</b><p className="text-xs text-[#9A9488]">{players.find(p=>p.id===CLIENT_ID)?.wpm || 0} WPM · {typedWords} words typed</p></div></div>}
          <div className="rounded-3xl border border-white/10 bg-[#1A1917] p-4 sm:p-7">
            {gameMode === 'boss' && <div className="mb-5"><div className="flex justify-between text-xs mb-2"><span className="text-[#9A9488]">WORD BOSS HP</span><span>{Math.round(bossHealth)}%</span></div><div className="h-3 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#E85D3D] transition-all" style={{ width: bossHealth + '%' }} /></div></div>}
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
      <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#5C574C]"><WifiOff className="w-3 h-3" /> Type accurately to accelerate. Correct red letters to keep moving. Bots fill empty lanes.</p>
    </section>
  );
};

