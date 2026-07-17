from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_permission
from app.core.logging import get_logger
from app.schemas.blog import (
    BlogCategoryOut,
    BlogCommentAdminOut,
    BlogCommentCreate,
    BlogCommentOut,
    BlogPostCreate,
    BlogPostDetail,
    BlogPostList,
    BlogPostUpdate,
    BlogTagOut,
    CommunityProjectCreate,
    CommunityProjectOut,
    CommunityProjectUpdate,
    SyncResult,
    VideoTutorialCreate,
    VideoTutorialOut,
)
from app.schemas.common import PaginatedResponse
from app.services.blog import BlogService
from app.services.facebook_sync import sync_facebook_posts

logger = get_logger("app.routers.blog")

router = APIRouter(prefix="/blog", tags=["blog"])


def _svc(db: AsyncSession = Depends(get_db)) -> BlogService:
    return BlogService(db)


# ── Taxonomy ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[BlogCategoryOut])
async def list_categories(svc: BlogService = Depends(_svc)) -> list[BlogCategoryOut]:
    return [BlogCategoryOut.model_validate(c) for c in await svc.list_categories()]


@router.get("/tags", response_model=list[BlogTagOut])
async def list_tags(svc: BlogService = Depends(_svc)) -> list[BlogTagOut]:
    return [BlogTagOut.model_validate(t) for t in await svc.list_tags()]


# ── Video tutorials & community projects ───────────────────────────────────

@router.get("/videos", response_model=list[VideoTutorialOut])
async def list_videos(svc: BlogService = Depends(_svc)) -> list[VideoTutorialOut]:
    return [VideoTutorialOut.model_validate(v) for v in await svc.list_videos()]


@router.get("/projects", response_model=list[CommunityProjectOut])
async def list_projects(svc: BlogService = Depends(_svc)) -> list[CommunityProjectOut]:
    return [CommunityProjectOut.model_validate(p) for p in await svc.list_projects()]


# ── Posts ───────────────────────────────────────────────────────────────────

@router.get("/posts", response_model=PaginatedResponse[BlogPostList])
async def list_posts(
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    svc: BlogService = Depends(_svc),
):
    return await svc.list_posts(
        category=category, tag=tag, search=search, page=page, page_size=page_size
    )


@router.get("/posts/{slug}", response_model=BlogPostDetail)
async def get_post(slug: str, svc: BlogService = Depends(_svc)) -> BlogPostDetail:
    post = await svc.get_post(slug, bump_view=True)
    return BlogPostDetail.model_validate(await svc.post_to_detail_dict(post))


@router.get("/posts/{slug}/comments", response_model=list[BlogCommentOut])
async def list_comments(slug: str, svc: BlogService = Depends(_svc)) -> list[BlogCommentOut]:
    post = await svc.get_post(slug, bump_view=False)
    return [BlogCommentOut.model_validate(c) for c in await svc.list_comments(post.id)]


@router.post(
    "/posts/{slug}/comments",
    response_model=BlogCommentOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_comment(
    slug: str, data: BlogCommentCreate, svc: BlogService = Depends(_svc)
) -> BlogCommentOut:
    comment = await svc.add_comment(slug, data)
    return BlogCommentOut.model_validate(comment)


# ── Admin: posts ────────────────────────────────────────────────────────────

@router.post(
    "/posts", response_model=BlogPostDetail, status_code=status.HTTP_201_CREATED,
    dependencies=[require_permission("blog.manage")],
)
async def create_post(data: BlogPostCreate, svc: BlogService = Depends(_svc)) -> BlogPostDetail:
    post = await svc.create_post(data)
    return BlogPostDetail.model_validate(await svc.post_to_detail_dict(post))


@router.patch("/posts/{post_id}", response_model=BlogPostDetail, dependencies=[require_permission("blog.manage")])
async def update_post(
    post_id: int, data: BlogPostUpdate, svc: BlogService = Depends(_svc)
) -> BlogPostDetail:
    post = await svc.update_post(post_id, data)
    return BlogPostDetail.model_validate(await svc.post_to_detail_dict(post))


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[require_permission("blog.manage")])
async def delete_post(post_id: int, svc: BlogService = Depends(_svc)) -> None:
    await svc.delete_post(post_id)


# ── Admin: comments / videos / projects / sync ─────────────────────────────

@router.get("/admin/comments", response_model=list[BlogCommentAdminOut],
            dependencies=[require_permission("blog.manage")])
async def list_admin_comments(
    approved: Optional[bool] = Query(None, description="Filter by approval state"),
    svc: BlogService = Depends(_svc),
) -> list[BlogCommentAdminOut]:
    return [BlogCommentAdminOut.model_validate(c) for c in await svc.list_all_comments(approved)]


@router.patch("/comments/{comment_id}/approve", response_model=BlogCommentOut,
              dependencies=[require_permission("blog.manage")])
async def approve_comment(comment_id: int, svc: BlogService = Depends(_svc)) -> BlogCommentOut:
    return BlogCommentOut.model_validate(await svc.approve_comment(comment_id))


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[require_permission("blog.manage")])
async def delete_comment(comment_id: int, svc: BlogService = Depends(_svc)) -> None:
    await svc.delete_comment(comment_id)


@router.post("/videos", response_model=VideoTutorialOut, status_code=status.HTTP_201_CREATED,
             dependencies=[require_permission("blog.manage")])
async def create_video(data: VideoTutorialCreate, svc: BlogService = Depends(_svc)) -> VideoTutorialOut:
    return VideoTutorialOut.model_validate(await svc.create_video(data))


@router.get("/admin/projects", response_model=list[CommunityProjectOut],
            dependencies=[require_permission("blog.manage")])
async def list_admin_projects(svc: BlogService = Depends(_svc)) -> list[CommunityProjectOut]:
    return [CommunityProjectOut.model_validate(p) for p in await svc.list_all_projects()]


@router.post("/projects", response_model=CommunityProjectOut, status_code=status.HTTP_201_CREATED,
             dependencies=[require_permission("blog.manage")])
async def create_project(data: CommunityProjectCreate, svc: BlogService = Depends(_svc)) -> CommunityProjectOut:
    return CommunityProjectOut.model_validate(await svc.create_project(data))


@router.patch("/projects/{project_id}", response_model=CommunityProjectOut,
              dependencies=[require_permission("blog.manage")])
async def update_project(
    project_id: int, data: CommunityProjectUpdate, svc: BlogService = Depends(_svc)
) -> CommunityProjectOut:
    return CommunityProjectOut.model_validate(await svc.update_project(project_id, data))


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[require_permission("blog.manage")])
async def delete_project(project_id: int, svc: BlogService = Depends(_svc)) -> None:
    await svc.delete_project(project_id)


@router.post("/sync-facebook", response_model=SyncResult, dependencies=[require_permission("blog.manage")])
async def trigger_facebook_sync(db: AsyncSession = Depends(get_db)) -> SyncResult:
    return await sync_facebook_posts(db)
