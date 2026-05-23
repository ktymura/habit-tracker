from datetime import date, timedelta
from itertools import combinations
import pandas as pd

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

    today = date.today()
    week_start = today - timedelta(days=6)
    month_start = today - timedelta(days=29)

    habits = db.query(Habit).filter(
        Habit.user_id == user_id
    ).all()

    result = []

    for habit in habits:
        total_entries = db.query(Entry).filter(
            Entry.habit_id == habit.id
        ).count()

        completion_rate = round(min(total_entries / 30, 1.0), 2)

        weekly_entries = db.query(Entry).filter(
            Entry.habit_id == habit.id,
            Entry.entry_date >= week_start,
        ).count()

        monthly_entries = db.query(Entry).filter(
            Entry.habit_id == habit.id,
            Entry.entry_date >= month_start,
        ).count()

        result.append(
            {
                "habit_id": habit.id,
                "habit_name": habit.name,
                "total_entries": total_entries,
                "weekly_completion_rate": round(min(weekly_entries / 7, 1.0), 2),
                "monthly_completion_rate": round(min(monthly_entries / 30, 1.0), 2),
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

    if len(habits) < 2:
        analytics_cache.set(cache_key, [], CACHE_TTL_SECONDS)
        return []

    today = date.today()
    start = today - timedelta(days=89)
    all_dates = [start + timedelta(days=i) for i in range(90)]

    matrix: dict[int, list[int]] = {}
    for habit in habits:
        done_dates = {
            row[0]
            for row in db.query(Entry.entry_date).filter(
                Entry.habit_id == habit.id,
                Entry.entry_date >= start,
            ).all()
        }
        matrix[habit.id] = [1 if d in done_dates else 0 for d in all_dates]
    
    corr_matrix = pd.DataFrame(matrix).corr(method="pearson")

    result = []

    for habit_a, habit_b in combinations(habits, 2):
        corr_value = corr_matrix.loc[habit_a.id, habit_b.id]

        result.append(
            {
                "habit_a_id": habit_a.id,
                "habit_a_name": habit_a.name,
                "habit_b_id": habit_b.id,
                "habit_b_name": habit_b.name,
                "correlation": round(float(corr_value) if pd.notna(corr_value) else 0.0, 2),
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