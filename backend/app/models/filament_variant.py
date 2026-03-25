from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.product import Product


class FilamentVariant(Base):
    __tablename__ = "filament_variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    color_name: Mapped[Optional[str]] = mapped_column(String(100))
    color_hex: Mapped[Optional[str]] = mapped_column(String(7))  # e.g. "#FF0000"
    # PLA | ABS | PETG | TPU | ASA | SILK
    material: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    diameter_mm: Mapped[Optional[float]] = mapped_column(Numeric(3, 2), default=1.75)
    weight_grams: Mapped[Optional[int]] = mapped_column(Integer)
    price_delta: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    stock_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(512))  # color-specific image
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="filament_variants")
