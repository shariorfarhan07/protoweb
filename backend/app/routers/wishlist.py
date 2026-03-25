from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.repositories.product import ProductRepository
from app.repositories.wishlist import WishlistRepository
from app.schemas.wishlist import WishlistItemOut
from app.services.wishlist import WishlistService

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


def get_wishlist_service(db: AsyncSession = Depends(get_db)) -> WishlistService:
    return WishlistService(WishlistRepository(db), ProductRepository(db))


@router.get("", response_model=list[WishlistItemOut])
async def get_wishlist(
    service: WishlistService = Depends(get_wishlist_service),
    current_user=Depends(get_current_user),
) -> list[WishlistItemOut]:
    return await service.get_wishlist(current_user.id)


@router.post("/{product_id}", response_model=WishlistItemOut, status_code=201)
async def add_to_wishlist(
    product_id: int,
    service: WishlistService = Depends(get_wishlist_service),
    current_user=Depends(get_current_user),
) -> WishlistItemOut:
    return await service.add_item(current_user.id, product_id)


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    service: WishlistService = Depends(get_wishlist_service),
    current_user=Depends(get_current_user),
) -> dict:
    return await service.remove_item(current_user.id, product_id)
