from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.models.wishlist import WishlistItem
from app.repositories.product import ProductRepository
from app.repositories.wishlist import WishlistRepository
from app.schemas.wishlist import WishlistItemOut


class WishlistService:
    def __init__(self, wishlist_repo: WishlistRepository, product_repo: ProductRepository) -> None:
        self.wishlist_repo = wishlist_repo
        self.product_repo = product_repo

    async def get_wishlist(self, user_id: int) -> list[WishlistItemOut]:
        items = await self.wishlist_repo.get_by_user(user_id)
        return [WishlistItemOut.model_validate(i) for i in items]

    async def add_item(self, user_id: int, product_id: int) -> WishlistItemOut:
        product = await self.product_repo.get_by_id(product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        existing = await self.wishlist_repo.get_item(user_id, product_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product already in wishlist",
            )

        item = WishlistItem(user_id=user_id, product_id=product_id)
        try:
            item = await self.wishlist_repo.create(item)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product already in wishlist",
            )

        # Reload with product relationship
        item = await self.wishlist_repo.get_item(user_id, product_id)
        # Re-fetch with full product relations
        items = await self.wishlist_repo.get_by_user(user_id)
        full_item = next((i for i in items if i.product_id == product_id), item)
        return WishlistItemOut.model_validate(full_item)

    async def remove_item(self, user_id: int, product_id: int) -> dict:
        item = await self.wishlist_repo.get_item(user_id, product_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist")
        await self.wishlist_repo.delete(item)
        return {"message": "Removed from wishlist"}
