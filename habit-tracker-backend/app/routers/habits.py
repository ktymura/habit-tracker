from fastapi import APIRouter

from app.schemas.habit import HabitCreateRequest


router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("")
def get_habits() -> list[dict[str, str]]:
    return []


@router.post("")
def create_habit(payload: HabitCreateRequest) -> dict[str, str]:
    return {"message": f"Habit endpoint ready for {payload.name}"}
