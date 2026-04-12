from fastapi import APIRouter

from app.schemas.auth import UserLoginRequest, UserRegisterRequest


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: UserRegisterRequest) -> dict[str, str]:
    return {"message": f"Register endpoint ready for {payload.email}"}


@router.post("/login")
def login(payload: UserLoginRequest) -> dict[str, str]:
    return {"message": f"Login endpoint ready for {payload.email}"}
