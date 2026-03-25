from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.brand import Brand
    from app.models.category import Category
    from app.models.filament_variant import FilamentVariant
    from app.models.product_image import ProductImage
    from app.models.wishlist import WishlistItem


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_desc: Mapped[Optional[str]] = mapped_column(Text)
    long_desc: Mapped[Optional[str]] = mapped_column(Text)  # HTML content
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    sku: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    stock_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # 'printer' | 'filament' | 'cnc' | 'printed'
    product_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    specifications: Mapped[Optional[dict]] = mapped_column(JSON)
    meta_title: Mapped[Optional[str]] = mapped_column(String(255))
    meta_desc: Mapped[Optional[str]] = mapped_column(Text)
    weight_grams: Mapped[Optional[int]] = mapped_column(Integer)
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), index=True
    )
    brand_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("brands.id", ondelete="SET NULL"), index=True
    )

    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="products")
    brand: Mapped[Optional["Brand"]] = relationship("Brand", back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.sort_order",
    )
    filament_variants: Mapped[list["FilamentVariant"]] = relationship(
        "FilamentVariant",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    wishlist_items: Mapped[list["WishlistItem"]] = relationship(
        "WishlistItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )
