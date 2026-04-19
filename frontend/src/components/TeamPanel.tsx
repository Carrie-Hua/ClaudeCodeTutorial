import { useState } from 'react';
import type { TeamMember } from '../types';

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

interface Props {
  members: TeamMember[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function TeamPanel({ members, onAdd, onDelete, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName('');
    setColor(PRESET_COLORS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-80 h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 italic">No members yet.</p>
          )}
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: m.color }}
                />
                <span className="text-sm font-medium text-gray-800">{m.name}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove ${m.name}? Their chores will become unassigned.`)) {
                    onDelete(m.id);
                  }
                }}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                title="Remove member"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="border-t px-5 py-4 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add member</p>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          {/* Color swatches */}
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-1 ring-gray-600 scale-110' : ''}`}
                style={{ background: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              title="Custom color"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add member
          </button>
        </div>
      </div>
    </div>
  );
}
