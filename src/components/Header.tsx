import React, { useRef } from 'react';
import { ProjectBoard, ProjectType } from '../types/project';
import { useAuth } from '../context/AuthContext';
import { getAllTeachers } from '../data/teachers';
import { ClassroomTimer } from './ClassroomTimer';
import {
  Upload,
  Download,
  Printer,
  Share2,
  GraduationCap,
  Settings,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Users,
  LogOut,
  ChevronDown,
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

  return (
    <header className="bg-white shadow-sm py-2.5 px-4 md:px-6 flex flex-col xl:flex-row justify-between items-center gap-3 border-b-4 border-[#0B7BA7] sticky top-0 z-30">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={onImportFile}
      />

      {/* Left: Logo, Title & Type */}
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <img
          src="/Siegel_bunt.png"
          alt="Heimbürgeschule Kahla"
          className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-full border-2 border-[#0B7BA7] p-0.5 bg-white shadow-sm shrink-0"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black text-[#0B7BA7] tracking-tight m-0">
              Projektkompass
            </h1>
            {/* Project Type Selector */}
            <select
              value={board.projectType || 'regular'}
              onChange={(e) => onUpdateMeta('projectType', e.target.value as ProjectType)}
              className="text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 bg-sky-50 text-[#0B7BA7] rounded-lg border border-sky-300 focus:outline-none cursor-pointer"
            >
              <option value="grad10">🎓 Jg. 10 Abschlussarbeit</option>
              <option value="regular">📚 Fachunterricht</option>
            </select>
          </div>
          <p className="text-[11px] font-semibold text-[#F39200] m-0">
            Regelschule »Heimbürgeschule« Kahla
          </p>
        </div>

        {/* Board Code Badge */}
        {board.boardCode && (
          <button
            onClick={handleCopyCode}
            title="Projekt-Code kopieren"
            className="ml-auto xl:ml-3 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#0B7BA7] border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            <span>Code: {board.boardCode}</span>
            {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
          </button>
        )}
      </div>

      {/* Middle: Project Metadata */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full xl:w-auto items-center">
        {/* Project Title */}
        <input
          type="text"
          value={board.projectName}
          onChange={(e) => onUpdateMeta('projectName', e.target.value)}
          placeholder="Projekttitel..."
          className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#0B7BA7] flex-1 sm:w-44 lg:w-52 bg-slate-50/50"
        />

        {/* Group Name & Members Button */}
        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={board.studentName}
            onChange={(e) => onUpdateMeta('studentName', e.target.value)}
            placeholder="Gruppe (z.B. Gruppe 1)"
            className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm focus:outline-none focus:border-[#0B7BA7] w-28 sm:w-36 bg-slate-50/50"
          />
          <button
            type="button"
            onClick={onOpenMembersModal}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border transition-colors ${
              board.groupMembers && board.groupMembers.length > 0
                ? 'bg-sky-50 text-[#0B7BA7] border-sky-200 hover:bg-sky-100'
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
          value={board.studentClass}
          onChange={(e) => onUpdateMeta('studentClass', e.target.value)}
          placeholder="Klasse"
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B7BA7] w-16 bg-slate-50/50 text-center"
        />

        {/* Teacher Selection Dropdown (HBS Teacher List!) */}
        <select
          value={board.teacherId || ''}
          onChange={(e) => handleTeacherSelect(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B7BA7] bg-slate-50/50 max-w-[150px]"
        >
          <option value="">Lehrkraft wählen...</option>
          {teachers.map((tch) => (
            <option key={tch.id} value={tch.id}>
              {tch.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Right Toolbar */}
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
        {/* Classroom Timer */}
        <ClassroomTimer />

        {/* Online / Offline Sync Indicator */}
        <div
          title={isOnline ? (offlineQueueCount > 0 ? `${offlineQueueCount} Änderungen in Warteschlange` : 'Online & synchronisiert') : 'Offline'}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border ${
            isOnline
              ? offlineQueueCount > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">
            {isOnline ? (offlineQueueCount > 0 ? `Sync (${offlineQueueCount})` : 'Live') : 'Offline'}
          </span>
        </div>

        {/* Import & Export */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
          title="Projekt laden"
        >
          <Upload className="w-3.5 h-3.5 text-[#0B7BA7]" />
          <span className="hidden lg:inline">Laden</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 shadow-sm transition-colors"
          title="Projekt speichern"
        >
          <Download className="w-3.5 h-3.5 text-[#0B7BA7]" />
          <span className="hidden lg:inline">Speichern</span>
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
          className="flex items-center gap-1 bg-[#0B7BA7] hover:bg-[#00558F] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
          title="Statusbericht für EduPage"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Bericht</span>
        </button>

        {/* Teacher Cockpit / Login */}
        {role === 'teacher' && currentTeacher ? (
          <div className="flex items-center gap-1 bg-amber-100/80 border border-amber-300 rounded-lg px-2 py-0.5">
            <button
              onClick={onOpenTeacherDashboard}
              className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
              title="Lehrer-Cockpit öffnen"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#F39200]" />
              <span>{currentTeacher.displayName}</span>
            </button>
            <button
              onClick={logout}
              className="p-1 text-amber-800 hover:text-red-600 rounded ml-1"
              title="Abmelden"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenTeacherDashboard}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors"
            title="Lehrer-Login mit PIN"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#F39200]" />
            <span>Lehrkraft</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors"
          title="Einstellungen"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
