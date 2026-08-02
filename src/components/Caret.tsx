import React from 'react';
import { CaretSpeed, CARET_SPEED_MS } from '../types';

interface CaretProps {
  top: number;
  left: number;
  height: number;
  speed?: CaretSpeed;
  isIdle?: boolean;
}

export const Caret: React.FC<CaretProps> = React.memo(({
  top,
  left,
  height,
  speed = 'medium',
  isIdle = false,
}) => {
  const transitionMs = CARET_SPEED_MS[speed];

  return (
    <div
      className={`absolute top-0 left-0 w-[2.5px] bg-[#E85D3D] rounded-full pointer-events-none z-10 will-change-transform ${
        isIdle ? 'animate-caret-blink' : ''
      }`}
      style={{
        height: `${height}px`,
        transform: `translate3d(${left}px, ${top}px, 0)`,
        transition:
          speed === 'off'
            ? 'none'
            : `transform ${transitionMs}ms cubic-bezier(0.2, 0, 0, 1)`,
      }}
    />
  );
});
