import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/project';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  headerBg: string;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleChecklist: (taskId: string, idx: number) => void;
  onToggleHelp: (taskId: string) => void;
  onOpenCoach: (task: Task) => void;
  onOpenPresentationCoach?: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  headerBg,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleChecklist,
  onToggleHelp,
  onOpenCoach,
  onOpenPresentationCoach,
  onMoveTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
  };

  return (
    <div className="flex-1 min-w-[300px] max-w-[420px] flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100/70 shrink-0 h-full">
      {/* Column Header */}
      <div className={`py-3 px-4 text-white font-bold text-base flex justify-between items-center shadow-sm ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span className="bg-white/30 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg transition-colors"
            title="Neue Aufgabe in dieser Spalte anlegen"
          >
            <Plus className="w-3.5 h-3.5" /> Neu
          </button>
        )}
      </div>

      {/* Droppable Task Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[300px] transition-colors ${
          isDragOver ? 'bg-sky-100/70 border-2 border-dashed border-[#0B7BA7]' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs italic py-12">
            <span>Keine Aufgaben</span>
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="mt-2 text-xs font-semibold text-[#0B7BA7] hover:underline"
              >
                + Aufgabe hinzufügen
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleChecklist={onToggleChecklist}
              onToggleHelp={onToggleHelp}
              onOpenCoach={onOpenCoach}
              onOpenPresentationCoach={onOpenPresentationCoach}
              onMoveTask={onMoveTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
};
