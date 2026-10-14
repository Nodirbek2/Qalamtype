import React from 'react';
import type {Battle} from '../lib/arcadeRules';
import './battleArena.css';
function Wizard(){return <svg viewBox="0 0 200 260" aria-hidden="true">
 <ellipse cx="94" cy="248" rx="65" ry="10" fill="#0006"/>
 <g className="fighter-body"><path className="wizard-cape" d="M72 92Q20 135 25 230L100 215L135 104Z" fill="#16355e" stroke="#4e83b7" strokeWidth="3"/>
 <g className="wizard-leg-back"><path d="M89 185L73 228L55 238H89L109 185" fill="#162236" stroke="#7a93b6" strokeWidth="4"/></g><g className="wizard-leg-front"><path d="M113 183L132 226L157 236H126L95 191" fill="#20384d" stroke="#7a93b6" strokeWidth="4"/></g>
 <path d="M71 94Q94 82 117 98L138 195L64 200Z" fill="#2c9a9b" stroke="#8be0d3" strokeWidth="3"/><path d="M95 104L92 184M67 179L130 174" stroke="#e6bb64" strokeWidth="7"/><circle cx="98" cy="177" r="9" fill="#f4dd8a"/>
 <g className="wizard-arm-back"><path d="M73 107L47 143L64 161" fill="none" stroke="#28777e" strokeWidth="21" strokeLinecap="round"/><circle cx="64" cy="161" r="9" fill="#edbc94"/></g>
 <g className="fighter-head"><path d="M73 46Q91 24 114 44L119 71Q111 92 94 91Q77 86 73 66Z" fill="#edbc94" stroke="#a97563" strokeWidth="2"/><path d="M72 47L75 74L82 64L83 43M111 43L120 74L120 50" fill="#dae7ed"/><path d="M83 75L113 72L98 105Z" fill="#e5eef0"/><path d="M85 59h7m13 0h7" stroke="#18283e" strokeWidth="4" strokeLinecap="round"/><path d="M99 60l-3 10h8" fill="none" stroke="#ba8a71" strokeWidth="2"/>
 <path d="M54 44L99 4L128 44Z" fill="#276b8b" stroke="#76d8d0" strokeWidth="3"/><path d="M52 45Q95 59 139 42" fill="none" stroke="#e7c377" strokeWidth="7"/><path d="M95 17l4 8 8 2-8 3-3 8-3-8-7-3 7-2Z" fill="#e7dc9b"/></g>
 <g className="wizard-cast-arm"><path d="M116 111L140 131L165 105" fill="none" stroke="#42b8ad" strokeWidth="20" strokeLinecap="round"/><circle cx="166" cy="106" r="10" fill="#efc49c"/>
 <g className="wizard-staff"><path d="M164 224L177 67" stroke="#735135" strokeWidth="8"/><path d="M164 223L177 70" stroke="#caa868" strokeWidth="3"/><path d="M176 80L158 57L178 31L197 58Z" fill="#9ffff0" stroke="#e6fff5" strokeWidth="3"/><path d="M176 80L180 35L193 57Z" fill="#46c7e0"/><circle className="staff-glow" cx="178" cy="58" r="24" fill="#6bfff433"/></g></g>
 </g></svg>}
