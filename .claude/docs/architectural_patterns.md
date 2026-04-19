# Architectural Patterns

## Backend: Modular Router Pattern

Each domain has its own router file registered in `main.py:26-29`. New domains follow the same pattern:

```
backend/routers/<domain>.py  →  router = APIRouter()  →  registered in main.py
```

All routers use `Depends(get_db)` for session injection (`database.py:14-19`). The session is yielded and closed in a `finally` block — never commit/close manually inside route handlers.

## Dependency Injection (FastAPI)

`get_db` in `database.py:14-19` is the single session provider. Every route that touches the DB declares `db: Session = Depends(get_db)`. Tables are created via `create_all()` inside a lifespan context manager (`main.py:9-13`), not at import time.

## Schema Layer (Pydantic ↔ SQLAlchemy)

`models.py` defines ORM classes with `Mapped[T]` typed columns (SQLAlchemy 2.0 style).
`schemas.py` defines Pydantic models for request bodies and response shapes.
Routes accept Pydantic schemas as input and return ORM objects (FastAPI serializes via `response_model`). The two layers are kept strictly separate — no SQLAlchemy models in responses, no Pydantic in DB queries.

## Recurrence Expansion Pattern

Recurrence is stored compactly in the DB (`Chore.recurrence`, `Chore.recurrence_days`) and expanded on-demand per request. `recurrence.py:expand_occurrences(chore, window_start, window_end)` is the single expansion function, called only from `routers/calendar.py`. Client never computes dates.

Weekly recurrence days stored as a JSON string (`"[0, 2, 4]"` = Mon/Wed/Fri). Parsed with `json.loads` in `recurrence.py`. If `recurrence_days` is empty/null for weekly, defaults to the chore's `start_date` weekday.

## Soft Delete on Chores

`DELETE /chores/{id}` sets `chore.active = False` (`routers/chores.py`) rather than removing the row. This preserves completion history. Queries for active chores always filter `Chore.active == True`. `ChoreCompletion` rows cascade-delete when their parent chore is hard-deleted (relationship defined in `models.py`).

## Duplicate Completion Prevention

`POST /completions` checks for an existing record with the same `(chore_id, occurrence_date)` before inserting (`routers/completions.py:25-34`). Returns HTTP 409 if found. This constraint lives at the application layer, not the database.

## Frontend: Centralized State in Root Component

`App.tsx` owns all mutable state: `members`, `chores`, `events`, `modal`, `dateWindow`, `error`. Child components receive data and callbacks via props — they hold no server state themselves. Data is refreshed imperatively after mutations (call API → call load function).

Pattern for adding a new feature:
1. Add state variable(s) to `App.tsx`
2. Add a `load<Resource>` async function that fetches and sets state
3. Pass data + handler callbacks to the relevant component as props

## Modal Discriminated Union

Modal state is a tagged union (`App.tsx:11-16`):

```typescript
type Modal =
  | { type: 'none' }
  | { type: 'new-chore' }
  | { type: 'edit-chore'; chore: Chore }
  | { type: 'detail'; event: CalendarEvent }
  | { type: 'team' };
```

Render conditionally by checking `modal.type`. TypeScript narrows the payload automatically. Add new modal variants by extending the union and handling the new case in `App.tsx`'s JSX.

## API Abstraction Layer

`api.ts` exports a thin wrapper around an Axios instance with `baseURL: '/api'`. All HTTP calls go through named functions (e.g., `api.createChore(data)`). The `/api` prefix is proxied to `http://localhost:8000` by Vite (`vite.config.ts:8-12`), so no CORS issues in development.

Data transformations between frontend form shape and backend payload happen inside `api.ts` (e.g., `recurrence_days` array → JSON string, empty `end_date` → `null`). Components pass typed form objects; `api.ts` handles serialization.

## TypeScript ↔ Pydantic Type Mirroring

`frontend/src/types.ts` defines interfaces (`Chore`, `TeamMember`, `CalendarEvent`, `ChoreCompletion`) that directly mirror the backend's Pydantic response schemas. When adding a field to a backend schema, add it to the corresponding interface in `types.ts` as well.
