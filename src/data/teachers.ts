export interface Teacher {
  id: string;
  name: string;
  displayName: string;
  pin: string;
  role: 'teacher' | 'admin';
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

export function getAllTeachers(): Teacher[] {
  return [...HBS_TEACHERS].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function getTeacherByPin(pin: string): Teacher | null {
  const clean = (pin || '').trim();
  if (!clean) return null;
  return HBS_TEACHERS.find(t => t.pin === clean) || null;
}

export function getTeacherById(id: string): Teacher | null {
  return HBS_TEACHERS.find(t => t.id === id) || null;
}

export function getTeacherByName(name: string): Teacher | null {
  const clean = (name || '').trim().toLowerCase();
  return HBS_TEACHERS.find(t => t.name.toLowerCase() === clean || t.displayName.toLowerCase().includes(clean)) || null;
}
