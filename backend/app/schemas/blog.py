from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Category & Tag ──────────────────────────────────────────────────────────

class BlogCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = None
    sort_order: int = 0


class BlogCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    sort_order: int = 0


class BlogTagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


# ── Comments ────────────────────────────────────────────────────────────────

class BlogCommentCreate(BaseModel):
    author_name: str
    author_email: Optional[str] = None
    content: str
    parent_id: Optional[int] = None


class BlogCommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    post_id: int
    parent_id: Optional[int] = None
    author_name: str
    content: str
    is_approved: bool
    created_at: datetime


class BlogCommentAdminOut(BlogCommentOut):
    """Moderation view — adds the author email and which post it belongs to."""
    author_email: Optional[str] = None
    post_title: str
    post_slug: str


# ── Posts ───────────────────────────────────────────────────────────────────

class BlogPostList(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    author_name: str
    source: str
    source_url: Optional[str] = None
    published_at: datetime
    updated_at: datetime
    reading_minutes: int
    view_count: int
    category: Optional[BlogCategoryOut] = None
    tags: list[BlogTagOut] = []
    comment_count: int = 0


class BlogPostDetail(BlogPostList):
    content: str


class BlogPostCreate(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str = ""
    cover_image: Optional[str] = None
    author_name: str = "PrototypeBD"
    category_id: Optional[int] = None
    tags: list[str] = []
    is_published: bool = True


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    author_name: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[list[str]] = None
    is_published: Optional[bool] = None


# ── Video tutorials ─────────────────────────────────────────────────────────

class VideoTutorialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    category: Optional[str] = None
    sort_order: int = 0
    created_at: datetime


class VideoTutorialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    category: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


# ── Community projects ──────────────────────────────────────────────────────

class CommunityProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    author_name: str
    project_url: Optional[str] = None
    is_featured: bool = False
    is_approved: bool = True
    sort_order: int = 0
    created_at: datetime


class CommunityProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    author_name: str = "Community"
    project_url: Optional[str] = None
    is_featured: bool = False
    is_approved: bool = True
    sort_order: int = 0


class CommunityProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    author_name: Optional[str] = None
    project_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_approved: Optional[bool] = None
    sort_order: Optional[int] = None


# ── Facebook sync ───────────────────────────────────────────────────────────

class SyncResult(BaseModel):
    ok: bool
    synced: int = 0
    skipped: int = 0
    message: str
