import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isDark: boolean;
  showTail?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isDark,
  showTail = true,
}) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2.5 px-4 select-none">
        <div
          className={`px-3 py-1 rounded-lg text-[11px] leading-relaxed text-center max-w-sm shadow-xs ${
            isDark
              ? 'bg-[#182229] text-[#8696a0] border border-[#222d34]'
              : 'bg-[#ffeecd] text-[#54656f] border border-[#e8dcb8]'
          }`}
        >
          {message.text}
        </div>
      </div>
    );
  }

  // Balloon colors
  const userBg = isDark ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]';
  const personaBg = isDark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-[#ffffff] text-[#111b21]';

  const balloonClass = isUser ? userBg : personaBg;
  const alignmentClass = isUser ? 'justify-end' : 'justify-start';

  // Format text paragraphs and bolding safely
  const formatText = (text: string) => {
    // Basic formatting: bold **text** -> <strong>text</strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full ${alignmentClass} my-1 px-3 group select-text`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 text-[14.2px] leading-snug shadow-xs transition-transform ${balloonClass} ${
          isUser
            ? 'rounded-tr-xs'
            : 'rounded-tl-xs'
        }`}
        style={{
          boxShadow: isDark
            ? '0 1px 0.5px rgba(11,20,26,0.3)'
            : '0 1px 0.5px rgba(11,20,26,0.13)',
        }}
      >
        {/* Optional Meal Photo */}
        {message.image && (
          <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-black/10">
            <img
              src={message.image}
              alt="Foto da refeição"
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
          </div>
        )}

        {/* Message Text */}
        <div className="whitespace-pre-wrap break-words pr-12 pb-1">
          {formatText(message.text)}
        </div>

        {/* Bottom-right Metadata: Time + Double Blue Ticks */}
        <div className="absolute right-2 bottom-1.5 flex items-center space-x-1 select-none pointer-events-none">
          <span
            className={`text-[11px] font-normal leading-none ${
              isDark
                ? isUser
                  ? 'text-[#8696a0]'
                  : 'text-[#8696a0]'
                : isUser
                ? 'text-[#667781]'
                : 'text-[#667781]'
            }`}
          >
            {message.time}
          </span>

          {isUser && (
            <span
              className="text-[#53bdeb]"
              title="Lida pela Helena"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
