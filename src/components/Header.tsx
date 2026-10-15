import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  BadgeCheck,
  Shield,
  Download,
  Settings,
  HelpCircle,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile;
  isTyping: boolean;
  isDark: boolean;
  onOpenData: () => void;
  onOpenInstall: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  isTyping,
  isDark,
  onOpenData,
  onOpenInstall,
  onOpenSettings,
  onOpenAbout,
  onResetChat,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header
      className={`relative z-30 flex items-center justify-between px-3 py-2.5 transition-colors shadow-xs select-none ${
        isDark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-[#008069] text-white'
      }`}
      style={{
        paddingTop: 'max(0.6rem, env(safe-area-inset-top))',
      }}
    >
      {/* Left: Back Arrow + Round Avatar + Name & Status */}
      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
        <button
          onClick={() => window.history.back()}
          className="p-1 -ml-1 rounded-full hover:bg-black/10 active:bg-black/20 transition text-inherit opacity-90"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Round Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src="/avatar.jpg?v=2"
            alt="Helena"
            className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/pwa-192x192.png';
            }}
          />
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-current shadow-xs"
            title="Online agora"
          />
        </div>

        {/* Contact Name & Status */}
        <div className="flex flex-col min-w-0 select-none">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-[15.5px] leading-tight truncate">
              Helena
            </span>
            <span
              className="inline-flex items-center text-emerald-400"
              title="Verificada"
            >
              <BadgeCheck className="w-4 h-4 fill-emerald-500 text-white" />
            </span>
          </div>

          <span className="text-[12px] leading-tight opacity-85 truncate">
            {isTyping ? (
              <span className="text-emerald-400 font-medium inline-flex items-center">
                digitando
                <span className="inline-block animate-pulse ml-0.5">...</span>
              </span>
            ) : (
              'online'
            )}
          </span>
        </div>
      </div>

      {/* Right: Only the 3-dot Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-black/10 active:bg-black/20 transition text-inherit"
          aria-label="Menu de opções"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div
            className={`absolute right-0 mt-1 w-52 rounded-xl shadow-xl py-1.5 z-50 text-sm border animate-in fade-in zoom-in-95 duration-100 ${
              isDark
                ? 'bg-[#233138] border-[#2f3b43] text-[#e9edef]'
                : 'bg-white border-gray-100 text-gray-800'
            }`}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenInstall();
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition ${
                isDark ? 'hover:bg-[#182229]' : 'hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Instalar app</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenData();
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition ${
                isDark ? 'hover:bg-[#182229]' : 'hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4 text-sky-500" />
              <span>Meus dados</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenSettings();
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition ${
                isDark ? 'hover:bg-[#182229]' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Tema</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenAbout();
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition ${
                isDark ? 'hover:bg-[#182229]' : 'hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Sobre e termos</span>
            </button>

            <div
              className={`my-1 border-t ${
                isDark ? 'border-[#2f3b43]' : 'border-gray-100'
              }`}
            />

            <button
              onClick={() => {
                setMenuOpen(false);
                onResetChat();
              }}
              className={`w-full text-left px-4 py-2 flex items-center space-x-3 text-red-500 transition ${
                isDark ? 'hover:bg-[#182229]' : 'hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Apagar conversa</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
