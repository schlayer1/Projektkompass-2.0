import { ProjectBoard, Task, HistoryEntry, LegacyExportData, Milestone, ConsultationRecord } from '../types/project';

// Schuljahr automatisch berechnen (Stichtag: 1. August)
export function calculateSchoolYear(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const year = isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  const month = isNaN(d.getTime()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
  const startYear = month >= 8 ? year : year - 1;
  const startShort = String(startYear).slice(-2);
  const endShort = String(startYear + 1).slice(-2);
  return `SJ ${startShort}/${endShort}`;
}

// Generiert einen eingängigen Gruppen-/Board-Code (z.B. "PK-7X29")
export function generateBoardCode(prefix = 'PK'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${random}`;
}

// Standard-Meilensteine für Klasse 10 Abschlussarbeit (Regelschule Thüringen)
export function getDefaultGrade10Milestones(): Milestone[] {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const nextYear = year + 1;

  return [
    {
      id: 'm1_expose',
      title: '1. Exposé & Themenbegründung genehmigt',
      dueDate: `${year}-10-25`,
      completed: false,
      description: 'Themenwahl, Forschungsfrage und Vorhaben mit Betreuer abgestimmt.',
      isKeyExamDate: true,
    },
    {
      id: 'm2_outline',
      title: '2. Gliederung & Arbeitsplan eingereicht',
      dueDate: `${year}-12-15`,
      completed: false,
      description: 'Detailliertes Inhaltsverzeichnis und Rechercheplan stehen fest.',
      isKeyExamDate: true,
    },
    {
      id: 'm3_consult1',
      title: '3. Konsultation 1 (Zwischenstand & Materialprüfung)',
      dueDate: `${nextYear}-01-20`,
      completed: false,
      description: 'Auswertung der bisherigen Rechercheergebnisse und Leitfragen.',
      isKeyExamDate: true,
    },
    {
      id: 'm4_draft',
      title: '4. Rohfassung der schriftlichen Arbeit fertig',
      dueDate: `${nextYear}-02-28`,
      completed: false,
      description: 'Erster vollständiger Textentwurf aller Gruppenmitglieder.',
      isKeyExamDate: true,
    },
    {
      id: 'm5_submission',
      title: '5. Endgültige Abgabe der Projektarbeit (Prüfungsfrist)',
      dueDate: `${nextYear}-04-10`,
      completed: false,
      description: 'Gebundene Exemplare im Sekretariat & digital fristgerecht abgegeben.',
      isKeyExamDate: true,
    },
    {
      id: 'm6_defense',
      title: '6. Kolloquium / Verteidigung vor Prüfungskommission',
      dueDate: `${nextYear}-05-15`,
      completed: false,
      description: 'Präsentation, Medieneinsatz und Beantwortung der Fachfragen.',
      isKeyExamDate: true,
    },
  ];
}

// Standard-Meilensteine für regulären Fachunterricht (Kurzläufer)
export function getDefaultRegularMilestones(): Milestone[] {
  const today = new Date();
  const d7 = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const d14 = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
  const d21 = new Date(today.getTime() + 21 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'rm1',
      title: '1. Recherche & Materialsammlung abgeschlossen',
      dueDate: d7,
      completed: false,
      description: 'Quellen gesichtet, Material besorgt.',
    },
    {
      id: 'rm2',
      title: '2. Ausarbeitung / Modell / Plakat fertig',
      dueDate: d14,
      completed: false,
      description: 'Inhaltliche Gestaltung abgeschlossen.',
    },
    {
      id: 'rm3',
      title: '3. Präsentation vor der Klasse / Abgabe',
      dueDate: d21,
      completed: false,
      description: 'Vortrag gehalten und reflektiert.',
    },
  ];
}

// Normalisiert rohe Tasks aus Altdaten (v2.1)
export function normalizeTasks(rawTasks: any[]): Task[] {
  if (!Array.isArray(rawTasks)) return [];
  return rawTasks.map((t, idx) => {
    return {
      id: String(t.id || `task_${Date.now()}_${idx}`),
      title: String(t.title || 'Aufgabe').trim(),
      desc: String(t.desc || '').trim(),
      status: (t.status === 'in_progress' || t.status === 'done') ? t.status : 'todo',
      tag: t.tag || 'none',
      priority: t.priority || 'normal',
      assignee: String(t.assignee || '').trim(),
      dueDate: t.dueDate || '',
      checklist: Array.isArray(t.checklist)
        ? t.checklist.map((c: any) => ({
            text: typeof c === 'string' ? c : String(c.text || ''),
            done: Boolean(c.done),
          }))
        : [],
      needsHelp: Boolean(t.needsHelp),
      blockerReason: t.blockerReason ? String(t.blockerReason) : undefined,
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.updatedAt || new Date().toISOString(),
    };
  });
}

// Prüft und migriert alte JSON-Dateien (kompass-*.json)
export function parseLegacyJson(jsonString: string): Partial<ProjectBoard> | null {
  try {
    const data: LegacyExportData = JSON.parse(jsonString);
    if (!data) return null;

    const tasks = normalizeTasks(data.tasks || []);
    const history: HistoryEntry[] = Array.isArray(data.history)
      ? data.history.map((h) => ({
          date: h.date || new Date().toISOString().split('T')[0],
          todo: Number(h.todo) || 0,
          inProgress: Number(h.inProgress) || 0,
          done: Number(h.done) || 0,
        }))
      : [];

    const projectType = data.projectType || 'regular';
    const milestones = Array.isArray(data.milestones) && data.milestones.length > 0
      ? data.milestones
      : (projectType === 'grad10' ? getDefaultGrade10Milestones() : getDefaultRegularMilestones());

    return {
      projectType,
      projectName: data.projectName || '',
      studentName: data.studentName || '',
      groupMembers: Array.isArray(data.groupMembers) ? data.groupMembers : [],
      teacherId: data.teacherId || '',
      teacherName: data.teacherName || '',
      studentClass: data.studentClass || '8a',
      subject: data.subject || '',
      journalGood: data.journalGood || '',
      journalBad: data.journalBad || '',
      journalNext: data.journalNext || '',
      tasks,
      history,
      milestones,
      consultations: Array.isArray(data.consultations) ? data.consultations : [],
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Fehler beim Parsen der JSON-Datei:', err);
    return null;
  }
}

// Erkennt Altdaten aus der bisherigen index.html (hk_*_v7) im localStorage
export function detectLocalStorageLegacyData(): Partial<ProjectBoard> | null {
  try {
    const rawTasks = localStorage.getItem('hk_tasks_v7');
    if (!rawTasks) return null;

    const parsedTasks = JSON.parse(rawTasks);
    if (!Array.isArray(parsedTasks) || parsedTasks.length === 0) return null;

    const rawHistory = localStorage.getItem('hk_history_v7');
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];

    const studentName = localStorage.getItem('hk_student_v7') || '';
    const projectName = localStorage.getItem('hk_project_v7') || '';
    const teacherName = localStorage.getItem('hk_teacher_v7') || '';
    const journalGood = localStorage.getItem('hk_journal_good_v7') || '';
    const journalBad = localStorage.getItem('hk_journal_bad_v7') || '';
    const journalNext = localStorage.getItem('hk_journal_next_v7') || '';

    return {
      projectType: 'regular',
      studentName,
      groupMembers: [],
      projectName,
      teacherName,
      studentClass: '8a',
      subject: '',
      journalGood,
      journalBad,
      journalNext,
      tasks: normalizeTasks(parsedTasks),
      history: Array.isArray(parsedHistory) ? parsedHistory : [],
      milestones: getDefaultRegularMilestones(),
      consultations: [],
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn('Keine lesbaren Altdaten im localStorage gefunden:', e);
    return null;
  }
}

export function markLegacyDataMigrated(): void {
  try {
    localStorage.setItem('hk_legacy_migrated_v8', 'true');
  } catch (e) {}
}

export function isLegacyAlreadyMigrated(): boolean {
  try {
    return localStorage.getItem('hk_legacy_migrated_v8') === 'true';
  } catch (e) {
    return false;
  }
}

// Exportiert ein Board als universelle JSON-Sicherung (100% kompatibel zu v2.1)
export function exportBoardToJsonFile(board: ProjectBoard): void {
  const exportData = {
    version: '2.2', // Erweiterte Version mit Meilensteinen & Mitgliedern
    boardCode: board.boardCode,
    projectType: board.projectType,
    studentName: board.studentName,
    groupMembers: board.groupMembers,
    studentClass: board.studentClass,
    projectName: board.projectName,
    teacherId: board.teacherId,
    teacherName: board.teacherName,
    subject: board.subject,
    schoolYear: board.schoolYear,
    journalGood: board.journalGood,
    journalBad: board.journalBad,
    journalNext: board.journalNext,
    tasks: board.tasks,
    history: board.history,
    milestones: board.milestones,
    consultations: board.consultations,
    exportedAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  let pName = (board.projectName || 'projekt').toLowerCase().replace(/[^a-z0-9]/gi, '-');
  a.download = `kompass-${pName || 'export'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
