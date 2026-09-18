import React, { useState } from 'react';
import { ProjectBoard } from '../types/project';
import { generateJournalImpulses } from '../services/geminiService';
import { SpeechButton } from './SpeechButton';
import {
  BookOpen,
  ChevronDown,
  ThumbsUp,
  AlertTriangle,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ProjectJournalProps {
  board: ProjectBoard;
  onChangeField: (field: 'journalGood' | 'journalBad' | 'journalNext', value: string) => void;
}

export const ProjectJournal: React.FC<ProjectJournalProps> = ({ board, onChangeField }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingImpulses, setIsLoadingImpulses] = useState(false);
  const [impulses, setImpulses] = useState<{
    goodImpulse?: string;
    challengeImpulse?: string;
    nextGoalImpulse?: string;
  } | null>(null);

  const handleFetchImpulses = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingImpulses(true);
    try {
      const res = await generateJournalImpulses(board);
      setImpulses(res);
      if (!isOpen) setIsOpen(true);
    } catch (err) {
      console.warn('Impulse Fehler:', err);
    } finally {
      setIsLoadingImpulses(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-5 overflow-hidden transition-all duration-300">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex justify-between items-center bg-slate-50/70 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#0B7BA7] text-white p-2 rounded-xl shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-bold text-gray-800 text-base sm:text-lg block">
              Projekt-Tagebuch (Reflexion)
            </span>
            <span className="text-xs text-gray-500 hidden sm:block">
              Fördert die Metakognition und Selbstorganisation am Ende jeder Arbeitsphase
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFetchImpulses}
            disabled={isLoadingImpulses}
            className="flex items-center gap-1.5 text-xs bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="KI-Impulse für die Reflexion anfordern"
          >
            {isLoadingImpulses ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#F39200]" />
            )}
            <span className="hidden md:inline">KI-Impulse</span>
          </button>

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 bg-white">
          {/* Gut gelaufen */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-600" /> Das lief heute gut:
              </label>
              <SpeechButton onTranscript={(txt) => onChangeField('journalGood', board.journalGood ? board.journalGood + ' ' + txt : txt)} />
            </div>
            {impulses?.goodImpulse && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg mb-2 border border-emerald-200/60 italic">
                💡 Tipp: {impulses.goodImpulse}
              </div>
            )}
            <textarea
              value={board.journalGood}
              onChange={(e) => onChangeField('journalGood', e.target.value)}
              placeholder="Wir haben heute viel Material gefunden (oder diktieren)..."
              rows={3}
              className="w-full p-3 border border-emerald-200/80 rounded-xl bg-emerald-50/20 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Schwierig gewesen */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Das war schwierig:
              </label>
              <SpeechButton onTranscript={(txt) => onChangeField('journalBad', board.journalBad ? board.journalBad + ' ' + txt : txt)} />
            </div>
            {impulses?.challengeImpulse && (
              <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg mb-2 border border-amber-200/60 italic">
                💡 Tipp: {impulses.challengeImpulse}
              </div>
            )}
            <textarea
              value={board.journalBad}
              onChange={(e) => onChangeField('journalBad', e.target.value)}
              placeholder="Quellen einzuordnen fiel uns schwer (oder diktieren)..."
              rows={3}
              className="w-full p-3 border border-amber-200/80 rounded-xl bg-amber-50/20 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Ziel für nächstes Mal */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#0B7BA7] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#0B7BA7]" /> Ziel für nächstes Mal:
              </label>
              <SpeechButton onTranscript={(txt) => onChangeField('journalNext', board.journalNext ? board.journalNext + ' ' + txt : txt)} />
            </div>
            {impulses?.nextGoalImpulse && (
              <div className="text-[11px] text-sky-900 bg-sky-50/80 p-2 rounded-lg mb-2 border border-sky-200/60 italic">
                💡 Tipp: {impulses.nextGoalImpulse}
              </div>
            )}
            <textarea
              value={board.journalNext}
              onChange={(e) => onChangeField('journalNext', e.target.value)}
              placeholder="Gliederung fertigstellen und Folien aufteilen..."
              rows={3}
              className="w-full p-3 border border-sky-200/80 rounded-xl bg-sky-50/20 focus:bg-white focus:outline-none focus:border-[#0B7BA7] focus:ring-1 focus:ring-[#0B7BA7] text-xs sm:text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
