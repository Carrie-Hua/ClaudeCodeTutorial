from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Chore, ChoreCompletion
from recurrence import expand_occurrences
from schemas import CalendarEvent

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("", response_model=list[CalendarEvent])
def get_calendar(
    start: date = Query(..., description="Start of window (YYYY-MM-DD)"),
    end: date = Query(..., description="End of window (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    chores = db.query(Chore).filter(Chore.active == True).all()

    # Build a lookup: (chore_id, occurrence_date) -> ChoreCompletion
    completions = db.query(ChoreCompletion).all()
    completion_map: dict[tuple[int, date], ChoreCompletion] = {
        (c.chore_id, c.occurrence_date): c for c in completions
    }

    events: list[CalendarEvent] = []
    for chore in chores:
        for occ_date in expand_occurrences(chore, start, end):
            key = (chore.id, occ_date)
            completion = completion_map.get(key)
            events.append(
                CalendarEvent(
                    id=f"{chore.id}_{occ_date.isoformat()}",
                    chore_id=chore.id,
                    title=chore.title,
                    start=occ_date.isoformat(),
                    color=chore.assignee.color if chore.assignee else "#6b7280",
                    priority=chore.priority,
                    assignee_id=chore.assignee_id,
                    assignee_name=chore.assignee.name if chore.assignee else None,
                    completed=completion is not None,
                    completion_id=completion.id if completion else None,
                    completed_by_name=(
                        completion.completed_by.name
                        if completion and completion.completed_by
                        else None
                    ),
                    completed_at=completion.completed_at if completion else None,
                )
            )
    return events
