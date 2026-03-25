from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        q = select(User).where(User.email == email)
        return (await self.session.execute(q)).scalars().first()

    async def list_users(
        self,
        *,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[User], int]:
        q = select(User)
        if role:
            q = q.where(User.role == role)
        if is_active is not None:
            q = q.where(User.is_active == is_active)

        count_q = select(func.count()).select_from(q.subquery())
        total: int = (await self.session.execute(count_q)).scalar_one()

        q = q.order_by(User.created_at.desc()).offset(offset).limit(limit)
        result = (await self.session.execute(q)).scalars().all()
        return result, total

    async def count_total(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(User))
        return result.scalar_one()
