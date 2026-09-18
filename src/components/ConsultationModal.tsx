import React, { useState } from 'react';
import { ProjectBoard, ConsultationRecord } from '../types/project';
import {
  X,
  Calendar,
  Users,
  Check,
  Plus,
  Trash2,
  FileCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  board: ProjectBoard;
  onClose: () => void;
  onSaveConsultations: (consultations: ConsultationRecord[]) => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  board,
  onClose,
  onSaveConsultations,
}) => {
  const [list, setList] = useState<ConsultationRecord[]>(board.consultations || []);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(board.groupMembers || []);
  const [topics, setTopics] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');

  if (!isOpen) return null;

  const handleToggleAttendee = (member: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topics.trim()) return;

    const newRecord: ConsultationRecord = {
      id: 'cons_' + Date.now(),
      date,
      attendees: selectedAttendees,
      topics: topics.trim(),
      nextSteps: nextSteps.trim(),
      teacherNotes: teacherNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...list];
    setList(updated);
    onSaveConsultations(updated);

    // Reset Form
    setTopics('');
    setNextSteps('');
    setTeacherNotes('');
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Dieses Konsultationsprotokoll wirklich löschen?')) return;
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    onSaveConsultations(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-white border-b border-amber-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#F39200] text-white p-2 rounded-xl shadow-sm">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                Konsultations-Protokolle (Jahrgang 10)
              </h3>
              <p className="text-xs text-gray-500">
                Rechtssicherer Prozessnachweis für die Projektarbeit: {board.projectName} ({board.studentName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Button: Neue Konsultation erfassen */}
          {!isAddingNew && (
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs text-gray-600">
                Bisher <strong>{list.length} Konsultationen</strong> dokumentiert.
              </div>
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#0B7BA7] hover:bg-[#00558F] text-white px-3 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neue Konsultation protokollieren</span>
              </button>
            </div>
          )}

          {/* New Consultation Form */}
          {isAddingNew && (
            <form onSubmit={handleAddConsultation} className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex flex-col gap-3">
              <div className="font-bold text-xs uppercase tracking-wider text-amber-900 flex justify-between items-center">
                <span>Beratungsgespräch erfassen</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-gray-400 hover:text-gray-700 text-xs font-semibold"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Datum des Termins</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Anwesende Gruppenmitglieder</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {board.groupMembers && board.groupMembers.length > 0 ? (
                      board.groupMembers.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleToggleAttendee(m)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                            selectedAttendees.includes(m)
                              ? 'bg-[#0B7BA7] text-white border-[#0B7BA7]'
                              : 'bg-white text-gray-600 border-gray-300'
                          }`}
                        >
                          {m} {selectedAttendees.includes(m) ? '✓' : ''}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Keine Mitglieder definiert</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Besprochene Themen & Zwischenstand *</label>
                <textarea
                  required
                  rows={2}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="z.B. Gliederungspunkt 2 überarbeitet, Quellenlage zum Praxismodell besprochen..."
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Vereinbarte nächste Schritte</label>
                  <textarea
                    rows={2}
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    placeholder="z.B. Einleitung schreiben bis 15.11."
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Pädagogische Notiz der Lehrkraft</label>
                  <textarea
                    rows={2}
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="z.B. Gruppe zeigte gute Selbstständigkeit."
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F39200] hover:bg-[#D97A09] text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
                >
                  Protokoll speichern
                </button>
              </div>
            </form>
          )}

          {/* Consultation Records List */}
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic bg-slate-50 rounded-xl border">
                Noch keine Konsultationen hinterlegt.
              </div>
            ) : (
              list.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative group"
                >
                  <div className="flex justify-between items-start border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#0B7BA7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {new Date(c.date).toLocaleDateString('de-DE')}
                      </span>
                      <div className="text-xs text-gray-600">
                        Anwesend: <strong>{c.attendees.join(', ') || 'Alle'}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-800">
                    <strong className="block text-gray-600 text-[11px] uppercase">Besprochene Themen:</strong>
                    <p className="mt-0.5 whitespace-pre-wrap">{c.topics}</p>
                  </div>

                  {c.nextSteps && (
                    <div className="text-xs text-[#0B7BA7] bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                      <strong className="block text-[11px] uppercase">Vereinbarte nächste Schritte:</strong>
                      <p className="mt-0.5">{c.nextSteps}</p>
                    </div>
                  )}

                  {c.teacherNotes && (
                    <div className="text-xs text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <strong className="block text-[11px] uppercase">Lehrkraft-Notiz:</strong>
                      <p className="mt-0.5">{c.teacherNotes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-300"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
