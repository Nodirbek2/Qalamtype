// Deterministic, elapsed-time based typing: the same round is shared by online clients.
export function botPerformance(id:string,raceSeed:number,elapsed:number){
 let seed=2166136261;
 for(const char of id+':'+raceSeed)seed=Math.imul(seed^char.charCodeAt(0),16777619);
 const random=()=>{seed=(seed+0x6D2B79F5)|0;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296};
 // Each opponent independently draws a fresh pace from the full range each round.
 // No lane or car is assigned a permanent slow/medium/fast role.
 const base=10+random()*60;
 const pauseOffset=Math.floor(random()*17);
 const delay=.7+random()*1.4,period=11+Math.floor(random()*8),phase=random()*Math.PI*2;
 const time=Math.max(0,elapsed-delay);
 // Short pauses model thinking/correcting mistakes; bursts remain bounded and distinct.
 const rate=(second:number)=>second>0&&(second+pauseOffset)%period===0?0:Math.max(10,Math.min(70,base*(1+.18*Math.sin(second*.73+phase)+.08*Math.sin(second*1.91+phase))));
 let characters=0;
 for(let i=0;i<Math.floor(time);i++)characters+=rate(i)*5/60;
 characters+=rate(Math.floor(time))*(time%1)*5/60;
 return {characters,wpm:elapsed<delay?0:Math.round(rate(Math.floor(time)))};
}

// Percent chances follow the catalog order. Premium cars remain possible but rare.
export const BOT_CAR_WEIGHTS=[22,17,14,12,10,8,6,5,3,2,1] as const;
export function botCarIndex(id:string,raceSeed:number){
 let hash=2166136261;
 for(const char of 'car:'+id+':'+raceSeed)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 // Avalanche the hash so neighboring round seeds do not produce neighboring cars.
 hash=Math.imul(hash^(hash>>>16),0x7feb352d);hash=Math.imul(hash^(hash>>>15),0x846ca68b);hash^=hash>>>16;
 let draw=(hash>>>0)/4294967296*100;
 for(let i=0;i<BOT_CAR_WEIGHTS.length;i++){draw-=BOT_CAR_WEIGHTS[i];if(draw<0)return i;}
 return 0;
}
