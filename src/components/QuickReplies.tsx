import React from 'react';

interface QuickRepliesProps {
  isDark: boolean;
  chips: string[];
  onSelectReply: (text: string) => void;
  disabled?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  isDark,
  chips,
  onSelectReply,
  disabled = false,
}) => {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <div
      className={`px-3 py-1.5 flex items-center space-x-2 overflow-x-auto no-scrollbar select-none z-10 border-t transition-all animate-in fade-in ${
        isDark
          ? 'bg-[#111b21] border-[#222d34]'
          : 'bg-[#f0f2f5] border-[#e9edef]'
      }`}
      style={{ scrollbarWidth: 'none' }}
    >
      {chips.map((chipText, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelectReply(chipText)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition active:scale-95 whitespace-nowrap cursor-pointer ${
            isDark
              ? 'bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] border border-[#2f3b43]'
              : 'bg-white hover:bg-gray-50 text-[#111b21] border border-gray-200 shadow-2xs'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {chipText}
        </button>
      ))}
    </div>
  );
};
