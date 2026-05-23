from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.schemas.auth import RefreshTokenRequest

from app.core.database import get_db
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import login_user, register_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(
    payload: UserRegisterRequest, db: Session = Depends(get_db)
) -> UserResponse:
    user = register_user(db, payload.email, payload.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    tokens = login_user(db, payload.email, payload.password)

    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest) -> TokenResponse:
    try:
        decoded_payload = decode_refresh_token(payload.refresh_token)
        user_id = decoded_payload.get("sub")
        token_type = decoded_payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
            )

        return TokenResponse(
            access_token=create_access_token(str(user_id)),
            refresh_token=create_refresh_token(str(user_id)),
            token_type="bearer",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
