import React, { useState } from 'react';
import { Cloud, CloudOff, Sparkles, CheckCircle2, Info, X } from 'lucide-react';
import { getGeminiApiKey } from '../services/geminiService';

interface SystemStatusBadgeProps {
  isOnline: boolean;
  offlineQueueCount?: number;
  variant?: 'header' | 'dashboard';
}

export const SystemStatusBadge: React.FC<SystemStatusBadgeProps> = ({
  isOnline,
  offlineQueueCount = 0,
  variant = 'header',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const hasAiKey = Boolean(getGeminiApiKey());
  const isAiActive = hasAiKey && isOnline;

  const cloudStatusText = isOnline
    ? offlineQueueCount > 0
      ? `Sync (${offlineQueueCount})`
      : 'Cloud aktiv'
    : 'Offline';

  const cloudTooltip = isOnline
    ? offlineQueueCount > 0
      ? `${offlineQueueCount} Änderung(en) werden mit der Cloud synchronisiert...`
      : 'Cloud-Datenbank verbunden (Firestore). Änderungen werden in Echtzeit gesichert.'
    : 'Keine Internetverbindung. Änderungen werden auf diesem Gerät sicher zwischengespeichert.';

  const aiStatusText = isAiActive ? 'KI aktiv' : isOnline ? 'KI inaktiv' : 'KI pausiert';
  const aiTooltip = isAiActive
    ? 'KI-Assistent einsatzbereit (Google Gemini für Entwürfe, Feedback & Reflexions-Impulse).'
    : isOnline
    ? 'Kein KI-Schlüssel hinterlegt. Bitte in den Einstellungen eintragen.'
    : 'KI ist offline nicht erreichbar.';

  if (variant === 'dashboard') {
    return (
      <>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cloud Badge */}
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border transition-transform active:scale-95 cursor-pointer shadow-2xs ${
              isOnline
                ? offlineQueueCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
            title={cloudTooltip}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline
                  ? offlineQueueCount > 0
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            {isOnline ? <Cloud className="w-3 h-3 text-emerald-600" /> : <CloudOff className="w-3 h-3 text-rose-600" />}
            <span className="hidden sm:inline">{cloudStatusText}</span>
            <span className="sm:hidden">Cloud</span>
          </button>

          {/* KI Badge */}
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border transition-transform active:scale-95 cursor-pointer shadow-2xs ${
              isAiActive
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-slate-50 text-slate-600 border-slate-300'
            }`}
            title={aiTooltip}
          >
            <Sparkles className={`w-3 h-3 ${isAiActive ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{aiStatusText}</span>
            <span className="sm:hidden">KI</span>
          </button>
        </div>

        {/* Info Modal bei Klick */}
        {showDetails && (
          <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Info className="w-4 h-4 text-[#0B7BA7]" />
                  <span>System-Status</span>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900 block font-bold">Cloud-Datenbank: Aktiv</strong>
                    <p className="text-emerald-800 text-[11px] mt-0.5">{cloudTooltip}</p>
                  </div>
                </div>

                <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  isAiActive ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isAiActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <strong className={`block font-bold ${isAiActive ? 'text-sky-900' : 'text-slate-700'}`}>
                      KI-Dienst (Gemini): {isAiActive ? 'Einsatzbereit' : 'Pausiert'}
                    </strong>
                    <p className={`text-[11px] mt-0.5 ${isAiActive ? 'text-sky-800' : 'text-slate-600'}`}>
                      {aiTooltip}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // variant === 'header'
  return (
    <>
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Desktop (xl+): zwei saubere Badges */}
        <div className="hidden xl:flex items-center gap-1.5">
          {/* Cloud Badge */}
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer shadow-2xs ${
              isOnline
                ? offlineQueueCount > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={cloudTooltip}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isOnline
                  ? offlineQueueCount > 0
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            {isOnline ? <Cloud className="w-3 h-3 text-emerald-600" /> : <CloudOff className="w-3 h-3 text-rose-600" />}
            <span>{cloudStatusText}</span>
          </button>

          {/* KI Badge */}
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer shadow-2xs ${
              isAiActive
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={aiTooltip}
          >
            <Sparkles className={`w-3 h-3 ${isAiActive ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>{aiStatusText}</span>
          </button>
        </div>

        {/* Mobile, Tablet & Small Laptops (< xl): Kompakter Kombi-Indikator, der keinen Platz stiehlt */}
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className={`xl:hidden flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-bold border transition-transform active:scale-95 cursor-pointer shadow-2xs ${
            isOnline
              ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
          title={`${cloudTooltip} | ${aiTooltip}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-bold text-slate-400">•</span>
          <Sparkles className={`w-3 h-3 shrink-0 ${isAiActive ? 'text-amber-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Info Modal bei Klick */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <Info className="w-4 h-4 text-[#0B7BA7]" />
                <span>Live-Systemstatus</span>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block font-bold">Cloud-Datenbank: Aktiv</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">{cloudTooltip}</p>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                isAiActive ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isAiActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <strong className={`block font-bold ${isAiActive ? 'text-sky-900' : 'text-slate-700'}`}>
                    KI-Dienst (Gemini): {isAiActive ? 'Einsatzbereit' : 'Pausiert'}
                  </strong>
                  <p className={`text-[11px] mt-0.5 ${isAiActive ? 'text-sky-800' : 'text-slate-600'}`}>
                    {aiTooltip}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
};
