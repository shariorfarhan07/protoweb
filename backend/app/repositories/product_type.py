from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product_type import ProductType
from app.repositories.base import BaseRepository


class ProductTypeRepository(BaseRepository[ProductType]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ProductType, session)

    async def get_by_value(self, value: str) -> Optional[ProductType]:
        q = select(ProductType).where(ProductType.value == value)
        return (await self.session.execute(q)).scalars().first()

    async def get_all(self) -> Sequence[ProductType]:
        q = select(ProductType).order_by(ProductType.label)
        return (await self.session.execute(q)).scalars().all()

    async def create_product_type(self, **kwargs) -> ProductType:
        pt = ProductType(**kwargs)
        self.session.add(pt)
        await self.session.commit()
        await self.session.refresh(pt)
        return pt

    async def update_product_type(self, pt: ProductType, **kwargs) -> ProductType:
        for key, val in kwargs.items():
            setattr(pt, key, val)
        await self.session.commit()
        await self.session.refresh(pt)
        return pt

    async def delete_product_type(self, pt: ProductType) -> None:
        await self.session.delete(pt)
        await self.session.commit()
