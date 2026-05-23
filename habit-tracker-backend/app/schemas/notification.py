from datetime import time

from pydantic import BaseModel, ConfigDict


class NotificationSettingsRequest(BaseModel):
    enabled: bool
    reminder_time: time | None = None


class NotificationSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    enabled: bool
    reminder_time: time | None
