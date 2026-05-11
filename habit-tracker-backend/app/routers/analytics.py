from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entry import Entry
from app.models.user import User
from app.schemas.analytics import HabitStreakResponse, StreaksResponse
from app.services.habit_service import get_user_habits
from app.services.streak_service import compute_current_streak, compute_longest_streak


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/streaks", response_model=StreaksResponse)
def get_streaks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreaksResponse:
    habits = get_user_habits(db, current_user.id)
    today = date.today()

    results = []
    for habit in habits:
        entry_dates = [
            e.entry_date
            for e in db.query(Entry).filter(Entry.habit_id == habit.id).all()
        ]
        results.append(
            HabitStreakResponse(
                habit_id=habit.id,
                habit_name=habit.name,
                current_streak=compute_current_streak(entry_dates, today),
                longest_streak=compute_longest_streak(entry_dates),
            )
        )

    return StreaksResponse(habits=results)
