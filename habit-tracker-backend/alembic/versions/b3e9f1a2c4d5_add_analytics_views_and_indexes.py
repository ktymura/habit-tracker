"""add analytics views and performance indexes

Revision ID: b3e9f1a2c4d5
Revises: 997f8ba73dd1
Create Date: 2026-05-10 00:00:00.000000

Indeksy wydajnościowe:
- entries(habit_id, entry_date): pokryty przez uq_entries_habit_id_entry_date (unikalny)
- habits(user_id): ix_habits_user_id (z migracji bazowej)
- Dodajemy composite index na entries(habit_id, entry_date) dla zapytań streak (read-only, bez unique)

Widoki:
- daily_completion_rate: liczba wykonań nawyku per dzień
- weekly_completion_rate: tygodniowy completion_rate per nawyk
"""

from typing import Sequence, Union

from alembic import op


revision: str = "b3e9f1a2c4d5"
down_revision: Union[str, None] = "997f8ba73dd1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_entries_habit_date_perf",
        "entries",
        ["habit_id", "entry_date"],
    )

    op.execute("""
        CREATE VIEW daily_completion_rate AS
        SELECT
            h.user_id,
            h.id          AS habit_id,
            h.name        AS habit_name,
            e.entry_date,
            COUNT(e.id)   AS completions
        FROM habits h
        JOIN entries e ON h.id = e.habit_id
        GROUP BY h.user_id, h.id, h.name, e.entry_date
    """)

    op.execute("""
        CREATE VIEW weekly_completion_rate AS
        SELECT
            h.user_id,
            h.id                                        AS habit_id,
            h.name                                      AS habit_name,
            DATE_TRUNC('week', e.entry_date)::date      AS week_start,
            COUNT(e.id)                                 AS completions,
            ROUND(COUNT(e.id) * 100.0 / 7, 1)          AS completion_rate_pct
        FROM habits h
        JOIN entries e ON h.id = e.habit_id
        GROUP BY h.user_id, h.id, h.name, DATE_TRUNC('week', e.entry_date)
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS weekly_completion_rate")
    op.execute("DROP VIEW IF EXISTS daily_completion_rate")
    op.drop_index("ix_entries_habit_date_perf", table_name="entries")
