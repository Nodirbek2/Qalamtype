import React,{useId} from 'react';
// Original vector artwork based on real side-profile proportions, not shared stock sprites.
const profiles=[
 {body:'M29 92L27 45L39 25L126 24L153 60L186 66L196 86L192 105H26Z',windows:['M38 45L44 30H76V59H34Z','M83 30H120L137 59H83Z'],rear:54,front:166,wheel:18,roof:24,kind:'hatch'},
 {body:'M14 79L17 61H53L80 27H153L180 60L224 65L234 80V104H12Z',windows:['M62 59L84 33H112V59Z','M120 33H149L170 59H120Z'],rear:48,front:198,wheel:18,roof:27,kind:'classic'},
 {body:'M12 85L18 67L58 58L88 30Q121 22 150 31L181 58L224 65L237 83L232 103H12Z',windows:['M66 58L91 35H117V58Z','M124 34L147 36L173 59H124Z'],rear:49,front:200,wheel:18,roof:28,kind:'nexia1'},
 {body:'M11 86L17 67L59 58L89 30Q122 24 151 32L181 58L225 62L239 81L234 104H11Z',windows:['M67 58L92 35H118V58Z','M125 35L147 37L174 59H125Z'],rear:49,front:201,wheel:19,roof:28,kind:'nexia2'},
 {body:'M28 91L24 57L40 31Q77 10 115 22L158 53L187 67L202 89L193 106H26Z',windows:['M37 56L48 35L78 29V59Z','M86 29L111 29L148 57H86Z'],rear:54,front:171,wheel:19,roof:23,kind:'spark'},
 {body:'M11 87L22 67L61 59L94 29Q128 17 159 32L185 57L223 65L239 86L231 105H12Z',windows:['M70 58L98 34L123 30V58Z','M131 30L155 36L176 58H131Z'],rear:49,front:202,wheel:19,roof:25,kind:'lacetti'},
 {body:'M14 90L19 66L63 60L88 31Q117 17 155 28L186 59L222 66L237 88L229 106H14Z',windows:['M71 59L93 35L118 30V59Z','M126 30L151 33L177 60H126Z'],rear:51,front:201,wheel:20,roof:25,kind:'cobalt'},
 {body:'M11 88L20 68L61 59L94 29Q128 17 159 32L185 57L224 65L240 85L233 105H12Z',windows:['M70 58L98 34L123 30V58Z','M131 30L155 36L176 58H131Z'],rear:49,front:202,wheel:20,roof:25,kind:'gentra'},
 {body:'M8 91L20 74L60 62L104 28Q139 15 169 32L191 57L231 69L246 88L236 106H9Z',windows:['M72 60L108 33L134 29V59Z','M143 30L164 36L184 58H143Z'],rear:50,front:210,wheel:21,roof:26,kind:'malibu'},
 {body:'M10 89L15 26Q18 18 29 18H170L191 46L230 51L241 71V108H10Z',windows:['M22 30H65V55H21Z','M73 28H119V55H73Z','M127 28H164L181 53H127Z'],rear:48,front:204,wheel:23,roof:18,kind:'tahoe'},
 {body:'M20 91V24L31 17H162L174 46L219 49L230 67V109H19Z',windows:['M31 29H69V55H30Z','M78 28H118V55H78Z','M128 28H157L166 54H128Z'],rear:52,front:196,wheel:23,roof:17,kind:'gwagon'},
];
export function RacingCar({color='#D6F36B',shape=0}:{color?:string;shape?:number}){
 const id=useId().replace(/:/g,'');const m=profiles[shape]||profiles[0];const suv=shape>=9,sedan=shape!==0&&shape!==4&&!suv;
 return <svg viewBox="0 0 260 140" aria-hidden="true" className="qr-car-svg"><defs><linearGradient id={id+'paint'} x2=".15" y2="1"><stop stopColor="#fff" stopOpacity=".68"/><stop offset=".4" stopColor={color}/><stop offset=".73" stopColor={color}/><stop offset="1" stopColor="#101824" stopOpacity=".8"/></linearGradient><linearGradient id={id+'glass'} x2=".8" y2="1"><stop stopColor="#7394a9"/><stop offset=".5" stopColor="#23384a"/><stop offset="1" stopColor="#10202e"/></linearGradient></defs>
 <ellipse cx="126" cy="123" rx={suv?118:110} ry="8" fill="#0005"/>
 {m.kind==='gwagon'&&<g><rect x="8" y="51" width="18" height="46" rx="7" fill="#202833" stroke="#9cabb7" strokeWidth="2"/><rect x="11" y="56" width="10" height="35" rx="4" fill={color}/></g>}
 <path d={m.body} fill={color} stroke="#111d2a" strokeWidth="2"/><path d={m.body} fill={`url(#${id}paint)`}/>
 {m.windows.map((d,i)=><path key={i} d={d} fill={`url(#${id}glass)`} stroke="#dce5ee99" strokeWidth="1.8"/>)}
 <path d={suv?'M25 64H222M75 58V102M123 58V103M173 59V102':sedan?'M56 65L182 65M118 60L120 102M179 62L181 101':'M33 65H158M81 61V102M144 62L150 103'} stroke="#17233366" fill="none" strokeWidth="1.2"/>
 <path d={suv?'M27 84H222':sedan?'M25 82L218 80':'M32 81H187'} stroke="#15253299" strokeWidth={shape===1?4:2}/><path d={suv?'M28 68H220':'M33 70L213 69'} stroke="#ffffff66" strokeWidth="1.5"/>
 {(suv?[94,147]:sedan?[95,157]:[62,117]).map(x=><rect key={x} x={x} y={suv?64:66} width="12" height="3" rx="1.5" fill={shape===1?'#dce1db':'#dfe7ed99'}/>)}
 <path d={shape===0?'M151 57L162 62L159 68H151Z':suv?'M165 47L181 50V59L167 57Z':'M171 55L184 60L181 66H171Z'} fill={color} stroke="#11223288"/>
 {shape===1?<><rect x="216" y="67" width="15" height="14" rx="1" fill="#f9edbe"/><path d="M220 85H234V92H216M14 88H32V94H12" stroke="#c4c9c4" strokeWidth="4"/><rect x="15" y="68" width="10" height="13" fill="#d57a66"/></>:shape===0?<><rect x="181" y="68" width="12" height="12" rx="1" fill="#f9edbe"/><rect x="27" y="69" width="9" height="13" fill="#cd7865"/><path d="M26 91H39M180 91H196" stroke="#1b2630" strokeWidth="9"/></>:<><path d={suv?'M220 55H236V76H220Z':shape===4?'M176 58L194 75L192 88L182 77Z':shape===2?'M215 67L234 73V81H214Z':shape===3?'M214 64L236 75L232 85L212 78Z':shape===6?'M213 65L233 74L232 89L211 78Z':'M214 68L237 79L234 85L213 78Z'} fill="#eef5d7" stroke="#cad6bd"/><path d={suv?'M14 45H23V79H14Z':'M15 72H30V84H13Z'} fill="#d77869"/><path d={suv?'M216 82H238V99H215Z':'M220 87H237V98H218Z'} fill="#142330"/>{[0,1,2].map(i=><path key={i} d={`M${suv?218:221} ${90+i*3}h${suv?18:13}`} stroke="#8b9ca5" strokeWidth="1"/>)}</>}
 {shape===9&&<><path d="M25 16H156M31 11V20M149 11V20" stroke="#a4b0ba" strokeWidth="3"/><path d="M25 104H225" stroke="#15202b" strokeWidth="8"/></>}
 {shape===10&&<><path d="M28 17H160M41 62V69M85 61V68M130 61V68" stroke="#aab6bf" strokeWidth="3"/><path d="M31 106H215" stroke="#18242e" strokeWidth="6"/><circle cx="226" cy="68" r="5" fill="#f5e9c1"/></>}
 {sedan&&<path d={shape===8?'M20 101Q130 108 235 99':'M20 102H228'} stroke="#172330" strokeWidth="4"/>}
 {[m.rear,m.front].map(x=><g key={x} className="qr-wheel" style={{transformOrigin:`${x}px 106px`}}><circle cx={x} cy="106" r={m.wheel} fill="#111821" stroke="#080e15" strokeWidth="3"/><circle cx={x} cy="106" r={m.wheel*.72} fill={shape<3?'#b3b7b4':'#b8c5ce'}/><circle cx={x} cy="106" r={m.wheel*.48} fill="#253442"/>{Array.from({length:shape<3?4:5},(_,i)=><path key={i} d={`M${x} ${106-m.wheel*.66}V${106+m.wheel*.66}`} stroke="#d7e0e6" strokeWidth="2.4" transform={`rotate(${i*(shape<3?45:36)} ${x} 106)`}/>)}<circle cx={x} cy="106" r="3.5" fill="#c2cdd4"/></g>)}
 </svg>
}
