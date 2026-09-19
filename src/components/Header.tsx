import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronUp,
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
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem('pk_header_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pk_header_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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

      {/* Row 1: Top Bar (Always anchored, smoothly transitions elements) */}
      <div className="px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-4 border-b border-slate-100">
        {/* Left Side: Brand & (Compact meta OR Project Type) */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-1.5 text-left group cursor-pointer shrink-0"
            title={isCollapsed ? 'Header ausklappen' : 'Klicken für Header-Optionen'}
          >
            <img
              src="/Siegel_bunt.png"
              alt="Heimbürgeschule Kahla"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full border border-[#0B7BA7] p-0.5 bg-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base md:text-lg font-black text-[#0B7BA7] tracking-tight m-0 leading-tight whitespace-nowrap group-hover:text-[#00558F] transition-colors">
                  Projektkompass
                </h1>
              </div>
              <p className="text-[10px] font-semibold text-[#F39200] m-0 truncate hidden sm:block">
                Regelschule Kahla
              </p>
            </div>
          </button>

          {/* Left Context: Morph between Collapsed Meta vs Expanded Mode Selector */}
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="collapsed-meta"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs font-bold text-gray-800 truncate max-w-[120px] sm:max-w-[240px] md:max-w-[360px]">
                  {board.projectName || 'Unbenanntes Projekt'}
                </span>
                {board.studentName && (
                  <span className="text-[11px] text-gray-500 font-medium truncate max-w-[100px] hidden md:inline">
                    ({board.studentName})
                  </span>
                )}
                {board.studentClass && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 shrink-0 hidden sm:inline">
                    Kl. {board.studentClass}
                  </span>
                )}
                {board.boardCode && (
                  <button
                    onClick={handleCopyCode}
                    title="Code kopieren"
                    className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-50 text-[#0B7BA7] hover:bg-sky-100 rounded border border-sky-200 shrink-0 hidden lg:inline-flex items-center gap-1"
                  >
                    <span>{board.boardCode}</span>
                    {copiedCode ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                  </button>
                )}
                {role === 'teacher' && currentTeacher && (
                  <div className="hidden sm:flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 shrink-0">
                    <GraduationCap className="w-3 h-3 text-[#F39200] shrink-0" />
                    <button
                      onClick={onOpenTeacherDashboard}
                      className="text-[10px] font-extrabold text-amber-950 hover:text-amber-800 transition-colors"
                      title="Zurück zum Lehrer-Dashboard"
                    >
                      Dashboard
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="expanded-meta"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <select
                  value={board.projectType || 'regular'}
                  onChange={(e) => onUpdateMeta('projectType', e.target.value as ProjectType)}
                  className="hidden sm:inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 bg-sky-50 text-[#0B7BA7] rounded-lg border border-sky-300 focus:outline-none cursor-pointer shrink-0"
                >
                  <option value="grad10">Jg. 10 Abschlussarbeit</option>
                  <option value="regular">Fachunterricht</option>
                </select>

                {board.boardCode && (
                  <button
                    onClick={handleCopyCode}
                    title="Projekt-Code kopieren"
                    className="hidden 2xl:flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    <span>Code: {board.boardCode}</span>
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Timer & Status (Permanent) + (Action Buttons OR Expand Button) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ClassroomTimer />
          <SystemStatusBadge
            isOnline={isOnline}
            offlineQueueCount={offlineQueueCount}
            variant="header"
          />

          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.button
                key="expand-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={toggleCollapsed}
                className="flex items-center gap-1 bg-[#0B7BA7] hover:bg-[#00558F] text-white px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                title="Header vollständig ausklappen"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Header einblenden</span>
                <span className="sm:hidden">Menü</span>
              </motion.button>
            ) : (
              <motion.div
                key="expanded-actions"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 sm:gap-1.5 shrink-0"
              >
                {/* Desktop Action Buttons: Laden, Speichern, PDF, Bericht */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
                    title="Projekt laden (.json)"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#0B7BA7]" />
                    <span className="hidden 2xl:inline">Laden</span>
                  </button>

                  <button
                    onClick={onExport}
                    className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
                    title="Projekt speichern (.json)"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0B7BA7]" />
                    <span className="hidden 2xl:inline">Speichern</span>
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

                {/* Teacher Cockpit button */}
                {role === 'teacher' && currentTeacher ? (
                  <div className="hidden md:flex items-center gap-1 bg-amber-100/90 border border-amber-300 rounded-lg p-0.5 px-2 shadow-2xs">
                    <button
                      onClick={onOpenTeacherDashboard}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200/70 px-1.5 py-1 rounded-md transition-colors"
                      title="Zurück zum Lehrer-Dashboard"
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
                    <span className="hidden xl:inline">Lehrkraft</span>
                  </button>
                )}

                {/* Guide Button */}
                <button
                  onClick={() => onOpenGuide(role === 'teacher' ? 'teacher' : 'student')}
                  className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
                  title="Handbuch & Onboarding öffnen"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#0B7BA7]" />
                  <span className="hidden xl:inline">Guide</span>
                </button>

                {/* Switch Project */}
                {(role !== 'teacher' || !currentTeacher) && (
                  <button
                    onClick={onOpenWelcomePortal}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
                    title="Startmenü öffnen / Projekt wechseln"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden 2xl:inline">Projekt wechseln</span>
                  </button>
                )}

                {role === 'teacher' && currentTeacher && (
                  <button
                    onClick={onOpenTeacherDashboard}
                    className="hidden md:flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0"
                    title="Zurück zum Lehrer-Dashboard / Alle Projekte"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden 2xl:inline">Zurück zur Übersicht</span>
                  </button>
                )}

                {/* Settings Button */}
                <button
                  onClick={onOpenSettings}
                  className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors shrink-0"
                  title="Einstellungen"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                {/* Collapse Button */}
                <button
                  onClick={toggleCollapsed}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 border border-slate-200 cursor-pointer"
                  title="Header einklappen für maximale Arbeitsfläche"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden 2xl:inline">Einklappen</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapsible Lower Section (Animates smoothly with height & opacity) */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="collapsible-tray"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="overflow-hidden"
          >
            {/* Lehrer-Modus Schnellzugriffsleiste */}
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
                    <span>{board.groupMembers ? board.groupMembers.length : 0}</span>
                  </button>
                </div>

                <select
                  value={board.studentClass || ''}
                  onChange={(e) => onUpdateMeta('studentClass', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-[#0B7BA7] bg-white shadow-2xs font-semibold text-gray-700 w-24 sm:w-20"
                >
                  <option value="">Klasse</option>
                  {SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selector */}
              <select
                value={board.teacherId || ''}
                onChange={(e) => handleTeacherSelect(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-[#0B7BA7] bg-white shadow-2xs text-gray-700 w-full sm:w-44 font-medium"
              >
                <option value="">Betreuende Lehrkraft...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.displayName}
                  </option>
                ))}
              </select>

              {/* Mobile Quick Action Buttons */}
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

            {/* Bottom Center Collapse Handle */}
            <div className="flex justify-center py-1 bg-slate-50/60 border-t border-slate-100">
              <button
                onClick={toggleCollapsed}
                className="flex items-center gap-1 bg-white hover:bg-sky-50 text-slate-500 hover:text-[#0B7BA7] text-[10px] font-bold px-3 py-0.5 rounded-full border border-slate-200 hover:border-sky-300 shadow-2xs transition-colors cursor-pointer"
                title="Header einklappen (maximale Arbeitsfläche)"
              >
                <ChevronUp className="w-3 h-3" />
                <span>Header einklappen</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
