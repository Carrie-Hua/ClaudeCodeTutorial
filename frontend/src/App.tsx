import { useCallback, useEffect, useState } from 'react';
import CalendarView from './components/CalendarView';
import ChoreModal from './components/ChoreModal';
import ChoreDetail from './components/ChoreDetail';
import TeamPanel from './components/TeamPanel';
import type { CalendarEvent, Chore, ChoreFormData, TeamMember } from './types';
import * as api from './api';

type Modal =
  | { type: 'none' }
  | { type: 'new-chore' }
  | { type: 'edit-chore'; chore: Chore }
  | { type: 'detail'; event: CalendarEvent }
  | { type: 'team' };

export default function App() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modal, setModal] = useState<Modal>({ type: 'none' });
  const [dateWindow, setDateWindow] = useState<{ start: string; end: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const reportError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const loadMembers = () => api.getTeam().then(setMembers).catch(reportError);
  const loadChores = () => api.getChores().then(setChores).catch(reportError);
  const loadCalendar = useCallback(
    (start: string, end: string) => {
      api.getCalendar(start, end).then(setEvents).catch(reportError);
    },
    []
  );

  useEffect(() => {
    loadMembers();
    loadChores();
  }, []);

  useEffect(() => {
    if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
  }, [dateWindow, loadCalendar]);

  // ── Chore actions ──────────────────────────────────────────────────────────

  const handleSaveChore = async (data: ChoreFormData) => {
    try {
      if (modal.type === 'edit-chore') {
        await api.updateChore(modal.chore.id, data);
      } else {
        await api.createChore(data);
      }
      await loadChores();
      if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
      setModal({ type: 'none' });
    } catch (e) {
      reportError(e);
    }
  };

  const handleDeleteChore = async (event: CalendarEvent) => {
    if (!confirm(`Delete "${event.title}"? This removes all occurrences.`)) return;
    try {
      await api.deleteChore(event.chore_id);
      await loadChores();
      if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
      setModal({ type: 'none' });
    } catch (e) {
      reportError(e);
    }
  };

  const handleEditChore = (event: CalendarEvent) => {
    const chore = chores.find((c) => c.id === event.chore_id);
    if (chore) setModal({ type: 'edit-chore', chore });
  };

  // ── Completion actions ─────────────────────────────────────────────────────

  const handleMarkComplete = async (event: CalendarEvent, memberId: number | null) => {
    try {
      await api.markComplete(event.chore_id, event.start, memberId);
      if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
      setModal({ type: 'none' });
    } catch (e) {
      reportError(e);
    }
  };

  const handleUnmarkComplete = async (event: CalendarEvent) => {
    if (!event.completion_id) return;
    try {
      await api.unmarkComplete(event.completion_id);
      if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
      setModal({ type: 'none' });
    } catch (e) {
      reportError(e);
    }
  };

  // ── Team actions ───────────────────────────────────────────────────────────

  const handleAddMember = async (name: string, color: string) => {
    try {
      await api.createMember(name, color);
      await loadMembers();
    } catch (e) {
      reportError(e);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await api.deleteMember(id);
      await loadMembers();
      await loadChores();
      if (dateWindow) loadCalendar(dateWindow.start, dateWindow.end);
    } catch (e) {
      reportError(e);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Office Chores</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ type: 'team' })}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <span>👥</span> Team
          </button>
          <button
            onClick={() => setModal({ type: 'new-chore' })}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <span>+</span> Add Chore
          </button>
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-[100] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {error}
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Legend */}
        {members.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {members.map((m) => (
              <span key={m.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                {m.name}
              </span>
            ))}
          </div>
        )}

        <CalendarView
          events={events}
          onEventClick={(ev) => setModal({ type: 'detail', event: ev })}
          onDatesSet={(start, end) => setDateWindow({ start, end })}
        />
      </main>

      {/* Modals */}
      {(modal.type === 'new-chore' || modal.type === 'edit-chore') && (
        <ChoreModal
          chore={modal.type === 'edit-chore' ? modal.chore : null}
          members={members}
          onSave={handleSaveChore}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'detail' && (
        <ChoreDetail
          event={modal.event}
          members={members}
          onMarkComplete={handleMarkComplete}
          onUnmarkComplete={handleUnmarkComplete}
          onEdit={() => handleEditChore(modal.event)}
          onDelete={() => handleDeleteChore(modal.event)}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'team' && (
        <TeamPanel
          members={members}
          onAdd={handleAddMember}
          onDelete={handleDeleteMember}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
    </div>
  );
}
