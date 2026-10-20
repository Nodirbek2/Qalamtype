export const TRACK_METRES=1000;
export function advanceCar(position:number,target:number,dt:number){return Math.min(target,position+(target-position)*(1-Math.exp(-Math.max(0,Math.min(.1,dt))/.065)));}
export function cameraPosition(playerMetres:number,width:number){return Math.max(0,playerMetres*6-width*.24);}
export function carScreenX(metres:number,camera:number){return metres*6-camera;}
export function leagueWindow(rank:number,total:number){return {start:Math.max(1,rank-4),end:Math.min(total,rank+4)};}
