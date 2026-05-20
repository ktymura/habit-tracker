from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import (
    NotificationSettingsRequest,
    NotificationSettingsResponse
)
from app.services.notification_service import upsert_notification_settings


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post(
    "/settings",
    response_model=NotificationSettingsResponse
)
def save_notification_settings(
    payload: NotificationSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> NotificationSettingsResponse:
    setting = upsert_notification_settings(
        db,
        current_user,
        payload.enabled,
        payload.reminder_time
    )

    return setting