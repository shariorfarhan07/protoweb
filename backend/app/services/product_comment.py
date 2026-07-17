from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.product import Product
from app.models.product_comment import ProductComment
from app.schemas.product_comment import ProductCommentCreate

logger = get_logger("app.services.product_comment")

# One comment per IP per this window.
RATE_LIMIT_WINDOW = timedelta(minutes=5)


class ProductCommentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _get_product_by_slug(self, slug: str) -> Product:
        product = (
            await self.db.execute(
                select(Product).where(Product.slug == slug, Product.is_active == True)
            )
        ).scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    async def list_for_product(self, slug: str) -> list[ProductComment]:
        product = await self._get_product_by_slug(slug)
        q = (
            select(ProductComment)
            .where(
                ProductComment.product_id == product.id,
                ProductComment.is_approved.is_(True),
            )
            .order_by(ProductComment.created_at.asc())
        )
        return list((await self.db.execute(q)).scalars().all())

    async def add_comment(
        self, slug: str, data: ProductCommentCreate, ip_address: Optional[str]
    ) -> ProductComment:
        product = await self._get_product_by_slug(slug)

        # Rate limit: reject if this IP commented within the window.
        if ip_address:
            cutoff = datetime.utcnow() - RATE_LIMIT_WINDOW
            recent = (
                await self.db.execute(
                    select(ProductComment.created_at)
                    .where(
                        ProductComment.ip_address == ip_address,
                        ProductComment.created_at >= cutoff,
                    )
                    .order_by(ProductComment.created_at.desc())
                    .limit(1)
                )
            ).scalars().first()
            if recent is not None:
                wait_s = int((RATE_LIMIT_WINDOW - (datetime.utcnow() - recent)).total_seconds())
                wait_s = max(1, wait_s)
                logger.info("Rate-limited product comment from ip=%s (%ds left)", ip_address, wait_s)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"You can post another comment in about {max(1, wait_s // 60 + (1 if wait_s % 60 else 0))} minute(s).",
                    headers={"Retry-After": str(wait_s)},
                )

        content = data.content.strip()
        if not content:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Comment cannot be empty")

        comment = ProductComment(
            product_id=product.id,
            author_name=(data.author_name.strip()[:120] or "Anonymous"),
            author_email=data.author_email,
            content=content,
            is_approved=False,  # held for moderation
            ip_address=ip_address,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        logger.info(
            "Product comment submitted: id=%d product_id=%d", comment.id, product.id,
            extra={"event": "product_comment_submitted", "comment_id": comment.id, "product_id": product.id},
        )
        return comment

    async def list_all(self, approved: Optional[bool] = None) -> list[dict]:
        """Admin moderation view — all comments with their product info."""
        q = select(ProductComment, Product.name, Product.slug).join(
            Product, ProductComment.product_id == Product.id
        )
        if approved is not None:
            q = q.where(ProductComment.is_approved.is_(approved))
        q = q.order_by(ProductComment.created_at.desc())
        rows = (await self.db.execute(q)).all()
        return [
            {
                "id": c.id,
                "product_id": c.product_id,
                "author_name": c.author_name,
                "author_email": c.author_email,
                "content": c.content,
                "is_approved": c.is_approved,
                "created_at": c.created_at,
                "product_name": name,
                "product_slug": slug,
            }
            for c, name, slug in rows
        ]

    async def approve(self, comment_id: int) -> ProductComment:
        c = await self.db.get(ProductComment, comment_id)
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        c.is_approved = True
        await self.db.commit()
        await self.db.refresh(c)
        logger.info("Product comment approved: id=%d", comment_id, extra={"event": "product_comment_approved", "comment_id": comment_id})
        return c

    async def delete(self, comment_id: int) -> None:
        c = await self.db.get(ProductComment, comment_id)
        if not c:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        await self.db.delete(c)
        await self.db.commit()
        logger.info("Product comment deleted: id=%d", comment_id, extra={"event": "product_comment_deleted", "comment_id": comment_id})
