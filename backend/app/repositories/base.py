from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get_by_id(self, id: int) -> Optional[T]:
        return await self.session.get(self.model, id)

    async def get_all(self, offset: int = 0, limit: int = 20) -> tuple[Sequence[T], int]:
        count_q = select(func.count()).select_from(self.model)
        total: int = (await self.session.execute(count_q)).scalar_one()
        q = select(self.model).offset(offset).limit(limit)
        result = (await self.session.execute(q)).scalars().all()
        return result, total

    async def create(self, obj: T) -> T:
        self.session.add(obj)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: T) -> T:
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: T) -> None:
        await self.session.delete(obj)
        await self.session.commit()
