from typing import Optional, Sequence

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.brand import Brand
from app.models.category import Category
from app.models.filament_variant import FilamentVariant
from app.models.product import Product
from app.repositories.base import BaseRepository


def _product_options():
    """Eager-load all relationships to prevent N+1 queries."""
    return [
        selectinload(Product.images),
        selectinload(Product.filament_variants),
        selectinload(Product.category),
        selectinload(Product.brand),
    ]


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Product, session)

    async def get_by_slug(self, slug: str) -> Optional[Product]:
        q = (
            select(Product)
            .where(Product.slug == slug, Product.is_active == True)
            .options(*_product_options())
        )
        return (await self.session.execute(q)).scalars().first()

    async def list_filtered(
        self,
        *,
        category_slug: Optional[str] = None,
        brand_slug: Optional[str] = None,
        product_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        material: Optional[str] = None,
        is_featured: Optional[bool] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Product], int]:
        q = select(Product).where(Product.is_active == True)

        if category_slug:
            q = q.join(Category, Product.category_id == Category.id).where(
                Category.slug == category_slug
            )
        if brand_slug:
            q = q.join(Brand, Product.brand_id == Brand.id).where(
                Brand.slug == brand_slug
            )
        if product_type:
            q = q.where(Product.product_type == product_type)
        if min_price is not None:
            q = q.where(Product.price >= min_price)
        if max_price is not None:
            q = q.where(Product.price <= max_price)
        if material:
            q = q.join(
                FilamentVariant, Product.id == FilamentVariant.product_id
            ).where(FilamentVariant.material == material, FilamentVariant.is_active == True)
        if is_featured is not None:
            q = q.where(Product.is_featured == is_featured)

        count_q = select(func.count()).select_from(q.subquery())
        total: int = (await self.session.execute(count_q)).scalar_one()

        q = q.options(*_product_options()).offset(offset).limit(limit).order_by(
            Product.is_featured.desc(), Product.created_at.desc()
        )
        result = (await self.session.execute(q)).scalars().unique().all()
        return result, total

    async def get_by_ids(self, ids: list[int]) -> list[Product]:
        if not ids:
            return []
        q = (
            select(Product)
            .where(Product.id.in_(ids), Product.is_active == True)
            .options(*_product_options())
        )
        return list((await self.session.execute(q)).scalars().unique().all())

    async def full_text_search(self, query: str, limit: int = 20) -> list[Product]:
        q = (
            select(Product)
            .where(
                Product.is_active == True,
                or_(
                    Product.name.ilike(f"%{query}%"),
                    Product.short_desc.ilike(f"%{query}%"),
                    Product.sku.ilike(f"%{query}%"),
                ),
            )
            .options(*_product_options())
            .limit(limit)
            .order_by(Product.is_featured.desc())
        )
        return list((await self.session.execute(q)).scalars().unique().all())

    async def list_admin(
        self,
        *,
        search: Optional[str] = None,
        product_type: Optional[str] = None,
        category_slug: Optional[str] = None,
        is_active: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        low_stock: Optional[bool] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Product], int]:
        q = select(Product)

        if search:
            term = f"%{search.strip()}%"
            q = q.where(
                or_(
                    Product.name.ilike(term),
                    Product.sku.ilike(term),
                )
            )
        if product_type:
            q = q.where(Product.product_type == product_type)
        if category_slug:
            q = q.join(Category, Product.category_id == Category.id).where(
                Category.slug == category_slug
            )
        if is_active is not None:
            q = q.where(Product.is_active == is_active)
        if is_featured is not None:
            q = q.where(Product.is_featured == is_featured)
        if low_stock:
            q = q.where(Product.stock_qty <= 5)

        count_q = select(func.count()).select_from(q.subquery())
        total: int = (await self.session.execute(count_q)).scalar_one()

        q = (
            q.options(*_product_options())
            .offset(offset)
            .limit(limit)
            .order_by(Product.created_at.desc())
        )
        result = (await self.session.execute(q)).scalars().unique().all()
        return result, total

    async def get_featured(self, limit: int = 8) -> list[Product]:
        q = (
            select(Product)
            .where(Product.is_active == True, Product.is_featured == True)
            .options(*_product_options())
            .limit(limit)
        )
        return list((await self.session.execute(q)).scalars().unique().all())
