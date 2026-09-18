import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  onTranscript,
  className = '',
  title = 'Spracheingabe starten (Diktieren)',
}) => {
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null; // Browser unterstützt kein SpeechRecognition
  }

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition Fehler:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition konnte nicht gestartet werden:', e);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleListening}
      className={`p-1.5 rounded-lg border transition-all ${
        isListening
          ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm'
          : 'bg-white hover:bg-sky-50 text-gray-500 hover:text-[#0B7BA7] border-gray-200'
      } ${className}`}
      title={isListening ? 'Zuhören beenden' : title}
    >
      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
    </button>
  );
};
