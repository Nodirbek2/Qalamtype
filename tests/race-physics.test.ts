import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceCar,carScreenX,cameraPosition,leagueWindow} from '../src/lib/racePhysics';
function run(rate:number,fps:number){let position=0;for(let frame=1;frame<=fps*5;frame++){const target=Math.floor(frame/fps*rate)*3;position=advanceCar(position,target,1/fps)}return position;}
test('faster correct typing travels farther, with stable 30/60fps motion',()=>{
 const fast=run(10,60),slow=run(3,60);assert.ok(fast>slow*3);assert.ok(Math.abs(fast-run(10,30))<2);
 let p=40;for(let n=0;n<60;n++)p=advanceCar(p,40,1/60);assert.equal(p,40,'stalled typing must not add distance');
 p=0;for(let n=0;n<90;n++){p=advanceCar(p,100,1/60);assert.ok(p<=100)}assert.ok(p>99.9,'motion catches up without overshoot');
});
test('one shared camera preserves actual distance differences between cars',()=>{
 const camera=cameraPosition(200,1000);assert.equal(carScreenX(200,camera),240);assert.equal(carScreenX(300,camera)-carScreenX(200,camera),600);
 assert.equal(cameraPosition(0,1000),0);
});
test('league neighborhood shows exactly four positions on either side, bounded at ends',()=>{
 assert.deepEqual(leagueWindow(23,100),{start:19,end:27});assert.deepEqual(leagueWindow(1,100),{start:1,end:5});assert.deepEqual(leagueWindow(100,100),{start:96,end:100});
});
