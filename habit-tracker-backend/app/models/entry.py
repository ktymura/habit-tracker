from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (
        UniqueConstraint("habit_id", "entry_date", name="uq_entries_habit_id_entry_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    habit = relationship("Habit", back_populates="entries")