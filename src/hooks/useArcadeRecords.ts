import { useCallback, useEffect, useState } from 'react';
export type ArcadeRecords = { races: number; wins: number; bossWins: number; bestWpm: number; bestCombo: number };
const empty: ArcadeRecords = {races:0,wins:0,bossWins:0,bestWpm:0,bestCombo:0};
function read(key: string): ArcadeRecords {
  try {
    const raw=JSON.parse(localStorage.getItem(key)||'{}');
    return Object.fromEntries(Object.keys(empty).map(k=>[k, typeof raw?.[k]==='number' && Number.isFinite(raw[k]) && raw[k]>=0 ? raw[k] : 0])) as ArcadeRecords;
  } catch { return {...empty}; }
}
export function useArcadeRecords(scope: string, userId?: string) {
  const key=userId ? 'qalamtype.arcade.v2.'+userId+'.'+scope : null;
  const [records,setRecords]=useState<ArcadeRecords>(()=>key ? read(key) : {...empty});
  useEffect(()=>{setRecords(key ? read(key) : {...empty})},[key]);
  const save=useCallback((result: {kind:'race'|'boss'; won:boolean; wpm?:number; combo?:number})=>{
    if (!key) return;
    const previous=read(key);
    const next={...previous,
      races:previous.races+(result.kind==='race'?1:0),
      wins:previous.wins+(result.kind==='race' && result.won?1:0),
      bossWins:previous.bossWins+(result.kind==='boss' && result.won?1:0),
      bestWpm:Math.max(previous.bestWpm,result.wpm||0),
      bestCombo:Math.max(previous.bestCombo,result.combo||0),
    };
    try{localStorage.setItem(key,JSON.stringify(next))}catch{/* Gameplay also works with storage disabled. */}
    setRecords(next);
  },[key]);
  return {records: key ? records : {...empty},save};
}

