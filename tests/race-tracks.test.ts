import {test} from 'node:test';
import assert from 'node:assert/strict';
import {raceCity,landmarkOffset} from '../src/lib/raceTracks';
import {raceWorldActive} from '../src/lib/raceLifecycle';
test('all three cities occur, and online peers select the same city for the same countdown',()=>{
 const cities=new Set(Array.from({length:300},(_,seed)=>raceCity(seed)));
 assert.equal(cities.size,3);
 for(const seed of [178901001,178901555,178902999])assert.equal(raceCity(seed),raceCity(seed));
});
test('panorama stays within its repeating tile throughout and after a race',()=>{
 for(const camera of [0,1000,6000,10000,60000]){
  const offset=landmarkOffset(camera);assert.ok(offset<=0&&offset>-1800);
 }
});
test('opponents continue after the user finishes; exit/new countdown and timeout stop them',()=>{
 assert.equal(raceWorldActive('racing',false),true);
 assert.equal(raceWorldActive('finished',false),true);
 for(const phase of ['ready','matching','countdown'])assert.equal(raceWorldActive(phase,false),false);
 assert.equal(raceWorldActive('finished',true),false);
});
