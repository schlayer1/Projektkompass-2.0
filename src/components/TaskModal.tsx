import React, { useState, useEffect } from 'react';
import { Task, TaskTag, TaskPriority, ChecklistItem } from '../types/project';
import { generateSubtasksWithGemini } from '../services/geminiService';
import { SpeechButton } from './SpeechButton';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  AlignLeft,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  initialTask?: Task | null;
  defaultStatus?: 'todo' | 'in_progress' | 'done';
  projectContext?: string;
  groupMembers?: string[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  initialTask,
  defaultStatus = 'todo',
  projectContext,
  groupMembers = [],
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<TaskTag>('none');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [desc, setDesc] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setTag(initialTask.tag);
      setPriority(initialTask.priority || 'normal');
      setAssignee(initialTask.assignee || '');
      setDueDate(initialTask.dueDate || '');
      setDesc(initialTask.desc || '');
      setChecklist(initialTask.checklist || []);
    } else {
      setTitle('');
      setTag('none');
      setPriority('normal');
      setAssignee('');
      setDueDate('');
      setDesc('');
      setChecklist([]);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistItem = (text = '') => {
    setChecklist((prev) => [...prev, { text, done: false }]);
  };

  const handleUpdateChecklistItem = (idx: number, text: string) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], text };
      return next;
    });
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };

  // KI-Zauberstab Klick
  const handleMagicWand = async () => {
    if (!title.trim()) {
      alert('Bitte gib zuerst einen Aufgabentitel ein (z.B. "Plakat zeichnen" oder "Recherche").');
      return;
    }

    setIsGeneratingSubtasks(true);
    try {
      const generated = await generateSubtasksWithGemini(title, tag, projectContext);
      if (generated && generated.length > 0) {
        const existingNonEmpty = checklist.filter((c) => c.text.trim().length > 0);
        const newItems: ChecklistItem[] = generated.map((txt) => ({ text: txt, done: false }));
        setChecklist([...existingNonEmpty, ...newItems]);
      }
    } catch (e) {
      console.warn('Zauberstab Fehler:', e);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      tag,
      priority,
      assignee: assignee.trim(),
      dueDate,
      desc: desc.trim(),
      checklist: checklist.filter((c) => c.text.trim().length > 0),
      status: initialTask?.status || defaultStatus,
      needsHelp: initialTask?.needsHelp || false,
      blockerReason: initialTask?.blockerReason,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-sky-50 to-white border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="font-extrabold text-base sm:text-lg text-[#0B7BA7]">
            {initialTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-3.5">
          {/* Titel mit Spracheingabe */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Was muss getan werden? *
              </label>
              <SpeechButton onTranscript={(txt) => setTitle((prev) => (prev ? prev + ' ' + txt : txt))} />
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Modell der Zelle aus Knete bauen"
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Kategorie & Priorität */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gray-400" /> Kategorie
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as TaskTag)}
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm bg-white"
              >
                <option value="none">Keine Kategorie</option>
                <option value="recherche">Recherche</option>
                <option value="material">Material</option>
                <option value="text">Text</option>
                <option value="layout">Layout</option>
                <option value="praesentation">Präsentation</option>
                <option value="medien">Technik & Medien</option>
                <option value="kontrolle">Kontrolle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> Priorität (Dringlichkeit)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm bg-white"
              >
                <option value="normal">Normal</option>
                <option value="important">Wichtig (mittel)</option>
                <option value="urgent">Dringend (hoch)</option>
              </select>
            </div>
          </div>

          {/* Wer macht's & Fälligkeit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" /> Wer macht's?
              </label>
              {groupMembers && groupMembers.length > 0 ? (
                <div className="flex gap-1">
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm bg-white"
                  >
                    <option value="">Nicht zugewiesen</option>
                    <option value="Alle">Alle gemeinsam</option>
                    {groupMembers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Name / Alle"
                  className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Fällig bis (Deadline)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Beschreibung mit Diktierfunktion */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-gray-400" /> Details & Notizen (optional)
              </label>
              <SpeechButton onTranscript={(txt) => setDesc((prev) => (prev ? prev + ' ' + txt : txt))} />
            </div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Links, Absprachen, Notizen (oder per Mikrofon diktieren)..."
              rows={2}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7] text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Checkliste mit KI-Zauberstab */}
          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B7BA7]">
                Checkliste (Teilschritte)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleMagicWand}
                  disabled={isGeneratingSubtasks}
                  className="flex items-center gap-1.5 text-xs bg-[#0B7BA7] hover:bg-[#00558F] text-white px-2.5 py-1 rounded-lg font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  title="KI-Zauberstab: Schlägt automatisch passende Teilschritte vor"
                >
                  {isGeneratingSubtasks ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#F39200]" />
                  )}
                  <span>Zauberstab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddChecklistItem()}
                  className="flex items-center gap-1 text-xs text-[#00A896] hover:text-[#008f80] font-bold px-2 py-1 rounded-lg border border-[#00A896]/30 bg-white"
                >
                  <Plus className="w-3 h-3" /> Punkt
                </button>
              </div>
            </div>

            {checklist.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-2">
                Noch keine Teilschritte. Klicke auf den <strong>Zauberstab</strong>, um automatisch Teilschritte zu erzeugen!
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateChecklistItem(idx, e.target.value)}
                      placeholder="Teilschritt..."
                      className="flex-1 p-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0B7BA7]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B7BA7] hover:bg-[#00558F] rounded-xl shadow-md transition-transform active:scale-95"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
