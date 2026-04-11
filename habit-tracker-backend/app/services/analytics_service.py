from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.cache import analytics_cache
from app.models.entry import Entry
from app.models.habit import Habit


CACHE_TTL_SECONDS = 300


def get_summary(
    db: Session,
    user_id: int
) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:summary"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    habits = db.query(Habit).filter(Habit.user_id == user_id).all()
    result = []

    for habit in habits:
        total_entries = db.query(Entry).filter(Entry.habit_id == habit.id).count()
        completion_rate = round(min(total_entries / 30, 1.0), 2)

        result.append(
            {
                "habit_id": habit.id,
                "habit_name": habit.name,
                "total_entries": total_entries,
                "completion_rate": completion_rate
            }
        )

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def get_heatmap(
    db: Session,
    user_id: int
) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:heatmap"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    start_date = date.today() - timedelta(days=364)

    rows = (
        db.query(Entry.entry_date, Habit.user_id)
        .join(Habit, Habit.id == Entry.habit_id)
        .filter(
            Habit.user_id == user_id,
            Entry.entry_date >= start_date
        )
        .all()
    )

    counts: dict[date, int] = {}

    for row in rows:
        counts[row[0]] = counts.get(row[0], 0) + 1

    result = [
        {
            "date": single_date,
            "count": counts.get(single_date, 0)
        }
        for single_date in (start_date + timedelta(days=i) for i in range(365))
    ]

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def predict_habit_probability(
    db: Session,
    user_id: int,
    habit_id: int
) -> float | None:
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == user_id
    ).first()

    if not habit:
        return None

    recent_days = date.today() - timedelta(days=30)
    completed_count = db.query(Entry).filter(
        Entry.habit_id == habit.id,
        Entry.entry_date >= recent_days
    ).count()

    probability = round(min(completed_count / 30, 1.0), 2)
    return probability