from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Category, session)

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        q = select(Category).where(Category.slug == slug)
        return (await self.session.execute(q)).scalars().first()

    async def get_all_categories(self) -> Sequence[Category]:
        q = select(Category).order_by(Category.name)
        return (await self.session.execute(q)).scalars().all()

    async def create_category(self, **kwargs) -> Category:
        cat = Category(**kwargs)
        self.session.add(cat)
        await self.session.commit()
        await self.session.refresh(cat)
        return cat

    async def update_category(self, cat: Category, **kwargs) -> Category:
        for key, val in kwargs.items():
            setattr(cat, key, val)
        await self.session.commit()
        await self.session.refresh(cat)
        return cat

    async def delete_category(self, cat: Category) -> None:
        await self.session.delete(cat)
        await self.session.commit()
