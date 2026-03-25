from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.product import ProductRepository
from app.schemas.comparison import CompareRequest, CompareResponse
from app.services.comparison import ComparisonService

router = APIRouter(prefix="/compare", tags=["comparison"])


@router.post("", response_model=CompareResponse)
async def compare_products(
    request: CompareRequest,
    db: AsyncSession = Depends(get_db),
) -> CompareResponse:
    service = ComparisonService(ProductRepository(db))
    return await service.compare(request)
