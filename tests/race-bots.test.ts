import {test} from 'node:test';
import assert from 'node:assert/strict';
import {botPerformance} from '../src/lib/raceBots';
test('three opponents stay near 15, 25 and 40 WPM with individual human pauses',()=>{
 for(const seed of [1,100,17891])for(let slot=0;slot<3;slot++){
  const id='bot-'+slot,target=[15,25,40][slot];
  const average=botPerformance(id,seed,120).characters/5/2;
  assert.ok(Math.abs(average-target)<5,`${id}: ${average}`);
  const speeds=Array.from({length:120},(_,t)=>botPerformance(id,seed,t).wpm);
  assert.ok(speeds.slice(3).includes(0));assert.ok(new Set(speeds).size>5);
  let last=0;for(let t=0;t<120;t+=.1){const p=botPerformance(id,seed,t);assert.ok(p.characters>=last);last=p.characters;}
  assert.deepEqual(botPerformance(id,seed,49.35),botPerformance(id,seed,49.35));
 }
});
