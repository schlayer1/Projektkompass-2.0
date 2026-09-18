import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTeachers, getTeacherByPin } from '../data/teachers';
import { GraduationCap, Users, Key, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadByCode: (code: string) => void;
  onTeacherSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoadByCode,
  onTeacherSuccess,
}) => {
  const { loginWithPin } = useAuth();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [pin, setPin] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const detectedTeacher = pin.length === 4 ? getTeacherByPin(pin) : null;

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await loginWithPin(pin);
      onTeacherSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falscher PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) return;
    onLoadByCode(studentCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('teacher');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'teacher'
                  ? 'bg-[#F39200] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Lehrkraft (PIN)
            </button>
            <button
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-[#0B7BA7] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white'
              }`}
            >
              <Users className="w-4 h-4" /> Schüler (Projekt-Code)
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {activeTab === 'teacher' ? (
            <form onSubmit={handleTeacherSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
                  Dein 4-stelliger HBS-Lehrer-PIN
                </label>
                <input
                  type="password"
                  maxLength={15}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="PIN eingeben (wie im Appportal)..."
                  className="w-full p-3 bg-slate-50 border border-gray-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-[#F39200]"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Verwende deinen gewohnten 4-stelligen PIN aus dem HBS-Appportal und der Vertretungsstatistik.
                </p>
              </div>

              {/* Detected Teacher Preview */}
              {detectedTeacher && (
                <div className="text-xs bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#F39200]" />
                  <span>Willkommen, {detectedTeacher.displayName}!</span>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !pin}
                className="w-full py-2.5 bg-[#F39200] hover:bg-[#D97A09] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Ins Lehrer-Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 block">
                  Projekt-Code eingeben
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="z.B. PK-8A-01"
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-[#0B7BA7]"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Den Code hat eure Gruppe beim Anlegen oder Speichern des Boards erhalten.
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B7BA7] hover:bg-[#00558F] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Board laden</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
