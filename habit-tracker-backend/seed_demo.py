"""
seed_demo.py - Tworzy realistyczny dataset demonstracyjny: 1 konto, 6 nawyków, 6 miesięcy danych

Skrypt jest idempotentny - można go uruchamiać wielokrotnie.
Przy każdym uruchomieniu czyści i regeneruje dane konta demo.

Uruchomienie (z folderu habit-tracker-backend, z aktywnym .venv):
    python seed_demo.py
"""

import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.entry import Entry
from app.models.habit import Habit
from app.models.user import User

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "Demo!0912#"
DAYS = 183

# (name, color, icon, base_rate, weekday_boost, monthly_improvement)
# base_rate: bazowe prawdopodobieństwo wykonania danego dnia
# weekday_boost: dodatkowe prawdopodobieństwo w dni robocze (odejmowane w weekend)
# monthly_improvement: przyrost rate na miesiąc - symuluje poprawę nawyku w czasie
HABITS = [
    ("Medytacja", "#8B5CF6", "🧘", 0.78, 0.00, 0.03),
    ("Bieganie", "#10B981", "🏃", 0.52, 0.15, 0.06),
    ("Czytanie 30 min", "#3B82F6", "📖", 0.72, 0.05, 0.02),
    ("Woda 2L", "#06B6D4", "💧", 0.88, 0.00, 0.01),
    ("Trening siłowy", "#EF4444", "💪", 0.48, 0.20, 0.07),
    ("Witaminy", "#84CC16", "💊", 0.85, 0.00, 0.01),
]


def _rate(base: float, boost: float, improvement: float, months_ago: float, is_weekday: bool) -> float:
    """Oblicza prawdopodobieństwo wpisu dla danego dnia z uwzględnieniem trendów."""
    # Starsze daty mają niższy rate (symulacja poprawy nawyku w czasie)
    r = base + improvement * (3 - months_ago) / 3
    r += boost * (0.5 if is_weekday else -0.5)
    return max(0.05, min(0.98, r))


def seed_demo(db: Session) -> None:
    rng = random.Random(42)

    print("Szukam/tworzę konto demo...")
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if user:
        habit_ids = [row.id for row in db.query(Habit.id).filter(Habit.user_id == user.id).all()]
        if habit_ids:
            db.query(Entry).filter(Entry.habit_id.in_(habit_ids)).delete(synchronize_session=False)
            db.query(Habit).filter(Habit.user_id == user.id).delete(synchronize_session=False)
        db.flush()
        print(f"Wyczyszczono poprzednie dane demo (id={user.id})")
    else:
        user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
        db.add(user)
        db.flush()
        print(f"Utworzono nowe konto demo (id={user.id})")

    today = date.today()
    total_entries = 0

    print("Generuję nawyki i wpisy...")
    for name, color, icon, base_rate, weekday_boost, monthly_improvement in HABITS:
        habit = Habit(user_id=user.id, name=name, color=color, icon=icon, frequency="daily")
        db.add(habit)
        db.flush()

        for day_offset in range(DAYS):
            entry_date = today - timedelta(days=day_offset)
            months_ago = day_offset / 30.0
            is_weekday = entry_date.weekday() < 5

            prob = _rate(base_rate, weekday_boost, monthly_improvement, months_ago, is_weekday)
            if rng.random() < prob:
                db.add(Entry(habit_id=habit.id, entry_date=entry_date))
                total_entries += 1

        print(f"  Utworzono nawyk: {name}")

    db.commit()
    print("\nGotowe!")
    print(f"  Email:   {DEMO_EMAIL}")
    print(f"  Hasło:   {DEMO_PASSWORD}")
    print(f"  Nawyki:  {len(HABITS)}")
    print(f"  Wpisy:   {total_entries} (z {DAYS} dni)")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo(db)
    finally:
        db.close()
