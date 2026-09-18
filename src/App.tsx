import React, { useState, useEffect, useRef } from 'react';
import { ProjectBoard, Task, TaskStatus, HistoryEntry, Milestone, ConsultationRecord, ProjectType } from './types/project';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MilestoneTimeline } from './components/MilestoneTimeline';
import { KanbanBoard } from './components/KanbanBoard';
import { ProjectJournal } from './components/ProjectJournal';
import { TaskModal } from './components/TaskModal';
import { CoachModal } from './components/CoachModal';
import { ReportModal } from './components/ReportModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { LegacyMigrationModal } from './components/LegacyMigrationModal';
import { MilestoneEditorModal } from './components/MilestoneEditorModal';
import { ConsultationModal } from './components/ConsultationModal';
import { GroupMembersModal } from './components/GroupMembersModal';
import { PresentationCoachModal } from './components/PresentationCoachModal';
import { PrintableProjectReport } from './components/PrintableProjectReport';
import { GuideModal } from './components/GuideModal';
import { Compass, Sparkles, X } from 'lucide-react';
import {
  saveBoardToFirestore,
  fetchBoardByCode,
} from './services/boardService';
import {
  processOfflineQueue,
  getOfflineQueue,
} from './services/offlineQueue';
import {
  calculateSchoolYear,
  generateBoardCode,
  detectLocalStorageLegacyData,
  markLegacyDataMigrated,
  isLegacyAlreadyMigrated,
  exportBoardToJsonFile,
  parseLegacyJson,
  getDefaultGrade10Milestones,
  getDefaultRegularMilestones,
} from './utils/migration';
import { exportProjectToPDF } from './utils/pdfExport';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pk_current_board_v8';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'ex1',
    title: 'Thema eingrenzen & recherchieren',
    desc: 'Auf 3 Hauptpunkte für das Referat einigen und erste Quellen sammeln.',
    status: 'todo',
    tag: 'recherche',
    priority: 'important',
    assignee: 'Lisa Weber',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    checklist: [
      { text: 'Thema mit Lehrkraft absprechen', done: true },
      { text: '3 verlässliche Fachquellen finden', done: false },
    ],
    needsHelp: false,
  },
  {
    id: 'ex2',
    title: 'Bilder & Grafiken für Folien finden',
    desc: 'Lizenzfreie Bilder in hoher Auflösung.',
    status: 'in_progress',
    tag: 'layout',
    priority: 'normal',
    assignee: 'Tom Müller',
    dueDate: new Date().toISOString().split('T')[0],
    checklist: [
      { text: 'Bilder zur Einleitung', done: true },
      { text: 'Grafik zum Hauptteil', done: false },
    ],
    needsHelp: true,
    blockerReason: 'Schulrechner blockieren teilweise die Bildersuche.',
  },
  {
    id: 'ex3',
    title: 'Generalprobe für Verteidigung durchführen',
    desc: 'Vortrag vor Stoppuhr halten und Fachfragen der Prüfungskommission üben.',
    status: 'todo',
    tag: 'praesentation',
    priority: 'urgent',
    assignee: 'Alle',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    checklist: [
      { text: 'Redezeiten aufteilen', done: true },
      { text: 'Fragerunde mit KI-Generalprobe simulieren', done: false },
    ],
    needsHelp: false,
  },
  {
    id: 'ex4',
    title: 'Gruppenvertrag & Rollen festlegen',
    desc: 'Wer ist für was zuständig und was sind unsere Gruppenregeln?',
    status: 'done',
    tag: 'none',
    priority: 'normal',
    assignee: 'Anna Schmidt',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    checklist: [
      { text: 'Rollen verteilen', done: true },
      { text: 'Zeitplan skizzieren', done: true },
    ],
    needsHelp: false,
  },
];

