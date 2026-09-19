import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProjectBoard } from '../types/project';
import { enqueueBoardOffline } from './offlineQueue';
import { calculateSchoolYear } from '../utils/migration';

const BOARDS_COLLECTION = 'projektkompass_boards';

export const INITIAL_TEST_BOARDS: ProjectBoard[] = [
  {
    id: 'pk_demo_10a',
    boardCode: 'PK-10A-01',
    projectName: 'Abschlussarbeit: Erneuerbare Energien & Nachhaltigkeit in Kahla',
    projectType: 'grad10',
    studentName: 'Gruppe 1 (Lukas, Maya & Leon)',
    groupMembers: ['Lukas Meier', 'Maya Schmidt', 'Leon Wagner'],
    studentClass: '10a',
    teacherId: 't-koentizert',
    teacherName: 'Herr Könitzer T. (Admin)',
    subject: 'Geografie / WTR',
    schoolYear: 'SJ 26/27',
    journalGood: 'Exposé und Fragestellung mit Herrn Könitzer abgestimmt. Erste Messdaten der Wetterstation Kahla ausgewertet.',
    journalBad: 'Die Auswertung historischer Verbrauchsdaten in Excel hat länger gedauert als geplant.',
    journalNext: 'Interviewfragen für den Termin bei den Stadtwerken Kahla vorbereiten und Gliederung vervollständigen.',
    teacherNotes: 'Sehr strukturierter Beginn! Bitte achtet beim Interview darauf, die Aufgaben im Team vorab klar zu verteilen.',
    milestones: [
      {
        id: 'm1',
        title: '1. Themenwahl & Gruppenvertrag',
        dueDate: '2026-10-02',
        completed: true,
        description: 'Thema eingrenzen, Fragestellung mit Betreuer abstimmen und Vertrag abgeben.',
      },
      {
        id: 'm2',
        title: '2. Recherche & Gliederung',
        dueDate: '2026-11-20',
        completed: false,
        description: 'Fachliteratur auswerten und Gliederungsentwurf zur Durchsicht vorlegen.',
      },
      {
        id: 'm3',
        title: '3. Konsultation & Zwischenbericht',
        dueDate: '2027-01-15',
        completed: false,
        description: 'Zwischenergebnisse mit Betreuungslehrkraft besprechen und Protokoll unterschreiben.',
      },
      {
        id: 'm4',
        title: '4. Rohfassung der Arbeit',
        dueDate: '2027-03-05',
        completed: false,
        description: 'Vollständiger Textentwurf inkl. Einleitung, Hauptteil und Fazit fertigstellen.',
      },
      {
        id: 'm5',
        title: '5. Endabgabe der Arbeit',
        dueDate: '2027-04-16',
        completed: false,
        description: 'Gebundene Arbeit fristgerecht im Schulsekretariat einreichen.',
      },
      {
        id: 'm6',
        title: '6. Abschluss-Verteidigung',
        dueDate: '2027-05-28',
        completed: false,
        description: 'Präsentation vor der Prüfungskommission halten und Fachfragen beantworten.',
      },
    ],
    consultations: [
      {
        id: 'c1',
        date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
        attendees: ['Lukas Meier', 'Maya Schmidt', 'Leon Wagner'],
        topics: 'Themenabstimmung, Eingrenzung der Leitfragen auf regionale Beispiele im Saaletal und Zeithorizont bis zur Abgabe.',
        nextSteps: 'Gliederungsentwurf anlegen und Termine für Experteninterviews bei Stadtwerken abstimmen.',
        teacherNotes: 'Sehr gute Vorbereitung der Gruppe. Fokus auf Regionalität ist überzeugend.',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
    tasks: [
      {
        id: 't1',
        title: 'Gruppenvertrag & Rollen festlegen',
        desc: 'Wer ist für welches Teilkapitel zuständig und welche Regeln gelten im Team?',
        status: 'done',
        tag: 'kontrolle',
        priority: 'normal',
        assignee: 'Lukas Meier',
        dueDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
        checklist: [
          { text: 'Rollen & Zuständigkeiten verteilen', done: true },
          { text: 'Zeitplan mit Meilensteinen abgleichen', done: true },
        ],
        needsHelp: false,
      },
      {
        id: 't2',
        title: '3 verlässliche Fachquellen recherchieren',
        desc: 'Bibliothek Kahla, Landeszentrale für Umwelt und Klett Fachbuch.',
        status: 'done',
        tag: 'recherche',
        priority: 'important',
        assignee: 'Maya Schmidt',
        dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        checklist: [
          { text: 'Quellen auf Wissenschaftlichkeit prüfen', done: true },
          { text: 'Zitate korrekt mit Seitenzahlen notieren', done: true },
        ],
        needsHelp: false,
      },
      {
        id: 't3',
        title: 'Interview mit Stadtwerken Kahla vorbereiten',
        desc: 'Fragenkatalog zu Solarpotenzialen und Fernwärme in Kahla erstellen.',
        status: 'in_progress',
        tag: 'material',
        priority: 'urgent',
        assignee: 'Leon Wagner',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        checklist: [
          { text: 'Fragebogen an Herrn Könitzer zur Durchsicht senden', done: true },
          { text: 'Aufnahmegerät / Notizblock vorbereiten', done: false },
        ],
        needsHelp: true,
        blockerReason: 'Rückmeldung der Stadtwerke zum genauen Gesprächstermin steht noch aus.',
      },
      {
        id: 't4',
        title: 'Gliederungsentwurf Kapitel 2 & 3 schreiben',
        desc: 'Detailgliederung zum theoretischen und praktischen Teil ausarbeiten.',
        status: 'in_progress',
        tag: 'text',
        priority: 'important',
        assignee: 'Maya Schmidt',
        dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
        checklist: [
          { text: 'Hauptüberschriften formulieren', done: true },
          { text: 'Unterpunkte mit Stichworten füllen', done: false },
        ],
        needsHelp: false,
      },
      {
        id: 't5',
        title: 'Messungen und Fotodokumentation am Schulgebäude',
        desc: 'Eignung der Dachflächen für Photovoltaik fotografisch erfassen.',
        status: 'todo',
        tag: 'medien',
        priority: 'normal',
        assignee: 'Lukas Meier',
        dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        checklist: [
          { text: 'Erlaubnis der Schulleitung einholen', done: false },
          { text: 'Fotos bei sonnigem Wetter anfertigen', done: false },
        ],
        needsHelp: false,
      },
      {
        id: 't6',
        title: 'Generalprobe für Verteidigung vorbereiten',
        desc: 'Folienentwurf erstellen und 15-Minuten-Vortrag mit Stoppuhr üben.',
        status: 'todo',
        tag: 'praesentation',
        priority: 'urgent',
        assignee: 'Alle',
        dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        checklist: [
          { text: 'Redezeiten gerecht aufteilen', done: false },
          { text: 'Mögliche Fachfragen durchdenken', done: false },
        ],
        needsHelp: false,
      },
    ],
    history: [
      { date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], todo: 3, inProgress: 2, done: 1 },
      { date: new Date().toISOString().split('T')[0], todo: 2, inProgress: 2, done: 2 },
    ],
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

// Entfernt alle undefined Felder rekursiv, damit Firestore nicht mit 'Unsupported field value: undefined' abbricht
function cleanFirestoreData(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanFirestoreData);
  if (typeof obj !== 'object') return obj;
  // FieldValue Objekte wie serverTimestamp() nicht anfassen
  if (obj._methodName || (obj.constructor && obj.constructor.name === 'FieldValue')) return obj;

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanFirestoreData(val);
    }
  }
  return cleaned;
}

