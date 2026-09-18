import React, { useState, useEffect } from 'react';
import { Task } from '../types/project';
import { generateCoachAdvice } from '../services/geminiService';
import {
  LifeBuoy,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Heart,
} from 'lucide-react';

interface CoachModalProps {
  isOpen: boolean;
  task: Task | null;
  projectName?: string;
  onClose: () => void;
  onSaveBlockerReason: (taskId: string, reason: string) => void;
  onResolveBlocker: (taskId: string) => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  isOpen,
  task,
  projectName,
  onClose,
  onSaveBlockerReason,
  onResolveBlocker,
}) => {
  const [reason, setReason] = useState('');
  const [advice, setAdvice] = useState<{
    coachQuestion: string;
    tips: string[];
    encouragement: string;
  } | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  useEffect(() => {
    if (task) {
      setReason(task.blockerReason || '');
      // Automatisch KI-Coach Rat anfordern
      setIsLoadingAdvice(true);
      generateCoachAdvice(task, projectName)
        .then((res) => setAdvice(res))
        .catch(() => setAdvice(null))
        .finally(() => setIsLoadingAdvice(false));
    } else {
      setReason('');
      setAdvice(null);
    }
  }, [task, isOpen, projectName]);

  if (!isOpen || !task) return null;

  const handleSaveReason = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBlockerReason(task.id, reason.trim());
    onClose();
  };

  const handleResolve = () => {
    onResolveBlocker(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-red-700 font-extrabold text-base sm:text-lg">
            <LifeBuoy className="w-5 h-5 text-red-600" />
            <span>Projektcoach: Hilfe & Hürden meistern</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              Betroffene Aufgabe: <span className="text-[#0B7BA7]">„{task.title}“</span>
            </h4>
            <p className="text-xs text-gray-500">
              Wenn ihr hier nicht weiterkommt, beschreibt kurz das Problem. Eure Lehrkraft sieht dies direkt im Cockpit.
            </p>
          </div>

          {/* Problembeschreibung */}
          <form onSubmit={handleSaveReason} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700">
              Woran liegt es genau? (z.B. Material fehlt, Computer gesperrt, Unklarheit)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Beschreibe kurz, was euch blockiert..."
              rows={2}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-xs sm:text-sm resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="text-xs bg-slate-100 hover:bg-slate-200 text-gray-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
              >
                Notiz für Lehrkraft speichern
              </button>
            </div>
          </form>

          {/* KI Coach Advice Card */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 mt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B7BA7] mb-2 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-[#F39200]" />
              <span>Tipp vom KI-Coach</span>
            </div>

            {isLoadingAdvice ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B7BA7]" />
                <span>Coach überlegt Vorschläge...</span>
              </div>
            ) : advice ? (
              <div className="flex flex-col gap-2.5">
                <div className="text-xs sm:text-sm font-semibold text-gray-800 flex items-start gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#0B7BA7] shrink-0 mt-0.5" />
                  <span>{advice.coachQuestion}</span>
                </div>

                <div className="flex flex-col gap-1.5 pl-5 border-l-2 border-sky-300 my-1">
                  {advice.tips.map((t, idx) => (
                    <div key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#F39200] shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                {advice.encouragement && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-medium">
                    <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{advice.encouragement}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Sprecht euch im Team ab und fragt eure Lehrkraft, wenn ihr Unterstützung benötigt.
              </p>
            )}
          </div>

          {/* Blocker beheben */}
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
            <button
              type="button"
              onClick={handleResolve}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-transform active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Problem gelöst (Hilfe aufheben)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
