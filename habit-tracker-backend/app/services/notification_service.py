import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.models.notification_setting import NotificationSetting
from app.models.user import User


def upsert_notification_settings(
    db: Session,
    user: User,
    enabled: bool,
    reminder_time
) -> NotificationSetting:
    setting = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == user.id
    ).first()

    if not setting:
        setting = NotificationSetting(
            user_id=user.id,
            enabled=enabled,
            reminder_time=reminder_time
        )
        db.add(setting)
    else:
        setting.enabled = enabled
        setting.reminder_time = reminder_time

    db.commit()
    db.refresh(setting)

    return setting


def send_test_email(
    smtp_host: str,
    smtp_port: int,
    sender_email: str,
    receiver_email: str
) -> None:
    message = EmailMessage()
    message["Subject"] = "Habit Tracker reminder"
    message["From"] = sender_email
    message["To"] = receiver_email
    message.set_content("This is your habit reminder.")

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.send_message(message)