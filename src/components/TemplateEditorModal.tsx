import React, { useState, useEffect } from 'react';
import { ProjectBoard, Milestone } from '../types/project';
import { SCHOOL_CLASSES } from '../data/schoolClasses';
import { useAuth } from '../context/AuthContext';
import {
  saveTemplate,
} from '../services/boardService';
import {
  generateBoardCode,
  calculateSchoolYear,
  getDefaultGrade10Milestones,
  getDefaultRegularMilestones,
} from '../utils/migration';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';

interface TemplateEditorModalProps {
  isOpen: boolean;
  initialTemplate?: ProjectBoard | null;
  onClose: () => void;
  onSaved: () => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  initialTemplate,
  onClose,
  onSaved,
}) => {
  const { currentTeacher } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['8a', '8b']);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) {
        setTitle(initialTemplate.projectName || '');
        setDescription(initialTemplate.templateDescription || '');
        setSubject(initialTemplate.subject || '');
        setSelectedClasses(initialTemplate.targetClasses || ['8a', '8b']);
        setMilestones(
          initialTemplate.milestones
            ? JSON.parse(JSON.stringify(initialTemplate.milestones))
            : getDefaultRegularMilestones()
        );
      } else {
        // New template default
        setTitle('');
        setDescription('');
        setSubject('');
        setSelectedClasses(['8a', '8b']);
        setMilestones([
          {
            id: 'tm_1',
            title: 'Themenfindung & Teamvertrag',
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            completed: false,
            description: 'Fragestellung eingrenzen und Aufgaben im Team aufteilen.',
          },
          {
            id: 'tm_2',
            title: 'Recherche & Materialauswertung',
            dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
            completed: false,
            description: 'Mindestens 3 verlässliche Fachquellen sammeln und dokumentieren.',
          },
          {
            id: 'tm_3',
            title: 'Rohfassung & Konsultation',
            dueDate: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0],
            completed: false,
            description: 'Zwischenstand mit betreuender Lehrkraft besprechen.',
          },
          {
            id: 'tm_4',
            title: 'Abschlusspräsentation & Abgabe',
            dueDate: new Date(Date.now() + 63 * 86400000).toISOString().split('T')[0],
            completed: false,
            description: 'Präsentation im Unterricht und Abgabe des Ergebnisberichts.',
            isKeyExamDate: true,
          },
        ]);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialTemplate]);

  if (!isOpen) return null;

  // Toggle single class
  const toggleClass = (cls: string) => {
    if (selectedClasses.includes(cls)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== cls));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  // Quick select all classes of a grade
  const selectGrade = (grade: number) => {
    const gradeClasses = [`${grade}a`, `${grade}b`, `${grade}c`];
    const allSelected = gradeClasses.every((c) => selectedClasses.includes(c));
    if (allSelected) {
      setSelectedClasses(selectedClasses.filter((c) => !gradeClasses.includes(c)));
    } else {
      const merged = Array.from(new Set([...selectedClasses, ...gradeClasses]));
      setSelectedClasses(merged);
    }
  };

  const handleAddMilestone = () => {
    const newM: Milestone = {
      id: 'm_' + Date.now(),
      title: 'Neuer Meilenstein',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      completed: false,
      description: '',
    };
    setMilestones([...milestones, newM]);
  };

  const handleUpdateMilestone = (id: string, field: keyof Milestone, val: any) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Bitte gib einen Namen für die Vorlage ein.');
      return;
    }

    if (selectedClasses.length === 0) {
      setErrorMsg('Bitte wähle mindestens eine Klasse aus, für die diese Vorlage gilt.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const templateToSave: ProjectBoard = {
        id: initialTemplate?.id || 'tpl_' + Date.now(),
        boardCode: initialTemplate?.boardCode || generateBoardCode(),
        projectName: title.trim(),
        projectType: 'regular',
        isClassTemplate: true,
        targetClasses: selectedClasses,
        templateDescription: description.trim() || undefined,
        studentName: 'Projektvorlage',
        studentClass: selectedClasses[0] || 'Alle',
        teacherId: currentTeacher?.id || initialTemplate?.teacherId,
        teacherName: currentTeacher?.displayName || initialTemplate?.teacherName,
        subject: subject.trim() || undefined,
        schoolYear: calculateSchoolYear(),
        journalGood: '',
        journalBad: '',
        journalNext: '',
        milestones: milestones,
        tasks: [],
        history: [],
        consultations: [],
        updatedAt: new Date().toISOString(),
        createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      };

      await saveTemplate(templateToSave);
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Fehler beim Speichern der Vorlage.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F39200] to-[#E07D00] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {initialTemplate ? 'Projektvorlage bearbeiten' : 'Neue Projektvorlage & Timeline erstellen'}
              </h2>
              <p className="text-amber-100 text-xs mt-0.5">
                Definiere Meilensteine und Termine für deine Klassen. Schüler sehen diese Vorlage bei der Klassenauswahl.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Vorlagen-Name / Projektthema *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="z.B. Projektwoche Klasse 8: Mittelalter oder Facharbeit Geografie"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#F39200]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Fach / Fachbereich (optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="z.B. Geschichte / WTR"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#F39200]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Betreuende Lehrkraft
              </label>
              <input
                type="text"
                disabled
                value={currentTeacher?.displayName || 'Lehrkraft'}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                Hinweise & Arbeitsauftrag für die Schüler (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="z.B. Wählt ein Teilthema aus und bereitet ein Plakat sowie einen 5-Minuten-Vortrag vor..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#F39200]"
              />
            </div>
          </div>

          {/* Target Classes Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  Für welche Klassen soll diese Vorlage sichtbar sein? *
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Nur Schüler dieser Klassen bekommen die Vorlage beim Erstellen eines neuen Projekts angezeigt.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedClasses([...SCHOOL_CLASSES])}
                  className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors"
                >
                  Alle Klassen
                </button>
                {[5, 6, 7, 8, 9, 10].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => selectGrade(grade)}
                    className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors"
                  >
                    Kl. {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 pt-1">
              {SCHOOL_CLASSES.map((cls) => {
                const isSelected = selectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-[#F39200] text-white border-[#D97A09] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Ausgewählt: {selectedClasses.length > 0 ? selectedClasses.join(', ') : 'Keine'}
            </div>
          </div>

          {/* Milestones / Timeline List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Meilensteine & Zeitplan ({milestones.length} Etappen)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Diese Meilensteine erscheinen in der Timeline der Schüler-Gruppen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="flex items-center gap-1 text-xs font-bold bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Meilenstein hinzufügen</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2.5">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-colors shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  <div className="flex-1 w-full sm:w-auto grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                        placeholder="Titel des Meilensteins..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#F39200]"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={m.dueDate || ''}
                        onChange={(e) => handleUpdateMilestone(m.id, 'dueDate', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F39200]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={m.description || ''}
                        onChange={(e) => handleUpdateMilestone(m.id, 'description', e.target.value)}
                        placeholder="Kurze Beschreibung / Kriterien für diesen Meilenstein (optional)..."
                        className="w-full p-1.5 bg-transparent border-b border-dashed border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:border-[#F39200]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Meilenstein entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#F39200] hover:bg-[#D97A09] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vorlage speichern & veröffentlichen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
