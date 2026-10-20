export const RACE_CITIES=['city','coast','forest'] as const;
export type RaceCity=typeof RACE_CITIES[number];
// Shared countdown seed keeps online racers in the same city for the whole race.
export function raceCity(seed:number):RaceCity{
 let value=seed|0;
 value=Math.imul(value^(value>>>16),0x7feb352d);
 value=Math.imul(value^(value>>>15),0x846ca68b);
 return RACE_CITIES[((value^(value>>>16))>>>0)%RACE_CITIES.length];
}
export function landmarkOffset(camera:number,tileWidth=1800){return -((Math.max(0,camera)*.4)%Math.max(1,tileWidth));}
