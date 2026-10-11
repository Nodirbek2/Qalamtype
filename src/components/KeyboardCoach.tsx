import React, { useState } from 'react';
import type { Language } from '../types';
import { academyCopy, defaultLayout, fingerFor, KEY_ROWS, keyGuide, keyLabel, KeyboardLayout } from '../lib/academyLearning';
const colors = ['#ee91b5','#ebb875','#d8dc78','#7ed4b2','#63d9da','#63d9da','#7ed4b2','#d8dc78','#ebb875','#ee91b5'];
function Hand({right, active}: {right:boolean; active:number[]}) {
  const fingers = right ? [9,8,7,6] : [0,1,2,3];
  return <svg viewBox="0 0 160 150" className="coach-hand" aria-hidden="true">
    <g transform={right ? 'translate(160 0) scale(-1 1)' : undefined}>
      <path d="M28 74 Q24 96 37 119 L43 145 H111 L116 116 Q135 103 141 80 L133 68 Q126 65 121 77 L115 89 V65 H28Z" fill="#222e40" stroke="#40506a" strokeWidth="2" />
      {fingers.map((finger, i) => <rect key={finger} x={28+i*23} y={[41,22,14,28][i]} width="20" height={[48,66,74,60][i]} rx="10" fill={active.includes(finger) ? colors[finger] : '#263449'} stroke={active.includes(finger) ? '#f0f3fa' : '#40506a'} strokeWidth="2" />)}
      <path d="M114 97 L124 71 Q131 54 141 64 Q150 69 142 83 L132 107" fill={active.includes(right ? 5 : 4) ? colors[4] : '#263449'} stroke={active.includes(right ? 5 : 4) ? '#f0f3fa' : '#40506a'} strokeWidth="2" />
    </g>
  </svg>;
}
export function KeyboardCoach({nextChar, language, uiLanguage}: {nextChar:string; language:Language; uiLanguage:Language}) {
  const [visible,setVisible] = useState(true);
  const [layout,setLayout] = useState<KeyboardLayout>(()=>defaultLayout(language));
  const c = academyCopy[uiLanguage];
  const guide = keyGuide(nextChar,layout);
  const shiftKey = guide?.shift ? (guide.finger < 5 ? 'ShiftRight' : 'ShiftLeft') : null;
  const active = guide ? [guide.finger, ...(shiftKey ? [shiftKey === 'ShiftLeft' ? 0 : 9] : [])] : [];
  const fingerLabel = guide ? `${c[guide.finger < 5 ? 14 : 15]} ${c[16 + (guide.finger < 5 ? guide.finger : 9-guide.finger)]}` : '';
  return <section className="keyboard-coach">
    <div className="coach-heading"><span>{c[10]}</span><button type="button" onClick={()=>setVisible(v=>!v)} aria-expanded={visible}>{c[visible ? 12 : 11]}</button></div>
    {visible && <>
      <div className="coach-instruction"><kbd>{nextChar === ' ' ? '␣' : nextChar}</kbd><div><strong>{c[8]}: {nextChar === ' ' ? c[13] : nextChar}</strong><p>{guide ? fingerLabel : c[32]}{shiftKey ? ` · ${c[22]}` : ''}</p></div>
        <label className="coach-layout"><span className="sr-only">{c[10]}</span><select value={layout} onChange={e=>setLayout(e.target.value as KeyboardLayout)}><option value="latin">QWERTY · Latin</option><option value="russian">ЙЦУКЕН · Русский</option><option value="uzbek">Ўзбек · Кирилл</option></select></label>
      </div>
      <div className="coach-keys" aria-label={c[10]}>
        {KEY_ROWS.map((row,i)=><div className={`coach-row coach-row-${i}`} key={i}>{row.map(key=>{
          const highlighted = key === guide?.key || key === shiftKey;
          const label = key === 'Space' ? c[13] : key === 'Backspace' ? '⌫' : key.startsWith('Shift') ? 'Shift' : keyLabel(key,layout);
          return <span key={key} className={`coach-key ${key.length > 1 ? 'coach-wide' : ''} ${key === 'Space' ? 'coach-space' : ''} ${highlighted ? 'coach-active' : ''} ${key === 'f' || key === 'j' ? 'coach-home' : ''}`} style={{'--finger-color':colors[fingerFor(key)]} as React.CSSProperties}>{label}</span>;
        })}</div>)}
      </div>
      <div className="coach-hands"><div><Hand right={false} active={active}/><span>{c[14]}</span></div><p>{c[9]}<small>{c[21]}</small></p><div><Hand right active={active}/><span>{c[15]}</span></div></div>
    </>}
  </section>;
}
