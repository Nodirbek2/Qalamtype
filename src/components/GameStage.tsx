import React, {useEffect, useRef, useState} from 'react';
import {Maximize, Minimize} from 'lucide-react';
export function GameStage({children, expandLabel, shrinkLabel, enabled=true,autoExpand=false}: {children:React.ReactNode; expandLabel:string; shrinkLabel:string;enabled?:boolean;autoExpand?:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  const [large,setLarge]=useState(autoExpand);
  useEffect(()=>{
    const sync=()=>setLarge(document.fullscreenElement===host.current);
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!autoExpand)setLarge(false)};
    document.addEventListener('fullscreenchange',sync);
    window.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('fullscreenchange',sync);window.removeEventListener('keydown',escape)};
  },[autoExpand]);
  useEffect(()=>{if(!large)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[large]);
  useEffect(()=>{if(!large)return;const viewport=window.visualViewport;const size=()=>{host.current?.style.setProperty('--qr-stage-height',`${viewport?.height||window.innerHeight}px`);host.current?.style.setProperty('--qr-stage-top',`${viewport?.offsetTop||0}px`)};size();viewport?.addEventListener('resize',size);viewport?.addEventListener('scroll',size);window.addEventListener('resize',size);return()=>{viewport?.removeEventListener('resize',size);viewport?.removeEventListener('scroll',size);window.removeEventListener('resize',size)}},[large]);
  useEffect(()=>{if(autoExpand)void host.current?.requestFullscreen?.().catch(()=>{/* The viewport overlay remains active when native fullscreen is unavailable. */})},[autoExpand]);
  async function toggle(){
    if(large){if(document.fullscreenElement===host.current)await document.exitFullscreen().catch(()=>{});setLarge(false)}
    else {setLarge(true);await host.current?.requestFullscreen?.().catch(()=>{/* Fixed overlay supports browsers without fullscreen. */})}
  }
  return <div ref={host} className={'game-stage'+(large?' game-stage-large':'')}>
    {enabled && <div className="game-stage-toolbar"><button type="button" aria-pressed={large} onClick={()=>void toggle()}>{large?<Minimize size={17}/>:<Maximize size={17}/>} {large?shrinkLabel:expandLabel}</button></div>}
    {children}
  </div>;
}
