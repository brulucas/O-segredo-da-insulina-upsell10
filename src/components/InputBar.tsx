import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Mic, MicOff, Square, AlertCircle } from 'lucide-react';

interface InputBarProps {
  isDark: boolean;
  onSendMessage: (text: string, image?: { mimeType: string; data: string }) => void;
  disabled: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const COMMON_EMOJIS = ['😊', '🙏', '❤️', '🥗', '🥑', '🍳', '💧', '✨', '💪', '👏', '☀️', '😴', '🍫', '🍵'];

// Extend Window for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const InputBar: React.FC<InputBarProps> = ({
  isDark,
  onSendMessage,
  disabled,
  fileInputRef,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    mimeType: string;
    base64Data: string;
  } | null>(null);

  // Dictation / Web Speech API states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimSpeech, setInterimSpeech] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
    }
  }, []);

  // Auto-resize textarea up to 100px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [inputText, interimSpeech]);

  const startListening = () => {
    if (disabled) return;

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      showToast('Reconhecimento de voz não suportado neste navegador. Tente no Chrome ou Safari.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    baseTextRef.current = inputText;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimSpeech('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscripts = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscripts += transcript;
          } else {
            interim += transcript;
          }
        }

        if (finalTranscripts) {
          const prefix = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
          const newFullText = (prefix + finalTranscripts).trim();
          baseTextRef.current = newFullText;
          setInputText(newFullText);
        }

        setInterimSpeech(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Permissão de microfone negada. Permita o microfone no navegador.');
        }
        setIsListening(false);
        setInterimSpeech('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimSpeech('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error starting SpeechRecognition:', e);
      setIsListening(false);
      setInterimSpeech('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);

    if (interimSpeech.trim()) {
      const prefix = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
      const finalCombined = (prefix + interimSpeech).trim();
      setInputText(finalCombined);
      baseTextRef.current = finalCombined;
    }
    setInterimSpeech('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (isListening) {
      stopListening();
    }

    const textToSend = (inputText + (interimSpeech ? ' ' + interimSpeech : '')).trim();

    if ((!textToSend && !selectedImage) || disabled) return;

    const imgPayload = selectedImage
      ? { mimeType: selectedImage.mimeType, data: selectedImage.base64Data }
      : undefined;

    onSendMessage(textToSend, imgPayload);

    setInputText('');
    setInterimSpeech('');
    baseTextRef.current = '';
    setSelectedImage(null);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida (JPEG, PNG ou WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        dataUrl: result,
        mimeType: file.type,
        base64Data,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    baseTextRef.current = inputText + emoji;
    textareaRef.current?.focus();
  };

  const displayPlaceholder = isListening
    ? 'Ouvindo sua voz... fale normalmente'
    : selectedImage
    ? 'Adicione um comentário (opcional)...'
    : 'Mensagem';

  const hasContentToSend =
    inputText.trim().length > 0 ||
    interimSpeech.trim().length > 0 ||
    selectedImage !== null;

  return (
    <div
      className={`relative z-20 flex flex-col transition-colors border-t select-none ${
        isDark ? 'bg-[#202c33] border-[#222d34]' : 'bg-[#f0f2f5] border-[#e9edef]'
      }`}
      style={{
        paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Hidden File Input for Meal Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Floating In-App Toast instead of window.alert */}
      {toastMessage && (
        <div className="px-3 py-1.5 bg-black/85 text-white text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 ml-2 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dictation Live Status Banner */}
      {isListening && (
        <div
          className={`px-3 py-1.5 flex items-center justify-between text-xs animate-in fade-in border-b ${
            isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Ditando mensagem de voz
            </span>
            <span className="opacity-70 text-[11px]">
              (convertendo áudio em texto)
            </span>
          </div>

          <button
            onClick={stopListening}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-medium cursor-pointer"
          >
            <Square className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Pausar</span>
          </button>
        </div>
      )}

      {/* Selected Image Thumbnail Preview */}
      {selectedImage && (
        <div className="px-3 pt-2 pb-1 flex items-center space-x-2 animate-in fade-in">
          <div className="relative rounded-lg overflow-hidden border border-emerald-500 shadow-sm w-16 h-16 flex-shrink-0">
            <img
              src={selectedImage.dataUrl}
              alt="Pré-visualização do prato"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
              title="Remover foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              Foto da refeição pronta para análise
            </p>
            <p className="text-[11px] opacity-80">Helena vai analisar sem julgamento pelo método.</p>
          </div>
        </div>
      )}

      {/* Mini Curated Emoji Tray */}
      {showEmojiPicker && (
        <div
          className={`flex items-center space-x-2 px-3 py-2 overflow-x-auto no-scrollbar border-b ${
            isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-gray-100 border-gray-200'
          }`}
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="text-xl p-1 rounded-lg hover:bg-black/10 active:scale-125 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end px-2 py-2 space-x-2">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2.5 rounded-full transition text-[#8696a0] hover:text-emerald-500 active:scale-95 flex-shrink-0 cursor-pointer ${
            showEmojiPicker ? 'text-emerald-500' : ''
          }`}
          title="Emojis"
          aria-label="Abrir seletor de emojis"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Paperclip / Camera Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full transition text-[#8696a0] hover:text-emerald-500 active:scale-95 flex-shrink-0 cursor-pointer"
          title="Enviar foto do prato"
          aria-label="Enviar foto da refeição"
        >
          <Paperclip className="w-5 h-5 rotate-45" />
        </button>

        {/* Input Text Box with real-time speech conversion */}
        <div
          className={`flex-1 rounded-2xl px-3 py-1.5 flex flex-col justify-center shadow-2xs transition-all ${
            isListening ? 'ring-2 ring-emerald-500/70' : ''
          } ${
            isDark ? 'bg-[#2a3942] text-[#e9edef]' : 'bg-white text-[#111b21]'
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText + (interimSpeech ? (inputText ? ' ' : '') + interimSpeech : '')}
            onChange={(e) => {
              setInputText(e.target.value);
              baseTextRef.current = e.target.value;
            }}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            className="w-full bg-transparent resize-none border-none outline-none text-[15px] max-h-24 leading-5 py-1 placeholder:text-[#8696a0]"
            disabled={disabled}
          />
        </div>

        {/* Dictation / Mic Button */}
        <button
          onClick={toggleListening}
          disabled={disabled || !speechSupported}
          className={`p-2.5 rounded-full flex-shrink-0 transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white shadow-md animate-pulse'
              : 'text-[#8696a0] hover:text-emerald-500 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={
            isListening
              ? 'Pausar ditado'
              : 'Ditar mensagem de voz (converte áudio em texto)'
          }
          aria-label="Ditar mensagem com microfone"
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !hasContentToSend}
          className={`p-2.5 rounded-full flex-shrink-0 transition-transform active:scale-90 flex items-center justify-center shadow-sm ${
            !hasContentToSend || disabled
              ? isDark
                ? 'bg-[#2a3942] text-[#8696a0] cursor-not-allowed opacity-60'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              : 'bg-[#00a884] hover:bg-[#008f6f] text-white cursor-pointer'
          }`}
          title="Enviar mensagem convertida em texto"
          aria-label="Enviar mensagem"
        >
          <Send className="w-5 h-5 translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
