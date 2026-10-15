import React from 'react';

interface DoodleBackgroundProps {
  isDark: boolean;
}

export const DoodleBackground: React.FC<DoodleBackgroundProps> = ({ isDark }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        backgroundColor: isDark ? '#0b141a' : '#efeae2',
      }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover"
        style={{
          opacity: isDark ? 0.04 : 0.065,
          color: isDark ? '#ffffff' : '#000000',
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="wa-doodles"
            width="220"
            height="220"
            patternUnits="userSpaceOnUse"
          >
            {/* Cup / Coffee */}
            <path
              d="M30 40 h18 a4 4 0 0 1 4 4 v8 a10 10 0 0 1 -10 10 h-6 a10 10 0 0 1 -10 -10 v-8 a4 4 0 0 1 4 -4 z M52 46 h4 a4 4 0 0 1 0 8 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Heart */}
            <path
              d="M120 30 c-4 -6 -12 -6 -16 0 c-4 -6 -12 -6 -16 0 c-4 6 0 14 16 26 c16 -12 20 -20 16 -26 z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Star */}
            <polygon
              points="175,25 178,35 188,35 180,41 183,51 175,45 167,51 170,41 162,35 172,35"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            {/* Clock */}
            <circle
              cx="50"
              cy="120"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M50 112 v8 h6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Apple / Fruit */}
            <path
              d="M140 105 c6 -10 18 -10 24 0 c6 12 -2 24 -12 24 c-10 0 -18 -12 -12 -24 z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M152 98 c2 -4 6 -6 8 -4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Chat bubble */}
            <path
              d="M85 160 h26 a8 8 0 0 1 8 8 v10 a8 8 0 0 1 -8 8 h-18 l-10 8 v-8 a8 8 0 0 1 -8 -8 v-10 a8 8 0 0 1 8 -8 z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Water drop */}
            <path
              d="M180 165 c0 8 -6 14 -14 14 s-14 -6 -14 -14 c0 -8 14 -22 14 -22 s14 14 14 22 z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Leaf */}
            <path
              d="M20 190 c12 0 20 -10 20 -20 c-10 0 -20 8 -20 20 z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 190 l14 -14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wa-doodles)" />
      </svg>
    </div>
  );
};
