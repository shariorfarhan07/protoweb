from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.product_type import ProductTypeRepository
from app.schemas.product_type import ProductTypeSchema

router = APIRouter(prefix="/product-types", tags=["product-types"])


@router.get("", response_model=list[ProductTypeSchema])
async def list_product_types(db: AsyncSession = Depends(get_db)) -> list[ProductTypeSchema]:
    repo = ProductTypeRepository(db)
    pts = await repo.get_all()
    return [ProductTypeSchema.model_validate(pt) for pt in pts if pt.is_active]
