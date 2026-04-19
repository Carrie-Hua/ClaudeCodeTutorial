from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# ── Team Members ──────────────────────────────────────────────────────────────

class TeamMemberCreate(BaseModel):
    name: str
    color: str = "#3b82f6"


class TeamMemberOut(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


# ── Chores ────────────────────────────────────────────────────────────────────

class ChoreCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: str = "medium"          # low | medium | high
    start_date: date
    end_date: Optional[date] = None
    recurrence: str = "none"          # none | daily | weekly | monthly
    recurrence_days: Optional[str] = None  # JSON array e.g. "[0,2,4]"


class ChoreUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    recurrence: Optional[str] = None
    recurrence_days: Optional[str] = None


class ChoreOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assignee_id: Optional[int]
    assignee: Optional[TeamMemberOut]
    priority: str
    start_date: date
    end_date: Optional[date]
    recurrence: str
    recurrence_days: Optional[str]
    active: bool

    model_config = {"from_attributes": True}


# ── Calendar ──────────────────────────────────────────────────────────────────

class CalendarEvent(BaseModel):
    """One expanded occurrence of a chore, ready for FullCalendar."""
    id: str                    # "<chore_id>_<occurrence_date>"
    chore_id: int
    title: str
    start: str                 # ISO date string YYYY-MM-DD
    allDay: bool = True
    color: Optional[str]       # assignee color
    priority: str
    assignee_id: Optional[int]
    assignee_name: Optional[str]
    completed: bool
    completion_id: Optional[int]
    completed_by_name: Optional[str]
    completed_at: Optional[datetime]


# ── Completions ───────────────────────────────────────────────────────────────

class CompletionCreate(BaseModel):
    chore_id: int
    occurrence_date: date
    completed_by_id: Optional[int] = None
    notes: Optional[str] = None


class CompletionOut(BaseModel):
    id: int
    chore_id: int
    occurrence_date: date
    completed_by_id: Optional[int]
    completed_by: Optional[TeamMemberOut]
    completed_at: datetime
    notes: Optional[str]

    model_config = {"from_attributes": True}
