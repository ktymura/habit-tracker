from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummaryItem,
    CorrelationItem,
    DailyCountItem,
    PredictionResponse
)
from app.services.analytics_service import (
    get_correlations,
    get_heatmap,
    get_summary,
    predict_habit_probability
)


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=list[AnalyticsSummaryItem])
def get_summary_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[AnalyticsSummaryItem]:
    return get_summary(db, current_user.id)


@router.get("/heatmap", response_model=list[DailyCountItem])
def get_heatmap_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[DailyCountItem]:
    return get_heatmap(db, current_user.id)


@router.get("/correlations", response_model=list[CorrelationItem])
def get_correlations_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[CorrelationItem]:
    return get_correlations(db, current_user.id)


@router.get("/predict/{habit_id}", response_model=PredictionResponse)
def predict_endpoint(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PredictionResponse:
    probability = predict_habit_probability(
        db,
        current_user.id,
        habit_id
    )

    if probability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    return PredictionResponse(probability=probability)