import React from 'react';
import { CaretSpeed, CARET_SPEED_MS } from '../types';

interface CaretProps {
  x: number;
  y: number;
  height?: number;
  speed?: CaretSpeed;
  isIdle?: boolean;
  visible?: boolean;
}

export const Caret: React.FC<CaretProps> = React.memo(({
  x,
  y,
  height = 28,
  speed = 'medium',
  isIdle = false,
  visible = true,
}) => {
  if (!visible) return null;

  const transitionMs = CARET_SPEED_MS[speed] ?? 90;

  const transitionStyle =
    speed === 'off' || transitionMs === 0
      ? 'none'
      : `transform ${transitionMs}ms cubic-bezier(0.0, 0.0, 0.2, 1), height ${transitionMs}ms cubic-bezier(0.0, 0.0, 0.2, 1)`;

  return (
    <div
      className={`absolute top-0 left-0 w-[2.5px] bg-[#E85D3D] rounded-full pointer-events-none z-10 will-change-transform ${
        isIdle ? 'animate-caret-blink' : ''
      }`}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        height: `${height}px`,
        transition: transitionStyle,
      }}
    />
  );
});
