import React from 'react';
import { CaretSpeed, CARET_SPEED_MS } from '../types';

interface CaretProps {
  top: number;
  left: number;
  height: number;
  speed?: CaretSpeed;
  isIdle?: boolean;
}

export const Caret: React.FC<CaretProps> = ({
  top,
  left,
  height,
  speed = 'medium',
  isIdle = false,
}) => {
  const transitionMs = CARET_SPEED_MS[speed];

  return (
    <div
      className={`absolute w-[2.5px] bg-[#E85D3D] rounded-full pointer-events-none z-10 ${
        isIdle ? 'animate-caret-blink' : ''
      }`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        height: `${height}px`,
        transition: speed === 'off' ? 'none' : `left ${transitionMs}ms cubic-bezier(0.2, 0, 0, 1), top ${transitionMs}ms cubic-bezier(0.2, 0, 0, 1)`,
      }}
    />
  );
};
