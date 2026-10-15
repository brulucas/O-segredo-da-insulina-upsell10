import React from 'react';

interface TypingIndicatorProps {
  isDark: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isDark }) => {
  return (
    <div className="flex w-full justify-start my-1 px-3 select-none">
      <div
        className={`relative rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center space-x-1.5 ${
          isDark ? 'bg-[#202c33] text-[#8696a0]' : 'bg-[#ffffff] text-[#667781]'
        }`}
        style={{
          boxShadow: isDark
            ? '0 1px 0.5px rgba(11,20,26,0.3)'
            : '0 1px 0.5px rgba(11,20,26,0.13)',
        }}
      >
        <span className="text-[12px] mr-1 opacity-80">Helena digitando</span>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-3" />
        </div>
      </div>
    </div>
  );
};
