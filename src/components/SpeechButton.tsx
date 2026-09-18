import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

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
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  // Beendet die Spracherkennung und gibt das Mikrofon in Safari/WebKit garantiert frei
  const stopRecognition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        // abort() trennt in WebKit / Safari die Audioverbindung sofort und beendet die Menüleistenanzeige
        recognitionRef.current.abort();
      } catch {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }

    setIsListening(false);
  }, []);

  // Automatische Bereinigung bei Tab-Wechsel, Schließen oder Verlassen der Komponente
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Wenn der Tab gewechselt oder minimiert wird -> Mikrofon sofort abschalten
      if (document.visibilityState === 'hidden') {
        stopRecognition();
      }
    };

    const handleBeforeUnload = () => {
      stopRecognition();
    };

    // Stoppt andere Mikrofone, wenn ein neues aktiviert wird
    const handleGlobalSpeechStop = (e: any) => {
      if (e.detail?.id !== instanceIdRef.current) {
        stopRecognition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pk-stop-speech', handleGlobalSpeechStop as EventListener);

    return () => {
      stopRecognition();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBeforeUnload);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pk-stop-speech', handleGlobalSpeechStop as EventListener);
    };
  }, [stopRecognition]);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    return null; // Browser unterstützt kein SpeechRecognition
  }

  const handleToggleListening = () => {
    // 1. Manuelles Beenden durch Klick
    if (isListening) {
      stopRecognition();
      return;
    }

    // 2. Andere aktive Instanzen vorab beenden
    window.dispatchEvent(
      new CustomEvent('pk-stop-speech', { detail: { id: instanceIdRef.current } })
    );

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        // Sicherheits-Timeout (max 20 Sekunden), falls der Browser kein onend feuert
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          stopRecognition();
        }, 20000);
      };

      recognition.onresult = (event: any) => {
        try {
          const results = event.results;
          if (results && results.length > 0) {
            const transcript = results[0][0]?.transcript;
            if (transcript) {
              onTranscript(transcript.trim());
            }
          }
        } finally {
          // Sofort nach Ergebnisempfang das Mikrofon explizit freigeben
          stopRecognition();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition Fehler:', event.error);
        stopRecognition();
      };

      recognition.onend = () => {
        stopRecognition();
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition konnte nicht gestartet werden:', e);
      stopRecognition();
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
      title={isListening ? 'Zuhören beenden (Mikrofon aktiv)' : title}
    >
      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
    </button>
  );
};
