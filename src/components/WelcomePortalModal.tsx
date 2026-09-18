import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTeachers, getTeacherByPin } from '../data/teachers';
import { SCHOOL_CLASSES } from '../data/schoolClasses';
import { fetchTemplates } from '../services/boardService';
import {
  Compass,
  Users,
  GraduationCap,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Layers,
} from 'lucide-react';
import { ProjectType, Milestone, ProjectBoard } from '../types/project';

interface NewProjectPayload {
  projectName: string;
  studentClass: string;
  studentName: string;
  groupMembers: string[];
  teacherId?: string;
  teacherName?: string;
  subject?: string;
  projectType: ProjectType;
  customMilestones?: Milestone[];
}

interface WelcomePortalModalProps {
  isOpen: boolean;
  onLoadByCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  onCreateNewProject: (data: NewProjectPayload) => Promise<void>;
  onRestoreBackup: (file: File) => Promise<{ success: boolean; message?: string }>;
  onTeacherSuccess: () => void;
}

export const WelcomePortalModal: React.FC<WelcomePortalModalProps> = ({
  isOpen,
  onLoadByCode,
  onCreateNewProject,
  onRestoreBackup,
  onTeacherSuccess,
}) => {
  const { loginWithPin } = useAuth();

  // Role: 'student' | 'teacher'
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');

  // Student sub-mode: 'load' | 'create'
  const [studentMode, setStudentMode] = useState<'load' | 'create'>('load');

  // Student: Load Code State
  const [code, setCode] = useState('');
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Student: Backup Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupError, setBackupError] = useState('');

  // Student: Create New Project State
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('10a');
  const [customClass, setCustomClass] = useState('');
  const [newGroupName, setNewGroupName] = useState('Gruppe 1');
  const [newMembersInput, setNewMembersInput] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Class Templates state
  const [classTemplates, setClassTemplates] = useState<ProjectBoard[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('preset_grad10');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Load templates matching the chosen class
  useEffect(() => {
    if (isOpen && studentMode === 'create') {
      const actualClass = newClass === 'custom' ? customClass.trim() || '10a' : newClass;
      setIsLoadingTemplates(true);
      fetchTemplates(actualClass)
        .then((tpls) => {
          setClassTemplates(tpls);
          if (actualClass.startsWith('10')) {
            setSelectedTemplateId('preset_grad10');
          } else if (tpls.length > 0) {
            setSelectedTemplateId(tpls[0].id);
          } else {
            setSelectedTemplateId('preset_regular');
          }
        })
        .catch(() => setClassTemplates([]))
        .finally(() => setIsLoadingTemplates(false));
    }
  }, [isOpen, studentMode, newClass, customClass]);

  const handleSelectTemplateCard = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = classTemplates.find((t) => t.id === tplId);
    if (tpl) {
      if (!newTitle.trim()) {
        setNewTitle(tpl.projectName);
      }
      if (tpl.teacherId) {
        setSelectedTeacherId(tpl.teacherId);
      }
      if (tpl.subject) {
        setNewSubject(tpl.subject);
      }
    }
  };

  // Teacher State
  const [teacherPin, setTeacherPin] = useState('');
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  if (!isOpen) return null;

  const teachers = getAllTeachers();
  const detectedTeacher = teacherPin.length === 4 ? getTeacherByPin(teacherPin) : null;

  // Handle Load Project via Code
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setCodeError('Bitte gib einen Projekt-Code ein.');
      return;
    }

    setCodeError('');
    setIsLoadingCode(true);
    try {
      const res = await onLoadByCode(cleanCode);
      if (!res.success) {
        setCodeError(res.message || `Kein Projekt mit dem Code „${cleanCode}“ gefunden.`);
      }
    } catch {
      setCodeError('Fehler beim Laden aus der Datenbank. Bitte prüfe deine Internetverbindung.');
    } finally {
      setIsLoadingCode(false);
    }
  };

  // Handle Backup File Restore
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupError('');
    setIsRestoringBackup(true);
    try {
      const res = await onRestoreBackup(file);
      if (!res.success) {
        setBackupError(res.message || 'Ungültiges Dateiformat. Bitte wähle eine kompass-*.json Datei.');
      }
    } catch {
      setBackupError('Fehler beim Einlesen der Backup-Datei.');
    } finally {
      setIsRestoringBackup(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Create New Project
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Bitte gib ein Projektthema ein.');
      return;
    }

    const members = newMembersInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const actualClass = newClass === 'custom' ? customClass.trim() || '10a' : newClass;
    const chosenTemplate = classTemplates.find((t) => t.id === selectedTemplateId);
    const teacherObj = teachers.find(
      (t) => t.id === (selectedTeacherId || chosenTemplate?.teacherId)
    );

    setCreateError('');
    setIsCreating(true);
    try {
      await onCreateNewProject({
        projectName: newTitle.trim(),
        studentClass: actualClass,
        studentName: newGroupName.trim() || 'Gruppe 1',
        groupMembers: members,
        teacherId: teacherObj?.id || chosenTemplate?.teacherId,
        teacherName: teacherObj ? teacherObj.displayName : (chosenTemplate?.teacherName || undefined),
        subject: newSubject.trim() || chosenTemplate?.subject || undefined,
        projectType:
          selectedTemplateId === 'preset_grad10'
            ? 'grad10'
            : (chosenTemplate?.projectType || 'regular'),
        customMilestones: chosenTemplate?.milestones,
      });
    } catch (err: any) {
      setCreateError(err.message || 'Fehler beim Anlegen des Projekts.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Teacher PIN Login
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');
    setIsTeacherLoading(true);

    try {
      await loginWithPin(teacherPin);
      onTeacherSuccess();
    } catch (err: any) {
      setTeacherError(err.message || 'Falscher PIN. Bitte überprüfe deine 4 Ziffern.');
    } finally {
      setIsTeacherLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-[#00558F] to-[#0B7BA7] text-white p-6 sm:p-8 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Regelschule »Heimbürgeschule« Kahla
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              PROJEKTKOMPASS 2.0
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-0.5">
              Dein digitaler Leitfaden für Abschlussarbeiten, Projektwochen & Facharbeiten
            </p>
          </div>
        </div>

        {/* Main Role Switcher */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
            Wer arbeitet gerade an diesem Gerät?
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setCodeError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                activeRole === 'student'
                  ? 'bg-[#0B7BA7] text-white shadow-md ring-2 ring-[#0B7BA7]/30 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Schüler / Gruppe</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('teacher');
                setTeacherError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                activeRole === 'teacher'
                  ? 'bg-[#F39200] text-white shadow-md ring-2 ring-[#F39200]/30 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Lehrkraft (PIN)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* STUDENT ROLE */}
          {activeRole === 'student' && (
            <div className="flex flex-col gap-6">
              {/* Student Sub Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStudentMode('load')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    studentMode === 'load'
                      ? 'bg-white text-[#0B7BA7] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Laufendes Projekt laden</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentMode('create')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    studentMode === 'create'
                      ? 'bg-white text-[#0B7BA7] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Neues Projekt anlegen</span>
                </button>
              </div>

              {/* SUB-MODE: LOAD VIA CODE OR BACKUP */}
              {studentMode === 'load' && (
                <div className="flex flex-col gap-6">
                  {/* Load by Code Form */}
                  <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                        Projekt-Code eurer Gruppe eingeben
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value);
                            setCodeError('');
                          }}
                          placeholder="z.B. PK-6GQD"
                          autoFocus
                          className="w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center text-xl font-mono font-black uppercase tracking-widest text-[#0B7BA7] focus:outline-none focus:border-[#0B7BA7] focus:bg-white transition-all shadow-inner"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        💡 Den Code habt ihr beim Anlegen oder Speichern des Projekts erhalten.
                      </p>
                    </div>

                    {codeError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{codeError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoadingCode || !code.trim()}
                      className="w-full py-3.5 px-6 bg-[#0B7BA7] hover:bg-[#00558F] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {isLoadingCode ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Projekt wird geladen...</span>
                        </>
                      ) : (
                        <>
                          <span>Projekt aus Datenbank laden</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Oder Backup wiederherstellen
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Restore Backup File */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRestoringBackup}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      {isRestoringBackup ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#0B7BA7]" />
                          <span>Backup wird verarbeitet...</span>
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-4 h-4 text-[#0B7BA7]" />
                          <span>Gespeicherte Datei (.json) von Computer / USB laden</span>
                        </>
                      )}
                    </button>
                    {backupError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{backupError}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-MODE: CREATE NEW PROJECT */}
              {studentMode === 'create' && (
                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                  {/* Schritt 1: Klasse wählen */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        1. Klasse auswählen *
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Filtert passende Vorlagen & Meilensteine
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                      >
                        {SCHOOL_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Klasse {cls}
                          </option>
                        ))}
                        <option value="custom">Andere Klasse / Kurs...</option>
                      </select>
                      {newClass === 'custom' && (
                        <input
                          type="text"
                          value={customClass}
                          onChange={(e) => setCustomClass(e.target.value)}
                          placeholder="z.B. Kurs 11 oder WTR-Kurs"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Schritt 2: Vorlage & Zeitplan */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        2. Projektvorlage & Zeitplan wählen
                      </label>
                      {isLoadingTemplates && (
                        <span className="flex items-center gap-1.5 text-[11px] text-[#0B7BA7] font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Vorlagen laden...
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {/* Abschlussarbeit Jg. 10 Preset (nur wenn Klasse 10) */}
                      {(newClass.startsWith('10') || (newClass === 'custom' && customClass.startsWith('10'))) && (
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateId('preset_grad10')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                            selectedTemplateId === 'preset_grad10'
                              ? 'border-[#0B7BA7] bg-sky-50/70 ring-2 ring-[#0B7BA7]/20 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0B7BA7] flex items-center justify-center shrink-0 mt-0.5">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-slate-900">
                                  Jg. 10 Abschlussarbeit
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                                  Standard Thüringen
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Die 6 offiziellen Thüringer Prüfungsetappen, Termine & Vorbereitung
                              </p>
                              <div className="text-[10px] font-semibold text-slate-600 mt-1">
                                6 vordefinierte Meilensteine
                              </div>
                            </div>
                          </div>
                          {selectedTemplateId === 'preset_grad10' && (
                            <CheckCircle2 className="w-5 h-5 text-[#0B7BA7] shrink-0 mt-0.5" />
                          )}
                        </button>
                      )}

                      {/* Lehrer-Vorlagen für diese Klasse */}
                      {classTemplates.map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => handleSelectTemplateCard(tpl.id)}
                            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-[#0B7BA7] bg-sky-50/70 ring-2 ring-[#0B7BA7]/20 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                                    {tpl.projectName}
                                  </span>
                                  {tpl.teacherName && (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full">
                                      {tpl.teacherName}
                                    </span>
                                  )}
                                  {tpl.subject && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                                      {tpl.subject}
                                    </span>
                                  )}
                                </div>
                                {tpl.templateDescription && (
                                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                                    {tpl.templateDescription}
                                  </p>
                                )}
                                <div className="text-[10px] font-semibold text-slate-600 mt-1">
                                  {tpl.milestones?.length || 0} Meilensteine vordefiniert
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#0B7BA7] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}

                      {/* Fallback / Freies Projekt */}
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId('preset_regular')}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                          selectedTemplateId === 'preset_regular'
                            ? 'border-[#0B7BA7] bg-sky-50/70 ring-2 ring-[#0B7BA7]/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                Freies Projekt / Eigener Zeitplan
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                                Individuell
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Eigene Meilensteine und Termine nach Bedarf selbst anlegen
                            </p>
                          </div>
                        </div>
                        {selectedTemplateId === 'preset_regular' && (
                          <CheckCircle2 className="w-5 h-5 text-[#0B7BA7] shrink-0 mt-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Schritt 3: Thema & Projektdaten */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                      3. Projektthema / Titel *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setCreateError('');
                      }}
                      placeholder="z.B. Erneuerbare Energien in Thüringen"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B7BA7] focus:bg-white"
                    />
                  </div>

                  {/* Grid: Group Name & Members */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                        Gruppenname (optional)
                      </label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="z.B. Gruppe 1 oder Solarpioniere"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                        Gruppenmitglieder (mit Komma trennen)
                      </label>
                      <input
                        type="text"
                        value={newMembersInput}
                        onChange={(e) => setNewMembersInput(e.target.value)}
                        placeholder="z.B. Anna Schmidt, Lisa Weber"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                      />
                    </div>
                  </div>

                  {/* Grid: Teacher & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                        Betreuende Lehrkraft
                      </label>
                      <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                      >
                        <option value="">Lehrkraft wählen...</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                        Fach / Fachrichtung (optional)
                      </label>
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="z.B. Geografie / Physik"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0B7BA7]"
                      />
                    </div>
                  </div>

                  {/* Empty Board Notice */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Das Projekt startet mit <strong>vollständig leeren Aufgaben-Spalten</strong>. Zeitplan und Meilensteine werden automatisch übernommen!
                    </span>
                  </div>

                  {createError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3.5 px-6 bg-[#0B7BA7] hover:bg-[#00558F] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-1"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Neues Projekt wird angelegt...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Neues Projekt anlegen & Code generieren</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TEACHER ROLE */}
          {activeRole === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                  Dein 4-stelliger HBS-Lehrer-PIN
                </label>
                <input
                  type="password"
                  maxLength={15}
                  value={teacherPin}
                  onChange={(e) => {
                    setTeacherPin(e.target.value);
                    setTeacherError('');
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center text-2xl font-mono font-bold tracking-widest text-[#F39200] focus:outline-none focus:border-[#F39200] focus:bg-white transition-all shadow-inner"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Verwende deinen gewohnten 4-stelligen PIN aus dem HBS-Appportal und der Vertretungsstatistik.
                </p>
              </div>

              {/* Detected Teacher Preview */}
              {detectedTeacher && (
                <div className="text-xs bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-2xl flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#F39200] shrink-0" />
                  <span>Willkommen, {detectedTeacher.displayName}!</span>
                </div>
              )}

              {teacherError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{teacherError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isTeacherLoading || !teacherPin}
                className="w-full py-3.5 px-6 bg-[#F39200] hover:bg-[#D97A09] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {isTeacherLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PIN wird geprüft...</span>
                  </>
                ) : (
                  <>
                    <span>Ins Lehrer-Cockpit einloggen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
