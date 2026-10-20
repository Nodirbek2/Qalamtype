import React,{useEffect,useRef} from 'react';
import {roadStripeOffset} from '../lib/raceEngine';
import {CARS} from '../lib/raceCareer';
import {advanceCar,cameraPosition,carScreenX,TRACK_METRES} from '../lib/racePhysics';
import {RacingCar} from './RacingCar';
import type {Language} from '../types';
import {raceText} from '../data/raceI18n';
export type RaceDriver={id:string;name:string;progress:number;wpm:number;isBot?:boolean;carIndex?:number;finishedAt?:number};
type Props={players:RaceDriver[];me:string;equipped:string;phase:string;paused:boolean;track:'city'|'coast'|'forest';language:Language;onSpeed:(speed:number)=>void;children?:React.ReactNode};
export function RaceScene(props:Props){
 const root=useRef<HTMLDivElement>(null),road=useRef<HTMLDivElement>(null);const latest=useRef(props);latest.current=props;
 const cars=useRef(new Map<string,HTMLDivElement>());const motion=useRef(new Map<string,{position:number;last:number;speed:number}>());
 useEffect(()=>{
  motion.current.clear();let frame=0,last=performance.now(),lastUi=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate=(now:number)=>{const dt=Math.min(.1,(now-last)/1000);last=now;const p=latest.current,width=road.current?.clientWidth||900;const active=p.phase==='racing'&&!p.paused;
   const positions=p.players.map(driver=>{let m=motion.current.get(driver.id);const target=driver.progress/100*TRACK_METRES;if(!m){m={position:target,last:target,speed:0};motion.current.set(driver.id,m)}const next=p.paused?m.position:reduced?target:advanceCar(m.position,target,dt);const velocity=active?Math.max(0,(next-m.position)/Math.max(.001,dt)):0;m.last=m.position;m.position=next;m.speed+= (velocity-m.speed)*(1-Math.exp(-dt/.16));return {driver,m};});
   const self=positions.find(x=>x.driver.id===p.me);const camera=cameraPosition(self?.m.position||0,width);const el=root.current;
   if(el){el.style.setProperty('--qr-stripe-offset',`${roadStripeOffset(camera)}px`);el.style.setProperty('--qr-camera',`${-camera}px`);el.style.setProperty('--qr-sky-camera',`${-camera*.16}px`);el.style.setProperty('--qr-mountain-camera',`${-camera*.06}px`);el.style.setProperty('--qr-cloud-camera',`${-camera*.025}px`);el.style.setProperty('--qr-engine',String(Math.min(1,(self?.m.speed||0)/35)));el.dataset.driving=String(active&&(self?.m.speed||0)>.1)}
   for(const {driver,m} of positions){const node=cars.current.get(driver.id);if(!node)continue;const x=carScreenX(m.position,camera);const carWidth=node.clientWidth;const off=x>width-carWidth?'ahead':x+carWidth<0?'behind':'';node.style.setProperty('--qr-x',`${Math.max(-carWidth,Math.min(width,x))}px`);node.style.setProperty('--qr-wheel-angle',`${m.position*6/18*180/Math.PI}deg`);node.style.setProperty('--qr-car-speed',String(active?Math.min(1,m.speed/35):0));node.style.setProperty('--qr-wheel-duration',`${Math.max(.08,2/(1+m.speed))}s`);node.dataset.off=off;node.dataset.moving=String(active&&m.speed>.1);node.style.setProperty('--qr-pitch',`${active?Math.min(2,m.speed/30):0}deg`);const indicator=node.querySelector<HTMLElement>('.qr-distance');if(indicator)indicator.textContent=`${off==='behind'?'‹':'›'} ${Math.abs(Math.round((driver.progress-(self?.driver.progress||0))/100*TRACK_METRES))} m`;}
   if(now-lastUi>80){p.onSpeed(active?(self?.m.speed||0):0);lastUi=now;}
   frame=requestAnimationFrame(animate);
  };frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[props.me,props.phase==='countdown']);
 const u=(key:Parameters<typeof raceText>[1])=>raceText(props.language,key);
 return <div ref={root} className={`qr-track qr-track-${props.track} qr-physical-scene`}>
 <div className="qr-sky"><span className="qr-moon"/><div className="qr-clouds"/><div className="qr-mountains"/><div className="qr-skyline">{Array.from({length:60},(_,i)=><i key={i} style={{height:`${20+(i*29)%65}px`,width:`${18+(i*13)%32}px`}}/>)}</div><span className="qr-track-title">{u(props.track)}</span></div><div className="qr-barrier"/>
 <div ref={road} className="qr-road"><div className="qr-road-marks"/><div className="qr-finish" style={{left:'6000px',transform:'translateX(var(--qr-camera,0px))'}}/>{props.players.map((driver,index)=>{const own=driver.id===props.me,model=own?(CARS.find(c=>c.id===props.equipped)||CARS[0]):(driver.isBot?CARS[driver.carIndex??0]||CARS[0]:CARS[(index*3+2)%CARS.length]);return <div ref={el=>{if(el)cars.current.set(driver.id,el);else cars.current.delete(driver.id)}} className={'qr-racer '+(own?'qr-racer-self':'')} key={driver.id} style={{top:`${index/props.players.length*100}%`,height:`${100/props.players.length}%`}}><span className="qr-driver-name">{own?u('you'):driver.name}<small>{driver.isBot?' · '+u('bot'):''} · {driver.wpm} WPM</small></span><span className="qr-distance"/><div className="qr-car-bounce"><span className="qr-exhaust"/><span className="qr-dust"><i/><i/><i/></span><RacingCar color={model.color} shape={model.shape}/></div></div>})}</div><div className="qr-barrier qr-barrier-bottom"/>
 <div className="qr-mini-track" aria-label={u('raceProgress')}>{props.players.map((driver,i)=><i key={driver.id} className={driver.id===props.me?'qr-mini-self':''} style={{left:`${Math.max(1,Math.min(99,driver.progress))}%`,top:`${4+i*5}px`}} title={`${driver.name}: ${Math.round(driver.progress)}%`}/>)}</div>{props.children}
 </div>
}
