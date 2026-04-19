from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import TeamMember, Chore
from schemas import TeamMemberCreate, TeamMemberOut

router = APIRouter(prefix="/team", tags=["team"])


@router.get("", response_model=list[TeamMemberOut])
def list_members(db: Session = Depends(get_db)):
    return db.query(TeamMember).all()


@router.post("", response_model=TeamMemberOut, status_code=201)
def create_member(body: TeamMemberCreate, db: Session = Depends(get_db)):
    member = TeamMember(name=body.name, color=body.color)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=204)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.get(TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    # Unassign chores rather than blocking deletion
    db.query(Chore).filter(Chore.assignee_id == member_id).update({"assignee_id": None})
    db.delete(member)
    db.commit()
