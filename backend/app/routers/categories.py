from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.category import CategoryRepository
from app.schemas.category import CategorySchema

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategorySchema]:
    repo = CategoryRepository(db)
    categories = await repo.get_all_categories()
    return [CategorySchema.model_validate(c) for c in categories]


@router.get("/{slug}", response_model=CategorySchema)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)) -> CategorySchema:
    repo = CategoryRepository(db)
    category = await repo.get_by_slug(slug)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category '{slug}' not found")
    return CategorySchema.model_validate(category)
