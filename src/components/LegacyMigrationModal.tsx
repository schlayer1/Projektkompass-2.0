import React from 'react';
import { ProjectBoard } from '../types/project';
import { Sparkles, Check, X, FolderUp } from 'lucide-react';

interface LegacyMigrationModalProps {
  isOpen: boolean;
  legacyData: Partial<ProjectBoard> | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const LegacyMigrationModal: React.FC<LegacyMigrationModalProps> = ({
  isOpen,
  legacyData,
  onConfirm,
  onDismiss,
}) => {
  if (!isOpen || !legacyData) return null;

  const taskCount = legacyData.tasks?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-2 border-[#0B7BA7]">
        <div className="p-5 bg-gradient-to-r from-sky-50 to-white border-b border-sky-100 flex items-center gap-3">
          <div className="bg-[#0B7BA7] text-white p-2.5 rounded-xl shadow-sm">
            <FolderUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Bestehendes Projekt gefunden!
            </h3>
            <p className="text-xs text-gray-500">
              Automatische Übernahme aus der bisherigen HTML-Version
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 text-xs sm:text-sm text-gray-700">
          <p>
            Wir haben auf diesem Gerät gespeicherte Projektdaten aus der Vorgängerversion gefunden:
          </p>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1">
            {legacyData.projectName && (
              <div>
                <span className="text-gray-500 text-xs">Projekt:</span>{' '}
                <strong>{legacyData.projectName}</strong>
              </div>
            )}
            {legacyData.studentName && (
              <div>
                <span className="text-gray-500 text-xs">Gruppe:</span>{' '}
                <strong>{legacyData.studentName}</strong>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs">Aufgaben:</span>{' '}
              <strong className="text-[#0B7BA7]">{taskCount} Aufgaben</strong> inklusive aller
              Teilschritte und Notizen
            </div>
          </div>

          <p className="text-gray-600 text-xs">
            Möchtest du dieses Projekt jetzt in die neue Version mit Live-Synchronisation und KI-Zauberstab übernehmen?
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Nicht jetzt
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0B7BA7] hover:bg-[#00558F] rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Projekt übernehmen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
