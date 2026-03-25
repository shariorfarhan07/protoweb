from fastapi import HTTPException, Response, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic


class AuthService:
    def __init__(self, repo: UserRepository) -> None:
        self.repo = repo

    async def register(self, data: RegisterRequest) -> UserPublic:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
        )
        user = await self.repo.create(user)
        return UserPublic.model_validate(user)

    async def login(self, data: LoginRequest, response: Response) -> TokenResponse:
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )

        access_token = create_access_token(user.id, user.role)
        refresh_token = create_refresh_token(user.id)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=False,  # Set True in production (HTTPS)
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
        )

        return TokenResponse(
            access_token=access_token,
            user=UserPublic.model_validate(user),
        )

    @staticmethod
    def logout(response: Response) -> dict:
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return {"message": "Logged out"}