// Speichert ein Board in Firestore (mit automatischem Offline-Fallback)
export async function saveBoardToFirestore(
  board: ProjectBoard,
  useOfflineFallback = true
): Promise<string> {
  const docId = board.id || doc(collection(db, BOARDS_COLLECTION)).id;
  const rawBoardData = {
    ...board,
    id: docId,
    schoolYear: board.schoolYear || calculateSchoolYear(),
    updatedAt: new Date().toISOString(),
    serverTimestamp: serverTimestamp(),
  };

  const boardData = cleanFirestoreData(rawBoardData);

  try {
    const docRef = doc(db, BOARDS_COLLECTION, docId);
    await setDoc(docRef, boardData, { merge: true });
    return docId;
  } catch (err) {
    console.warn('Firestore Speichern fehlgeschlagen, speichere lokal in Offline-Queue:', err);
    if (useOfflineFallback) {
      enqueueBoardOffline({ ...board, id: docId });
    }
    return docId;
  }
}

// Lädt ein Board anhand des Codes (z.B. "PK-8A-01")
export async function fetchBoardByCode(code: string): Promise<ProjectBoard | null> {
  const cleanCode = (code || '').toUpperCase().trim();
  if (!cleanCode) return null;

  try {
    const q = query(collection(db, BOARDS_COLLECTION), where('boardCode', '==', cleanCode));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<ProjectBoard, 'id'>) };
    }
  } catch (e) {
    console.warn('Fehler bei fetchBoardByCode aus Firestore:', e);
  }

  // Fallback auf Testboards
  const testMatch = INITIAL_TEST_BOARDS.find((b) => b.boardCode.toUpperCase() === cleanCode);
  return testMatch || null;
}

