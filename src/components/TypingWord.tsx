import React, { memo } from 'react';
import type { WordDisplayInfo } from '../hooks/useTypingEngine';

interface Props {
  word: WordDisplayInfo;
  activeCharRef: React.RefObject<HTMLSpanElement | null>;
}

export const TypingWord = memo(function TypingWord({ word, activeCharRef }: Props) {
  return <span className="inline-flex flex-wrap relative my-0.5">
    {word.chars.map(char => {
      let color = 'text-[#748199]', background = '';
      if (char.status === 'correct') color = 'text-[#F0F3FA]';
      else if (char.status === 'incorrect') {
        color = 'text-[#D64545] underline decoration-[#D64545] decoration-2';
        background = 'bg-[#D64545]/15 rounded-sm';
      } else if (char.status === 'extra') {
        color = 'text-[#D64545]/80 line-through';
        background = 'bg-[#D64545]/20 rounded-sm';
      }
      return <span key={char.globalIndex}
        ref={char.isCurrent || char.isCurrentRight ? activeCharRef : null}
        data-char-idx={char.globalIndex} data-caret-pos={char.isCurrentRight ? 'right' : 'left'}
        className={`relative px-[0.5px] ${color} ${background}`}>
        {char.isSpace ? '\u00A0' : char.char}
      </span>;
    })}
  </span>;
}, (previous, next) => previous.activeCharRef === next.activeCharRef &&
  previous.word.chars.length === next.word.chars.length &&
  previous.word.chars.every((char, index) => {
    const other = next.word.chars[index];
    return char.char === other.char && char.status === other.status &&
      char.globalIndex === other.globalIndex && char.isCurrent === other.isCurrent &&
      char.isCurrentRight === other.isCurrentRight && char.isSpace === other.isSpace;
  }));
