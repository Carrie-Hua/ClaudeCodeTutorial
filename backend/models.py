from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class TeamMember(Base):
    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(Text, nullable=False, default="#3b82f6")

    chores: Mapped[list["Chore"]] = relationship("Chore", back_populates="assignee")
    completions: Mapped[list["ChoreCompletion"]] = relationship(
        "ChoreCompletion", back_populates="completed_by"
    )


class Chore(Base):
    __tablename__ = "chores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assignee_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("team_members.id"), nullable=True
    )
    priority: Mapped[str] = mapped_column(Text, nullable=False, default="medium")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    recurrence: Mapped[str] = mapped_column(Text, nullable=False, default="none")
    # JSON array of ints (0=Mon…6=Sun) — only used when recurrence="weekly"
    recurrence_days: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    assignee: Mapped["TeamMember | None"] = relationship(
        "TeamMember", back_populates="chores"
    )
    completions: Mapped[list["ChoreCompletion"]] = relationship(
        "ChoreCompletion", back_populates="chore", cascade="all, delete-orphan"
    )


class ChoreCompletion(Base):
    __tablename__ = "chore_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chore_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("chores.id"), nullable=False
    )
    occurrence_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("team_members.id"), nullable=True
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    chore: Mapped["Chore"] = relationship("Chore", back_populates="completions")
    completed_by: Mapped["TeamMember | None"] = relationship(
        "TeamMember", back_populates="completions"
    )
