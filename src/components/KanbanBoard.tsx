import React, { useState } from 'react';
import { Task, TaskStatus, TaskTag, TaskPriority, ProjectBoard } from '../types/project';
import { KanbanColumn } from './KanbanColumn';
import { Plus, Search, Filter, User, Sparkles } from 'lucide-react';

interface KanbanBoardProps {
  board: ProjectBoard;
  onOpenAddModal: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleChecklist: (taskId: string, idx: number) => void;
  onToggleHelp: (taskId: string) => void;
  onOpenCoach: (task: Task) => void;
  onOpenPresentationCoach: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onOpenAddModal,
  onEditTask,
  onDeleteTask,
  onToggleChecklist,
  onToggleHelp,
  onOpenCoach,
  onOpenPresentationCoach,
  onMoveTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const members = board.groupMembers || [];

  const filteredTasks = board.tasks.filter((t) => {
    if (tagFilter !== 'all' && t.tag !== tagFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // "Fokus auf mich" Filter
    if (memberFilter !== 'all') {
      const assigneeLower = (t.assignee || '').toLowerCase();
      const memberLower = memberFilter.toLowerCase();
      if (!assigneeLower.includes(memberLower) && !assigneeLower.includes('alle')) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* "Fokus auf mich" / Personen-Filter Chips */}
      {members.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 shrink-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <User className="w-3.5 h-3.5 text-[#0B7BA7]" /> Fokus:
          </span>
          <button
            onClick={() => setMemberFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              memberFilter === 'all'
                ? 'bg-[#0B7BA7] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Alle Aufgaben ({board.tasks.length})
          </button>
          {members.map((m) => {
            const count = board.tasks.filter((t) =>
              (t.assignee || '').toLowerCase().includes(m.toLowerCase()) || (t.assignee || '').toLowerCase().includes('alle')
            ).length;
            const isSelected = memberFilter.toLowerCase() === m.toLowerCase();

            return (
              <button
                key={m}
                onClick={() => setMemberFilter(isSelected ? 'all' : m)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#F39200] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                <span>{m}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Board Controls (Search, Filter, Add) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Aufgaben oder Stichworte suchen..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#0B7BA7]"
            />
          </div>

          {/* Filters on mobile in 1 line */}
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="flex-1 sm:flex-initial text-xs bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0B7BA7] text-gray-700 min-w-0"
            >
              <option value="all">Alle Kategorien</option>
              <option value="recherche">🔍 Recherche</option>
              <option value="material">✂️ Material</option>
              <option value="text">✍️ Text</option>
              <option value="layout">🎨 Layout</option>
              <option value="praesentation">🗣️ Präsentation</option>
              <option value="medien">💻 Technik</option>
              <option value="kontrolle">🔄 Kontrolle</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 sm:flex-initial text-xs bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0B7BA7] text-gray-700 min-w-0"
            >
              <option value="all">Alle Prioritäten</option>
              <option value="urgent">🔴 Dringend</option>
              <option value="important">🟡 Wichtig</option>
              <option value="normal">🟢 Normal</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onOpenAddModal('todo')}
          className="flex items-center justify-center gap-1.5 bg-[#00A896] hover:bg-[#008f80] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Neue Aufgabe</span>
        </button>
      </div>

      {/* 3 Columns */}
      <div className="flex-1 flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x min-h-0">
        <KanbanColumn
          status="todo"
          title="Zu Erledigen"
          headerBg="bg-[#F39200]"
          tasks={todoTasks}
          onAddTask={() => onOpenAddModal('todo')}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleChecklist={onToggleChecklist}
          onToggleHelp={onToggleHelp}
          onOpenCoach={onOpenCoach}
          onOpenPresentationCoach={onOpenPresentationCoach}
          onMoveTask={onMoveTask}
          onDropTask={onMoveTask}
        />

        <KanbanColumn
          status="in_progress"
          title="In Arbeit"
          headerBg="bg-[#0B7BA7]"
          tasks={inProgressTasks}
          onAddTask={() => onOpenAddModal('in_progress')}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleChecklist={onToggleChecklist}
          onToggleHelp={onToggleHelp}
          onOpenCoach={onOpenCoach}
          onOpenPresentationCoach={onOpenPresentationCoach}
          onMoveTask={onMoveTask}
          onDropTask={onMoveTask}
        />

        <KanbanColumn
          status="done"
          title="Erledigt"
          headerBg="bg-[#00A896]"
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleChecklist={onToggleChecklist}
          onToggleHelp={onToggleHelp}
          onOpenCoach={onOpenCoach}
          onOpenPresentationCoach={onOpenPresentationCoach}
          onMoveTask={onMoveTask}
          onDropTask={onMoveTask}
        />
      </div>
    </div>
  );
};
