from datetime import date

from pydantic import BaseModel


class StreakItem(BaseModel):
    habit_id: int
    habit_name: str
    current_streak: int
    longest_streak: int


class AnalyticsSummaryItem(BaseModel):
    habit_id: int
    habit_name: str
    total_entries: int
    weekly_completion_rate: float
    monthly_completion_rate: float

class DailyCountItem(BaseModel):
    date: date
    count: int


class CorrelationItem(BaseModel):
    habit_a_id: int
    habit_a_name: str
    habit_b_id: int
    habit_b_name: str
    correlation: float


class PredictionResponse(BaseModel):
    probability: float


class HabitStreakResponse(BaseModel):
    habit_id: int
    habit_name: str
    current_streak: int
    longest_streak: int


class StreaksResponse(BaseModel):
    habits: list[HabitStreakResponse]