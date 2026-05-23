from datetime import date, timedelta
from itertools import combinations

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

    habits = db.query(Habit).filter(
        Habit.user_id == user_id
    ).all()

    result = []

    for habit in habits:
        total_entries = db.query(Entry).filter(
            Entry.habit_id == habit.id
        ).count()

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
        db.query(Entry.entry_date)
        .join(Habit, Habit.id == Entry.habit_id)
        .filter(
            Habit.user_id == user_id,
            Entry.entry_date >= start_date
        )
        .all()
    )

    counts: dict[date, int] = {}

    for row in rows:
        entry_date = row[0]
        counts[entry_date] = counts.get(entry_date, 0) + 1

    result = [
        {
            "date": single_date,
            "count": counts.get(single_date, 0)
        }
        for single_date in (
            start_date + timedelta(days=day_number)
            for day_number in range(365)
        )
    ]

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def get_correlations(
    db: Session,
    user_id: int
) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:correlations"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    habits = db.query(Habit).filter(
        Habit.user_id == user_id
    ).all()

    result = []

    for habit_a, habit_b in combinations(habits, 2):
        dates_a = {
            row[0]
            for row in db.query(Entry.entry_date).filter(
                Entry.habit_id == habit_a.id
            ).all()
        }

        dates_b = {
            row[0]
            for row in db.query(Entry.entry_date).filter(
                Entry.habit_id == habit_b.id
            ).all()
        }

        union_dates = dates_a.union(dates_b)

        if not union_dates:
            correlation = 0.0
        else:
            both_done = len(dates_a.intersection(dates_b))
            correlation = round(both_done / len(union_dates), 2)

        result.append(
            {
                "habit_a_id": habit_a.id,
                "habit_a_name": habit_a.name,
                "habit_b_id": habit_b.id,
                "habit_b_name": habit_b.name,
                "correlation": correlation
            }
        )

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def predict_habit_probability(
    db: Session,
    user_id: int,
    habit_id: int
) -> float | None:
    cache_key = f"analytics:user:{user_id}:predict:{habit_id}"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

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

    analytics_cache.set(cache_key, probability, CACHE_TTL_SECONDS)
    return probability