import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot, Firestore } from 'firebase/firestore';

export type TeacherGender = 'f' | 'm' | 'd' | '';

export interface Teacher {
  id: string;
  name: string;
  displayName: string;
  gender?: TeacherGender;
  sourceTeacherId?: string;
  active?: boolean;
  pin: string;
  role: 'teacher' | 'admin';
}

export function formatTeacherName(
  teacher?: { name?: string | null; gender?: TeacherGender | string | null; displayName?: string | null } | null
): string {
  const rawName = (teacher?.name || '').trim();
  if (!rawName) return (teacher?.displayName || '').trim();
  const lower = rawName.toLowerCase();
  if (lower === 'nn') return 'Lehrkraft N.N.';
  if (
    lower.startsWith('frau ') ||
    lower.startsWith('herr ') ||
    lower.startsWith('fr. ') ||
    lower.startsWith('hr. ') ||
    lower === 'gast' ||
    lower.includes('schulleitung') ||
    lower.includes('administrator')
  ) {
    return rawName;
  }
  if (teacher?.gender === 'f') return `Frau ${rawName}`;
  if (teacher?.gender === 'm') return `Herr ${rawName}`;
  return rawName;
}

// Offizielle Kollegiumsliste der Staatlichen Regelschule Heimbürgeschule Kahla
// (Synchronisiert mit HBS-Appportal und Vertretungsstatistik)
export const HBS_TEACHERS: Teacher[] = [
  { id: "t-allerdt", name: "Allerdt", displayName: "Frau Allerdt", pin: "6300", role: "teacher" },
  { id: "t-dengler", name: "Dengler", displayName: "Herr Dengler", pin: "8991", role: "teacher" },
  { id: "t-funk", name: "Funk", displayName: "Frau Funk", pin: "1091", role: "teacher" },
  { id: "t-graefe", name: "Gräfe", displayName: "Frau Gräfe", pin: "6169", role: "teacher" },
  { id: "t-gruchmann", name: "Gruchmann", displayName: "Frau Gruchmann", pin: "4444", role: "teacher" },
  { id: "t-haase", name: "Haase", displayName: "Herr Haase", pin: "8511", role: "teacher" },
  { id: "t-halm", name: "Halm", displayName: "Frau Halm", pin: "1350", role: "teacher" },
  { id: "t-herold", name: "Herold", displayName: "Frau Herold", pin: "2116", role: "teacher" },
  { id: "t-illessy", name: "Illessy", displayName: "Herr Illessy", pin: "2479", role: "teacher" },
  { id: "t-keim", name: "Keim", displayName: "Frau Keim", pin: "9672", role: "teacher" },
  { id: "t-keller", name: "Keller", displayName: "Frau Keller", pin: "6079", role: "teacher" },
  { id: "t-kleinfeld", name: "Kleinfeld", displayName: "Frau Kleinfeld", pin: "5901", role: "teacher" },
  { id: "t-koenig", name: "König", displayName: "Herr König", pin: "2699", role: "teacher" },
  { id: "t-koenitzern", name: "Könitzer N", displayName: "Frau Könitzer N.", pin: "2535", role: "teacher" },
  { id: "t-koentizert", name: "Könitzer T", displayName: "Herr Könitzer T. (Admin)", pin: "7909", role: "admin" },
  { id: "t-mange", name: "Mange", displayName: "Frau Mange", pin: "3518", role: "teacher" },
  { id: "t-meier", name: "Meier", displayName: "Frau Meier", pin: "8652", role: "teacher" },
  { id: "t-nn", name: "nn", displayName: "Lehrkraft N.N.", pin: "1266", role: "teacher" },
  { id: "t-nowak", name: "Nowak", displayName: "Frau Nowak", pin: "6652", role: "teacher" },
  { id: "t-ottma", name: "Ottma", displayName: "Frau Ottma", pin: "7710", role: "teacher" },
  { id: "t-petzold", name: "Petzold", displayName: "Herr Petzold", pin: "6244", role: "teacher" },
  { id: "t-piel", name: "Piel", displayName: "Frau Piel", pin: "8814", role: "teacher" },
  { id: "t-schirmer", name: "Schirmer", displayName: "Herr Schirmer", pin: "8386", role: "teacher" },
  { id: "t-schmidt", name: "Schmidt", displayName: "Herr Schmidt", pin: "6403", role: "teacher" },
  { id: "t-schwappach", name: "Schwappach", displayName: "Frau Schwappach", pin: "7673", role: "teacher" },
  { id: "t-seifert", name: "Seifert", displayName: "Frau Seifert", pin: "3314", role: "teacher" },
  { id: "t-surowy", name: "Surowy", displayName: "Frau Surowy", pin: "9330", role: "teacher" },
  { id: "t-teubert", name: "Teubert", displayName: "Herr Teubert", pin: "5812", role: "teacher" },
  { id: "t-thum", name: "Thum", displayName: "Frau Thum", pin: "2012", role: "teacher" },
  { id: "t-vogel", name: "Vogel", displayName: "Herr Vogel", pin: "1027", role: "teacher" },
  { id: "t-voigt", name: "Voigt", displayName: "Frau Voigt", pin: "5067", role: "teacher" },
  { id: "t-wagner", name: "Wagner", displayName: "Frau Wagner", pin: "7734", role: "teacher" },
  { id: "t-weber", name: "Weber", displayName: "Frau Weber", pin: "2540", role: "teacher" },
  { id: "t-wesely", name: "Wesely", displayName: "Frau Wesely", pin: "7484", role: "teacher" }
];

