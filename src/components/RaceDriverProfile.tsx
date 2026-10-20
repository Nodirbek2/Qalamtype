import {createPortal} from 'react-dom';
import React,{useEffect,useRef,useState} from 'react';
import {X,Trophy} from 'lucide-react';
import {supabase} from '../lib/supabase';
import {CARS,LEAGUES,leagueIndex} from '../lib/raceCareer';
import {raceText,type RaceLabel} from '../data/raceI18n';
import type {Language} from '../types';
export type DriverSelection={user_id:string;username:string;position:number;scope:'league'|'words'};
type Stats={equipped:string;trophies:number;words:number;races:number;best_wpm:number};
export function RaceDriverProfile({driver,language,onClose}:{driver:DriverSelection;language:Language;onClose:()=>void}){
 const [stats,setStats]=useState<Stats|null>(null),[status,setStatus]=useState('loading'),[retry,setRetry]=useState(0);
 const close=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLElement|null>(null);
 const u=(key:RaceLabel)=>raceText(language,key);
 useEffect(()=>{trigger.current=document.activeElement as HTMLElement;close.current?.focus();return()=>{trigger.current?.focus()}},[]);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)},[onClose]);
 useEffect(()=>{let live=true;setStats(null);setStatus('loading');
 supabase.from('race_careers').select('equipped,trophies,words,races,best_wpm').eq('user_id',driver.user_id).maybeSingle().then(({data,error})=>{if(!live)return;setStats(data);setStatus(error?'error':data?'ready':'empty')});
 return()=>{live=false}},[driver.user_id,retry]);
 const car=CARS.find(c=>c.id===stats?.equipped)||CARS[0];
 return createPortal(<div className="qr-profile-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><section className="qr-driver-profile" role="dialog" aria-modal="true" aria-labelledby="qr-profile-title" onKeyDown={e=>{if(e.key==='Tab'){const buttons=e.currentTarget.querySelectorAll<HTMLButtonElement>('button');const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}}>
 <button ref={close} className="qr-profile-close" onClick={onClose} aria-label={u('closeProfile')}><X size={20}/></button>
 <span className="qr-kicker">{u('driverProfile')}</span><h2 id="qr-profile-title">{driver.username}</h2>
 <span className="qr-profile-place">#{driver.position} · {driver.scope==='league'?u('league'):u('words')}</span>
 {status==='loading'?<p role="status">{u('loading')}</p>:status==='error'?<button onClick={()=>setRetry(n=>n+1)}>{u('error')}</button>:!stats?<p>{u('empty')}</p>:<>
 <div className="qr-profile-car"><img src={'/images/race-cars-v3/'+car.id+'.webp'} alt={car.name}/><span>{u('carModel')}</span><strong>{car.name}</strong></div>
 <div className="qr-profile-league"><Trophy size={22}/><strong>{u(LEAGUES[leagueIndex(stats.trophies)].key)}</strong><span>{stats.trophies.toLocaleString()} {u('trophies')}</span></div>
 <dl className="qr-profile-stats"><div><dt>{u('words')}</dt><dd>{stats.words.toLocaleString()}</dd></div><div><dt>{u('races')}</dt><dd>{stats.races.toLocaleString()}</dd></div><div className="qr-profile-best"><dt>{u('bestRace')}</dt><dd>{stats.best_wpm}<small> WPM</small></dd></div></dl></>}
 </section></div>,document.body)
}
