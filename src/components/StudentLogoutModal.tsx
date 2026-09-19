import React, { useState } from 'react';
import { ProjectBoard } from '../types/project';
import {
  ShieldCheck,
  Database,
  Copy,
  Check,
  LogOut,
  X,
  Cloud,
  AlertTriangle,
} from 'lucide-react';

interface StudentLogoutModalProps {
  isOpen: boolean;
  board: ProjectBoard;
  isOnline: boolean;
  offlineQueueCount: number;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const StudentLogoutModal: React.FC<StudentLogoutModalProps> = ({
  isOpen,
  board,
  isOnline,
  offlineQueueCount,
  onClose,
  onConfirmLogout,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!board.boardCode) return;
    navigator.clipboard.writeText(board.boardCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Database className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Online-Datenbank
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5 leading-tight">
                Projekt sicher gespeichert
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5 font-medium">
                Alles ist online hinterlegt – Session sauber beenden
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-700 text-sm">
          {/* Main Info Message */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Euer Projektstand ist vollständig gesichert!</span>
            </p>
            <p className="text-emerald-800/90 text-xs">
              Alle Aufgaben, Notizen und Checklisten für{' '}
              <strong className="font-semibold text-emerald-950">
                »{board.projectName || 'Euer Projekt'}«
              </strong>{' '}
              sind direkt in der Datenbank hinterlegt. Wenn ihr euch abmeldet, können
              nachfolgende Schülergruppen an diesem Gerät nicht mehr auf eure Daten zugreifen.
            </p>
          </div>

          {/* Project Code Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-800">
                Euer Projekt-Code zum Weitermachen:
              </span>
              <span className="text-[10px] font-semibold text-sky-600">
                {board.studentClass ? `Klasse ${board.studentClass}` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-sky-300 shadow-2xs">
              <span className="font-mono text-base sm:text-lg font-black text-[#0B7BA7] tracking-wider select-all">
                {board.boardCode || 'PK-DEMO'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-[#0B7BA7] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                title="Code in die Zwischenablage kopieren"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-sky-800/80 mt-2 leading-normal">
              💡 <strong>Wichtig:</strong> Notiert euch diesen Code kurz oder fotografiert ihn ab.
              Mit diesem Code könnt ihr euch beim nächsten Mal an jedem beliebigen Schul-PC,
              Tablet oder von zu Hause aus sofort wieder einloggen.
            </p>
          </div>

          {/* Cloud Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            {isOnline && offlineQueueCount === 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-medium text-slate-700">
                  Cloud-Synchronisation aktiv: Alle Daten sind aktuell in der Datenbank hinterlegt.
                </span>
              </>
            ) : offlineQueueCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium text-amber-800">
                  Hinweis: Noch {offlineQueueCount} Änderung(en) in der lokalen Warteschlange.
                  Bitte Internetverbindung aktiv lassen!
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-600">
                  Offline-Modus aktiv: Änderungen lokal auf diesem Gerät gespeichert.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer order-2 sm:order-1"
          >
            Weiter am Projekt arbeiten
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md transition-all cursor-pointer order-1 sm:order-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Jetzt sicher abmelden</span>
          </button>
        </div>
      </div>
    </div>
  );
};
