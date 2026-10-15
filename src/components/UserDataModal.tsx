import React, { useState } from 'react';
import { X, Shield, Download, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { UserProfile } from '../types';
import { exportAllData } from '../utils/storage';

interface UserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  userProfile: UserProfile;
  onClearData: () => void;
}

export const UserDataModal: React.FC<UserDataModalProps> = ({
  isOpen,
  onClose,
  isDark,
  userProfile,
  onClearData,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-segredo-insulina-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

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
            <Shield className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-base leading-tight">
                Meus Dados e Memória
              </h2>
              <p className="text-xs opacity-85">
                Salvo localmente no seu aparelho
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* User profile snapshot */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider">
              O que a Helena já sabe sobre você
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <span className="opacity-60 block text-[10px]">Nome:</span>
                <span className="font-medium">{userProfile.name || 'Em preenchimento na conversa'}</span>
              </div>
              <div>
                <span className="opacity-60 block text-[10px]">Meta:</span>
                <span className="font-medium">{userProfile.goal || 'Controle da fome e emagrecimento'}</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-60 block text-[10px]">Rotina / Horários:</span>
                <span className="font-medium">{userProfile.routine || 'Sendo conhecida durante a conversa'}</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-60 block text-[10px]">Gatilhos identificados:</span>
                <span className="font-medium">{userProfile.triggers || 'Vontade de doce / momentos de risco'}</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-60 block text-[10px]">Condições de saúde e medicamentos:</span>
                <span className="font-medium">{userProfile.conditions || 'Nenhuma informada'}</span>
              </div>
            </div>
          </div>

          {/* Active Memory Notes */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#182229] border-[#222d34]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Notas de Memória da IA</span>
              <FileText className="w-3.5 h-3.5 opacity-60" />
            </h3>
            <ul className="space-y-1.5 pl-3 list-disc text-[11.5px] opacity-85 leading-relaxed">
              {userProfile.memoryNotes && userProfile.memoryNotes.length > 0 ? (
                userProfile.memoryNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))
              ) : (
                <li>A Helena extrai memórias automaticamente em segundo plano após cada resposta sua.</li>
              )}
            </ul>
            {userProfile.summary && (
              <p className="pt-2 text-[11px] opacity-75 border-t border-black/5 dark:border-white/5">
                <strong>Resumo histórico: </strong> {userProfile.summary}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleDownload}
              className={`w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition ${
                isDark
                  ? 'bg-[#202c33] hover:bg-[#2a3942] text-sky-400 border border-[#2f3b43]'
                  : 'bg-white hover:bg-gray-50 text-sky-700 border border-gray-300 shadow-2xs'
              }`}
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Arquivo baixado com sucesso!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Exportar meus dados (JSON)</span>
                </>
              )}
            </button>

            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className={`w-full py-2 px-4 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 text-rose-500 transition ${
                  isDark ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Apagar todos os dados e recomeçar</span>
              </button>
            ) : (
              <div
                className={`p-3 rounded-xl border border-rose-500/50 space-y-2 animate-in fade-in ${
                  isDark ? 'bg-rose-950/20' : 'bg-rose-50'
                }`}
              >
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Tem certeza? Todo o histórico e memória serão apagados.</span>
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => {
                      onClearData();
                      setShowConfirmClear(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs transition"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-xs transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
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
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
