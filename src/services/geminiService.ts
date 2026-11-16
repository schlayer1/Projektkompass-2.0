import { Task, TaskTag, ProjectBoard } from '../types/project';

/**
 * Gibt ausschließlich einen optional im Browser gespeicherten persönlichen BYOK-Key zurück.
 * Der offizielle Schulschlüssel liegt sicher auf dem Server in Vercel (GEMINI_API_KEY).
 */
export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const fromLocal = localStorage.getItem('gemini_api_key') || '';
    return fromLocal.trim();
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem('gemini_api_key', trimmed);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

let cachedWorkingModel: string | null = null;

const FALLBACK_FLASH_MODELS = [
  'gemini-4-hydrogen',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

export async function discoverBestModel(key?: string): Promise<{ model: string; version: string }> {
  const customKey = (key || getGeminiApiKey()).trim();
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: customKey || 'serverless-proxy',
      userPrompt: 'Antworte nur mit {"ok":true}',
      temperature: 0.1,
      maxOutputTokens: 64,
      responseMimeType: 'application/json',
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || `HTTP ${res.status} vom Gemini-Proxy`);
  }

  const data = await res.json();
  const activeModel = data?.model || FALLBACK_FLASH_MODELS[0];
  cachedWorkingModel = activeModel;
  return { model: activeModel, version: 'v1beta' };
}

async function executeGeminiRequest(key: string, promptText: string): Promise<string> {
  const customKey = (key || getGeminiApiKey()).trim();

  // 1. Primärer Pfad: Sicherer Serverless-Proxy (/api/gemini)
  try {
    const proxyRes = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: customKey || 'serverless-proxy',
        userPrompt: promptText,
        model: cachedWorkingModel || 'auto',
        temperature: 0.3,
        responseMimeType: 'application/json',
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data?.text) {
        cachedWorkingModel = data.model || cachedWorkingModel;
        return data.text;
      }
    }

    if (proxyRes.status !== 404) {
      const errData = await proxyRes.json().catch(() => ({}));
      throw new Error(errData?.error || `HTTP ${proxyRes.status} vom Gemini-Proxy`);
    }
  } catch (proxyErr: any) {
    if (proxyErr?.message && !proxyErr.message.includes('404')) {
      throw proxyErr;
    }
  }

  // 2. Fallback bei 404 nur mit persönlichem BYOK-Schlüssel
  if (!customKey) {
    throw new Error('Der Gemini-Server-Proxy (/api/gemini) ist nicht erreichbar.');
  }

  const candidateModels = cachedWorkingModel
    ? Array.from(new Set([cachedWorkingModel, ...FALLBACK_FLASH_MODELS]))
    : FALLBACK_FLASH_MODELS;

  let lastError: any = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(customKey)}`;
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
    const raw = await executeGeminiRequest('', prompt);
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
    const raw = await executeGeminiRequest('', prompt);
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

// 5. KI-Generalproben-Helfer für die Verteidigung
export async function generatePresentationAdvice(
  board: ProjectBoard,
  task: Task | null
): Promise<{ examQuestions: string[]; tipsForDefense: string[]; rolePlayAdvice: string }> {
  const fallbackData = {
    examQuestions: [
      'Warum habt ihr genau diesen Praxisschwerpunkt gewählt?',
      'Welche Quelle war für euer Fazit am verlässlichsten und warum?',
      'Was würdet ihr rückblickend anders planen, wenn ihr noch einmal anfangen könntet?',
    ],
    tipsForDefense: [
      'Jedes Gruppenmitglied sollte einen gleich langen Redeanteil haben.',
      'Nicht von den Folien ablesen – nutzt kleine Karteikarten mit Stichworten.',
      'Haltet Blickkontakt zu allen Prüfern und Lehrkräften im Raum.',
    ],
    rolePlayAdvice: 'Übt den Vortrag 1x komplett laut mit der Stoppuhr durch, ohne mittendrin abzubrechen!',
  };

  const prompt = `Du bist Fachprüfer und Betreuungslehrer an der Staatlichen Regelschule Heimbürgeschule Kahla in Thüringen.
Eine Schülergruppe bereitet die Verteidigung / Präsentation ihrer Projektarbeit vor.

PROJEKT: "${board.projectName}"
FACH / BEREICH: "${board.subject || 'Allgemein'}"
KLASSE: "${board.studentClass}" (Projekt-Typ: ${board.projectType === 'grad10' ? 'Prüfung Klasse 10' : 'Fachunterricht'})
AUFGABE: "${task?.title || 'Präsentation'}" (${task?.desc || 'Präsentation üben'})

Formuliere für die Generalprobe der Schüler:
1. Drei realistische, typische Prüfungs- oder Fachfragen, die Lehrkräfte in der Fragerunde nach dem Vortrag stellen.
2. Drei praktische Tipps für den Vortrag (Körpersprache, Übergänge im Team, Folien).
3. Einen motivierenden Tipp für die Generalprobe.

Antworte STRENG als valides JSON:
{
  "examQuestions": ["Frage 1", "Frage 2", "Frage 3"],
  "tipsForDefense": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "rolePlayAdvice": "Ein Satz zum Ablauf der Generalprobe"
}`;

  try {
    const raw = await executeGeminiRequest('', prompt);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      examQuestions: Array.isArray(parsed.examQuestions) && parsed.examQuestions.length > 0 ? parsed.examQuestions : fallbackData.examQuestions,
      tipsForDefense: Array.isArray(parsed.tipsForDefense) && parsed.tipsForDefense.length > 0 ? parsed.tipsForDefense : fallbackData.tipsForDefense,
      rolePlayAdvice: parsed.rolePlayAdvice || fallbackData.rolePlayAdvice,
    };
  } catch (err) {
    console.warn('KI-Präsentationscoach Fallback:', err);
    return fallbackData;
  }
}