const INITIAL_BOARD: ProjectBoard = {
  id: 'board_' + Date.now(),
  boardCode: generateBoardCode(),
  projectName: 'Abschlussarbeit: Erneuerbare Energien in Thüringen',
  projectType: 'grad10',
  studentName: 'Gruppe 2',
  groupMembers: ['Anna Schmidt', 'Lisa Weber', 'Tom Müller'],
  studentClass: '10a',
  teacherId: 'keller_nico',
  teacherName: 'Hr. Keller',
  subject: 'Geografie / Physik',
  schoolYear: calculateSchoolYear(),
  journalGood: 'Themenstellung mit Herrn Keller abgestimmt und Gliederungsentwurf begonnen.',
  journalBad: 'Literaturrecherche in der Stadtbibliothek war teilweise unergiebig.',
  journalNext: 'Exposé finalisieren und bis Freitag zur Durchsicht vorlegen.',
  milestones: getDefaultGrade10Milestones(),
  consultations: [
    {
      id: 'c1',
      date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      attendees: ['Anna Schmidt', 'Lisa Weber', 'Tom Müller'],
      topics: 'Themenabstimmung, Eingrenzung der Leitfragen auf regionale Beispiele (Saaletal).',
      nextSteps: 'Gliederungsentwurf anlegen und Termine für Experteninterviews abstimmen.',
      teacherNotes: 'Sehr gute Vorbereitung der Gruppe, Fokus auf Regionalität ist überzeugend.',
      createdAt: new Date().toISOString(),
    },
  ],
  tasks: DEFAULT_TASKS,
  history: [],
  updatedAt: new Date().toISOString(),
};

