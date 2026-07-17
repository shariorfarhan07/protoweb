from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_permission
from app.schemas.product_comment import (
    ProductCommentAdminOut,
    ProductCommentCreate,
    ProductCommentOut,
)
from app.services.product_comment import ProductCommentService

router = APIRouter(tags=["product-comments"])


def _svc(db: AsyncSession = Depends(get_db)) -> ProductCommentService:
    return ProductCommentService(db)


def _client_ip(request: Request) -> Optional[str]:
    """Best-effort client IP — honor X-Forwarded-For (first hop) behind a proxy."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else None


# ── Public ──────────────────────────────────────────────────────────────────

@router.get("/products/{slug}/comments", response_model=list[ProductCommentOut])
async def list_product_comments(
    slug: str, svc: ProductCommentService = Depends(_svc)
) -> list[ProductCommentOut]:
    return [ProductCommentOut.model_validate(c) for c in await svc.list_for_product(slug)]


@router.post(
    "/products/{slug}/comments",
    response_model=ProductCommentOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_product_comment(
    slug: str,
    data: ProductCommentCreate,
    request: Request,
    svc: ProductCommentService = Depends(_svc),
) -> ProductCommentOut:
    comment = await svc.add_comment(slug, data, ip_address=_client_ip(request))
    return ProductCommentOut.model_validate(comment)


# ── Admin moderation ──────────────────────────────────────────────────────────

@router.get(
    "/admin/product-comments",
    response_model=list[ProductCommentAdminOut],
    dependencies=[require_permission("products.manage")],
)
async def list_admin_product_comments(
    approved: Optional[bool] = Query(None, description="Filter by approval state"),
    svc: ProductCommentService = Depends(_svc),
) -> list[ProductCommentAdminOut]:
    return [ProductCommentAdminOut.model_validate(c) for c in await svc.list_all(approved)]


@router.patch(
    "/admin/product-comments/{comment_id}/approve",
    response_model=ProductCommentOut,
    dependencies=[require_permission("products.manage")],
)
async def approve_product_comment(
    comment_id: int, svc: ProductCommentService = Depends(_svc)
) -> ProductCommentOut:
    return ProductCommentOut.model_validate(await svc.approve(comment_id))


@router.delete(
    "/admin/product-comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[require_permission("products.manage")],
)
async def delete_product_comment(
    comment_id: int, svc: ProductCommentService = Depends(_svc)
) -> None:
    await svc.delete(comment_id)
