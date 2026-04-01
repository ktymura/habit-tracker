from fastapi import APIRouter

from app.core.database import test_db_connection


router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/db")
def database_healthcheck() -> dict[str, str]:
    test_db_connection()
    return {"status": "ok", "database": "connected"}