from sqlalchemy.orm import Session

from app.models.habit import Habit


def get_user_habits(
    db: Session,
    user_id: int
) -> list[Habit]:
    return db.query(Habit).filter(
        Habit.user_id == user_id
    ).order_by(Habit.id.desc()).all()


def create_habit(
    db: Session,
    user_id: int,
    name: str,
    color: str | None,
    icon: str | None,
    frequency: str
) -> Habit:
    habit = Habit(
        user_id=user_id,
        name=name,
        color=color,
        icon=icon,
        frequency=frequency
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def get_user_habit_or_none(
    db: Session,
    user_id: int,
    habit_id: int
) -> Habit | None:
    return db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == user_id
    ).first()


def update_habit(
    db: Session,
    habit: Habit,
    name: str | None,
    color: str | None,
    icon: str | None,
    frequency: str | None
) -> Habit:
    if name is not None:
        habit.name = name

    if color is not None:
        habit.color = color

    if icon is not None:
        habit.icon = icon

    if frequency is not None:
        habit.frequency = frequency

    db.commit()
    db.refresh(habit)

    return habit


def delete_habit(
    db: Session,
    habit: Habit
) -> None:
    db.delete(habit)
    db.commit()