from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import ChoreCompletion
from schemas import CompletionCreate, CompletionOut

router = APIRouter(prefix="/completions", tags=["completions"])


@router.get("", response_model=list[CompletionOut])
def list_completions(
    chore_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ChoreCompletion)
    if chore_id is not None:
        q = q.filter(ChoreCompletion.chore_id == chore_id)
    return q.order_by(ChoreCompletion.occurrence_date.desc()).all()


@router.post("", response_model=CompletionOut, status_code=201)
def mark_complete(body: CompletionCreate, db: Session = Depends(get_db)):
    # Prevent duplicate completions for the same chore occurrence
    existing = (
        db.query(ChoreCompletion)
        .filter(
            ChoreCompletion.chore_id == body.chore_id,
            ChoreCompletion.occurrence_date == body.occurrence_date,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already marked complete")

    completion = ChoreCompletion(
        chore_id=body.chore_id,
        occurrence_date=body.occurrence_date,
        completed_by_id=body.completed_by_id,
        notes=body.notes,
        completed_at=datetime.utcnow(),
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    return completion


@router.delete("/{completion_id}", status_code=204)
def unmark_complete(completion_id: int, db: Session = Depends(get_db)):
    completion = db.get(ChoreCompletion, completion_id)
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    db.delete(completion)
    db.commit()
