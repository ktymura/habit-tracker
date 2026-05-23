import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import get_db
from app.main import app
from app.models.base import Base


engine = create_engine(settings.DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


HEATMAP_MV_SQL = """
    CREATE MATERIALIZED VIEW IF NOT EXISTS user_heatmap_mv AS
    SELECT
        h.user_id,
        e.entry_date AS date,
        COUNT(e.id)  AS count
    FROM habits h
    JOIN entries e ON e.habit_id = h.id
    GROUP BY h.user_id, e.entry_date
    ORDER BY h.user_id, e.entry_date
    WITH DATA
"""

HEATMAP_MV_INDEX_SQL = """
    CREATE UNIQUE INDEX IF NOT EXISTS ix_user_heatmap_mv_user_date
    ON user_heatmap_mv (user_id, date)
"""


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text(HEATMAP_MV_SQL))
        conn.execute(text(HEATMAP_MV_INDEX_SQL))
        conn.commit()
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        with engine.connect() as conn:
            conn.execute(
                text("DROP MATERIALIZED VIEW IF EXISTS user_heatmap_mv CASCADE")
            )
            conn.execute(
                text(
                    "DROP VIEW IF EXISTS daily_completion_rate, weekly_completion_rate CASCADE"
                )
            )
            conn.commit()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
