import React, { useState, useEffect } from 'react';
import { Task, ProjectBoard } from '../types/project';
import { getGeminiApiKey, discoverBestModel } from '../services/geminiService';
import {
  Sparkles,
  X,
  Loader2,
  HelpCircle,
  Lightbulb,
  Mic,
  Award,
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
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      setData({
        examQuestions: [
          'Warum habt ihr genau diesen Praxisschwerpunkt gewählt?',
          'Welche Quelle war für euer Fazit am verlässlichsten und warum?',
          'Was würdet ihr rückblickend anders planen, wenn ihr noch einmal anfangen könntet?',
        ],
        tipsForDefense: [
          'Jedes Gruppenmitglied sollte einen gleich langen Redeanteil haben.',
          'Nicht von den Folien ablesen – nutzt kleine Karteikarten mit Stichworten.',
          'Haltet Blickkontakt zu allen Prüfern und Lehrkräften im Raum.',
        ],
        rolePlayAdvice: 'Übt den Vortrag 1x komplett laut mit der Stoppuhr durch, ohne mittendrin abzubrechen!',
      });
      setIsLoading(false);
      return;
    }

    const prompt = `Du bist Fachprüfer und Betreuungslehrer an der Staatlichen Regelschule Heimbürgeschule Kahla in Thüringen.
Eine Schülergruppe bereitet die Verteidigung / Präsentation ihrer Projektarbeit vor.

PROJEKT: "${board.projectName}"
FACH / BEREICH: "${board.subject || 'Allgemein'}"
KLASSE: "${board.studentClass}" (Projekt-Typ: ${board.projectType === 'grad10' ? 'Prüfung Klasse 10' : 'Fachunterricht'})
AUFGABE: "${task?.title}" (${task?.desc || 'Präsentation üben'})

Formuliere für die Generalprobe der Schüler:
1. Drei realistische, typische Prüfungs- oder Fachfragen, die Lehrkräfte in der Fragerunde nach dem Vortrag stellen.
2. Drei praktische Tipps für den Vortrag (Körpersprache, Übergänge im Team, Folien).
3. Einen motivierenden Tipp für die Generalprobe.

Antworte STRENG als valides JSON:
{
  "examQuestions": ["Frage 1", "Frage 2", "Frage 3"],
  "tipsForDefense": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "rolePlayAdvice": "Ein Satz zum Ablauf der Generalprobe"
}`;

    try {
      const { model } = await discoverBestModel(apiKey);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          setData(JSON.parse(cleaned));
        }
      }
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
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  💡 <strong>Empfehlung:</strong> {data.rolePlayAdvice}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Verstanden & Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
