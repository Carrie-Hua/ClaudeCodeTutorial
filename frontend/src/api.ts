import axios from 'axios';
import type { TeamMember, Chore, CalendarEvent, Completion, ChoreFormData } from './types';

const http = axios.create({ baseURL: '/api' });

// ── Team ──────────────────────────────────────────────────────────────────────

export const getTeam = () =>
  http.get<TeamMember[]>('/team').then((r) => r.data);

export const createMember = (name: string, color: string) =>
  http.post<TeamMember>('/team', { name, color }).then((r) => r.data);

export const deleteMember = (id: number) =>
  http.delete(`/team/${id}`);

// ── Chores ────────────────────────────────────────────────────────────────────

export const getChores = () =>
  http.get<Chore[]>('/chores').then((r) => r.data);

export const createChore = (data: ChoreFormData) => {
  const payload = {
    ...data,
    description: data.description || null,
    assignee_id: data.assignee_id ?? null,
    end_date: data.end_date || null,
    recurrence_days:
      data.recurrence === 'weekly' && data.recurrence_days.length > 0
        ? JSON.stringify(data.recurrence_days)
        : null,
  };
  return http.post<Chore>('/chores', payload).then((r) => r.data);
};

export const updateChore = (id: number, data: Partial<ChoreFormData>) => {
  const payload: Record<string, unknown> = { ...data };
  if (data.recurrence_days !== undefined) {
    payload.recurrence_days =
      data.recurrence === 'weekly' && data.recurrence_days!.length > 0
        ? JSON.stringify(data.recurrence_days)
        : null;
  }
  return http.put<Chore>(`/chores/${id}`, payload).then((r) => r.data);
};

export const deleteChore = (id: number) =>
  http.delete(`/chores/${id}`);

// ── Calendar ──────────────────────────────────────────────────────────────────

export const getCalendar = (start: string, end: string) =>
  http.get<CalendarEvent[]>('/calendar', { params: { start, end } }).then((r) => r.data);

// ── Completions ───────────────────────────────────────────────────────────────

export const markComplete = (
  chore_id: number,
  occurrence_date: string,
  completed_by_id: number | null,
  notes?: string
) =>
  http
    .post<Completion>('/completions', { chore_id, occurrence_date, completed_by_id, notes })
    .then((r) => r.data);

export const unmarkComplete = (completion_id: number) =>
  http.delete(`/completions/${completion_id}`);

export const getCompletions = (chore_id?: number) =>
  http
    .get<Completion[]>('/completions', { params: chore_id ? { chore_id } : undefined })
    .then((r) => r.data);
