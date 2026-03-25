from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.filament_variant import FilamentVariant
from app.models.category import Category
from app.models.brand import Brand
from app.repositories.base import BaseRepository


class WishlistRepository(BaseRepository[WishlistItem]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(WishlistItem, session)

    async def get_by_user(self, user_id: int) -> Sequence[WishlistItem]:
        q = (
            select(WishlistItem)
            .where(WishlistItem.user_id == user_id)
            .options(
                selectinload(WishlistItem.product).options(
                    selectinload(Product.images),
                    selectinload(Product.filament_variants),
                    selectinload(Product.category),
                    selectinload(Product.brand),
                )
            )
            .order_by(WishlistItem.created_at.desc())
        )
        return (await self.session.execute(q)).scalars().all()

    async def get_item(self, user_id: int, product_id: int) -> Optional[WishlistItem]:
        q = select(WishlistItem).where(
            WishlistItem.user_id == user_id,
            WishlistItem.product_id == product_id,
        )
        return (await self.session.execute(q)).scalars().first()
