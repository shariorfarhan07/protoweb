from typing import Optional

from fastapi import Depends, HTTPException, Request
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token


def _extract_token(request: Request) -> Optional[str]:
    """Try cookie first, then Authorization: Bearer header."""
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[len("Bearer "):]
    return token or None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import User

    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = await db.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[object]:
    from app.models.user import User

    token = _extract_token(request)
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = await db.get(User, int(user_id))
        if not user or not user.is_active:
            return None
        return user
    except JWTError:
        return None


def require_role(*roles: str):
    async def _check(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return Depends(_check)


require_admin = require_role("admin", "super_admin")
require_super_admin = require_role("super_admin")
require_inventory = require_role("admin", "super_admin", "inventory_manager")
