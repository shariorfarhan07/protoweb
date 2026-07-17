from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductCommentCreate(BaseModel):
    author_name: str
    author_email: Optional[str] = None
    content: str


class ProductCommentOut(BaseModel):
    """Public view — never exposes the author email or IP."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    author_name: str
    content: str
    is_approved: bool
    created_at: datetime


class ProductCommentAdminOut(ProductCommentOut):
    """Moderation view — adds the author email and the product it belongs to."""
    author_email: Optional[str] = None
    product_name: str
    product_slug: str
