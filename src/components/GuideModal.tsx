import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Compass,
  CheckCircle2,
  Sparkles,
  LifeBuoy,
  Users,
  Calendar,
  Layers,
  GraduationCap,
  Download,
  Upload,
  Printer,
  Share2,
  Clock,
  Mic,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'student' | 'teacher';
}

type GuideTab = 'tour' | 'handbook';
type TargetRole = 'student' | 'teacher';

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'student',
}) => {
  const [role, setRole] = useState<TargetRole>(initialRole);
  const [tab, setTab] = useState<GuideTab>('tour');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeHandbookSection, setActiveHandbookSection] = useState<string>('intro');

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // SCHÜLER-TOUR: 5 interaktive Schritte mit visuellen Beispielen
  // -------------------------------------------------------------
  const studentTourSteps = [
    {
      title: 'Willkommen beim Projektkompass!',
      subtitle: 'Dein digitaler Begleiter für Fachprojekte und die Abschlussarbeit in Klasse 10 an der Heimbürgeschule Kahla.',
      tip: 'Du kannst das Projekt gemeinsam im Team bearbeiten – alle Daten bleiben sicher auf eurem Board gespeichert.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-sky-50 border-2 border-[#0B7BA7] p-0.5 shrink-0 flex items-center justify-center font-black text-[#0B7BA7] text-xs">
                HBS
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-[#0B7BA7] text-sm">Projektkompass</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-50 text-[#0B7BA7] border border-sky-200">
                    🎓 Jg. 10 Abschluss
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">Vulkanismus & Plattentektonik • Gruppe 1 (10a)</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-sky-50 text-[#0B7BA7] border border-sky-200 px-2 py-1 rounded-md text-xs font-bold shrink-0">
              <span>Code: PK-10A1</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[11px] font-semibold text-gray-600">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="block text-base mb-0.5">📋</span>
              Kanban-Aufgaben
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="block text-base mb-0.5">📅</span>
              Timeline & Termine
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="block text-base mb-0.5">🤖</span>
              KI-Lerncoach
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Die Meilenstein-Timeline: Deine Roadmap',
      subtitle: 'Damit du nie eine Frist verpasst – von der Themenwahl bis zur Verteidigung.',
      tip: 'Für Klasse 10 sind die 6 offiziellen Etappen der Thüringer Abschlussprüfung bereits hinterlegt. Klicke auf eine Etappe, um sie als erledigt abzuhaken.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0B7BA7]" /> Prüfungs-Timeline (Klasse 10)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                2/6 Etappen (33%)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[10px]">
                <div className="flex justify-between font-bold text-emerald-800 mb-0.5">
                  <span>1. Exposé</span>
                  <span>✓</span>
                </div>
                <span className="text-emerald-600 font-medium">Genehmigt</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[10px]">
                <div className="flex justify-between font-bold text-emerald-800 mb-0.5">
                  <span>2. Gliederung</span>
                  <span>✓</span>
                </div>
                <span className="text-emerald-600 font-medium">Eingereicht</span>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 text-[10px]">
                <div className="flex justify-between font-bold text-amber-900 mb-0.5">
                  <span>3. Konsultation</span>
                  <span>20. Jan</span>
                </div>
                <span className="text-amber-700 font-medium">Zwischenstand</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kanban-Board & Checklisten mit KI-Zauberstab',
      subtitle: 'Plane deine Aufgaben in Spalten: „Zu Erledigen“, „In Arbeit“ und „Erledigt“.',
      tip: 'Weißt du bei einer großen Aufgabe nicht, wie du anfangen sollst? Der KI-Zauberstab teilt sie automatisch in 4 machbare Checklisten-Schritte auf!',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-xs text-gray-800">Plakatgestaltung & Gliederung</h4>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                🎨 Layout
              </span>
            </div>
            {/* Checklist */}
            <div className="bg-sky-50/70 p-2 rounded-lg border border-sky-200 text-[11px] space-y-1 mb-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#0B7BA7] mb-1">
                <span>Checkliste (Teilschritte)</span>
                <span className="flex items-center gap-0.5 text-[9px] bg-white px-1.5 py-0.5 rounded border border-sky-300">
                  <Sparkles className="w-2.5 h-2.5 text-[#F39200]" /> KI-Zauberstab
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-gray-700">
                <input type="checkbox" checked readOnly className="rounded text-[#0B7BA7]" />
                <span className="line-through text-gray-400">Hauptüberschrift lesbar vorskizzieren</span>
              </label>
              <label className="flex items-center gap-1.5 text-gray-700">
                <input type="checkbox" checked readOnly className="rounded text-[#0B7BA7]" />
                <span className="line-through text-gray-400">Farbkonzept auf 3 Leitfarben abstimmen</span>
              </label>
              <label className="flex items-center gap-1.5 text-gray-700">
                <input type="checkbox" readOnly className="rounded text-[#0B7BA7]" />
                <span>3 Querschnitts-Grafiken einkleben</span>
              </label>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                👤 Anna Schmidt
              </span>
              <span className="font-bold text-amber-700">⏱️ In 3 Tagen</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Hürden & Blocker melden (Hilfe-Knopf)',
      subtitle: 'Kommt ihr im Team mal nicht weiter? Ein Klick genügt, um die Lehrkraft zu informieren.',
      tip: 'Wenn ein Rechner streikt oder Material fehlt: Klickt auf den roten „Hilfe“-Knopf. Eure Lehrkraft sieht den Blocker sofort im Cockpit, und der KI-Coach gibt euch erste Hilfsimpulse!',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-300 bg-red-50/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-xs font-bold text-red-700">
                <AlertOctagon className="w-4 h-4 text-red-600" /> Blocker gemeldet
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-md shadow-xs">
                Hilfe aktiv
              </span>
            </div>
            <p className="text-xs text-red-950 mb-2 font-medium">
              „Materialraum war heute abgeschlossen, wir können das 3D-Vulkanmodell nicht weiterbauen.“
            </p>
            <div className="bg-white p-2 rounded-lg border border-red-200 flex items-center justify-between text-[11px]">
              <span className="text-gray-600 flex items-center gap-1 font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-[#F39200]" /> KI-Coach: Teilt schon den Textteil auf!
              </span>
              <span className="font-bold text-[#0B7BA7] text-[10px]">Ratgeber öffnen →</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tagebuch-Reflexion, EduPage & PDF-Export',
      subtitle: 'Am Ende jeder Stunde kurz reflektieren – und Nachweise für die Prüfung sichern.',
      tip: 'Nutzt den Button „Bericht“, um eine fertige Zusammenfassung für eure Hausaufgaben oder EduPage in die Zwischenablage zu kopieren, oder druckt ein sauberes PDF-Portfolio.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#0B7BA7]" /> Projekt-Tagebuch (Reflexion)
              </span>
              <span className="text-[10px] font-bold text-[#0B7BA7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ✨ KI-Impulse
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200">
                <span className="font-bold text-emerald-800 block mb-0.5">👍 Das lief gut</span>
                <span className="text-gray-600">Gliederung mit Hr. Könitzer besprochen.</span>
              </div>
              <div className="bg-amber-50/70 p-2 rounded border border-amber-200">
                <span className="font-bold text-amber-800 block mb-0.5">🎯 Nächstes Ziel</span>
                <span className="text-gray-600">Einleitung schreiben und Quellen prüfen.</span>
              </div>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-300">
                <Printer className="w-3 h-3" /> PDF-Nachweis
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-[#0B7BA7] text-white rounded">
                <Share2 className="w-3 h-3" /> EduPage-Bericht
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // -------------------------------------------------------------
  // LEHRER-TOUR: 5 interaktive Schritte mit Cockpit & Begleitung
  // -------------------------------------------------------------
  const teacherTourSteps = [
    {
      title: 'Lehrer-Cockpit: Alle Schülergruppen im Blick',
      subtitle: 'Melde dich mit deiner persönlichen 4-stelligen Lehrer-PIN der Heimbürgeschule an.',
      tip: 'Du siehst alle Projektgruppen deiner Klassen in Echtzeit – inklusive Aufgabenfortschritt, Fristen und aktuellem Reflexionsstand.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#F39200] text-white p-1.5 rounded-lg">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-black text-xs text-gray-900">Lehrer-Cockpit (HBS Kahla)</h4>
                  <p className="text-[10px] text-gray-500">Angemeldet als: Herr Könitzer T.</p>
                </div>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] font-bold bg-sky-50 text-[#0B7BA7] px-2 py-0.5 rounded border border-sky-200">
                  Klasse 10a
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  4 Gruppen
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">Gruppe 1: Erneuerbare Energien</span>
                  <p className="text-[10px] text-gray-500">Anna, Lisa, Tom • 6/8 Aufgaben erledigt</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  75% Fertig
                </span>
              </div>
              <div className="bg-red-50/70 p-2 rounded-lg border border-red-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-900 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-red-600" /> Gruppe 2: Vulkanismus
                  </span>
                  <p className="text-[10px] text-red-700">Hilferuf: Schulrechner blockieren Bildsuche</p>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  Hilfe nötig!
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Automatischer Blocker-Alarm & Hilfesystem',
      subtitle: 'Erkenne Hürden und Teamprobleme sofort, statt erst bei der Notenabgabe.',
      tip: 'Schüler, die den roten Hilfe-Button drücken, erscheinen ganz oben in deiner Übersicht. Du kannst ihnen mit einem Klick einen Impuls schicken oder sie an den Lehrertisch rufen.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1 text-red-600">
                <AlertOctagon className="w-4 h-4" /> 1 Gruppe benötigt Unterstützung
              </span>
              <span className="text-[10px] text-gray-400">vor 4 Minuten</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <p className="text-gray-700 mb-2">
                „Wir finden keine verlässlichen Primärquellen für das Kapitel 2.“
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button className="bg-sky-50 text-[#0B7BA7] border border-sky-300 font-bold px-2 py-0.5 rounded hover:bg-sky-100">
                  💬 „Kommt kurz an den Lehrertisch! 👥“
                </button>
                <button className="bg-sky-50 text-[#0B7BA7] border border-sky-300 font-bold px-2 py-0.5 rounded hover:bg-sky-100">
                  💬 „Prüft das GEO-Buch S. 44 🔍“
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Eigene Meilensteine & Timeline festlegen',
      subtitle: 'Passen Sie die Prüfungs- oder Fachunterrichts-Timeline individuell für Ihre Klassen an.',
      tip: 'Über den Button „Timeline anpassen“ können Sie Etappen umbenennen, neue Zwischenfristen einfügen oder offizielle Prüfungstermine für das Schuljahr vorgeben.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-800">
              <span>Etappen-Verwaltung (Timeline-Editor)</span>
              <span className="text-[10px] text-[#0B7BA7] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                + Neuer Meilenstein
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-gray-800">1. Exposé & Forschungsfrage</span>
                <span className="font-mono text-gray-500 text-[10px]">25.10.2026</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-gray-800">2. Gliederungsentwurf & Quellen</span>
                <span className="font-mono text-gray-500 text-[10px]">15.12.2026</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-sky-50 rounded border border-sky-200 text-[#0B7BA7] font-bold">
                <span>3. Offizielle Konsultation 1</span>
                <span className="font-mono text-[10px]">20.01.2027</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Digitale Konsultationsprotokolle (Prüfungsnachweis)',
      subtitle: 'Protokollieren Sie offizielle Pflicht-Konsultationen für Klasse 10 rechtssicher digital.',
      tip: 'Erfassen Sie Anwesenheit der Schüler, besprochene Schwerpunkte und verbindliche nächste Schritte direkt im Board. Die Protokolle können als Nachweis ausgedruckt werden.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0B7BA7]" /> Konsultationsprotokoll #1
              </span>
              <span className="text-[10px] font-bold text-gray-500">20. Januar 2027</span>
            </div>
            <div className="text-[11px] space-y-1 text-gray-700">
              <p><strong className="text-gray-900">Anwesend:</strong> Anna Schmidt, Lisa Weber, Tom Müller</p>
              <p><strong className="text-gray-900">Schwerpunkt:</strong> Auswertung der Fachliteratur und Rohfassung Gliederung.</p>
              <p><strong className="text-gray-900">Vereinbarung:</strong> Bis 28.02. Entwurf für Kapitel 1-3 abgeben.</p>
            </div>
            <div className="pt-1 flex justify-end">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Protokolliert & bestätigt
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'KI-Bericht zur Noten- & Bewertungsvorbereitung',
      subtitle: 'Sparen Sie wertvolle Zeit bei der Einschätzung des Arbeitsprozesses für die Zeugnisnote.',
      tip: 'Mit einem Klick fasst Gemini den gesamten Projektverlauf (Erledigungsquote, Kontinuität, Blocker-Bewältigung, Reflexion) sachlich zusammen und schlägt Feedback-Punkte vor.',
      renderIllustration: () => (
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="bg-white rounded-xl shadow-sm border border-sky-200 p-3.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#0B7BA7] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F39200]" /> KI-Arbeitsprozess-Einschätzung
              </span>
              <span className="text-[9px] font-mono text-gray-400">Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-snug">
              „Die Gruppe zeichnet sich durch eine sehr strukturierte Aufgabenverteilung aus. Fristen wurden kontinuierlich eingehalten; aufgetretene Hürden wurden eigenständig formuliert und gelöst.“
            </p>
            <div className="bg-slate-50 p-2 rounded text-[10px] text-gray-600 space-y-0.5">
              <div className="font-bold text-gray-800">Stärken:</div>
              <div>• Hohe Selbstorganisation in den Recherchephasen</div>
              <div>• Sehr reflektierte Einträge im Arbeitsjournal</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeTour = role === 'student' ? studentTourSteps : teacherTourSteps;
  const currentStepData = activeTour[currentStep] || activeTour[0];

  const handleNextStep = () => {
    if (currentStep < activeTour.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('pk_onboarding_completed', 'true');
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSwitchRole = (newRole: TargetRole) => {
    setRole(newRole);
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#0B7BA7] to-[#00558F] px-4 sm:px-6 py-3.5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-xs shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight m-0">
                  Projektkompass Guide & Handbuch
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 rounded-full border border-white/30 hidden sm:inline">
                  Regelschule »Heimbürgeschule« Kahla
                </span>
              </div>
              <p className="text-xs text-sky-100 truncate m-0">
                Praxishilfe und Anleitung für Schüler/innen und Lehrkräfte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors ml-2 shrink-0"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR: Role Switcher & Tab Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Role selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleSwitchRole('student')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                role === 'student'
                  ? 'bg-[#0B7BA7] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Für Schüler/innen</span>
            </button>
            <button
              onClick={() => handleSwitchRole('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                role === 'teacher'
                  ? 'bg-[#F39200] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Für Lehrkräfte</span>
            </button>
          </div>

          {/* View mode toggle: Tour vs. Vollständiges Handbuch */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('tour')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                tab === 'tour'
                  ? 'bg-white text-gray-900 font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F39200]" />
              <span>Schritt-für-Schritt Tour</span>
            </button>
            <button
              onClick={() => setTab('handbook')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                tab === 'handbook'
                  ? 'bg-white text-gray-900 font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0B7BA7]" />
              <span>Vollständiges Handbuch</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'tour' ? (
            /* ============================================================ */
            /* TAB 1: INTERAKTIVE SCHRITT-FÜR-SCHRITT TOUR                  */
            /* ============================================================ */
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
              {/* Stepper Dots & Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  {activeTour.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentStep
                          ? role === 'student' ? 'w-8 bg-[#0B7BA7]' : 'w-8 bg-[#F39200]'
                          : idx < currentStep
                          ? 'w-2.5 bg-emerald-500'
                          : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                      title={`Schritt ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-400">
                  Schritt {currentStep + 1} von {activeTour.length}
                </span>
              </div>

              {/* Step Content */}
              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1.5 leading-snug">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {currentStepData.subtitle}
                </p>

                {/* Bebilderte Illustration / Mockup */}
                <div className="my-3">
                  {currentStepData.renderIllustration()}
                </div>

                {/* Praxistipp */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 mt-4">
                  <Lightbulb className="w-4 h-4 text-[#F39200] shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-950 leading-relaxed font-medium m-0">
                    <strong className="font-bold">Praxistipp für die Heimbürgeschule:</strong> {currentStepData.tip}
                  </p>
                </div>
              </div>

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-gray-700 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Zurück</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-transform active:scale-95 ${
                    role === 'student' ? 'bg-[#0B7BA7] hover:bg-[#00558F]' : 'bg-[#F39200] hover:bg-[#d68000]'
                  }`}
                >
                  <span>
                    {currentStep === activeTour.length - 1 ? 'Tour abschließen & loslegen' : 'Nächster Schritt'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* TAB 2: VOLLSTÄNDIGES BEBILDERTES HANDBUCH                    */
            /* ============================================================ */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Table of contents sidebar */}
              <div className="md:col-span-1 border-r border-slate-100 pr-0 md:pr-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Inhaltsverzeichnis ({role === 'student' ? 'Schüler' : 'Lehrer'})
                </h4>
                <nav className="space-y-1">
                  {role === 'student' ? (
                    <>
                      <button
                        onClick={() => setActiveHandbookSection('intro')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'intro' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        1. Projekt einrichten & Code teilen
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('timeline')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'timeline' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        2. Die 6 Meilensteine (Klasse 10)
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('kanban')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'kanban' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        3. Kanban-Board & Aufgaben
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('ai_magic')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'ai_magic' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        4. KI-Zauberstab & Diktierfunktion
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('blocker')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'blocker' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        5. Blocker-Hilferuf & Coach
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('export')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'export' ? 'bg-sky-50 text-[#0B7BA7]' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        6. Tagebuch, EduPage & PDF-Druck
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveHandbookSection('cockpit_login')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'cockpit_login' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        1. PIN-Login & Klassenübersicht
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('monitoring')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'monitoring' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        2. Live-Monitoring & Blocker-Alarm
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('custom_timeline')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'custom_timeline' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        3. Eigene Timelines erstellen
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('consultations')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'consultations' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        4. Pflicht-Konsultationen protokollieren
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('ai_grading')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'ai_grading' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        5. KI-Bericht zur Notengebung
                      </button>
                      <button
                        onClick={() => setActiveHandbookSection('api_security')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          activeHandbookSection === 'api_security' ? 'bg-amber-50 text-amber-900' : 'text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        6. Gemini API & Admin-Schutz
                      </button>
                    </>
                  )}
                </nav>
              </div>

              {/* Handbook content view */}
              <div className="md:col-span-2 text-gray-700 text-xs sm:text-sm leading-relaxed space-y-4">
                {/* SCHÜLER INHALTE */}
                {role === 'student' && (
                  <>
                    {activeHandbookSection === 'intro' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          1. Projekt einrichten & Projekt-Code teilen
                        </h3>
                        <p>
                          Tragt in der oberen Leiste euren <strong>Projekttitel</strong>, den <strong>Gruppennamen</strong> (z. B. „Gruppe 2“), die <strong>Klasse</strong> (z. B. „10a“) sowie eure betreuende <strong>Lehrkraft</strong> ein.
                        </p>
                        <div className="bg-sky-50 p-3 rounded-xl border border-sky-200">
                          <strong className="text-[#0B7BA7] font-bold block mb-1">🔑 Der Projekt-Code:</strong>
                          Rechts oben im Header seht ihr einen Code wie z.B. <code className="bg-white px-2 py-0.5 rounded border border-sky-300 font-bold">PK-10A1</code>. Klickt auf das Kopieren-Symbol, um den Code an eure Teammitglieder weiterzugeben. Jeder mit diesem Code kann euer Projekt direkt aufrufen.
                        </div>
                        <p>
                          Über den Button <strong>Gruppenmitglieder</strong> (👥) könnt ihr die Namen aller Schüler eintragen, damit ihr Aufgaben später gezielt einzelnen Personen zuweisen könnt.
                        </p>
                      </div>
                    )}

                    {activeHandbookSection === 'timeline' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          2. Die Meilenstein-Timeline für Klasse 10
                        </h3>
                        <p>
                          In Thüringen ist die Projektarbeit in Klasse 10 an feste Termine gebunden. Der Projektkompass führt euch chronologisch durch alle 6 offiziellen Etappen:
                        </p>
                        <ol className="list-decimal list-inside space-y-1.5 font-medium text-gray-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <li><strong>Exposé & Themenbegründung:</strong> Einigung auf das Thema und Genehmigung durch den Betreuer.</li>
                          <li><strong>Gliederung & Arbeitsplan:</strong> Detailliertes Inhaltsverzeichnis und Rechercheplan.</li>
                          <li><strong>1. Konsultation:</strong> Offizieller Zwischenstand und Leitfragen.</li>
                          <li><strong>Rohfassung der schriftlichen Arbeit:</strong> Erster Textentwurf aller Gruppenmitglieder.</li>
                          <li><strong>Endgültige Abgabe:</strong> Fristgerechte Abgabe der gebundenen Exemplare im Schulsekretariat.</li>
                          <li><strong>Kolloquium / Verteidigung:</strong> Präsentation vor der Prüfungskommission.</li>
                        </ol>
                        <p className="text-xs text-gray-500">
                          Klickt einfach auf eine Etappe, wenn ihr sie abgeschlossen habt – der Fortschrittsbalken aktualisiert sich live!
                        </p>
                      </div>
                    )}

                    {activeHandbookSection === 'kanban' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          3. Kanban-Board: Aufgaben managen
                        </h3>
                        <p>
                          Große Projekte gelingen am besten, wenn man sie in viele kleine, überschaubare Aufgaben aufteilt.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-[#F39200] shrink-0">🟠 Zu Erledigen:</span>
                            Aufgaben, die als nächstes anstehen. Klicke auf <strong>+ Neue Aufgabe</strong>, um eine Karte anzulegen.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-[#0B7BA7] shrink-0">🔵 In Arbeit:</span>
                            Woran ihr gerade aktiv in der aktuellen Schulstunde arbeitet. Zieht die Karte einfach per Drag & Drop oder klickt auf den Pfeil (→).
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-[#00A896] shrink-0">🟢 Erledigt:</span>
                            Geschafft! Wenn ihr eine Karte hierher verschiebt, feiert der Projektkompass euren Erfolg mit virtuellem Konfetti.
                          </li>
                        </ul>
                      </div>
                    )}

                    {activeHandbookSection === 'ai_magic' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          4. KI-Zauberstab & Diktierfunktion
                        </h3>
                        <p>
                          Beim Anlegen oder Bearbeiten einer Aufgabe stehen euch zwei clevere Werkzeuge zur Seite:
                        </p>
                        <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 space-y-2">
                          <div className="font-bold text-[#0B7BA7] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#F39200]" /> Der KI-Zauberstab:
                          </div>
                          <p className="text-xs">
                            Klicke in der Aufgaben-Checkliste auf „Zauberstab“. Die integrierte Schullehrer-KI analysiert Titel und Fachbereich eurer Aufgabe und schlägt automatisch 4 bis 5 konkrete Teilschritte vor.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Mic className="w-4 h-4 text-[#0B7BA7]" /> Sprach-Diktierfunktion:
                          </div>
                          <p className="text-xs">
                            Tippen am Smartphone zu langsam? Klicke auf das Mikrofon-Symbol neben der Beschreibung und sprich deine Notizen oder Absprachen einfach ein.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'blocker' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          5. Blocker-Hilferuf & KI-Projektcoach
                        </h3>
                        <p>
                          Es ist völlig normal, dass bei einer Projektarbeit Probleme auftreten (z. B. unklare Aufgabenstellung, defekter USB-Stick, Streit im Team).
                        </p>
                        <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1.5">
                          <strong className="text-red-700 font-bold block">So funktioniert der Hilferuf:</strong>
                          <p className="text-xs text-red-950">
                            1. Klicke auf der betroffenen Karte auf den Button <strong>„Hilfe“</strong>.<br />
                            2. Beschreibe in 1–2 Sätzen, woran es hakt.<br />
                            3. Die Karte wird rot markiert und eure Lehrkraft sieht das Signal sofort im Cockpit.<br />
                            4. Klicke auf <strong>„Coach“</strong>, um direkte Leitfragen zur Selbsthilfe vom KI-Coach zu erhalten.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'export' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          6. Reflexionstagebuch, EduPage & PDF-Druck
                        </h3>
                        <p>
                          Gute Projektarbeit lebt von regelmäßiger Reflexion:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li><strong>Projekt-Tagebuch:</strong> Haltet am Ende jeder Stunde fest: Was lief heute gut? Was war schwierig? Was ist das Ziel für das nächste Mal? Klickt auf <em>KI-Impulse</em> für Denkanstöße.</li>
                          <li><strong>EduPage Statusbericht:</strong> Klickt im Header auf <em>„Bericht“</em>. Ihr erhaltet einen formatierten Text, den ihr per Klick kopieren und bei EduPage als Hausaufgabe oder Nachricht an die Lehrkraft einfügen könnt.</li>
                          <li><strong>PDF-Druck / Nachweis:</strong> Klickt auf <em>„PDF“</em>, um euer gesamtes Board als druckbare A4-Übersicht für euren Hefter oder die Prüfungsakte zu exportieren.</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* LEHRER INHALTE */}
                {role === 'teacher' && (
                  <>
                    {activeHandbookSection === 'cockpit_login' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          1. PIN-Login & Lehrer-Cockpit
                        </h3>
                        <p>
                          Als Lehrkraft der Regelschule Heimbürgeschule Kahla melden Sie sich über den Button <strong>„Lehrkraft“</strong> im Header mit Ihrer <strong>4-stelligen PIN</strong> an.
                        </p>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                          <strong className="text-amber-900 font-bold block">Vorteile des Cockpits:</strong>
                          <p className="text-xs text-amber-950">
                            • Direkter Zugriff auf alle Gruppen, bei denen Sie als Betreuer hinterlegt sind.<br />
                            • Schneller Klassenfilter (z. B. alle Arbeiten der 10a oder 8b).<br />
                            • Übersicht über Meilensteine, offene Aufgaben und aktive Blocker auf einen Blick.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'monitoring' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          2. Live-Monitoring & Blocker-Alarm
                        </h3>
                        <p>
                          Im Cockpit sehen Sie sofort, welche Gruppen im Zeitplan sind und wo Unterstützung benötigt wird:
                        </p>
                        <ul className="space-y-2 text-xs">
                          <li className="bg-red-50 p-2 rounded-lg border border-red-200">
                            <strong className="text-red-700">Rote Karten (Blocker):</strong> Zeigt Gruppen mit Hilferuf ganz oben an. Sie sehen den genauen Wortlaut des Problems und können direkt eine kurze Rückmeldung senden (z. B. „Kommt kurz an den Lehrertisch“).
                          </li>
                          <li className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <strong className="text-gray-800">Board direkt öffnen:</strong> Klicken Sie auf eine Gruppe, um deren Board in der Schüleransicht zu inspizieren oder Aufgaben gemeinsam zu besprechen.
                          </li>
                        </ul>
                      </div>
                    )}

                    {activeHandbookSection === 'custom_timeline' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          3. Eigene Timelines & Meilensteine erstellen
                        </h3>
                        <p>
                          Nicht jedes Projekt folgt dem 6-Etappen-Plan der 10. Klasse. Für Fachunterricht (WTR, Biologie, Geografie, Kunst) können Sie individuelle Meilensteine definieren:
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                          <p>1. Öffnen Sie das Projekt und klicken Sie in der Timeline auf <strong>„Timeline anpassen“</strong>.</p>
                          <p>2. Fügen Sie neue Meilensteine mit eigenem Titel, Fälligkeitsdatum und Beschreibung hinzu.</p>
                          <p>3. Über die Presets können Sie jederzeit zur offiziellen Klasse-10-Timeline oder Standard-Fachunterricht-Timeline zurückkehren.</p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'consultations' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          4. Pflicht-Konsultationen digital protokollieren
                        </h3>
                        <p>
                          Für die Projektprüfung in Thüringen sind Konsultationsprotokolle vorgeschrieben. Der Projektkompass digitalisiert diesen Ablauf:
                        </p>
                        <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 space-y-1.5 text-xs text-gray-800">
                          <p>• Klicken Sie im Cockpit bei der jeweiligen Gruppe auf <strong>„Konsultation“</strong>.</p>
                          <p>• Tragen Sie Datum, anwesende Schüler, besprochene Schwerpunkte und verbindliche nächste Schritte ein.</p>
                          <p>• Das Protokoll wird revisionssicher im Projekt gespeichert und kann für die Prüfungsakte ausgedruckt werden.</p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'ai_grading' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          5. KI-Arbeitsprozess-Bericht zur Notengebung
                        </h3>
                        <p>
                          Die Beurteilung des Arbeitsprozesses (Selbstorganisation, Teamfähigkeit, Kontinuität) ist oft zeitaufwendig.
                        </p>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-950">
                          <p>• Klicken Sie im Cockpit auf <strong>„KI-Bericht“</strong> (Sparkles-Icon).</p>
                          <p>• Gemini wertet die Erledigungsquote, die Tagebucheinträge und die Blocker-Bewältigung aus.</p>
                          <p>• Sie erhalten eine fundierte, pädagogische Formulierungshilfe mit Stärken und Impulsen für das Bewertungsgespräch.</p>
                        </div>
                      </div>
                    )}

                    {activeHandbookSection === 'api_security' && (
                      <div className="space-y-3">
                        <h3 className="text-base font-black text-gray-900">
                          6. Zentraler Gemini API-Key & Admin-Schutz
                        </h3>
                        <p>
                          Um die KI-Funktionen für alle Schüler und Kollegen zugänglich zu machen, ohne dass Schüler eigene Schlüssel anlegen müssen, gibt es den zentralen Schul-Key.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                          <strong className="font-bold block flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" /> Exklusiver Schutz:
                          </strong>
                          <p>
                            Der zentrale Schlüssel ist durch PIN-Schutz gesichert. Nur <strong>Herr Könitzer T.</strong> bzw. der Administrator kann den Schlüssel in den Einstellungen einsehen, ändern oder die Verbindung testen.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 hidden sm:block">
            Tipp: Du kannst diesen Guide jederzeit über den Menüpunkt <strong>„Guide“</strong> im Header erneut öffnen.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-gray-800 font-bold rounded-xl text-xs sm:text-sm transition-colors ml-auto"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
