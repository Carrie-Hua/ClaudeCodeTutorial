import { useEffect, useState } from 'react';
import type { Chore, ChoreFormData, Priority, Recurrence, TeamMember } from '../types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  chore?: Chore | null;
  members: TeamMember[];
  onSave: (data: ChoreFormData) => void;
  onClose: () => void;
}

const EMPTY: ChoreFormData = {
  title: '',
  description: '',
  assignee_id: null,
  priority: 'medium',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  recurrence: 'none',
  recurrence_days: [],
};

export default function ChoreModal({ chore, members, onSave, onClose }: Props) {
  const [form, setForm] = useState<ChoreFormData>(EMPTY);

  useEffect(() => {
    if (chore) {
      setForm({
        title: chore.title,
        description: chore.description ?? '',
        assignee_id: chore.assignee_id,
        priority: chore.priority as Priority,
        start_date: chore.start_date,
        end_date: chore.end_date ?? '',
        recurrence: chore.recurrence as Recurrence,
        recurrence_days: chore.recurrence_days
          ? JSON.parse(chore.recurrence_days)
          : [],
      });
    } else {
      setForm(EMPTY);
    }
  }, [chore]);

  const set = <K extends keyof ChoreFormData>(key: K, val: ChoreFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (day: number) => {
    const days = form.recurrence_days.includes(day)
      ? form.recurrence_days.filter((d) => d !== day)
      : [...form.recurrence_days, day];
    set('recurrence_days', days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">{chore ? 'Edit Chore' : 'New Chore'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Clean the kitchen"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional details…"
            />
          </div>

          {/* Assignee + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.assignee_id ?? ''}
                onChange={(e) =>
                  set('assignee_id', e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.recurrence}
              onChange={(e) => set('recurrence', e.target.value as Recurrence)}
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Weekly day picker */}
          {form.recurrence === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on</label>
              <div className="flex gap-1 flex-wrap">
                {WEEKDAYS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.recurrence_days.includes(idx)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {chore ? 'Save changes' : 'Create chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
