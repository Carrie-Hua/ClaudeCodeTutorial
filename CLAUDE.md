# ClaudeCodeTutorial

## Project Overview

Office chore management app for teams — create recurring chores, assign them to team members, mark completions, and visualize everything on a calendar. Tutorial project demonstrating FastAPI + React + SQLAlchemy patterns.

## Tech Stack

**Backend**: Python · FastAPI 0.111 · SQLAlchemy 2.0 · Pydantic v2 · SQLite · python-dateutil
**Frontend**: TypeScript · React 19 · Vite 8 · Tailwind CSS 4 · Axios · FullCalendar 6

## Key Directories

```
backend/
  main.py          # App entry point, CORS config, router registration
  models.py        # SQLAlchemy ORM: TeamMember, Chore, ChoreCompletion
  schemas.py       # Pydantic request/response schemas
  database.py      # Engine, sessionmaker, Base, get_db dependency
  recurrence.py    # Business logic: expand recurrence rules into occurrence dates
  routers/         # One file per domain: chores.py, completions.py, team.py, calendar.py

frontend/src/
  App.tsx          # Root component — owns all state and data-loading
  api.ts           # Axios HTTP client abstraction (base URL: /api)
  types.ts         # TypeScript interfaces mirroring backend Pydantic schemas
  components/      # CalendarView, ChoreModal, ChoreDetail, TeamPanel
```

## Commands

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # DB auto-created on first run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev        # Dev server on :5173 (proxies /api → :8000)
npm run build      # tsc + vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/team` | List / create team members |
| DELETE | `/team/{id}` | Remove member |
| GET/POST | `/chores` | List / create chores |
| PUT/DELETE | `/chores/{id}` | Update / soft-delete chore |
| GET/POST | `/completions` | List / mark completion |
| DELETE | `/completions/{id}` | Unmark completion |
| GET | `/calendar?start=&end=` | Expanded occurrences in date window |
| GET | `/health` | Health check |

## Additional Documentation

- [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) — Backend router pattern, dependency injection, recurrence expansion, frontend state model, modal discriminated union, API proxy setup. Check when adding features, new routes, or modifying data flow.

- When you work on a new feature or bug, create a git branch first. Then work on changes in that branch for the remainder of the session.

