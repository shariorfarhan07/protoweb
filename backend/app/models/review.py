from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    reviewer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    reviewer_title: Mapped[Optional[str]] = mapped_column(String(160))   # e.g. "3D Printing Enthusiast"
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512))
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=5)  # 1–5
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Customer-submitted reviews start unapproved; admin-created ones default approved.
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="admin")  # admin | customer
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class ReviewRequest(Base):
    """A one-time, shareable link an admin sends to a customer to collect a review."""

    __tablename__ = "review_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(120))
    customer_email: Mapped[Optional[str]] = mapped_column(String(255))
    note: Mapped[Optional[str]] = mapped_column(String(255))   # internal note, e.g. order #
    is_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    review_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("reviews.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
