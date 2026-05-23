from datetime import date, timedelta
from itertools import combinations
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sqlalchemy import case, func, text

from sqlalchemy.orm import Session

from app.core.cache import analytics_cache
from app.models.entry import Entry
from app.models.habit import Habit


CACHE_TTL_SECONDS = 300


def get_summary(db: Session, user_id: int) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:summary"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    today = date.today()
    week_start = today - timedelta(days=6)
    month_start = today - timedelta(days=29)

    rows = (
        db.query(
            Habit.id.label("habit_id"),
            Habit.name.label("habit_name"),
            func.count(Entry.id).label("total_entries"),
            func.count(case((Entry.entry_date >= week_start, Entry.id))).label(
                "weekly_entries"
            ),
            func.count(case((Entry.entry_date >= month_start, Entry.id))).label(
                "monthly_entries"
            ),
        )
        .outerjoin(Entry, Entry.habit_id == Habit.id)
        .filter(Habit.user_id == user_id)
        .group_by(Habit.id, Habit.name)
        .all()
    )

    result = [
        {
            "habit_id": row.habit_id,
            "habit_name": row.habit_name,
            "total_entries": row.total_entries,
            "weekly_completion_rate": round(min(row.weekly_entries / 7, 1.0), 2),
            "monthly_completion_rate": round(min(row.monthly_entries / 30, 1.0), 2),
        }
        for row in rows
    ]

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def get_heatmap(db: Session, user_id: int) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:heatmap"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    start_date = date.today() - timedelta(days=364)

    rows = db.execute(
        text("""
            SELECT date, count
            FROM user_heatmap_mv
            WHERE user_id = :user_id AND date >= :start_date
            ORDER BY date
        """),
        {"user_id": user_id, "start_date": start_date},
    ).fetchall()

    indexed = {row.date: row.count for row in rows}

    result = [
        {
            "date": start_date + timedelta(days=i),
            "count": indexed.get(start_date + timedelta(days=i), 0),
        }
        for i in range(365)
    ]

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def get_correlations(db: Session, user_id: int) -> list[dict]:
    cache_key = f"analytics:user:{user_id}:correlations"
    cached = analytics_cache.get(cache_key)

    if cached is not None:
        return cached

    habits = db.query(Habit).filter(Habit.user_id == user_id).all()

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
            for row in db.query(Entry.entry_date)
            .filter(
                Entry.habit_id == habit.id,
                Entry.entry_date >= start,
            )
            .all()
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
                "correlation": round(
                    float(corr_value) if pd.notna(corr_value) else 0.0, 2
                ),
            }
        )

    analytics_cache.set(cache_key, result, CACHE_TTL_SECONDS)
    return result


def predict_habit_probability(
    db: Session,
    user_id: int,
    habit_id: int,
) -> float | None:
    cache_key = f"analytics:user:{user_id}:predict:{habit_id}"
    cached = analytics_cache.get(cache_key)
    if cached is not None:
        return cached

    habit = (
        db.query(Habit)
        .filter(
            Habit.id == habit_id,
            Habit.user_id == user_id,
        )
        .first()
    )
    if not habit:
        return None

    today = date.today()
    train_start = today - timedelta(days=179)

    done_dates = {
        row[0]
        for row in db.query(Entry.entry_date)
        .filter(
            Entry.habit_id == habit.id,
            Entry.entry_date >= train_start,
        )
        .all()
    }

    training_days = [train_start + timedelta(days=i) for i in range(180)]

    X, y = [], []
    for d in training_days:
        history_30 = sum(
            1 for j in range(1, 31) if (d - timedelta(days=j)) in done_dates
        )
        streak = 0
        check = d - timedelta(days=1)
        while check in done_dates:
            streak += 1
            check -= timedelta(days=1)
        X.append([d.weekday(), streak, history_30])
        y.append(1 if d in done_dates else 0)

    # fallback gdy za mało danych do treningu obu klas
    if len(set(y)) < 2:
        completed_last_30 = sum(
            1 for j in range(1, 31) if (today - timedelta(days=j)) in done_dates
        )
        probability = round(min(completed_last_30 / 30, 1.0), 2)
        analytics_cache.set(cache_key, probability, CACHE_TTL_SECONDS)
        return probability

    model = LogisticRegression(max_iter=200)
    model.fit(X, y)

    history_30_today = sum(
        1 for j in range(1, 31) if (today - timedelta(days=j)) in done_dates
    )
    current_streak = 0
    check = today - timedelta(days=1)
    while check in done_dates:
        current_streak += 1
        check -= timedelta(days=1)

    probability = round(
        float(
            model.predict_proba([[today.weekday(), current_streak, history_30_today]])[
                0
            ][1]
        ),
        2,
    )
    analytics_cache.set(cache_key, probability, CACHE_TTL_SECONDS)
    return probability
