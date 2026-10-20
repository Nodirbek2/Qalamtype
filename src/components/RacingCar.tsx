import React, {useId} from 'react';
// Wheel centres use source image coordinates, preserving the original rims while rotating.
const models = [
 ['tico',1774,887,278,1455,666,105],
 ['jiguli',1774,887,423,1470,650,98],
 ['nexia1',1774,887,403,1423,636,96],
 ['nexia2',1774,887,419,1443,633,94],
 ['spark',1774,887,294,1398,695,107],
 ['lacetti',1774,887,372,1395,646,95],
 ['cobalt',1774,887,330,1394,649,100],
 ['gentra',1774,887,365,1394,617,94],
 ['malibu',1983,793,448,1597,567,111],
 ['tahoe',1774,887,391,1458,630,110],
 ['gwagon',1774,887,378,1467,655,119],
] as const;
function RacingCarDrawing({shape=0}: {color?:string;shape?:number}) {
 const id=useId().replace(/:/g,'');
 const [name,width,height,rear,front,y,radius]=models[shape]||models[0];
 const href=`/images/race-cars-v3/${name}.webp`;
 return <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="qr-car-svg" data-car-model={name}>
  <defs>{[rear,front].map((x,i)=><clipPath id={`${id}-wheel-${i}`} key={i}><circle cx={x} cy={y} r={radius}/></clipPath>)}</defs>
  <image href={href} width={width} height={height}/>
  {[rear,front].map((x,i)=><g key={i} className="qr-wheel" style={{transformOrigin:`${x}px ${y}px`}}>
   <g clipPath={`url(#${id}-wheel-${i})`}><image href={href} width={width} height={height}/></g>
  </g>)}
 </svg>;
}
export const RacingCar=React.memo(RacingCarDrawing);
