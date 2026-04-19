from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Chore
from schemas import ChoreCreate, ChoreOut, ChoreUpdate

router = APIRouter(prefix="/chores", tags=["chores"])


@router.get("", response_model=list[ChoreOut])
def list_chores(db: Session = Depends(get_db)):
    return db.query(Chore).filter(Chore.active == True).all()


@router.post("", response_model=ChoreOut, status_code=201)
def create_chore(body: ChoreCreate, db: Session = Depends(get_db)):
    chore = Chore(**body.model_dump())
    db.add(chore)
    db.commit()
    db.refresh(chore)
    return chore


@router.put("/{chore_id}", response_model=ChoreOut)
def update_chore(chore_id: int, body: ChoreUpdate, db: Session = Depends(get_db)):
    chore = db.get(Chore, chore_id)
    if not chore or not chore.active:
        raise HTTPException(status_code=404, detail="Chore not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(chore, field, value)
    db.commit()
    db.refresh(chore)
    return chore


@router.delete("/{chore_id}", status_code=204)
def delete_chore(chore_id: int, db: Session = Depends(get_db)):
    chore = db.get(Chore, chore_id)
    if not chore or not chore.active:
        raise HTTPException(status_code=404, detail="Chore not found")
    chore.active = False
    db.commit()
