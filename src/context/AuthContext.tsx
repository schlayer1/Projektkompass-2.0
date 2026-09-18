import React, { createContext, useContext, useEffect, useState } from 'react';
import { Teacher, getTeacherByPin, MASTER_ADMIN_PIN } from '../data/teachers';

export type UserRole = 'student' | 'teacher' | null;

interface AuthContextType {
  role: UserRole;
  currentBoardCode: string;
  currentTeacher: Teacher | null;
  isLoading: boolean;
  loginAsStudent: (boardCode: string) => Promise<void>;
  loginWithPin: (pin: string) => Promise<Teacher>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_ROLE_KEY = 'pk_auth_role_v2';
const AUTH_CODE_KEY = 'pk_auth_board_code_v2';
const AUTH_TEACHER_KEY = 'pk_auth_teacher_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [currentBoardCode, setCurrentBoardCode] = useState<string>('');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(AUTH_ROLE_KEY) as UserRole;
      const savedCode = localStorage.getItem(AUTH_CODE_KEY) || '';
      const savedTeacherRaw = localStorage.getItem(AUTH_TEACHER_KEY);

      if (savedRole === 'teacher' && savedTeacherRaw) {
        const parsed = JSON.parse(savedTeacherRaw);
        setRole('teacher');
        setCurrentTeacher(parsed);
      } else if (savedRole === 'student' && savedCode) {
        setRole('student');
        setCurrentBoardCode(savedCode);
      }
    } catch (e) {
      console.error('Fehler beim Wiederherstellen der Session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsStudent = async (boardCode: string) => {
    const clean = (boardCode || '').trim().toUpperCase();
    if (!clean) throw new Error('Bitte gib einen gültigen Projekt-Code ein.');
    setRole('student');
    setCurrentBoardCode(clean);
    setCurrentTeacher(null);
    localStorage.setItem(AUTH_ROLE_KEY, 'student');
    localStorage.setItem(AUTH_CODE_KEY, clean);
    localStorage.removeItem(AUTH_TEACHER_KEY);
  };

  const loginWithPin = async (pin: string): Promise<Teacher> => {
    const clean = (pin || '').trim();
    if (!clean) throw new Error('Bitte gib deinen 4-stelligen PIN ein.');

    // Master Admin PIN Fallback
    if (clean === MASTER_ADMIN_PIN || clean === 'Year2003?!%') {
      const adminTeacher: Teacher = {
        id: 't-admin',
        name: 'Administrator',
        displayName: 'Schulleitung / Admin',
        pin: clean,
        role: 'admin',
      };
      setRole('teacher');
      setCurrentTeacher(adminTeacher);
      localStorage.setItem(AUTH_ROLE_KEY, 'teacher');
      localStorage.setItem(AUTH_TEACHER_KEY, JSON.stringify(adminTeacher));
      return adminTeacher;
    }

    const teacher = getTeacherByPin(clean);
    if (!teacher) {
      throw new Error('Ungültiger PIN. Bitte prüfe deinen 4-stelligen HBS-Code.');
    }

    setRole('teacher');
    setCurrentTeacher(teacher);
    localStorage.setItem(AUTH_ROLE_KEY, 'teacher');
    localStorage.setItem(AUTH_TEACHER_KEY, JSON.stringify(teacher));
    return teacher;
  };

  const logout = () => {
    setRole(null);
    setCurrentBoardCode('');
    setCurrentTeacher(null);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_CODE_KEY);
    localStorage.removeItem(AUTH_TEACHER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentBoardCode,
        currentTeacher,
        isLoading,
        loginAsStudent,
        loginWithPin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
