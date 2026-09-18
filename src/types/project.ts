export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskTag =
  | 'recherche'
  | 'material'
  | 'text'
  | 'layout'
  | 'praesentation'
  | 'medien'
  | 'kontrolle'
  | 'none';

export type TaskPriority = 'urgent' | 'important' | 'normal';

export type ProjectType = 'grad10' | 'regular';

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  status: TaskStatus;
  tag: TaskTag;
  priority?: TaskPriority;
  assignee: string;
  dueDate: string;
  checklist: ChecklistItem[];
  needsHelp: boolean;
  blockerReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryEntry {
  date: string;
  todo: number;
  inProgress: number;
  done: number;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  description?: string;
  isKeyExamDate?: boolean;
}

export interface ConsultationRecord {
  id: string;
  date: string;
  attendees: string[];
  topics: string;
  nextSteps: string;
  teacherNotes?: string;
  createdAt?: string;
}

export interface ProjectBoard {
  id: string;
  boardCode: string;
  projectName: string;
  projectType?: ProjectType;
  studentName: string; // z.B. "Gruppe 1"
  groupMembers?: string[]; // z.B. ["Lukas Müller", "Felix Bauer", "Sophie Klein"]
  studentClass: string;
  teacherId?: string; // z.B. "keller_nico"
  teacherName?: string; // z.B. "Hr. Keller"
  subject?: string; // z.B. "Biologie", "WTR"
  schoolYear: string;
  journalGood: string;
  journalBad: string;
  journalNext: string;
  tasks: Task[];
  history: HistoryEntry[];
  milestones?: Milestone[];
  consultations?: ConsultationRecord[];
  isClassTemplate?: boolean;
  templateGrade?: string;
  teacherNotes?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface LegacyExportData {
  version?: string;
  projectType?: ProjectType;
  studentName?: string;
  groupMembers?: string[];
  projectName?: string;
  teacherId?: string;
  teacherName?: string;
  studentClass?: string;
  subject?: string;
  journalGood?: string;
  journalBad?: string;
  journalNext?: string;
  tasks?: any[];
  history?: HistoryEntry[];
  milestones?: Milestone[];
  consultations?: ConsultationRecord[];
}
