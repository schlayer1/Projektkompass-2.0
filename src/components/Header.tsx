import React, { useRef } from 'react';
import { ProjectBoard, ProjectType } from '../types/project';
import { useAuth } from '../context/AuthContext';
import { getAllTeachers } from '../data/teachers';
import { SCHOOL_CLASSES } from '../data/schoolClasses';
import { ClassroomTimer } from './ClassroomTimer';
import { SystemStatusBadge } from './SystemStatusBadge';
import {
  Upload,
  Download,
  Printer,
  Share2,
  GraduationCap,
  Settings,
  Copy,
  Check,
  Users,
  LogOut,
  ChevronDown,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  board: ProjectBoard;
  onUpdateMeta: (field: keyof ProjectBoard, value: any) => void;
  onExport: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  onOpenReport: () => void;
  onOpenTeacherDashboard: () => void;
  onOpenSettings: () => void;
  onOpenMembersModal: () => void;
  onOpenGuide: (role?: 'student' | 'teacher') => void;
  onOpenWelcomePortal: () => void;
  isOnline: boolean;
  offlineQueueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  onUpdateMeta,
  onExport,
  onImportFile,
  onPrint,
  onOpenReport,
  onOpenTeacherDashboard,
  onOpenSettings,
  onOpenMembersModal,
  onOpenGuide,
  onOpenWelcomePortal,
  isOnline,
  offlineQueueCount,
}) => {
  const { role, currentTeacher, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const teachers = getAllTeachers();

  const handleCopyCode = () => {
    if (!board.boardCode) return;
    navigator.clipboard.writeText(board.boardCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTeacherSelect = (teacherId: string) => {
    const t = teachers.find((tch) => tch.id === teacherId);
    if (t) {
      onUpdateMeta('teacherId', t.id);
      onUpdateMeta('teacherName', t.displayName);
    } else {
      onUpdateMeta('teacherId', '');
      onUpdateMeta('teacherName', '');
    }
  };

  const handleLogout = () => {
    logout();
    onOpenWelcomePortal();
  };

  return (
    <header className="bg-white shadow-md border-b-4 border-[#0B7BA7] sticky top-0 z-30 transition-shadow">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={onImportFile}
      />

      {/* Lehrer-Modus Status- & Schnellzugriffsleiste (wenn als Lehrkraft eingeloggt) */}
      {role === 'teacher' && currentTeacher && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 px-2.5 sm:px-6 py-1 sm:py-1.5 flex items-center justify-between gap-2 border-b border-amber-600/40 shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 bg-amber-950/20 text-amber-950 text-xs font-black p-1 rounded-md shrink-0 sm:hidden" title="Lehrer-Modus">
              <GraduationCap className="w-3.5 h-3.5 text-amber-950" />
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-950/15 text-amber-950 text-xs font-black px-2 py-0.5 rounded-md shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-amber-900" />
              <span>Lehrer-Modus</span>
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 truncate">
              {currentTeacher.displayName}
            </span>
            <span className="text-[11px] text-amber-900/80 font-medium truncate hidden lg:inline">
              — Du prüfst Projekt »{board.projectName || board.boardCode || 'Unbenannt'}« ({board.studentClass ? `Kl. ${board.studentClass}` : 'Klasse ?'}{board.studentName ? `, ${board.studentName}` : ''})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenTeacherDashboard}
              className="flex items-center gap-1 sm:gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Zurück zum Lehrer-Dashboard mit allen Projekten"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Zurück zum Lehrerdashboard</span>
              <span className="sm:hidden font-extrabold">Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-1 sm:px-2.5 sm:py-1 flex items-center gap-1 bg-amber-950/15 hover:bg-amber-950/25 text-amber-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-900" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Brand, Mode, Timer & Global Actions */}
      <div className="px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-4 border-b border-slate-100">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
          <img
            src="/Siegel_bunt.png"
            alt="Heimbürgeschule Kahla"
            className="w-7 h-7 sm:w-10 sm:h-10 object-contain rounded-full border-2 border-[#0B7BA7] p-0.5 bg-white shadow-sm shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-lg md:text-xl font-black text-[#0B7BA7] tracking-tight m-0 leading-tight whitespace-nowrap">
                Projektkompass
              </h1>
              {/* Project Type Selector (Desktop/Tablet) */}
              <select
                value={board.projectType || 'regular'}
                onChange={(e) => onUpdateMeta('projectType', e.target.value as ProjectType)}
                className="hidden sm:inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 bg-sky-50 text-[#0B7BA7] rounded-lg border border-sky-300 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="grad10">Jg. 10 Abschlussarbeit</option>
                <option value="regular">Fachunterricht</option>
              </select>
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[#F39200] m-0 truncate hidden sm:block">
              Regelschule »Heimbürgeschule« Kahla
            </p>
          </div>

          {/* Board Code Badge (Desktop lg+) */}
          {board.boardCode && (
            <button
              onClick={handleCopyCode}
              title="Projekt-Code kopieren"
              className="hidden lg:flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0"
            >
              <span>Code: {board.boardCode}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
            </button>
          )}
        </div>

        {/* Global Tools & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Classroom Timer */}
          <ClassroomTimer />

          {/* Global Cloud & KI Status Indicator */}
          <SystemStatusBadge
            isOnline={isOnline}
            offlineQueueCount={offlineQueueCount}
            variant="header"
          />

          {/* Action Buttons (Desktop xl / lg) */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
              title="Projekt laden (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-[#0B7BA7]" />
              <span className="hidden xl:inline">Laden</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
              title="Projekt speichern (.json)"
            >
              <Download className="w-3.5 h-3.5 text-[#0B7BA7]" />
              <span className="hidden xl:inline">Speichern</span>
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
              title="Drucken / PDF-Nachweis"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 bg-[#0B7BA7] hover:bg-[#096285] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
              title="Projekt-Übersicht & Statistik"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Bericht</span>
            </button>
          </div>

          {/* Teacher Cockpit (on desktop, or for non-logged in teacher login) */}
          {role === 'teacher' && currentTeacher ? (
            <div className="hidden md:flex items-center gap-1 bg-amber-100/90 border border-amber-300 rounded-lg p-0.5 px-2 shadow-2xs">
              <button
                onClick={onOpenTeacherDashboard}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200/70 px-1.5 py-1 rounded-md transition-colors"
                title="Zurück zum Lehrer-Dashboard / Alle Projekte anzeigen"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                <GraduationCap className="w-3.5 h-3.5 text-[#F39200] shrink-0" />
                <span className="font-extrabold">Dashboard</span>
              </button>
              <div className="h-4 w-px bg-amber-300" />
              <button
                onClick={handleLogout}
                className="p-1 text-amber-800 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenTeacherDashboard}
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors shrink-0"
              title="Lehrer-Login mit PIN"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#F39200]" />
              <span className="hidden lg:inline">Lehrkraft</span>
            </button>
          )}

          {/* Guide / Handbuch Button */}
          <button
            onClick={() => onOpenGuide(role === 'teacher' ? 'teacher' : 'student')}
            className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
            title="Handbuch & Onboarding öffnen"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0B7BA7]" />
            <span className="hidden lg:inline">Guide</span>
          </button>

          {/* Projekt wechseln / Startmenü (für Schüler immer, für Lehrer nur Desktop/Tablet als Fallback) */}
          {(role !== 'teacher' || !currentTeacher) && (
            <button
              onClick={onOpenWelcomePortal}
              className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
              title="Startmenü öffnen / Projekt wechseln"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Projekt wechseln</span>
            </button>
          )}

          {role === 'teacher' && currentTeacher && (
            <button
              onClick={onOpenTeacherDashboard}
              className="hidden md:flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
              title="Zurück zum Lehrer-Dashboard / Alle Projekte"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">Zurück zur Übersicht</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors shrink-0"
            title="Einstellungen"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Project Metadata Bar */}
      <div className="bg-slate-50/80 px-2.5 sm:px-6 py-1.5 flex flex-wrap md:flex-nowrap items-center gap-2 border-t border-slate-100">
        {/* Mobile-only Project Type & Code Switcher Strip */}
        <div className="w-full sm:hidden flex items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Modus:</span>
            <select
              value={board.projectType || 'regular'}
              onChange={(e) => onUpdateMeta('projectType', e.target.value as ProjectType)}
              className="text-[11px] font-extrabold uppercase tracking-wide px-2 py-1 bg-white text-[#0B7BA7] rounded-lg border border-sky-300 focus:outline-none cursor-pointer flex-1 truncate"
            >
              <option value="grad10">Jg. 10 Abschluss</option>
              <option value="regular">Fachunterricht</option>
            </select>
          </div>

          {/* Mobile Code Badge */}
          {board.boardCode && (
            <button
              onClick={handleCopyCode}
              title="Projekt-Code kopieren"
              className="flex items-center gap-1 bg-sky-50 text-[#0B7BA7] border border-sky-200 text-[10px] font-bold px-2 py-1 rounded-md shrink-0 shadow-2xs"
            >
              <span>{board.boardCode}</span>
              {copiedCode ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 opacity-60" />}
            </button>
          )}
        </div>

        {/* Project Title */}
        <input
          type="text"
          value={board.projectName}
          onChange={(e) => onUpdateMeta('projectName', e.target.value)}
          placeholder="Projekttitel..."
          className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:border-[#0B7BA7] w-full md:w-auto md:flex-1 md:min-w-[180px] bg-white shadow-2xs"
        />

        {/* Group Name & Members Button & Class */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex gap-1 items-center flex-1 sm:flex-initial">
            <input
              type="text"
              value={board.studentName}
              onChange={(e) => onUpdateMeta('studentName', e.target.value)}
              placeholder="Gruppe"
              className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm focus:outline-none focus:border-[#0B7BA7] w-full sm:w-32 bg-white shadow-2xs font-medium"
            />
            <button
              type="button"
              onClick={onOpenMembersModal}
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border transition-colors shadow-2xs shrink-0 ${
                board.groupMembers && board.groupMembers.length > 0
                  ? 'bg-sky-50 text-[#0B7BA7] border-sky-300 hover:bg-sky-100'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
              title="Gruppenmitglieder verwalten"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{board.groupMembers?.length || 0}</span>
            </button>
          </div>

          {/* Class */}
          <input
            type="text"
            list="hbs-classes-list"
            value={board.studentClass}
            onChange={(e) => onUpdateMeta('studentClass', e.target.value)}
            placeholder="Klasse"
            className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B7BA7] w-14 sm:w-16 bg-white text-center shrink-0 shadow-2xs"
          />
          <datalist id="hbs-classes-list">
            {SCHOOL_CLASSES.map((cls) => (
              <option key={cls} value={cls} />
            ))}
          </datalist>
        </div>

        {/* Teacher Selection Dropdown (HBS Teacher List!) */}
        <select
          value={board.teacherId || ''}
          onChange={(e) => handleTeacherSelect(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B7BA7] bg-white w-full sm:w-auto sm:max-w-[160px] shadow-2xs"
        >
          <option value="">Lehrkraft wählen...</option>
          {teachers.map((tch) => (
            <option key={tch.id} value={tch.id}>
              {tch.displayName}
            </option>
          ))}
        </select>

        {/* Tablet Code Badge (< lg) */}
        {board.boardCode && (
          <button
            type="button"
            onClick={handleCopyCode}
            title="Projekt-Code kopieren"
            className="hidden sm:flex lg:hidden items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <span>Code: {board.boardCode}</span>
            {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
          </button>
        )}

        {/* Quick Action Buttons (shown on mobile & tablet) */}
        <div className="flex lg:hidden items-center justify-between w-full pt-1.5 border-t border-slate-200/60 mt-0.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold shadow-2xs"
              title="Projekt laden"
            >
              <Upload className="w-3 h-3 text-[#0B7BA7]" />
              <span>Laden</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold shadow-2xs"
              title="Projekt speichern"
            >
              <Download className="w-3 h-3 text-[#0B7BA7]" />
              <span>Speichern</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrint}
              className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold shadow-2xs"
              title="PDF"
            >
              <Printer className="w-3 h-3" />
              <span>PDF</span>
            </button>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#0B7BA7] hover:bg-[#00558F] text-white rounded-lg text-[11px] font-bold shadow-2xs"
              title="EduPage Statusbericht"
            >
              <Share2 className="w-3 h-3" />
              <span>Bericht</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
