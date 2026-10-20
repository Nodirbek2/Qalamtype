import {useCallback,useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {addReward,emptyCareer,equipCar,readGuestCareer,rewardFor,type Career,type Reward} from '../lib/raceCareer';
import type {Language} from '../types';
export function useRaceCareer(userId:string|undefined,language:Language){
 const [career,setCareer]=useState<Career>(emptyCareer);const [reward,setReward]=useState<Reward|null>(null);const [saving,setSaving]=useState(false);const [failed,setFailed]=useState(false);const [revision,setRevision]=useState(0);
 const account=useRef(userId);account.current=userId;
 const session=useRef<Promise<string|null>>(Promise.resolve(null));const pending=useRef<{text:string;seconds:number;errors:number;owner:string|undefined}|null>(null);const lock=useRef(false);
 const reload=useCallback(async()=>{if(!userId){setCareer(readGuestCareer());return;}const {data,error}=await supabase.from('race_careers').select('*').eq('user_id',userId).maybeSingle();if(account.current!==userId)return;if(error){setFailed(true);return;}setCareer(data||emptyCareer());},[userId]);
 useEffect(()=>{setCareer(emptyCareer());setReward(null);setFailed(false);void reload()},[reload]);
 const begin=useCallback((text:string,startsAt:number)=>{setReward(null);setFailed(false);pending.current=null;session.current=!userId?Promise.resolve(null):(async()=>{try{const {data,error}=await supabase.rpc('start_race_career',{p_language:language,p_passage:text,p_starts_at:new Date(startsAt).toISOString()});return error?null:data as string;}catch{return null;}})();},[userId,language]);
 const persist=useCallback(async()=>{
  if(lock.current||!pending.current)return;lock.current=true;setSaving(true);setFailed(false);const item=pending.current;
  try{
   if(item.owner!==account.current)throw Error('account_changed');
   let r=rewardFor(item.text,item.seconds,item.errors);
   if(item.owner){const id=await session.current;if(!id)throw Error('session_unavailable');const {data,error}=await supabase.rpc('finish_race_career',{p_session:id,p_text:item.text,p_seconds:item.seconds,p_errors:item.errors});if(error)throw error;r=data as Reward;if(item.owner!==account.current)return;await reload();}
   else {const next=addReward(readGuestCareer(),r,item.seconds);localStorage.setItem('qalamtype-race-career-v1',JSON.stringify(next));setCareer(next);}
   setReward(r);pending.current=null;setRevision(n=>n+1);
  }catch{setFailed(true)}finally{setSaving(false);lock.current=false;}
 },[reload]);
 const complete=useCallback((text:string,seconds:number,errors:number)=>{pending.current={text,seconds,errors,owner:userId};void persist()},[userId,persist]);
 const equip=async(id:string)=>{if(lock.current)return;lock.current=true;setSaving(true);setFailed(false);try{if(userId){const {data,error}=await supabase.rpc('equip_race_car',{p_car:id});if(error)throw error;if(account.current===userId)setCareer(data as Career);}else{const next=equipCar(readGuestCareer(),id);localStorage.setItem('qalamtype-race-career-v1',JSON.stringify(next));setCareer(next);}}catch{setFailed(true)}finally{lock.current=false;setSaving(false)}};
 return {career,reward,saving,failed,revision,begin,complete,equip,retry:persist,reload};
}
