from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.entry import EntryCreateRequest, EntryResponse
from app.services.entry_service import (
    create_entry,
    delete_entry_by_date,
    get_entries_for_habit
)
from app.services.habit_service import get_user_habit_or_none


router = APIRouter(prefix="/habits", tags=["entries"])


@router.get("/{habit_id}/entries", response_model=list[EntryResponse])
def get_entries_endpoint(
    habit_id: int,
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[EntryResponse]:
    habit = get_user_habit_or_none(
        db,
        current_user.id,
        habit_id
    )

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    return get_entries_for_habit(
        db,
        habit,
        date_from,
        date_to
    )


@router.post(
    "/{habit_id}/entries",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_entry_endpoint(
    habit_id: int,
    payload: EntryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EntryResponse:
    habit = get_user_habit_or_none(
        db,
        current_user.id,
        habit_id
    )

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    try:
        return create_entry(
            db,
            habit,
            payload.entry_date
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Entry for this day already exists"
        )


@router.delete(
    "/{habit_id}/entries",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_entry_endpoint(
    habit_id: int,
    entry_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    habit = get_user_habit_or_none(
        db,
        current_user.id,
        habit_id
    )

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    deleted = delete_entry_by_date(
        db,
        habit,
        entry_date
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found"
        )