export const MASTER_ADMIN_PIN = "Year2003?!%";
export const KOENITZER_PIN = "7909";

export function isKoenitzer(teacher: Teacher | null): boolean {
  if (!teacher) return false;
  return teacher.id === "t-koentizert" || teacher.pin === KOENITZER_PIN || teacher.role === "admin";
}

const STATISTIK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCnleowgQT4XoMK5P5b_t1uWYGsWoYxT80",
  authDomain: "statistik-91f25.firebaseapp.com",
  projectId: "statistik-91f25",
  storageBucket: "statistik-91f25.firebasestorage.app",
  messagingSenderId: "277742289737",
  appId: "1:277742289737:web:b87043732524cc283d5098"
};

const APPPORTAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAr8Q3RslUSuaJbIIGiINGV24nm26jYoLQ",
  authDomain: "terminkalender-7f269.firebaseapp.com",
  projectId: "terminkalender-7f269",
  storageBucket: "terminkalender-7f269.firebasestorage.app",
  messagingSenderId: "919163141331",
  appId: "1:919163141331:web:12c659f5c2946e7c7e2826"
};

const TEACHERS_CACHE_KEY = 'hbs_projektkompass_teachers_cache_v1';

interface RawRemoteTeacher {
  id?: string;
  name?: string;
  pin?: string;
  gender?: string;
  role?: string;
  active?: boolean;
  sourceTeacherId?: string;
}

const normalizeGender = (val: unknown): TeacherGender => {
  if (val === 'f' || val === 'm' || val === 'd') return val;
  return '';
};

function computeTeacherDisplayName(teacher: {
  id?: string;
  name: string;
  gender?: TeacherGender;
  role?: 'teacher' | 'admin';
  fallbackDisplayName?: string;
}): string {
  const hasExplicitGender = teacher.gender === 'f' || teacher.gender === 'm' || teacher.gender === 'd';
  if (hasExplicitGender) {
    const base = formatTeacherName({ name: teacher.name, gender: teacher.gender });
    return teacher.role === 'admin' && teacher.id === 't-koentizert' ? `${base} (Admin)` : base;
  }
  if (teacher.fallbackDisplayName) return teacher.fallbackDisplayName;
  const base = formatTeacherName({ name: teacher.name, gender: '' });
  return teacher.role === 'admin' ? `${base} (Admin)` : base;
}

