import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Heart, Radio, X } from 'lucide-react';
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
  async function copy(){try {await navigator.clipboard.writeText(CARD_NUMBER.replaceAll(' ',''));setStatus('copied');}catch {setStatus('failed');}}
  return <dialog ref={dialog} className="donation-dialog" aria-labelledby="donation-title" aria-describedby="donation-description" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const box=e.currentTarget.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)onClose();}}}>
    <button className="donation-close" type="button" aria-label={t.close} onClick={onClose}><X size={20}/></button>
    <div className="donation-heart" aria-hidden="true"><Heart size={25} fill="currentColor"/></div>
    <h2 id="donation-title">{t.title}</h2><p id="donation-description">{t.description}</p>
    <div className="donation-card">
      <div className="card-shine" aria-hidden="true"/>
      <div className="card-top"><span>qalam<span>type</span></span><Heart size={19}/></div>
      <div className="card-chip-row"><span className="card-chip" aria-hidden="true"/><Radio size={23} aria-hidden="true"/></div>
      <p className="card-number" aria-label={CARD_NUMBER}>{CARD_NUMBER}</p>
      <div className="card-bottom"><span>{t.card}</span><span aria-hidden="true">✦</span></div>
    </div>
    <button className="donation-copy" type="button" onClick={()=>void copy()}>{status==='copied'?<Check size={17}/>:<Copy size={17}/>} {status==='copied'?t.copied:t.copy}</button>
    <div role="status" className="donation-status">{status==='failed'?t.failed:status==='copied'?t.copied:''}</div>
  </dialog>;
}
