from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HabitCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    color: str | None = Field(default=None, max_length=50)
    icon: str | None = Field(default=None, max_length=50)
    frequency: str = Field(default="daily", max_length=50)


class HabitUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    color: str | None = Field(default=None, max_length=50)
    icon: str | None = Field(default=None, max_length=50)
    frequency: str | None = Field(default=None, max_length=50)


class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    color: str | None
    icon: str | None
    frequency: str
    created_at: datetime
    completed_today: bool
