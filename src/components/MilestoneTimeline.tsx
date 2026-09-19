import React from 'react';
import { Milestone, ProjectType } from '../types/project';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings2,
  Milestone as MilestoneIcon,
  Sparkles,
  Check,
} from 'lucide-react';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  projectType: ProjectType;
  onToggleMilestone: (id: string) => void;
  onOpenEditor: () => void;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  projectType,
  onToggleMilestone,
  onOpenEditor,
}) => {
  const { role } = useAuth();

  if (!milestones || milestones.length === 0) return null;

  const total = milestones.length;
  const completedCount = milestones.filter((m) => m.completed).length;
  const percent = Math.round((completedCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-5">
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-[#0B7BA7] text-white p-1.5 rounded-lg shadow-sm shrink-0">
            <MilestoneIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-xs sm:text-base text-gray-900 leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate">{projectType === 'grad10' ? 'Prüfungs-Timeline: Jg. 10 Abschlussarbeit' : 'Projekt-Meilensteine'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0B7BA7] border border-sky-200 shrink-0">
                {completedCount}/{total} Etappen ({percent}%)
              </span>
            </h3>
          </div>
        </div>

        {/* Teacher Edit Button */}
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0B7BA7] bg-slate-50 hover:bg-sky-50 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors shrink-0 ml-auto"
          title="Timeline & Termine anpassen"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Timeline </span>anpassen</span>
        </button>
      </div>

      {/* Horizontal Stepper */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="flex items-start gap-2 sm:gap-3 min-w-[680px]">
          {milestones.map((m, idx) => {
            const isCompleted = m.completed;
            const todayMs = new Date().setHours(0, 0, 0, 0);
            const dueMs = m.dueDate ? new Date(m.dueDate).getTime() : 0;
            const isOverdue = dueMs > 0 && dueMs < todayMs && !isCompleted;

            return (
              <div
                key={m.id}
                onClick={() => onToggleMilestone(m.id)}
                className={`flex-1 p-3 rounded-xl border transition-all cursor-pointer select-none group relative ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : isOverdue
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-slate-50/70 border-slate-200 hover:border-sky-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isOverdue
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-gray-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>

                  {m.dueDate && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        isCompleted
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : isOverdue
                          ? 'text-rose-700 bg-rose-100 animate-pulse'
                          : 'text-gray-600 bg-white border border-slate-200'
                      }`}
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(m.dueDate).toLocaleDateString('de-DE')}
                    </span>
                  )}
                </div>

                <div
                  className={`text-xs font-bold line-clamp-2 leading-snug ${
                    isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {m.title}
                </div>

                {m.description && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
