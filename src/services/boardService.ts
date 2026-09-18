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
    id: 'test_pk_vulkan_8a',
    boardCode: 'PK-8A-01',
    projectName: 'Vulkanismus in Europa',
    studentName: 'Gruppe 1 (Lukas & Felix)',
    studentClass: '8a',
    teacherName: 'Frau Keller',
    schoolYear: 'SJ 26/27',
    journalGood: 'Haben schon viele Bilder vom Ätna gesammelt.',
    journalBad: 'Internetverbindung im Computerraum war langsam.',
    journalNext: 'Quellenangaben vollständig machen und Plakat skizzieren.',
    teacherNotes: 'Sehr guter Fortschritt! Denkt an die Differenzierung zwischen Schicht- und Schildvulkanen.',
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        id: 't1',
        title: '3 verlässliche Quellen finden',
        desc: 'GEOlexikon, Klett Buch S. 44-48 und Planet Schule.',
        status: 'done',
        tag: 'recherche',
        assignee: 'Lukas',
        dueDate: new Date().toISOString().split('T')[0],
        checklist: [
          { text: 'Bibliothek nach Fachbüchern durchsuchen', done: true },
          { text: 'Website auf Impressum prüfen', done: true },
        ],
        needsHelp: false,
      },
      {
        id: 't2',
        title: 'Plakat-Layout zeichnen',
        desc: 'Farbkonzept mit rot/schwarz/gelb.',
        status: 'in_progress',
        tag: 'layout',
        assignee: 'Felix',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        checklist: [
          { text: 'Überschrift vorbereiten', done: true },
          { text: 'Platzhalter für Querschnitt festlegen', done: false },
        ],
        needsHelp: false,
      },
      {
        id: 't3',
        title: 'Vulkanmodell aus Knete bauen',
        desc: 'Schulrechner haben keine 3D-Vorlagen gespeichert.',
        status: 'todo',
        tag: 'material',
        assignee: 'Alle',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        checklist: [
          { text: 'Knete besorgen', done: false },
          { text: 'Schichtaufbau modellieren', done: false },
        ],
        needsHelp: true,
        blockerReason: 'Materialraum für Knete war heute abgeschlossen.',
      },
    ],
    history: [
      { date: new Date().toISOString().split('T')[0], todo: 1, inProgress: 1, done: 1 },
    ],
  },
  {
    id: 'test_pk_mittelalter_8b',
    boardCode: 'PK-8B-02',
    projectName: 'Leben auf der Leuchtenburg',
    studentName: 'Gruppe 2 (Emma & Sophie)',
    studentClass: '8b',
    teacherName: 'Herr Hoffmann',
    schoolYear: 'SJ 26/27',
    journalGood: 'Besuch auf der Burg war sehr hilfreich!',
    journalBad: 'Gliederung des Referats fiel uns schwer.',
    journalNext: 'Vortrag laut üben und Zeit stoppen.',
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        id: 't4',
        title: 'Interview mit Museumspädagogen',
        desc: 'Fragen zum Porzellan und zur Burgküche vorbereiten.',
        status: 'done',
        tag: 'recherche',
        assignee: 'Emma',
        dueDate: new Date().toISOString().split('T')[0],
        checklist: [{ text: 'Fragebogen abtippen', done: true }],
        needsHelp: false,
      },
      {
        id: 't5',
        title: 'Stichwortkarten schreiben',
        desc: 'Maximal 5 Stichworte pro Folie.',
        status: 'in_progress',
        tag: 'praesentation',
        assignee: 'Sophie',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        checklist: [{ text: 'Karten nummerieren', done: false }],
        needsHelp: false,
      },
    ],
    history: [
      { date: new Date().toISOString().split('T')[0], todo: 0, inProgress: 1, done: 1 },
    ],
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
