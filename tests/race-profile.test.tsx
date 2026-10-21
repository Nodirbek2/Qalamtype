import React from 'react';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {create,act} from 'react-test-renderer';
import {supabase} from '../src/lib/supabase';
import {RaceLeaderboard} from '../src/components/RaceLeaderboard';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
test('driver selection displays matching car and stats and ignores a stale response',async()=>{
 const original=supabase.from;
 const rows=[{user_id:'a',username:'Ali',total_words:900,races:10,best_wpm:110},{user_id:'b',username:'Vali',total_words:800,races:9,best_wpm:95}];
 let resolveA:(value:any)=>void=()=>{};
 (supabase as any).from=(table:string)=>({select:()=>{
  if(table==='race_leaderboard')return {order(){return this},limit:async()=>({data:rows,error:null})};
  return {eq:(_:string,id:string)=>({maybeSingle:()=>id==='a'?new Promise(resolve=>{resolveA=resolve}):Promise.resolve({data:{equipped:'malibu',trophies:400},error:null})})};
 }});
 let renderer:ReturnType<typeof create>;
 try{
 await act(async()=>{renderer=create(<RaceLeaderboard language="uzbek_latin" revision={0}/>)});
 const links=()=>renderer!.root.findAllByProps({className:'race-driver-link'});
 await act(async()=>links()[0].props.onClick());
 const tableRows=renderer!.root.findByType('tbody').findAllByType('tr');
 assert.equal(tableRows.length,3);
 assert.equal(tableRows[1].props.className,'race-profile-row');
 assert.equal(tableRows[1].findByType('td').props.colSpan,5);
 assert.equal(tableRows[2].findByType('button').children[0],'Vali');
 await act(async()=>links()[1].props.onClick());
 assert.equal(renderer!.root.findByType('img').props.alt,'Malibu');
 await act(async()=>resolveA({data:{equipped:'tico',trophies:10},error:null}));
 assert.equal(renderer!.root.findByType('img').props.alt,'Malibu');
 const values=renderer!.root.findAllByType('dd').map(n=>n.children.join(''));
 assert.ok(values.includes('400'));assert.ok(values.includes('800'));assert.equal(links()[1].props['aria-expanded'],true);
 await act(async()=>links()[1].props.onClick());
 assert.equal(renderer!.root.findAllByType('img').length,0);
 }finally{await act(async()=>renderer!.unmount());supabase.from=original}
});
