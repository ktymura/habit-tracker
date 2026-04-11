from datetime import time

from pydantic import BaseModel


class NotificationSettingsRequest(BaseModel):
    enabled: bool
    reminder_time: time | None = None


class NotificationSettingsResponse(BaseModel):
    id: int
    user_id: int
    enabled: bool
    reminder_time: time | None