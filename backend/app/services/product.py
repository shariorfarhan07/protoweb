from typing import Optional

from fastapi import HTTPException, status

from app.repositories.product import ProductRepository
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductDetail, ProductList


class ProductService:
    def __init__(self, repo: ProductRepository) -> None:
        self.repo = repo

    async def list_products(
        self,
        *,
        category_slug: Optional[str] = None,
        brand_slug: Optional[str] = None,
        product_type: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        material: Optional[str] = None,
        is_featured: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[ProductList]:
        offset = (page - 1) * page_size
        products, total = await self.repo.list_filtered(
            category_slug=category_slug,
            brand_slug=brand_slug,
            product_type=product_type,
            min_price=min_price,
            max_price=max_price,
            material=material,
            is_featured=is_featured,
            offset=offset,
            limit=page_size,
        )
        items = [ProductList.model_validate(p) for p in products]
        return PaginatedResponse[ProductList](
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_product_by_slug(self, slug: str) -> ProductDetail:
        product = await self.repo.get_by_slug(slug)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{slug}' not found",
            )
        return ProductDetail.model_validate(product)

    async def get_featured_products(self, limit: int = 8) -> list[ProductList]:
        products = await self.repo.get_featured(limit=limit)
        return [ProductList.model_validate(p) for p in products]
