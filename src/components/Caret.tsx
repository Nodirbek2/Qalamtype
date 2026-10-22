import React, { forwardRef } from 'react';
import { CaretSpeed, CARET_SPEED_MS } from '../types';

interface CaretProps {
  speed?: CaretSpeed;
  isIdle?: boolean;
}

// Position is written directly after text layout, without a second React render.
// Only transform animates: changing height must not trigger layout every frame.
export const Caret = React.memo(forwardRef<HTMLDivElement, CaretProps>(function Caret({
  speed = 'medium', isIdle = false,
}, ref) {
  const duration = CARET_SPEED_MS[speed] ?? 100;
  return <div ref={ref} aria-hidden="true" data-typing-caret="true"
    className={`absolute top-0 left-0 w-[2.5px] bg-[#D6F36B] rounded-full pointer-events-none z-10 will-change-transform ${isIdle ? 'animate-caret-blink' : ''}`}
    data-caret-duration={duration}
    style={{ height: '28px', transform: 'translate3d(0, 0, 0)' }}/>
}));
