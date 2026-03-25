from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.brand import BrandRepository
from app.schemas.brand import BrandSchema

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("", response_model=list[BrandSchema])
async def list_brands(db: AsyncSession = Depends(get_db)) -> list[BrandSchema]:
    repo = BrandRepository(db)
    brands = await repo.get_all_brands()
    return [BrandSchema.model_validate(b) for b in brands]


@router.get("/{slug}", response_model=BrandSchema)
async def get_brand(slug: str, db: AsyncSession = Depends(get_db)) -> BrandSchema:
    repo = BrandRepository(db)
    brand = await repo.get_by_slug(slug)
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Brand '{slug}' not found")
    return BrandSchema.model_validate(brand)
