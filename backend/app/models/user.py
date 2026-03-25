import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.wishlist import WishlistItem


class UserRole(str, enum.Enum):
    customer = "customer"
    support = "support"
    inventory_manager = "inventory_manager"
    admin = "admin"
    super_admin = "super_admin"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    role: Mapped[str] = mapped_column(
        String(30), nullable=False, default=UserRole.customer, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")
    wishlist_items: Mapped[list["WishlistItem"]] = relationship(
        "WishlistItem", back_populates="user", cascade="all, delete-orphan"
    )
