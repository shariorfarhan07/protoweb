import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product
    from app.models.filament_variant import FilamentVariant


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default=OrderStatus.pending, index=True
    )
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    shipping_address: Mapped[dict] = mapped_column(JSON, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False, default="cod")
    payment_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default=PaymentStatus.unpaid
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="SET NULL"), index=True
    )
    variant_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("filament_variants.id", ondelete="SET NULL")
    )
    # Snapshots at time of order
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_sku: Mapped[Optional[str]] = mapped_column(String(100))
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped[Optional["Product"]] = relationship("Product")
    variant: Mapped[Optional["FilamentVariant"]] = relationship("FilamentVariant")
