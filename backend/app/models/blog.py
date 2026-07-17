from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

# ── Post ↔ Tag association ──────────────────────────────────────────────────
blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True),
)


class BlogCategory(Base):
    """Tutorials, News, Projects, Tips, …"""

    __tablename__ = "blog_categories"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    color: Mapped[Optional[str]] = mapped_column(String(20))  # accent for the UI
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    posts: Mapped[list["BlogPost"]] = relationship("BlogPost", back_populates="category")


class BlogTag(Base):
    __tablename__ = "blog_tags"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    slug: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)

    posts: Mapped[list["BlogPost"]] = relationship(
        "BlogPost", secondary=blog_post_tags, back_populates="tags"
    )


class BlogPost(Base, TimestampMixin):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    excerpt: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cover_image: Mapped[Optional[str]] = mapped_column(String(512))
    author_name: Mapped[str] = mapped_column(String(120), nullable=False, default="PrototypeBD")

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("blog_categories.id", ondelete="SET NULL"), index=True
    )

    # Provenance — "manual" or "facebook"
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="manual")
    fb_post_id: Mapped[Optional[str]] = mapped_column(String(80), unique=True, index=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512))

    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reading_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    category: Mapped[Optional["BlogCategory"]] = relationship("BlogCategory", back_populates="posts")
    tags: Mapped[list["BlogTag"]] = relationship(
        "BlogTag", secondary=blog_post_tags, back_populates="posts"
    )
    comments: Mapped[list["BlogComment"]] = relationship(
        "BlogComment", back_populates="post", cascade="all, delete-orphan"
    )


class BlogComment(Base, TimestampMixin):
    __tablename__ = "blog_comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("blog_comments.id", ondelete="CASCADE"), index=True
    )
    author_name: Mapped[str] = mapped_column(String(120), nullable=False)
    author_email: Mapped[Optional[str]] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    post: Mapped["BlogPost"] = relationship("BlogPost", back_populates="comments")


class VideoTutorial(Base, TimestampMixin):
    __tablename__ = "video_tutorials"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    video_url: Mapped[str] = mapped_column(String(512), nullable=False)  # YouTube / FB / mp4
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(512))
    duration: Mapped[Optional[str]] = mapped_column(String(20))  # "12:34"
    category: Mapped[Optional[str]] = mapped_column(String(80))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)


class CommunityProject(Base, TimestampMixin):
    __tablename__ = "community_projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(512))
    author_name: Mapped[str] = mapped_column(String(120), nullable=False, default="Community")
    project_url: Mapped[Optional[str]] = mapped_column(String(512))
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
