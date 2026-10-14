import React, {useEffect, useRef, useState} from 'react';
import {Maximize, Minimize} from 'lucide-react';
export function GameStage({children, expandLabel, shrinkLabel, enabled=true}: {children:React.ReactNode; expandLabel:string; shrinkLabel:string;enabled?:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  const [large,setLarge]=useState(false);
  useEffect(()=>{
    const sync=()=>setLarge(document.fullscreenElement===host.current);
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setLarge(false)};
    document.addEventListener('fullscreenchange',sync);
    window.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('fullscreenchange',sync);window.removeEventListener('keydown',escape)};
  },[]);
  useEffect(()=>{if(!large)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[large]);
  async function toggle(){
    if(large){if(document.fullscreenElement===host.current)await document.exitFullscreen().catch(()=>{});setLarge(false)}
    else {setLarge(true);await host.current?.requestFullscreen?.().catch(()=>{/* Fixed overlay supports browsers without fullscreen. */})}
  }
  return <div ref={host} className={'game-stage'+(large?' game-stage-large':'')}>
    {enabled && <div className="game-stage-toolbar"><button type="button" aria-pressed={large} onClick={()=>void toggle()}>{large?<Minimize size={17}/>:<Maximize size={17}/>} {large?shrinkLabel:expandLabel}</button></div>}
    {children}
  </div>;
}
