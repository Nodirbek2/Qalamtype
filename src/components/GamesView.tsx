import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {normalize,correctPrefix} from '../lib/arcadeRules';
import {ARCADE_PASSAGES} from '../data/textCorpus';
import {gameText,type GameKey} from '../data/gameI18n';
import {raceText as raceTextLabel} from '../data/raceI18n';
import {useAuth} from '../context/AuthContext';
import {useSettings} from '../context/SettingsContext';
import {useRaceCareer} from '../hooks/useRaceCareer';
import {RaceDashboard} from './RaceDashboard';
import {AuthModal} from './AuthModal';
type GameMode='race';
type RacePhase='ready'|'matching'|'countdown'|'racing'|'finished';
type Player={id:string;name:string;progress:number;wpm:number;isBot?:boolean;finishedAt?:number};
type PresencePlayer={id:string;name:string;joinedAt:number};
type StartPayload={text:string;startsAt:number;roomId:string};
const PASSAGES=ARCADE_PASSAGES;
function botPerformance(id: string, raceSeed: number, elapsed: number, difficulty: 'easy'|'medium'|'hard') {
  // Both online players share the round seed; every new race has a new profile.
  let seed = 2166136261;
  for (const char of id + ':' + raceSeed) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  const random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
  const [low, high] = {easy:[25,40],medium:[40,60],hard:[65,85]}[difficulty];
  const base = low + random() * (high - low);
  const delay = 0.2 + random() * 1.4;
  const period = 7 + random() * 10;
  const phase = random() * Math.PI * 2;
  const secondPhase = random() * Math.PI * 2;
  const time = Math.max(0, elapsed - delay);
  const wave = 2 * Math.PI / period;
  const secondWave = 2 * Math.PI / 4.5;
  // Integral of the speed curve: progress does not depend on timer/frame rate.
  const distance = base * 5 / 60 * (time
    + 0.35 * (Math.cos(phase) - Math.cos(wave*time+phase)) / wave
    + 0.15 * (Math.cos(secondPhase) - Math.cos(secondWave*time+secondPhase)) / secondWave);
  const wpm = elapsed < delay ? 0 : base * (1 + 0.35*Math.sin(wave*time+phase) + 0.15*Math.sin(secondWave*time+secondPhase));
  return {characters:Math.max(0,distance),wpm:Math.round(wpm)};
}

const BOT_NAMES = ['Azizbek', 'Madina', 'Jasur', 'Shahnoza', 'Bekzod', 'Malika', 'Sardor', 'Nilufar', 'Diyor', 'Zuhra', 'Oybek', 'Sevara'];
const clientId = () => { try{return crypto.randomUUID()}catch{return Math.random().toString(36).slice(2)} };
const CLIENT_ID = clientId();
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const GamesView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [signupOpen,setSignupOpen]=useState(false);
  const closeSignup=useCallback(()=>setSignupOpen(false),[]);
  const { typingLanguage, setTypingLanguage, siteLanguage } = useSettings();
  const g = (key: GameKey, vars: Record<string,string|number> = {}) => gameText(siteLanguage,key,vars);
  const [selectedDifficulty,setDifficulty]=useState<'easy'|'medium'|'hard'>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('race');
  const difficulty = gameMode==='race' ? 'medium' : selectedDifficulty;
  const career=useRaceCareer(currentUser?.id,typingLanguage);
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
  const botRaceSeedRef = useRef(0);
  const botTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const handshakeTimerRef=useRef<number|null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const playerName = userProfile?.username || raceTextLabel(siteLanguage,'guest');
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
    career.complete(raceText,Math.max(.001,(finishTime-startedAtRef.current)/1000),attempts.current.wrong);
    setPhase('finished');
    setPlayers((current) => current.map((player) =>
      player.id === CLIENT_ID ? { ...player, progress: 100, wpm: finalWpm, finishedAt: finishTime } : player
    ));
    if (raceRef.current && online) {
      raceRef.current.send({ type: 'broadcast', event: 'race-finish', payload: { id: CLIENT_ID, progress: 100, wpm: finalWpm, finishedAt: finishTime } });
    }
  }, [online, wpm, raceText, career.complete]);

  const beginCountdown = useCallback((text: string, participants: Player[], startAt = Date.now() + 4000) => {
    career.begin(text,startAt);
    finishedRef.current=false;
    botRaceSeedRef.current=startAt;
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
  }, [clearTimers,career.begin]);

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
        const elapsed = Math.max(0,(Date.now()-startedAtRef.current)/1000);
        const performance = botPerformance(player.id,botRaceSeedRef.current,elapsed,difficulty);
        const progress = raceText.length ? Math.min(100,performance.characters/raceText.length*100) : 0;
        let finishedAt: number | undefined;
        if (progress >= 100) {
          let low=0, high=elapsed;
          for(let i=0;i<24;i++){
            const middle=(low+high)/2;
            if(botPerformance(player.id,botRaceSeedRef.current,middle,difficulty).characters>=raceText.length) high=middle;
            else low=middle;
          }
          finishedAt=startedAtRef.current+high*1000;
        }
        return { ...player, progress, wpm:performance.wpm, finishedAt };
      }));
    }, 100);
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

  return <><RaceDashboard language={siteLanguage} typingLanguage={typingLanguage} setTypingLanguage={setTypingLanguage} userId={currentUser?.id} name={playerName} phase={phase} players={players} me={CLIENT_ID} text={raceText} typed={typed} progress={progress} wpm={phase==='finished'?(players.find(p=>p.id===CLIENT_ID)?.wpm||0):wpm} accuracy={accuracy} elapsed={elapsed} countdown={countdown} rank={rank} paused={paused} online={online} timedOut={timedOut} message={message?g(message):''} onType={onType} start={()=>startSolo()} startOnline={()=>void startOnline()} reset={reset} pause={pauseRace} resume={resumeRace} signup={()=>setSignupOpen(true)} career={career}/><AuthModal isOpen={signupOpen} initialMode="signup" onClose={closeSignup}/></>;
};
