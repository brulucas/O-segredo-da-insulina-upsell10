import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Bell, BellRing, Check } from 'lucide-react';
import { ThemeMode, NotificationSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (settings: NotificationSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  themeMode,
  onThemeChange,
  notificationSettings,
  onUpdateNotifications,
}) => {
  const [localSettings, setLocalSettings] = useState(notificationSettings);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') return;
    }
    const updated = { ...localSettings, enabled };
    setLocalSettings(updated);
    onUpdateNotifications(updated);
  };

  const handleTimeChange = (key: 'morningTime' | 'eveningTime', val: string) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    onUpdateNotifications(updated);
  };

  const sendTest = () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Helena', {
        body: 'Oi! Passando para te lembrar do nosso combinado de hoje.',
        icon: '/avatar.jpg?v=2',
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'bg-[#111b21] border-[#222d34] text-[#e9edef]'
            : 'bg-white border-gray-200 text-[#111b21]'
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-[#222d34] bg-[#202c33]' : 'border-gray-100 bg-[#008069] text-white'
          }`}
        >
          <h2 className="font-semibold text-sm">Tema e Lembretes</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Theme selector */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              Tema do WhatsApp
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onThemeChange('system')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  themeMode === 'system'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isDark
                    ? 'border-[#2f3b43] bg-[#202c33] text-gray-300'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-[11px]">Sistema</span>
              </button>

              <button
                onClick={() => onThemeChange('dark')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  themeMode === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isDark
                    ? 'border-[#2f3b43] bg-[#202c33] text-gray-300'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-[11px]">Escuro</span>
              </button>

              <button
                onClick={() => onThemeChange('light')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  themeMode === 'light'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isDark
                    ? 'border-[#2f3b43] bg-[#202c33] text-gray-300'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-[11px]">Claro</span>
              </button>
            </div>
          </div>

          {/* Optional notifications */}
          <div
            className={`p-3 rounded-xl border space-y-2.5 ${
              isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Lembretes no Celular
                </h4>
                <p className="text-[11px] opacity-75">
                  Lembretes opcionais da Helena no seu dia
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {localSettings.enabled && (
              <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span>Café da manhã:</span>
                  <input
                    type="time"
                    value={localSettings.morningTime}
                    onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                    className={`px-2 py-1 rounded border text-xs ${
                      isDark ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-in da noite:</span>
                  <input
                    type="time"
                    value={localSettings.eveningTime}
                    onChange={(e) => handleTimeChange('eveningTime', e.target.value)}
                    className={`px-2 py-1 rounded border text-xs ${
                      isDark ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <button
                  onClick={sendTest}
                  className={`w-full py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    isDark ? 'bg-[#202c33] text-emerald-400' : 'bg-white text-emerald-700 border border-gray-200'
                  }`}
                >
                  {testSent ? <Check className="w-3.5 h-3.5" /> : <BellRing className="w-3.5 h-3.5" />}
                  <span>{testSent ? 'Enviado!' : 'Testar lembrete'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDark ? 'border-[#222d34] bg-[#182229]' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
