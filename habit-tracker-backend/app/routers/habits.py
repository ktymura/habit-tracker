from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.models.entry import Entry


from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.habit import HabitCreateRequest, HabitResponse, HabitUpdateRequest
from app.services.habit_service import (
    create_habit,
    delete_habit,
    get_user_habit_or_none,
    get_user_habits,
    update_habit,
)


router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitResponse])
def get_habits(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[HabitResponse]:
    habits = get_user_habits(db, current_user.id)
    today = date.today()
    completed_today_ids = (
        {
            row[0]
            for row in db.query(Entry.habit_id)
            .filter(
                Entry.entry_date == today,
                Entry.habit_id.in_([h.id for h in habits]),
            )
            .all()
        }
        if habits
        else set()
    )
    return [
        HabitResponse.model_validate(
            {
                "id": h.id,
                "user_id": h.user_id,
                "name": h.name,
                "color": h.color,
                "icon": h.icon,
                "frequency": h.frequency,
                "created_at": h.created_at,
                "completed_today": h.id in completed_today_ids,
            }
        )
        for h in habits
    ]


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit_endpoint(
    payload: HabitCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    return create_habit(
        db,
        current_user.id,
        payload.name,
        payload.color,
        payload.icon,
        payload.frequency,
    )


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit_endpoint(
    habit_id: int,
    payload: HabitUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitResponse:
    habit = get_user_habit_or_none(db, current_user.id, habit_id)

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found"
        )

    return update_habit(
        db, habit, payload.name, payload.color, payload.icon, payload.frequency
    )


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit_endpoint(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    habit = get_user_habit_or_none(db, current_user.id, habit_id)

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found"
        )

    delete_habit(db, habit)
