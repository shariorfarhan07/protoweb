from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand import Brand
from app.repositories.base import BaseRepository


class BrandRepository(BaseRepository[Brand]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Brand, session)

    async def get_by_slug(self, slug: str) -> Optional[Brand]:
        q = select(Brand).where(Brand.slug == slug)
        return (await self.session.execute(q)).scalars().first()

    async def get_all_brands(self) -> Sequence[Brand]:
        q = select(Brand).order_by(Brand.name)
        return (await self.session.execute(q)).scalars().all()

    async def create_brand(self, **kwargs) -> Brand:
        brand = Brand(**kwargs)
        self.session.add(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def update_brand(self, brand: Brand, **kwargs) -> Brand:
        for key, val in kwargs.items():
            setattr(brand, key, val)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand

    async def delete_brand(self, brand: Brand) -> None:
        await self.session.delete(brand)
        await self.session.commit()
