from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.entry import Entry
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummaryItem,
    CorrelationItem,
    DailyCountItem,
    HabitStreakResponse,
    PredictionResponse,
    StreaksResponse,
)
from app.services.analytics_service import (
    get_correlations,
    get_heatmap,
    get_summary,
    predict_habit_probability,
)
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


@router.get("/summary", response_model=list[AnalyticsSummaryItem])
def get_summary_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AnalyticsSummaryItem]:
    return get_summary(db, current_user.id)


@router.get("/heatmap", response_model=list[DailyCountItem])
def get_heatmap_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DailyCountItem]:
    return get_heatmap(db, current_user.id)


@router.get("/correlations", response_model=list[CorrelationItem])
def get_correlations_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CorrelationItem]:
    return get_correlations(db, current_user.id)


@router.get("/predict/{habit_id}", response_model=PredictionResponse)
def predict_endpoint(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    probability = predict_habit_probability(db, current_user.id, habit_id)

    if probability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return PredictionResponse(probability=probability)
