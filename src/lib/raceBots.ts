// Deterministic, elapsed-time based typing: the same round is shared by online clients.
export function botPerformance(id:string,raceSeed:number,elapsed:number){
 let seed=2166136261;
 for(const char of id+':'+raceSeed)seed=Math.imul(seed^char.charCodeAt(0),16777619);
 const random=()=>{seed=(seed+0x6D2B79F5)|0;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296};
 const slot=Math.min(2,Number(id.match(/(\d+)$/)?.[1]||0));
 const base=[15,25,40][slot]+(random()-.5)*3;
 const delay=.7+random()*1.4,period=11+Math.floor(random()*8),phase=random()*Math.PI*2;
 const time=Math.max(0,elapsed-delay);
 // Short pauses model thinking/correcting mistakes; bursts remain bounded and distinct.
 const rate=(second:number)=>second>0&&(second+slot*3)%period===0?0:base*(1+.15*Math.sin(second*.73+phase)+.06*Math.sin(second*1.91+phase));
 let characters=0;
 for(let i=0;i<Math.floor(time);i++)characters+=rate(i)*5/60;
 characters+=rate(Math.floor(time))*(time%1)*5/60;
 return {characters,wpm:elapsed<delay?0:Math.round(rate(Math.floor(time)))};
}
