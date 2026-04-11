from datetime import date

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    probability: float


class AnalyticsSummaryItem(BaseModel):
    habit_id: int
    habit_name: str
    total_entries: int
    completion_rate: float


class DailyCountItem(BaseModel):
    date: date
    count: int