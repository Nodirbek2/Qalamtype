import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      {/* Chili Pepper + Caret / I-Beam SVG Icon */}
      <div className={`${iconSizes[size]} text-[#E85D3D] transition-transform duration-200 group-hover:scale-105 flex items-center justify-center`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Stem on top */}
          <path
            d="M17 3C17 3 19 4 18 6.5C17.5 7.7 16 8.5 16 8.5"
            stroke="#6FA85C"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* I-beam top bar integrated into stem base */}
          <path
            d="M10 8.5H22"
            stroke="#E85D3D"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Main Chili Pepper Body with Caret Notch cut out */}
          {/* Left curved edge */}
          <path
            d="M10 8.5C10 8.5 9 14 10.5 18C12 22 14.5 26.5 16 29.5C16.5 27 18.5 22.5 20 18.5C21.5 14.5 22 8.5 22 8.5H10Z"
            fill="#E85D3D"
          />
          {/* Caret notch cutout (background color #0F0E0D fill) */}
          <path
            d="M16 13L13 17H19L16 13Z"
            fill="#0F0E0D"
          />
          {/* I-beam bottom bar */}
          <path
            d="M12 29.5H20"
            stroke="#E85D3D"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-mono font-medium tracking-tight text-[#E8E2D8] ${textSizes[size]}`}>
          qalampir
        </span>
      )}
    </div>
  );
};
