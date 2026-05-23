"""
Seed script — tworzy dane testowe:
  - 3 użytkowników
  - 10 nawyków
  - 90 dni historii wpisów z losowym % wykonania

Uruchomienie (z folderu habit-tracker-backend, z aktywnym .venv):
    python seed.py
"""

import random
from datetime import date, timedelta

import bcrypt
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.habit import Habit
from app.models.entry import Entry
from app.models.user import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


USERS = [
    {"email": "anastazja@example.com", "password": "haslo1234"},
    {"email": "bartek@example.com", "password": "haslo1234"},
    {"email": "czarek@example.com", "password": "haslo1234"},
]

# (nazwa, kolor, ikona, częstotliwość, właściciel_index, % szans na wpis w danym dniu)
HABITS = [
    ("Medytacja", "#8B5CF6", "🧘", "daily", 0, 0.80),
    ("Bieganie", "#10B981", "🏃", "daily", 0, 0.55),
    ("Czytanie", "#3B82F6", "📖", "daily", 0, 0.70),
    ("Picie wody 2L", "#06B6D4", "💧", "daily", 1, 0.85),
    ("Bez cukru", "#F59E0B", "🚫", "daily", 1, 0.45),
    ("Dziennik", "#EC4899", "✏️", "daily", 1, 0.65),
    ("Trening siłowy", "#EF4444", "💪", "daily", 1, 0.50),
    ("Witaminy", "#84CC16", "💊", "daily", 2, 0.90),
    ("Stretching", "#F97316", "🤸", "daily", 2, 0.75),
    ("Sen 8h", "#6366F1", "😴", "daily", 2, 0.60),
]


def seed(db: Session) -> None:
    print("Czyszczenie danych dla zdefiniowanych użytkowników...")
    emails = [u["email"] for u in USERS]
    existing_users = db.query(User).filter(User.email.in_(emails)).all()
    for user in existing_users:
        habit_ids = [
            row.id for row in db.query(Habit.id).filter(Habit.user_id == user.id).all()
        ]
        if habit_ids:
            db.query(Entry).filter(Entry.habit_id.in_(habit_ids)).delete(
                synchronize_session=False
            )
            db.query(Habit).filter(Habit.user_id == user.id).delete(
                synchronize_session=False
            )
        db.delete(user)
    db.commit()

    print("Tworzenie użytkowników...")
    users = []
    for data in USERS:
        user = User(email=data["email"], password_hash=hash_password(data["password"]))
        db.add(user)
        users.append(user)
    db.flush()

    print("Tworzenie nawyków...")
    habits = []
    for name, color, icon, frequency, user_idx, _ in HABITS:
        habit = Habit(
            user_id=users[user_idx].id,
            name=name,
            color=color,
            icon=icon,
            frequency=frequency,
        )
        db.add(habit)
        habits.append(habit)
    db.flush()

    print("Generowanie 90 dni historii wpisów...")
    today = date.today()
    entry_count = 0

    for i, (habit, habit_data) in enumerate(zip(habits, HABITS)):
        completion_rate = habit_data[5]
        for day_offset in range(90):
            entry_date = today - timedelta(days=day_offset)
            if random.random() < completion_rate:
                db.add(Entry(habit_id=habit.id, entry_date=entry_date))
                entry_count += 1

    db.commit()
    print(
        f"Gotowe! Utworzono: {len(users)} użytkowników, {len(habits)} nawyków, {entry_count} wpisów."
    )


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
