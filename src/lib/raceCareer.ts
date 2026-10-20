export const CARS = [
 {id:'tico',name:'Tiko',price:0,color:'#D6F36B',shape:0},
 {id:'jiguli',name:'Jiguli',price:150,color:'#E6C681',shape:1},
 {id:'nexia1',name:'Nexia 1',price:350,color:'#C7D2DF',shape:2},
 {id:'nexia2',name:'Nexia 2',price:650,color:'#A8C5CE',shape:3},
 {id:'spark',name:'Spark',price:1000,color:'#71D9AF',shape:4},
 {id:'lacetti',name:'Lacetti',price:1500,color:'#CCD3DB',shape:5},
 {id:'cobalt',name:'Cobalt',price:2200,color:'#D8E4EE',shape:6},
 {id:'gentra',name:'Gentra',price:3200,color:'#859DB2',shape:7},
 {id:'malibu',name:'Malibu',price:5000,color:'#63D9DA',shape:8},
 {id:'tahoe',name:'Tahoe',price:8000,color:'#ADB8C3',shape:9},
 {id:'gwagon',name:'G-wagon',price:12000,color:'#606F7E',shape:10},
] as const;
export const LEAGUES=[
 {key:'bronze',min:0,max:199}, {key:'silver',min:200,max:699},
 {key:'gold',min:700,max:1999}, {key:'platinum',min:2000,max:4999},
 {key:'diamond',min:5000,max:null},
] as const;
export function migrateLegacyCars(value:{owned?:string[];equipped?:string;coins?:number}){
 const map:Record<string,string>={spark:'tico',comet:'jiguli',pulse:'nexia1',phantom:'nexia2',apex:'lacetti'};
 const refunds:Record<string,number>={comet:50,pulse:150,phantom:350,apex:500};
 const old=Array.isArray(value.owned)?value.owned:['spark'];
 return {...value,coins:(value.coins||0)+[...new Set(old)].reduce((n,id)=>n+(refunds[id]||0),0),owned:[...new Set(['tico',...old.map(id=>map[id]||id)])],equipped:map[value.equipped||'spark']||value.equipped||'tico'};
}
export type Career={coins:number;xp:number;trophies:number;races:number;words:number;best_wpm:number;total_accuracy:number;total_seconds:number;owned:string[];equipped:string};
export type Reward={coins:number;xp:number;trophies:number;wpm:number;accuracy:number;words:number};
export const emptyCareer=():Career=>({coins:0,xp:0,trophies:0,races:0,words:0,best_wpm:0,total_accuracy:0,total_seconds:0,owned:['tico'],equipped:'tico'});
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
export function leagueIndex(trophies:number){return trophies>=5000?4:trophies>=2000?3:trophies>=700?2:trophies>=200?1:0;}
export const CAREER_STORAGE='qalamtype-race-career-v2';
export function readGuestCareer():Career {try{
 const saved=localStorage.getItem(CAREER_STORAGE);const legacy=!saved&&localStorage.getItem('qalamtype-race-career-v1');
 const raw=JSON.parse(saved||legacy||'null');if(!raw)return emptyCareer();const value=legacy?migrateLegacyCars(raw):raw;
 const base=emptyCareer();for(const key of ['coins','xp','trophies','races','words','best_wpm','total_accuracy','total_seconds'] as const)base[key]=Number.isFinite(value[key])&&value[key]>=0?value[key]:0;
 base.owned=Array.isArray(value.owned)?value.owned.filter((id:unknown)=>CARS.some(c=>c.id===id)):['tico'];if(!base.owned.includes('tico'))base.owned.unshift('tico');
 base.equipped=base.owned.includes(value.equipped)?value.equipped:'tico';return base;
 }catch{return emptyCareer();}}
