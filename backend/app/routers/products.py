from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.product import ProductRepository
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductDetail, ProductList
from app.services.product import ProductService

router = APIRouter(prefix="/products", tags=["products"])


def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))


@router.get("", response_model=PaginatedResponse[ProductList])
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    brand: Optional[str] = Query(None, description="Filter by brand slug"),
    product_type: Optional[str] = Query(
        None, description="Filter by type: printer, filament, cnc, printed"
    ),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    material: Optional[str] = Query(None, description="Filament material: PLA, ABS, PETG, etc."),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    service: ProductService = Depends(get_product_service),
) -> PaginatedResponse[ProductList]:
    return await service.list_products(
        category_slug=category,
        brand_slug=brand,
        product_type=product_type,
        min_price=min_price,
        max_price=max_price,
        material=material,
        is_featured=featured,
        page=page,
        page_size=page_size,
    )


@router.get("/featured", response_model=list[ProductList])
async def get_featured(
    limit: int = Query(8, ge=1, le=20),
    service: ProductService = Depends(get_product_service),
) -> list[ProductList]:
    return await service.get_featured_products(limit=limit)


@router.get("/{slug}", response_model=ProductDetail)
async def get_product(
    slug: str,
    service: ProductService = Depends(get_product_service),
) -> ProductDetail:
    return await service.get_product_by_slug(slug)