function loadCachedTeachers(): Teacher[] {
  if (typeof window === 'undefined') return HBS_TEACHERS;
  try {
    const raw = localStorage.getItem(TEACHERS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return HBS_TEACHERS;
}

let liveTeachers: Teacher[] = loadCachedTeachers();
let portalUsersCache: RawRemoteTeacher[] = [];
let statistikTeachersCache: RawRemoteTeacher[] = [];
let syncStarted = false;
const teacherListeners = new Set<(teachers: Teacher[]) => void>();

function notifyTeacherListeners() {
  const sorted = getAllTeachers();
  teacherListeners.forEach((cb) => {
    try {
      cb(sorted);
    } catch {}
  });
}

function rebuildLiveTeachers() {
  const merged: Teacher[] = HBS_TEACHERS.map((t) => ({ ...t, active: true }));

  const applyList = (list: RawRemoteTeacher[], isAuthoritativeStatistik: boolean) => {
    list.forEach((st) => {
      const rawName = (st?.name || '').trim();
      if (!rawName || rawName.toLowerCase().includes('schulleitung')) return;

      const stId = st.id ? String(st.id).trim() : '';
      const cleanLower = rawName.toLowerCase();
      const idx = merged.findIndex(
        (u) =>
          (stId && (u.sourceTeacherId === stId || u.id === `t-${stId}` || u.id === stId)) ||
          u.name.trim().toLowerCase() === cleanLower
      );

      const rawPin = st.pin !== undefined && st.pin !== null ? String(st.pin).trim() : '';
      const validPin = /^\d{4,}$/.test(rawPin) ? rawPin : '';
      const hasGenderField = st.gender !== undefined && st.gender !== null;
      const incomingGender = normalizeGender(st.gender);
      const incomingActive = st.active !== false;

      if (idx >= 0) {
        const target = merged[idx];
        if (validPin) target.pin = validPin;
        if (hasGenderField && (isAuthoritativeStatistik || st.gender !== '')) {
          target.gender = incomingGender;
        }
        target.name = rawName;
        target.active = incomingActive;
        if (stId && isAuthoritativeStatistik) target.sourceTeacherId = stId;
        if (st.role === 'admin') target.role = 'admin';
        target.displayName = computeTeacherDisplayName({
          id: target.id,
          name: target.name,
          gender: target.gender,
          role: target.role,
          fallbackDisplayName: hasGenderField ? undefined : target.displayName,
        });
      } else if (validPin) {
        const role: 'teacher' | 'admin' = st.role === 'admin' ? 'admin' : 'teacher';
        const gender = hasGenderField ? incomingGender : '';
        merged.push({
          id: stId ? `t-${stId}` : `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sourceTeacherId: isAuthoritativeStatistik && stId ? stId : undefined,
          name: rawName,
          gender,
          displayName: computeTeacherDisplayName({
            id: stId ? `t-${stId}` : undefined,
            name: rawName,
            gender,
            role,
          }),
          pin: validPin,
          role,
          active: incomingActive,
        });
      }
    });
  };

  if (portalUsersCache.length > 0) applyList(portalUsersCache, false);
  if (statistikTeachersCache.length > 0) applyList(statistikTeachersCache, true);

  liveTeachers = merged;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(merged));
    } catch {}
  }
  notifyTeacherListeners();
}

async function fetchStatistikViaRest() {
  try {
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/statistik-91f25/databases/(default)/documents/schools/HBS'
    );
    if (!res.ok) return;
    const docJson = await res.json();
    const values = docJson?.fields?.teachers?.arrayValue?.values;
    if (!Array.isArray(values)) return;
    statistikTeachersCache = values.map((v: any) => {
      const f = v?.mapValue?.fields || {};
      return {
        id: f.id?.stringValue ?? '',
        name: f.name?.stringValue ?? '',
        pin: f.pin?.stringValue ?? '',
        gender: f.gender?.stringValue ?? '',
        active: f.active?.booleanValue !== undefined ? Boolean(f.active.booleanValue) : true,
      };
    });
    rebuildLiveTeachers();
  } catch (err) {
    console.warn('Projektkompass Statistik REST Sync-Warnung:', err);
  }
}

export function ensureTeacherSyncStarted() {
  if (syncStarted || typeof window === 'undefined') return;
  syncStarted = true;

  try {
    const existingPortal = getApps().find((a) => a.name === 'hbs-appportal-source');
    const portalApp = existingPortal || initializeApp(APPPORTAL_FIREBASE_CONFIG, 'hbs-appportal-source');
    const portalDb: Firestore = getFirestore(portalApp);
    onSnapshot(
      doc(portalDb, 'hbs_appportal', 'portal_data'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.users) && data.users.length > 0) {
            portalUsersCache = data.users;
            rebuildLiveTeachers();
          }
        }
      },
      () => {}
    );
  } catch {}

  try {
    const existingStat = getApps().find((a) => a.name === 'hbs-statistik-source');
    const statApp = existingStat || initializeApp(STATISTIK_FIREBASE_CONFIG, 'hbs-statistik-source');
    const statDb: Firestore = getFirestore(statApp);
    onSnapshot(
      doc(statDb, 'schools', 'HBS'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.teachers)) {
            statistikTeachersCache = data.teachers;
            rebuildLiveTeachers();
          }
        }
      },
      () => {
        fetchStatistikViaRest();
      }
    );
  } catch {
    fetchStatistikViaRest();
  }
}

ensureTeacherSyncStarted();

export function subscribeTeachers(listener: (teachers: Teacher[]) => void): () => void {
  ensureTeacherSyncStarted();
  teacherListeners.add(listener);
  return () => {
    teacherListeners.delete(listener);
  };
}

export function getAllTeachers(): Teacher[] {
  return liveTeachers
    .filter((t) => t.active !== false)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function getTeacherByPin(pin: string): Teacher | null {
  const clean = (pin || '').trim();
  if (!clean) return null;
  return liveTeachers.find((t) => t.pin === clean && t.active !== false) || null;
}

export function getTeacherById(id: string): Teacher | null {
  return liveTeachers.find((t) => t.id === id) || null;
}

export function getTeacherByName(name: string): Teacher | null {
  const clean = (name || '').trim().toLowerCase();
  return liveTeachers.find((t) => t.name.toLowerCase() === clean || t.displayName.toLowerCase().includes(clean)) || null;
}
