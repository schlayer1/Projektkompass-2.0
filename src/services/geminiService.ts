import { Task, TaskTag, ProjectBoard } from '../types/project';

export const DEFAULT_HBS_GEMINI_KEY = ((import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();

export function getGeminiApiKey(): string {
  const fromLocal = localStorage.getItem('gemini_api_key') || '';
  const fromEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return fromLocal.trim() || fromEnv.trim();
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem('gemini_api_key', key.trim());
}

export function isDefaultHbsKey(key: string): boolean {
  return key.trim() === DEFAULT_HBS_GEMINI_KEY && DEFAULT_HBS_GEMINI_KEY.length > 0;
}

let cachedWorkingModel: string | null = null;
let cachedApiVersion: string = 'v1beta';

const FALLBACK_FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
];

function extractModelVersion(modelName: string): number {
  const match = modelName.match(/gemini-(\d+(?:\.\d+)?)-flash/);
  return match ? parseFloat(match[1]) : 0;
}

export async function discoverBestModel(key: string): Promise<{ model: string; version: string }> {
  if (cachedWorkingModel) {
    return { model: cachedWorkingModel, version: cachedApiVersion };
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];

      const availableFlashModels = models
        .filter((m: any) => {
          const name = m.name || '';
          const methods = m.supportedGenerationMethods || [];
          return (
            methods.includes('generateContent') &&
            name.includes('flash') &&
            !name.includes('embedding') &&
            !name.includes('aqa') &&
            !name.includes('tts') &&
            !name.includes('image') &&
            !name.includes('native-audio') &&
            !name.includes('transcribe') &&
            !name.includes('computer-use')
          );
        })
        .map((m: any) => m.name.replace(/^models\//, ''))
        .sort((a: string, b: string) => extractModelVersion(b) - extractModelVersion(a));

      if (availableFlashModels.length > 0) {
        const bestModel = availableFlashModels[0];
        cachedWorkingModel = bestModel;
        cachedApiVersion = 'v1beta';
        return { model: bestModel, version: 'v1beta' };
      }
    }
  } catch (e) {
    console.warn('[Gemini] Live-Modellabfrage fehlgeschlagen, nutze Fallbacks:', e);
  }

  return { model: 'gemini-2.5-flash', version: 'v1beta' };
}

async function executeGeminiRequest(key: string, promptText: string): Promise<string> {
  const { model: primaryModel } = await discoverBestModel(key);
  const candidateModels = Array.from(new Set([primaryModel, ...FALLBACK_FLASH_MODELS]));

  let lastError: any = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          cachedWorkingModel = model;
          return candidateText;
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);
        if (cachedWorkingModel === model) cachedWorkingModel = null;
        if (response.status === 400 && (errMsg.includes('API_KEY_INVALID') || errMsg.includes('key not valid'))) {
          throw new Error('Der eingegebene Gemini API-Schlüssel ist ungültig.');
        }
      }
    } catch (e: any) {
      lastError = e;
      if (e.message?.includes('ungültig')) throw e;
    }
  }

  throw lastError || new Error('Kein funktionierendes Gemini-Modell erreichbar.');
}

// Statische Standard-Vorlagen (zuverlässiger Fallback)
export const STATIC_MAGIC_TEMPLATES: Record<TaskTag, string[]> = {
  recherche: [
    'Thema genau eingrenzen',
    'Quellen suchen (Bücher/Internet)',
    'Quellen auf Seriösität prüfen',
    'Wichtige Infos markieren',
    'Quellenangaben notieren',
  ],
  text: [
    'Gliederung/Struktur erstellen',
    'Einleitung schreiben',
    'Hauptteil formulieren',
    'Fazit ziehen',
    'Auf Rechtschreibung prüfen',
  ],
  layout: [
    'Farbkonzept überlegen',
    'Passende Bilder/Grafiken suchen',
    'Texte platzieren',
    'Überschriften hervorheben',
    'Auf Lesbarkeit prüfen',
  ],
  material: [
    'Benötigtes Material auflisten',
    'Material einkaufen/besorgen',
    'Arbeitsplatz einrichten',
  ],
  praesentation: [
    'Stichwortkarten (Karteikarten) schreiben',
    'Wer sagt was? (Übergänge planen)',
    'Vortrag 1x komplett laut üben',
    'Die Zeit stoppen',
    'Körperhaltung & Lautstärke checken',
  ],
  medien: [
    'Geräte/Material testen',
    'Medien (Video/Audio) aufnehmen',
    'Schnitt / Bearbeitung',
    'Speichern & Backup machen',
    'Technik-Test im Klassenzimmer',
  ],
  kontrolle: [
    'Rechtschreibung und Grammatik prüfen',
    'Sind alle Vorgaben erfüllt?',
    'Einer anderen Gruppe zeigen (Feedback)',
    'Feedback einarbeiten / Fehler korrigieren',
  ],
  none: [
    'Ersten Schritt planen',
    'Aufgabe durchführen',
    'Ergebnis kontrollieren',
  ],
};

