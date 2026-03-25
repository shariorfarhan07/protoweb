from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register", response_model=UserPublic, status_code=201)
async def register(
    data: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    return await service.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await service.login(data, response)


@router.post("/logout")
async def logout(response: Response) -> dict:
    return AuthService.logout(response)


@router.get("/me", response_model=UserPublic)
async def me(current_user=Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)