function Enemy({wave}:{wave:number}){const colors=[['#586d96','#96b7d9'],['#804b37','#d6a568'],['#784195','#d6a0f4']][wave];return <svg viewBox="0 0 240 280" aria-hidden="true"><ellipse cx="127" cy="266" rx="95" ry="12" fill="#0007"/>
 <g className="fighter-body">
 {wave===2 && <g className="enemy-wings"><path d="M89 119Q22 16 8 61L22 135L48 112L57 159L94 155M148 119Q213 18 230 53L218 137L189 110L180 159L146 155" fill="#49306c" stroke="#a678c4" strokeWidth="4"/></g>}
 <g className="enemy-leg-back"><path d="M142 187L173 227L201 254H150L119 190Z" fill={colors[0]} stroke={colors[1]} strokeWidth="4"/></g><g className="enemy-leg-front"><path d="M99 187L78 223L52 254H107L127 191Z" fill={colors[0]} stroke={colors[1]} strokeWidth="4"/></g>
 <path d="M84 97L147 95L173 195Q126 216 71 193Z" fill={colors[0]} stroke={colors[1]} strokeWidth="4"/>
 {wave===0?<><path d="M75 104L110 92L121 126L83 143M160 104L131 92L121 126L162 141" fill="#c0d4e4" stroke="#566680" strokeWidth="3"/><path d="M91 143L145 141L151 180L84 183Z" fill="#253d57"/><path d="M102 159h31" stroke="#79d8f0" strokeWidth="5"/></>:wave===1?<><path d="M93 111L147 116L157 181L91 182Z" fill="#422b25"/><path className="enemy-core" d="M117 127L140 145L118 174L102 148Z" fill="#ffb74d"/><path d="M91 121l-9 18 10 11m63-19-13 17 13 18" stroke="#efc06e" fill="none" strokeWidth="3"/></>:<><path d="M114 102Q80 154 101 193L142 192Q158 144 132 103" fill="#d5b8d3"/><path d="M100 134h42m-43 18h48m-45 18h43" stroke="#825477" strokeWidth="4"/></>}
 <g className="enemy-arm-back"><path d="M154 114L182 146L177 181" stroke={colors[0]} strokeWidth="30" fill="none" strokeLinecap="round"/><path d="M169 170L182 170L194 192L175 198Z" fill={colors[1]}/></g>
 <g className="fighter-head"><path d="M83 56Q117 29 151 58L148 98L116 111L85 94Z" fill={colors[0]} stroke={colors[1]} strokeWidth="4"/>
 {wave===0?<><path d="M86 61L119 48L148 62L139 95L93 93Z" fill="#263950"/><path d="M94 73h44" stroke="#ffb569" strokeWidth="5"/><path d="M118 58v45M90 90l48-1" stroke="#849bb7" strokeWidth="5"/><path d="M118 48L104 16L132 30L129 48" fill="#b978ae"/></>:<><path d="M88 66L61 27L66 60L90 83M147 63L178 22L169 60L146 81" fill="#dfcba3" stroke="#897669" strokeWidth="3"/><path d="M91 72l20 6m17 0 18-9" stroke={wave===1?'#ffd86a':'#72fff1'} strokeWidth="6"/><path d="M102 91l14 8 22-10" stroke="#231c2c" strokeWidth="6"/><path d="M109 91l4 10 6-10m8-1 5 8 4-11" fill="#fff2cf"/></>}
 </g>
 <g className="enemy-strike-arm"><path d="M86 113L62 132L43 115" stroke={colors[0]} strokeWidth="29" fill="none" strokeLinecap="round"/><circle cx="42" cy="114" r="15" fill={colors[1]}/>{wave===0?<g><path d="M41 117L15 42L22 12L37 37L50 109Z" fill="#cadfea" stroke="#7595b3" strokeWidth="3"/><path d="M28 111l35-12M46 113l7 20" stroke="#e9c97c" strokeWidth="7"/></g>:<circle className="enemy-core" cx="34" cy="109" r="21" fill={wave===1?'#ffb74d':'#ce7dff'} opacity=".8"/>}</g>
 </g></svg>}
export function BattleArena({battle,wave,heroLabel,enemyLabel,arenaLabel,hitLabel,shieldLabel}: {battle:Battle;wave:number;heroLabel:string;enemyLabel:string;arenaLabel:string;hitLabel:string;shieldLabel:string}) {
 const attacking=battle.effect==='hit'||battle.effect==='shield';
 return <div className="battle-scene" role="img" aria-label={`${arenaLabel}: ${heroLabel} — ${enemyLabel}`} data-paused={battle.paused || battle.status==='ready'} data-status={battle.status}>
  <div className="battle-moon"/><div className="battle-mountains"/><div className="battle-ruins"><i/><i/><i/><i/></div><div className="battle-ground"/><div className="battle-rune rune-hero"/><div className="battle-rune rune-enemy"/>
  <div key={`${battle.serial}-${wave}`} className={'battle-action action-'+battle.effect}>
   <div className={'battle-fighter battle-wizard '+(battle.status==='lost'?'fighter-fallen':battle.status==='won'?'fighter-victory':'')}><Wizard/></div>
   <div key={wave} className={'battle-fighter battle-enemy enemy-wave-'+wave+(battle.status==='won'?' fighter-fallen':'')}><Enemy wave={wave}/></div>
   {battle.serial>0 && <>
    {(attacking||battle.effect==='hurt') && <><div className={'battle-spell '+(attacking?'spell-player':'spell-enemy')}><i/><b/></div><div className={'battle-impact '+(attacking?'impact-enemy':'impact-player')}>{Array.from({length:8},(_,i)=><i key={i} style={{'--spark-angle':`${i*45}deg`} as React.CSSProperties}/>)}</div></>}
    {attacking && <div className="battle-pop">{hitLabel}</div>}
    {battle.effect==='hurt' && <div className="battle-pop pop-player">−15</div>}
    {battle.effect==='shield' && <><div className="battle-barrier"/><div className="battle-pop pop-shield">{shieldLabel}</div></>}
    {battle.effect==='miss' && <div className="battle-fizzle"/>}
   </>}
  </div>
  <div className="battle-name name-hero">{heroLabel}</div><div className="battle-name name-enemy">{enemyLabel}</div>
 </div>;
}
