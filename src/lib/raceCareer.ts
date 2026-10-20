export const CARS = [
 {id:'spark',name:'Spark',price:0,color:'#D6F36B',shape:0},
 {id:'comet',name:'Comet',price:200,color:'#63D9DA',shape:1},
 {id:'pulse',name:'Pulse',price:500,color:'#71D9AF',shape:2},
 {id:'phantom',name:'Phantom',price:1000,color:'#A6B1C5',shape:3},
 {id:'apex',name:'Apex',price:2000,color:'#E6C681',shape:4},
] as const;
export type Career={coins:number;xp:number;trophies:number;races:number;words:number;best_wpm:number;total_accuracy:number;total_seconds:number;owned:string[];equipped:string};
export type Reward={coins:number;xp:number;trophies:number;wpm:number;accuracy:number;words:number};
export const emptyCareer=():Career=>({coins:0,xp:0,trophies:0,races:0,words:0,best_wpm:0,total_accuracy:0,total_seconds:0,owned:['spark'],equipped:'spark'});
export function rewardFor(text:string,seconds:number,errors:number):Reward{
 const words=text.trim().split(/\s+/).length, accuracy=Math.round(1000*text.length/(text.length+Math.max(0,errors)))/10;
 return {words,accuracy,wpm:Math.round(text.length*12/Math.max(1,seconds)),coins:20+Math.floor(words/3)+Math.floor(accuracy/10),xp:words+Math.floor(accuracy/5),trophies:10+Math.floor(accuracy/20)};
}
export function addReward(c:Career,r:Reward,seconds:number):Career{return {...c,coins:c.coins+r.coins,xp:c.xp+r.xp,trophies:c.trophies+r.trophies,races:c.races+1,words:c.words+r.words,best_wpm:Math.max(c.best_wpm,r.wpm),total_accuracy:c.total_accuracy+r.accuracy,total_seconds:c.total_seconds+seconds};}
export function equipCar(c:Career,id:string):Career {
 const car=CARS.find(x=>x.id===id);if(!car)throw Error('invalid_car');
 const price=c.owned.includes(id)?0:car.price;if(c.coins<price)throw Error('insufficient_coins');
 return {...c,coins:c.coins-price,equipped:id,owned:c.owned.includes(id)?c.owned:[...c.owned,id]};
}
export function careerLevel(xp:number){const level=Math.floor(Math.sqrt(xp/100))+1;const floor=(level-1)**2*100, next=level**2*100;return {level,progress:(xp-floor)/(next-floor)*100,next};}
export function leagueIndex(trophies:number){return trophies>=3000?4:trophies>=1500?3:trophies>=600?2:trophies>=200?1:0;}
export function readGuestCareer():Career {try{const value=JSON.parse(localStorage.getItem('qalamtype-race-career-v1')||'null');if(!value)return emptyCareer();const base=emptyCareer();for(const key of ['coins','xp','trophies','races','words','best_wpm','total_accuracy','total_seconds'] as const)base[key]=Number.isFinite(value[key])&&value[key]>=0?value[key]:0;base.owned=Array.isArray(value.owned)?value.owned.filter((id:unknown)=>CARS.some(c=>c.id===id)):['spark'];if(!base.owned.includes('spark'))base.owned.unshift('spark');base.equipped=base.owned.includes(value.equipped)?value.equipped:'spark';return base;}catch{return emptyCareer();}}
