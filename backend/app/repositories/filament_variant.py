from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.filament_variant import FilamentVariant


class FilamentVariantRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def list_by_product(self, product_id: int) -> list[FilamentVariant]:
        result = await self._db.execute(
            select(FilamentVariant)
            .where(FilamentVariant.product_id == product_id)
            .order_by(FilamentVariant.id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, variant_id: int) -> FilamentVariant | None:
        result = await self._db.execute(
            select(FilamentVariant).where(FilamentVariant.id == variant_id)
        )
        return result.scalar_one_or_none()

    async def create(self, product_id: int, **kwargs) -> FilamentVariant:
        variant = FilamentVariant(product_id=product_id, **kwargs)
        self._db.add(variant)
        await self._db.commit()
        await self._db.refresh(variant)
        return variant

    async def update(self, variant: FilamentVariant, **kwargs) -> FilamentVariant:
        for k, v in kwargs.items():
            setattr(variant, k, v)
        await self._db.commit()
        await self._db.refresh(variant)
        return variant

    async def delete(self, variant: FilamentVariant) -> None:
        await self._db.delete(variant)
        await self._db.commit()
