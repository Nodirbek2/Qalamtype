import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyCareer,rewardFor,addReward,equipCar,careerLevel,leagueIndex} from '../src/lib/raceCareer';
import {raceLabels} from '../src/data/raceI18n';
test('completed race rewards grow with accuracy and balances pay for cosmetics only once',()=>{
 const text='A calm driver types accurately and keeps a steady rhythm.';
 const clean=rewardFor(text,30,0),errors=rewardFor(text,30,10);
 assert.ok(clean.coins>errors.coins);assert.equal(clean.wpm,Math.round(text.length*12/30));assert.equal(clean.accuracy,100);
 let career=emptyCareer();for(let i=0;i<8;i++)career=addReward(career,clean,30);
 const before=career.coins;career=equipCar(career,'comet');assert.equal(career.coins,before-200);assert.ok(career.owned.includes('comet'));
 career=equipCar(career,'spark');career=equipCar(career,'comet');assert.equal(career.coins,before-200);
 assert.throws(()=>equipCar(career,'apex'),/insufficient/);assert.throws(()=>equipCar(career,'invented'),/invalid/);
 assert.equal(career.races,8);assert.equal(career.total_seconds,240);assert.equal(career.total_accuracy,800);
});
test('career levels and leagues advance at exact boundaries without negative progress',()=>{
 assert.equal(careerLevel(0).level,1);assert.equal(careerLevel(100).level,2);assert.equal(careerLevel(400).level,3);
 for(let xp=0;xp<10000;xp+=19){const level=careerLevel(xp);assert.ok(level.progress>=0&&level.progress<100);assert.ok(level.next>xp)}
 assert.deepEqual([0,199,200,600,1500,3000].map(leagueIndex),[0,0,1,2,3,4]);
});
test('every racing interface message is present in all four system languages',()=>{
 const keys=Object.keys(raceLabels.english).sort();for(const labels of Object.values(raceLabels)){assert.deepEqual(Object.keys(labels).sort(),keys);for(const text of Object.values(labels))assert.ok(text.trim().length)}
 assert.equal(raceLabels.uzbek_latin.race,'Poyga');assert.equal(raceLabels.english.race,'Race');
});
