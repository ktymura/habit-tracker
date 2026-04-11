from datetime import date

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.cache import analytics_cache
from app.models.entry import Entry
from app.models.habit import Habit


def create_entry(
    db: Session,
    habit: Habit,
    entry_date: date
) -> Entry:
    entry = Entry(
        habit_id=habit.id,
        entry_date=entry_date
    )

    db.add(entry)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(entry)
    analytics_cache.invalidate_prefix(f"analytics:user:{habit.user_id}:")
    return entry


def delete_entry_by_date(
    db: Session,
    habit: Habit,
    entry_date: date
) -> bool:
    entry = db.query(Entry).filter(
        Entry.habit_id == habit.id,
        Entry.entry_date == entry_date
    ).first()

    if not entry:
        return False

    db.delete(entry)
    db.commit()
    analytics_cache.invalidate_prefix(f"analytics:user:{habit.user_id}:")
    return True


def get_entries_for_habit(
    db: Session,
    habit: Habit,
    date_from: date | None,
    date_to: date | None
) -> list[Entry]:
    query = db.query(Entry).filter(Entry.habit_id == habit.id)

    if date_from is not None:
        query = query.filter(Entry.entry_date >= date_from)

    if date_to is not None:
        query = query.filter(Entry.entry_date <= date_to)

    return query.order_by(Entry.entry_date.asc()).all()