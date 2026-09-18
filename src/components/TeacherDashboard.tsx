import React, { useState, useEffect } from 'react';
import { ProjectBoard, Milestone, ConsultationRecord } from '../types/project';
import { SCHOOL_CLASSES } from '../data/schoolClasses';
import { useAuth } from '../context/AuthContext';
import {
  fetchBoardsForTeacher,
  fetchTemplates,
  saveTeacherBoardFeedback,
  saveBoardToFirestore,
  deleteBoardDoc,
} from '../services/boardService';
import { generateTeacherProjectReport } from '../services/geminiService';
import { TemplateEditorModal } from './TemplateEditorModal';
import {
  GraduationCap,
  X,
  Search,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Calendar,
  Users,
  Layers,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';

interface TeacherDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBoard: (board: ProjectBoard) => void;
  onOpenConsultationModal?: (board: ProjectBoard) => void;
  onOpenMilestoneEditor?: (board: ProjectBoard) => void;
  onOpenGuide?: () => void;
}

const FEEDBACK_SNIPPETS = [
  'Toller Fortschritt, weiter so! 👍',
  'Achtet besonders auf verlässliche Quellenangaben. 🔍',
  'Kommt bitte kurz mit euren Notizen an den Lehrertisch. 👥',
  'Gute Aufgabenverteilung im Team sichtbar! 🤝',
  'Vergesst nicht die Zeit für die Generalprobe einzuplanen! ⏱️',
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  isOpen,
  onClose,
  onSelectBoard,
  onOpenConsultationModal,
  onOpenMilestoneEditor,
  onOpenGuide,
}) => {
  const { currentTeacher, logout } = useAuth();
  const [boards, setBoards] = useState<ProjectBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: 'my_grad10' | 'my_regular' | 'templates' | 'all'
  const [activeTab, setActiveTab] = useState<'my_grad10' | 'my_regular' | 'templates' | 'all'>('my_grad10');
  const [classFilter, setClassFilter] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  // Templates State
  const [templates, setTemplates] = useState<ProjectBoard[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<ProjectBoard | null>(null);

  // Feedback State
  const [activeFeedbackBoardId, setActiveFeedbackBoardId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  // KI-Bericht Modal State
  const [aiReportBoard, setAiReportBoard] = useState<ProjectBoard | null>(null);
  const [aiReportData, setAiReportData] = useState<{
    summary: string;
    workProcessAssessment: string;
    strengths: string[];
    advice: string;
  } | null>(null);
  const [isLoadingAiReport, setIsLoadingAiReport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBoards();
    }
  }, [isOpen]);

  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const [data, tpls] = await Promise.all([
        fetchBoardsForTeacher(),
        fetchTemplates(),
      ]);
      setBoards(data);
      setTemplates(tpls);
    } catch (e) {
      console.warn('Fehler beim Laden der Boards/Templates:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Möchtest du diese Projektvorlage wirklich löschen?')) return;
    try {
      await deleteBoardDoc(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (e) {
      alert('Löschen der Vorlage fehlgeschlagen.');
    }
  };

  if (!isOpen) return null;

  const currentTeacherId = currentTeacher?.id || '';
  const currentTeacherName = currentTeacher?.name.toLowerCase() || '';

  // Filter Boards according to active tab
  const filteredBoards = boards.filter((b) => {
    const isAssignedToMe =
      (currentTeacherId && b.teacherId === currentTeacherId) ||
      (currentTeacherName && (b.teacherName || '').toLowerCase().includes(currentTeacherName));

    if (activeTab === 'my_grad10') {
      if (b.projectType !== 'grad10') return false;
      if (currentTeacher?.role !== 'admin' && !isAssignedToMe) return false;
    } else if (activeTab === 'my_regular') {
      if (b.projectType === 'grad10') return false;
      if (currentTeacher?.role !== 'admin' && !isAssignedToMe) return false;
      if (classFilter !== 'Alle' && b.studentClass !== classFilter) return false;
    } else if (activeTab === 'all') {
      if (classFilter !== 'Alle' && b.studentClass !== classFilter) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        b.projectName.toLowerCase().includes(q) ||
        b.studentName.toLowerCase().includes(q) ||
        (b.groupMembers && b.groupMembers.some((m) => m.toLowerCase().includes(q))) ||
        b.boardCode.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Gruppen mit aktiven Blockern
  const blockedBoards = filteredBoards.filter((b) =>
    b.tasks.some((t) => t.needsHelp && t.status !== 'done')
  );

  const handleSendFeedback = async (boardId: string) => {
    if (!feedbackInput.trim()) return;
    setIsSavingFeedback(true);
    try {
      await saveTeacherBoardFeedback(boardId, feedbackInput.trim());
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? { ...b, teacherNotes: feedbackInput.trim() } : b))
      );
      setFeedbackInput('');
      setActiveFeedbackBoardId(null);
    } catch (e) {
      console.warn('Feedback speichern fehlgeschlagen:', e);
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handleGenerateAiReport = async (board: ProjectBoard) => {
    setAiReportBoard(board);
    setAiReportData(null);
    setIsLoadingAiReport(true);
    try {
      const res = await generateTeacherProjectReport(board);
      setAiReportData(res);
    } catch (err: any) {
      alert(err.message || 'Fehler bei der KI-Auswertung.');
      setAiReportBoard(null);
    } finally {
      setIsLoadingAiReport(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-300">
        {/* Header */}
        <div className="bg-white px-6 py-3.5 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#F39200] text-white p-2 rounded-xl shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight flex items-center gap-2">
                <span>Lehrer-Cockpit</span>
                {currentTeacher && (
                  <span className="text-xs font-bold text-[#0B7BA7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    {currentTeacher.displayName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Regelschule Heimbürgeschule Kahla • Projektbegleitung & Notenvorbereitung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTemplateForEdit(null);
                setIsTemplateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F39200] hover:bg-[#D97A09] text-white transition-all shadow-xs active:scale-95 shrink-0"
              title="Neue Vorlage für Klassen anlegen"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Vorlage</span>
            </button>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs"
                title="Lehrer-Handbuch & Praxishilfe öffnen"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F39200]" />
                <span className="hidden sm:inline">Handbuch</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Main Tabs */}
        <div className="bg-slate-100 px-6 pt-2 border-b border-gray-200 flex gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_grad10')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x ${
              activeTab === 'my_grad10'
                ? 'bg-white text-[#0B7BA7] border-gray-200 shadow-sm'
                : 'text-gray-600 hover:bg-white/60 border-transparent'
            }`}
          >
            <span>🎓 Meine 10er Abschlussarbeiten</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0B7BA7]">
              {boards.filter((b) => b.projectType === 'grad10' && (b.teacherId === currentTeacherId || (b.teacherName || '').toLowerCase().includes(currentTeacherName))).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my_regular')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x ${
              activeTab === 'my_regular'
                ? 'bg-white text-[#0B7BA7] border-gray-200 shadow-sm'
                : 'text-gray-600 hover:bg-white/60 border-transparent'
            }`}
          >
            <span>📚 Meine Unterrichtsprojekte</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-gray-700">
              {boards.filter((b) => b.projectType !== 'grad10' && (b.teacherId === currentTeacherId || (b.teacherName || '').toLowerCase().includes(currentTeacherName))).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x ${
              activeTab === 'templates'
                ? 'bg-white text-[#F39200] border-gray-200 shadow-sm'
                : 'text-gray-600 hover:bg-white/60 border-transparent'
            }`}
          >
            <span>📋 Projektvorlagen & Timelines</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
              {templates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x ${
              activeTab === 'all'
                ? 'bg-white text-gray-800 border-gray-200 shadow-sm'
                : 'text-gray-600 hover:bg-white/60 border-transparent'
            }`}
          >
            <span>🏫 Alle Schulprojekte ({boards.length})</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white px-6 py-2.5 border-b border-gray-200 flex flex-wrap gap-3 items-center justify-between shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Thema, Schüler oder Code suchen..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7]"
              />
            </div>

            {activeTab !== 'my_grad10' && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0B7BA7] font-semibold text-gray-700"
              >
                <option value="Alle">Alle Klassen</option>
                {SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Klasse {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <span>{filteredBoards.length} Gruppen</span>
            {blockedBoards.length > 0 && (
              <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse text-[11px]">
                <AlertOctagon className="w-3 h-3" /> {blockedBoards.length} mit Blocker
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          {/* 🚨 Blocker Live-Radar */}
          {activeTab !== 'templates' && blockedBoards.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-sm shrink-0">
              <div className="flex items-center gap-2 text-red-800 font-black text-xs sm:text-sm mb-2 uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Unterstützungsbedarf im Raum (Blocker aktiv):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {blockedBoards.map((b) => {
                  const blockedTasks = b.tasks.filter((t) => t.needsHelp && t.status !== 'done');
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl p-3 border border-red-200 shadow-sm flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <strong className="text-gray-900">{b.studentName}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                            {b.studentClass || '10'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium mb-1.5">{b.projectName}</p>
                        <div className="space-y-1">
                          {blockedTasks.map((bt) => (
                            <div key={bt.id} className="bg-red-50 p-1.5 rounded border border-red-200 text-red-900">
                              <div className="font-bold">• {bt.title}</div>
                              {bt.blockerReason && (
                                <div className="text-[11px] text-gray-700 italic">
                                  Grund: {bt.blockerReason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectBoard(b);
                          onClose();
                        }}
                        className="mt-2.5 flex items-center justify-center gap-1 font-bold text-[#0B7BA7] hover:underline"
                      >
                        <span>Board im Detail öffnen</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Views: Templates vs Board Grid */}
          {activeTab === 'templates' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    Eigene Projektvorlagen für deine Klassen
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Erstelle Vorlagen mit festen Meilensteinen und Fälligkeiten. Schüler der ausgewählten Klassen können diese Vorlage beim Erstellen eines neuen Projekts direkt auswählen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateForEdit(null);
                    setIsTemplateModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F39200] hover:bg-[#D97A09] text-white transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neue Vorlage erstellen</span>
                </button>
              </div>

              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16 text-center bg-white border border-slate-200 rounded-2xl p-6">
                  <Layers className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="font-bold text-sm text-slate-700">Noch keine Projektvorlagen angelegt</span>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Klicke oben auf „Neue Vorlage erstellen“, um z.B. für eine 8. Klasse eine Projektwoche mit festen Meilensteinen vorzubereiten.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex flex-wrap gap-1 items-center">
                            {(tpl.targetClasses && tpl.targetClasses.length > 0
                              ? tpl.targetClasses
                              : ['Alle']
                            ).map((cls) => (
                              <span
                                key={cls}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200"
                              >
                                Kl. {cls}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0B7BA7] border border-sky-200 shrink-0">
                            {tpl.milestones?.length || 0} Meilensteine
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-slate-900 leading-tight mb-1">
                          {tpl.projectName}
                        </h4>

                        {tpl.templateDescription && (
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {tpl.templateDescription}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                          <span>Erstellt von: <strong>{tpl.teacherName || 'Lehrkraft'}</strong></span>
                          {tpl.subject && <span>• Fach: {tpl.subject}</span>}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateForEdit(tpl);
                            setIsTemplateModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-[#0B7BA7] hover:underline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Bearbeiten</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 p-1"
                          title="Vorlage löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Board Grid */}
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0B7BA7]" />
                  <span>Projekte werden geladen...</span>
                </div>
              ) : filteredBoards.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16 text-center">
                  <span>Keine Projektboards in diesem Bereich gefunden.</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'my_grad10'
                      ? 'Bitten Sie Ihre 10er Gruppen, Sie als betreuende Lehrkraft im Board auszuwählen.'
                      : 'Wechseln Sie zum Reiter „Alle Schulprojekte“, um alle Projekte einzusehen.'}
                  </p>
                </div>
              ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBoards.map((b) => {
                const total = b.tasks.length;
                const done = b.tasks.filter((t) => t.status === 'done').length;
                const inProg = b.tasks.filter((t) => t.status === 'in_progress').length;
                const todo = b.tasks.filter((t) => t.status === 'todo').length;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                const hasBlocker = b.tasks.some((t) => t.needsHelp && t.status !== 'done');
                const isGrad10 = b.projectType === 'grad10';
                const completedMilestones = (b.milestones || []).filter((m) => m.completed).length;
                const totalMilestones = (b.milestones || []).length;

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex flex-col justify-between ${
                      hasBlocker ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              isGrad10
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-sky-50 text-[#0B7BA7] border-sky-200'
                            }`}
                          >
                            {isGrad10 ? '🎓 10er Abschlussarbeit' : `📚 ${b.studentClass || 'Fachprojekt'}`}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            Code: {b.boardCode}
                          </span>
                        </div>
                        {hasBlocker && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" /> Blocker
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-gray-900 leading-snug mb-1">
                        {b.projectName || 'Unbenanntes Projekt'}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Gruppe: <strong>{b.studentName || 'Unbekannt'}</strong>
                        {b.groupMembers && b.groupMembers.length > 0 && (
                          <span className="text-gray-500 block text-[11px] truncate mt-0.5">
                            Mitglieder: {b.groupMembers.join(', ')}
                          </span>
                        )}
                      </p>

                      {/* Grade 10 Special: Milestones & Consultations */}
                      {isGrad10 && (
                        <div className="mb-3 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#F39200]" />
                              <span>Etappen: {completedMilestones}/{totalMilestones}</span>
                            </div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              {b.consultations?.length || 0} Konsultationen dokumentiert
                            </div>
                          </div>
                          <button
                            onClick={() => onOpenMilestoneEditor && onOpenMilestoneEditor(b)}
                            className="text-[11px] font-bold text-[#0B7BA7] hover:underline"
                          >
                            Timeline
                          </button>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                          <span>Aufgaben-Fortschritt</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#00A896] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-medium">
                          <span className="text-emerald-700 font-bold">✅ {done}</span>
                          <span className="text-[#0B7BA7] font-bold">⏳ {inProg}</span>
                          <span className="text-[#F39200] font-bold">📋 {todo}</span>
                        </div>
                      </div>

                      {/* Teacher Notes */}
                      {b.teacherNotes && (
                        <div className="text-xs bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-sky-900 mb-2 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#0B7BA7] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[10px] uppercase block">Gesendete Notiz:</strong>
                            {b.teacherNotes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                      {activeFeedbackBoardId === b.id ? (
                        <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="text-[11px] font-bold text-gray-700">Rückmeldung senden:</div>
                          <div className="flex flex-wrap gap-1">
                            {FEEDBACK_SNIPPETS.map((snip, idx) => (
                              <button
                                key={idx}
                                onClick={() => setFeedbackInput(snip)}
                                className="text-[10px] bg-white hover:bg-sky-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-md transition-colors"
                              >
                                {snip}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              placeholder="Feedback..."
                              className="flex-1 text-xs p-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#0B7BA7]"
                            />
                            <button
                              onClick={() => handleSendFeedback(b.id)}
                              disabled={isSavingFeedback}
                              className="px-3 py-1.5 bg-[#0B7BA7] hover:bg-[#00558F] text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveFeedbackBoardId(null)}
                              className="px-2 py-1 text-xs text-gray-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          {/* Grade 10: Consultation Logger Button */}
                          {isGrad10 && onOpenConsultationModal && (
                            <button
                              onClick={() => onOpenConsultationModal(b)}
                              className="flex items-center gap-1 text-[11px] font-bold py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors"
                              title="Konsultation erfassen"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-[#F39200]" />
                              <span>Beratung</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveFeedbackBoardId(b.id);
                              setFeedbackInput(b.teacherNotes || '');
                            }}
                            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-1 px-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg border border-slate-200 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-gray-500" />
                            <span>Feedback</span>
                          </button>

                          <button
                            onClick={() => handleGenerateAiReport(b)}
                            className="flex items-center gap-1 text-[11px] font-bold py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors"
                            title="KI-Zusammenfassung für Bewertung"
                          >
                            <Sparkles className="w-3 h-3 text-[#F39200]" />
                            <span className="hidden sm:inline">Notenbericht</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectBoard(b);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 bg-[#0B7BA7] hover:bg-[#00558F] text-white rounded-lg transition-colors"
                          >
                            <span>Öffnen</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>

        {/* KI-Bericht Modal */}
        {aiReportBoard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 bg-gradient-to-r from-amber-500 to-[#F39200] text-white flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-yellow-200" />
                  <span>KI-Projektbericht & Prozessbeurteilung</span>
                </div>
                <button
                  onClick={() => setAiReportBoard(null)}
                  className="p-1 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{aiReportBoard.projectName}</h3>
                  <p className="text-xs text-gray-500">
                    Gruppe: {aiReportBoard.studentName} ({aiReportBoard.groupMembers?.join(', ') || 'Mitglieder'})
                  </p>
                </div>

                {isLoadingAiReport ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F39200]" />
                    <span className="text-sm">Gemini analysiert Arbeitsverlauf & Konsultationen...</span>
                  </div>
                ) : aiReportData ? (
                  <div className="flex flex-col gap-4 text-xs sm:text-sm text-gray-800">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <strong className="block text-xs uppercase font-extrabold text-gray-600 mb-1">
                        Zusammenfassung des Arbeitsstands:
                      </strong>
                      <p className="leading-relaxed">{aiReportData.summary}</p>
                    </div>

                    <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                      <strong className="block text-xs uppercase font-extrabold text-[#0B7BA7] mb-1">
                        Arbeitsprozess & Termintreue:
                      </strong>
                      <p className="leading-relaxed">{aiReportData.workProcessAssessment}</p>
                    </div>

                    <div>
                      <strong className="block text-xs uppercase font-extrabold text-emerald-700 mb-1.5">
                        Beobachtete Stärken der Gruppe:
                      </strong>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {aiReportData.strengths.map((s, idx) => (
                          <li key={idx} className="text-gray-700">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                      <strong className="block text-xs uppercase font-extrabold text-amber-800 mb-1">
                        Impuls für das Feedbackgespräch & Notengebung:
                      </strong>
                      <p className="leading-relaxed">{aiReportData.advice}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end pt-3 border-t">
                  <button
                    onClick={() => setAiReportBoard(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Editor Modal */}
        <TemplateEditorModal
          isOpen={isTemplateModalOpen}
          initialTemplate={selectedTemplateForEdit}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setSelectedTemplateForEdit(null);
          }}
          onSaved={() => {
            loadBoards();
          }}
        />
      </div>
    </div>
  );
};
