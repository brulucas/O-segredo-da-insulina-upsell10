import React, { useState } from 'react';
import {
  X,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  Smartphone,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'android'>(
    isIOS ? 'ios' : 'android'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'bg-[#111b21] border-[#222d34] text-[#e9edef]'
            : 'bg-white border-gray-200 text-[#111b21]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-[#222d34] bg-[#202c33]' : 'border-gray-100 bg-[#008069] text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="font-bold text-base leading-tight">
                Instalar no Celular
              </h2>
              <p className="text-xs opacity-85">
                Acesse como um aplicativo nativo, direto na sua tela
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div
          className={`flex border-b text-xs font-semibold ${
            isDark ? 'border-[#222d34] bg-[#182229]' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'ios'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            iPhone (Safari)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Direct Install Button if supported */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md text-center space-y-2">
              <Sparkles className="w-6 h-6 mx-auto opacity-90" />
              <h3 className="font-bold text-sm">
                Instalação Automática Disponível!
              </h3>
              <p className="text-[12px] opacity-90">
                Toque no botão abaixo para adicionar o app Segredo da Insulina à sua tela de início em 1 clique.
              </p>
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-800 font-bold hover:bg-gray-100 transition shadow-sm active:scale-95"
              >
                Instalar Aplicativo Agora
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>O app já está instalado no seu dispositivo em modo standalone!</span>
            </div>
          )}

          {/* Android Steps */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Passo a Passo no Android (Chrome):
              </h4>
              <div className="space-y-2.5">
                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-[13px]">Abra o link no Google Chrome</p>
                    <p className="text-[11.5px] opacity-75">
                      Certifique-se de estar usando o navegador Chrome no seu celular.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-[13px] flex items-center space-x-1">
                      <span>Toque nos 3 pontinhos</span>
                      <MoreVertical className="w-3.5 h-3.5" />
                    </p>
                    <p className="text-[11.5px] opacity-75">
                      No canto superior direito da tela do seu Chrome.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-[13px]">Escolha "Instalar aplicativo"</p>
                    <p className="text-[11.5px] opacity-75">
                      Ou "Adicionar à tela inicial" e confirme em <strong>Instalar</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* iOS Safari Steps */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Passo a Passo no iPhone (Safari):
              </h4>
              <div className="space-y-2.5">
                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-[13px]">Abra o link no navegador Safari</p>
                    <p className="text-[11.5px] opacity-75">
                      No iOS, o PWA precisa ser adicionado pelo Safari nativo da Apple.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-[13px] flex items-center space-x-1">
                      <span>Toque no botão Compartilhar</span>
                      <Share className="w-3.5 h-3.5 text-sky-500" />
                    </p>
                    <p className="text-[11.5px] opacity-75">
                      O ícone quadrado com uma seta para cima na barra inferior do Safari.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-start space-x-3 ${
                    isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-[13px] flex items-center space-x-1">
                      <span>Toque em "Adicionar à Tela de Início"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-500" />
                    </p>
                    <p className="text-[11.5px] opacity-75">
                      Role o menu para baixo, selecione e toque em <strong>Adicionar</strong> no topo direito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Golden tip */}
          <div
            className={`p-3.5 rounded-xl border flex items-start space-x-2.5 ${
              isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-xs font-semibold text-amber-700 dark:text-amber-300">
                Dica Especial:
              </strong>
              <p className="text-[11px] leading-relaxed">
                Depois de instalar, abra pelo ícone na tela inicial como qualquer app e deixe as notificações ativadas para receber os lembretes do café da manhã e do check-in da noite da Helena!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end text-xs ${
            isDark ? 'border-[#222d34] bg-[#182229]' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
