import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Check } from 'lucide-react';

interface GroupMembersModalProps {
  isOpen: boolean;
  groupMembers: string[];
  onClose: () => void;
  onSave: (members: string[]) => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  groupMembers,
  onClose,
  onSave,
}) => {
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMembers(groupMembers ? [...groupMembers] : []);
      setNewMemberName('');
    }
  }, [isOpen, groupMembers]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newMemberName.trim();
    if (!clean) return;
    if (members.includes(clean)) {
      alert('Dieser Name ist bereits in der Gruppe.');
      return;
    }
    setMembers([...members, clean]);
    setNewMemberName('');
  };

  const handleRemove = (name: string) => {
    setMembers(members.filter((m) => m !== name));
  };

  const handleSave = () => {
    onSave(members);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#0B7BA7] text-white p-1.5 rounded-lg shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900">
              Gruppenmitglieder verwalten
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs text-gray-600">
            Tragt die Namen der Schülerinnen und Schüler ein, die an diesem Projekt arbeiten. Dadurch könnt ihr Aufgaben gezielt zuweisen und den <strong>„Fokus auf mich“</strong>-Filter nutzen.
          </p>

          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Vor- und Nachname..."
              className="flex-1 p-2 bg-slate-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0B7BA7]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Hinzufügen
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 italic bg-slate-50 rounded-xl border">
                Noch keine Mitglieder eingetragen.
              </div>
            ) : (
              members.map((name) => (
                <div
                  key={name}
                  className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-gray-800"
                >
                  <span>{name}</span>
                  <button
                    onClick={() => handleRemove(name)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-100 border-t flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-300"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#0B7BA7] hover:bg-[#00558F] text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};
