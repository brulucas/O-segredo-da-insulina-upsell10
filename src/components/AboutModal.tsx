import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'bg-[#111b21] border-[#222d34] text-[#e9edef]'
            : 'bg-white border-gray-200 text-[#111b21]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-[#222d34] bg-[#202c33]' : 'border-gray-100 bg-[#008069] text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 opacity-90" />
            <h2 className="font-semibold text-sm">Sobre e termos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[12px] leading-relaxed opacity-75">
            A Helena é uma assistente com IA e oferece orientações gerais de hábitos e alimentação. Não faz diagnóstico nem substitui consulta com médico ou nutricionista.
          </p>
        </div>

        {/* Footer */}
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
