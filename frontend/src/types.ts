export type Priority = 'low' | 'medium' | 'high';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TeamMember {
  id: number;
  name: string;
  color: string;
}

export interface Chore {
  id: number;
  title: string;
  description: string | null;
  assignee_id: number | null;
  assignee: TeamMember | null;
  priority: Priority;
  start_date: string;       // YYYY-MM-DD
  end_date: string | null;
  recurrence: Recurrence;
  recurrence_days: string | null;  // JSON e.g. "[0,2,4]"
  active: boolean;
}

export interface CalendarEvent {
  id: string;              // "<chore_id>_<date>"
  chore_id: number;
  title: string;
  start: string;           // YYYY-MM-DD
  allDay: boolean;
  color: string;
  priority: Priority;
  assignee_id: number | null;
  assignee_name: string | null;
  completed: boolean;
  completion_id: number | null;
  completed_by_name: string | null;
  completed_at: string | null;
}

export interface Completion {
  id: number;
  chore_id: number;
  occurrence_date: string;
  completed_by_id: number | null;
  completed_by: TeamMember | null;
  completed_at: string;
  notes: string | null;
}

export interface ChoreFormData {
  title: string;
  description: string;
  assignee_id: number | null;
  priority: Priority;
  start_date: string;
  end_date: string;
  recurrence: Recurrence;
  recurrence_days: number[];
}