// 1. KI-Zauberstab: Kontextuelle Teilschritte für Schüleraufgaben generieren
export async function generateSubtasksWithGemini(
  taskTitle: string,
  category: TaskTag,
  projectContext?: string
): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return STATIC_MAGIC_TEMPLATES[category] || STATIC_MAGIC_TEMPLATES.none;
  }

  const prompt = `Du bist ein erfahrener, schülerfreundlicher Lehrer an der Regelschule Heimbürgeschule Kahla.
Deine Aufgabe ist es, Schülern der Klassenstufe 7 bis 10 zu helfen, eine größere Projektaufgabe in 4 bis 5 machbare, konkrete Teilschritte (Checkliste) zu zerlegen.

AUFGABE DES SCHÜLERS:
- Titel: "${taskTitle}"
- Kategorie: ${category}
${projectContext ? `- Projektthema: "${projectContext}"` : ''}

ANFORDERUNGEN:
- Erstelle 4 bis 5 prägnante, motivierende und für Schüler verständliche Teilschritte (Checkpunkte).
- Jeder Teilschritt soll ein klarer, praktischer Handlungsschritt sein (z. B. "3 seriöse Internetquellen finden", "Stichpunkte auf Karteikarten notieren").
- Keine langen Erklärungen, nur die Stichpunkte.

Antworte STRENG als valides JSON in diesem Format:
{
  "subtasks": [
    "Teilschritt 1",
    "Teilschritt 2",
    "Teilschritt 3",
    "Teilschritt 4"
  ]
}`;

  try {
    const rawJson = await executeGeminiRequest(apiKey, prompt);
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0) {
      return parsed.subtasks.map((s: any) => String(s).trim());
    }
  } catch (err) {
    console.warn('KI-Zauberstab Fallback auf statische Vorlage:', err);
  }

  return STATIC_MAGIC_TEMPLATES[category] || STATIC_MAGIC_TEMPLATES.none;
}

// 2. KI-Projektcoach bei Blockern & Hilferufen
export async function generateCoachAdvice(
  task: Task,
  projectName?: string
): Promise<{ coachQuestion: string; tips: string[]; encouragement: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      coachQuestion: 'Wo genau kommt ihr gerade nicht weiter?',
      tips: [
        'Besprecht im Team, welcher Einzelschritt euch blockiert.',
        'Fragt eine Nachbargruppe, wie sie das Problem gelöst hat.',
        'Geht mit einer konkreten Frage zur Lehrkraft.',
      ],
      encouragement: 'Jedes Projekt hat mal einen Hänger – macht euch nichts draus, ihr schafft das!',
    };
  }

  const prompt = `Du bist ein einfühlsamer, motivierender Lerncoach an der Heimbürgeschule Kahla.
Eine Schülergruppe signalisiert bei einer Projektaufgabe ein Problem ("Blockiert / Hilfe").
Gib ihnen pädagogisch wertvolle Leitfragen und Tipps, die ihre Selbstorganisation stärken, ohne ihnen die Denkarbeit abzunehmen.

PROJEKT: ${projectName || 'Schulprojekt'}
BLOCKIERTE AUFGABE: "${task.title}"
BESCHREIBUNG / PROBLEM: "${task.blockerReason || task.desc || 'Schüler kommen hier nicht weiter.'}"
KATEGORIE: ${task.tag}

Antworte STRENG als valides JSON:
{
  "coachQuestion": "Eine gezielte Reflexionsfrage, die den Schülern hilft, das Kernproblem zu isolieren",
  "tips": [
    "Praktischer Tipp 1",
    "Praktischer Tipp 2",
    "Praktischer Tipp 3"
  ],
  "encouragement": "Ein kurzer, motivierender Satz für die Gruppe"
}`;

  try {
    const raw = await executeGeminiRequest(apiKey, prompt);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      coachQuestion: parsed.coachQuestion || 'Wo genau hakt es gerade?',
      tips: Array.isArray(parsed.tips) ? parsed.tips : ['Geht kurz die Teilschritte durch.'],
      encouragement: parsed.encouragement || 'Ihr seid auf einem guten Weg!',
    };
  } catch (e) {
    return {
      coachQuestion: 'Welcher Schritt fehlt euch noch, um weiterzukommen?',
      tips: ['Überprüft eure Quellen.', 'Teilt die Aufgabe noch feiner auf.'],
      encouragement: 'Zusammen findet ihr eine Lösung!',
    };
  }
}

