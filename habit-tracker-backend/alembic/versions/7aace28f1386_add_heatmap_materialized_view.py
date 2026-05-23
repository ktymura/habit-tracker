"""add heatmap materialized view

Revision ID: 7aace28f1386
Revises: b3e9f1a2c4d5
Create Date: 2026-05-23 12:33:26.397175

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "7aace28f1386"
down_revision: Union[str, None] = "b3e9f1a2c4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE MATERIALIZED VIEW user_heatmap_mv AS
        SELECT
            h.user_id,
            e.entry_date AS date,
            COUNT(e.id)  AS count
        FROM habits h
        JOIN entries e ON e.habit_id = h.id
        GROUP BY h.user_id, e.entry_date
        ORDER BY h.user_id, e.entry_date
        WITH DATA
    """)
    op.execute("""
        CREATE UNIQUE INDEX ix_user_heatmap_mv_user_date
        ON user_heatmap_mv (user_id, date)
    """)


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS user_heatmap_mv")
