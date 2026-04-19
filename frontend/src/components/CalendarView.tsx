import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import type { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDatesSet: (start: string, end: string) => void;
}

export default function CalendarView({ events, onEventClick, onDatesSet }: Props) {
  const calRef = useRef<FullCalendar>(null);

  const fcEvents = events.map((ev) => ({
    id: ev.id,
    title: ev.completed ? `✓ ${ev.title}` : ev.title,
    start: ev.start,
    allDay: true,
    backgroundColor: ev.color,
    borderColor: ev.color,
    classNames: [
      `priority-${ev.priority}`,
      ev.completed ? 'fc-event-completed' : '',
    ].filter(Boolean),
    extendedProps: ev,
  }));

  const handleClick = (arg: EventClickArg) => {
    onEventClick(arg.event.extendedProps as CalendarEvent);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const start = arg.startStr.slice(0, 10);
    const end = arg.endStr.slice(0, 10);
    onDatesSet(start, end);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        height="auto"
        events={fcEvents}
        eventClick={handleClick}
        datesSet={handleDatesSet}
        eventDisplay="block"
        dayMaxEvents={4}
      />
    </div>
  );
}
