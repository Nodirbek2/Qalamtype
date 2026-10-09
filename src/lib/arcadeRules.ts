export const normalize = (text: string) => text.replace(/[’ʻʼ`‘]/g, "'");
export function correctPrefix(value: string, target: string) {
  let i = 0;
  while (i < value.length && normalize(value[i]) === normalize(target[i] || '')) i++;
  return i;
}

export type Battle = { status: 'ready' | 'playing' | 'won' | 'lost'; hits: number; health: number; combo: number; best: number; mistakes: number; strikes: number; started: number; ended: number; now: number; effect: 'hit' | 'hurt' | 'shield' | 'miss' | ''; serial: number; paused: boolean; pauseAt: number; interval: number };
export const initialBattle: Battle = {status:'ready',hits:0,health:100,combo:0,best:0,mistakes:0,strikes:0,started:0,ended:0,now:0,effect:'',serial:0,paused:false,pauseAt:0,interval:8000};
export function battleReducer(s: Battle, a: {type:'start'|'hit'|'miss'|'tick'|'pause'|'resume'; now:number; interval?:number}): Battle {
  if(a.type==='start') return {...initialBattle,status:'playing',started:a.now,now:a.now,interval:a.interval||8000};
  if(s.status!=='playing') return s;
  if(a.type==='resume' && s.paused) return {...s,paused:false,pauseAt:0,started:s.started+a.now-s.pauseAt,now:a.now};
  if(s.paused) return s;
  // Resolve elapsed attacks before accepting a key, even after a background-tab delay.
  const strikes=Math.floor((a.now-s.started)/s.interval);
  const health=Math.max(0,s.health-Math.max(0,strikes-s.strikes)*15);
  let next: Battle={...s,now:a.now,strikes,health};
  if(strikes>s.strikes) next={...next,effect:'hurt',serial:s.serial+1};
  if(!health) return {...next,status:'lost',ended:a.now};
  if(a.type==='pause') return {...next,paused:true,pauseAt:a.now};
  if(a.type==='hit') {
    const hits=s.hits+1, combo=s.combo+1, shield=combo%3===0;
    return {...next,hits,combo,best:Math.max(s.best,combo),health:Math.min(100,health+(shield?5:0)),effect:shield?'shield':'hit',serial:s.serial+1,status:hits>=18?'won':'playing',ended:hits>=18?a.now:0};
  }
  if(a.type==='miss') return {...next,combo:0,mistakes:s.mistakes+1,effect:'miss',serial:s.serial+1};
  return next;
}
