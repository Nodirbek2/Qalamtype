import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ENGINE_VOICES,engineVoice,roadStripeOffset} from '../src/lib/raceEngine';
import {CARS} from '../src/lib/raceCareer';
test('every selectable car has its own engine voice',()=>{
 assert.equal(Object.keys(ENGINE_VOICES).length,CARS.length);
 assert.equal(new Set(CARS.map(car=>JSON.stringify(engineVoice(car.id)))).size,CARS.length);
 for(const car of CARS){const voice=engineVoice(car.id);assert.ok(voice.idle>0&&voice.rev>0);}
});
test('road markings remain within one seamless tile at the beginning, middle and finish',()=>{
 for(const camera of [0,99,100,250,1200,3500,5750,6000,60000]){
  const offset=roadStripeOffset(camera);assert.ok(offset<=0&&offset>-100);
  assert.equal(Math.abs(roadStripeOffset(camera+100)-offset),0);
 }
});
