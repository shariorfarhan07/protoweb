import math
import re
from typing import Optional

from fastapi import HTTPException, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.blog import (
    BlogCategory,
    BlogComment,
    BlogPost,
    BlogTag,
    CommunityProject,
    VideoTutorial,
)
from app.schemas.blog import (
    BlogCommentCreate,
    BlogPostCreate,
    BlogPostUpdate,
)
from app.schemas.common import PaginatedResponse

logger = get_logger("app.services.blog")

_WORDS_PER_MIN = 200


def reading_minutes(text: str) -> int:
    plain = re.sub(r"<[^>]+>", " ", text or "")
    words = len(plain.split())
    return max(1, math.ceil(words / _WORDS_PER_MIN))


class BlogService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── helpers ──────────────────────────────────────────────────────────────

    async def _unique_slug(self, model, title: str) -> str:
        base = slugify(title)[:230] or "post"
        slug = base
        i = 1
        while (
            await self.db.execute(select(model).where(model.slug == slug))
        ).scalars().first():
            slug = f"{base}-{i}"
            i += 1
        return slug

    async def _get_or_create_tags(self, names: list[str]) -> list[BlogTag]:
        tags: list[BlogTag] = []
        for raw in names:
            name = raw.strip()
            if not name:
                continue
            slug = slugify(name)
            tag = (
                await self.db.execute(select(BlogTag).where(BlogTag.slug == slug))
            ).scalars().first()
            if not tag:
                tag = BlogTag(name=name, slug=slug)
                self.db.add(tag)
                await self.db.flush()
            tags.append(tag)
        return tags

    async def _comment_counts(self, post_ids: list[int]) -> dict[int, int]:
        if not post_ids:
            return {}
        q = (
            select(BlogComment.post_id, func.count())
            .where(BlogComment.post_id.in_(post_ids), BlogComment.is_approved.is_(True))
            .group_by(BlogComment.post_id)
        )
        rows = (await self.db.execute(q)).all()
        return {pid: cnt for pid, cnt in rows}

    # ── Categories / tags ────────────────────────────────────────────────────

    async def list_categories(self) -> list[BlogCategory]:
        q = select(BlogCategory).order_by(BlogCategory.sort_order, BlogCategory.name)
        return list((await self.db.execute(q)).scalars().all())

    async def list_tags(self, limit: int = 50) -> list[BlogTag]:
        q = select(BlogTag).order_by(BlogTag.name).limit(limit)
        return list((await self.db.execute(q)).scalars().all())

    # ── Posts ────────────────────────────────────────────────────────────────

    async def list_posts(
        self,
        *,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        published_only: bool = True,
        page: int = 1,
        page_size: int = 9,
    ) -> PaginatedResponse:
        q = select(BlogPost)
        if published_only:
            q = q.where(BlogPost.is_published.is_(True))
        if category:
            q = q.join(BlogCategory).where(BlogCategory.slug == category)
        if tag:
            q = q.join(BlogPost.tags).where(BlogTag.slug == tag)
        if search:
            like = f"%{search.lower()}%"
            q = q.where(
                func.lower(BlogPost.title).like(like)
                | func.lower(func.coalesce(BlogPost.excerpt, "")).like(like)
                | func.lower(BlogPost.content).like(like)
            )

        count_q = select(func.count()).select_from(q.subquery())
        total = (await self.db.execute(count_q)).scalar_one()

        offset = (page - 1) * page_size
        q = (
            q.options(selectinload(BlogPost.category), selectinload(BlogPost.tags))
            .order_by(BlogPost.published_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        posts = (await self.db.execute(q)).scalars().unique().all()
        counts = await self._comment_counts([p.id for p in posts])

        items = []
        for p in posts:
            data = {
                "id": p.id, "slug": p.slug, "title": p.title, "excerpt": p.excerpt,
                "cover_image": p.cover_image, "author_name": p.author_name,
                "source": p.source, "source_url": p.source_url,
                "published_at": p.published_at, "updated_at": p.updated_at,
                "reading_minutes": p.reading_minutes,
                "view_count": p.view_count, "category": p.category, "tags": p.tags,
                "comment_count": counts.get(p.id, 0),
            }
            items.append(data)

        return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)

    async def get_post(self, slug: str, *, bump_view: bool = True) -> BlogPost:
        q = (
            select(BlogPost)
            .where(BlogPost.slug == slug)
            .options(selectinload(BlogPost.category), selectinload(BlogPost.tags))
        )
        post = (await self.db.execute(q)).scalars().first()
        if not post or not post.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        if bump_view:
            post.view_count += 1
            await self.db.commit()
            # Re-query eagerly after the commit so category/tags are loaded
            # within the async context (avoids a lazy load → MissingGreenlet).
            post = (await self.db.execute(q)).scalars().first()
        return post

    async def post_to_detail_dict(self, post: BlogPost) -> dict:
        counts = await self._comment_counts([post.id])
        return {
            "id": post.id, "slug": post.slug, "title": post.title, "excerpt": post.excerpt,
            "content": post.content, "cover_image": post.cover_image,
            "author_name": post.author_name, "source": post.source, "source_url": post.source_url,
            "published_at": post.published_at, "updated_at": post.updated_at,
            "reading_minutes": post.reading_minutes,
            "view_count": post.view_count, "category": post.category, "tags": post.tags,
            "comment_count": counts.get(post.id, 0),
        }

    async def create_post(self, data: BlogPostCreate) -> BlogPost:
        slug = await self._unique_slug(BlogPost, data.title)
        tags = await self._get_or_create_tags(data.tags)
        post = BlogPost(
            slug=slug,
            title=data.title,
            excerpt=data.excerpt,
            content=data.content,
            cover_image=data.cover_image,
            author_name=data.author_name,
            category_id=data.category_id,
            is_published=data.is_published,
            reading_minutes=reading_minutes(data.content),
            source="manual",
            tags=tags,
        )
        self.db.add(post)
        await self.db.commit()
        return await self.get_post(post.slug, bump_view=False)

    async def update_post(self, post_id: int, data: BlogPostUpdate) -> BlogPost:
        post = (
            await self.db.execute(
                select(BlogPost).where(BlogPost.id == post_id).options(selectinload(BlogPost.tags))
            )
        ).scalars().first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        payload = data.model_dump(exclude_unset=True)
        if "tags" in payload:
            post.tags = await self._get_or_create_tags(payload.pop("tags") or [])
        for field, value in payload.items():
            setattr(post, field, value)
        if "content" in payload:
            post.reading_minutes = reading_minutes(post.content)
        await self.db.commit()
        return await self.get_post(post.slug, bump_view=False)

    async def delete_post(self, post_id: int) -> None:
        post = await self.db.get(BlogPost, post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        await self.db.delete(post)
        await self.db.commit()

    # ── Comments ─────────────────────────────────────────────────────────────

    async def list_comments(self, post_id: int) -> list[BlogComment]:
        q = (
            select(BlogComment)
            .where(BlogComment.post_id == post_id, BlogComment.is_approved.is_(True))
            .order_by(BlogComment.created_at.asc())
        )
        return list((await self.db.execute(q)).scalars().all())

    async def add_comment(self, slug: str, data: BlogCommentCreate) -> BlogComment:
        post = await self.get_post(slug, bump_view=False)
        comment = BlogComment(
            post_id=post.id,
            parent_id=data.parent_id,
            author_name=data.author_name.strip()[:120] or "Anonymous",
            author_email=data.author_email,
            content=data.content.strip(),
            is_approved=False,  # held for moderation until an admin approves
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def list_all_comments(self, approved: Optional[bool] = None) -> list[dict]:
        """Admin: all comments (optionally filtered by approval) with their post info."""
        q = select(BlogComment, BlogPost.title, BlogPost.slug).join(
            BlogPost, BlogComment.post_id == BlogPost.id
        )
        if approved is not None:
            q = q.where(BlogComment.is_approved.is_(approved))
        q = q.order_by(BlogComment.created_at.desc())
        rows = (await self.db.execute(q)).all()
        return [
            {
                "id": c.id, "post_id": c.post_id, "parent_id": c.parent_id,
                "author_name": c.author_name, "author_email": c.author_email,
                "content": c.content, "is_approved": c.is_approved,
                "created_at": c.created_at, "post_title": title, "post_slug": slug,
            }
            for c, title, slug in rows
        ]

    async def approve_comment(self, comment_id: int) -> BlogComment:
        c = await self.db.get(BlogComment, comment_id)
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        c.is_approved = True
        await self.db.commit()
        await self.db.refresh(c)
        logger.info("Comment approved: id=%d", comment_id, extra={"event": "comment_approved", "comment_id": comment_id})
        return c

    async def delete_comment(self, comment_id: int) -> None:
        c = await self.db.get(BlogComment, comment_id)
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        await self.db.delete(c)
        await self.db.commit()

    # ── Video tutorials ──────────────────────────────────────────────────────

    async def list_videos(self) -> list[VideoTutorial]:
        q = (
            select(VideoTutorial)
            .where(VideoTutorial.is_active.is_(True))
            .order_by(VideoTutorial.sort_order, VideoTutorial.created_at.desc())
        )
        return list((await self.db.execute(q)).scalars().all())

    async def create_video(self, data) -> VideoTutorial:
        from app.schemas.blog import VideoTutorialCreate  # local to avoid cycle

        assert isinstance(data, VideoTutorialCreate)
        slug = await self._unique_slug(VideoTutorial, data.title)
        video = VideoTutorial(slug=slug, **data.model_dump())
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        return video

    # ── Community projects ───────────────────────────────────────────────────

    async def list_projects(self) -> list[CommunityProject]:
        q = (
            select(CommunityProject)
            .where(CommunityProject.is_approved.is_(True))
            .order_by(
                CommunityProject.is_featured.desc(),
                CommunityProject.sort_order,
                CommunityProject.created_at.desc(),
            )
        )
        return list((await self.db.execute(q)).scalars().all())

    async def list_all_projects(self) -> list[CommunityProject]:
        """Admin: every project regardless of approval."""
        q = select(CommunityProject).order_by(
            CommunityProject.sort_order,
            CommunityProject.created_at.desc(),
        )
        return list((await self.db.execute(q)).scalars().all())

    async def create_project(self, data) -> CommunityProject:
        from app.schemas.blog import CommunityProjectCreate

        assert isinstance(data, CommunityProjectCreate)
        slug = await self._unique_slug(CommunityProject, data.title)
        project = CommunityProject(slug=slug, **data.model_dump())
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def update_project(self, project_id: int, data) -> CommunityProject:
        from app.schemas.blog import CommunityProjectUpdate

        assert isinstance(data, CommunityProjectUpdate)
        project = await self.db.get(CommunityProject, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete_project(self, project_id: int) -> None:
        project = await self.db.get(CommunityProject, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        await self.db.delete(project)
        await self.db.commit()
