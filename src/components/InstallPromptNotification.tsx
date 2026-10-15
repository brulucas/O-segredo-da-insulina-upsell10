import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { isInstallPromptDismissed, setInstallPromptDismissed } from '../utils/storage';

interface InstallPromptNotificationProps {
  isDark: boolean;
  onOpenGuide: () => void;
}

export const InstallPromptNotification: React.FC<InstallPromptNotificationProps> = ({
  isDark,
  onOpenGuide,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If running in standalone mode or user asked not to show again, hide
    if (isInstalled || isInstallPromptDismissed()) {
      return;
    }

    // Show popup shortly after entering app (e.g. 1.5 seconds)
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  if (!visible) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setVisible(false);
        return;
      }
    }
    // If not direct or iOS, open the step-by-step visual guide
    setVisible(false);
    onOpenGuide();
  };

  const handleNeverAskAgain = () => {
    setInstallPromptDismissed(true);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300 select-none">
      <div
        className={`rounded-2xl p-4 shadow-2xl border transition-colors ${
          isDark
            ? 'bg-[#202c33] border-[#2f3b43] text-[#e9edef]'
            : 'bg-white border-gray-200 text-[#111b21]'
        }`}
        style={{
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/avatar.jpg?v=2"
                alt="Helena"
                className="w-11 h-11 rounded-full object-cover border border-emerald-500"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                <Download className="w-2.5 h-2.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[14.5px] leading-tight flex items-center space-x-1">
                <span>Instalar na Tela de Início</span>
              </h3>
              <p className="text-[12px] opacity-75 mt-0.5 leading-snug">
                Adicione o app no seu celular para falar com a Helena em tela cheia.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons */}
        <div className="mt-3.5 flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Baixar / Adicionar</span>
          </button>

          <button
            onClick={handleNeverAskAgain}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition ${
              isDark
                ? 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#182229]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Não perguntar mais
          </button>
        </div>
      </div>
    </div>
  );
};
