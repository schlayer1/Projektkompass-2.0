import React, { useState } from 'react';
import { Task, TaskTag, TaskPriority } from '../types/project';
import {
  User,
  Calendar,
  AlertOctagon,
  LifeBuoy,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Plus,
  Award,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleChecklist: (taskId: string, index: number) => void;
  onToggleHelp: (taskId: string) => void;
  onOpenCoach: (task: Task) => void;
  onOpenPresentationCoach?: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const TAG_CONFIG: Record<TaskTag, { label: string; bg: string; text: string; border: string }> = {
  recherche: { label: '🔍 Recherche', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  material: { label: '✂️ Material', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  text: { label: '✍️ Text', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  layout: { label: '🎨 Layout', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  praesentation: { label: '🗣️ Präsentation', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  medien: { label: '💻 Technik', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  kontrolle: { label: '🔄 Kontrolle', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  none: { label: '', bg: '', text: '', border: '' },
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Dringend', color: 'bg-red-500' },
  important: { label: 'Wichtig', color: 'bg-amber-500' },
  normal: { label: 'Normal', color: 'bg-slate-300' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleChecklist,
  onToggleHelp,
  onOpenCoach,
  onOpenPresentationCoach,
  onMoveTask,
  onDragStart,
  onDragEnd,
}) => {
  const isDone = task.status === 'done';
  const tagInfo = TAG_CONFIG[task.tag];
  const priority = task.priority || 'normal';

  // Deadline calculation
  let deadlineBadge = null;
  if (task.dueDate) {
    if (isDone) {
      deadlineBadge = (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-100 text-gray-500 border-gray-200">
          <CheckCircle2 className="w-3 h-3" /> Erledigt
        </span>
      );
    } else {
      const todayMs = new Date().setHours(0, 0, 0, 0);
      const dueMs = new Date(task.dueDate).getTime();
      const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        deadlineBadge = (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-rose-100 text-rose-800 border-rose-300 animate-pulse">
            <AlertCircle className="w-3 h-3" /> Überfällig!
          </span>
        );
      } else if (diffDays === 0) {
        deadlineBadge = (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-100 text-amber-800 border-amber-300">
            <Clock className="w-3 h-3" /> Heute fällig
          </span>
        );
      } else if (diffDays <= 3) {
        deadlineBadge = (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3" /> In {diffDays} Tagen
          </span>
        );
      } else {
        deadlineBadge = (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">
            <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString('de-DE')}
          </span>
        );
      }
    }
  }

  // Checklist progress
  const totalChecks = task.checklist.length;
  const doneChecks = task.checklist.filter((c) => c.done).length;
  const progressPercent = totalChecks > 0 ? (doneChecks / totalChecks) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`p-3.5 rounded-xl shadow-sm border transition-all cursor-grab active:cursor-grabbing relative group ${
        isDone ? 'bg-slate-50/80 opacity-75 border-slate-200' : 'bg-white'
      } ${
        task.needsHelp && !isDone
          ? 'border-red-400 bg-red-50/40 ring-2 ring-red-200 shadow-md'
          : 'border-slate-200 hover:border-sky-300 hover:shadow-md'
      }`}
    >
      {/* Header & Actions */}
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          {/* Priority Dot */}
          {priority !== 'normal' && (
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${PRIORITY_BADGES[priority].color}`}
              title={`Priorität: ${PRIORITY_BADGES[priority].label}`}
            />
          )}
          <h4
            className={`font-bold text-sm text-gray-800 leading-snug ${
              isDone ? 'line-through text-gray-400' : ''
            }`}
          >
            {task.title}
          </h4>
        </div>

        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            title="Bearbeiten"
            className="p-1 rounded text-gray-400 hover:text-[#0B7BA7] hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Löschen"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Badges: Tag, Assignee, Deadline */}
      <div className="flex flex-wrap gap-1.5 items-center mb-2">
        {tagInfo.label && (
          <span
            className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded border tracking-wider ${tagInfo.bg} ${tagInfo.text} ${tagInfo.border}`}
          >
            {tagInfo.label}
          </span>
        )}
        {task.assignee && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200">
            <User className="w-2.5 h-2.5 text-gray-400" /> {task.assignee}
          </span>
        )}
        {deadlineBadge}
      </div>

      {/* Description */}
      {task.desc && (
        <p className="text-gray-600 text-xs mb-2.5 whitespace-pre-wrap leading-relaxed">
          {task.desc}
        </p>
      )}

      {/* Blocker Reason Note */}
      {task.needsHelp && task.blockerReason && (
        <div className="mb-2.5 p-2 bg-red-100/70 border border-red-300 rounded-lg text-xs text-red-900 flex items-start gap-1.5">
          <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong>Problem:</strong> {task.blockerReason}
          </div>
        </div>
      )}

      {/* Interactive Inline Checklist */}
      {totalChecks > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1">
            <span>Teilschritte</span>
            <span>
              {doneChecks}/{totalChecks} ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
            <div
              className="bg-[#00A896] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-col gap-1">
            {task.checklist.map((item, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-1.5 text-xs p-0.5 rounded cursor-pointer transition-colors ${
                  item.done ? 'text-gray-400' : 'text-gray-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(task.id, idx)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#00A896] focus:ring-[#00A896] cursor-pointer"
                />
                <span className={`leading-tight ${item.done ? 'line-through' : ''}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer: Help/Coach & Movement */}
      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleHelp(task.id)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
              task.needsHelp && !isDone
                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                : 'bg-slate-50 text-gray-600 hover:text-red-600 hover:bg-red-50 border-slate-200'
            }`}
            title={task.needsHelp ? 'Problem als behoben markieren' : 'Hilfe / Blocker signalisieren'}
          >
            {task.needsHelp && !isDone ? (
              <>
                <AlertOctagon className="w-3 h-3" /> Blockiert
              </>
            ) : (
              <>
                <LifeBuoy className="w-3 h-3" /> Hilfe
              </>
            )}
          </button>

          {/* KI Coach Button (when help is active) */}
          {task.needsHelp && !isDone && (
            <button
              onClick={() => onOpenCoach(task)}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-[#0B7BA7] border border-sky-300 transition-colors shadow-sm animate-pulse"
              title="KI-Projektcoach um Rat fragen"
            >
              <Sparkles className="w-3 h-3 text-[#F39200]" /> Coach
            </button>
          )}

          {/* KI Generalproben Button (if presentation tag) */}
          {task.tag === 'praesentation' && onOpenPresentationCoach && (
            <button
              onClick={() => onOpenPresentationCoach(task)}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-sm"
              title="Generalprobe: Mögliche Prüfungsfragen der Lehrkraft üben"
            >
              <Award className="w-3 h-3 text-[#F39200]" /> Probe
            </button>
          )}
        </div>

        {/* Mobile / Tablet Quick Move Arrows */}
        <div className="flex items-center gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={() => onMoveTask(task.id, task.status === 'done' ? 'in_progress' : 'todo')}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 border border-slate-200 transition-colors"
              title="Nach links verschieben"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => onMoveTask(task.id, task.status === 'todo' ? 'in_progress' : 'done')}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 border border-slate-200 transition-colors"
              title="Nach rechts verschieben"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