export function App() {
  const { role } = useAuth();

  const [board, setBoard] = useState<ProjectBoard>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.projectType) parsed.projectType = 'grad10';
        if (!parsed.groupMembers) parsed.groupMembers = ['Anna Schmidt', 'Lisa Weber', 'Tom Müller'];
        if (!parsed.milestones || parsed.milestones.length === 0) {
          parsed.milestones = parsed.projectType === 'regular'
            ? getDefaultRegularMilestones()
            : getDefaultGrade10Milestones();
        }
        if (!parsed.consultations) parsed.consultations = [];
        return parsed;
      }
    } catch (e) {
      console.warn('Fehler beim Laden aus localStorage:', e);
    }
    return INITIAL_BOARD;
  });

  // Online / Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState<number>(getOfflineQueue().length);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<TaskStatus>('todo');

  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachTask, setCoachTask] = useState<Task | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // New Modals (Grade 10, Timelines, Members, Defense Coach)
  const [isMilestoneEditorOpen, setIsMilestoneEditorOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isGroupMembersModalOpen, setIsGroupMembersModalOpen] = useState(false);
  const [isPresentationCoachOpen, setIsPresentationCoachOpen] = useState(false);
  const [presentationCoachTask, setPresentationCoachTask] = useState<Task | null>(null);
  const [modalTargetBoard, setModalTargetBoard] = useState<ProjectBoard | null>(null);
  // Guide & Onboarding
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideInitialRole, setGuideInitialRole] = useState<'student' | 'teacher'>('student');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    return !localStorage.getItem('pk_onboarding_completed') && !localStorage.getItem('pk_welcome_banner_dismissed');
  });

  const handleOpenGuide = (targetRole?: 'student' | 'teacher') => {
    setGuideInitialRole(targetRole || (role === 'teacher' ? 'teacher' : 'student'));
    setIsGuideModalOpen(true);
  };

  const handleDismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem('pk_welcome_banner_dismissed', 'true');
  };

  // Altdaten-Erkennung
  const [detectedLegacyData, setDetectedLegacyData] = useState<Partial<ProjectBoard> | null>(null);
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);

  // Auto-Migration Check on First Launch
  useEffect(() => {
    if (!isLegacyAlreadyMigrated()) {
      const found = detectLocalStorageLegacyData();
      if (found && found.tasks && found.tasks.length > 0) {
        setDetectedLegacyData(found);
        setIsLegacyModalOpen(true);
      }
    }
  }, []);

  // Online / Offline Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue().then((res) => {
        setOfflineCount(getOfflineQueue().length);
      });
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdate = (e: any) => setOfflineCount(e.detail?.count || 0);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pk-offline-queue-updated', handleQueueUpdate);
    window.addEventListener('pk-offline-queue-synced', handleQueueUpdate);

    if (navigator.onLine) {
      processOfflineQueue().then((res) => setOfflineCount(getOfflineQueue().length));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pk-offline-queue-updated', handleQueueUpdate);
      window.removeEventListener('pk-offline-queue-synced', handleQueueUpdate);
    };
  }, []);

  // Täglicher Trend-Chart Snapshot
  const trackHistory = (currentTasks: Task[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todo = currentTasks.filter((t) => t.status === 'todo').length;
    const inProgress = currentTasks.filter((t) => t.status === 'in_progress').length;
    const done = currentTasks.filter((t) => t.status === 'done').length;

    setBoard((prev) => {
      const hist = [...(prev.history || [])];
      const existingIdx = hist.findIndex((h) => h.date === today);
      const entry: HistoryEntry = { date: today, todo, inProgress, done };

      if (existingIdx >= 0) {
        hist[existingIdx] = entry;
      } else {
        hist.push(entry);
      }

      const trimmed = hist.length > 7 ? hist.slice(-7) : hist;
      return { ...prev, history: trimmed };
    });
  };

  // Auto-Save in localStorage and Firestore (debounced)
  const saveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch (e) {}

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveBoardToFirestore(board);
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [board]);

  // Check for 100% completion celebration
  const prevAllDoneRef = useRef(false);
  useEffect(() => {
    const total = board.tasks.length;
    const done = board.tasks.filter((t) => t.status === 'done').length;
    const allDone = total > 0 && done === total;
    if (allDone && !prevAllDoneRef.current) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0B7BA7', '#00A896', '#F39200', '#00558F'],
      });
    }
    prevAllDoneRef.current = allDone;
  }, [board.tasks]);

  // Metadaten aktualisieren
  const handleUpdateMeta = (field: keyof ProjectBoard, value: any) => {
    setBoard((prev) => {
      const updated: ProjectBoard = { ...prev, [field]: value, updatedAt: new Date().toISOString() };
      if (field === 'projectType') {
        if (value === 'grad10' && (!prev.milestones || prev.milestones.length <= 3)) {
          updated.milestones = getDefaultGrade10Milestones();
        } else if (value === 'regular' && (!prev.milestones || prev.milestones.length >= 6)) {
          updated.milestones = getDefaultRegularMilestones();
        }
      }
      return updated;
    });
  };

  // Tagebuch aktualisieren
  const handleUpdateJournal = (
    field: 'journalGood' | 'journalBad' | 'journalNext',
    value: string
  ) => {
    setBoard((prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  // Meilenstein abhaken / umschalten
  const handleToggleMilestone = (id: string) => {
    setBoard((prev) => {
      const updated = (prev.milestones || []).map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      );
      return { ...prev, milestones: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Meilensteine aus Editor speichern
  const handleSaveMilestones = (newMilestones: Milestone[]) => {
    setBoard((prev) => {
      if (modalTargetBoard && modalTargetBoard.id !== prev.id) {
        const updatedTarget = { ...modalTargetBoard, milestones: newMilestones, updatedAt: new Date().toISOString() };
        saveBoardToFirestore(updatedTarget);
        return prev;
      }
      return { ...prev, milestones: newMilestones, updatedAt: new Date().toISOString() };
    });
    setModalTargetBoard(null);
  };

  // Konsultationen speichern
  const handleSaveConsultations = (newConsultations: ConsultationRecord[]) => {
    setBoard((prev) => {
      if (modalTargetBoard && modalTargetBoard.id !== prev.id) {
        const updatedTarget = { ...modalTargetBoard, consultations: newConsultations, updatedAt: new Date().toISOString() };
        saveBoardToFirestore(updatedTarget);
        return prev;
      }
      return { ...prev, consultations: newConsultations, updatedAt: new Date().toISOString() };
    });
    setModalTargetBoard(null);
  };

  // Gruppenmitglieder speichern
  const handleSaveGroupMembers = (newMembers: string[]) => {
    setBoard((prev) => ({
      ...prev,
      groupMembers: newMembers,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Präsentations-Coach öffnen
  const handleOpenPresentationCoach = (task: Task) => {
    setPresentationCoachTask(task);
    setIsPresentationCoachOpen(true);
  };

  // Aufgabe anlegen / bearbeiten
  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    setBoard((prev) => {
      let updatedTasks: Task[];
      if (taskData.id) {
        // Edit
        updatedTasks = prev.tasks.map((t) =>
          t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t
        );
      } else {
        // Create new
        const newTask: Task = {
          ...taskData,
          id: 'task_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Task;
        updatedTasks = [...prev.tasks, newTask];
      }

      trackHistory(updatedTasks);
      return { ...prev, tasks: updatedTasks, updatedAt: new Date().toISOString() };
    });
  };

  // Aufgabe löschen
  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Aufgabe wirklich löschen?')) return;
    setBoard((prev) => {
      const updated = prev.tasks.filter((t) => t.id !== taskId);
      trackHistory(updated);
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Status verschieben
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setBoard((prev) => {
      const updated = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            needsHelp: newStatus === 'done' ? false : t.needsHelp,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      trackHistory(updated);
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Checkliste toggeln
  const handleToggleChecklist = (taskId: string, idx: number) => {
    setBoard((prev) => {
      const updated = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const nextChecklist = [...t.checklist];
          nextChecklist[idx] = { ...nextChecklist[idx], done: !nextChecklist[idx].done };
          return { ...t, checklist: nextChecklist, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Blocker / Hilfe umschalten
  const handleToggleHelp = (taskId: string) => {
    setBoard((prev) => {
      const updated = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const willNeedHelp = !t.needsHelp;
          return { ...t, needsHelp: willNeedHelp, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Blocker-Grund speichern (aus Coach Modal)
  const handleSaveBlockerReason = (taskId: string, reason: string) => {
    setBoard((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, blockerReason: reason, needsHelp: true, updatedAt: new Date().toISOString() } : t
      );
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // Blocker aufheben
  const handleResolveBlocker = (taskId: string) => {
    setBoard((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, needsHelp: false, blockerReason: undefined, updatedAt: new Date().toISOString() } : t
      );
      return { ...prev, tasks: updated, updatedAt: new Date().toISOString() };
    });
  };

  // File Import (.json aus alter oder neuer Version)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseLegacyJson(content);
      if (parsed && parsed.tasks && parsed.tasks.length >= 0) {
        setBoard((prev) => ({
          ...prev,
          ...parsed,
          id: 'board_' + Date.now(),
          boardCode: prev.boardCode || generateBoardCode(),
          updatedAt: new Date().toISOString(),
        }));
        alert('✅ Projekt erfolgreich geladen!');
      } else {
        alert('❌ Falsches Dateiformat. Bitte wähle eine gültige kompass-*.json Datei.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Auto-Migration bestätigen
  const handleConfirmLegacyMigration = () => {
    if (detectedLegacyData) {
      setBoard((prev) => ({
        ...prev,
        ...detectedLegacyData,
        id: 'board_' + Date.now(),
        boardCode: generateBoardCode(),
        updatedAt: new Date().toISOString(),
      }));
      markLegacyDataMigrated();
      setIsLegacyModalOpen(false);
      alert('🎉 Bisheriges Projekt erfolgreich in die neue Version übernommen!');
    }
  };

  // Board via Code laden
  const handleLoadByCode = async (code: string) => {
    try {
      const loaded = await fetchBoardByCode(code);
      if (loaded) {
        setBoard(loaded);
        alert(`✅ Projekt „${loaded.projectName || 'Unbenannt'}“ erfolgreich geladen!`);
      } else {
        alert(`Kein Projekt mit dem Code „${code}“ gefunden.`);
      }
    } catch (e) {
      alert('Fehler beim Laden des Projekts.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800 font-sans overflow-x-hidden">
      {/* Header */}
      <Header
        board={board}
        onUpdateMeta={handleUpdateMeta}
        onExport={() => exportBoardToJsonFile(board)}
        onImportFile={handleImportFile}
        onPrint={() => exportProjectToPDF(board)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenTeacherDashboard={() => {
          if (role === 'teacher') {
            setIsTeacherDashboardOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenMembersModal={() => setIsGroupMembersModalOpen(true)}
        onOpenGuide={handleOpenGuide}
        isOnline={isOnline}
        offlineQueueCount={offlineCount}
      />

      {/* Main Kanban Content */}
      <main className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Onboarding Welcome Banner (for new visitors) */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 rounded-2xl p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-[#0B7BA7] text-white p-2 rounded-xl shadow-xs shrink-0">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight flex items-center gap-1.5 flex-wrap">
                  <span>Neu beim Projektkompass?</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F39200] text-white rounded-md">
                    Heimbürgeschule Kahla
                  </span>
                </h4>
                <p className="text-xs text-gray-600 m-0 mt-0.5">
                  Starte jetzt die 2-Minuten-Tour oder schlage jederzeit im bebilderten Handbuch nach.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <button
                onClick={() => handleOpenGuide('student')}
                className="px-3.5 py-1.5 bg-[#0B7BA7] hover:bg-[#00558F] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
              >
                🚀 Tour starten
              </button>
              <button
                onClick={() => handleOpenGuide('teacher')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-colors"
              >
                🎓 Für Lehrer
              </button>
              <button
                onClick={handleDismissWelcomeBanner}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg ml-1"
                title="Ausblenden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Meilenstein-Timeline (Roadmap) */}
        <MilestoneTimeline
          milestones={board.milestones || []}
          projectType={board.projectType || 'regular'}
          onToggleMilestone={handleToggleMilestone}
          onOpenEditor={() => {
            setModalTargetBoard(board);
            setIsMilestoneEditorOpen(true);
          }}
        />

        {/* Reflexionstagebuch */}
        <ProjectJournal board={board} onChangeField={handleUpdateJournal} />

        {/* Kanban Board */}
        <KanbanBoard
          board={board}
          onOpenAddModal={(status) => {
            setEditingTask(null);
            setTaskModalDefaultStatus(status || 'todo');
            setIsTaskModalOpen(true);
          }}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onToggleChecklist={handleToggleChecklist}
          onToggleHelp={handleToggleHelp}
          onOpenCoach={(task) => {
            setCoachTask(task);
            setIsCoachModalOpen(true);
          }}
          onOpenPresentationCoach={handleOpenPresentationCoach}
          onMoveTask={handleMoveTask}
        />
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        defaultStatus={taskModalDefaultStatus}
        projectContext={board.projectName}
        groupMembers={board.groupMembers || []}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
      />

      <CoachModal
        isOpen={isCoachModalOpen}
        task={coachTask}
        projectName={board.projectName}
        onClose={() => setIsCoachModalOpen(false)}
        onSaveBlockerReason={handleSaveBlockerReason}
        onResolveBlocker={handleResolveBlocker}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        board={board}
        onClose={() => setIsReportModalOpen(false)}
      />

      <TeacherDashboard
        isOpen={isTeacherDashboardOpen}
        onClose={() => setIsTeacherDashboardOpen(false)}
        onOpenGuide={() => handleOpenGuide('teacher')}
        onSelectBoard={(selectedBoard) => setBoard(selectedBoard)}
        onOpenConsultationModal={(targetBoard) => {
          setModalTargetBoard(targetBoard);
          setIsConsultationModalOpen(true);
        }}
        onOpenMilestoneEditor={(targetBoard) => {
          setModalTargetBoard(targetBoard);
          setIsMilestoneEditorOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoadByCode={handleLoadByCode}
        onTeacherSuccess={() => setIsTeacherDashboardOpen(true)}
      />

      <MilestoneEditorModal
        isOpen={isMilestoneEditorOpen}
        milestones={(modalTargetBoard || board).milestones || []}
        projectType={(modalTargetBoard || board).projectType || 'regular'}
        onClose={() => {
          setIsMilestoneEditorOpen(false);
          setModalTargetBoard(null);
        }}
        onSaveMilestones={handleSaveMilestones}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        board={modalTargetBoard || board}
        onClose={() => {
          setIsConsultationModalOpen(false);
          setModalTargetBoard(null);
        }}
        onSaveConsultations={handleSaveConsultations}
      />

      <GroupMembersModal
        isOpen={isGroupMembersModalOpen}
        groupMembers={board.groupMembers || []}
        onClose={() => setIsGroupMembersModalOpen(false)}
        onSave={handleSaveGroupMembers}
      />

      <PresentationCoachModal
        isOpen={isPresentationCoachOpen}
        task={presentationCoachTask}
        board={board}
        onClose={() => {
          setIsPresentationCoachOpen(false);
          setPresentationCoachTask(null);
        }}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        initialRole={guideInitialRole}
      />

      <LegacyMigrationModal
        isOpen={isLegacyModalOpen}
        legacyData={detectedLegacyData}
        onConfirm={handleConfirmLegacyMigration}
        onDismiss={() => {
          markLegacyDataMigrated();
          setIsLegacyModalOpen(false);
        }}
      />

      {/* Printable Report in Background for PDF Generator */}
      <div className="hidden print:block">
        <PrintableProjectReport board={board} />
      </div>
    </div>
  );
}

export default App;
