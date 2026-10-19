import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Heart, Radio, X } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

const CARD_NUMBER = '9860 6004 0932 1194';
const labels = {
  uzbek_latin: {button:'Donat',title:'Qalamtype’ni qo‘llab-quvvatlang',description:'Loyiha sizga foydali bo‘lsa, rivojlanishiga hissa qo‘shishingiz mumkin. Rahmat!',card:'DONAT UCHUN KARTA',copy:'Karta raqamini nusxalash',copied:'Nusxalandi!',close:'Yopish',failed:'Nusxalab bo‘lmadi. Raqamni belgilang va nusxalang.'},
  uzbek_cyrillic: {button:'Донат',title:'Qalamtype’ни қўллаб-қувватланг',description:'Лойиҳа сизга фойдали бўлса, ривожланишига ҳисса қўшишингиз мумкин. Раҳмат!',card:'ДОНАТ УЧУН КАРТА',copy:'Карта рақамини нусхалаш',copied:'Нусхаланди!',close:'Ёпиш',failed:'Нусхалаб бўлмади. Рақамни белгиланг ва нусхаланг.'},
  russian: {button:'Донат',title:'Поддержите Qalamtype',description:'Если проект вам полезен, вы можете помочь ему развиваться. Спасибо!',card:'КАРТА ДЛЯ ПОДДЕРЖКИ',copy:'Скопировать номер карты',copied:'Скопировано!',close:'Закрыть',failed:'Не удалось скопировать. Выделите и скопируйте номер.'},
  english: {button:'Donate',title:'Support Qalamtype',description:'If Qalamtype helps you, you can help it grow. Thank you for your support!',card:'SUPPORT CARD',copy:'Copy card number',copied:'Copied!',close:'Close',failed:'Could not copy. Select and copy the number instead.'},
};
export function DonationButton({onClick}:{onClick:()=>void}) {
  const {siteLanguage}=useSettings();
  return <button type="button" className="donation-launch" onClick={onClick}><Heart size={18} fill="currentColor"/><span>{labels[siteLanguage].button}</span><span aria-hidden="true">↗</span></button>;
}
export function Donation({onClose}:{onClose:()=>void}) {
  const {siteLanguage}=useSettings();const t=labels[siteLanguage];
  const dialog=useRef<HTMLDialogElement>(null); const [status,setStatus]=useState<'idle'|'copied'|'failed'>('idle');
  useEffect(()=>{const element=dialog.current; element?.showModal();return()=>element?.close();},[]);
  const reducedMotion = useReducedMotion();
  const yaw = useMotionValue(0), tiltX = useMotionValue(0), tiltY = useMotionValue(0);
  const smoothYaw = useSpring(yaw, {stiffness:65, damping:20, mass:1.1});
  const smoothX = useSpring(tiltX, {stiffness:65, damping:20});
  const smoothY = useSpring(tiltY, {stiffness:65, damping:20});
  const drag = useRef<{id:number;x:number;yaw:number}|null>(null);
  const [back, setBack] = useState(false);
  const cardText = {
    uzbek_latin: {flip:'Kartani o‘girish',hint:'Sichqoncha bilan burang · aylantirish uchun ushlab torting',creator:'Qalamtype yaratuvchisi'},
    uzbek_cyrillic: {flip:'Картани ўгириш',hint:'Сичқонча билан буринг · айлантириш учун ушлаб тортинг',creator:'Qalamtype яратувчиси'},
    russian: {flip:'Перевернуть карту',hint:'Наведите мышь · удерживайте и тяните для вращения',creator:'Создатель Qalamtype'},
    english: {flip:'Flip card',hint:'Move to tilt · hold and drag to rotate',creator:'Creator of Qalamtype'},
  }[siteLanguage];
  function rotate(degrees:number) {const next=yaw.get()+degrees;yaw.set(next);setBack(Math.cos(next*Math.PI/180)<0);}
  function move(event:React.PointerEvent<HTMLDivElement>) {
    if(reducedMotion) return;
    if(drag.current?.id===event.pointerId) {
      const next=drag.current.yaw+(event.clientX-drag.current.x)*0.45;
      yaw.set(next);setBack(Math.cos(next*Math.PI/180)<0);return;
    }
    if(event.pointerType!=='mouse') return;
    const bounds=event.currentTarget.getBoundingClientRect();
    tiltX.set(-((event.clientY-bounds.top)/bounds.height-.5)*12);
    tiltY.set(((event.clientX-bounds.left)/bounds.width-.5)*15);
  }
  function release(event:React.PointerEvent<HTMLDivElement>) {
    if(drag.current?.id!==event.pointerId) return;
    drag.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const snapped=Math.round(yaw.get()/180)*180;
    yaw.set(snapped);setBack(Math.cos(snapped*Math.PI/180)<0);tiltX.set(0);tiltY.set(0);
  }
  async function copy(){try {await navigator.clipboard.writeText(CARD_NUMBER.replaceAll(' ',''));setStatus('copied');}catch {setStatus('failed');}}
  return <dialog ref={dialog} className="donation-dialog" aria-labelledby="donation-title" aria-describedby="donation-description" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const box=e.currentTarget.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)onClose();}}}>
    <button className="donation-close" type="button" aria-label={t.close} onClick={onClose}><X size={20}/></button>
    <div className="donation-heart" aria-hidden="true"><Heart size={25} fill="currentColor"/></div>
    <h2 id="donation-title">{t.title}</h2><p id="donation-description">{t.description}</p>
    <div className="donation-card-stage" onPointerMove={move}
      onPointerDown={event=>{if(reducedMotion||event.button!==0)return;drag.current={id:event.pointerId,x:event.clientX,yaw:yaw.get()};event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerUp={release} onPointerCancel={release}
      onLostPointerCapture={()=>{drag.current=null;}}
      onPointerLeave={()=>{if(!drag.current){tiltX.set(0);tiltY.set(0);}}}>
      <motion.div className="donation-card-tilt" style={{rotateX:reducedMotion?0:smoothX,rotateY:reducedMotion?0:smoothY}}>
      <motion.div className="donation-card-rotor" style={{rotateY:reducedMotion?(back?180:0):smoothYaw}}>
      <div className="donation-card donation-card-front" aria-hidden={back}>
      <div className="card-shine" aria-hidden="true"/>
      <div className="card-top"><span>qalam<span>type</span></span><Heart size={19}/></div>
      <div className="card-chip-row"><span className="card-chip" aria-hidden="true"/><Radio size={23} aria-hidden="true"/></div>
      <p className="card-number" aria-label={CARD_NUMBER}>{CARD_NUMBER}</p>
      <div className="card-bottom"><span>{t.card}</span><span aria-hidden="true">✦</span></div>
      </div>
      <div className="donation-card donation-card-back" aria-hidden={!back}>
        <div className="card-top"><span>qalam<span>type</span></span><span className="card-back-mark" aria-hidden="true">✦</span></div>
        <div className="card-creator"><span className="card-creator-label">{cardText.creator}</span><strong>Baratov<br/>Nodirbek</strong></div>
        <div className="card-bottom"><span>qalamtype.uz</span><span>{cardText.creator}</span></div>
      </div>
      </motion.div></motion.div>
    </div>
    <p className="donation-card-hint">{cardText.hint}</p>
    <div className="donation-card-controls"><button type="button" onClick={()=>rotate(180)}>{cardText.flip} ↻</button></div>
    <button className="donation-copy" type="button" onClick={()=>void copy()}>{status==='copied'?<Check size={17}/>:<Copy size={17}/>} {status==='copied'?t.copied:t.copy}</button>
    <div role="status" className="donation-status">{status==='failed'?t.failed:status==='copied'?t.copied:''}</div>
  </dialog>;
}
