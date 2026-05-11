from pydantic import BaseModel


class HabitStreakResponse(BaseModel):
    habit_id: int
    habit_name: str
    current_streak: int
    longest_streak: int


class StreaksResponse(BaseModel):
    habits: list[HabitStreakResponse]
