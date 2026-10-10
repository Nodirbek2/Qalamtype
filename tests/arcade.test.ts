import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {battleReducer,initialBattle,correctPrefix} from '../src/lib/arcadeRules.ts';
import {gameText} from '../src/data/gameI18n.ts';

test('only a correct prefix advances the car; Uzbek apostrophes are equivalent',()=>{
  assert.equal(correctPrefix('o\'zbek','o‘zbek'),6);
  assert.equal(correctPrefix('hello WRONG','hello world'),6);
  assert.equal(correctPrefix('xxxxx','hello'),0);
  assert.equal(correctPrefix('hello world','hello world'),11);
});
test('three bosses, victory is terminal, and a replay resets the battle',()=>{
  let s=battleReducer(initialBattle,{type:'start',now:1000});
  for(let i=1;i<=18;i++)s=battleReducer(s,{type:'hit',now:1000+i*300});
  assert.equal(s.status,'won');assert.equal(s.hits,18);assert.equal(s.best,18);
  assert.deepEqual(battleReducer(s,{type:'tick',now:100000}),s);
  s=battleReducer(s,{type:'start',now:100001});assert.equal(s.hits,0);assert.equal(s.health,100);
});
test('pause excludes elapsed wall time and freezes incoming attacks',()=>{
  let s=battleReducer(initialBattle,{type:'start',now:1000});
  s=battleReducer(s,{type:'pause',now:5000});
  assert.deepEqual(battleReducer(s,{type:'tick',now:90000}),s);
  assert.deepEqual(battleReducer(s,{type:'hit',now:90000}),s);
  s=battleReducer(s,{type:'resume',now:95000});
  s=battleReducer(s,{type:'tick',now:98999});assert.equal(s.health,100);
  s=battleReducer(s,{type:'tick',now:99000});assert.equal(s.health,85);
});
test('difficulty changes attack cadence; missed ticks and defeat resolve correctly',()=>{
  for(const interval of [6000,8000,12000]){
    let s=battleReducer(initialBattle,{type:'start',now:1000,interval});
    s=battleReducer(s,{type:'tick',now:1000+interval-1});assert.equal(s.health,100);
    s=battleReducer(s,{type:'tick',now:1000+interval*7});assert.equal(s.status,'lost');
    assert.equal(s.health,0);
  }
});
test('mistakes break combo without pretending to be a boss attack; shields restore health',()=>{
  let s=battleReducer(initialBattle,{type:'start',now:1000});
  s=battleReducer(s,{type:'tick',now:9000});assert.equal(s.health,85);
  for(let i=0;i<3;i++)s=battleReducer(s,{type:'hit',now:9001+i});
  assert.equal(s.health,90);assert.equal(s.effect,'shield');
  s=battleReducer(s,{type:'miss',now:10000});assert.equal(s.combo,0);assert.equal(s.health,90);assert.equal(s.effect,'miss');
});
test('every game translation has all four variants and identical interpolation variables',()=>{
  const source=readFileSync(new URL('../src/data/gameI18n.ts',import.meta.url),'utf8');
  const keys=[...source.matchAll(/^  "([^"]+)":/gm)].map(m=>m[1]);
  for(const key of new Set(keys)){
    const english=gameText('english',key as any);
    for(const lang of ['uzbek_latin','uzbek_cyrillic','russian','english'] as const){
      const text=gameText(lang,key as any);assert.ok(text.length);
      assert.deepEqual(text.match(/\{\w+\}/g)?.sort()||[],english.match(/\{\w+\}/g)?.sort()||[]);
    }
  }
  assert.equal(gameText('uzbek_latin','games'),'O‘yinlar');
  assert.equal(gameText('russian','games'),'Игры');
  assert.equal(gameText('english','games'),'Games');
  assert.equal(gameText('russian','placed',{rank:2}),'Вы финишировали на месте №2');
});
test('all literal game labels resolve and both navbar layouts use the translated label',()=>{
  const source=readFileSync(new URL('../src/components/GamesView.tsx',import.meta.url),'utf8');
  for(const match of source.matchAll(/\bg\('([^']+)'/g))assert.ok(gameText('english',match[1] as any));
  const nav=readFileSync(new URL('../src/components/Navbar.tsx',import.meta.url),'utf8');
  assert.equal((nav.match(/<span>\{label\}<\/span>/g)||[]).length,4);
});
