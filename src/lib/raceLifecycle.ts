// Finishing your own passage ends scoring, not the opponents' race.
export function raceWorldActive(phase:string,timedOut:boolean){
 return phase==='racing'||(phase==='finished'&&!timedOut);
}
