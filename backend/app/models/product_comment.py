from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.product import Product


class ProductComment(Base, TimestampMixin):
    """A customer comment on a product page. Held for moderation until an admin
    approves it; the author's IP is recorded to enforce posting rate limits."""

    __tablename__ = "product_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_name: Mapped[str] = mapped_column(String(120), nullable=False)
    author_email: Mapped[Optional[str]] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    # Author IP — used only for rate limiting, never exposed publicly.
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), index=True)

    product: Mapped["Product"] = relationship("Product")
