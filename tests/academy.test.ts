import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMY_TIERS } from '../src/data/academyData';
import { academyAccuracy, calculateTierStars, lessonUnlocked, keyGuide, keyLabel, KEY_ROWS } from '../src/lib/academyLearning';

test('beginner rewards prioritize accuracy, not typing speed; later goals remain achievable', () => {
  for (const tier of [1,5]) {
    assert.equal(calculateTierStars(tier, 3, 90),3);
    assert.equal(calculateTierStars(tier, 30, 80),2);
    assert.equal(calculateTierStars(tier, 40, 59),0);
  }
  assert.equal(calculateTierStars(2,30,92),3);
  assert.equal(calculateTierStars(8,40,92),3);
  assert.equal(calculateTierStars(8,5,98),3);
  assert.equal(calculateTierStars(8,40,85),2);
  assert.equal(calculateTierStars(1,NaN,100),0);
  assert.equal(academyAccuracy({correctChars:4,totalTyped:4,missedChars:6}),40);
});
test('curriculum moves from short letters to numbers and words, with stable unique lesson IDs',()=>{
  const lessons=ACADEMY_TIERS.flatMap(t=>t.lessons);
  assert.deepEqual(ACADEMY_TIERS.slice(0,3).map(t=>t.number),[1,5,2]);
  assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
  for(const tier of ACADEMY_TIERS) for(const [i,l] of tier.lessons.entries()) {
    assert.equal(l.tierNumber,tier.number);
    assert.equal(l.lessonNumber,i+1);
    for(const text of Object.values(l.content)) assert.ok(typeof text==='string'&&text.trim().length>0);
  }
  assert.ok(lessons[0].content.english.length<50);
  assert.match(lessons[0].content.english,/^[fj ]+$/);
  const progress={ [lessons[0].id]:{completed:true,stars:1,bestWpm:1,bestAccuracy:65} };
  assert.equal(lessonUnlocked(lessons[0],lessons,{}),true);
  assert.equal(lessonUnlocked(lessons[1],lessons,progress),true);
  assert.equal(lessonUnlocked(lessons[2],lessons,progress),false);
  const old={t2_l1:{completed:true,stars:3,bestWpm:30,bestAccuracy:99}};
  assert.equal(lessonUnlocked(lessons.find(l=>l.id==='t2_l1')!,lessons,old),true);
});
test('guidance maps letters, digits, Shift symbols, spaces, and Cyrillic physical keys',()=>{
  assert.deepEqual(keyGuide('f','latin'),{key:'f',shift:false,finger:3});
  assert.deepEqual(keyGuide('J','latin'),{key:'j',shift:true,finger:6});
  assert.equal(keyGuide('@','latin')?.key,'2');
  assert.equal(keyGuide('?','russian')?.key,'7');
  assert.equal(keyGuide('Ў','uzbek')?.key,'o');
  assert.equal(keyGuide('қ','uzbek')?.key,'s');
  assert.equal(keyGuide('ғ','uzbek')?.key,'-');
  assert.equal(keyGuide('ҳ','uzbek')?.key,'=');
  assert.equal(keyGuide(' ','latin')?.key,'Space');
  assert.equal(keyGuide('☃','latin'),null);
  for(const layout of ['latin','russian','uzbek'] as const) for(const key of KEY_ROWS.flat().filter(k=>k.length===1)) {
    assert.equal(keyGuide(keyLabel(key,layout),layout)?.key,key);
  }
});
