import React, { useState, useEffect } from 'react';
import { Task, ProjectBoard } from '../types/project';
import { generatePresentationAdvice } from '../services/geminiService';
import {
  Sparkles,
  X,
  Loader2,
  HelpCircle,
  Lightbulb,
  Award,
  RotateCcw,
} from 'lucide-react';

interface PresentationCoachModalProps {
  isOpen: boolean;
  task: Task | null;
  board: ProjectBoard;
  onClose: () => void;
}

export const PresentationCoachModal: React.FC<PresentationCoachModalProps> = ({
  isOpen,
  task,
  board,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    examQuestions: string[];
    tipsForDefense: string[];
    rolePlayAdvice: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadPresentationAdvice();
    } else {
      setData(null);
    }
  }, [isOpen, task]);

  const loadPresentationAdvice = async () => {
    setIsLoading(true);
    try {
      const advice = await generatePresentationAdvice(board, task);
      setData(advice);
    } catch (e) {
      console.warn('KI-Präsentationscoach Fehler:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 bg-gradient-to-r from-rose-500 to-[#0B7BA7] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <Award className="w-5 h-5 text-yellow-300" />
            <span>KI-Generalproben-Helfer: Kolloquium & Vortrag</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-extrabold text-base text-gray-900">{board.projectName}</h4>
            <p className="text-xs text-gray-500">
              Vorbereitung auf die mündliche Verteidigung vor der Prüfungskommission
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#0B7BA7]" />
              <span>Prüfungsfragen werden generiert...</span>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-4">
              {/* Exam Questions */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <strong className="block text-xs uppercase font-extrabold text-rose-800 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  Mögliche Prüfer- & Publikumsfragen in der Fragerunde:
                </strong>
                <div className="space-y-2">
                  {data.examQuestions.map((q, idx) => (
                    <div key={idx} className="text-xs font-semibold text-gray-800 bg-white p-2.5 rounded-lg border border-rose-100 flex items-start gap-2 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips for Defense */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <strong className="block text-xs uppercase font-extrabold text-[#0B7BA7] mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#F39200]" />
                  Tipps für das Auftreten & Übergänge im Team:
                </strong>
                <ul className="space-y-1.5 pl-2">
                  {data.tipsForDefense.map((tip, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-[#0B7BA7] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Role play */}
              {data.rolePlayAdvice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Empfehlung:</strong> {data.rolePlayAdvice}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-between items-center pt-3 border-t">
            <button
              onClick={loadPresentationAdvice}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs border border-slate-300 flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Neue Prüfungsfragen anfordern"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Neue Fragen generieren</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Verstanden & Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
