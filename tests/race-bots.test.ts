import {test} from 'node:test';
import assert from 'node:assert/strict';
import {botPerformance,botCarIndex,BOT_CAR_WEIGHTS} from '../src/lib/raceBots';
test('every bot can draw slow, medium or fast pace independently across races',()=>{
 for(const id of ['bot-0','bot-1','bot-2','bot-fill-1','bot-fill-2']){
  const averages=Array.from({length:150},(_,seed)=>botPerformance(id,seed,120).characters/10);
  assert.ok(averages.some(v=>v>=10&&v<=20),id+' slow');
  assert.ok(averages.some(v=>v>=30&&v<=40),id+' medium');
  assert.ok(averages.some(v=>v>=50),id+' fast');
  assert.ok(new Set(averages.map(v=>Math.round(v))).size>30);
 }
 const pace=(id:string,seed:number)=>botPerformance(id,seed,120).characters;
 assert.ok(Array.from({length:100},(_,seed)=>pace('bot-0',seed)>pace('bot-2',seed)).some(Boolean));
 assert.ok(Array.from({length:100},(_,seed)=>pace('bot-0',seed)<pace('bot-2',seed)).some(Boolean));
});
test('random opponents remain bounded, pause, and preserve deterministic monotonic progress',()=>{
 for(const seed of [1,100,17891])for(const id of ['bot-0','bot-1','bot-2']){
  const speeds=Array.from({length:120},(_,t)=>botPerformance(id,seed,t).wpm);
  assert.ok(speeds.slice(3).includes(0));assert.ok(new Set(speeds).size>5);
  assert.ok(speeds.every(v=>v===0||(v>=10&&v<=70)));
  let last=0;for(let t=0;t<120;t+=.1){const p=botPerformance(id,seed,t);assert.ok(p.characters>=last);last=p.characters;}
  assert.deepEqual(botPerformance(id,seed,49.35),botPerformance(id,seed,49.35));
 }
});

test('bot cars shuffle per round and premium cars are rare, with stable assignments',()=>{
 assert.equal(BOT_CAR_WEIGHTS.reduce((sum,v)=>sum+v,0),100);
 const counts=Array(11).fill(0);
 for(let seed=0;seed<10000;seed++)for(const id of ['bot-0','bot-1','bot-2']){
  const index=botCarIndex(id,seed);counts[index]++;assert.equal(botCarIndex(id,seed),index);
 }
 assert.ok(counts.every(v=>v>0));
 assert.ok(counts.slice(0,5).reduce((a,b)=>a+b,0)>22000);
 const premium=counts.slice(8).reduce((a,b)=>a+b,0);assert.ok(premium>1200&&premium<2400);
 assert.ok(counts[0]>counts[10]*12);
 for(const id of ['bot-0','bot-1','bot-2'])assert.ok(new Set(Array.from({length:1000},(_,seed)=>botCarIndex(id,seed))).size===11);
});
