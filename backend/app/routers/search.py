from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.product import ProductRepository
from app.schemas.product import ProductList
from app.services.search import SearchService

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[ProductList])
async def search_products(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> list[ProductList]:
    service = SearchService(ProductRepository(db))
    return await service.search(q, limit=limit)
