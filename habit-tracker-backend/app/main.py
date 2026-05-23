from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import add_exception_handlers
from app.models.base import Base
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.entries import router as entries_router
from app.routers.habits import router as habits_router
from app.routers.health import router as health_router
from app.routers.notifications import router as notifications_router


app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

Base.metadata.create_all(bind=engine)
add_exception_handlers(app)

if settings.cors_allowed_origins_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(habits_router)
app.include_router(entries_router)
app.include_router(analytics_router)
app.include_router(notifications_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Hello world"}
