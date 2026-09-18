import React, { useState, useEffect } from 'react';
import { Milestone, ProjectType } from '../types/project';
import {
  getDefaultGrade10Milestones,
  getDefaultRegularMilestones,
} from '../utils/migration';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  RotateCcw,
  Check,
  AlignLeft,
} from 'lucide-react';

interface MilestoneEditorModalProps {
  isOpen: boolean;
  milestones: Milestone[];
  projectType: ProjectType;
  onClose: () => void;
  onSaveMilestones: (newMilestones: Milestone[]) => void;
}

export const MilestoneEditorModal: React.FC<MilestoneEditorModalProps> = ({
  isOpen,
  milestones,
  projectType,
  onClose,
  onSaveMilestones,
}) => {
  const [list, setList] = useState<Milestone[]>([]);

  useEffect(() => {
    if (isOpen) {
      setList(milestones ? JSON.parse(JSON.stringify(milestones)) : []);
    }
  }, [isOpen, milestones]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    const newM: Milestone = {
      id: 'm_' + Date.now(),
      title: 'Neuer Meilenstein',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      completed: false,
      description: '',
    };
    setList([...list, newM]);
  };

  const handleUpdate = (id: string, field: keyof Milestone, value: any) => {
    setList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLoadGrade10Preset = () => {
    if (confirm('Bestehende Meilensteine mit dem offiziellen Jahresplan für Klasse 10 überschreiben?')) {
      setList(getDefaultGrade10Milestones());
    }
  };

  const handleLoadRegularPreset = () => {
    if (confirm('Bestehende Meilensteine mit der Standard-Fachunterricht-Timeline überschreiben?')) {
      setList(getDefaultRegularMilestones());
    }
  };

  const handleSave = () => {
    onSaveMilestones(list.filter((m) => m.title.trim().length > 0));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
              Timeline & Meilensteine anpassen
            </h3>
            <p className="text-xs text-gray-500">
              Lege individuelle Fristen, Etappen und Prüfungszeitpunkte für dieses Projekt fest.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap gap-2 items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[#0B7BA7]">Vorlagen laden:</span>
          <div className="flex gap-2">
            <button
              onClick={handleLoadGrade10Preset}
              className="text-xs bg-white hover:bg-sky-100 text-[#0B7BA7] border border-sky-300 font-bold px-3 py-1 rounded-lg transition-colors shadow-sm"
            >
              🎓 Jg. 10 Jahresplan
            </button>
            <button
              onClick={handleLoadRegularPreset}
              className="text-xs bg-white hover:bg-slate-100 text-gray-700 border border-slate-300 font-bold px-3 py-1 rounded-lg transition-colors shadow-sm"
            >
              📚 Fachunterricht (3 Phasen)
            </button>
          </div>
        </div>

        {/* Milestone List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
          {list.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs italic">
              Keine Meilensteine angelegt. Klicke unten auf „+ Neuer Meilenstein“ oder lade eine Vorlage.
            </div>
          ) : (
            list.map((m, idx) => (
              <div
                key={m.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B7BA7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleUpdate(m.id, 'title', e.target.value)}
                    placeholder="Titel des Meilensteins..."
                    className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:border-[#0B7BA7]"
                  />
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => handleUpdate(m.id, 'dueDate', e.target.value)}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0B7BA7]"
                  />
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Meilenstein entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pl-8">
                  <input
                    type="text"
                    value={m.description || ''}
                    onChange={(e) => handleUpdate(m.id, 'description', e.target.value)}
                    placeholder="Optionale Beschreibung / Prüfungshinweis..."
                    className="flex-1 p-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:border-[#0B7BA7]"
                  />
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={(e) => handleUpdate(m.id, 'completed', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Erledigt</span>
                  </label>
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAddMilestone}
            className="mt-2 py-2.5 border-2 border-dashed border-sky-200 rounded-xl text-xs font-bold text-[#0B7BA7] hover:bg-sky-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Weiteren Meilenstein hinzufügen</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-300"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Timeline speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};
