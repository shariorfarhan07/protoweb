from datetime import datetime

from pydantic import BaseModel

from app.schemas.product import ProductList


class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    product: ProductList

    model_config = {"from_attributes": True}
