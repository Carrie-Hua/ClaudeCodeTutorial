import type { CalendarEvent, TeamMember } from '../types';

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

interface Props {
  event: CalendarEvent;
  members: TeamMember[];
  onMarkComplete: (event: CalendarEvent, completedById: number | null) => void;
  onUnmarkComplete: (event: CalendarEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ChoreDetail({
  event,
  members,
  onMarkComplete,
  onUnmarkComplete,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">{event.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{event.start}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm mb-5">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-20 shrink-0">Priority</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_BADGE[event.priority]}`}
            >
              {event.priority}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-20 shrink-0">Assigned to</span>
            {event.assignee_name ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: event.color }}
                />
                {event.assignee_name}
              </span>
            ) : (
              <span className="text-gray-400 italic">Unassigned</span>
            )}
          </div>
          {event.completed && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-20 shrink-0">Completed</span>
              <span className="text-green-600 font-medium">
                {event.completed_by_name ?? 'Someone'}{' '}
                {event.completed_at
                  ? `on ${new Date(event.completed_at).toLocaleDateString()}`
                  : ''}
              </span>
            </div>
          )}
        </div>

        {/* Complete / Undo */}
        {event.completed ? (
          <button
            onClick={() => onUnmarkComplete(event)}
            className="w-full mb-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Undo completion
          </button>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Mark complete as:</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMarkComplete(event, m.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: m.color }}
                  />
                  {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => onMarkComplete(event, null)}
              className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Mark complete
            </button>
          </div>
        )}

        {/* Edit / Delete */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
