from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class EntryCreateRequest(BaseModel):
    entry_date: date


class EntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    habit_id: int
    entry_date: date
    created_at: datetime
