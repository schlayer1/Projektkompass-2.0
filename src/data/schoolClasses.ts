// Offizielle Klassenliste der Staatlichen Regelschule »Heimbürgeschule« Kahla
// Klassenstufen 5 bis 10 mit jeweils den Zügen a, b und c

export const SCHOOL_CLASSES = [
  '5a', '5b', '5c',
  '6a', '6b', '6c',
  '7a', '7b', '7c',
  '8a', '8b', '8c',
  '9a', '9b', '9c',
  '10a', '10b', '10c',
] as const;

export type SchoolClass = (typeof SCHOOL_CLASSES)[number];