// Lädt alle Boards für das Lehrer-Dashboard
export async function fetchBoardsForTeacher(
  filterSchoolYear?: string,
  filterClass?: string
): Promise<ProjectBoard[]> {
  try {
    const snap = await getDocs(collection(db, BOARDS_COLLECTION));
    const firestoreBoards = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ProjectBoard, 'id'>),
    }));

    const merged = [...firestoreBoards];
    // Falls Firestore noch leer oder unvollständig ist, Testboards ergänzen
    const existingIds = new Set(merged.map((b) => b.id));
    for (const testBoard of INITIAL_TEST_BOARDS) {
      if (!existingIds.has(testBoard.id)) {
        merged.push(testBoard);
      }
    }

    return merged.filter((b) => {
      if (b.isClassTemplate) return false; // Vorlagen separat behandeln
      if (filterSchoolYear && filterSchoolYear !== 'Alle' && b.schoolYear !== filterSchoolYear) return false;
      if (filterClass && filterClass !== 'Alle' && b.studentClass !== filterClass) return false;
      return true;
    });
  } catch (err) {
    console.warn('Nutze lokale Testboards:', err);
    return INITIAL_TEST_BOARDS.filter((b) => {
      if (b.isClassTemplate) return false;
      if (filterSchoolYear && filterSchoolYear !== 'Alle' && b.schoolYear !== filterSchoolYear) return false;
      if (filterClass && filterClass !== 'Alle' && b.studentClass !== filterClass) return false;
      return true;
    });
  }
}

// Lädt alle Vorlagen (Templates) aus Firestore
export async function fetchTemplates(filterClass?: string): Promise<ProjectBoard[]> {
  try {
    const snap = await getDocs(collection(db, BOARDS_COLLECTION));
    const all = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ProjectBoard, 'id'>),
    }));

    const templates = all.filter((b) => b.isClassTemplate === true);
    if (!filterClass || filterClass === 'Alle') return templates;

    const cleanFilter = filterClass.trim().toLowerCase();
    return templates.filter((t) => {
      if (!t.targetClasses || t.targetClasses.length === 0) return true;
      return (
        t.targetClasses.includes('Alle') ||
        t.targetClasses.some((c) => c.toLowerCase() === cleanFilter)
      );
    });
  } catch (e) {
    console.warn('Fehler beim Laden der Vorlagen:', e);
    return [];
  }
}

// Speichert eine Vorlage
export async function saveTemplate(template: ProjectBoard): Promise<string> {
  return saveBoardToFirestore({
    ...template,
    isClassTemplate: true,
    studentName: template.studentName || 'Projektvorlage',
    studentClass: template.studentClass || (template.targetClasses?.[0] || 'Alle'),
  });
}

// Speichert eine Lehrer-Notiz / Feedback an die Gruppe
export async function saveTeacherBoardFeedback(boardId: string, notes: string): Promise<void> {
  const docRef = doc(db, BOARDS_COLLECTION, boardId);
  try {
    await setDoc(docRef, { teacherNotes: notes, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Konnte Lehrer-Notiz nicht in Firestore speichern:', e);
  }
}

// Löscht ein Board oder eine Vorlage
export async function deleteBoardDoc(boardId: string): Promise<void> {
  if (boardId.startsWith('test_')) return;
  try {
    await deleteDoc(doc(db, BOARDS_COLLECTION, boardId));
  } catch (e) {
    console.warn('Löschen fehlgeschlagen:', e);
  }
}