// 3. KI-Reflexionshelfer für das Tagebuch
export async function generateJournalImpulses(
  board: ProjectBoard
): Promise<{ goodImpulse: string; challengeImpulse: string; nextGoalImpulse: string }> {
  const apiKey = getGeminiApiKey();
  const completedToday = board.tasks.filter((t) => t.status === 'done');
  const inProgress = board.tasks.filter((t) => t.status === 'in_progress');

  if (!apiKey) {
    return {
      goodImpulse: 'Welche Aufgabe hat euch heute am meisten vorangebracht?',
      challengeImpulse: 'Gab es Missverständnisse oder technische Probleme?',
      nextGoalImpulse: 'Welche eine Aufgabe wollt ihr beim nächsten Mal als erstes abschließen?',
    };
  }

  const prompt = `Du bist Lehrkraft an der Heimbürgeschule Kahla. Gib einer Schülergruppe für ihr Projekt-Tagebuch konkrete Reflexionsimpulse basierend auf ihrem heutigen Arbeitsstand.

PROJEKT: "${board.projectName || 'Projekt'}" (Gruppe: ${board.studentName || 'Gruppe'})
ERLEDIGTE AUFGABEN: ${completedToday.map((t) => t.title).join(', ') || 'noch keine'}
IN ARBEIT: ${inProgress.map((t) => t.title).join(', ') || 'noch keine'}

Antworte STRENG als valides JSON:
{
  "goodImpulse": "Kurzer Impuls für 'Das lief heute gut'",
  "challengeImpulse": "Kurzer Impuls für 'Das war schwierig'",
  "nextGoalImpulse": "Kurzer Impuls für 'Ziel für nächstes Mal'"
}`;

  try {
    const raw = await executeGeminiRequest(apiKey, prompt);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      goodImpulse: 'Welches Zwischenergebnis könnt ihr heute vorweisen?',
      challengeImpulse: 'Wo habt ihr die meiste Zeit verloren?',
      nextGoalImpulse: 'Was ist die dringendste Aufgabe für die nächste Stunde?',
    };
  }
}

// 4. KI-Projektbericht für die Lehrkraft (Noten- & Bewertungs-Vorbereitung)
export async function generateTeacherProjectReport(
  board: ProjectBoard
): Promise<{ summary: string; workProcessAssessment: string; strengths: string[]; advice: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Bitte hinterlege einen Gemini API-Schlüssel in den Einstellungen.');
  }

  const doneCount = board.tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = board.tasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = board.tasks.filter((t) => t.status === 'todo').length;
  const blockers = board.tasks.filter((t) => t.needsHelp);

  const prompt = `Du bist ein erfahrener Fachlehrer an der Staatlichen Regelschule Heimbürgeschule Kahla.
Erstelle auf Basis des Projektkompass-Boards einer Schülergruppe eine pädagogische Zusammenfassung des Arbeitsprozesses für die Lehrkraft (zur Notengebung und Feedback-Gespräch).

PROJEKTDATEN:
- Projekttitel: "${board.projectName}"
- Gruppe: "${board.studentName}"
- Klasse: "${board.studentClass}"
- Aufgabenstatus: Erledigt: ${doneCount}, In Arbeit: ${inProgressCount}, Offen: ${todoCount}
- Registrierte Blocker/Hilfeersuchen: ${blockers.length} (${blockers.map((b) => b.title).join(', ')})
- Projekt-Tagebuch der Schüler:
  * Gut gelaufen: "${board.journalGood}"
  * Schwierig: "${board.journalBad}"
  * Nächstes Ziel: "${board.journalNext}"

Antworte STRENG als valides JSON:
{
  "summary": "2-3 Sätze Zusammenfassung des Arbeitsstands und der Selbstorganisation",
  "workProcessAssessment": "Einschätzung des Arbeitsprozesses (Kontinuität, Aufgabenstrukturierung, Problemlösekompetenz)",
  "strengths": ["Stärke 1", "Stärke 2", "Stärke 3"],
  "advice": "Konstruktive Rückmeldung / Impuls für das Feedbackgespräch mit der Gruppe"
}`;

  const raw = await executeGeminiRequest(apiKey, prompt);
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}
